# Figma Room Animation Documentation

Дата фиксации: 2026-05-17
Статус: test iteration fixed / текущий результат зафиксирован

## Краткое резюме

В калькулятор VoltEdge добавлена тестовая анимированная модель помещения, собранная из Figma SVG-слоев. Текущий результат фиксируется как рабочая итерация для дальнейшей доработки.

Есть известная проблема: положение части светильников и overlay-слоев требует дополнительной калибровки по Figma. На текущем этапе логика анимации, связь с калькулятором и структура ассетов считаются рабочими.

## Рабочий промт итерации

```text
Зафиксируй текущую тестовую итерацию Figma room animation в проекте VoltEdge.

Контекст:
В калькуляторе есть анимированная модель помещения, собранная из Figma SVG-слоев. Светильники, окно, reflection, ambient glow, smart grid и security dots управляются через существующий energyLevel калькулятора и классы состояния house-stage.

Важно:
- Не исправлять сейчас положение светильников.
- Не менять архитектуру калькулятора.
- Не переписывать проект на React.
- Зафиксировать текущую реализацию как рабочий baseline.
- Создать отдельную документацию в docs/ для RAG-массива.
- Описать все изменения, структуру файлов, текущую логику анимации, известные ограничения и следующий план доработки.
- Обновить changelog и RAG README.
- Проверить script.js через node --check.
- Отправить изменения в GitHub.
```

## Что реализовано

### 1. Замена старой CSS-модели дома

В блоке калькулятора старая CSS-модель `.house-model` заменена на layered room model:

```html
<div class="house-model room-model" data-house-model aria-label="Анимированная модель помещения из Figma">
  <img class="room-layer room-base" src="assets/figma-room/room-base.svg" alt="" loading="lazy" />
  ...
</div>
```

Теперь визуал не строится из абстрактных CSS-блоков дома, а использует подготовленные SVG-слои из Figma.

### 2. Добавлены Figma ассеты

Новая директория:

```text
assets/figma-room/
```

Текущий состав:

```text
room-base.svg
window-corner.svg
light-main-long.svg
light-strip-01.svg
light-strip-02.svg
light-strip-03.svg
light-strip-04.svg
light-left-01.svg
light-left-02.svg
light-diagonal-01.svg
light-diagonal-02.svg
light-corner-01.svg
light-small-01.svg
```

Назначение:

- `room-base.svg` - базовая сцена помещения без управляемого света.
- `window-corner.svg` - отдельный светящийся слой окна.
- `light-*` - отдельные фрагменты светильников и подсветок.

### 3. Сохранена текущая логика калькулятора

Калькулятор продолжает работать через существующие сущности:

```text
CALC_CONFIG
calculatorState
getEnergyLevel()
getCalculatorPayload()
updateHouseVisual()
```

Ключевой принцип:

```text
calculatorState -> getCalculatorPayload() -> energyLevel -> updateHouseVisual() -> CSS variables/classes -> room animation
```

### 4. Добавлены CSS-переменные для управления сценой

`updateHouseVisual()` передает в `.house-stage`:

```js
stage.style.setProperty("--energy", payload.energyLevel);
stage.style.setProperty("--light-strength", (payload.energyLevel / 100).toFixed(2));
```

CSS использует эти значения для:

- opacity;
- brightness;
- blur;
- drop-shadow;
- scale;
- отражений;
- ambient glow.

### 5. Добавлены классы энергетических порогов

В `script.js` добавлены bucket-классы:

```js
stage.classList.toggle("energy-low", payload.energyLevel >= 10);
stage.classList.toggle("energy-mid", payload.energyLevel >= 35);
stage.classList.toggle("energy-high", payload.energyLevel >= 65);
stage.classList.toggle("energy-max", payload.energyLevel >= 80);
```

Они нужны, чтобы включать группы света постепенно, а не просто делать один общий opacity.

### 6. Состояния калькулятора управляют эффектами

Используются существующие состояния:

```text
.is-smart
.is-decor
.is-security
.is-commercial
.is-outdoor
.is-premium
```

Привязка:

- `is-smart` - включает smart grid и диагональные световые слои.
- `is-decor` - усиливает декоративные strip lights.
- `is-security` - включает security dots.
- `is-commercial` - добавляет коммерческий drop-shadow/нагрузку.
- `is-outdoor` - зарезервировано под наружный/периметральный свет.
- `is-premium` - усиливает почти все визуальные слои.

## Как работает анимация

### Базовый слой

`room-base.svg` всегда видим. Это статическая основа помещения.

### Ambient glow

`.room-ambient` - общий мягкий свет сцены. Усиливается от `--light-strength`.

### Reflections

`.room-reflection-a` и `.room-reflection-b` создают отражения на полу. Они усиливаются вместе с `energyLevel`.

### Window glow

`.room-window` отвечает за отдельный свет окна. Усиливается через opacity, brightness и drop-shadow.

### Light overlays

Все `.room-light-*` лежат поверх базовой сцены и включаются по группам:

- main light - с `energy-mid`;
- strip lights - с `energy-high`, `is-decor`, `is-premium`;
- diagonal lights - с `energy-high`, `is-smart`, `is-premium`;
- left/corner/small lights - с `energy-max` или `is-premium`.

### Smart grid

`.room-smart-grid` появляется при `is-smart` или `is-premium`.

### Security dots

`.room-security-dot` появляется при `is-security` или `is-premium` и пульсирует через `@keyframes securityBlink`.

## Текущие известные ограничения

### 1. Позиционирование светильников не финальное

Часть SVG-светильников не идеально совпадает с базовой моделью помещения. Это ожидаемо для текущей тестовой итерации.

Причина:

- слои экспортированы из Figma как отдельные SVG;
- отдельные элементы имеют собственные viewBox/размеры;
- позиционирование сейчас сделано через CSS проценты, а не через единую SVG-систему координат.

### 2. Нет pixel-perfect slicing

Текущая реализация работает, но не является финальной Figma slicing-сборкой. Для идеальной точности лучше:

- привести все SVG к одному viewBox;
- экспортировать слои из одного master frame;
- либо собрать inline SVG с общими координатами.

### 3. Анимация пока production-lite

Сейчас анимация построена на CSS transitions и CSS variables. Это хорошо для статического проекта без сборщика, но при усложнении можно добавить более точный animation controller в `script.js`.

## Почему результат фиксируем

Текущая итерация доказывает, что архитектура работает:

- Figma SVG-слои подключаются;
- калькулятор управляет визуалом;
- energyLevel влияет на свет;
- форма продолжает получать расчетный payload;
- проект остается статическим без React/Vite;
- preview работает через обычный HTTP server.

## Как дорабатывать дальше

### Следующая итерация 1 - калибровка светильников

Нужно пройтись по каждому `.room-light-*` и уточнить:

```css
left
top
width
transform
```

Цель - совместить светильники с базовым `room-base.svg`.

### Следующая итерация 2 - master SVG export

Лучший вариант для точности:

1. В Figma создать один master frame.
2. Внутри него держать base, window, lights, reflections.
3. Экспортировать все слои из одного frame.
4. Сохранить единый viewBox.
5. В проекте использовать absolute overlays или inline SVG.

### Следующая итерация 3 - разделение света по смыслу

Световые группы можно привязать к опциям:

```text
Base package -> main ambient + window
Standard package -> main light + basic reflection
Premium package -> all lights + strong reflection + smart grid
DecorLight -> strip lights
SmartHome -> diagonal tech/grid lights
CCTV -> security dots
CommercialPower -> stronger scene energy/drop-shadow
OutdoorLight -> отдельный будущий perimeter layer
```

## Проверки

После текущей итерации нужно проверять:

```bash
node --check script.js
python -m http.server 8020
```

Открыть:

```text
http://127.0.0.1:8020/index.html#calculator
```

## Acceptance baseline текущей итерации

Текущий результат считается зафиксированным, если:

- калькулятор открывается;
- визуальная сцена отображается;
- SVG-слои не битые;
- при изменении опций меняется `energyLevel`;
- свет усиливается вместе с `energyLevel`;
- premium/smart/security/decor состояния включают дополнительные эффекты;
- submit формы не сломан;
- `script.js` проходит синтаксическую проверку.
## Calibration update 2026-05-18

- Новая калибровка выполнена по `Frame 369 (1).svg`.
- Слои перенесены из раннего `assets/figma/` в `assets/figma-room/`.
- Все новые SVG-ассеты используют общий `viewBox="0 0 2801 1796"`.
- Старый риск с отдельными локальными viewBox снят для текущей версии: CSS больше не подгоняет каждый светильник процентами, а фиксирует все overlay-слои full-frame.
- Актуальная карта координат: `docs/figma-room-layer-coordinates.md`.
- Debug mode: `?debugRoomLayers=1#calculator` или `window.setRoomLayerDebug(true)`.
