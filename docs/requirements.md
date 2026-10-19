> この文書は旧 Streamlit 版（タグ `streamlit-final`）の要件です。現在のアプリはブラウザ保存型の React 版に作り直しています（[rebuild-plan.md](rebuild-plan.md)、README を参照）。問題データの仕様（スキーマ・出典・ドメイン配分）は現在も有効です。

# 依頼：Claude Certified Associate – Foundations 練習問題アプリの作成

## 目的
Claude Certified Associate – Foundations（試験コード CCAO-F）の練習用に、1問1答形式のローカルWebアプリを作る。
当面は自分1人で使う。将来はURLを知っている人に共有する可能性があるが、今回はその実装はしない。

## 技術スタック
- Python 3.11+
- Streamlit（UI）
- SQLite（回答履歴・ステータス保存、1ユーザー分のみ）
- 問題データは JSON ファイルで管理（data/questions.json）
- 依存は最小限。requirements.txt を用意する
- 実装は要件を満たす最小限でよい。過剰な抽象化やユーザー管理機能は作らない

## 進め方（フェーズを分けること）
1. まず計画を提示し、私の承認を得てから実装する
2. Phase 1：問題データセットの作成
3. Phase 2：アプリ本体の実装
4. Phase 3：動作確認（pytest で採点ロジックと出題ロジックの最低限のテスト）
各フェーズの完了時に、何をしたかを短く報告して止まること。

## Phase 1：問題データセット（合計100問）

### 出典と内訳
| 出典 | URL | 問題数 |
|---|---|---|
| Practice questions | https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/associate-foundations/practice-questions.html | 35 |
| Mock exam 1 | https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/associate-foundations/mock-exam-1.html | 15 |
| Mock exam 2 | https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/associate-foundations/mock-exam-2.html | 15 |
| Mock exam 3 | https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/associate-foundations/mock-exam-3.html | 15 |
| 独自問題（Claudeが作成） | — | 20 |

参考資料（独自問題作成と範囲確認用）：
- 試験範囲：https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/associate-foundations/index.html
- 公式試験ガイド（PDF）：https://everpath-course-content.s3-accelerate.amazonaws.com/instructor%2F6nizmqk8tpzpfjvt6qmmav7rh%2Fpublic%2F1783542847%2FClaude+Certified+Associate+%E2%80%93+Foundations+Exam+Guide.pdf
- ページやPDFを取得できない場合は推測で埋めず、私に知らせること（私がファイルを用意する）
- 元サイトのGitHubリポジトリ（https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS）の元Markdownが取得できるなら、HTMLより正確なのでそちらを優先してよい

### 取り込み時の注意
- Practice questions：問題ごとに「ドメイン名」「正解」「解説（Answer and rationale）」が問題の直後にある
- Mock exam 1〜3：問題文にはドメインが書かれておらず、ページ末尾の Answer key 表に「番号・正解・ドメイン・理由（Why）」がある。番号で問題と対応付けること
- Mock exam の解説（Why）は短く、誤答の説明が一部の選択肢にしかない場合がある。原文の解説は残し、不足している誤答の説明は補足として追記してよい（補足部分はそれと分かるようにする）
- 取り込んだ問題の本文・選択肢・正解は変更しない（日本語訳を追加するだけ）
- 各問題に出典ページと元の問題番号を記録する

### 独自問題（20問）
- 7ドメインの配点比率に、100問全体のドメイン別件数が近づくように配分する。既存80問のドメイン別件数を先に集計し、配分案を提示してから作成すること
  1. Prompting and Task Execution 14%
  2. Output Evaluation and Validation 21%
  3. Product and Model Selection 12%
  4. Workflow Integration and Solution Design 16%
  5. Configuration and Knowledge Management 12%
  6. Governance, Risk, and Responsible Use 15%
  7. Troubleshooting and Optimization 10%
- 形式：シナリオ型、4択、誤答選択肢は「設問の制約を満たさない」もっともらしいものにする
- 20問のうち5問程度は複数選択（正解2つ、問題文に「2つ選べ / Choose two」と明記）
- 既存80問と論点が重複する問題（例：個人情報の匿名化、Projectの古いナレッジ、モデル階層の選択の単純な言い換え）は作らない
- 公式ガイドに記載のない製品仕様を断定しない

### 共通
- すべての問題に日本語と英語の両方を用意する（既存問題は英語原文＋日本語訳）
- explanation には「正解の理由」と「各誤答がなぜ誤りか」を含める

### JSONスキーマ（1問分の例）
```json
{
  "id": "Q001",
  "source": "practice",
  "source_url": "https://amey-thakur.github.io/CLAUDE-CERTIFICATIONS/associate-foundations/practice-questions.html",
  "source_number": 1,
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
- source の値：practice / mock1 / mock2 / mock3 / original
- type の値：single / multiple
- 独自問題は source_url と source_number を null にする

### 検証
作成後、scripts/validate_questions.py で以下を確認して結果を表示する：
- 合計100問であること、出典別件数（35/15/15/15/20）
- ID重複がないこと
- answer が choices の key に存在すること、type と answer の数が一致すること（single は1つ、multiple は2つ）
- 日英の欠落がないこと
- ドメイン別件数と、配点比率との差

## Phase 2：アプリ機能

### 必須機能
1. 言語切替：UI全体（ボタン・ラベル・問題・解説）を日本語/英語で切替。UI文言は辞書ファイル（i18n.py など）に集約
2. 出題数選択：5問 / 10問 / 20問 から選んで1クール開始
3. 出題：問題集から基本ランダムに選ぶ（同じクール内で重複なし）
4. 1問ずつ回答 → 回答直後に正誤判定と解説を表示 → 「次へ」で進む
   - single はラジオボタン、multiple はチェックボックス（完全一致で正解）
5. クール終了時の復習画面：全問題・自分の回答・正解・解説・正誤を一覧表示
6. 問題ごとのステータスラベル：「回答済み正解」「回答済み不正解」「未回答」
   - 回答時に、その回の結果で自動更新
   - ユーザーが手動で付け替えもできる（復習画面と問題一覧画面から）

### 追加してほしい基本機能
- 出題モード：ランダム / 未回答を優先 / 不正解のみ（苦手克服）
- 絞り込み：ドメイン（複数選択可）、出典（practice / mock / original、複数選択可）。デフォルトは全部
- 条件に合う問題が出題数より少ない場合は、ある分だけ出題し、その旨を表示する
- 選択肢の表示順シャッフル（正誤判定は key で行う）
- 進捗表示（例：3/10）とクール終了時のスコア（正答率）
- 成績画面：ドメイン別の正答率と、ステータス別の問題数
- 問題一覧画面：ステータス・ドメイン・出典で絞り込み、ステータスの手動変更
- 学習履歴のリセット（確認付き）
- 出典表示：サイト由来の問題には出典ページへのリンクを表示し、独自問題には「オリジナル」と表示
- フッターに、非公式の練習アプリであること、問題の一部は Amey Thakur 氏の CLAUDE-CERTIFICATIONS 由来であることを表示

### データ保存
- SQLite に保存：回答履歴（問題ID、選択した回答、正誤、日時）と現在のステータス
- 1ユーザー分のみでよい（user_id 列やログインは不要）
- ニックネームを入力・保存できるようにする（任意、20文字まで）。ホームで入力し、サイドバーに表示する。1人で使う前提は変えず、ニックネームは1件だけ保存する。将来の展開に備えた準備であり、ニックネームごとの履歴の分離やログインは今回は実装しない
- 問題データ（JSON）とユーザーデータ（SQLite）は分離する。SQLiteファイルは .gitignore に入れる

### 画面構成（目安）
- ホーム：言語切替、出題数、出題モード、ドメイン・出典の絞り込み、開始ボタン
- 出題画面
- 結果・復習画面
- 問題一覧画面
- 成績画面

## 制約
- ローカルで `streamlit run app.py` だけで起動できること
- 外部APIやAPIキーは使わない（問題は事前にデータセット化済み）
- README.md に起動手順、ディレクトリ構成、問題の追加方法を書く

## 完了条件
- 5/10/20問のクールが最後まで通しで動く
- single と multiple の両方で正誤判定が正しく動く
- 日英切替で全画面の文言が切り替わる
- アプリを再起動してもステータスと履歴が残る
- validate_questions.py がエラーなしで通る
- pytest が通る