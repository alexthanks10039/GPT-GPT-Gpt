# Active RAG Layer

Status: default retrieval layer
Updated: 2026-05-20

## Purpose

This folder is the clean active RAG layer for daily AI/Codex work.

It contains current source-of-truth summaries and intentionally excludes historical noise, old experiments, detailed QA logs and deprecated implementation paths.

## Files

```text
00-core-current.md
10-website-calculator-current.md
20-telegram-backend-current.md
30-room-animation-current.md
40-local-runbook.md
```

## How to use

Default RAG indexing should use this folder:

```bash
python rag/ingest.py
```

For historical analysis, manually index the full `docs/` folder or read archived files directly.

## What stays outside active RAG

The following files are preserved but should be treated as history/source material:

- `docs/project-context.md`
- `docs/project-changelog.md`
- `docs/project-audit-2026-05-20.md`
- `docs/figma-svg-animation-plan.md`
- `docs/figma-room-animation.md`
- `docs/figma-room-layer-coordinates.md`
- `BOT TG/rag/telegram-backend-rag.json`
- `Telegram-bot-svet-/rag/project-context.md`

Important: data is not deleted. It is layered.

## Layering principle

```text
active RAG = current decisions
archive/source docs = history and evidence
runbook = local commands and operations
```
