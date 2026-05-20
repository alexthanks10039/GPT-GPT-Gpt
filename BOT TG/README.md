# BOT TG

Отдельный модуль Telegram Mini App для проекта VoltEdge.

## Что это

`BOT TG` - изолированный подпроект внутри репозитория сайта.

Он нужен для следующей логики:

```text
Сайт VoltEdge
↓
Форма заявки / калькулятор
↓
Backend API
↓
Telegram уведомление владельцу
↓
Telegram Mini App для объектов, сотрудников и фотоотчётов
```

## Анализ текущих проектов

### Основной сайт

Репозиторий `GPT-GPT-Gpt` - статический лендинг VoltEdge.

Текущий стек:

- `index.html`
- `styles.css`
- `script.js`
- интерактивный калькулятор
- форма заявки
- edit panel через `localStorage`
- CSS/JS визуализация дома/помещения

Что важно:

- сайт уже собирает данные калькулятора;
- сайт уже формирует `leadPayload`;
- сейчас заявка не уходит на backend;
- следующий шаг - заменить локальную обработку формы на `POST /api/leads`.

### Telegram-bot-svet-

Репозиторий `Telegram-bot-svet-` описывает Telegram Mini App на Flutter/Dart.

Концепция:

- приложение открывается внутри Telegram;
- сотрудник получает app-like интерфейс;
- MVP: объекты, статусы, таймлайн, фото ДО/ПОСЛЕ, завершение объекта;
- backend API подключается позже.

## Почему совмещаем так

Мы не встраиваем Mini App прямо в лендинг.

Правильная схема:

```text
GPT-GPT-Gpt/
├── index.html
├── styles.css
├── script.js
└── BOT TG/
    ├── pubspec.yaml
    ├── lib/
    ├── web/
    ├── API_CONTRACT.md
    └── INTEGRATION_ANALYSIS.md
```

То есть сайт остаётся сайтом, а Telegram Mini App живёт отдельно внутри папки `BOT TG`.

## MVP 1 - первая боевая интеграция

Самая первая задача:

```text
Клиент оставил заявку на сайте
↓
Сайт отправил данные на backend
↓
Backend сохранил заявку
↓
Владелец получил сообщение в Telegram
```

Это важнее, чем сложная CRM, роли и фотоотчёты.

## MVP 2 - Telegram Mini App

После уведомлений владельца добавляем Mini App:

- список объектов;
- карточка объекта;
- статусы работ;
- фотоотчёты;
- комментарии;
- контроль сотрудников;
- история действий.

## Локальный запуск Mini App

```bash
cd "BOT TG"
flutter pub get
flutter run -d chrome
```

## Build

```bash
cd "BOT TG"
flutter build web
```

## Deploy

Mini App можно развернуть отдельно:

- Vercel
- Netlify
- Firebase Hosting
- VPS
- GitHub Pages

После deploy URL подключается в BotFather как Web App URL.

## Статус

Сейчас папка `BOT TG` содержит стартовую структуру для объединённого проекта:

- Flutter Mini App skeleton;
- моковые объекты;
- экран объекта;
- статусы;
- заготовку под backend API;
- контракт интеграции сайта и backend;
- анализ совмещения проектов.
