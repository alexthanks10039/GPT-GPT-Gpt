# Telegram Bot / Mini App Context

Дата обновления: 2026-05-20

Этот документ является частью RAG-базы знаний проекта VoltEdge. Он фиксирует текущее состояние Telegram-модуля, backend-логики, UX-навигации и интеграции с сайтом.

## Назначение Telegram-модуля

Telegram-модуль нужен для первичной операционной обработки заявок с сайта и будущего контроля объектов, сотрудников и фотоотчётов.

Главный пользовательский поток:

```text
Клиент оставляет заявку на сайте
↓
Сайт отправляет данные на backend
↓
Backend принимает заявку через POST /api/leads
↓
Заявка сохраняется во временное in-memory хранилище
↓
Владелец получает уведомление в Telegram
↓
Владелец нажимает быстрые кнопки: взять в работу, передать, WhatsApp, позвонить
↓
Позже заявка может стать объектом для сотрудника
```

## Структура проекта

Telegram-модуль находится внутри основного репозитория в папке:

```text
BOT TG/
```

Текущие части:

```text
BOT TG/
├── backend/
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── index.js
│       ├── leads.routes.js
│       ├── telegram.service.js
│       ├── bot.routes.js
│       ├── bot-ui.service.js
│       ├── leads.store.js
│       ├── employees.store.js
│       └── test-send.js
│
├── lib/
│   ├── main.dart
│   ├── models/work_object.dart
│   ├── services/mock_object_service.dart
│   └── services/api_service.dart
│
├── web/index.html
├── pubspec.yaml
├── API_CONTRACT.md
├── INTEGRATION_ANALYSIS.md
└── README.md
```

## Backend

Backend Telegram-модуля находится в:

```text
BOT TG/backend
```

Стек:

- Node.js
- Express
- dotenv
- cors
- Telegram Bot API через HTTP requests

Запуск:

```powershell
cd "BOT TG/backend"
npm install
npm run dev
```

Проверка:

```text
GET http://localhost:3000/health
```

Ожидаемый ответ:

```json
{
  "ok": true,
  "service": "bot-tg-backend"
}
```

## Переменные окружения

Локальный `.env` внутри `BOT TG/backend`:

```text
PORT=3000
TG_KEY=telegram_bot_token
OWNER_ID=477062399
MINI_APP_URL=
```

Важно: реальные токены не хардкодить в исходный код. Для тестов можно использовать временный dev-token, но production-токен должен жить только в окружении.

## Endpoint заявок

```text
POST /api/leads
```

Endpoint принимает заявку с сайта, нормализует данные, сохраняет заявку во временное in-memory хранилище и отправляет уведомление владельцу в Telegram.

Минимальные поля:

- name
- phone
- service
- objectType
- address
- comment
- calculatorData
- calculatedPrice
- source
- sourcePage

Если `name` или `phone` отсутствуют, endpoint возвращает `400`.

Если заявка принята, но Telegram-уведомление не отправилось, endpoint возвращает успешный ответ со статусом `telegram: failed`, чтобы не терять заявку на стороне сайта.

## Telegram service

Файл:

```text
BOT TG/backend/src/telegram.service.js
```

Назначение:

- читать `TG_KEY` и `OWNER_ID` из окружения;
- отправлять сообщения через Telegram Bot API;
- отвечать на callback query;
- редактировать сообщения;
- отправлять владельцу уведомление о новой заявке;
- подключать постоянную клавиатуру навигации.

Основные функции:

- `telegramApi(method, payload)`
- `sendMessage({ chatId, text, replyMarkup })`
- `answerCallbackQuery({ callbackQueryId, text })`
- `editMessage({ chatId, messageId, text, replyMarkup })`
- `sendOwnerLeadNotification(lead)`

## In-memory store

Файл:

```text
BOT TG/backend/src/leads.store.js
```

Назначение:

- хранить заявки в памяти backend;
- хранить статусы;
- обновлять статус заявки;
- переназначать заявку;
- считать статистику;
- хранить историю действий.

Важно: это MVP-хранилище. После перезапуска backend данные очищаются. Следующий взрослый этап - PostgreSQL или SQLite.

Статусы заявок:

```text
new - новая
in_work - в работе
reassigned - переназначена
done - выполнена
cancelled - отменена
```

## Employees store

Файл:

```text
BOT TG/backend/src/employees.store.js
```

Содержит mock-сотрудников для MVP-переназначения заявки.

Примеры сотрудников:

- Илья - монтажник
- Данияр - прораб
- Артём - монтажник

Позже mock-сотрудников нужно заменить таблицей `users` / `employees` в базе данных.

## Bot UI service

Файл:

```text
BOT TG/backend/src/bot-ui.service.js
```

Назначение:

- формировать тексты сообщений;
- формировать inline-кнопки;
- формировать главное меню;
- формировать постоянную нижнюю клавиатуру;
- формировать сообщение заявки;
- формировать статистику;
- формировать список сотрудников;
- формировать Mini App-заглушку.

Главное меню:

```text
Новые заявки
Заявки в работе
Статистика
Сотрудники
Mini App
Настройки
```

Постоянная нижняя клавиатура:

```text
Главное меню
Статистика
Мини-Эпп
```

Кнопки под заявкой:

```text
Взять в работу
Передать
WhatsApp
Позвонить
Статистика
Главное меню
Mini App
```

## Bot routes / webhook

Файл:

```text
BOT TG/backend/src/bot.routes.js
```

Endpoint:

```text
POST /api/telegram/webhook
```

Назначение:

- принимать Telegram updates;
- обрабатывать inline-кнопки;
- обрабатывать текстовые команды;
- открывать главное меню;
- показывать статистику;
- показывать сотрудников;
- открывать Mini App-заглушку;
- менять статус заявки;
- переназначать заявку сотруднику.

Поддерживаемые команды:

```text
/start
/reload
reload
перезапуск
Главное меню
Статистика
Мини-Эпп
```

Команда `/reload` не перезапускает Node.js процесс. Она безопасно перезапускает UX бота: обновляет нижнюю клавиатуру и возвращает пользователя в главное меню.

## Webhook

Для реальной обработки кнопок после деплоя backend нужно установить webhook:

```text
https://api.telegram.org/bot<TG_KEY>/setWebhook?url=https://your-domain.com/api/telegram/webhook
```

Локально кнопки webhook полноценно не проверить без публичного URL. Для локального теста нужен ngrok, Cloudflare Tunnel или другой tunnel.

## Mini App

Flutter Web Mini App находится в:

```text
BOT TG/
```

Запуск:

```powershell
cd "BOT TG"
flutter pub get
flutter run -d chrome
```

Сборка:

```powershell
flutter build web
```

Текущий Mini App работает на mock-данных и показывает объекты, карточку объекта, статусы и базовые действия. Backend-интеграция Mini App ещё не подключена полностью.

## Роли пользователей

Запланированная логика ролей:

```text
owner - владелец
manager - руководитель / прораб
employee - сотрудник / монтажник
guest - пользователь без доступа
```

MVP-подход: проверять роль по Telegram ID.

Переменные окружения будущей реализации:

```text
OWNER_IDS=477062399
MANAGER_IDS=
EMPLOYEE_IDS=
```

Для production роли нужно перенести в базу данных:

```text
users
- id
- telegram_id
- name
- role
- status
- created_at
```

## Связка сайта с backend

Сайт уже формирует `leadPayload` в `script.js`, но отправка формы на backend ещё не подключена окончательно.

Нужный следующий шаг в `script.js`:

```js
await fetch('http://localhost:3000/api/leads', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(leadPayload),
});
```

На production нужно заменить локальный URL на реальный backend URL.

## Текущий статус

Готово:

- backend skeleton;
- `POST /api/leads`;
- Telegram notification через `sendMessage`;
- in-memory заявки;
- статусы заявок;
- статистика;
- главное меню;
- постоянная нижняя клавиатура;
- кнопки под заявкой;
- переназначение заявки mock-сотруднику;
- Mini App-заглушка;
- команда `/reload`;
- endpoint `/api/telegram/webhook`.

Не готово:

- база данных;
- production webhook;
- реальные роли через Telegram ID;
- полная связка формы сайта с backend;
- сохранение заявок после перезапуска сервера;
- реальная Mini App интеграция с backend;
- деплой backend на публичный URL.

## Следующие шаги

1. Подключить `script.js` сайта к `POST /api/leads`.
2. Поднять backend на публичном URL.
3. Установить Telegram webhook.
4. Добавить роли через Telegram ID.
5. Перенести заявки и сотрудников из in-memory store в базу данных.
6. Подключить Mini App к backend API.
