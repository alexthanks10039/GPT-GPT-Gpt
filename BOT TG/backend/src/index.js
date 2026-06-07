import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { leadsRouter } from './leads.routes.js';
import { botRouter } from './bot.routes.js';
import { getBackendConfig, getPublicWebhookUrl } from './config.js';
import { startTelegramPolling } from './polling.service.js';

const app = express();
const config = getBackendConfig();
const port = config.port;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'bot-tg-backend',
  });
});

app.use(leadsRouter);
app.use(botRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

app.listen(port, () => {
  console.log(`[bot-tg-backend] listening on http://localhost:${port}`);
  console.log(`[bot-tg-backend] Telegram update mode: ${config.botUpdateMode}`);

  if (config.botUpdateMode === 'polling') {
    startTelegramPolling().catch((error) => {
      console.error('[telegram.polling_start_failed]', error);
    });
    return;
  }

  if (config.botUpdateMode === 'webhook') {
    try {
      console.log(`[bot-tg-backend] webhook path: ${config.webhookPath}`);
      if (config.publicBaseUrl) {
        console.log(`[bot-tg-backend] webhook URL: ${getPublicWebhookUrl()}`);
      } else {
        console.log('[bot-tg-backend] PUBLIC_BASE_URL is not set; run polling locally or set webhook manually.');
      }
    } catch (error) {
      console.warn('[bot-tg-backend] webhook config warning:', error.message);
    }
    return;
  }

  console.warn(`[bot-tg-backend] Unknown BOT_UPDATE_MODE: ${config.botUpdateMode}`);
});
