import { useState } from "react";
import { t } from "../i18n.js";

export default function Settings({ lang, onSetLang, onReset }) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  function reset() {
    onReset();
    setConfirming(false);
    setDone(true);
  }

  return (
    <section>
      <h2>{t("settings_title", lang)}</h2>

      <fieldset>
        <legend>{t("language", lang)}</legend>
        <div className="options inline">
          {["ja", "en"].map((l) => (
            <label key={l}>
              <input type="radio" name="lang" checked={lang === l} onChange={() => onSetLang(l)} />
              {l === "ja" ? "日本語" : "English"}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>{t("storage_title", lang)}</legend>
        <p>{t("storage_note", lang)}</p>
        {/* エクスポート・インポートは Phase 3 で実装する */}
        <div className="row">
          <button type="button" className="secondary" disabled>{t("export", lang)}</button>
          <button type="button" className="secondary" disabled>{t("import", lang)}</button>
        </div>
      </fieldset>

      <fieldset>
        <legend>{t("reset_title", lang)}</legend>
        <p>{t("reset_warning", lang)}</p>
        {done && <p className="notice info">{t("reset_done", lang)}</p>}
        {!confirming ? (
          <button type="button" className="danger" onClick={() => { setDone(false); setConfirming(true); }}>
            {t("reset_button", lang)}
          </button>
        ) : (
          <div className="confirm">
            <p><strong>{t("reset_confirm", lang)}</strong></p>
            <div className="row">
              <button type="button" className="danger" onClick={reset}>{t("reset_yes", lang)}</button>
              <button type="button" className="secondary" onClick={() => setConfirming(false)}>{t("cancel", lang)}</button>
            </div>
          </div>
        )}
      </fieldset>
    </section>
  );
}
