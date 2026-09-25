// Parent's view: every night played, question by question.
import { VolumeHeader } from "../../components.jsx";
import Icon from "../../icons.jsx";
import { allNights } from "./logic.js";

export default function Results({ data }) {
  const titles = Object.fromEntries(allNights(data.chapters).map(n => [n.id, n.title]));
  // "ch3n2" reads as "Chapter 3, night 2".
  const nightName = id => id.replace(/^ch(\d+)n(\d+)$/, "Chapter $1, night $2");
  const played = Object.entries(data.progress.nights)
    .sort(([a, x], [b, y]) => (y.date + b).localeCompare(x.date + a)); // newest first

  return (
    <div className="reader-results">
      <VolumeHeader game="reader" title="Results" to="reader" backLabel="Back" compact />
      <div className="page stack">
        {played.map(([id, n]) => (
          <section key={id} className="sheet reader-result">
            <header className="reader-result-head">
              <h2 className="reader-result-title">{titles[id] ?? nightName(id)}</h2>
              <div className="reader-result-meta">
                {titles[id] && <span>{nightName(id)}</span>}<span>{n.date}</span>
                <span>{n.firstTry} of {n.total} first time</span><span>score {n.score}</span>
              </div>
            </header>
            {n.seeded ? (
              <p className="faint reader-result-note">Played in the old version.</p>
            ) : (
              <table className="reader-results-table">
                <thead><tr><th aria-label="First time"></th><th>Question</th><th>Tried first</th><th>Correct answer</th></tr></thead>
                <tbody>
                  {n.results.map((r, i) => (
                    <tr key={i}>
                      <td className={r.firstTry ? "tick" : "cross"}>
                        <Icon name={r.firstTry ? "check" : "minus"} size={18} strokeWidth={2.2}
                          title={r.firstTry ? "Right first time" : "Needed another try"} />
                      </td>
                      <td>{r.q}</td>
                      <td>{r.tried[0]}</td>
                      <td>{r.firstTry ? "" : r.correct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {n.ideas && (
              <p className="soft reader-result-note">
                Prediction ideas said aloud: {n.ideas.said}
                {n.ideas.liked?.length > 0 && `; liked hints: ${n.ideas.liked.join(" / ")}`}
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
