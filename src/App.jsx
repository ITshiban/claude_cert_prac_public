import { useEffect, useState } from "react";
import { t, tParts } from "./i18n.js";
import { createSession, DOMAIN_IDS, filterQuestions, isCorrect, selectQuestions, SOURCE_GROUPS } from "./quiz.js";
import Home from "./screens/Home.jsx";
import Quiz from "./screens/Quiz.jsx";
import Result from "./screens/Result.jsx";

const QUESTIONS_URL = `${import.meta.env.BASE_URL}questions.json`;

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
  const [page, setPage] = useState("home"); // home / quiz / result
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

  function finish() {
    update({ currentSession: null });
    setNotice("");
    setPage("home");
  }

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
        onQuit={() => setPage("home")}
      />
    );
  } else if (page === "result" && session) {
    content = <Result lang={lang} session={session} onHome={finish} />;
  } else {
    content = <Home lang={lang} settings={data.settings} onChange={setSettings} onStart={start} warning={warning} />;
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
