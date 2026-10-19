// 複数の画面で使う小さな部品
import { t } from "./i18n.js";
import { DOMAINS, STATUSES } from "./quiz.js";

/** 問題文・解説の表示。空行で段落を分け、**x** を太字にする */
export function RichText({ text }) {
  return text.split(/\n\n+/).map((para, i) => (
    <p key={i}>
      {para.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
        part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : part,
      )}
    </p>
  ));
}

export function domainLabel(d) {
  return `${d}. ${DOMAINS[d]}`;
}

/** 出典の表示。サイト由来は元ページへのリンク、独自問題は「オリジナル」 */
export function SourceLabel({ question, lang }) {
  if (question.source === "original") return t("source_original", lang);
  const name = t(`source_${question.source}`, lang);
  return (
    <a href={question.source_url} target="_blank" rel="noreferrer">
      {t("source_link", lang, { name, num: question.source_number })}
    </a>
  );
}

export function sourceGroupLabel(g, lang) {
  return g === "original" ? t("source_original", lang) : t(`source_${g}`, lang);
}

/** ステータスの選択欄 */
export function StatusSelect({ lang, value, onChange, label }) {
  return (
    <label className="status-select">
      <span>{label ?? t("status", lang)}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{t(`status_${s}`, lang)}</option>
        ))}
      </select>
    </label>
  );
}

/** チェックボックスで複数選択する絞り込み */
export function CheckGroup({ legend, options, selected, onChange, format, inline = false }) {
  const toggle = (v) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v].sort());
  return (
    <fieldset>
      <legend>{legend}</legend>
      <div className={`options${inline ? " inline" : ""}`}>
        {options.map((v) => (
          <label key={v}>
            <input type="checkbox" checked={selected.includes(v)} onChange={() => toggle(v)} />
            {format(v)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function QuestionMeta({ question, lang }) {
  return (
    <p className="meta">
      {t("domain", lang)}: {domainLabel(question.domain)}
      <span className="sep">|</span>
      {t("source", lang)}: <SourceLabel question={question} lang={lang} />
    </p>
  );
}
