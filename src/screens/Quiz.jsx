import { useState } from "react";
import { t } from "../i18n.js";
import { displayLabels, formatKeys, relabel } from "../quiz.js";
import { QuestionMeta, RichText } from "../components.jsx";

// 親で key={問題番号} を付けて使う（問題が変わると選択状態がリセットされる）
export default function Quiz({ lang, question, order, index, total, answer, notice, onSubmit, onNext, onQuit }) {
  const [selected, setSelected] = useState([]);
  const [warning, setWarning] = useState("");
  const labels = displayLabels(order);
  const multiple = question.type === "multiple";
  const answered = answer !== null;
  const last = index === total - 1;
  const choiceText = (key) => question.choices.find((c) => c.key === key)[lang];

  function choose(key) {
    if (answered) return;
    setWarning("");
    setSelected(multiple ? (selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]) : [key]);
  }

  function submit() {
    const need = question.answer.length;
    if (selected.length !== need) {
      setWarning(need === 1 ? t("need_selection", lang) : t("need_two", lang));
      return;
    }
    onSubmit(selected);
  }

  const shown = answered ? answer.selected : selected;

  return (
    <section>
      {notice && <p className="notice info">{notice}</p>}
      <div className="progress" aria-label={t("progress", lang, { i: index + 1, n: total })}>
        <div className="bar" style={{ width: `${((index + (answered ? 1 : 0)) / total) * 100}%` }} />
      </div>
      <p className="progress-text">{t("progress", lang, { i: index + 1, n: total })}</p>
      <QuestionMeta question={question} lang={lang} />
      <div className="question"><RichText text={question.question[lang]} /></div>

      <fieldset className="choices" disabled={answered}>
        <legend>{multiple ? t("choose_two", lang) : t("choose_one", lang)}</legend>
        {order.map((key) => {
          const cls = answered ? (question.answer.includes(key) ? "right" : shown.includes(key) ? "wrong" : "") : "";
          return (
            <label key={key} className={`choice ${cls}`}>
              <input
                type={multiple ? "checkbox" : "radio"}
                name={`q-${question.id}`}
                checked={shown.includes(key)}
                onChange={() => choose(key)}
              />
              <span className="num">{labels[key]}.</span>
              <span>{choiceText(key)}</span>
            </label>
          );
        })}
      </fieldset>

      {warning && <p className="notice warn">{warning}</p>}

      {!answered ? (
        <button type="button" className="primary" onClick={submit}>{t("submit", lang)}</button>
      ) : (
        <div className="feedback">
          <p className={`verdict ${answer.correct ? "ok" : "ng"}`}>{answer.correct ? t("correct", lang) : t("incorrect", lang)}</p>
          <p>
            <strong>{t("your_answer", lang)}</strong>: {formatKeys(answer.selected, labels)}
            <span className="sep">|</span>
            <strong>{t("correct_answer", lang)}</strong>: {formatKeys(question.answer, labels)}
          </p>
          <h3>{t("explanation", lang)}</h3>
          <div className="explanation"><RichText text={relabel(question.explanation[lang], labels)} /></div>
          <button type="button" className="primary" onClick={onNext}>{last ? t("finish", lang) : t("next", lang)}</button>
        </div>
      )}

      <button type="button" className="link quit" onClick={onQuit}>{t("quit", lang)}</button>
    </section>
  );
}
