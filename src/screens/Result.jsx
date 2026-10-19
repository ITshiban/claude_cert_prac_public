import { t } from "../i18n.js";
import { displayLabels, formatKeys, relabel, statusOf } from "../quiz.js";
import { QuestionMeta, RichText, StatusSelect } from "../components.jsx";

export default function Result({ lang, session, byId, statuses, onSetStatus, onHome }) {
  const n = session.answers.length;
  const c = session.answers.filter((a) => a.correct).length;
  const p = n ? Math.round((c / n) * 100) : 0;

  return (
    <section>
      <h2>{t("result_title", lang)}</h2>
      <p className="score">{t("score", lang, { c, n, p })}</p>

      <h3>{t("review", lang)}</h3>
      <p className="hint">{t("review_hint", lang)}</p>
      <div className="review-list">
        {session.answers.map((a, i) => {
          const q = byId[a.questionId];
          const order = session.orders[q.id];
          const labels = displayLabels(order);
          return (
            <details key={q.id} className="card">
              <summary>
                <span className={`mark ${a.correct ? "ok" : "ng"}`}>{a.correct ? "✓" : "✗"}</span>
                <span className="summary-text">{i + 1}. {q.question[lang]}</span>
              </summary>
              <QuestionMeta question={q} lang={lang} />
              <div className="question"><RichText text={q.question[lang]} /></div>
              <ol className="choice-list">
                {order.map((k) => (
                  <li key={k} className={q.answer.includes(k) ? "right" : a.selected.includes(k) ? "wrong" : ""}>
                    <span className="num">{labels[k]}.</span> {q.choices.find((ch) => ch.key === k)[lang]}
                  </li>
                ))}
              </ol>
              <p>
                <strong>{t("your_answer", lang)}</strong>: {formatKeys(a.selected, labels)}
                <span className="sep">|</span>
                <strong>{t("correct_answer", lang)}</strong>: {formatKeys(q.answer, labels)}
                <span className="sep">|</span>
                <span className={a.correct ? "text-ok" : "text-ng"}>{a.correct ? t("correct", lang) : t("incorrect", lang)}</span>
              </p>
              <h4>{t("explanation", lang)}</h4>
              <div className="explanation"><RichText text={relabel(q.explanation[lang], labels)} /></div>
              <StatusSelect
                lang={lang}
                label={t("change_status", lang)}
                value={statusOf(statuses, q.id)}
                onChange={(s) => onSetStatus(q.id, s)}
              />
            </details>
          );
        })}
      </div>

      <button type="button" className="primary" onClick={onHome}>{t("back_home", lang)}</button>
    </section>
  );
}
