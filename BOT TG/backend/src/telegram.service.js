const getConfig = () => {
  const token = process.env.TG_KEY;
  const ownerId = process.env.OWNER_ID;

  if (!token) {
    throw new Error('TG_KEY is not configured');
  }

  if (!ownerId) {
    throw new Error('OWNER_ID is not configured');
  }

  return { token, ownerId };
};

const formatPrice = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return `${number.toLocaleString('ru-RU')} ₸`;
};

const normalizeOptions = (calculatorData) => {
  if (!calculatorData || typeof calculatorData !== 'object') return [];

  if (Array.isArray(calculatorData.options)) return calculatorData.options;
  if (Array.isArray(calculatorData.services)) return calculatorData.services;

  return [];
};

const formatCalculatorData = (calculatorData) => {
  if (!calculatorData || typeof calculatorData !== 'object') return [];

  const lines = [];
  const area = calculatorData.area || calculatorData.calculatorArea;
  const options = normalizeOptions(calculatorData);

  if (area) {
    lines.push(`📐 Площадь: ${area} м²`);
  }

  if (options.length > 0) {
    lines.push(`💡 Опции: ${options.join(', ')}`);
  }

  return lines;
};

export const buildOwnerLeadMessage = (lead) => {
  const lines = ['🆕 Новая заявка с сайта', ''];

  lines.push(`👤 Имя: ${lead.name}`);
  lines.push(`📞 Телефон: ${lead.phone}`);

  if (lead.objectType) lines.push(`🏠 Объект: ${lead.objectType}`);
  if (lead.address) lines.push(`📍 Адрес: ${lead.address}`);
  if (lead.service) lines.push(`🛠 Услуга: ${lead.service}`);

  const calculatorLines = formatCalculatorData(lead.calculatorData);
  const price = formatPrice(lead.calculatedPrice);

  if (calculatorLines.length > 0 || price) {
    lines.push('');
    lines.push(...calculatorLines);
    if (price) lines.push(`💰 Расчёт калькулятора: ${price}`);
  }

  if (lead.comment) {
    lines.push('');
    lines.push('💬 Комментарий:');
    lines.push(lead.comment);
  }

  lines.push('');
  lines.push(`🌐 Источник: ${lead.source || 'сайт'}`);
  if (lead.sourcePage) lines.push(`📄 Страница: ${lead.sourcePage}`);
  lines.push(`🕒 Время: ${new Date().toLocaleString('ru-RU')}`);

  return lines.join('\n');
};

export const sendOwnerLeadNotification = async (lead) => {
  const { token, ownerId } = getConfig();
  const message = buildOwnerLeadMessage(lead);

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: ownerId,
      text: message,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📞 Позвонить',
              callback_data: `lead:call:${lead.id || 'new'}`,
            },
            {
              text: '🛠 Взять в работу',
              callback_data: `lead:take:${lead.id || 'new'}`,
            },
          ],
        ],
      },
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.description || 'Telegram message was not sent');
  }

  return data;
};
