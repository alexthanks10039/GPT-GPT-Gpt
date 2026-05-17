from __future__ import annotations

import argparse
import json
from pathlib import Path

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DB_DIR = Path(__file__).resolve().parent / "chroma_db"
COLLECTION_NAME = "voltedge_project_knowledge"
DEFAULT_EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Search local RAG context for a project question.")
    parser.add_argument("question", help="Question to search in the local project knowledge base.")
    parser.add_argument("--db-dir", type=Path, default=DEFAULT_DB_DIR, help="Local ChromaDB persistence folder.")
    parser.add_argument("--k", type=int, default=5, help="Number of chunks to return.")
    parser.add_argument("--model", default=DEFAULT_EMBEDDING_MODEL, help="SentenceTransformer embedding model.")
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON.")
    return parser.parse_args()


def format_result(index: int, document, score: float) -> str:
    source = document.metadata.get("source", "unknown")
    content = document.page_content.strip()
    return f"[{index}] {source} | score: {score:.4f}\n{content}"


def main() -> None:
    args = parse_args()
    db_dir = args.db_dir.resolve()

    if not db_dir.exists():
        raise SystemExit(f"Vector DB not found: {db_dir}\nRun: python ingest.py")

    embeddings = HuggingFaceEmbeddings(model_name=args.model)
    vector_store = Chroma(
        persist_directory=str(db_dir),
        embedding_function=embeddings,
        collection_name=COLLECTION_NAME,
    )

    results = vector_store.similarity_search_with_score(args.question, k=args.k)

    if args.json:
        payload = [
            {
                "rank": index,
                "score": score,
                "source": document.metadata.get("source", "unknown"),
                "content": document.page_content.strip(),
                "metadata": document.metadata,
            }
            for index, (document, score) in enumerate(results, start=1)
        ]
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return

    print(f"Question: {args.question}")
    print(f"Top chunks: {len(results)}")
    print()

    for index, (document, score) in enumerate(results, start=1):
        print(format_result(index, document, score))
        print("\n---\n")


if __name__ == "__main__":
    main()
