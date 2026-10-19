---
name: quiz-question-writer
description: Claude Certified Associate – Foundations の練習問題を新規作成・追加するときに使う。スキーマ準拠、ドメイン配分、誤答設計、重複回避のルールを定める。
---

# 練習問題の作成ルール

## スキーマ
- data/questions.json のスキーマに従う（docs/requirements.md 参照）
- source は original、source_url と source_number は null
- question / choices / explanation は必ず en と ja の両方を持つ

## 問題の作り方
- シナリオ型にする（業務上の状況 → 最も適切な対応を問う）
- 4択、正解は1つ（single）。multiple の場合は正解2つで「Choose two / 2つ選べ」と明記
- 独自問題20問のうち5問程度を multiple にする。追加前に既存の original の multiple 件数を確認して調整する
- 誤答は「もっともらしいが、設問の制約を満たさない」ものにする
  - 例：検証せずに信頼する、モデルの自己申告を根拠にする、大きいモデルに替えれば解決すると考える、プロンプト内の指示を制御とみなす
- 正解の位置（A〜D）が偏らないようにする

## 解説
- 正解の理由を1〜2文
- 各誤答がなぜ誤りかを1文ずつ

## ドメイン配分
- 7ドメインのいずれかに必ず分類する（domain は 1〜7 の番号）
- 問題全体のドメイン別件数が、公式の配点比率に近づくように配分する
  1. Prompting and Task Execution 14%
  2. Output Evaluation and Validation 21%
  3. Product and Model Selection 12%
  4. Workflow Integration and Solution Design 16%
  5. Configuration and Knowledge Management 12%
  6. Governance, Risk, and Responsible Use 15%
  7. Troubleshooting and Optimization 10%
- 作成前に既存問題のドメイン別件数を集計し、目標件数との差から配分案を提示してから作成する

## 範囲と正確性
- 公式試験ガイドに記載のない製品仕様・料金・制限値を断定しない
- 作成前に既存問題を確認し、論点の単純な言い換えは作らない

## 作成後
- question-data-check の手順で検証する
