# RAG Active 00 - Core Current

Status: active source of truth
Updated: 2026-05-20
Project: VoltEdge / Svet

## Purpose

VoltEdge is a static landing page for electrical installation services in Almaty and Almaty region.

The main business flow:

```text
Offer -> calculator -> lead form -> owner notification -> later CRM / Telegram Mini App
```

## Current product priorities

1. Keep the landing stable.
2. Keep the calculator as the main interactive conversion block.
3. Send prepared lead data to backend.
4. Notify owner in Telegram.
5. Add Telegram Mini App functionality after owner notifications work.

## Current architecture

Main website files:

- `index.html` - landing sections, calculator, form, edit panel.
- `styles.css` - visual system, responsive layout, calculator, room animation, editor UI.
- `script.js` - calculator state, animations, form payload, site settings, editor panel.

Telegram/backend module:

- `BOT TG/` - isolated Telegram Mini App and backend module inside the main repository.
- `BOT TG/backend/` - Node.js + Express backend for leads and Telegram notifications.
- `BOT TG/lib/` - Flutter Mini App skeleton.

## Stable project rules

- Do not rewrite the project from scratch.
- Do not migrate to React/Vite unless explicitly required.
- Preserve the static website architecture.
- Extend existing structures instead of duplicating admin/edit panels.
- Use `siteSettings`, `BLOCK_SCHEMA`, and `CALC_CONFIG` for configurable changes.
- Preserve the user flow: offer -> calculator -> lead form.
- Before production, disable temporary development bypasses.

## Current risk map

High priority risks:

- Website form still prepares `leadPayload`, but the site-side `fetch` to backend is not connected yet.
- `DEV_AUTH_BYPASS = true` is temporary and must be disabled before production.
- Telegram object routes are planned, but not implemented yet.
- Owner-only access guard exists, but must be connected to future object routes.

## RAG process rule

Use `docs/rag-active/` as the default AI retrieval layer.

Use older documents only when historical detail is needed:

- `docs/project-changelog.md`
- `docs/project-audit-2026-05-20.md`
- `docs/figma-svg-animation-plan.md`
- `docs/figma-room-animation.md`
- `Telegram-bot-svet-/rag/project-context.md`

Those files are preserved as source/history, not deleted.
