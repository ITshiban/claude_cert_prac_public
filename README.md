# Claude Certified Associate – Foundations 練習問題アプリ

Claude Certified Associate – Foundations（CCAO-F）の練習用に作った、1問1答形式の Web アプリです。日本語と英語に対応しています。ブラウザだけで動き、サーバーやデータベースは使いません。

非公式の練習アプリであり、Anthropic とは関係ありません。問題の一部（Q001〜Q080）は Amey Thakur 氏の [CLAUDE-CERTIFICATIONS](https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS)（MIT License）に由来します。著作権表示とライセンス本文は [public/THIRD_PARTY_NOTICES.txt](public/THIRD_PARTY_NOTICES.txt) にあり、公開したサイトのフッターからも参照できます。

公開URL（Public 化して GitHub Pages を有効にした後）：https://itshiban.github.io/claude_cert_prac/

## 主な機能

- 出題数（5 / 10 / 20問）と出題モード（ランダム / 未回答のみ / 不正解のみ）を選べます
- ドメインと出典（practice / mock / original）で絞り込めます。条件に合う問題が足りないときは、ある分だけ出題します
- 選択肢は表示順をシャッフルし、上から 1〜4 の番号を振ります。解説内の選択肢記号も表示番号に置き換えます
- 回答の直後に正誤と解説を表示し、クールの最後に復習画面を表示します
- 問題ごとのステータス（回答済み正解 / 回答済み不正解 / 未回答）は回答時に自動で更新され、復習画面と問題一覧から手動でも変更できます
- 成績画面では、ドメイン別の正答率（全回答が対象）とステータス別の問題数を確認できます
- 設定画面で、言語の切り替え、学習記録のエクスポート・インポート・リセットができます

## 学習記録の保存

- 学習記録（設定・ステータス・回答履歴・進行中のクール）は、**このブラウザの localStorage にだけ**保存されます（キー：`ccaof-quiz:v1`）。サーバーには送信しません
- 同じブラウザで開けば続きから学習できます。途中で閉じたクールは、ホームから「続きから再開 / 破棄して新しく始める」を選べます
- ブラウザのデータを削除すると記録は消えます。必要に応じて、設定画面からエクスポート（`ccaof-quiz-backup-YYYY-MM-DD.json`）してください。インポートすると、エクスポートした時点の記録に戻せます
- 別の端末やブラウザとは記録を共有しません。移したいときは、エクスポートしたファイルを移した先でインポートしてください

## ローカルで動かす

Node.js 20 以上（LTS 推奨）が必要です。

```bash
npm install
npm run dev
```

http://localhost:5173/claude_cert_prac/ で開けます。

同じ Wi-Fi のスマートフォンから確認したいときは、`npm run dev:lan` で起動し、表示される Network の URL を開きます。同じネットワーク内の誰でも開ける状態になるので、確認が終わったら止めてください。

## テストと問題データの検証

```bash
npm test           # Vitest（採点・出題・保存・データ検証）
npm run validate   # 問題データ（public/questions.json）の検証
```

## 問題の追加方法

1. `data/questions/` の該当ファイル（新しい独自問題なら `original.json`）に、次の形式で1問を追加します。

   ```json
   {
     "id": "Q101",
     "source": "original",
     "source_url": null,
     "source_number": null,
     "domain": 2,
     "type": "single",
     "question": { "en": "...", "ja": "..." },
     "choices": [
       { "key": "A", "en": "...", "ja": "..." },
       { "key": "B", "en": "...", "ja": "..." },
       { "key": "C", "en": "...", "ja": "..." },
       { "key": "D", "en": "...", "ja": "..." }
     ],
     "answer": ["A"],
     "explanation": { "en": "...", "ja": "..." }
   }
   ```

   - `source`：practice / mock1 / mock2 / mock3 / original
   - `domain`：1〜7（試験の7ドメイン）
   - `type`：single（正解1つ）/ multiple（正解2つ。問題文に「(Choose two.)」「（2つ選べ）」を入れる）
   - 解説で選択肢に触れるときは `(B)`、`(B, C)`、`**B**` の形式で書きます。表示時に表示番号へ置き換わります

2. 結合して検証します。

   ```bash
   npm run merge      # data/questions/*.json → public/questions.json
   npm run validate
   ```

   `validate` は、合計100問・出典別件数を前提にしています。問題数を増やす場合は、`scripts/validate-questions.mjs` の `EXPECTED_SOURCES` も更新してください。

## デプロイ（GitHub Pages）

`.github/workflows/deploy.yml` で、次のように動きます。

- すべてのブランチへの push で `npm test` → `npm run validate` → `npm run build` を実行します
- `main` への push（または Actions 画面からの手動実行）のときだけ、ビルド結果を GitHub Pages に公開します。リポジトリが Private の間は、公開のジョブは自動でスキップされます

初回だけ、GitHub で次の設定が必要です。

1. リポジトリを Public にする（Settings > General > Danger Zone > Change visibility）。無料プランでは Private のリポジトリから Pages を公開できません
2. Settings > Pages の Source を「GitHub Actions」にする
3. `main` に push するか、Actions 画面から「Test, build and deploy」を手動実行する

リポジトリ名を変える場合は、`vite.config.js` の `base`（現在は `/claude_cert_prac/`）も同じ名前に変えてください。

## ディレクトリ構成

```
├── index.html
├── package.json
├── vite.config.js              # base: /claude_cert_prac/
├── public/questions.json       # アプリが読み込む問題データ（npm run merge で生成）
├── src/
│   ├── main.jsx
│   ├── App.jsx                 # 状態の保持、画面の切替、保存の呼び出し
│   ├── i18n.js                 # UI 文言の辞書（ja / en）
│   ├── quiz.js                 # 出題・採点・集計（React に依存しない）
│   ├── storage.js              # localStorage の読み書き、スキーマ確認、インポートの検証
│   ├── components.jsx          # 複数の画面で使う部品
│   ├── screens/                # Home / Quiz / Result / List / Stats / Settings
│   └── styles.css
├── data/questions/             # 出典別の問題データ（編集するのはこちら）
├── scripts/
│   ├── merge-questions.mjs     # npm run merge
│   └── validate-questions.mjs  # npm run validate
├── tests/                      # Vitest
├── docs/                       # 要件、作り直しの手順書
└── .github/workflows/deploy.yml
```

## 旧 Streamlit 版について

以前の Streamlit（Python）版は、Git のタグ `streamlit-final` に残っています。移行の確認が終わるまでは、`app.py` などの Python のファイルもリポジトリに残しています（確認後に削除予定）。
