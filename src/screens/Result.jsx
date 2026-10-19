import { t } from "../i18n.js";

// Phase 1 の仮の結果画面（スコアのみ）。復習の一覧は Phase 2 で追加する
export default function Result({ lang, session, onHome }) {
  const n = session.answers.length;
  const c = session.answers.filter((a) => a.correct).length;
  const p = n ? Math.round((c / n) * 100) : 0;
  return (
    <section>
      <h2>{t("result_title", lang)}</h2>
      <p className="score">{t("score", lang, { c, n, p })}</p>
      <button type="button" className="primary" onClick={onHome}>{t("back_home", lang)}</button>
    </section>
  );
}
