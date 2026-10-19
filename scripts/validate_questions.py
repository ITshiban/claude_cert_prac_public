"""data/questions.json を検証し、件数とエラーを表示する。エラーがあれば終了コード1。

使い方: python scripts/validate_questions.py [path]
"""
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PATH = ROOT / "data" / "questions.json"

EXPECTED_SOURCES = {"practice": 35, "mock1": 15, "mock2": 15, "mock3": 15, "original": 20}
DOMAINS = {
    1: ("Prompting and Task Execution", 14),
    2: ("Output Evaluation and Validation", 21),
    3: ("Product and Model Selection", 12),
    4: ("Workflow Integration and Solution Design", 16),
    5: ("Configuration and Knowledge Management", 12),
    6: ("Governance, Risk, and Responsible Use", 15),
    7: ("Troubleshooting and Optimization", 10),
}
LANGS = ("en", "ja")
# 解説中の選択肢記号：(B) / (B, C) / **B**
REF = re.compile(r"\(([A-D](?:, [A-D])*)\)|\*\*([A-D])\*\*")


def refs(text):
    keys = []
    for m in REF.finditer(text):
        keys += (m.group(1) or m.group(2)).split(", ")
    return sorted(keys)


def check_question(q):
    """1問分のエラーメッセージのリストを返す。"""
    errors = []
    for field in ("id", "source", "source_url", "source_number", "domain", "type",
                  "question", "choices", "answer", "explanation"):
        if field not in q:
            errors.append(f"{field} がない")
    if errors:
        return errors

    if q["source"] not in EXPECTED_SOURCES:
        errors.append(f"source が不正: {q['source']}")
    if q["source"] == "original":
        if q["source_url"] is not None or q["source_number"] is not None:
            errors.append("original なのに source_url / source_number が null でない")
    elif not q["source_url"] or not isinstance(q["source_number"], int):
        errors.append("source_url / source_number がない")
    if q["domain"] not in DOMAINS:
        errors.append(f"domain が 1〜7 でない: {q['domain']}")

    keys = [c.get("key") for c in q["choices"]]
    if len(keys) != 4 or len(set(keys)) != 4:
        errors.append(f"choices の key が4つの異なる値でない: {keys}")
    missing = [a for a in q["answer"] if a not in keys]
    if missing:
        errors.append(f"answer が choices にない: {missing}")
    if len(set(q["answer"])) != len(q["answer"]):
        errors.append("answer が重複している")
    expected_n = {"single": 1, "multiple": 2}.get(q["type"])
    if expected_n is None:
        errors.append(f"type が不正: {q['type']}")
    elif len(q["answer"]) != expected_n:
        errors.append(f"type={q['type']} なのに answer が {len(q['answer'])} 個")

    for lang in LANGS:
        if not str(q["question"].get(lang, "")).strip():
            errors.append(f"question.{lang} が空")
        if not str(q["explanation"].get(lang, "")).strip():
            errors.append(f"explanation.{lang} が空")
        for c in q["choices"]:
            if not str(c.get(lang, "")).strip():
                errors.append(f"choices[{c.get('key')}].{lang} が空")
    if any(not str(q[f].get(l, "")).strip() for f in ("question", "explanation") for l in LANGS):
        return errors

    if q["type"] == "multiple":
        if "Choose two" not in q["question"]["en"] or "2つ選べ" not in q["question"]["ja"]:
            errors.append("multiple なのに問題文に Choose two / 2つ選べ がない")

    en_refs, ja_refs = refs(q["explanation"]["en"]), refs(q["explanation"]["ja"])
    if en_refs != ja_refs:
        errors.append(f"解説の選択肢記号が英日で一致しない: en={en_refs} ja={ja_refs}")
    bad = sorted(set(en_refs) - set(keys))
    if bad:
        errors.append(f"解説が存在しない選択肢を参照している: {bad}")
    if ("[Supplement]" in q["explanation"]["en"]) != ("【補足】" in q["explanation"]["ja"]):
        errors.append("補足（[Supplement] / 【補足】）が英日の片方にしかない")
    return errors


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PATH
    questions = json.loads(path.read_text(encoding="utf-8"))
    errors = []  # (id, message)

    total = len(questions)
    if total != sum(EXPECTED_SOURCES.values()):
        errors.append(("-", f"合計が {sum(EXPECTED_SOURCES.values())} 問でない: {total}"))
    ids = Counter(q.get("id") for q in questions)
    for qid, n in ids.items():
        if n > 1:
            errors.append((qid, f"ID が {n} 回重複"))
    for q in questions:
        for msg in check_question(q):
            errors.append((q.get("id", "?"), msg))

    by_source = Counter(q.get("source") for q in questions)
    for src, expected in EXPECTED_SOURCES.items():
        if by_source[src] != expected:
            errors.append(("-", f"{src} が {expected} 問でない: {by_source[src]}"))

    print(f"## 検証結果: {path.name}\n")
    print(f"合計: {total} 問\n")
    print("| 出典 | 件数 | 期待値 |")
    print("|---|---|---|")
    for src, expected in EXPECTED_SOURCES.items():
        print(f"| {src} | {by_source[src]} | {expected} |")

    by_domain = Counter(q.get("domain") for q in questions)
    print("\n| ドメイン | 件数 | 比率 | 配点比率 | 差 |")
    print("|---|---|---|---|---|")
    for d, (name, weight) in DOMAINS.items():
        ratio = by_domain[d] / total * 100 if total else 0
        print(f"| {d} {name} | {by_domain[d]} | {ratio:.0f}% | {weight}% | {ratio - weight:+.0f}pt |")

    by_type = Counter(q.get("type") for q in questions)
    print(f"\nsingle: {by_type['single']} / multiple: {by_type['multiple']}")

    print(f"\nエラー: {len(errors)} 件")
    for qid, msg in errors:
        print(f"- {qid}: {msg}")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
