// 問題データを検証し、件数とエラーを表示する。エラーがあれば終了コード1。
// 使い方: npm run validate [-- path]   （既定は public/questions.json）
import { readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_PATH = join(ROOT, "public", "questions.json");

const EXPECTED_SOURCES = { practice: 35, mock1: 15, mock2: 15, mock3: 15, original: 20 };
const DOMAINS = {
  1: ["Prompting and Task Execution", 14],
  2: ["Output Evaluation and Validation", 21],
  3: ["Product and Model Selection", 12],
  4: ["Workflow Integration and Solution Design", 16],
  5: ["Configuration and Knowledge Management", 12],
  6: ["Governance, Risk, and Responsible Use", 15],
  7: ["Troubleshooting and Optimization", 10],
};
const LANGS = ["en", "ja"];
const FIELDS = ["id", "source", "source_url", "source_number", "domain", "type", "question", "choices", "answer", "explanation"];
// 解説中の選択肢記号：(B) / (B, C) / **B**
const REF = /\(([A-D](?:, [A-D])*)\)|\*\*([A-D])\*\*/g;

function refs(text) {
  const keys = [];
  for (const m of text.matchAll(REF)) keys.push(...(m[1] ?? m[2]).split(", "));
  return keys.sort();
}

const blank = (v) => typeof v !== "string" || v.trim() === "";

/** 1問分のエラーメッセージの配列を返す */
export function checkQuestion(q) {
  const errors = [];
  for (const f of FIELDS) if (!(f in q)) errors.push(`${f} がない`);
  if (errors.length) return errors;

  if (!(q.source in EXPECTED_SOURCES)) errors.push(`source が不正: ${q.source}`);
  if (q.source === "original") {
    if (q.source_url !== null || q.source_number !== null) errors.push("original なのに source_url / source_number が null でない");
  } else if (!q.source_url || !Number.isInteger(q.source_number)) {
    errors.push("source_url / source_number がない");
  }
  if (!(q.domain in DOMAINS) || !Number.isInteger(q.domain)) errors.push(`domain が 1〜7 でない: ${q.domain}`);

  const keys = q.choices.map((c) => c.key);
  if (keys.length !== 4 || new Set(keys).size !== 4) errors.push(`choices の key が4つの異なる値でない: ${JSON.stringify(keys)}`);
  const missing = q.answer.filter((a) => !keys.includes(a));
  if (missing.length) errors.push(`answer が choices にない: ${JSON.stringify(missing)}`);
  if (new Set(q.answer).size !== q.answer.length) errors.push("answer が重複している");
  const expectedN = { single: 1, multiple: 2 }[q.type];
  if (expectedN === undefined) errors.push(`type が不正: ${q.type}`);
  else if (q.answer.length !== expectedN) errors.push(`type=${q.type} なのに answer が ${q.answer.length} 個`);

  let missingText = false;
  for (const lang of LANGS) {
    if (blank(q.question[lang])) { errors.push(`question.${lang} が空`); missingText = true; }
    if (blank(q.explanation[lang])) { errors.push(`explanation.${lang} が空`); missingText = true; }
    for (const c of q.choices) if (blank(c[lang])) errors.push(`choices[${c.key}].${lang} が空`);
  }
  if (missingText) return errors;

  if (q.type === "multiple" && (!q.question.en.includes("Choose two") || !q.question.ja.includes("2つ選べ"))) {
    errors.push("multiple なのに問題文に Choose two / 2つ選べ がない");
  }
  const enRefs = refs(q.explanation.en);
  const jaRefs = refs(q.explanation.ja);
  if (JSON.stringify(enRefs) !== JSON.stringify(jaRefs)) {
    errors.push(`解説の選択肢記号が英日で一致しない: en=${JSON.stringify(enRefs)} ja=${JSON.stringify(jaRefs)}`);
  }
  const bad = [...new Set(enRefs)].filter((k) => !keys.includes(k));
  if (bad.length) errors.push(`解説が存在しない選択肢を参照している: ${JSON.stringify(bad)}`);
  if (q.explanation.en.includes("[Supplement]") !== q.explanation.ja.includes("【補足】")) {
    errors.push("補足（[Supplement] / 【補足】）が英日の片方にしかない");
  }
  return errors;
}

/** 全体を検証して { errors, bySource, byDomain, byType } を返す */
export function validate(questions) {
  const errors = [];
  const total = questions.length;
  const expectedTotal = Object.values(EXPECTED_SOURCES).reduce((a, b) => a + b, 0);
  if (total !== expectedTotal) errors.push(["-", `合計が ${expectedTotal} 問でない: ${total}`]);

  const idCount = {};
  for (const q of questions) idCount[q.id] = (idCount[q.id] ?? 0) + 1;
  for (const [id, n] of Object.entries(idCount)) if (n > 1) errors.push([id, `ID が ${n} 回重複`]);
  for (const q of questions) for (const msg of checkQuestion(q)) errors.push([q.id ?? "?", msg]);

  const count = (key) => questions.reduce((acc, q) => ({ ...acc, [q[key]]: (acc[q[key]] ?? 0) + 1 }), {});
  const bySource = count("source");
  for (const [src, expected] of Object.entries(EXPECTED_SOURCES)) {
    if ((bySource[src] ?? 0) !== expected) errors.push(["-", `${src} が ${expected} 問でない: ${bySource[src] ?? 0}`]);
  }
  return { errors, total, bySource, byDomain: count("domain"), byType: count("type") };
}

function main() {
  const path = process.argv[2] ?? DEFAULT_PATH;
  const { errors, total, bySource, byDomain, byType } = validate(JSON.parse(readFileSync(path, "utf-8")));

  console.log(`## 検証結果: ${basename(path)}\n`);
  console.log(`合計: ${total} 問\n`);
  console.log("| 出典 | 件数 | 期待値 |\n|---|---|---|");
  for (const [src, expected] of Object.entries(EXPECTED_SOURCES)) console.log(`| ${src} | ${bySource[src] ?? 0} | ${expected} |`);

  console.log("\n| ドメイン | 件数 | 比率 | 配点比率 | 差 |\n|---|---|---|---|---|");
  for (const [d, [name, weight]] of Object.entries(DOMAINS)) {
    const n = byDomain[d] ?? 0;
    const ratio = total ? (n / total) * 100 : 0;
    const diff = Math.round(ratio - weight);
    console.log(`| ${d} ${name} | ${n} | ${Math.round(ratio)}% | ${weight}% | ${diff >= 0 ? "+" : ""}${diff}pt |`);
  }
  console.log(`\nsingle: ${byType.single ?? 0} / multiple: ${byType.multiple ?? 0}`);

  console.log(`\nエラー: ${errors.length} 件`);
  for (const [id, msg] of errors) console.log(`- ${id}: ${msg}`);
  process.exit(errors.length ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
