import { t } from "../i18n.js";
import { COUNTS, DOMAIN_IDS, MODES, SOURCE_GROUPS } from "../quiz.js";
import { CheckGroup, domainLabel, sourceGroupLabel } from "../components.jsx";

export default function Home({ lang, settings, onChange, onStart, warning, session, onResume, onDiscard }) {
  const set = (patch) => onChange({ ...settings, ...patch });

  return (
    <section>
      {session && (
        <div className="notice info resume">
          <p>{t("session_in_progress", lang, { i: Math.min(session.index + 1, session.questionIds.length), n: session.questionIds.length })}</p>
          <div className="row">
            <button type="button" className="primary" onClick={onResume}>{t("resume", lang)}</button>
            <button type="button" className="secondary" onClick={onDiscard}>{t("discard", lang)}</button>
          </div>
        </div>
      )}

      <fieldset>
        <legend>{t("count", lang)}</legend>
        <div className="options inline">
          {COUNTS.map((n) => (
            <label key={n}>
              <input type="radio" name="count" checked={settings.count === n} onChange={() => set({ count: n })} />
              {t("count_option", lang, { n })}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>{t("mode", lang)}</legend>
        <div className="options inline">
          {MODES.map((m) => (
            <label key={m}>
              <input type="radio" name="mode" checked={settings.mode === m} onChange={() => set({ mode: m })} />
              {t(`mode_${m}`, lang)}
            </label>
          ))}
        </div>
      </fieldset>

      <CheckGroup
        legend={t("filter_domain", lang)}
        options={DOMAIN_IDS}
        selected={settings.domains}
        onChange={(domains) => set({ domains })}
        format={domainLabel}
      />
      <div className="row under-fieldset">
        <button type="button" className="link" onClick={() => set({ domains: DOMAIN_IDS })}>{t("select_all", lang)}</button>
        <button type="button" className="link" onClick={() => set({ domains: [] })}>{t("clear_all", lang)}</button>
      </div>

      <CheckGroup
        legend={t("filter_source", lang)}
        options={SOURCE_GROUPS}
        selected={settings.sources}
        onChange={(sources) => set({ sources })}
        format={(g) => sourceGroupLabel(g, lang)}
        inline
      />

      {warning && <p className="notice warn">{warning}</p>}
      <button type="button" className="primary" onClick={onStart}>{t("start", lang)}</button>
    </section>
  );
}
