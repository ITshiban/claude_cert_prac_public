// 出題・採点・集計（React に依存しない純粋な関数）

export const DOMAINS = {
  1: "Prompting and Task Execution",
  2: "Output Evaluation and Validation",
  3: "Product and Model Selection",
  4: "Workflow Integration and Solution Design",
  5: "Configuration and Knowledge Management",
  6: "Governance, Risk, and Responsible Use",
  7: "Troubleshooting and Optimization",
};
export const DOMAIN_IDS = Object.keys(DOMAINS).map(Number);
export const SOURCE_GROUPS = ["practice", "mock", "original"];
export const STATUSES = ["correct", "incorrect", "unanswered"];
export const MODES = ["random", "unanswered", "incorrect"];
export const COUNTS = [5, 10, 20];

// 解説中の選択肢記号：(B) / (B, C) / **B**
const REF = /\(([A-D](?:, [A-D])*)\)|\*\*([A-D])\*\*/g;

/** mock1〜3 をまとめて "mock" として扱う */
export function sourceGroup(question) {
  return question.source.startsWith("mock") ? "mock" : question.source;
}

/** ドメイン・出典グループで絞り込む。null は絞り込みなし */
export function filterQuestions(questions, domains = null, sources = null) {
  return questions.filter(
    (q) =>
      (domains === null || domains.includes(q.domain)) &&
      (sources === null || sources.includes(sourceGroup(q))),
  );
}

export function statusOf(statuses, id) {
  return statuses[id] ?? "unanswered";
}

/** 配列を Fisher–Yates でシャッフルしたコピーを返す */
export function shuffle(items, rng = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 出題する問題を最大 count 問、重複なしで選ぶ。
 * mode: "random"（全体からランダム）/ "unanswered"（未回答のみ）/ "incorrect"（不正解のみ）
 * 候補が count より少なければ、ある分だけ返す。
 */
export function selectQuestions(questions, count, mode, statuses, rng = Math.random) {
  if (!MODES.includes(mode)) throw new Error(`unknown mode: ${mode}`);
  const pool = mode === "random" ? questions : questions.filter((q) => statusOf(statuses, q.id) === mode);
  return shuffle(pool, rng).slice(0, count);
}

/** 選択肢の表示順（key の配列）をシャッフルして返す */
export function shuffledKeys(question, rng = Math.random) {
  return shuffle(question.choices.map((c) => c.key), rng);
}

/** 表示順の key 配列から { key: 表示番号 } を作る */
export function displayLabels(order) {
  return Object.fromEntries(order.map((key, i) => [key, String(i + 1)]));
}

/** key の配列を表示番号順の "1, 3" 形式にする */
export function formatKeys(keys, labels) {
  return keys.map((k) => labels[k]).sort().join(", ");
}

/** 選んだ key の集合が正解と完全一致すれば正解 */
export function isCorrect(question, selected) {
  const a = new Set(selected);
  return a.size === question.answer.length && question.answer.every((k) => a.has(k));
}

/** 解説中の元の選択肢記号を表示番号に置き換える。(B, C) は表示番号順に並べ替える */
export function relabel(text, labels) {
  return text.replace(REF, (_, group, single) => {
    if (group) return `(${group.split(", ").map((k) => labels[k]).sort().join(", ")})`;
    return `**${labels[single]}**`;
  });
}

/** 新しいクールを作る */
export function createSession(picked, rng = Math.random) {
  return {
    questionIds: picked.map((q) => q.id),
    orders: Object.fromEntries(picked.map((q) => [q.id, shuffledKeys(q, rng)])),
    answers: [],
    index: 0,
  };
}

/** 回答履歴の全回答を母数に、ドメインごとの { correct, total } を返す */
export function domainAccuracy(history, questions) {
  const domainOf = Object.fromEntries(questions.map((q) => [q.id, q.domain]));
  const result = Object.fromEntries(DOMAIN_IDS.map((d) => [d, { correct: 0, total: 0 }]));
  for (const row of history) {
    const d = domainOf[row.questionId];
    if (d === undefined) continue;
    result[d].total += 1;
    if (row.correct) result[d].correct += 1;
  }
  return result;
}

export function statusCounts(questions, statuses) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const q of questions) counts[statusOf(statuses, q.id)] += 1;
  return counts;
}
