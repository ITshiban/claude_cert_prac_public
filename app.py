"""Claude Certified Associate – Foundations 練習問題アプリ（エントリーポイント・画面の切替）。"""
import pandas as pd
import streamlit as st

import db
import quiz
from i18n import t

st.set_page_config(page_title="CCA-F Practice", page_icon="📝", layout="centered")

# --- session_state の初期化（キーはここで一括定義） ---
DEFAULTS = {
    "lang": "ja",
    "page": "home",          # home / quiz / result / list / stats
    "settings": {"count": 10, "mode": "random", "domains": list(quiz.DOMAINS), "sources": list(quiz.SOURCE_GROUPS)},
    "quiz_ids": [],          # 今回のクールで出題する問題ID
    "orders": {},            # {question_id: 選択肢 key の表示順}
    "index": 0,              # 現在の問題番号（0始まり）
    "results": [],           # [{"id", "selected", "correct"}]
    "answered": False,       # 現在の問題に回答済みか（再実行での二重登録防止）
    "notice": None,          # 出題開始時のお知らせ（件数不足など）
    "list_version": 0,       # 問題一覧の編集表をリセットするためのカウンタ
}
for key, value in DEFAULTS.items():
    if key not in st.session_state:
        st.session_state[key] = value


@st.cache_data
def load_questions():
    return quiz.load_questions()


NICKNAME_MAX = 20

QUESTIONS = load_questions()
BY_ID = {q["id"]: q for q in QUESTIONS}
conn = db.connect()


def go(page):
    st.session_state.page = page


def domain_label(d):
    return f"{d}. {quiz.DOMAINS[d]}"


def status_label(s):
    return t(f"status_{s}", L)


def source_caption(q):
    if q["source"] == "original":
        return t("source_original", L)
    name = t(f"source_{q['source']}", L)
    return f"[{t('source_link', L, name=name, num=q['source_number'])}]({q['source_url']})"


def choice_text(q, key):
    return next(c[L] for c in q["choices"] if c["key"] == key)


def format_keys(keys, labels):
    """key のリストを表示番号順の "1, 3" 形式にする。"""
    return ", ".join(sorted(labels[k] for k in keys))


def save_status(question_id, widget_key):
    # コールバックは次の実行のスレッドで呼ばれるため、接続はここで開き直す
    db.set_status(db.connect(), question_id, st.session_state[widget_key])
    st.toast(t("status_saved", L))


# --- サイドバー ---
with st.sidebar:
    st.radio("言語 / Language", ["ja", "en"], key="lang",
             format_func=lambda x: "日本語" if x == "ja" else "English", horizontal=True)
    L = st.session_state.lang  # この実行で表示する言語
    nickname = db.get_nickname(conn)
    if nickname:
        st.markdown(f"**{t('greeting', L, name=nickname)}**")
    st.subheader(t("menu", L))
    for page in ("home", "list", "stats"):
        st.button(t(f"page_{page}", L), on_click=go, args=(page,), width="stretch")


# --- ホーム ---
def page_home():
    st.title(t("app_title", L))
    with st.form("nickname_form", border=False):
        col1, col2 = st.columns([4, 1], vertical_alignment="bottom")
        name = col1.text_input(t("nickname", L), value=nickname, max_chars=NICKNAME_MAX,
                               help=t("nickname_help", L, n=NICKNAME_MAX))
        if col2.form_submit_button(t("nickname_save", L), width="stretch"):
            name = name.strip()
            if len(name) > NICKNAME_MAX:
                st.warning(t("nickname_too_long", L, n=NICKNAME_MAX))
            else:
                db.set_nickname(conn, name)
                st.toast(t("nickname_saved", L))
                st.rerun()

    s = st.session_state.settings
    count = st.radio(t("count", L), [5, 10, 20], index=[5, 10, 20].index(s["count"]),
                     format_func=lambda n: t("count_option", L, n=n), horizontal=True)
    mode = st.radio(t("mode", L), quiz.MODES, index=quiz.MODES.index(s["mode"]),
                    format_func=lambda m: t(f"mode_{m}", L), horizontal=True)
    domains = st.multiselect(t("filter_domain", L), list(quiz.DOMAINS), default=s["domains"],
                             format_func=domain_label)
    sources = st.multiselect(t("filter_source", L), quiz.SOURCE_GROUPS, default=s["sources"],
                             format_func=lambda g: t(f"source_{g}", L) if g != "original" else t("source_original", L))
    st.session_state.settings = {"count": count, "mode": mode, "domains": domains, "sources": sources}

    if st.button(t("start", L), type="primary"):
        candidates = quiz.filter_questions(QUESTIONS, set(domains), set(sources))
        picked = quiz.select_questions(candidates, count, mode, db.get_statuses(conn))
        if not picked:
            st.warning(t("no_questions", L))
            return
        st.session_state.quiz_ids = [q["id"] for q in picked]
        st.session_state.orders = {q["id"]: quiz.shuffled_keys(q) for q in picked}
        st.session_state.index = 0
        st.session_state.results = []
        st.session_state.answered = False
        st.session_state.notice = t("fewer_questions", L, n=len(picked)) if len(picked) < count else None
        go("quiz")
        st.rerun()


# --- 出題 ---
def page_quiz():
    ids, i = st.session_state.quiz_ids, st.session_state.index
    if not ids:
        go("home")
        st.rerun()
    if st.session_state.notice:
        st.info(st.session_state.notice)

    q = BY_ID[ids[i]]
    order = st.session_state.orders[q["id"]]
    labels = quiz.display_labels(order)
    answered = st.session_state.answered

    st.progress(i / len(ids), text=t("progress", L, i=i + 1, n=len(ids)))
    st.caption(f"{t('domain', L)}: {domain_label(q['domain'])}　|　{t('source', L)}: {source_caption(q)}")
    st.markdown(q["question"][L])

    widget = f"ans_{i}_{q['id']}"
    if q["type"] == "single":
        choice = st.radio(t("choose_one", L), order, index=None, key=widget, disabled=answered,
                          format_func=lambda k: f"{labels[k]}. {choice_text(q, k)}")
        selected = [choice] if choice else []
    else:
        st.write(t("choose_two", L))
        selected = [k for k in order
                    if st.checkbox(f"{labels[k]}. {choice_text(q, k)}", key=f"{widget}_{k}", disabled=answered)]

    if not answered:
        if st.button(t("submit", L), type="primary"):
            need = len(q["answer"])
            if len(selected) != need:
                st.warning(t("need_selection", L) if need == 1 else t("need_two", L))
            else:
                # 結果の件数が現在の問題番号と一致するときだけ記録する（二重登録防止）
                if len(st.session_state.results) == i:
                    correct = quiz.is_correct(q, selected)
                    db.record_answer(conn, q["id"], selected, correct)
                    st.session_state.results.append({"id": q["id"], "selected": selected, "correct": correct})
                st.session_state.answered = True
                st.rerun()
    else:
        r = st.session_state.results[i]
        if r["correct"]:
            st.success(t("correct", L))
        else:
            st.error(t("incorrect", L))
        st.markdown(f"**{t('your_answer', L)}**: {format_keys(r['selected'], labels)}　"
                    f"**{t('correct_answer', L)}**: {format_keys(q['answer'], labels)}")
        st.markdown(f"**{t('explanation', L)}**")
        st.markdown(quiz.relabel(q["explanation"][L], labels))
        last = i == len(ids) - 1
        if st.button(t("finish", L) if last else t("next", L), type="primary"):
            st.session_state.answered = False
            if last:
                go("result")
            else:
                st.session_state.index += 1
            st.rerun()

    st.button(t("quit", L), on_click=go, args=("home",))


# --- 結果・復習 ---
def page_result():
    results = st.session_state.results
    if not results:
        go("home")
        st.rerun()
    st.title(t("result_title", L))
    n, c = len(results), sum(r["correct"] for r in results)
    st.metric(t("score", L, c=c, n=n, p=c / n * 100), f"{c / n * 100:.0f}%")

    st.subheader(t("review", L))
    statuses = db.get_statuses(conn)
    for no, r in enumerate(results, start=1):
        q = BY_ID[r["id"]]
        order = st.session_state.orders[q["id"]]
        labels = quiz.display_labels(order)
        mark = "✅" if r["correct"] else "❌"
        with st.expander(f"{mark} {no}. {q['question'][L][:60]}…"):
            st.caption(f"{q['id']}　|　{domain_label(q['domain'])}　|　{source_caption(q)}")
            st.markdown(q["question"][L])
            for k in order:
                st.markdown(f"- {labels[k]}. {choice_text(q, k)}")
            st.markdown(f"**{t('your_answer', L)}**: {format_keys(r['selected'], labels)}　"
                        f"**{t('correct_answer', L)}**: {format_keys(q['answer'], labels)}　"
                        f"→ {t('correct', L) if r['correct'] else t('incorrect', L)}")
            st.markdown(f"**{t('explanation', L)}**")
            st.markdown(quiz.relabel(q["explanation"][L], labels))
            current = statuses.get(q["id"], "unanswered")
            key = f"res_status_{no}_{q['id']}"
            st.selectbox(t("change_status", L), quiz.STATUSES, index=quiz.STATUSES.index(current),
                         format_func=status_label, key=key, on_change=save_status, args=(q["id"], key))

    st.button(t("back_home", L), on_click=go, args=("home",), type="primary")


# --- 問題一覧 ---
def page_list():
    st.title(t("list_title", L))
    statuses = db.get_statuses(conn)
    f_status = st.multiselect(t("filter_status", L), quiz.STATUSES, default=quiz.STATUSES, format_func=status_label)
    f_domain = st.multiselect(t("filter_domain", L), list(quiz.DOMAINS), default=list(quiz.DOMAINS),
                              format_func=domain_label)
    f_source = st.multiselect(t("filter_source", L), quiz.SOURCE_GROUPS, default=quiz.SOURCE_GROUPS,
                              format_func=lambda g: t(f"source_{g}", L) if g != "original" else t("source_original", L))

    rows = [
        q for q in quiz.filter_questions(QUESTIONS, set(f_domain), set(f_source))
        if statuses.get(q["id"], "unanswered") in f_status
    ]
    st.caption(t("list_count", L, n=len(rows)) + "　" + t("list_hint", L))
    label_to_status = {status_label(s): s for s in quiz.STATUSES}
    df = pd.DataFrame({
        "id": [q["id"] for q in rows],
        "domain": [q["domain"] for q in rows],
        "source": [t(f"source_{q['source']}", L) if q["source"] != "original" else t("source_original", L) for q in rows],
        "question": [q["question"][L] for q in rows],
        "status": [status_label(statuses.get(q["id"], "unanswered")) for q in rows],
    })
    edited = st.data_editor(
        df,
        key=f"list_editor_{st.session_state.list_version}_{L}",
        hide_index=True,
        width="stretch",
        disabled=["id", "domain", "source", "question"],
        column_config={
            "id": "ID",
            "domain": st.column_config.NumberColumn(t("domain", L), width="small"),
            "source": t("source", L),
            "question": st.column_config.TextColumn(t("question", L), width="large"),
            "status": st.column_config.SelectboxColumn(t("status", L), options=list(label_to_status), required=True),
        },
    )
    changed = edited[edited["status"] != df["status"]]
    if not changed.empty:
        for qid, label in zip(changed["id"], changed["status"]):
            db.set_status(conn, qid, label_to_status[label])
        st.session_state.list_version += 1
        st.toast(t("status_saved", L))
        st.rerun()


# --- 成績 ---
def page_stats():
    st.title(t("stats_title", L))
    history = db.get_history(conn)

    st.subheader(t("by_domain", L))
    if not history:
        st.info(t("no_history", L))
    else:
        acc = quiz.domain_accuracy(history, QUESTIONS)
        st.dataframe(pd.DataFrame({
            t("domain", L): [domain_label(d) for d in acc],
            t("answers_n", L): [n for _, n in acc.values()],
            t("correct_n", L): [c for c, _ in acc.values()],
            t("accuracy", L): [f"{c / n * 100:.0f}%" if n else "-" for c, n in acc.values()],
        }), hide_index=True, width="stretch")

    st.subheader(t("by_status", L))
    counts = quiz.status_counts(QUESTIONS, db.get_statuses(conn))
    st.dataframe(pd.DataFrame({
        t("status", L): [status_label(s) for s in counts],
        t("count_n", L): list(counts.values()),
    }), hide_index=True, width="stretch")

    st.subheader(t("reset_title", L))
    st.warning(t("reset_warning", L))
    confirmed = st.checkbox(t("reset_confirm", L))
    if st.button(t("reset_button", L), disabled=not confirmed):
        db.reset(conn)
        st.success(t("reset_done", L))


PAGES = {"home": page_home, "quiz": page_quiz, "result": page_result, "list": page_list, "stats": page_stats}
PAGES[st.session_state.page]()

st.divider()
st.caption(t("footer", L))
