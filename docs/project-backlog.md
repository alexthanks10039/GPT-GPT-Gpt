# VoltEdge Project Backlog

Updated: 2026-06-07
Status: active planning backlog

## Done - Telegram Local Interface

- Restored backend sources in `D:\DEV\Electro\BOT TG\backend`.
- Added environment based update mode:
  - `BOT_UPDATE_MODE=polling` for local development;
  - `BOT_UPDATE_MODE=webhook` for server/tunnel mode.
- Added shared Telegram update pipeline:
  - webhook route calls `handleTelegramUpdate(update)`;
  - polling loop calls the same function.
- Added local polling through Telegram `getUpdates`.
- Added webhook CLI scripts:
  - `npm run telegram:set-webhook`;
  - `npm run telegram:delete-webhook`;
  - `npm run telegram:webhook-info`.
- Kept owner-only protection before menu/lead mutations.

## P0 - Verify In Telegram UI

- Start backend with `BOT_UPDATE_MODE=polling`.
- Send `/start` to the bot.
- Confirm menu buttons respond.
- Submit a website lead.
- Confirm lead card buttons respond:
  - take lead;
  - reassign;
  - stats;
  - main menu;
  - call.
- Confirm `pendingUpdateCount` stops growing after polling is enabled.

## P1 - Production Readiness

- Deploy backend to a public HTTPS server.
- Set:
  - `BOT_UPDATE_MODE=webhook`;
  - `PUBLIC_BASE_URL=https://...`;
  - `WEBHOOK_PATH=/api/telegram/webhook`.
- Run `npm run telegram:set-webhook`.
- Add persistent lead storage before using Telegram as production CRM.
- Store Telegram `chat_id` and `message_id` for each lead.

