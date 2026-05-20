import 'dotenv/config';
import { sendOwnerLeadNotification } from './telegram.service.js';

const testLead = {
  id: `test_${Date.now()}`,
  name: 'Александр',
  phone: '+7 777 000 00 00',
  service: 'Электромонтаж',
  objectType: 'Квартира',
  address: 'Алматы, Бостандыкский район',
  comment: 'Тестовая заявка из BOT TG backend.',
  calculatorData: {
    area: 85,
    options: ['розетки', 'освещение', 'щиток'],
  },
  calculatedPrice: 450000,
  source: 'smoke-test',
  sourcePage: '/calculator',
};

try {
  const result = await sendOwnerLeadNotification(testLead);
  console.log('[telegram.test] sent', {
    ok: result.ok,
    messageId: result.result?.message_id,
    chatId: result.result?.chat?.id,
  });
} catch (error) {
  console.error('[telegram.test] failed', error.message);
  process.exit(1);
}
