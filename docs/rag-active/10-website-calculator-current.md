# RAG Active 10 - Website and Calculator Current

Status: active source of truth
Updated: 2026-05-21
Scope: landing page, calculator, lead form, edit panel, room animation

## Website role

The website is the public conversion layer.

Main job:

```text
Explain service -> build trust -> calculate estimated price -> collect lead
```

## Calculator

The calculator is controlled by:

- `CALC_CONFIG`
- `calculatorState`
- `getEstimateBreakdown()`
- `calculateEstimate()`
- `getCalculatorPayload()`
- `renderCalculator()`

User inputs:

- property type
- area
- rooms or zones
- renovation type
- service package
- extra options
- timeline

The estimate uses base rate, package coefficient, renovation coefficient, extra option costs and timeline coefficient.

## Calculator payload

The form submit process uses the latest calculator payload.

Important fields:

- `calculatorPayload`
- `estimatedPrice`
- `calculatorArea`
- `calculatorOptions`
- `calculatorBreakdown`
- `calculatedAt`
- `leadSource`
- `window.lastLeadPayload` for QA

## Website/backend bridge

Current state:

```text
lead form submit -> leadPayload is prepared -> POST /api/leads -> UI success/warning/error message
```

Default local request:

```js
await fetch('http://localhost:3000/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(leadPayload),
});
```

The endpoint is configurable through `siteSettings.integrations.leadApiUrl` and the edit panel `Lead API URL` field.

Payload sent to backend includes:

- `name`
- `phone`
- `service`
- `objectType`
- `address`
- `calculatorData`
- `calculatedPrice`
- `source`
- `sourcePage`

Compatibility/QA fields remain in `window.lastLeadPayload` and hidden form inputs.

Response handling:

- `201`: lead sent and Telegram notification sent.
- `202`: lead accepted, Telegram notification needs attention.
- network/error/timeout: keep form values and show a real error, not a fake success.

`sendLeadPayload()` uses a request timeout so the submit button cannot remain disabled forever when the local backend is not running or does not answer.

## Edit panel

The edit panel is built into the website and controlled by `script.js`.

Source of truth:

- `defaultSettings`
- `siteSettings`
- `localStorage`
- `BLOCK_SCHEMA`

Rules:

- Do not create a second admin panel.
- Extend the current edit panel.
- For new editable blocks, extend `BLOCK_SCHEMA`.
- For calculator settings, use `siteSettings.calculator` and `CALC_CONFIG`.

Temporary development note:

- `DEV_AUTH_BYPASS = true` is enabled for development.
- Set it to `false` before production.

## Room animation current state

The calculator visual uses Figma room animation layers from `assets/figma-room/`.

Important classes and state:

- `.house-stage`
- `.room-model`
- `.room-layer`
- `.room-light-*`
- `.room-window`
- `.room-reflection-*`
- `.room-ambient`
- `.room-smart-grid`
- `.room-security-dot`
- `energy-low`, `energy-mid`, `energy-high`, `energy-max`
- `is-smart`, `is-decor`, `is-security`, `is-commercial`, `is-outdoor`, `is-ev`, `is-premium`

The room visual must stay derived from `calculatorState` and `getCalculatorPayload()`.

No old visual classes should remain stuck after rapid interactions.

## What not to index as active calculator context

These are history/debug details and should not drive normal implementation:

- old separate Figma SVG export limitations
- local QA opacity values
- browser audit numbers
- cache-busting version numbers
- old localhost preview URLs
