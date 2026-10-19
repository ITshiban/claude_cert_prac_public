import { t } from "../i18n.js";
import { domainAccuracy, statusCounts } from "../quiz.js";
import { domainLabel } from "../components.jsx";

const percent = (c, n) => (n ? `${Math.round((c / n) * 100)}%` : "-");

export default function Stats({ lang, questions, statuses, history }) {
  const acc = domainAccuracy(history, questions);
  const rows = Object.entries(acc);
  const sum = rows.reduce((s, [, v]) => ({ correct: s.correct + v.correct, total: s.total + v.total }), { correct: 0, total: 0 });
  const counts = statusCounts(questions, statuses);

  return (
    <section>
      <h2>{t("stats_title", lang)}</h2>

      <h3>{t("by_domain", lang)}</h3>
      {history.length === 0 ? (
        <p className="notice info">{t("no_history", lang)}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("domain", lang)}</th>
                <th className="num">{t("answers_n", lang)}</th>
                <th className="num">{t("correct_n", lang)}</th>
                <th className="num">{t("accuracy", lang)}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([d, v]) => (
                <tr key={d}>
                  <td>{domainLabel(d)}</td>
                  <td className="num">{v.total}</td>
                  <td className="num">{v.correct}</td>
                  <td className="num">{percent(v.correct, v.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>{t("total", lang)}</td>
                <td className="num">{sum.total}</td>
                <td className="num">{sum.correct}</td>
                <td className="num">{percent(sum.correct, sum.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <h3>{t("by_status", lang)}</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t("status", lang)}</th>
              <th className="num">{t("count_n", lang)}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(counts).map(([s, n]) => (
              <tr key={s}>
                <td>{t(`status_${s}`, lang)}</td>
                <td className="num">{n}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
