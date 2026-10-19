# Claude Certified Associate – Foundations 練習問題アプリ

Claude Certified Associate – Foundations（CCAO-F）の練習用に作った、1問1答形式の Web アプリです。日本語と英語に対応しています。ブラウザだけで動き、サーバーやデータベースは使いません。

非公式の練習アプリであり、Anthropic とは関係ありません。問題の一部（Q001〜Q080）は Amey Thakur 氏の [CLAUDE-CERTIFICATIONS](https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS)（MIT License）に由来します。著作権表示とライセンス本文は [public/THIRD_PARTY_NOTICES.txt](public/THIRD_PARTY_NOTICES.txt) にあり、公開したサイトのフッターからも参照できます。

## 使い方

### どこから入るか

ブラウザで次の URL を開くだけで使えます。インストール、会員登録、ログインは不要です。

**https://itshiban.github.io/claude_cert_prac_public/**

- パソコンでもスマートフォンでも使えます
- 右上のボタンで、日本語と英語を切り替えられます。問題文・選択肢・解説も切り替わります
- 続けて使う場合は、ブックマークやホーム画面への追加をおすすめします。学習記録は、開いたブラウザに保存されるためです（下の「学習記録の保存」を参照）

### 学習方法

**1. ホームで出題の条件を選んで「開始」を押す**

| 項目 | 選べる内容 |
|---|---|
| 出題数 | 5問 / 10問 / 20問。この1回分の出題を「クール」と呼びます |
| 出題モード | **ランダム**：全問題から出題 / **未回答のみ**：まだ解いていない問題だけ / **不正解のみ**：最後に答えたときにまちがえた問題だけ |
| ドメイン | 試験の7つの出題分野。苦手な分野だけに絞れます |
| 出典 | practice / mock（模擬試験）/ オリジナル |

条件に合う問題が出題数より少ないときは、ある分だけ出題し、その旨を表示します。

**2. 1問ずつ答える**

- 正解が1つの問題は1つ、「2つ選べ」とある問題は2つ選んで「回答する」を押します。2つ選ぶ問題は、2つとも合っていて正解です
- 回答するとすぐに正誤と解説が表示されます。正解の選択肢は緑、選んだ誤答は赤で表示されます
- 解説を読んだら「次へ」で進みます
- 選択肢の並び順は毎回変わります。位置ではなく内容で覚えるようにしてください

**3. 結果画面で復習する**

- クールの最後に、スコア（正答率）と全問題の一覧が表示されます
- 各問題を開くと、選択肢・自分の回答・正解・解説をもう一度確認できます

**4. ステータスを使って繰り返す**

各問題には「回答済み正解」「回答済み不正解」「未回答」のステータスが付き、回答するたびに自動で更新されます。

- 進め方の例：まず「未回答のみ」で全問題をひととおり解く → 「不正解のみ」でまちがえた問題を正解できるまで繰り返す
- 偶然正解した問題を復習に回したいときは、結果画面や問題一覧から、ステータスを手動で「回答済み不正解」に変更できます

**そのほかの画面**

| 画面 | できること |
|---|---|
| 問題一覧 | 全100問をステータス・ドメイン・出典で絞り込んで確認し、ステータスを変更できます |
| 成績 | ドメイン別の正答率（これまでのすべての回答が対象）と、ステータス別の問題数を確認できます。苦手な分野を見つけるのに使えます |
| 設定 | 言語の切り替え、学習記録のエクスポート・インポート・リセットができます |

### 学習記録の保存

- 学習記録（ステータス、回答履歴、途中のクール、前回選んだ条件）は、**使っているブラウザの中にだけ**自動で保存されます。サーバーには送信されず、ほかの人に見られることはありません
- 同じ端末の同じブラウザで開けば、続きから学習できます。クールの途中でページを閉じても、次に開いたときにホームから「続きから再開」か「破棄して新しく始める」を選べます
- 次の場合は、記録が引き継がれません
  - 別の端末や別のブラウザで開いた場合（パソコンとスマートフォンの間でも共有されません）
  - ブラウザの閲覧データ（Cookie やサイトデータ）を削除した場合
  - プライベートモード（シークレットウィンドウ）で開いた場合。そのウィンドウを閉じると記録が消えます
- **バックアップと引っ越し**：設定画面の「エクスポート」で、記録をファイル（`ccaof-quiz-backup-日付.json`）として保存できます。別の端末やブラウザに移すときや、ブラウザのデータを消す前は、エクスポートしたファイルを移した先の「インポート」で読み込んでください。インポートすると、今の記録はファイルの内容で上書きされます
- **最初からやり直す**：設定画面の「リセット」で、すべての記録を削除できます。元に戻せないので、必要なら先にエクスポートしてください

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

