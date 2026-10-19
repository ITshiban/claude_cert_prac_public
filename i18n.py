"""UI文言の辞書（ja / en）。画面に出す文字列はすべてここから取得する。"""

TEXT = {
    # 共通
    "app_title": {"ja": "Claude Certified Associate – Foundations 練習問題", "en": "Claude Certified Associate – Foundations Practice"},
    "language": {"ja": "言語 / Language", "en": "Language / 言語"},
    "menu": {"ja": "メニュー", "en": "Menu"},
    "page_home": {"ja": "ホーム", "en": "Home"},
    "page_list": {"ja": "問題一覧", "en": "Questions"},
    "page_stats": {"ja": "成績", "en": "Stats"},
    "footer": {
        "ja": "本アプリは非公式の練習用アプリであり、Anthropic とは関係ありません。問題の一部は Amey Thakur 氏の [CLAUDE-CERTIFICATIONS](https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS)（MIT License）に由来します。",
        "en": "This is an unofficial practice app, not affiliated with Anthropic. Some questions come from Amey Thakur's [CLAUDE-CERTIFICATIONS](https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS) (MIT License).",
    },
    "domain": {"ja": "ドメイン", "en": "Domain"},
    "source": {"ja": "出典", "en": "Source"},
    "status": {"ja": "ステータス", "en": "Status"},
    "question": {"ja": "問題", "en": "Question"},
    "source_original": {"ja": "オリジナル", "en": "Original"},
    "source_link": {"ja": "{name} 第{num}問", "en": "{name}, Q{num}"},
    "source_practice": {"ja": "Practice questions", "en": "Practice questions"},
    "source_mock": {"ja": "Mock exam", "en": "Mock exam"},
    "source_mock1": {"ja": "Mock exam 1", "en": "Mock exam 1"},
    "source_mock2": {"ja": "Mock exam 2", "en": "Mock exam 2"},
    "source_mock3": {"ja": "Mock exam 3", "en": "Mock exam 3"},
    "status_correct": {"ja": "回答済み正解", "en": "Answered correctly"},
    "status_incorrect": {"ja": "回答済み不正解", "en": "Answered incorrectly"},
    "status_unanswered": {"ja": "未回答", "en": "Unanswered"},
    "back_home": {"ja": "ホームに戻る", "en": "Back to home"},

    # ニックネーム
    "nickname": {"ja": "ニックネーム", "en": "Nickname"},
    "nickname_help": {"ja": "任意。{n}文字まで。", "en": "Optional. Up to {n} characters."},
    "nickname_save": {"ja": "保存", "en": "Save"},
    "nickname_saved": {"ja": "ニックネームを保存しました。", "en": "Nickname saved."},
    "nickname_too_long": {"ja": "ニックネームは{n}文字以内で入力してください。", "en": "Please use {n} characters or fewer."},
    "greeting": {"ja": "{name} さん", "en": "Hi, {name}"},

    # ホーム
    "count": {"ja": "出題数", "en": "Number of questions"},
    "count_option": {"ja": "{n}問", "en": "{n} questions"},
    "mode": {"ja": "出題モード", "en": "Mode"},
    "mode_random": {"ja": "ランダム", "en": "Random"},
    "mode_unanswered": {"ja": "未回答のみ", "en": "Unanswered only"},
    "mode_incorrect": {"ja": "不正解のみ", "en": "Incorrect only"},
    "filter_domain": {"ja": "ドメインで絞り込み", "en": "Filter by domain"},
    "filter_source": {"ja": "出典で絞り込み", "en": "Filter by source"},
    "filter_status": {"ja": "ステータスで絞り込み", "en": "Filter by status"},
    "start": {"ja": "開始", "en": "Start"},
    "no_questions": {"ja": "条件に合う問題がありません。絞り込みや出題モードを変更してください。", "en": "No questions match these conditions. Change the filters or the mode."},
    "fewer_questions": {"ja": "条件に合う問題が {n} 問しかないため、{n} 問を出題します。", "en": "Only {n} questions match these conditions, so {n} will be asked."},

    # 出題
    "progress": {"ja": "{i} / {n} 問", "en": "Question {i} of {n}"},
    "choose_one": {"ja": "1つ選んでください", "en": "Choose one"},
    "choose_two": {"ja": "2つ選んでください", "en": "Choose two"},
    "submit": {"ja": "回答する", "en": "Submit"},
    "need_selection": {"ja": "選択肢を選んでください。", "en": "Please select an answer."},
    "need_two": {"ja": "2つ選んでください。", "en": "Please select two answers."},
    "correct": {"ja": "正解", "en": "Correct"},
    "incorrect": {"ja": "不正解", "en": "Incorrect"},
    "correct_answer": {"ja": "正解", "en": "Correct answer"},
    "your_answer": {"ja": "あなたの回答", "en": "Your answer"},
    "explanation": {"ja": "解説", "en": "Explanation"},
    "next": {"ja": "次へ", "en": "Next"},
    "finish": {"ja": "結果を見る", "en": "See results"},
    "quit": {"ja": "中断してホームに戻る", "en": "Quit and go home"},

    # 結果・復習
    "result_title": {"ja": "結果", "en": "Results"},
    "score": {"ja": "スコア：{c} / {n}（正答率 {p:.0f}%）", "en": "Score: {c} / {n} ({p:.0f}% correct)"},
    "review": {"ja": "復習", "en": "Review"},
    "change_status": {"ja": "ステータスを変更", "en": "Change status"},
    "status_saved": {"ja": "ステータスを更新しました。", "en": "Status updated."},

    # 問題一覧
    "list_title": {"ja": "問題一覧", "en": "Question list"},
    "list_count": {"ja": "{n} 問", "en": "{n} questions"},
    "list_hint": {"ja": "「ステータス」列を編集すると保存されます。", "en": "Edit the Status column to save changes."},

    # 成績
    "stats_title": {"ja": "成績", "en": "Stats"},
    "by_domain": {"ja": "ドメイン別の正答率（全回答が対象）", "en": "Accuracy by domain (all answers)"},
    "answers_n": {"ja": "回答数", "en": "Answers"},
    "correct_n": {"ja": "正解数", "en": "Correct"},
    "accuracy": {"ja": "正答率", "en": "Accuracy"},
    "by_status": {"ja": "ステータス別の問題数", "en": "Questions by status"},
    "count_n": {"ja": "問題数", "en": "Questions"},
    "no_history": {"ja": "まだ回答履歴がありません。", "en": "No answers yet."},
    "reset_title": {"ja": "学習履歴のリセット", "en": "Reset learning history"},
    "reset_warning": {"ja": "回答履歴とすべてのステータスを削除します。元に戻せません。", "en": "This deletes all answer history and statuses. This cannot be undone."},
    "reset_confirm": {"ja": "削除することを理解しました", "en": "I understand this will delete everything"},
    "reset_button": {"ja": "リセットする", "en": "Reset"},
    "reset_done": {"ja": "学習履歴をリセットしました。", "en": "Learning history has been reset."},
}


def t(key, lang, **kwargs):
    text = TEXT[key][lang]
    return text.format(**kwargs) if kwargs else text
