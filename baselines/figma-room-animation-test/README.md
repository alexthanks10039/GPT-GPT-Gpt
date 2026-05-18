# Figma room animation baseline

Date: 2026-05-18

This baseline exists because the original `baselines/figma-room-animation-test/README.md` was not present in the project. It is a small static test harness for the calculator room animation.

## What it verifies

- All room layers load from `assets/figma-room/`.
- The full-frame shared `viewBox 0 0 2801 1796` alignment keeps lights and reflections locked to the base room.
- The same state classes used by the calculator can be toggled without changing business logic.
- Debug outlines and labels work through `body.debug-room-layers`.

## Files

- `index.html` - standalone layer/state harness.
- Main implementation - `index.html`, `styles.css`, `script.js` in project root.
- Coordinate map - `docs/figma-room-layer-coordinates.md`.

## Run

From the project root:

```powershell
python -m http.server 4174
```

Open:

```text
http://127.0.0.1:4174/baselines/figma-room-animation-test/
```

Debug mode in the main landing:

```text
http://127.0.0.1:4174/?debugRoomLayers=1#calculator
```

## Baseline states

The baseline page provides buttons for:

- Base
- Smart
- Decor
- Security
- Commercial
- Premium
- Debug

It also provides an energy slider so the thresholds `0`, `10`, `20`, `35`, `50`, `65`, `80`, `95`, and `100` can be inspected quickly.
