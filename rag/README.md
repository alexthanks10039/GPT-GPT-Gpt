# Local RAG Knowledge Base

Локальная RAG-база знаний для проекта VoltEdge.

С 2026-05-20 RAG реструктурирован на слои: активный контекст, архив/история и runbook.

## Главный принцип

```text
active RAG = текущие решения и источник правды
archive/source docs = история, аудиты, старые итерации
runbook = локальные команды и операционные инструкции
```

Данные не удаляются. Старые документы остаются в проекте, но больше не должны шуметь в основном retrieval.

## Структура

```text
docs/
  rag-active/
    README.md
    00-core-current.md
    10-website-calculator-current.md
    20-telegram-backend-current.md
    30-room-animation-current.md
    40-local-runbook.md
  project-context.md
  project-changelog.md
  project-audit-2026-05-20.md
  figma-svg-animation-plan.md
  figma-room-animation.md
  figma-room-layer-coordinates.md
rag/
  ingest.py
  query.py
  requirements.txt
  chroma_db/        # создается автоматически и не коммитится
```

## Что индексируется по умолчанию

По умолчанию `ingest.py` индексирует только:

```text
docs/rag-active/
```

Это сделано, чтобы AI/Codex получал актуальный контекст без лишнего шума из changelog, audit и старых Figma-документов.

## Установка

PowerShell:

```powershell
cd C:\Users\user\Documents\Electro\rag
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Первый запуск может скачать embedding-модель `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. После этого индекс и модель можно использовать локально.

## Индексация активного RAG

```powershell
python ingest.py
```

По умолчанию скрипт:

- читает `.md` и `.txt` из `../docs/rag-active`
- режет документы на чанки
- создает embeddings
- сохраняет ChromaDB в `./chroma_db`

## Индексация полного исторического контекста

Если нужно временно проиндексировать всю историю проекта:

```powershell
python ingest.py --docs-dir ../docs
```

Использовать только для аудита, расследования старых решений или восстановления истории.

## Поиск контекста

```powershell
python query.py "Как подключить форму сайта к Telegram backend?"
```

JSON-вывод:

```powershell
python query.py "Что сейчас является source of truth для Telegram backend?" --json
```

## Как добавлять знания

Для текущего актуального контекста добавляй или обновляй файлы в:

```text
docs/rag-active/
```

Для истории, аудитов и подробных отчётов можно использовать обычные `docs/*.md`, но они не должны попадать в активный retrieval по умолчанию.

## Важное замечание по Telegram/backend

Актуальный Telegram/backend контекст теперь лежит в:

```text
docs/rag-active/20-telegram-backend-current.md
```

Старый файл:

```text
Telegram-bot-svet-/rag/project-context.md
```

считается историческим и не должен перебивать текущую owner-only + Node.js/Express логику.

## Проверки

```powershell
python -m py_compile rag\ingest.py rag\query.py
```

После крупных изменений RAG обновляй активный слой и пересобирай индекс:

```powershell
python ingest.py
```
