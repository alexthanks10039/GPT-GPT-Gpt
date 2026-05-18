# VoltEdge Project Changelog

Дата обновления: 2026-05-17

Этот документ является частью RAG-базы знаний проекта. Он фиксирует важные решения, правки интерфейса и архитектурные изменения, чтобы Codex/AI мог учитывать текущий контекст без повторного анализа всего кода.

## Базовая структура проекта

- Проект перенесен в `C:\Users\user\Documents\Electro`.
- Подготовлен Git-репозиторий и remote GitHub `alexthanks10039/GPT-GPT-Gpt`.
- Основные файлы лендинга: `index.html`, `styles.css`, `script.js`.
- Лендинг работает как статический сайт без сборщика.
- Локальный preview запускается через HTTP server, текущий рабочий адрес: `http://127.0.0.1:4174/`.

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
- Отправка формы пока клиентская: backend/CRM не подключены.

## Форма заявки

- CTA формы `Получить расчет в ₸` перенесен ниже всех полей.
- Текст `Ответим в течение 15 минут в рабочее время.` расположен сразу под кнопкой.
- Порядок закреплен через CSS `order`, потому что редакт-панель управляет порядком `label` внутри формы.
- Проверено: кнопка ниже последнего поля, note ниже кнопки, горизонтального overflow нет.

## RAG-база знаний

- Добавлена папка `docs/` как источник знаний.
- Добавлена папка `rag/` со скриптами `ingest.py`, `query.py`, `requirements.txt` и `README.md`.
- Используется стек ChromaDB + LangChain + sentence-transformers.
- `rag/chroma_db/`, `.venv`, `__pycache__` и Python-cache файлы исключены из Git.
- Для обновления локального векторного индекса нужно выполнить:

```powershell
cd C:\Users\user\Documents\Electro\rag
python ingest.py
```

## Проверки

- JS-синтаксис проверяется через `node --check script.js`.
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
