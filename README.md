# Claude Certified Associate – Foundations 練習問題アプリ

Claude Certified Associate – Foundations（CCAO-F）の練習用に作った、1問1答形式の Web アプリです。日本語と英語に対応しています。ブラウザだけで動き、サーバーやデータベースは使いません。

非公式の練習アプリであり、Anthropic とは関係ありません。問題の一部（Q001〜Q080）は Amey Thakur 氏の [CLAUDE-CERTIFICATIONS](https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS)（MIT License）に由来します。著作権表示とライセンス本文は [public/THIRD_PARTY_NOTICES.txt](public/THIRD_PARTY_NOTICES.txt) にあり、公開したサイトのフッターからも参照できます。

## 使い方

### アクセス

**https://itshiban.github.io/claude_cert_prac_public/** をブラウザで開くだけで使えます。登録やログインは不要で、パソコンでもスマートフォンでも利用できます。右上のボタンで日本語と英語を切り替えられます。

### 学習方法

1. **ホームで条件を選んで「開始」**：出題数（5 / 10 / 20問）、出題モード、ドメイン（試験の7分野）、出典を選びます
2. **1問ずつ回答**：回答するとすぐに正誤と解説が表示されます。「2つ選べ」の問題は、2つとも合っていれば正解です
3. **結果画面で復習**：最後にスコアと全問題の解説を確認できます

出題モードは「ランダム」「未回答のみ」「不正解のみ」の3種類です。まず「未回答のみ」で全100問をひととおり解き、そのあと「不正解のみ」でまちがえた問題を繰り返すと効率的です。苦手な分野は「成績」画面のドメイン別正答率で確認できます。

### 学習記録の保存

- 記録は、使っているブラウザに自動で保存されます（サーバーには送信されません）。同じブラウザで開けば、続きから学習できます
- 別の端末やブラウザには引き継がれず、ブラウザの閲覧データを削除すると消えます。バックアップや端末の移行には、設定画面の「エクスポート」と「インポート」を使います

---

以下は、アプリを改修・運用する人向けの情報です。

## ローカルで動かす

Node.js 20 以上（LTS 推奨）が必要です。

```bash
npm install
npm run dev
```

http://localhost:5173/claude_cert_prac_public/ で開けます。

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

リポジトリ名を変える場合は、`vite.config.js` の `base`（現在は `/claude_cert_prac_public/`）も同じ名前に変えてください。

## ディレクトリ構成

```
├── index.html
├── package.json
├── vite.config.js              # base: /claude_cert_prac_public/
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

