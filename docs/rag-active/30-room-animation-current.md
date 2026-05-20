# RAG Active 30 - Room Animation Current

Status: active source of truth
Updated: 2026-05-21
Scope: calculator room animation, Figma layers, visual states

## Current implementation

The calculator visual uses Figma room animation layers from:

```text
assets/figma-room/
```

The current implementation uses a shared Figma coordinate system.

Master viewBox:

```text
0 0 2801 1796
```

All active overlay SVG layers should keep this same viewBox.

## Important principle

Do not return to the old approach where every SVG light had a local viewBox and was positioned manually by CSS percentages.

Current preferred approach:

```text
one master Figma frame
-> layers exported with shared viewBox
-> full-frame overlays pinned to the room
```

## Main selectors

- `.house-stage`
- `[data-house-stage]`
- `.house-model`
- `[data-house-model]`
- `.room-model`
- `.room-layer`
- `.room-base`
- `.room-window`
- `.room-ambient`
- `.room-light-main`
- `.room-light-strip-*`
- `.room-light-left-*`
- `.room-light-diagonal-*`
- `.room-light-corner-*`
- `.room-light-small-*`
- `.room-reflection-*`
- `.room-smart-grid`
- `.room-security-dot`

## Visual state classes

Energy buckets:

- `energy-low`
- `energy-mid`
- `energy-high`
- `energy-max`

Feature states:

- `is-smart`
- `is-decor`
- `is-security`
- `is-commercial`
- `is-outdoor`
- `is-ev`
- `is-premium`

## Calculator mapping

- `smartHome` -> smart grid, diagonal/corner smart lights, smart pulse.
- `decorLight` -> decor strips and related floor reflection.
- `cctv` -> security dots.
- `commercialPower` -> stronger main/ambient light.
- `outdoorLight` -> reuses perimeter/decor visual state.
- `evCharger` -> `is-ev`, boosts left/technical lights and floor reflection.
- `premium` -> strongest combined state, includes smart/decor/security visual effects.

## Debug mode

Debug mode can be enabled by URL or console helper:

```text
?debugRoomLayers=1#calculator
?roomDebug=1#calculator
```

```js
window.setRoomLayerDebug(true)
window.setRoomLayerDebug(false)
```

Debug mode must not force hidden layers to become visually active.

Layer labels should appear only on hover/focus.

## Current technical fix

`smart-pulse` must be inactive by default:

```text
.smart-pulse -> opacity: 0; animation: none
```

Only `.house-stage.is-smart` and `.house-stage.is-premium` may enable the `smartPulse` keyframes. This prevents the smart pulse from staying visible in base/off states while the keyframe animation overrides base opacity.

`room-smart-grid` must also be inactive by default:

```text
.room-smart-grid -> opacity: 0; visibility: hidden
.room-smart-grid path -> animation: none
```

Only `.house-stage.is-smart` and `.house-stage.is-premium` may show the grid and run `lineFlow`. This keeps debug/base states from showing a permanent smart grid.

## Edit panel controls

Room animation settings live under:

```text
siteSettings.calculator.visual.animation
```

Examples:

- transition duration
- inactive opacity
- active opacity
- smart opacity
- decor glow
- animation speeds
- thresholds
- debug mode

## Current source of detailed coordinates

Use this file only for layer-level tasks:

```text
docs/figma-room-layer-coordinates.md
```

## Historical files

These files contain useful history but should not override this current context:

- `docs/figma-svg-animation-plan.md`
- `docs/figma-room-animation.md`
- `docs/project-audit-2026-05-20.md`

They include old export limitations and QA notes. Keep them as history, not primary context.
