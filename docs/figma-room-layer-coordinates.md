# Figma room layer coordinates

Date: 2026-05-18
Source frame: `C:/Users/user/Downloads/Frame 369 (1).svg`
Master viewBox: `0 0 2801 1796`

## Principle

The current room animation uses a shared Figma coordinate system. Every exported overlay in `assets/figma-room/` keeps the same `viewBox="0 0 2801 1796"` as the base room. Because of that, CSS does not manually offset each light anymore. All SVG overlays are pinned to the full room frame, and the exact light/reflection geometry remains inside the source SVG layer.

This replaces the earlier manual percentage positioning from the first separate SVG export, where individual files had their own local viewBoxes and could drift away from the room.

## Coordinate map

| Layer | Selector | left | top | width | height | transform | trigger | Notes |
|---|---|---:|---:|---:|---:|---|---|---|
| Base room | `.room-base` | 0 | 0 | 100% | 100% | `none` | always | Source keeps full room without dynamic light overlays. |
| Ambient glow | `.room-ambient` | 0 | 0 | 100% | 100% | `none` | `--light-strength` | Source id `Vector 21`; global soft glow over the scene. |
| Window | `.room-window` | 0 | 0 | 100% | 100% | `none` | always + energy | Source id `Окно`; aligned to the work desk/window corner. |
| Main long light | `.room-light-main` | 0 | 0 | 100% | 100% | `none` | energy + commercial/premium | Source id `Rectangle 224`; long right-side strip along the wall/bed line. |
| Strip 01 | `.room-light-strip-01` | 0 | 0 | 100% | 100% | `none` | decor/outdoor/premium | Source group `Светильние`; short decorative light group. |
| Strip 02 | `.room-light-strip-02` | 0 | 0 | 100% | 100% | `none` | decor/outdoor/premium | Source id `Rectangle 236`; decor short light. |
| Strip 03 | `.room-light-strip-03` | 0 | 0 | 100% | 100% | `none` | decor/outdoor/premium | Source id `Rectangle 237`; decor short light. |
| Strip 04 | `.room-light-strip-04` | 0 | 0 | 100% | 100% | `none` | decor/outdoor/premium | Source id `Rectangle 234`; decor short light. |
| Left vertical 01 | `.room-light-left-01` | 0 | 0 | 100% | 100% | `none` | decor/premium/max energy | Source id `Rectangle 254`; vertical line on left architectural edge. |
| Left vertical 02 | `.room-light-left-02` | 0 | 0 | 100% | 100% | `none` | decor/premium/max energy | Source id `Rectangle 269`; user classified as `lights-decor`. |
| Diagonal smart 01 | `.room-light-diagonal-01` | 0 | 0 | 100% | 100% | `none` | smart/premium | Source id `Rectangle 268`; smart/tech light near desk area. |
| Diagonal smart 02 | `.room-light-diagonal-02` | 0 | 0 | 100% | 100% | `none` | smart/premium | Source id `Rectangle 271`; smart/tech light near desk area. |
| Corner smart light | `.room-light-corner-01` | 0 | 0 | 100% | 100% | `none` | smart/premium | Source id `Rectangle 272`; corner/window-adjacent light. |
| Small decor 01 | `.room-light-small-01` | 0 | 0 | 100% | 100% | `none` | decor/premium/max energy | Source id `Rectangle 256`; user classified as `lights-decor`. |
| Small decor 02 | `.room-light-small-02` | 0 | 0 | 100% | 100% | `none` | decor/premium/max energy | Source id `Rectangle 257`; user classified as `lights-decor`. |
| Bed/floor reflection | `.room-reflection-a` | 0 | 0 | 100% | 100% | `none` | decor/outdoor/premium | Source id `Rectangle 327_2`; reflection under active decorative strips. |
| Window reflection | `.room-reflection-b` | 0 | 0 | 100% | 100% | `none` | smart/premium | Source id `Rectangle 324`; reflection below work/window light. |
| Floor reflection | `.room-reflection-c` | 0 | 0 | 100% | 100% | `none` | energy | Source id `Vector 59`; base floor reflection, synced with `--light-strength`. |
| Smart dashed grid | `.room-smart-grid` | 0 | 0 | 100% | 100% | `none` | smart/premium | Inline SVG paths use the same `2801x1796` coordinate system. |
| Security dot A | `.room-security-dot-a` | 55.2% | 44.2% | 10px | 10px | `none` | security/premium | CSS marker near the middle work zone. |
| Security dot B | `.room-security-dot-b` | 73.7% | 49.5% | 10px | 10px | `none` | security/premium | CSS marker near the right room zone. |
| Smart pulse | `.smart-pulse` | 49% | 39% | 16% | 22% | `rotate(-8deg)` | smart/premium | CSS-only pulse, not from Figma. |

## Animation states

- `energy-low`: `energyLevel >= 10`
- `energy-mid`: `energyLevel >= 35`
- `energy-high`: `energyLevel >= 65`
- `energy-max`: `energyLevel >= 80`
- `is-smart`: enables smart grid, diagonal/corner lights, and smart pulse.
- `is-decor`: enables decorative short lights and related floor reflection.
- `is-security`: enables security dots.
- `is-commercial`: boosts main/ambient light without changing calculator logic.
- `is-outdoor`: reuses decorative strips for perimeter/outdoor visual state.
- `is-premium`: enables the strongest combined visual state.

## Debug mode

Use either URL parameter:

```text
http://127.0.0.1:4174/?debugRoomLayers=1#calculator
http://127.0.0.1:4174/?roomDebug=1#calculator
```

or console helper:

```js
window.setRoomLayerDebug(true)
window.setRoomLayerDebug(false)
```

The debug mode adds dashed outlines to `.room-layer` and reveals `.room-layer-label` labels.

## Interaction notes

Issues found:

- The previous separate SVG export used inconsistent local viewBoxes, so lights could not be reliably aligned with only CSS percentages.
- `securityBlink` was referenced by `.room-security-dot` but did not have a keyframes definition.
- Energy threshold classes existed in CSS intent, but `updateHouseVisual()` did not expose all threshold buckets to the stage.

Fixes applied:

- Rebuilt room overlays from one master Figma frame, preserving a shared `2801x1796` coordinate system.
- Added the `/* Figma room layer coordinates */` CSS block with full-frame pinned layers.
- Added `data-energy-level`, `energy-low`, `energy-mid`, `energy-high`, and `energy-max` in `updateHouseVisual()`.
- Added debug layer mode via URL and `window.setRoomLayerDebug()`.
- Added `@keyframes securityBlink`.

Manual Figma calibration still worth checking later:

- Exact semantic grouping of `Rectangle 268`, `271`, and `272` between `lights-window` and smart/tech light can be refined if the Figma layer names are cleaned up.
- Security dots are CSS markers, not exported camera SVG elements. If real camera layers are exported later, replace the dots with those grouped SVG assets.
- Smart dashed grid is intentionally code-generated so it can animate; its paths can be re-shaped if a Figma-drawn smart route is exported.
