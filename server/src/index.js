import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT || 3000);
const token = process.env.TG_KEY || process.env.BOT_TOKEN || '';
const ownerId = process.env.OWNER_ID || process.env.OWNER_CHAT_ID || '';
const miniAppUrl = process.env.MINI_APP_URL || '';

const defaultAllowedOrigins = [
  'http://127.0.0.1:4173',
  'http://localhost:4173',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
];

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      const allowed = [...defaultAllowedOrigins, ...allowedOrigins];
      return allowed.includes(origin) ? callback(null, true) : callback(null, false);
    },
  })
);
app.use(express.json({ limit: '1mb' }));

const leads = new Map();
const stats = {
  total: 0,
  new: 0,
  inProgress: 0,
  transferred: 0,
};

const telegramApi = (method) => `https://api.telegram.org/bot${token}/${method}`;

function normalizeText(value, fallback = 'Не указано') {
  const text = String(value ?? '').trim();
  return text || fallback;
}

function normalizePhone(phone) {
  const raw = String(phone || '').trim();
  const digits = raw.replace(/\D/g, '');

  if (!digits) return '';
  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`;
  if (digits.length === 11 && digits.startsWith('7')) return `+${digits}`;
  if (digits.length === 10) return `+7${digits}`;
  if (raw.startsWith('+')) return `+${digits}`;
  return `+${digits}`;
}

function phoneToWa(phone) {
  return normalizePhone(phone).replace(/\D/g, '');
}

function money(value, fallback = 'Не указано') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

function makeLeadId() {
  return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function getCalculator(lead = {}) {
  return lead.calculator && typeof lead.calculator === 'object' ? lead.calculator : {};
}

function formatCalculatorBlock(calculator) {
  const services = Array.isArray(calculator.services) && calculator.services.length ? calculator.services.join(', ') : 'Не выбрано';
  const breakdown = calculator.breakdown || {};
  const lines = [
    `Площадь калькулятора: ${calculator.area ?? 'Не указано'} м²`,
    `Комнат / зон: ${calculator.rooms ?? 'Не указано'}`,
    `Пакет: ${calculator.package || 'Не указано'}`,
    `Тип ремонта: ${calculator.renovationType || 'Не указано'}`,
    `Опции: ${services}`,
    `Energy level: ${calculator.energyLevel ?? 'Не указано'}%`,
    `Итог: ${calculator.estimatedPriceFormatted || money(calculator.estimatedPrice)}`,
  ];

  if (breakdown && Object.keys(breakdown).length) {
    lines.push(`Breakdown: база ${money(breakdown.base)}, опции ${money(breakdown.extras)}, итого ${money(breakdown.total)}`);
  }

  return lines.join('\n');
}

function formatLeadMessage(lead, status = 'Новая') {
  const calculator = getCalculator(lead);
  return [
    '⚡ Новая заявка с сайта',
    '',
    `ID: ${lead.id}`,
    `Статус: ${status}`,
    `Имя: ${normalizeText(lead.name, 'Без имени')}`,
    `Телефон: ${normalizePhone(lead.phone) || normalizeText(lead.phone)}`,
    `Услуга / объект: ${normalizeText(lead.service || lead.contactObjectType)}`,
    `Площадь из формы: ${normalizeText(lead.area || lead.contactArea)}`,
    `Комментарий: ${normalizeText(lead.message, 'Без комментария')}`,
    '',
    'Данные калькулятора:',
    formatCalculatorBlock(calculator),
    '',
    `Источник: ${normalizeText(lead.source, 'site')}`,
    `Время: ${new Date(lead.timestamp || Date.now()).toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' })}`,
  ].join('\n');
}

function buildLeadKeyboard(lead) {
  const normalizedPhone = normalizePhone(lead.phone);
  const waPhone = phoneToWa(lead.phone);
  const row1 = [
    { text: 'Взять в работу', callback_data: `take:${lead.id}` },
    { text: 'Передать', callback_data: `transfer:${lead.id}` },
  ];
  const row2 = [];

  if (waPhone) row2.push({ text: 'WhatsApp', url: `https://wa.me/${waPhone}` });
  if (normalizedPhone) row2.push({ text: 'Позвонить', url: `tel:${normalizedPhone}` });

  const row3 = [
    { text: 'Статистика', callback_data: 'stats' },
    { text: 'Главное меню', callback_data: 'main_menu' },
  ];

  const keyboard = [row1];
  if (row2.length) keyboard.push(row2);
  keyboard.push(row3);
  if (miniAppUrl) keyboard.push([{ text: 'Mini App', url: miniAppUrl }]);

  return { inline_keyboard: keyboard };
}

async function callTelegram(method, body) {
  if (!token) throw new Error('TG_KEY is not configured');

  const response = await fetch(telegramApi(method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new Error(`[telegram] ${method} failed: ${JSON.stringify(data)}`);
  }
  return data;
}

async function sendLeadToOwner(lead) {
  if (!ownerId) throw new Error('OWNER_ID is not configured');

  return callTelegram('sendMessage', {
    chat_id: ownerId,
    text: formatLeadMessage(lead),
    reply_markup: buildLeadKeyboard(lead),
    disable_web_page_preview: true,
  });
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'voltedge-server', telegramConfigured: Boolean(token && ownerId) });
});

app.get('/api/stats', (_req, res) => {
  res.json({ ok: true, stats, leads: leads.size });
});

app.post('/api/leads', async (req, res) => {
  try {
    const body = req.body || {};
    const phone = normalizePhone(body.phone);

    if (!phone) {
      return res.status(400).json({ ok: false, error: 'phone_required' });
    }

    const lead = {
      ...body,
      id: makeLeadId(),
      phone,
      name: normalizeText(body.name, 'Без имени'),
      service: normalizeText(body.service || body.contactObjectType || body.object),
      area: normalizeText(body.area || body.contactArea || body.calculator?.area),
      source: normalizeText(body.source, 'site'),
      timestamp: body.timestamp || new Date().toISOString(),
      status: 'Новая',
    };

    leads.set(lead.id, lead);
    stats.total += 1;
    stats.new += 1;

    await sendLeadToOwner(lead);

    res.json({ ok: true, leadId: lead.id, status: lead.status });
  } catch (error) {
    console.error('[leads] failed to process lead', error);
    res.status(500).json({ ok: false, error: 'telegram_send_failed', message: error.message });
  }
});

app.listen(port, () => {
  console.log(`[voltedge-server] listening on http://localhost:${port}`);
  console.log(`[voltedge-server] telegram configured: ${Boolean(token && ownerId)}`);
});
