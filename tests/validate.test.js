import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { validate } from "../scripts/validate-questions.mjs";

const load = () => JSON.parse(readFileSync("public/questions.json", "utf-8"));

describe("問題データの検証", () => {
  test("現在の問題データはエラーなし", () => {
    expect(validate(load()).errors).toEqual([]);
  });

  test("壊れたデータのエラーを検出する", () => {
    const d = load();
    d[0].answer = ["E"]; // answer が choices にない
    d[1].id = d[2].id; // ID 重複
    d[3].type = "multiple"; // type と answer の数が不一致
    d[4].question.ja = ""; // 日本語の欠落
    d[5].domain = 8; // domain が範囲外
    d[1].explanation.ja = d[1].explanation.ja.replace("(A)", ""); // 記号が英日で不一致
    d[40].explanation.ja = d[40].explanation.ja.replace("【補足】", ""); // 補足の片側欠落
    const messages = validate(d).errors.map(([id, msg]) => `${id}: ${msg}`);
    expect(messages).toEqual(expect.arrayContaining([
      "Q001: answer が choices にない: [\"E\"]",
      "Q003: ID が 2 回重複",
      "Q004: type=multiple なのに answer が 1 個",
      "Q005: question.ja が空",
      "Q006: domain が 1〜7 でない: 8",
      expect.stringMatching(/^Q003: 解説の選択肢記号が英日で一致しない/),
      "Q041: 補足（[Supplement] / 【補足】）が英日の片方にしかない",
    ]));
  });
});
