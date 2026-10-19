import { describe, expect, test } from "vitest";
import {
  dropUnknownSession, exportFileName, exportText, initialData, load, parseData, save, SCHEMA_VERSION, STORAGE_KEY,
} from "../src/storage.js";

// localStorage の代わり
function memoryStorage(initial = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    raw: map,
  };
}

const throwingStorage = {
  getItem() { throw new Error("SecurityError"); },
  setItem() { throw new Error("QuotaExceededError"); },
};

function sampleData() {
  return {
    ...initialData(),
    settings: { lang: "en", count: 20, mode: "incorrect", domains: [2, 6], sources: ["mock"] },
    statuses: { Q001: "correct", Q002: "incorrect", Q003: "unanswered" },
    history: [
      { questionId: "Q001", selected: ["A"], correct: true, answeredAt: "2026-10-19T01:00:00.000Z" },
      { questionId: "Q002", selected: ["B", "D"], correct: false, answeredAt: "2026-10-19T01:01:00.000Z" },
    ],
    currentSession: {
      questionIds: ["Q010", "Q020"],
      orders: { Q010: ["C", "A", "D", "B"], Q020: ["A", "B", "C", "D"] },
      answers: [{ questionId: "Q010", selected: ["C"], correct: false }],
      index: 1,
    },
  };
}

describe("保存と読み込み", () => {
  test("保存 → 読み込みで内容が一致する", () => {
    const storage = memoryStorage();
    expect(save(sampleData(), storage)).toBe(true);
    expect(load(storage)).toEqual({ data: sampleData(), warning: null });
  });

  test("保存データがなければ初期状態（注意なし）", () => {
    expect(load(memoryStorage())).toEqual({ data: initialData(), warning: null });
  });

  test("JSON として壊れていれば初期状態で起動し、注意を出す", () => {
    const r = load(memoryStorage({ [STORAGE_KEY]: "{not json" }));
    expect(r).toEqual({ data: initialData(), warning: "corrupt" });
  });

  test("形式が不正（項目の型が違う）なら初期状態で起動し、注意を出す", () => {
    const broken = { ...sampleData(), history: "oops" };
    expect(load(memoryStorage({ [STORAGE_KEY]: JSON.stringify(broken) })).warning).toBe("corrupt");
  });

  test("新しい schemaVersion のデータは読み込まず、注意を出す", () => {
    const newer = { ...sampleData(), schemaVersion: SCHEMA_VERSION + 1 };
    expect(load(memoryStorage({ [STORAGE_KEY]: JSON.stringify(newer) }))).toEqual({ data: initialData(), warning: "newer" });
  });

  test("localStorage が使えなくても止まらない", () => {
    expect(load(throwingStorage)).toEqual({ data: initialData(), warning: "unavailable" });
    expect(load(undefined)).toEqual({ data: initialData(), warning: "unavailable" });
    expect(save(sampleData(), throwingStorage)).toBe(false);
    expect(save(sampleData(), undefined)).toBe(false);
  });
});

describe("インポートの形式チェック", () => {
  test("正しいエクスポートファイルは読み込める", () => {
    expect(parseData(exportText(sampleData()))).toEqual({ data: sampleData() });
  });

  test.each([
    ["JSON でない", "hello", "corrupt"],
    ["配列", "[]", "invalid"],
    ["schemaVersion なし", JSON.stringify({ ...sampleData(), schemaVersion: undefined }), "invalid"],
    ["新しいバージョン", JSON.stringify({ ...sampleData(), schemaVersion: 99 }), "newer"],
    ["不正な言語", JSON.stringify({ ...sampleData(), settings: { ...sampleData().settings, lang: "fr" } }), "invalid"],
    ["不正な出題数", JSON.stringify({ ...sampleData(), settings: { ...sampleData().settings, count: 7 } }), "invalid"],
    ["不正なステータス", JSON.stringify({ ...sampleData(), statuses: { Q001: "maybe" } }), "invalid"],
    ["履歴の項目が不足", JSON.stringify({ ...sampleData(), history: [{ questionId: "Q001" }] }), "invalid"],
    ["クールの index が範囲外", JSON.stringify({ ...sampleData(), currentSession: { ...sampleData().currentSession, index: 5 } }), "invalid"],
    ["クールの回答が出題順と食い違う", JSON.stringify({
      ...sampleData(),
      currentSession: { ...sampleData().currentSession, answers: [{ questionId: "Q020", selected: ["A"], correct: true }] },
    }), "invalid"],
  ])("%s は読み込まない", (_, text, error) => {
    expect(parseData(text)).toEqual({ error });
  });

  test("進行中のクールがない（null）データも読み込める", () => {
    expect(parseData(JSON.stringify({ ...sampleData(), currentSession: null })).data.currentSession).toBeNull();
  });
});

describe("その他", () => {
  test("エクスポートのファイル名に日付が入る", () => {
    expect(exportFileName(new Date(2026, 9, 5))).toBe("ccaof-quiz-backup-2026-10-05.json");
  });

  test("問題データにない問題を含むクールは破棄する", () => {
    const d = sampleData();
    expect(dropUnknownSession(d, new Set(["Q010", "Q020"]))).toBe(d);
    expect(dropUnknownSession(d, new Set(["Q010"])).currentSession).toBeNull();
  });
});
