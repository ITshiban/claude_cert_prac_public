import { useState } from "react";
import { t } from "../i18n.js";
import { DOMAIN_IDS, filterQuestions, SOURCE_GROUPS, STATUSES, statusOf } from "../quiz.js";
import { CheckGroup, domainLabel, RichText, sourceGroupLabel, SourceLabel, StatusSelect } from "../components.jsx";

export default function List({ lang, questions, statuses, onSetStatus }) {
  // 一覧の絞り込みは画面内だけで持つ（保存しない）
  const [fStatus, setFStatus] = useState(STATUSES);
  const [fDomain, setFDomain] = useState(DOMAIN_IDS);
  const [fSource, setFSource] = useState(SOURCE_GROUPS);

  const rows = filterQuestions(questions, fDomain, fSource).filter((q) => fStatus.includes(statusOf(statuses, q.id)));

  return (
    <section>
      <h2>{t("list_title", lang)}</h2>
      <CheckGroup legend={t("filter_status", lang)} options={STATUSES} selected={fStatus} onChange={setFStatus}
        format={(s) => t(`status_${s}`, lang)} inline />
      <CheckGroup legend={t("filter_domain", lang)} options={DOMAIN_IDS} selected={fDomain} onChange={setFDomain}
        format={domainLabel} />
      <CheckGroup legend={t("filter_source", lang)} options={SOURCE_GROUPS} selected={fSource} onChange={setFSource}
        format={(g) => sourceGroupLabel(g, lang)} inline />

      <p className="hint">{t("list_count", lang, { n: rows.length })}</p>
      {rows.length === 0 && <p>{t("no_match", lang)}</p>}
      <div className="question-list">
        {rows.map((q) => (
          <div key={q.id} className={`card row-card status-${statusOf(statuses, q.id)}`}>
            <p className="meta">
              {q.id}<span className="sep">|</span>{t("domain", lang)} {q.domain}
              <span className="sep">|</span><SourceLabel question={q} lang={lang} />
            </p>
            <details>
              <summary className="summary-text">{q.question[lang]}</summary>
              <div className="question"><RichText text={q.question[lang]} /></div>
            </details>
            <StatusSelect lang={lang} value={statusOf(statuses, q.id)} onChange={(s) => onSetStatus(q.id, s)} />
          </div>
        ))}
      </div>
    </section>
  );
}
