# RAG Active 20 - Telegram and Backend Current

Status: active source of truth
Updated: 2026-05-20
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
- `src/leads.routes.js` - `/api/leads` route.
- `src/telegram.service.js` - Telegram message formatting and sending.
- `src/test-send.js` - smoke test for Telegram notification.
- `src/owner-access.js` - temporary owner-only guard for future protected routes.

## Environment variables

Required:

```env
PORT=3000
TG_KEY=bot_token_from_botfather
OWNER_ID=owner_telegram_chat_id
```

`TG_KEY` is the bot token.
`OWNER_ID` is the Telegram owner chat id.

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

- Call
- Take to work

Callback handler is not implemented yet.

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
