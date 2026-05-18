# Figma Room Assets

Дата обновления: 2026-05-18

Эта папка хранит локальные ассеты для новой модели помещения в калькуляторе.

## Слои

- `room-object.svg` - базовый объект/помещение без управляемых светильников.
- `light-main-224.svg` - основной длинный линейный свет.
- `window-corner.svg` - окно около рабочей зоны.
- `light-window-268.svg`, `light-window-271.svg`, `light-window-272.svg` - оконная/угловая световая группа.
- `light-decor-234.svg`, `light-decor-235.svg`, `light-decor-236.svg`, `light-decor-237.svg`, `light-decor-256.svg`, `light-decor-257.svg`, `light-decor-269.svg` - декоративные короткие светильники.
- `lights-all.svg`, `lights-all.png` - общий экспорт всех светильников, используется как референс для ручного совмещения.

## Логика сайта

- Базовое состояние показывает `room-object`, `lights-main` и `lights-window`.
- Опция `decorLight` включает слой `lights-decor`.
- Опция `smartHome` включает анимированные smart-линии поверх модели.
- Опция `cctv` включает маркеры камер.
- Пакет `premium` усиливает все ключевые визуальные слои.

Отдельные `Rectangle *.svg` были экспортированы с локальными `viewBox`, поэтому их позиционирование в CSS восстановлено вручную. Для более точного совпадения с Figma лучше экспортировать общий frame с группами `object`, `lights-main`, `lights-decor`, `lights-window`.
