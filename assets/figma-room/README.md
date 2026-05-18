# Figma room assets

Date: 2026-05-18

These assets are extracted from `C:/Users/user/Downloads/Frame 369 (1).svg`.

Every layer keeps the master `viewBox="0 0 2801 1796"`. This is intentional: the HTML/CSS layer wrappers can stay pinned to `left: 0; top: 0; width: 100%; height: 100%`, while Figma geometry inside each SVG controls the exact light position.

## Core files

- `room-frame-master.svg` - untouched master export reference.
- `room-base.svg` - room without dynamic window/light/reflection overlays.
- `room-window.svg` - window/work-zone light.
- `ambient-glow.svg` - global ambient glow.
- `light-main-long.svg` - main long strip.
- `light-strip-01.svg` to `light-strip-04.svg` - decorative short strips.
- `light-left-01.svg`, `light-left-02.svg` - left/architectural edge lights.
- `light-diagonal-01.svg`, `light-diagonal-02.svg`, `light-corner-01.svg` - smart/window-adjacent light overlays.
- `light-small-01.svg`, `light-small-02.svg` - decorative short lights.
- `reflection-bed.svg`, `reflection-window.svg`, `reflection-floor.svg` - synced reflection overlays.

Coordinate and trigger details are documented in `docs/figma-room-layer-coordinates.md`.
