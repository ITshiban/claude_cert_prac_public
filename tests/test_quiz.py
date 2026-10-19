import random

import pytest

import quiz


def make_q(qid, answer=("A",), domain=1, source="practice"):
    return {
        "id": qid,
        "source": source,
        "domain": domain,
        "type": "single" if len(answer) == 1 else "multiple",
        "choices": [{"key": k} for k in "ABCD"],
        "answer": list(answer),
    }


@pytest.fixture
def questions():
    return [make_q(f"Q{i:03d}", domain=i % 7 + 1) for i in range(1, 31)]


# --- 採点 ---

def test_single_correct():
    assert quiz.is_correct(make_q("Q1", ("B",)), ["B"])


def test_single_wrong():
    assert not quiz.is_correct(make_q("Q1", ("B",)), ["C"])


def test_multiple_exact_match_in_any_order():
    q = make_q("Q1", ("A", "C"))
    assert quiz.is_correct(q, ["A", "C"])
    assert quiz.is_correct(q, ["C", "A"])


@pytest.mark.parametrize("selected", [["A"], ["C"], ["A", "B"], ["A", "C", "D"], []])
def test_multiple_partial_or_extra_is_wrong(selected):
    assert not quiz.is_correct(make_q("Q1", ("A", "C")), selected)


# --- 出題 ---

@pytest.mark.parametrize("count", [5, 10, 20])
def test_random_mode_returns_count_without_duplicates(questions, count):
    picked = quiz.select_questions(questions, count, "random", {}, random.Random(0))
    ids = [q["id"] for q in picked]
    assert len(ids) == count
    assert len(set(ids)) == count


def test_unanswered_mode_picks_only_unanswered(questions):
    statuses = {q["id"]: "correct" for q in questions[:25]}
    statuses[questions[25]["id"]] = "unanswered"  # 手動で未回答に戻した問題
    picked = quiz.select_questions(questions, 10, "unanswered", statuses, random.Random(0))
    assert {q["id"] for q in picked} == {q["id"] for q in questions[25:]}


def test_incorrect_mode_picks_only_incorrect(questions):
    statuses = {"Q001": "incorrect", "Q002": "incorrect", "Q003": "correct"}
    picked = quiz.select_questions(questions, 10, "incorrect", statuses, random.Random(0))
    assert {q["id"] for q in picked} == {"Q001", "Q002"}


def test_returns_what_is_available_when_short(questions):
    picked = quiz.select_questions(questions[:3], 10, "random", {}, random.Random(0))
    assert len(picked) == 3


def test_returns_empty_when_nothing_matches(questions):
    assert quiz.select_questions(questions, 5, "incorrect", {}, random.Random(0)) == []


def test_unknown_mode_raises(questions):
    with pytest.raises(ValueError):
        quiz.select_questions(questions, 5, "hard", {})


def test_filter_by_domain_and_source_group():
    qs = [
        make_q("Q1", domain=1, source="practice"),
        make_q("Q2", domain=2, source="mock1"),
        make_q("Q3", domain=2, source="mock3"),
        make_q("Q4", domain=2, source="original"),
    ]
    assert [q["id"] for q in quiz.filter_questions(qs, {2}, {"mock"})] == ["Q2", "Q3"]
    assert [q["id"] for q in quiz.filter_questions(qs, None, {"practice", "original"})] == ["Q1", "Q4"]
    assert len(quiz.filter_questions(qs)) == 4


def test_shuffled_keys_keeps_all_keys():
    order = quiz.shuffled_keys(make_q("Q1"), random.Random(1))
    assert sorted(order) == ["A", "B", "C", "D"]


# --- 解説の番号置き換え ---

def test_relabel_replaces_refs_with_display_numbers():
    labels = quiz.display_labels(["C", "A", "D", "B"])  # C=1, A=2, D=3, B=4
    text = "Self-check (B) fails, (A, D) are wrong, and **C** is right."
    assert quiz.relabel(text, labels) == "Self-check (4) fails, (2, 3) are wrong, and **1** is right."


def test_relabel_sorts_grouped_refs_by_display_number():
    labels = quiz.display_labels(["D", "C", "B", "A"])
    assert quiz.relabel("Both (A, C) fail.", labels) == "Both (2, 4) fail."


# --- 集計 ---

def test_domain_accuracy_counts_every_answer():
    qs = [make_q("Q1", domain=1), make_q("Q2", domain=2)]
    history = [
        {"question_id": "Q1", "is_correct": 0},
        {"question_id": "Q1", "is_correct": 1},  # 同じ問題の2回目も数える
        {"question_id": "Q2", "is_correct": 1},
    ]
    acc = quiz.domain_accuracy(history, qs)
    assert acc[1] == (1, 2)
    assert acc[2] == (1, 1)
    assert acc[3] == (0, 0)


def test_status_counts_treats_missing_as_unanswered():
    qs = [make_q("Q1"), make_q("Q2"), make_q("Q3")]
    assert quiz.status_counts(qs, {"Q1": "correct"}) == {"correct": 1, "incorrect": 0, "unanswered": 2}


# --- 実データ ---

def test_real_question_data_loads_and_relabels():
    qs = quiz.load_questions()
    assert len(qs) == 100
    for q in qs:
        labels = quiz.display_labels([c["key"] for c in q["choices"]][::-1])
        for lang in ("en", "ja"):
            out = quiz.relabel(q["explanation"][lang], labels)
            assert "(A)" not in out and "**A**" not in out
