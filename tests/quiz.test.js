import { describe, expect, test } from "vitest";
import {
  createSession, displayLabels, domainAccuracy, filterQuestions, formatKeys, isCorrect, relabel,
  selectQuestions, shuffledKeys, statusCounts,
} from "../src/quiz.js";

const makeQ = (id, { answer = ["A"], domain = 1, source = "practice" } = {}) => ({
  id,
  source,
  domain,
  type: answer.length === 1 ? "single" : "multiple",
  choices: ["A", "B", "C", "D"].map((key) => ({ key })),
  answer,
});

const questions = Array.from({ length: 30 }, (_, i) => makeQ(`Q${String(i + 1).padStart(3, "0")}`, { domain: (i % 7) + 1 }));

// 再現できる乱数（テスト用）
function seeded(seed) {
  let s = seed;
  return () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
}

describe("採点", () => {
  test("single：正解", () => expect(isCorrect(makeQ("Q1", { answer: ["B"] }), ["B"])).toBe(true));
  test("single：不正解", () => expect(isCorrect(makeQ("Q1", { answer: ["B"] }), ["C"])).toBe(false));

  test("multiple：完全一致なら順不同で正解", () => {
    const q = makeQ("Q1", { answer: ["A", "C"] });
    expect(isCorrect(q, ["A", "C"])).toBe(true);
    expect(isCorrect(q, ["C", "A"])).toBe(true);
  });

  test.each([[["A"]], [["C"]], [["A", "B"]], [["A", "C", "D"]], [[]], [["A", "A"]]])(
    "multiple：部分一致・選びすぎ・未選択は不正解 %j",
    (selected) => expect(isCorrect(makeQ("Q1", { answer: ["A", "C"] }), selected)).toBe(false),
  );
});

describe("出題", () => {
  test.each([5, 10, 20])("ランダム：%i 問を重複なしで選ぶ", (count) => {
    const ids = selectQuestions(questions, count, "random", {}, seeded(1)).map((q) => q.id);
    expect(ids).toHaveLength(count);
    expect(new Set(ids).size).toBe(count);
  });

  test("未回答のみ：記録なし・手動で未回答に戻した問題だけを選ぶ", () => {
    const statuses = Object.fromEntries(questions.slice(0, 25).map((q) => [q.id, "correct"]));
    statuses[questions[25].id] = "unanswered";
    const picked = selectQuestions(questions, 10, "unanswered", statuses, seeded(2));
    expect(picked.map((q) => q.id).sort()).toEqual(questions.slice(25).map((q) => q.id));
  });

  test("不正解のみ：不正解の問題だけを選ぶ", () => {
    const statuses = { Q001: "incorrect", Q002: "incorrect", Q003: "correct" };
    const picked = selectQuestions(questions, 10, "incorrect", statuses, seeded(3));
    expect(picked.map((q) => q.id).sort()).toEqual(["Q001", "Q002"]);
  });

  test("件数不足：ある分だけ返す", () => {
    expect(selectQuestions(questions.slice(0, 3), 10, "random", {}, seeded(4))).toHaveLength(3);
  });

  test("該当なし：空配列を返す", () => {
    expect(selectQuestions(questions, 5, "incorrect", {}, seeded(5))).toEqual([]);
  });

  test("不正なモードはエラー", () => {
    expect(() => selectQuestions(questions, 5, "hard", {})).toThrow();
  });

  test("ランダム：毎回同じ並びにならない", () => {
    const a = selectQuestions(questions, 10, "random", {}, seeded(6)).map((q) => q.id);
    const b = selectQuestions(questions, 10, "random", {}, seeded(7)).map((q) => q.id);
    expect(a).not.toEqual(b);
  });
});

describe("絞り込み", () => {
  const qs = [
    makeQ("Q1", { domain: 1, source: "practice" }),
    makeQ("Q2", { domain: 2, source: "mock1" }),
    makeQ("Q3", { domain: 2, source: "mock3" }),
    makeQ("Q4", { domain: 2, source: "original" }),
  ];

  test("ドメインと出典（mock1〜3 は mock）で絞り込む", () => {
    expect(filterQuestions(qs, [2], ["mock"]).map((q) => q.id)).toEqual(["Q2", "Q3"]);
    expect(filterQuestions(qs, null, ["practice", "original"]).map((q) => q.id)).toEqual(["Q1", "Q4"]);
    expect(filterQuestions(qs)).toHaveLength(4);
  });

  test("何も選んでいなければ0件", () => {
    expect(filterQuestions(qs, [], ["mock"])).toEqual([]);
  });
});

describe("選択肢の表示と解説", () => {
  test("シャッフルしても4つの key がそろっている", () => {
    expect([...shuffledKeys(makeQ("Q1"), seeded(8))].sort()).toEqual(["A", "B", "C", "D"]);
  });

  test("解説の記号を表示番号に置き換える", () => {
    const labels = displayLabels(["C", "A", "D", "B"]); // C=1, A=2, D=3, B=4
    expect(relabel("Self-check (B) fails, (A, D) are wrong, and **C** is right.", labels))
      .toBe("Self-check (4) fails, (2, 3) are wrong, and **1** is right.");
  });

  test("まとめた記号は表示番号順に並べる", () => {
    expect(relabel("Both (A, C) fail.", displayLabels(["D", "C", "B", "A"]))).toBe("Both (2, 4) fail.");
  });

  test("回答の表示は表示番号順", () => {
    expect(formatKeys(["A", "C"], displayLabels(["C", "B", "A", "D"]))).toBe("1, 3");
  });

  test("クールを作ると、問題ごとに選択肢の並びが入る", () => {
    const s = createSession(questions.slice(0, 5), seeded(9));
    expect(s.questionIds).toHaveLength(5);
    expect(Object.keys(s.orders)).toEqual(s.questionIds);
    expect(s).toMatchObject({ answers: [], index: 0 });
  });
});

describe("集計", () => {
  test("ドメイン別正答率は全回答を母数にする", () => {
    const qs = [makeQ("Q1", { domain: 1 }), makeQ("Q2", { domain: 2 })];
    const history = [
      { questionId: "Q1", correct: false },
      { questionId: "Q1", correct: true },
      { questionId: "Q2", correct: true },
      { questionId: "Q999", correct: true }, // 存在しない問題は無視する
    ];
    const acc = domainAccuracy(history, qs);
    expect(acc[1]).toEqual({ correct: 1, total: 2 });
    expect(acc[2]).toEqual({ correct: 1, total: 1 });
    expect(acc[3]).toEqual({ correct: 0, total: 0 });
  });

  test("記録のない問題は未回答として数える", () => {
    expect(statusCounts(questions.slice(0, 3), { Q001: "correct" })).toEqual({ correct: 1, incorrect: 0, unanswered: 2 });
  });
});
