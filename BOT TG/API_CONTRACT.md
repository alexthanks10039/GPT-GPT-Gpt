# API Contract

## 1. Website Lead Endpoint

### POST /api/leads

Назначение: принять заявку с сайта, сохранить её и отправить владельцу уведомление в Telegram.

### Request Body

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
    "rooms": 3,
    "package": "standard",
    "options": ["Розетки", "Освещение", "Щиток"]
  },
  "calculatedPrice": 450000,
  "sourcePage": "/calculator",
  "utmSource": "instagram",
  "utmMedium": "target",
  "utmCampaign": "electro_almaty"
}
```

### Required Fields

```text
name
phone
```

### Success Response

```json
{
  "success": true,
  "leadId": "lead_123",
  "status": "new"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Name and phone are required"
}
```

## 2. Telegram Owner Notification

Формат сообщения владельцу:

```text
🆕 Новая заявка с сайта

👤 Имя: Александр
📞 Телефон: +7 777 000 00 00
🏠 Объект: Квартира
📍 Адрес: Алматы, Бостандыкский район
🛠 Услуга: Электромонтаж

📐 Площадь: 85 м²
💡 Опции: Розетки, Освещение, Щиток
💰 Расчёт калькулятора: 450 000 ₸

💬 Комментарий:
Нужно провести проводку

📄 Страница: /calculator
🕒 Время: 20.05.2026 21:35
```

## 3. Mini App Objects Endpoint

### GET /api/objects

Назначение: получить список объектов для Telegram Mini App.

### Query Params

```text
telegramUserId
role
status
```

### Response

```json
{
  "items": [
    {
      "id": "OBJ-001",
      "title": "Квартира ЖК Esentai, 85 м²",
      "address": "Алматы, Бостандыкский район",
      "clientName": "Александр",
      "phone": "+7 777 000 00 00",
      "description": "Электромонтаж под ключ",
      "deadline": "2026-05-28T00:00:00.000Z",
      "status": "in_progress",
      "assignee": "Илья монтажник",
      "price": 450000
    }
  ]
}
```

## 4. Mini App Object Details

### GET /api/objects/:id

Возвращает карточку объекта, таймлайн, комментарии и отчёты.

## 5. Change Object Status

### PATCH /api/objects/:id/status

```json
{
  "status": "review",
  "telegramUserId": "123456789"
}
```

## 6. Photo Reports

### POST /api/objects/:id/reports

На MVP фото можно отправлять через Telegram Bot API и хранить только metadata.

```json
{
  "telegramUserId": "123456789",
  "telegramFileId": "AgACAgIAAxk...",
  "telegramMessageId": "501",
  "comment": "Фото после монтажа щита"
}
```

## 7. ENV

```env
TELEGRAM_BOT_TOKEN=
OWNER_CHAT_ID=
API_BASE_URL=
DATABASE_URL=
```

## 8. Website Integration Note

В `script.js` сайта после формирования `leadPayload` нужно отправлять его на backend:

```js
await fetch('/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(leadPayload),
});
```

На первом этапе этого достаточно, чтобы владелец начал получать заявки в Telegram.
