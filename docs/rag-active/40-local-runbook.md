# RAG Active 40 - Local Runbook

Status: active operational runbook
Updated: 2026-06-07
Scope: local commands, checks, backend testing

## Purpose

This file contains operational commands and local testing instructions.

It should be indexed only when the task is about running, testing, deploying or debugging locally.

## Website local preview

The website is static and can be opened directly or through a local HTTP server.

Use an HTTP server when testing assets, forms and browser behavior.

Windows command:

```powershell
cd D:\DEV\Electro
python -m http.server 4174 --bind 127.0.0.1
```

Open:

```text
http://127.0.0.1:4174/
```

## JavaScript syntax check

Preferred check:

```bash
node --check script.js
```

If system Node is unavailable on the local machine, use the configured runtime available in the development environment.

## RAG indexing

Default active index should use:

```bash
python rag/ingest.py
```

This should index active RAG documents from:

```text
docs/rag-active/
```

To index historical docs, pass a specific docs directory manually.

## Telegram backend local setup

Backend path:

```text
BOT TG/backend
```

Create `.env` from `.env.example`:

```env
PORT=3000
TG_KEY=your_bot_token
OWNER_ID=your_telegram_chat_id
BOT_UPDATE_MODE=polling
DELETE_WEBHOOK_ON_POLLING=true
```

Install:

```bash
cd "BOT TG/backend"
npm install
```

Run:

```bash
npm run dev
```

For local development, `BOT_UPDATE_MODE=polling` lets the backend receive Telegram commands and inline button clicks without a public HTTPS webhook.

Health check:

```text
http://localhost:3000/health
```

Telegram smoke test:

```bash
npm run test:telegram
```

Owner-protected diagnostics:

```powershell
$ownerId = '<OWNER_ID>'
Invoke-RestMethod "http://localhost:3000/api/telegram/get-me?telegramUserId=$ownerId"
Invoke-RestMethod "http://localhost:3000/api/telegram/webhook-info?telegramUserId=$ownerId"
Invoke-RestMethod -Method Post "http://localhost:3000/api/test-lead" `
  -ContentType 'application/json' `
  -Body (@{ telegramUserId = $ownerId } | ConvertTo-Json)
```

## Local website to backend request

Current bridge:

```js
await fetch('http://localhost:3000/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(leadPayload),
});
```

For production use deployed backend URL instead of localhost.

## Server webhook mode

On a public HTTPS server:

```env
BOT_UPDATE_MODE=webhook
PUBLIC_BASE_URL=https://api.yourdomain.com
WEBHOOK_PATH=/api/telegram/webhook
```

Then run:

```bash
npm run telegram:set-webhook
npm run telegram:webhook-info
```

For local tunnel tests, use the tunnel HTTPS URL as `PUBLIC_BASE_URL`.

## Git / QA checks

Useful checks before committing:

```bash
git diff --check
node --check script.js
python -m py_compile rag/ingest.py rag/query.py
```

## Production reminders

Before production:

- set `DEV_AUTH_BYPASS = false`;
- replace localhost backend URL with deployed backend URL;
- keep `TG_KEY` and `OWNER_ID` only in environment variables;
- do not commit `.env`;
- add real storage for leads if losing Telegram notifications is unacceptable.
