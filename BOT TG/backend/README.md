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
OWNER_ID=477062399
```

## Endpoint

```text
POST /api/leads
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
