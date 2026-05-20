# VoltEdge Full Audit 2026-05-20

Этот документ добавлен в RAG-базу знаний после полного аудита проекта, чтобы следующий Codex/AI видел актуальный контекст без повторного восстановления истории из чата.

## Scope

Проверены:

- текущий контекст чата и пользовательские замечания;
- `git status`, текущий diff и структура файлов;
- `index.html`, `styles.css`, `script.js`;
- `docs/project-context.md`, `docs/project-changelog.md`, `docs/figma-svg-animation-plan.md`, `docs/figma-room-animation.md`, `docs/figma-room-layer-coordinates.md`;
- `rag/README.md`, `rag/ingest.py`, `rag/query.py`;
- `assets/figma-room/*`;
- baseline `baselines/figma-room-animation-test/`;
- локальный preview `http://127.0.0.1:4174/`.

## Architecture

Проект остается статическим лендингом без сборщика. Главные файлы:

- `index.html` - секции лендинга, калькулятор, форма, edit/admin panel;
- `styles.css` - визуальная система, адаптив, калькулятор, Figma room animation, editor UI;
- `script.js` - motion presets, calculator state, payload, form submit, `siteSettings`, admin panel.

Источник правды для редактируемых данных:

- `defaultSettings`
- `siteSettings`
- `localStorage`
- `BLOCK_SCHEMA`
- `CALC_CONFIG`

## Findings

### Исправлено

- Debug mode room animation раньше показывал `.room-layer-label` постоянно и форсил `opacity: 1` для `.room-security-dot`. Из-за этого выключенные слои выглядели активными. Исправлено: подписи показываются только при hover/focus, security dots не включаются debug-режимом.
- `evCharger` добавлял класс `is-ev`, но CSS-состояния для него не было. Добавлен визуальный отклик через left/technical light group и floor reflection.
- Premium визуально включал security dots, но chip `Камеры` не подсвечивался. Теперь chip `security` активен при `cctv` или premium.
- В админке оставался backdrop blur. Убрано через `backdrop-filter: none` для `.editor-backdrop`, `.editor-login`, `.editor-panel`.
- `console.info("Lead payload")` выводил данные заявки в консоль. Удалено, `window.lastLeadPayload` сохранен для QA.
- Обновлен cache-busting: `styles.css?v=20260520-1`, `script.js?v=20260520-1`.
- RAG-скрипты давали LangChain deprecation warnings. Исправлено: `Chroma` импортируется из `langchain_chroma`, `HuggingFaceEmbeddings` из `langchain_huggingface`, ручной `persist()` удален.

### Подтверждено

- Калькулятор строит visual state как derived state от `calculatorState` и `getCalculatorPayload()`.
- После rapid switching и settle smart grid, security dots, decor layers и EV-state возвращаются к базовым opacity.
- `premium` включает smart/decor/security visual effects.
- Уход с premium выключает лишние эффекты, если соответствующие extras не выбраны.
- Debug mode может оставаться включенным через URL или editor setting, но не должен показывать скрытые слои как активные.
- Форма не отправляет данные на backend; submit готовит payload, hidden fields и `window.lastLeadPayload`.

## Browser QA Result

Проверено через headless Chrome/Playwright на локальном сервере `127.0.0.1:4174`.

Сценарии:

- initial calculator state;
- package switching `standard -> premium -> base`;
- extras: `smartHome`, `decorLight`, `cctv`, `evCharger`;
- rapid package switching;
- debug mode `?debugRoomLayers=1`;
- responsive widths `1440`, `768`, `390`;
- lead form submit;
- baseline page.

Результаты:

- console errors: `0`;
- horizontal overflow: `0` на `1440`, `768`, `390`;
- initial debug: `.room-smart-grid` opacity `0`, `.room-security-dot` opacity `0`, labels opacity `0`;
- premium settled: smart grid opacity около `0.49`, security opacity `1`, decor opacity `1`;
- premium + all extras settled: smart grid opacity около `0.72`, EV opacity около `0.7`;
- base cleared settled: smart grid opacity `0`, security opacity `0`, decor opacity `0.08`, EV opacity `0.08`;
- lead submit: `window.lastLeadPayload` создан, `estimatedPrice` заполнен, breakdown есть, source `landing_calculator`;
- baseline: 18 images, broken assets `0`, `.room-model` найден.

## Checks

Обязательные команды:

```powershell
C:\Users\user\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe --check script.js
git diff --check
python -m py_compile rag\ingest.py rag\query.py
```

Обычный `node.exe` из PATH может вернуть `Access is denied`, поэтому для проверки используется bundled Node из Codex runtime.

## RAG Notes

- `rag/.venv` создан локально и исключен из Git.
- `rag/chroma_db` пересобран локально и исключен из Git.
- `rag/requirements.txt` теперь включает `langchain-chroma` и `langchain-huggingface`.
- Для актуализации индекса после этого аудита запускать:

```powershell
cd C:\Users\user\Documents\Electro\rag
.\.venv\Scripts\python ingest.py
```

## Remaining Risks

- `DEV_AUTH_BYPASS = true` остается временным dev-решением. Перед production вернуть `false`.
- Backend/CRM для формы не подключены; текущая отправка клиентская.
- Security dots остаются CSS-маркерами. Если Figma позже даст реальные camera layers, заменить dots на SVG-слои.
- Smart dashed grid нарисован кодом, а не экспортирован из Figma; его траекторию можно донастроить отдельно, если появится Figma route layer.
