// 学習記録の保存（localStorage）、スキーマの確認、エクスポート・インポート
import { COUNTS, DOMAIN_IDS, MODES, SOURCE_GROUPS, STATUSES } from "./quiz.js";

export const STORAGE_KEY = "ccaof-quiz:v1";
export const SCHEMA_VERSION = 1;

// schemaVersion を上げるときは、ここに「旧バージョン → 次のバージョン」の変換を追加する
// 例: 1: (data) => ({ ...data, schemaVersion: 2, newField: ... })
const MIGRATIONS = {};

export function initialData() {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: { lang: "ja", count: 10, mode: "random", domains: [...DOMAIN_IDS], sources: [...SOURCE_GROUPS] },
    statuses: {},
    history: [],
    currentSession: null,
  };
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isStringArray = (v) => Array.isArray(v) && v.every((x) => typeof x === "string");

/** 保存データの形式を確認する。問題があれば理由の文字列、なければ null を返す */
export function findProblem(data) {
  if (!isObject(data)) return "not an object";
  if (data.schemaVersion !== SCHEMA_VERSION) return "schemaVersion";

  const s = data.settings;
  if (!isObject(s)) return "settings";
  if (!["ja", "en"].includes(s.lang)) return "settings.lang";
  if (!COUNTS.includes(s.count)) return "settings.count";
  if (!MODES.includes(s.mode)) return "settings.mode";
  if (!Array.isArray(s.domains) || !s.domains.every((d) => DOMAIN_IDS.includes(d))) return "settings.domains";
  if (!Array.isArray(s.sources) || !s.sources.every((g) => SOURCE_GROUPS.includes(g))) return "settings.sources";

  if (!isObject(data.statuses) || !Object.values(data.statuses).every((v) => STATUSES.includes(v))) return "statuses";

  if (!Array.isArray(data.history)) return "history";
  for (const h of data.history) {
    if (!isObject(h) || typeof h.questionId !== "string" || !isStringArray(h.selected)
      || typeof h.correct !== "boolean" || typeof h.answeredAt !== "string") return "history item";
  }

  const c = data.currentSession;
  if (c !== null) {
    if (!isObject(c) || !isStringArray(c.questionIds) || c.questionIds.length === 0) return "currentSession";
    if (!isObject(c.orders) || !c.questionIds.every((id) => isStringArray(c.orders[id]))) return "currentSession.orders";
    if (!Array.isArray(c.answers) || c.answers.length > c.questionIds.length) return "currentSession.answers";
    for (const [i, a] of c.answers.entries()) {
      if (!isObject(a) || a.questionId !== c.questionIds[i] || !isStringArray(a.selected) || typeof a.correct !== "boolean") {
        return "currentSession.answers item";
      }
    }
    if (!Number.isInteger(c.index) || c.index < 0 || c.index >= c.questionIds.length) return "currentSession.index";
  }
  return null;
}

/** 古い schemaVersion のデータを現在の形に変換する */
export function migrate(data) {
  let d = data;
  while (Number.isInteger(d?.schemaVersion) && d.schemaVersion < SCHEMA_VERSION) {
    const step = MIGRATIONS[d.schemaVersion];
    if (!step) break;
    d = step(d);
  }
  return d;
}

/**
 * JSON 文字列を保存データとして解釈する。
 * 戻り値: { data } または { error: "corrupt" | "newer" | "invalid" }
 */
export function parseData(text) {
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return { error: "corrupt" };
  }
  if (isObject(raw) && Number.isInteger(raw.schemaVersion) && raw.schemaVersion > SCHEMA_VERSION) {
    return { error: "newer" };
  }
  const data = migrate(raw);
  return findProblem(data) ? { error: "invalid" } : { data };
}

function defaultStorage() {
  return globalThis.localStorage;
}

/**
 * 保存データを読み込む。失敗しても初期状態を返し、warning に理由を入れる。
 * warning: null | "unavailable" | "corrupt" | "newer"
 */
export function load(storage = defaultStorage()) {
  let text;
  try {
    if (!storage) throw new Error("no storage");
    text = storage.getItem(STORAGE_KEY);
  } catch {
    return { data: initialData(), warning: "unavailable" };
  }
  if (text === null || text === undefined) return { data: initialData(), warning: null };
  const result = parseData(text);
  if (result.error) return { data: initialData(), warning: result.error === "newer" ? "newer" : "corrupt" };
  return { data: result.data, warning: null };
}

/** 保存する。成功すれば true、失敗すれば false（例外は外に出さない） */
export function save(data, storage = defaultStorage()) {
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/** 問題データに存在しない問題を含む進行中のクールは破棄する */
export function dropUnknownSession(data, knownIds) {
  const c = data.currentSession;
  if (c && !c.questionIds.every((id) => knownIds.has(id))) return { ...data, currentSession: null };
  return data;
}

export function exportFileName(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `ccaof-quiz-backup-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.json`;
}

export function exportText(data) {
  return JSON.stringify(data, null, 2);
}
