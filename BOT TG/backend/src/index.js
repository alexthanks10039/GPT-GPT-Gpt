import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { leadsRouter } from './leads.routes.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'bot-tg-backend',
  });
});

app.use(leadsRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

app.listen(port, () => {
  console.log(`[bot-tg-backend] listening on http://localhost:${port}`);
});
