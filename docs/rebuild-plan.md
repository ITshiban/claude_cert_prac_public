# 実行手順：ブラウザ保存型 Web アプリへの作り直し

依頼内容は「ブラウザ保存型Webアプリへの作り直し」の依頼文のとおり。この文書は、その依頼を実行する順番と、各フェーズで何を確認するかを決めたもの。
フェーズごとに止まって報告し、承認を得てから次に進む。

## 決定事項

| 項目 | 決定 |
|---|---|
| 公開先 | GitHub Pages。当面はリポジトリを Private のまま進め、後で Public に移行する。Pages の有効化は Public 移行後 |
| 出題モード | ランダム / 未回答のみ / 不正解のみ（Streamlit 版と同じ。後者2つは、足りなければある分だけ出題） |
| 問題データ | 出典別の `data/questions/*.json` を正とし、Node.js の結合スクリプトで `public/questions.json` を生成する。`data/questions.json` は Python 版を削除するまで残す |
| ドメイン別正答率 | 回答履歴の全回答を母数にする（Streamlit 版と同じ） |
| 選択肢の表示 | シャッフルして 1〜4 の番号を振る。解説の `(B)` `(B, C)` `**B**` は表示番号に置き換える（Streamlit 版と同じ） |
| 作らないもの | ニックネーム、ユーザー管理、サーバー側の DB |
| スキル | Python 版を削除するタイミングで、`streamlit-conventions` を React 版の規約に、`question-data-check` を `npm run validate` の手順に書き換える |
| ブランチ | `react-rebuild` ブランチで作業し、全フェーズが終わって確認を得たら `main` にマージする |

## 構成（完成形）

```
├── index.html
├── package.json             # scripts: dev / build / preview / test / validate / merge
├── vite.config.js           # base: '/claude_cert_prac_public/'
├── public/questions.json    # 起動時に fetch で読み込む（merge で生成）
├── src/
│   ├── main.jsx
│   ├── App.jsx              # 状態の保持、画面の切替（state）、保存の呼び出し
│   ├── i18n.js              # UI 文言の辞書（ja / en）
│   ├── quiz.js              # 出題・採点・集計（React に依存しない純粋な関数）
│   ├── storage.js           # localStorage の読み書き、schemaVersion の確認、インポートの検証
│   ├── screens/             # Home / Quiz / Result / List / Stats / Settings
│   └── styles.css
├── scripts/
│   ├── merge-questions.mjs      # npm run merge
│   └── validate-questions.mjs   # npm run validate
├── tests/                   # quiz.test.js / storage.test.js
├── data/questions/*.json    # 出典別の問題データ（編集するのはこちら）
└── .github/workflows/deploy.yml
```

依存パッケージ：`react`、`react-dom`。開発用に `vite`、`@vitejs/plugin-react`、`vitest`。これ以外は追加しない。

## 保存データ（localStorage キー `ccaof-quiz:v1`）

```json
{
  "schemaVersion": 1,
  "settings": { "lang": "ja", "count": 10, "mode": "random", "domains": [1,2,3,4,5,6,7], "sources": ["practice","mock","original"] },
  "statuses": { "Q001": "correct" },
  "history": [ { "questionId": "Q001", "selected": ["A"], "correct": true, "answeredAt": "2026-10-19T10:00:00" } ],
  "currentSession": {
    "questionIds": ["Q010", "Q003"],
    "orders": { "Q010": ["C","A","D","B"] },
    "answers": [ { "questionId": "Q010", "selected": ["C"], "correct": false } ],
    "index": 1
  }
}
```

- `currentSession` はクールがないとき `null`。クールが終わり、復習画面を閉じた時点で `null` に戻す
- 読み込み時の処理
  1. JSON として読めない、または形式が不正 → 初期状態で起動し、画面に注意を出す
  2. `schemaVersion` が現在より古い → `migrate()` を通す（現時点では変換なし。仕組みだけ用意する）
  3. 現在より新しい → 初期状態で起動し、注意を出す
- localStorage が使えない場合も、初期状態で起動して注意を出す。保存に失敗しても、アプリは止めない

---

## Phase 0：準備

1. 作業ツリーがクリーンであることを確認する
2. 現在の `main` にタグ `streamlit-final` を付けて push する
3. ブランチ `react-rebuild` を作成する
4. Node.js LTS をインストールする（`winget install OpenJS.NodeJS.LTS`）。`node -v` と `npm -v` で確認する

**報告**：タグとブランチの作成結果、Node.js と npm のバージョン

## Phase 1：プロジェクト作成と基本フロー（出題 → 採点 → 解説）

1. Vite と React のプロジェクトを作成する（既存のファイルと共存させる。Python のファイルには触れない）
2. `scripts/merge-questions.mjs` を作成し、`public/questions.json` を生成する（内容が `data/questions.json` と一致することを確認する）
3. `src/quiz.js`：quiz.py のロジックを移植する（絞り込み、出題、シャッフル、表示番号、採点、解説の番号置き換え、集計）
4. `src/i18n.js`：i18n.py の辞書を移植する（ニックネーム関連を除く）
5. 画面：ホーム（出題数・モード・絞り込み・開始・件数不足の表示）、出題（進捗、ラジオボタン・チェックボックス、回答、正誤と解説、次へ）、終了時のスコア表示（仮）
6. この段階では保存しない（リロードすると初期状態に戻る）

**確認**：`npm run dev` で起動し、5・10・20問のクールが通しで動く。single と multiple の判定。日英切替
**報告**：作ったファイル、動作確認の結果

## Phase 2：復習画面・問題一覧・成績・設定

1. 結果・復習画面：スコア、全問題（自分の回答・正解・解説・正誤）、手動でのステータス変更
2. 問題一覧：ステータス・ドメイン・出典で絞り込み、各行でステータスを変更
3. 成績：ドメイン別の正答率（全回答が対象）、ステータス別の問題数
4. 設定：言語、保存についての注意文、リセット（確認付き）。エクスポートとインポートのボタン位置だけ用意する
5. ヘッダーのナビゲーション、出典表示、フッター
6. スマートフォン幅（375px）でのレイアウト調整

**確認**：全画面の日英切替。手動でのステータス変更が、出題モードと成績に反映される。スマートフォン幅で崩れない
**報告**：画面ごとの実装内容、確認結果

## Phase 3：保存・エクスポート/インポート・テスト

1. `src/storage.js`：load / save / migrate / validate（エラー処理は try/catch で行い、利用者向けの注意メッセージを返す）
2. App から、回答・ステータス変更・設定変更・クールの進行のたびに保存する
3. 起動時に `currentSession` があれば「前回の続きから再開 / 破棄して新しく始める」を表示する
4. エクスポート（`ccaof-quiz-backup-YYYY-MM-DD.json` としてダウンロード）、インポート（形式チェック → 上書きの確認 → 反映）
5. `scripts/validate-questions.mjs`：validate_questions.py と同じ検証内容。`npm run validate` で実行する
6. Vitest
   - 採点：single、multiple の完全一致・部分一致・選びすぎ
   - 出題：重複なし、3モード、絞り込み、件数不足
   - 保存：保存 → 読み込みで内容が一致する。壊れた JSON や localStorage の例外でも初期状態で起動する。schemaVersion の扱い。インポートの形式チェック（正常・不正）

**確認**：ブラウザを閉じて開き直したときの復元（ステータス・履歴・進行中のクール）。エクスポート → リセット → インポートで元に戻る。プライベートウィンドウでも止まらない。`npm test` と `npm run validate` が通る
**報告**：テスト結果、確認結果

## Phase 4：デプロイ設定と README

1. `vite.config.js` の base を `/claude_cert_prac_public/` にする
2. `.github/workflows/deploy.yml`：main への push で test → validate → build → GitHub Pages にデプロイする
3. `npm run build` と `npm run preview` で、base パス付きで動くことを確認する
4. README.md を書き直す：ローカル起動、テスト、問題データの結合と検証、デプロイ手順（Public 移行後に Settings > Pages で Source を「GitHub Actions」にする）、ディレクトリ構成
5. Public に移行するまでは、ワークフローのデプロイ手順は失敗するか実行されない。この点は README にも書く

**確認**：preview でサブパスの配信が動く。Actions の test・validate・build のジョブは Private のままでも通る
**報告**：ワークフローの内容、確認結果。そのうえで `react-rebuild` を `main` にマージしてよいか確認する

## 後日：Python 版の削除（新しいアプリの全機能を確認していただいてから）【完了】

1. 削除するもの：`app.py` `quiz.py` `db.py` `i18n.py` `requirements.txt` `pytest.ini` `tests/*.py` `scripts/*.py` `data/questions.json` `.venv/`
2. `.gitignore` を Node 向けに整理する
3. スキル `streamlit-conventions` と `question-data-check` を書き換える
4. PROGRESS.md を更新する

## Public 移行時（後日、指示を受けてから）

1. GitHub でリポジトリを Public にする（Settings > General > Danger Zone）
2. Settings > Pages で Source を「GitHub Actions」にする
3. main への push、またはワークフローの手動実行でデプロイし、`https://itshiban.github.io/claude_cert_prac_public/` で動作を確認する
