"""出題・採点ロジック（Streamlit に依存しない純粋な関数）。"""
import json
import random
import re
from pathlib import Path

QUESTIONS_PATH = Path(__file__).resolve().parent / "data" / "questions.json"

DOMAINS = {
    1: "Prompting and Task Execution",
    2: "Output Evaluation and Validation",
    3: "Product and Model Selection",
    4: "Workflow Integration and Solution Design",
    5: "Configuration and Knowledge Management",
    6: "Governance, Risk, and Responsible Use",
    7: "Troubleshooting and Optimization",
}
SOURCE_GROUPS = ["practice", "mock", "original"]
STATUSES = ["correct", "incorrect", "unanswered"]
MODES = ["random", "unanswered", "incorrect"]

# 解説中の選択肢記号：(B) / (B, C) / **B**
_REF = re.compile(r"\(([A-D](?:, [A-D])*)\)|\*\*([A-D])\*\*")


def load_questions(path=QUESTIONS_PATH):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def source_group(question):
    """mock1〜3 をまとめて "mock" として扱う。"""
    return "mock" if question["source"].startswith("mock") else question["source"]


def filter_questions(questions, domains=None, source_groups=None):
    """ドメイン・出典グループで絞り込む。None は絞り込みなし。"""
    return [
        q for q in questions
        if (domains is None or q["domain"] in domains)
        and (source_groups is None or source_group(q) in source_groups)
    ]


def select_questions(questions, count, mode, statuses, rng=random):
    """出題する問題を最大 count 問、重複なしで選ぶ。

    mode: "random"（全体からランダム）/ "unanswered"（未回答のみ）/ "incorrect"（不正解のみ）
    statuses: {question_id: status}。記録がない問題は未回答扱い。
    候補が count より少なければ、ある分だけ返す。
    """
    if mode not in MODES:
        raise ValueError(f"unknown mode: {mode}")
    if mode == "random":
        pool = list(questions)
    else:
        pool = [q for q in questions if statuses.get(q["id"], "unanswered") == mode]
    return rng.sample(pool, min(count, len(pool)))


def shuffled_keys(question, rng=random):
    """選択肢の表示順（key のリスト）をシャッフルして返す。"""
    keys = [c["key"] for c in question["choices"]]
    rng.shuffle(keys)
    return keys


def display_labels(order):
    """表示順の key リストから {key: 表示番号} を作る。"""
    return {key: str(i) for i, key in enumerate(order, start=1)}


def is_correct(question, selected):
    """選んだ key の集合が正解と完全一致すれば正解。"""
    return set(selected) == set(question["answer"])


def relabel(text, labels):
    """解説中の元の選択肢記号を表示番号に置き換える。(B, C) は表示番号順に並べ替える。"""
    def repl(m):
        if m.group(1):
            nums = sorted(labels[k] for k in m.group(1).split(", "))
            return f"({', '.join(nums)})"
        return f"**{labels[m.group(2)]}**"
    return _REF.sub(repl, text)


def domain_accuracy(history, questions):
    """回答履歴の全回答を母数に、ドメインごとの (正解数, 回答数) を返す。"""
    domain_of = {q["id"]: q["domain"] for q in questions}
    result = {d: [0, 0] for d in DOMAINS}
    for row in history:
        d = domain_of.get(row["question_id"])
        if d is None:
            continue
        result[d][1] += 1
        result[d][0] += int(bool(row["is_correct"]))
    return {d: tuple(v) for d, v in result.items()}


def status_counts(questions, statuses):
    counts = {s: 0 for s in STATUSES}
    for q in questions:
        counts[statuses.get(q["id"], "unanswered")] += 1
    return counts
