---
name: react-conventions
description: React（Vite）の画面・状態管理・保存（localStorage）を追加または修正するときに使う。このアプリの実装規約を定める。
---

# React 実装規約

## 全体
- 要件を満たす最小限の実装にする。不要な抽象化やクラス階層を作らない
- JavaScript で書く（TypeScript は使わない）
- 依存は react / react-dom と、開発用の vite / @vitejs/plugin-react / vitest のみ。UIライブラリ・状態管理・ルーティングのライブラリは追加しない（必要なら理由を説明して提案する）
- ブラウザだけで動かす。サーバー・外部API・ユーザー管理は作らない
- `npm run dev` で起動でき、`npm run build` の成果物が GitHub Pages（`vite.config.js` の base 配下）で動くこと

## ディレクトリの役割
- src/App.jsx：状態の保持、画面の切替（state で行う）、保存の呼び出し
- src/i18n.js：UI文言の辞書（ja / en）
- src/quiz.js：出題・採点・集計（React に依存しない純粋な関数にする）
- src/storage.js：localStorage の読み書き、schemaVersion の確認、インポートの検証はすべてここに集約する
- src/components.jsx：複数の画面で使う部品
- src/screens/：画面ごとのコンポーネント
- public/questions.json：問題データ（アプリからは読み取り専用。`npm run merge` で生成し、直接編集しない）

## 状態管理と保存
- 保存データ（schemaVersion / settings / statuses / history / currentSession）と同じ形の1つのオブジェクトを App で持つ
- 状態が変わるたびに storage.save() で保存する（回答ごとに保存される）
- 回答の確定は、回答数と現在の問題番号を比べて二重登録を防ぐ
- localStorage の読み書きは try/catch で囲み、失敗しても初期状態で動かし、画面に注意を出す
- 保存データの形を変えるときは、SCHEMA_VERSION を上げて storage.js の MIGRATIONS に変換を追加する。既存の記録を壊さない方法を提示してから行う

## 文言と表示
- 画面に出す文字列は直書きせず、必ず i18n 辞書から取得する（ja / en の両方を登録する）
- 問題・選択肢・解説は、選択中の言語のフィールド（ja / en）を表示する
- 問題データを HTML として埋め込まない（dangerouslySetInnerHTML を使わない）
- スマートフォンの幅（375px 程度）でも崩れないようにする

## テスト
- 採点・出題・絞り込み・保存・インポートの形式チェックは Vitest でテストする（`npm test`）
- UIのテストは不要
