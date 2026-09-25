// Parent's view: every night played, question by question.
import { go } from "../../App.jsx";
import { allNights } from "./logic.js";

export default function Results({ data }) {
  const titles = Object.fromEntries(allNights(data.chapters).map(n => [n.id, n.title]));
  const played = Object.entries(data.progress.nights)
    .sort(([a, x], [b, y]) => (y.date + b).localeCompare(x.date + a)); // newest first

  return (
    <div className="page stack reader-results">
      <button className="back" onClick={() => go("reader")}>‹ Back</button>
      <h1 className="title">Results</h1>
      {played.map(([id, n]) => (
        <section key={id} className="card stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>{id}{titles[id] ? `: ${titles[id]}` : ""}</strong>
            <span className="soft">{n.date} · {n.firstTry}/{n.total} first time · score {n.score}</span>
          </div>
          {n.seeded ? (
            <div className="soft">Played in the old version.</div>
          ) : (
            <table className="reader-results-table">
              <thead><tr><th></th><th>Question</th><th>Tried first</th><th>Correct answer</th></tr></thead>
              <tbody>
                {n.results.map((r, i) => (
                  <tr key={i}>
                    <td className={r.firstTry ? "tick" : "cross"}>{r.firstTry ? "✓" : "✗"}</td>
                    <td>{r.q}</td>
                    <td>{r.tried[0]}</td>
                    <td>{r.firstTry ? "" : r.correct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {n.ideas && (
            <div className="soft">
              Prediction ideas said aloud: {n.ideas.said}
              {n.ideas.liked?.length > 0 && `; liked hints: ${n.ideas.liked.join(" / ")}`}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
