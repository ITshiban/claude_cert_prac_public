import { useEffect, useState } from "react";
import { t, tParts } from "./i18n.js";
import { createSession, filterQuestions, isCorrect, selectQuestions } from "./quiz.js";
import { dropUnknownSession, load, save } from "./storage.js";
import Home from "./screens/Home.jsx";
import Quiz from "./screens/Quiz.jsx";
import Result from "./screens/Result.jsx";
import List from "./screens/List.jsx";
import Stats from "./screens/Stats.jsx";
import Settings from "./screens/Settings.jsx";

const QUESTIONS_URL = `${import.meta.env.BASE_URL}questions.json`;

const NAV = ["home", "list", "stats", "settings"];

const isComplete = (s) => s !== null && s.answers.length === s.questionIds.length;

export default function App() {
  const [questions, setQuestions] = useState(null);
  const [loadError, setLoadError] = useState(false);
  // 保存データ（settings / statuses / history / currentSession）をそのまま状態として持つ
  const [boot] = useState(() => load());
  const [data, setData] = useState(boot.data);
  const [storageWarning, setStorageWarning] = useState(boot.warning); // 読み込み・保存の注意
  // 結果画面のまま閉じていた場合は結果画面から、それ以外はホームから始める
  const [page, setPage] = useState(() => (isComplete(boot.data.currentSession) ? "result" : "home"));
  const [notice, setNotice] = useState(""); // 出題開始時のお知らせ（件数不足）
  const [warning, setWarning] = useState(""); // ホームの警告（該当0件）

  const lang = data.settings.lang;
  const session = data.currentSession;
  const byId = questions ? Object.fromEntries(questions.map((q) => [q.id, q])) : {};

  useEffect(() => {
    fetch(QUESTIONS_URL)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((qs) => {
        setQuestions(qs);
        const ids = new Set(qs.map((q) => q.id));
        setData((d) => dropUnknownSession(d, ids));
      })
      .catch(() => setLoadError(true));
  }, []);

  // 状態が変わるたびに保存する（回答・ステータス変更・設定変更・クールの進行）
  useEffect(() => {
    if (!save(data) && boot.warning !== "unavailable") setStorageWarning("save_failed");
  }, [data, boot.warning]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const update = (patch) => setData((d) => ({ ...d, ...patch }));
  const setSettings = (settings) => update({ settings });

  function start() {
    const { count, mode, domains, sources } = data.settings;
    const picked = selectQuestions(filterQuestions(questions, domains, sources), count, mode, data.statuses);
    if (picked.length === 0) {
      setWarning(t("no_questions", lang));
      return;
    }
    setWarning("");
    setNotice(picked.length < count ? t("fewer_questions", lang, { n: picked.length }) : "");
    update({ currentSession: createSession(picked) });
    setPage("quiz");
  }

  function submit(selected) {
    setData((d) => {
      const s = d.currentSession;
      if (s.answers.length !== s.index) return d; // 二重登録防止
      const id = s.questionIds[s.index];
      const correct = isCorrect(byId[id], selected);
      return {
        ...d,
        currentSession: { ...s, answers: [...s.answers, { questionId: id, selected, correct }] },
        history: [...d.history, { questionId: id, selected, correct, answeredAt: new Date().toISOString() }],
        statuses: { ...d.statuses, [id]: correct ? "correct" : "incorrect" },
      };
    });
  }

  function next() {
    if (session.index === session.questionIds.length - 1) {
      setPage("result");
      return;
    }
    update({ currentSession: { ...session, index: session.index + 1 } });
  }

  // 画面を移る。結果画面から離れるときは、終わったクールを片付ける
  function navigate(to) {
    if (page === "result") {
      update({ currentSession: null });
      setNotice("");
    }
    setWarning("");
    setPage(to);
  }

  function discardSession() {
    update({ currentSession: null });
    setNotice("");
  }

  function setStatus(id, status) {
    setData((d) => ({ ...d, statuses: { ...d.statuses, [id]: status } }));
  }

  function importRecords(imported) {
    const ids = new Set(questions.map((q) => q.id));
    setData(dropUnknownSession(imported, ids));
    setNotice("");
  }

  function resetRecords() {
    update({ statuses: {}, history: [], currentSession: null });
    setNotice("");
  }

  const inProgress = session && !isComplete(session) ? session : null;

  let content;
  if (loadError) content = <p className="notice warn">{t("load_error", lang)}</p>;
  else if (!questions) content = <p>{t("loading", lang)}</p>;
  else if (page === "quiz" && session) {
    const id = session.questionIds[session.index];
    content = (
      <Quiz
        key={`${id}-${session.index}`}
        lang={lang}
        question={byId[id]}
        order={session.orders[id]}
        index={session.index}
        total={session.questionIds.length}
        answer={session.answers[session.index] ?? null}
        notice={notice}
        onSubmit={submit}
        onNext={next}
        onQuit={() => navigate("home")}
      />
    );
  } else if (page === "result" && session) {
    content = (
      <Result lang={lang} session={session} byId={byId} statuses={data.statuses} onSetStatus={setStatus}
        onHome={() => navigate("home")} />
    );
  } else if (page === "list") {
    content = <List lang={lang} questions={questions} statuses={data.statuses} onSetStatus={setStatus} />;
  } else if (page === "stats") {
    content = <Stats lang={lang} questions={questions} statuses={data.statuses} history={data.history} />;
  } else if (page === "settings") {
    content = (
      <Settings lang={lang} data={data} onSetLang={(l) => setSettings({ ...data.settings, lang: l })}
        onReset={resetRecords} onImport={importRecords} />
    );
  } else {
    content = (
      <Home lang={lang} settings={data.settings} onChange={setSettings} onStart={start} warning={warning}
        session={inProgress} onResume={() => setPage("quiz")} onDiscard={discardSession} />
    );
  }

  return (
    <div className="app">
      <header>
        <div className="brand">
          <h1>{t("app_title", lang)}</h1>
          <p>{t("app_subtitle", lang)}</p>
        </div>
        <div className="lang-switch" role="group" aria-label={t("language", lang)}>
          {["ja", "en"].map((l) => (
            <button key={l} type="button" className={l === lang ? "active" : ""} onClick={() => setSettings({ ...data.settings, lang: l })}>
              {l === "ja" ? "日本語" : "English"}
            </button>
          ))}
        </div>
        <nav>
          {NAV.map((p) => (
            <button key={p} type="button" className={page === p ? "active" : ""} onClick={() => navigate(p)}>
              {t(`page_${p}`, lang)}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {storageWarning && (
          <div className="notice warn storage-warning">
            <span>{t(storageWarning === "save_failed" ? "save_failed" : `storage_${storageWarning}`, lang)}</span>
            <button type="button" className="link" onClick={() => setStorageWarning(null)}>{t("dismiss", lang)}</button>
          </div>
        )}
        {content}
      </main>
      <footer>
        {tParts("footer", lang, {
          link: (
            <a key="link" href="https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS" target="_blank" rel="noreferrer">
              CLAUDE-CERTIFICATIONS
            </a>
          ),
        })}{" "}
        <a href={`${import.meta.env.BASE_URL}THIRD_PARTY_NOTICES.txt`} target="_blank" rel="noreferrer">
          {t("notices", lang)}
        </a>
      </footer>
    </div>
  );
}
