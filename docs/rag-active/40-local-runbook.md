# RAG Active 40 - Local Runbook

Status: active operational runbook
Updated: 2026-05-20
Scope: local commands, checks, backend testing

## Purpose

This file contains operational commands and local testing instructions.

It should be indexed only when the task is about running, testing, deploying or debugging locally.

## Website local preview

The website is static and can be opened directly or through a local HTTP server.

Use an HTTP server when testing assets, forms and browser behavior.

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

Health check:

```text
http://localhost:3000/health
```

Telegram smoke test:

```bash
npm run test:telegram
```

## Local website to backend request

Current missing bridge:

```js
await fetch('http://localhost:3000/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(leadPayload),
});
```

For production use deployed backend URL instead of localhost.

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
