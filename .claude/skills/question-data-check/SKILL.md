---
name: question-data-check
description: 問題データ（data/questions/ の出典別JSON や public/questions.json）を追加・修正したときに使う。結合・検証スクリプトの実行と結果の確認手順を定める。
---

# 問題データの検証手順

## いつ実行するか
- 問題を追加・修正・翻訳したあと
- 問題データを含む変更をコミットする前

## 手順
1. 編集するのは data/questions/ の出典別JSON（public/questions.json は直接編集しない）
2. `npm run merge` を実行し、public/questions.json を更新する
3. `npm run validate` を実行する
4. 以下がすべて満たされているか確認する
   - 出典別件数（practice 35 / mock1 15 / mock2 15 / mock3 15 / original 20、合計100）
   - ID重複なし
   - answer がすべて choices の key に存在する
   - single は answer 1つ、multiple は answer 2つ（multiple は問題文に Choose two / 2つ選べ）
   - question / choices / explanation に en と ja の欠落がない
   - domain が 1〜7 のいずれか
   - 解説の選択肢記号（(B) / (B, C) / **B**）が英日で一致している
5. ドメイン別件数と配点比率の差を確認し、差が大きいドメインがあれば報告する
6. `npm test` も実行する（データ検証のテストを含む）

## エラーが出たとき
- エラー内容と該当IDを報告する
- 取り込み問題（original 以外）の本文・正解は勝手に直さない。原文と照合して、取り込みミスか確認してから修正する
- 修正後は再度 merge と validate を実行し、エラーがなくなるまで繰り返す
- 問題数を増やす場合は scripts/validate-questions.mjs の EXPECTED_SOURCES も更新する

## 報告の形式
- 合計件数、出典別件数、ドメイン別件数（比率付き）、エラー件数を短く表で示す
