"""出典別の問題JSON（data/questions/*.json）を結合して data/questions.json を作る。

使い方: python scripts/merge_questions.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "data" / "questions"
OUT = ROOT / "data" / "questions.json"
ORDER = ["practice", "mock1", "mock2", "mock3", "original"]


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    questions = []
    for name in ORDER:
        path = SRC_DIR / f"{name}.json"
        if not path.exists():
            print(f"skip: {path.name} がありません")
            continue
        items = json.loads(path.read_text(encoding="utf-8"))
        print(f"{path.name}: {len(items)}問")
        questions.extend(items)
    questions.sort(key=lambda q: q["id"])
    OUT.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"-> {OUT.relative_to(ROOT)}: {len(questions)}問")


if __name__ == "__main__":
    main()
