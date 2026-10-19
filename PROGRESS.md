# 進捗

> Phase 1〜3 と「追加対応」は旧 Streamlit 版の記録です。現在は React 版（docs/rebuild-plan.md）に移行済みです。

## 決定事項
- 選択肢は表示順をシャッフルし、上から 1〜4 の番号を振る。正誤判定は元の key で行う
- 解説内の選択肢記号（`(B)` `(B, C)` `**B**`）は、表示時に表示番号へ置き換える
- mock の補足解説は、原文の解説のあとに改行して `[Supplement] …` / `【補足】…` で追記する
- 出典の絞り込みは practice / mock（mock1〜3）/ original の3択
- 出題モード：ランダム / 未回答のみ / 不正解のみ（後者2つは、足りなければある分だけ出題）
- 成績画面のドメイン別正答率は、回答履歴の全回答を母数にする
- 機能名は英語のまま（例：Project、Project のナレッジ）

## Phase 1：問題データ
| Step | 出典 | ID範囲 | 状態 |
|---|---|---|---|
| 1 | practice（35問） | Q001–Q035 | 完了 |
| 2 | mock1（15問） | Q036–Q050 | 完了 |
| 3 | mock2（15問） | Q051–Q065 | 完了 |
| 4 | mock3（15問） | Q066–Q080 | 完了 |
| 5 | original（20問） | Q081–Q100 | 完了（配分案は承認済み） |
| 6 | merge と validate | — | 完了（エラー0件） |

### メモ
- 原文の取り込み元：GitHub の `associate-foundations/*.md`
- practice Q5 は解説の冒頭に答えの記号がない。本文の「**B** aligns … which is the tested judgment」から正解を B とした（承認済み）
- mock の Why は原文のまま（末尾にピリオドがないものもそのまま）。補足は、Why で触れていない誤答だけを対象にする（記号なしでも内容で否定されていれば対象外）。日本語の解説は「。」で終える
- mock2・mock3 は Why がすべての誤答に触れているため、補足なし
- original の配分：D1 2 / D2 4 / D3 3 / D4 3 / D5 2 / D6 4 / D7 2（100問で配点比率と一致）。multiple は Q083, Q091, Q095, Q097, Q099
- 取り込み80問は、77問で正解の選択肢が最も長い（原文のまま）。original では誤答を長めにして、この手がかりを減らした

## Phase 2：アプリ本体
- 完了：app.py / quiz.py / db.py / i18n.py / requirements.txt / .gitignore / README.md
- 仮想環境は .venv（Streamlit 1.66.0）。DB は data/user.sqlite3（git 対象外）
- AppTest で確認済み：5/10/20問クールの通し、single/multiple の採点、二重登録防止、日英切替、不正解のみモードと件数不足時の表示、復習画面での手動ステータス変更、リセット
- 未確認：問題一覧の表（data_editor）でのステータス変更は、実際の画面で確認が必要

## Phase 3：テスト
- 完了：tests/test_quiz.py（採点・出題・絞り込み・番号置き換え・集計）、tests/test_db.py（履歴・ステータス・再接続後の永続化・リセット）
- pytest 26件すべて成功、validate_questions.py エラー0件

## 追加対応
- ニックネーム：profile テーブル（key/value）に1件保存。ホームで入力、サイドバーに表示。履歴の分離はしない（将来 answers/status にニックネーム列を追加して対応）。リセットしてもニックネームは残す
- pytest 27件すべて成功

## React 版への作り直し（docs/rebuild-plan.md）
- Phase 0〜4 完了。Streamlit 版はタグ `streamlit-final` に保存
- 公開：https://itshiban.github.io/claude_cert_prac_public/（リポジトリ ITshiban/claude_cert_prac_public、Public、GitHub Pages）
- 公開前の対応：出典元の MIT License 表記（public/THIRD_PARTY_NOTICES.txt）、コミット履歴のメール・名前を匿名アドレスに書き換えてリポジトリを作り直し
- Python 版を削除（app.py ほか、旧 data/questions.json）。スキルを react-conventions と npm run merge / validate の手順に書き換え

## 次にやること
- なし（問題を追加するときは quiz-question-writer → question-data-check の手順で）
