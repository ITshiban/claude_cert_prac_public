# Claude Certified Associate – Foundations 練習問題アプリ

Claude Certified Associate – Foundations（CCAO-F）の練習用に作った、1問1答形式のローカル Web アプリです。日本語と英語に対応しています。

非公式の練習アプリであり、Anthropic とは関係ありません。問題の一部は Amey Thakur 氏の [CLAUDE-CERTIFICATIONS](https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS)（MIT License）に由来します。

## 起動手順

Python 3.11 以上が必要です。

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
streamlit run app.py
```

ブラウザで http://localhost:8501 が開きます。

回答履歴とステータスは `data/user.sqlite3` に保存されるので、アプリを再起動しても残ります。このファイルは `.gitignore` の対象です。

## 主な機能

- 出題数（5 / 10 / 20問）と出題モード（ランダム / 未回答のみ / 不正解のみ）を選べます
- ドメインと出典（practice / mock / original）で絞り込めます
- 選択肢は表示順をシャッフルし、上から 1〜4 の番号を振ります。解説内の選択肢記号も表示番号に置き換えます
- 回答の直後に正誤と解説を表示し、クールの最後に復習画面を表示します
- 問題ごとのステータス（回答済み正解 / 回答済み不正解 / 未回答）は回答時に自動で更新され、復習画面と問題一覧から手動でも変更できます
- ホームでニックネームを登録できます（任意）。現在は1人分のみ保存し、履歴はニックネームごとには分けていません
- 成績画面では、ドメイン別の正答率（全回答が対象）とステータス別の問題数を確認できます。学習履歴のリセットもここから行えます

## ディレクトリ構成

```
├── app.py                  # エントリーポイント、画面の切替
├── quiz.py                 # 出題・採点ロジック（Streamlit に依存しない）
├── db.py                   # SQLite の読み書き
├── i18n.py                 # UI 文言の辞書（ja / en）
├── data/
│   ├── questions/          # 出典別の問題データ（編集するのはこちら）
│   │   ├── practice.json
│   │   ├── mock1.json / mock2.json / mock3.json
│   │   └── original.json
│   └── questions.json      # 結合済みの問題データ（アプリはこれを読む）
├── scripts/
│   ├── merge_questions.py      # 出典別 JSON を questions.json に結合
│   └── validate_questions.py   # 問題データの検証
├── tests/                  # pytest
├── docs/requirements.md    # 要件
└── requirements.txt
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
   python scripts/merge_questions.py
   python scripts/validate_questions.py
   ```

   `validate_questions.py` は、合計100問・出典別件数を前提にしています。問題数を増やす場合は、スクリプト内の `EXPECTED_SOURCES` も更新してください。

## テスト

```bash
pytest
```
