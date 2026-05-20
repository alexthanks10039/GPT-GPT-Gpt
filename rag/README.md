# Local RAG Knowledge Base

Локальная RAG-база знаний для проекта VoltEdge. Она индексирует документы из `../docs` в ChromaDB и возвращает релевантные фрагменты по вопросу.

## Структура

```text
docs/
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

## Установка

PowerShell:

```powershell
cd C:\Users\user\Documents\Electro\rag
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Первый запуск может скачать embedding-модель `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`. После этого индекс и модель можно использовать локально.

## Индексация документов

```powershell
python ingest.py
```

По умолчанию скрипт:

- читает `.md` и `.txt` из `../docs`
- режет документы на чанки
- создает embeddings
- сохраняет ChromaDB в `./chroma_db`

Повторный запуск пересобирает базу. Чтобы добавить документы без очистки базы:

```powershell
python ingest.py --append
```

## Поиск контекста

```powershell
python query.py "Как работает калькулятор освещения дома?"
```

JSON-вывод для интеграции с другим инструментом:

```powershell
python query.py "Что можно редактировать через панель?" --json
```

## Добавление знаний

Добавляй новые `.md` или `.txt` файлы в `../docs`, затем запускай:

```powershell
python ingest.py
```

Хорошие кандидаты для базы:

- новые ТЗ
- решения по дизайну
- правила редакт-панели
- баги и исправления
- требования к калькулятору
- промты и рабочие договоренности

После крупных UI/UX-правок обязательно обновляй `docs/project-context.md`, `docs/project-changelog.md` или отдельный audit-документ, а затем пересобирай индекс. Последний полный аудит проекта зафиксирован в `docs/project-audit-2026-05-20.md`.
