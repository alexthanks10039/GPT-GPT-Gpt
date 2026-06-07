# BOT TG Backend

Минимальный backend для приёма заявок с сайта и отправки уведомления владельцу в Telegram.

## Запуск

```bash
cd "BOT TG/backend"
npm install
npm run dev
```

## Локальная настройка

Создай локальный файл `.env` внутри `BOT TG/backend`.

```text
PORT=3000
TG_KEY=put_value_from_botfather_here
OWNER_ID=put_your_telegram_chat_id_here

BOT_UPDATE_MODE=polling
DELETE_WEBHOOK_ON_POLLING=true
POLLING_TIMEOUT_SECONDS=25
POLLING_RETRY_MS=3000

PUBLIC_BASE_URL=
WEBHOOK_PATH=/api/telegram/webhook
SITE_ORIGIN=http://127.0.0.1:4174
```

## Telegram update modes

### Local polling

Use polling for local development. Telegram does not need access to `localhost`; the backend pulls updates through `getUpdates`.

```powershell
cd "D:\DEV\Electro\BOT TG\backend"
$env:BOT_UPDATE_MODE="polling"
npm run dev
```

Expected behavior:

- `/start` works in Telegram;
- inline buttons work;
- `pendingUpdateCount` stops growing;
- no ngrok/cloudflared is required.

### Production webhook

Use webhook for production or a local HTTPS tunnel.

`.env`:

```text
BOT_UPDATE_MODE=webhook
PUBLIC_BASE_URL=https://api.yourdomain.com
WEBHOOK_PATH=/api/telegram/webhook
```

Commands:

```bash
npm run telegram:set-webhook
npm run telegram:webhook-info
npm run telegram:delete-webhook
```

## Endpoint

```text
POST /api/leads
```

## Protected diagnostics

These endpoints are owner-only. Pass `OWNER_ID` through `?telegramUserId=...`, JSON body `telegramUserId`, or the `x-telegram-user-id` header.

```text
GET /api/telegram/get-me
GET /api/telegram/webhook-info
POST /api/test-lead
```

PowerShell:

```powershell
$ownerId = '<OWNER_ID>'
Invoke-RestMethod "http://localhost:3000/api/telegram/get-me?telegramUserId=$ownerId"
Invoke-RestMethod "http://localhost:3000/api/telegram/webhook-info?telegramUserId=$ownerId"
Invoke-RestMethod -Method Post "http://localhost:3000/api/test-lead" `
  -ContentType 'application/json' `
  -Body (@{ telegramUserId = $ownerId } | ConvertTo-Json)
```

## Пример payload

```json
{
  "name": "Александр",
  "phone": "+7 777 000 00 00",
  "service": "Электромонтаж",
  "objectType": "Квартира",
  "address": "Алматы, Бостандыкский район",
  "comment": "Нужно провести проводку",
  "calculatorData": {
    "area": 85,
    "options": ["розетки", "освещение", "щиток"]
  },
  "calculatedPrice": 450000,
  "sourcePage": "/calculator"
}
```

## Проверка

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Александр","phone":"+7 777 000 00 00","service":"Электромонтаж","objectType":"Квартира","address":"Алматы","comment":"Тестовая заявка","calculatedPrice":450000,"sourcePage":"/calculator"}'
```

После запроса владелец должен получить уведомление в Telegram.
