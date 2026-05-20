# VoltEdge Project Changelog

Дата обновления: 2026-05-21

Этот документ является частью RAG-базы знаний проекта. Он фиксирует важные решения, правки интерфейса и архитектурные изменения, чтобы Codex/AI мог учитывать текущий контекст без повторного анализа всего кода.

## Technical audit stabilization 2026-05-21

- Added `POST /api/leads` request timeout so the form cannot stay stuck in the sending state when the local backend is unavailable.
- Updated `BOT TG/rag/telegram-backend-rag.json` so the Telegram/backend RAG context now matches the connected lead form bridge.
- Locked `.room-smart-grid` to smart/premium states only; base state now hides the layer and stops `lineFlow`.
- Синхронизирована текущая рабочая ветка с актуальным GitHub `main`; рабочая ветка для фиксов: `codex/technical-audit-fixes`.
- Добавлен frontend bridge формы к backend: `script.js` отправляет `leadPayload` на `siteSettings.integrations.leadApiUrl`, локально `http://localhost:3000/api/leads`.
- Payload формы приведен к контракту `POST /api/leads`: `name`, `phone`, `service`, `objectType`, `address`, `calculatorData`, `calculatedPrice`, `source`, `sourcePage`.
- В редакт-панель добавлено поле `Lead API URL` во вкладке `Данные`.
- Исправлено visual-state поведение `.smart-pulse`: keyframes включаются только для `is-smart` и `is-premium`, базовое состояние больше не держит pulse видимым.
- Исправлен horizontal overflow baseline room harness через ограничение ширины тестовой оболочки.
- Обновлен active RAG-контекст: backend bridge, workspace drift, smart-pulse fix и Windows runbook.

## Базовая структура проекта

- Проект перенесен в `C:\Users\user\Documents\Electro`.
- Подготовлен Git-репозиторий и remote GitHub `alexthanks10039/GPT-GPT-Gpt`.
- Основные файлы лендинга: `index.html`, `styles.css`, `script.js`.
- Лендинг работает как статический сайт без сборщика.
- Локальный preview запускается через HTTP server, текущий рабочий адрес: `http://127.0.0.1:4174/`.
- Telegram-направление вынесено в отдельный модуль `BOT TG/` внутри основного репозитория.

## Редакт-панель

- Расширена существующая edit/admin panel, дубликат панели не создавался.
- Добавлена вкладка `Блоки`.
- Блоки редактируются через модель `siteSettings.blocks`.
- Источник схемы блоков: `BLOCK_SCHEMA` в `script.js`.
- Через панель редактируются hero, trust strip, problem, advantages, services, cases, process, guarantee, reviews, calculator, FAQ, lead form и footer.
- Для блоков доступны базовые поля: заголовок, подзаголовок, описание, CTA, media, items, settings, видимость и порядок.
- Добавлены SEO-поля: title, description, keywords, theme color.
- Временный dev-вход без пароля включен через `DEV_AUTH_BYPASS`. Для production нужно вернуть `false`.
- User flow панели: выбрать блок слева, редактировать поля справа, нажать `Сохранить изменения`.
- Список блоков в редакторе больше не скрывается за блюром, область редактирования скроллится, кнопка сохранения доступна внизу панели.
- Блюр у backdrop и самой панели убран полностью: `.editor-backdrop`, `.editor-login`, `.editor-panel` используют `backdrop-filter: none`.
- Во вкладку `Анимации` добавлен инструментарий Figma room animation: debug toggle, opacity/transition/glow/speed settings, thresholds, preview presets и rapid test.

## Калькулятор

- Калькулятор использует `CALC_CONFIG`, `calculatorState`, `getEstimateBreakdown()`, `calculateEstimate()` и `getCalculatorPayload()`.
- Итоговая цена рассчитывается по типу объекта, площади, комнатам/зонам, типу ремонта, пакету, дополнительным опциям и сроку.
- Добавлен подробный breakdown расчета.
- Summary-блок калькулятора зафиксирован по ширине, чтобы цена, строки summary и CTA не выходили за границы при изменении параметров.
- Цена получила стабильную типографику: ограниченный размер, `tabular-nums`, `white-space: nowrap`.
- Правый блок summary проверен на больших суммах и мобильной ширине без горизонтального overflow.
- Шаг `Сроки` теперь использует отдельную вертикальную сетку: карточки сроков идут в одну колонку, навигация остается ниже.
- Плитки калькулятора выровнены по единой CSS-сетке: иконка/визуальный маркер фиксируется в центральной зоне сверху, между иконкой и текстом есть стабильный отступ.
- Для выбранных плиток подсветка перенесена к зоне иконки, чтобы иконка, glow и текст не конфликтовали.
- CSS-домик в визуальном блоке калькулятора заменен на Figma-модель помещения из `assets/figma/`.
- Контракт калькулятора сохранен: `.house-stage`, `data-house-stage`, `data-house-model` и классы состояний не переименованы.
- Слои модели: `object`, `lights-main`, `lights-window`, `lights-decor`.
- Базовый свет и окно видимы по умолчанию; декоративные светильники включаются через `decorLight`, `outdoorLight` или `premium`; smart-линии включаются через `smartHome`; камеры включаются через `cctv`.
- Для Figma-модели добавлены desktop/mobile проверки: ассеты грузятся без 404, горизонтального overflow на mobile нет.

## CSS-сетка плиток калькулятора

- Общая сетка `.choice-grid` остается трехколоночной для выбора типа объекта.
- `.choice-grid.two` остается двухколоночной для типа ремонта.
- `.package-grid` остается одноколоночной.
- `.option-grid` остается двухколоночной на desktop и одноколоночной на mobile.
- Для `.choice-card` и `.package-card` используется grid с фиксированной верхней зоной под визуальный элемент.
- Для `.option-card span` используется аналогичная внутренняя grid-сетка.
- Для `data-step-panel="3"` действует отдельный override, чтобы сохранить вертикальные строковые карточки сроков.

## Связка калькулятора с формой

- При submit формы в payload попадает расчет из калькулятора.
- Hidden-поля формы: `calculatorPayload`, `estimatedPrice`, `calculatorArea`, `calculatorOptions`, `calculatorBreakdown`, `calculatedAt`, `leadSource`.
- `window.lastLeadPayload` содержит данные формы, расчет, breakdown, дату расчета и источник.
- Отправка формы подключена к `POST /api/leads` в `BOT TG/backend` через `siteSettings.integrations.leadApiUrl`.
- При ошибке сети/backend форма показывает ошибку и не сбрасывает введенные пользователем данные.

## Форма заявки

- CTA формы `Получить расчет в ₸` перенесен ниже всех полей.
- Текст `Ответим в течение 15 минут в рабочее время.` расположен сразу под кнопкой.
- Порядок закреплен через CSS `order`, потому что редакт-панель управляет порядком `label` внутри формы.
- Проверено: кнопка ниже последнего поля, note ниже кнопки, горизонтального overflow нет.

## Telegram Bot / Mini App module 2026-05-20

- Создана папка `BOT TG/` как отдельный модуль внутри репозитория сайта.
- Проанализирован и логически совмещен отдельный репозиторий `Telegram-bot-svet-`: его концепция перенесена как Flutter Web Telegram Mini App skeleton.
- Добавлены документы `BOT TG/README.md`, `BOT TG/INTEGRATION_ANALYSIS.md`, `BOT TG/API_CONTRACT.md`.
- Добавлен Flutter Mini App skeleton:
  - `BOT TG/pubspec.yaml`
  - `BOT TG/web/index.html`
  - `BOT TG/lib/main.dart`
  - `BOT TG/lib/models/work_object.dart`
  - `BOT TG/lib/services/mock_object_service.dart`
  - `BOT TG/lib/services/api_service.dart`
- Mini App сейчас mock-only: показывает список объектов, карточку объекта, статусы и базовые действия; backend-интеграция Mini App ещё не завершена.
- Добавлен backend Telegram-модуля в `BOT TG/backend/`:
  - `package.json`
  - `README.md`
  - `src/index.js`
  - `src/leads.routes.js`
  - `src/telegram.service.js`
  - `src/test-send.js`
- Backend использует Node.js/Express и переменные окружения `TG_KEY`, `OWNER_ID`, `MINI_APP_URL`.
- Добавлен `POST /api/leads`: принимает заявку, валидирует `name` и `phone`, нормализует данные и отправляет уведомление владельцу через Telegram Bot API.
- Добавлен smoke test `npm run test:telegram` через `src/test-send.js`.
- Текущий `OWNER_ID`: `477062399`.

## Telegram bot navigation and lead workflow 2026-05-20

- Добавлена внутренняя UX-навигация Telegram-бота:
  - главное меню;
  - новые заявки;
  - заявки в работе;
  - статистика;
  - сотрудники;
  - Mini App;
  - настройки;
  - постоянная нижняя клавиатура.
- Добавлены файлы:
  - `BOT TG/backend/src/leads.store.js`
  - `BOT TG/backend/src/employees.store.js`
  - `BOT TG/backend/src/bot-ui.service.js`
  - `BOT TG/backend/src/bot.routes.js`
- Добавлено временное in-memory хранилище заявок. После перезапуска backend заявки очищаются; это MVP, позже нужна база данных.
- Добавлены статусы заявок:
  - `new`
  - `in_work`
  - `reassigned`
  - `done`
  - `cancelled`
- Под сообщением заявки теперь предусмотрены кнопки:
  - `Взять в работу`
  - `Передать`
  - `WhatsApp`
  - `Позвонить`
  - `Статистика`
  - `Главное меню`
  - `Mini App`
- Добавлена базовая статистика заявок:
  - всего заявок;
  - новые;
  - в работе;
  - выполненные;
  - переназначенные;
  - отменённые.
- Добавлено переназначение заявки на mock-сотрудников из `employees.store.js`.
- Добавлен endpoint `POST /api/telegram/webhook` для обработки callback-кнопок и текстовых команд.
- Поддерживаемые команды:
  - `/start`
  - `/reload`
  - `reload`
  - `перезапуск`
  - `Главное меню`
  - `Статистика`
  - `Мини-Эпп`
- `/reload` не перезапускает Node.js процесс; он обновляет клавиатуру и возвращает пользователя в главное меню.
- Для полноценной обработки inline-кнопок после деплоя backend нужно установить Telegram webhook на публичный URL.

## RAG-база знаний

- Добавлена папка `docs/` как источник знаний.
- Добавлена папка `rag/` со скриптами `ingest.py`, `query.py`, `requirements.txt` и `README.md`.
- Используется стек ChromaDB + LangChain + sentence-transformers.
- `rag/chroma_db/`, `.venv`, `__pycache__` и Python-cache файлы исключены из Git.
- Добавлен документ `docs/telegram-bot-context.md` для фиксации текущего состояния Telegram-модуля.
- Обновлён `docs/project-context.md`, добавлена ссылка на Telegram-модуль и правила работы с `BOT TG/`.
- Для обновления локального векторного индекса нужно выполнить:

```powershell
cd C:\Users\user\Documents\Electro\rag
python ingest.py
```

## Проверки

- JS-синтаксис проверяется через `node --check script.js`.
- Backend Telegram-модуля проверяется через `npm run dev` из `BOT TG/backend`.
- Health check backend: `GET http://localhost:3000/health`.
- Telegram smoke test: `npm run test:telegram`.
- CSS/HTML изменения проверяются через локальный preview.
- После layout-правок нужно проверять desktop и mobile.
- Для Git перед коммитом используется `git diff --check`.

## Figma room animation calibration 2026-05-18

- Модель помещения переведена на `assets/figma-room/`, собранные из `Frame 369 (1).svg`.
- Все новые SVG-слои используют общий master `viewBox="0 0 2801 1796"`, поэтому светильники, окно, ambient glow и reflections выровнены через единую Figma-систему координат.
- В `styles.css` добавлен блок `/* Figma room layer coordinates */` и debug mode `body.debug-room-layers`.
- В `script.js` добавлены визуальные threshold-классы `energy-low`, `energy-mid`, `energy-high`, `energy-max`, `data-energy-level` и helper `window.setRoomLayerDebug()`.
- Добавлен недостающий `@keyframes securityBlink` для security markers.
- Создана карта координат `docs/figma-room-layer-coordinates.md`.
- Создан baseline/test harness `baselines/figma-room-animation-test/`.
- Бизнес-логика калькулятора и submit формы не менялись.

## Full audit and room animation QA 2026-05-20

- Проведен аудит текущего контекста, HTML/CSS/JS, RAG-документов, калькулятора, формы, админ-панели и Figma room animation.
- Исправлено: debug mode больше не показывает `.room-layer-label` постоянно и не форсит `opacity: 1` для `.room-security-dot`; подписи доступны только при hover/focus.
- Исправлено: premium теперь подсвечивает chip `security`, потому что premium включает полный набор room effects.
- Добавлено: `is-ev` получил CSS-состояние для EV charger без изменения бизнес-логики расчета.
- Убрано: `console.info("Lead payload")`, чтобы данные заявки не выводились в консоль; `window.lastLeadPayload` оставлен для QA.
- Обновлен cache-busting для `styles.css` и `script.js` до `20260520-1`.
- Проверено через browser QA: smart grid, security dots, decor layers и EV-state выключаются после снятия опций и ухода с premium; после settle opacity возвращается к базовым значениям.
- Проверено: форма создает `window.lastLeadPayload`, hidden fields заполнены, source остается `landing_calculator`.
- Проверено: desktop/tablet/mobile ширины `1440`, `768`, `390` без horizontal overflow.
- Проверено: baseline `baselines/figma-room-animation-test/` загружается, 18 изображений без broken assets.
- RAG обновлен новым документом `docs/project-audit-2026-05-20.md`; локальный индекс ChromaDB пересобирается через `rag/ingest.py`.
- RAG-скрипты переведены с deprecated imports на `langchain-chroma` и `langchain-huggingface`; `requirements.txt` обновлен.
