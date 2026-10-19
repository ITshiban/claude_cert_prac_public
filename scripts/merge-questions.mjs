// 出典別の問題JSON（data/questions/*.json）を結合して public/questions.json を作る。
// 使い方: npm run merge
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "data", "questions");
const OUT = join(ROOT, "public", "questions.json");
const ORDER = ["practice", "mock1", "mock2", "mock3", "original"];

const questions = [];
for (const name of ORDER) {
  const path = join(SRC_DIR, `${name}.json`);
  if (!existsSync(path)) {
    console.log(`skip: ${name}.json がありません`);
    continue;
  }
  const items = JSON.parse(readFileSync(path, "utf-8"));
  console.log(`${name}.json: ${items.length}問`);
  questions.push(...items);
}
questions.sort((a, b) => a.id.localeCompare(b.id));
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(questions, null, 2) + "\n", "utf-8");
console.log(`-> public/questions.json: ${questions.length}問`);
