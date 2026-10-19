import { useRef, useState } from "react";
import { t } from "../i18n.js";
import { exportFileName, exportText, parseData } from "../storage.js";

export default function Settings({ lang, data, onSetLang, onReset, onImport }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(null); // インポート確認待ち { file, data }
  const [message, setMessage] = useState(null); // { kind: "info" | "warn", text }
  const fileInput = useRef(null);

  function reset() {
    onReset();
    setConfirming(false);
    setMessage({ kind: "info", text: t("reset_done", lang) });
  }

  function exportRecords() {
    const file = exportFileName();
    const url = URL.createObjectURL(new Blob([exportText(data)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = file;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ kind: "info", text: t("export_done", lang, { file }) });
  }

  async function chooseFile(e) {
    const file = e.target.files[0];
    e.target.value = ""; // 同じファイルを選び直せるようにする
    if (!file) return;
    setPending(null);
    let text;
    try {
      text = await file.text();
    } catch {
      setMessage({ kind: "warn", text: t("import_read_error", lang) });
      return;
    }
    const result = parseData(text);
    if (result.error) {
      setMessage({ kind: "warn", text: t(result.error === "newer" ? "import_newer" : "import_invalid", lang) });
      return;
    }
    setMessage(null);
    setPending({ file: file.name, data: result.data });
  }

  function confirmImport() {
    onImport(pending.data);
    setPending(null);
    setMessage({ kind: "info", text: t("import_done", lang) });
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

      {message && <p className={`notice ${message.kind}`}>{message.text}</p>}

      <fieldset>
        <legend>{t("storage_title", lang)}</legend>
        <p>{t("storage_note", lang)}</p>
        <div className="row">
          <button type="button" className="secondary" onClick={exportRecords}>{t("export", lang)}</button>
          <button type="button" className="secondary" onClick={() => fileInput.current.click()}>{t("import", lang)}</button>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={chooseFile} />
        </div>
        {pending && (
          <div className="confirm">
            <p><strong>{t("import_confirm", lang, {
              file: pending.file,
              h: pending.data.history.length,
              s: Object.keys(pending.data.statuses).length,
            })}</strong></p>
            <div className="row">
              <button type="button" className="danger" onClick={confirmImport}>{t("import_yes", lang)}</button>
              <button type="button" className="secondary" onClick={() => setPending(null)}>{t("cancel", lang)}</button>
            </div>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend>{t("reset_title", lang)}</legend>
        <p>{t("reset_warning", lang)}</p>
        {!confirming ? (
          <button type="button" className="danger" onClick={() => { setMessage(null); setConfirming(true); }}>
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
