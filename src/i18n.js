// UI文言の辞書（ja / en）。画面に出す文字列はすべてここから取得する。

const TEXT = {
  // 共通
  app_title: { ja: "CCA-F 練習問題", en: "CCA-F Practice" },
  app_subtitle: { ja: "Claude Certified Associate – Foundations", en: "Claude Certified Associate – Foundations" },
  language: { ja: "言語", en: "Language" },
  page_home: { ja: "ホーム", en: "Home" },
  page_list: { ja: "問題一覧", en: "Questions" },
  page_stats: { ja: "成績", en: "Stats" },
  page_settings: { ja: "設定", en: "Settings" },
  footer: {
    ja: "本アプリは非公式の練習用アプリであり、Anthropic とは関係ありません。問題の一部は Amey Thakur 氏の {link}（MIT License）に由来します。",
    en: "This is an unofficial practice app, not affiliated with Anthropic. Some questions come from Amey Thakur's {link} (MIT License).",
  },
  loading: { ja: "問題データを読み込んでいます…", en: "Loading questions…" },
  load_error: { ja: "問題データを読み込めませんでした。ページを再読み込みしてください。", en: "Could not load the questions. Please reload the page." },
  domain: { ja: "ドメイン", en: "Domain" },
  source: { ja: "出典", en: "Source" },
  status: { ja: "ステータス", en: "Status" },
  question: { ja: "問題", en: "Question" },
  source_original: { ja: "オリジナル", en: "Original" },
  source_link: { ja: "{name} 第{num}問", en: "{name}, Q{num}" },
  source_practice: { ja: "Practice questions", en: "Practice questions" },
  source_mock: { ja: "Mock exam", en: "Mock exam" },
  source_mock1: { ja: "Mock exam 1", en: "Mock exam 1" },
  source_mock2: { ja: "Mock exam 2", en: "Mock exam 2" },
  source_mock3: { ja: "Mock exam 3", en: "Mock exam 3" },
  status_correct: { ja: "回答済み正解", en: "Answered correctly" },
  status_incorrect: { ja: "回答済み不正解", en: "Answered incorrectly" },
  status_unanswered: { ja: "未回答", en: "Unanswered" },
  back_home: { ja: "ホームに戻る", en: "Back to home" },

  // ホーム
  count: { ja: "出題数", en: "Number of questions" },
  count_option: { ja: "{n}問", en: "{n}" },
  mode: { ja: "出題モード", en: "Mode" },
  mode_random: { ja: "ランダム", en: "Random" },
  mode_unanswered: { ja: "未回答のみ", en: "Unanswered only" },
  mode_incorrect: { ja: "不正解のみ", en: "Incorrect only" },
  filter_domain: { ja: "ドメインで絞り込み", en: "Filter by domain" },
  filter_source: { ja: "出典で絞り込み", en: "Filter by source" },
  filter_status: { ja: "ステータスで絞り込み", en: "Filter by status" },
  select_all: { ja: "すべて選択", en: "Select all" },
  clear_all: { ja: "すべて解除", en: "Clear all" },
  start: { ja: "開始", en: "Start" },
  no_questions: { ja: "条件に合う問題がありません。絞り込みや出題モードを変更してください。", en: "No questions match these conditions. Change the filters or the mode." },
  fewer_questions: { ja: "条件に合う問題が {n} 問しかないため、{n} 問を出題します。", en: "Only {n} questions match these conditions, so {n} will be asked." },

  // 出題
  progress: { ja: "{i} / {n} 問", en: "Question {i} of {n}" },
  choose_one: { ja: "1つ選んでください", en: "Choose one" },
  choose_two: { ja: "2つ選んでください", en: "Choose two" },
  submit: { ja: "回答する", en: "Submit" },
  need_selection: { ja: "選択肢を選んでください。", en: "Please select an answer." },
  need_two: { ja: "2つ選んでください。", en: "Please select two answers." },
  correct: { ja: "正解", en: "Correct" },
  incorrect: { ja: "不正解", en: "Incorrect" },
  correct_answer: { ja: "正解", en: "Correct answer" },
  your_answer: { ja: "あなたの回答", en: "Your answer" },
  explanation: { ja: "解説", en: "Explanation" },
  next: { ja: "次へ", en: "Next" },
  finish: { ja: "結果を見る", en: "See results" },
  quit: { ja: "中断してホームに戻る", en: "Quit and go home" },

  // 結果・復習
  result_title: { ja: "結果", en: "Results" },
  score: { ja: "{c} / {n} 問正解（正答率 {p}%）", en: "{c} of {n} correct ({p}%)" },
  review: { ja: "復習", en: "Review" },
  change_status: { ja: "ステータスを変更", en: "Change status" },
  review_hint: { ja: "各問題を開くと、選択肢・解説の確認とステータスの変更ができます。", en: "Open each question to see the choices and explanation, and to change its status." },

  // 進行中のクール
  session_in_progress: { ja: "進行中のクールがあります（{i} / {n} 問）。", en: "You have a quiz in progress ({i} of {n})." },
  resume: { ja: "続きから再開", en: "Resume" },
  discard: { ja: "破棄して新しく始める", en: "Discard and start over" },

  // 問題一覧
  list_title: { ja: "問題一覧", en: "Question list" },
  list_count: { ja: "{n} 問", en: "{n} questions" },
  no_match: { ja: "条件に合う問題はありません。", en: "No questions match." },

  // 成績
  stats_title: { ja: "成績", en: "Stats" },
  by_domain: { ja: "ドメイン別の正答率（全回答が対象）", en: "Accuracy by domain (all answers)" },
  answers_n: { ja: "回答数", en: "Answers" },
  correct_n: { ja: "正解数", en: "Correct" },
  accuracy: { ja: "正答率", en: "Accuracy" },
  total: { ja: "合計", en: "Total" },
  by_status: { ja: "ステータス別の問題数", en: "Questions by status" },
  count_n: { ja: "問題数", en: "Questions" },
  no_history: { ja: "まだ回答履歴がありません。", en: "No answers yet." },

  // 設定
  settings_title: { ja: "設定", en: "Settings" },
  storage_title: { ja: "学習記録", en: "Learning records" },
  storage_note: {
    ja: "記録はこのブラウザにだけ保存されます。ブラウザのデータを削除すると消えるため、必要に応じてエクスポートしてください。",
    en: "Your records are saved only in this browser. Clearing browser data deletes them, so export them when needed.",
  },
  export: { ja: "エクスポート", en: "Export" },
  import: { ja: "インポート", en: "Import" },
  reset_title: { ja: "学習記録のリセット", en: "Reset learning records" },
  reset_warning: { ja: "回答履歴・すべてのステータス・進行中のクールを削除します。元に戻せません。", en: "This deletes all answer history, statuses, and any quiz in progress. This cannot be undone." },
  reset_button: { ja: "リセットする", en: "Reset" },
  reset_confirm: { ja: "本当に削除しますか？", en: "Delete everything?" },
  reset_yes: { ja: "削除する", en: "Delete" },
  cancel: { ja: "キャンセル", en: "Cancel" },
  reset_done: { ja: "学習記録をリセットしました。", en: "Learning records have been reset." },
};

/** 文言を返す。params の {name} を置き換える */
export function t(key, lang, params = {}) {
  const entry = TEXT[key];
  if (!entry) throw new Error(`missing i18n key: ${key}`);
  return entry[lang].replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m));
}

/** {name} を React 要素に置き換えたい文言用。文字列と要素の配列を返す */
export function tParts(key, lang, nodes) {
  return TEXT[key][lang].split(/(\{\w+\})/).map((part) => {
    const m = part.match(/^\{(\w+)\}$/);
    return m && m[1] in nodes ? nodes[m[1]] : part;
  });
}
