# RAG Active 20 - Telegram and Backend Current

Status: active source of truth
Updated: 2026-06-07
Scope: Telegram bot, backend API, owner notifications, local backend testing

## Current priority

The first backend MVP is owner notification when a website lead is received.

Current target flow:

```text
Website lead form
-> POST /api/leads
-> Express backend
-> Telegram Bot API
-> owner receives notification
```

## Backend stack

Backend path:

```text
BOT TG/backend/
```

Stack:

- Node.js
- Express
- ES modules
- dotenv
- cors

Main files:

- `src/index.js` - Express entrypoint and health route.
- `src/config.js` - centralized backend config from environment variables.
- `src/leads.routes.js` - `/api/leads` route.
- `src/telegram.service.js` - Telegram message formatting and sending.
- `src/bot.routes.js` - Telegram diagnostics, webhook route and shared update handler.
- `src/polling.service.js` - local polling through Telegram `getUpdates`.
- `src/telegram-webhook-cli.js` - webhook set/delete/info commands.
- `src/test-send.js` - smoke test for Telegram notification.
- `src/owner-access.js` - temporary owner-only guard for future protected routes.

## Environment variables

Required:

```env
PORT=3000
TG_KEY=bot_token_from_botfather
OWNER_ID=owner_telegram_chat_id
BOT_UPDATE_MODE=polling
```

`TG_KEY` is the bot token.
`OWNER_ID` is the Telegram owner chat id.
`BOT_UPDATE_MODE=polling` is the local development mode.

Server webhook mode uses:

```env
BOT_UPDATE_MODE=webhook
PUBLIC_BASE_URL=https://api.example.com
WEBHOOK_PATH=/api/telegram/webhook
```

## Leads endpoint

Endpoint:

```text
POST /api/leads
```

Required fields:

- `name`
- `phone`

Accepted normalized fields:

- `service`
- `objectType`
- `address`
- `comment`
- `calculatorData`
- `calculatedPrice`
- `source`
- `sourcePage`

Behavior:

- validates name and phone;
- normalizes lead;
- sends owner Telegram notification;
- returns success if accepted.

If Telegram fails but lead is valid, backend returns accepted response with Telegram warning. Future version should add database persistence.

## Telegram notification

Owner message includes:

- new lead marker
- name
- phone
- object type
- address
- service
- calculator area/options
- calculated price
- comment
- source
- source page
- time

Inline buttons currently exist:

- Take to work
- Reassign
- WhatsApp
- Call
- Change status
- Stats
- Main menu
- Mini App

Callbacks are handled by the shared `handleTelegramUpdate(update)` pipeline. Both local polling and server webhook call the same handler.

Supported update modes:

- local polling: `startTelegramPolling()` calls Telegram `getUpdates`;
- server webhook: `POST /api/telegram/webhook` receives Telegram updates;
- both routes support `message` and `callback_query`.

The callback handler must always call `answerCallbackQuery` for owner button clicks so Telegram does not leave the inline button in a loading state.

## Owner-only access mode

Current access decision:

```text
roles are temporarily disabled
access mode = owner-only
valid user = OWNER_ID only
```

Implemented file:

```text
BOT TG/backend/src/owner-access.js
```

The guard reads Telegram user id from:

- `req.query.telegramUserId`
- `req.body.telegramUserId`
- `x-telegram-user-id` header

If the user id does not equal `OWNER_ID`, it returns `403 Owner access required`.

Current status:

- guard exists;
- Telegram menu, lead and employee callbacks are guarded;
- object routes are not implemented yet;
- guard is not connected yet because `/api/objects` does not exist yet.

When object routes are implemented, connect it to:

```js
router.get('/api/objects', requireOwnerAccess, handler);
router.get('/api/objects/:id', requireOwnerAccess, handler);
router.patch('/api/objects/:id/status', requireOwnerAccess, handler);
router.post('/api/objects/:id/reports', requireOwnerAccess, handler);
```

## Telegram Mini App current status

Flutter Mini App skeleton exists in:

```text
BOT TG/lib/
```

Current state:

- object list screen;
- object details screen;
- mock object service;
- WorkObject model;
- ApiService placeholder;
- buttons for photo report, comment and completion.

This is not yet connected to real backend object routes.

## Local behavior confirmed

- Website form sends `POST /api/leads`.
- Backend sends Telegram owner lead card.
- Local Telegram commands and inline buttons work when backend is started with `BOT_UPDATE_MODE=polling`.
- Existing lead buttons can return "lead not found" after backend restart because the current lead store is in-memory.

## Production reminders

- Do not commit `.env`.
- Use polling locally and webhook on a public HTTPS server.
- Run `npm run telegram:set-webhook` only after `PUBLIC_BASE_URL` is configured.
- Add persistent storage before treating Telegram as production CRM.

## Planned object API

Future endpoints:

```text
GET /api/objects
GET /api/objects/:id
PATCH /api/objects/:id/status
POST /api/objects/:id/reports
```

Access rule for MVP:

```text
telegramUserId === OWNER_ID
```

## Deprecated / not current

Do not use the old Telegram RAG as active truth:

```text
Telegram-bot-svet-/rag/project-context.md
```

It describes roles and a later NestJS/PostgreSQL backend direction. Current implementation is Node.js + Express with temporary owner-only access.
