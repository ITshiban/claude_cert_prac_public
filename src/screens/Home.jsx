import { t } from "../i18n.js";
import { COUNTS, DOMAIN_IDS, MODES, SOURCE_GROUPS } from "../quiz.js";
import { domainLabel } from "../components.jsx";

function toggle(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value].sort();
}

function sourceGroupLabel(g, lang) {
  return g === "original" ? t("source_original", lang) : t(`source_${g}`, lang);
}

export default function Home({ lang, settings, onChange, onStart, warning }) {
  const set = (patch) => onChange({ ...settings, ...patch });

  return (
    <section>
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

      <fieldset>
        <legend>{t("filter_domain", lang)}</legend>
        <div className="options">
          {DOMAIN_IDS.map((d) => (
            <label key={d}>
              <input type="checkbox" checked={settings.domains.includes(d)} onChange={() => set({ domains: toggle(settings.domains, d) })} />
              {domainLabel(d)}
            </label>
          ))}
        </div>
        <div className="row">
          <button type="button" className="link" onClick={() => set({ domains: DOMAIN_IDS })}>{t("select_all", lang)}</button>
          <button type="button" className="link" onClick={() => set({ domains: [] })}>{t("clear_all", lang)}</button>
        </div>
      </fieldset>

      <fieldset>
        <legend>{t("filter_source", lang)}</legend>
        <div className="options inline">
          {SOURCE_GROUPS.map((g) => (
            <label key={g}>
              <input type="checkbox" checked={settings.sources.includes(g)} onChange={() => set({ sources: toggle(settings.sources, g) })} />
              {sourceGroupLabel(g, lang)}
            </label>
          ))}
        </div>
      </fieldset>

      {warning && <p className="notice warn">{warning}</p>}
      <button type="button" className="primary" onClick={onStart}>{t("start", lang)}</button>
    </section>
  );
}
