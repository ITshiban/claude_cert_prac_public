import { useEffect, useState } from "react";
import { t, tParts } from "./i18n.js";
import { createSession, DOMAIN_IDS, filterQuestions, isCorrect, selectQuestions, SOURCE_GROUPS } from "./quiz.js";
import Home from "./screens/Home.jsx";
import Quiz from "./screens/Quiz.jsx";
import Result from "./screens/Result.jsx";
import List from "./screens/List.jsx";
import Stats from "./screens/Stats.jsx";
import Settings from "./screens/Settings.jsx";

const QUESTIONS_URL = `${import.meta.env.BASE_URL}questions.json`;

const NAV = ["home", "list", "stats", "settings"];

// 保存データと同じ形で状態を持つ（保存は Phase 3 で追加）
function initialData() {
  return {
    schemaVersion: 1,
    settings: { lang: "ja", count: 10, mode: "random", domains: DOMAIN_IDS, sources: SOURCE_GROUPS },
    statuses: {},
    history: [],
    currentSession: null,
  };
}

export default function App() {
  const [questions, setQuestions] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState("home"); // home / quiz / result / list / stats / settings
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
      .then(setQuestions)
      .catch(() => setLoadError(true));
  }, []);

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

  function resetRecords() {
    update({ statuses: {}, history: [], currentSession: null });
    setNotice("");
  }

  const inProgress = session && session.answers.length < session.questionIds.length ? session : null;

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
    content = <Settings lang={lang} onSetLang={(l) => setSettings({ ...data.settings, lang: l })} onReset={resetRecords} />;
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
      <main>{content}</main>
      <footer>
        {tParts("footer", lang, {
          link: (
            <a key="link" href="https://github.com/Amey-Thakur/CLAUDE-CERTIFICATIONS" target="_blank" rel="noreferrer">
              CLAUDE-CERTIFICATIONS
            </a>
          ),
        })}
      </footer>
    </div>
  );
}
