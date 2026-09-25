// The home screen: a bottle-green book cover stamped in gilt, with the four
// games as cloth-bound volumes on a shelf.
import { useEffect, useState } from "react";
import { get, post } from "../api.js";
import { go } from "../App.jsx";
import { ErrorBox, Loading, VOLUMES } from "../components.jsx";
import Icon from "../icons.jsx";
import "./home.css";

const ORDER = ["reader", "imagination", "story", "spotter"];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Home() {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const load = () => get("/api/home").then(setState, setError);
  useEffect(() => { load(); }, []);

  return (
    <div className="cover cloth">
      <div className="cover-frame">
        {error && <ErrorBox error={error} />}
        {!state && !error && <Loading />}
        {state && <CoverContents state={state} onReload={load} />}
      </div>
    </div>
  );
}

function CoverContents({ state, onReload }) {
  const litCount = state.week.days.filter(d => d.lit).length;
  return (
    <>
      <header className="crest">
        <Icon name="sparkle" className="crest-sparkle" size={22} strokeWidth={1.2} />
        <h1 className="crest-title gilt">Mega</h1>
        <p className="crest-line">You're already a Mega Reader. Here's where you prove you're mega at everything else.</p>
      </header>

      <section className="week" aria-label="This week's Mega Streak">
        <h2 className="week-title">This week</h2>
        <ol className="week-seals">
          {state.week.days.map((d, i) => (
            <li key={d.date} className={`week-day ${d.lit ? "lit" : ""} ${d.isToday ? "today" : ""}`}>
              <span className="week-seal">{d.lit && <Icon name="star" size={20} strokeWidth={1.4} />}</span>
              <span className="week-name">{d.isToday ? "Today" : DAY_NAMES[i]}</span>
            </li>
          ))}
        </ol>
        <p className="week-note">
          {litCount === 7 ? "A whole Mega week!"
            : litCount === 0 ? "Finish all four games in one day to light a seal."
            : "Light every seal this week and you choose a reward."}
        </p>
      </section>

      <nav className="shelf">
        {ORDER.map(game => {
          const v = VOLUMES[game];
          const g = state.games[game];
          return (
            <button key={game} className="volume cloth" style={{ "--vol": v.colour }} onClick={() => go(game)}>
              <span className="volume-frame">
                <Icon name={v.emblem} className="volume-emblem" size={46} strokeWidth={1.2} />
                <span className="volume-name">{v.name}</span>
                <span className="volume-streak">
                  <Icon name="flame" size={18} strokeWidth={1.5} />
                  {g.streak} {g.streak === 1 ? "day" : "days"}
                </span>
              </span>
              {g.done && (
                <span className="volume-done pop" title="Done today">
                  <Icon name="check" size={20} strokeWidth={2.4} />
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {state.rewardDue && <RewardPicker state={state} onDone={onReload} />}
    </>
  );
}

function RewardPicker({ state, onDone }) {
  const [chosen, setChosen] = useState(null);
  async function choose(reward) {
    await post("/api/reward", { weekStart: state.week.weekStart, reward });
    setChosen(reward);
  }
  return (
    <div className="overlay">
      <div className="sheet stack center pop reward">
        <Icon name="trophy" size={56} strokeWidth={1.2} className="reward-icon" />
        {chosen ? (
          <>
            <h2 className="display">{chosen}</h2>
            <p className="lead">Seven Mega days in a row. You earned it. Go and tell a grown-up!</p>
            <button className="btn wide" onClick={onDone}>Back to the games</button>
          </>
        ) : (
          <>
            <h2 className="display">A whole Mega week</h2>
            <p className="lead">Every game, every day, all week long. Choose your reward.</p>
            <div className="reward-list">
              {state.rewards.map(r => (
                <button key={r} className="btn wide secondary" onClick={() => choose(r)}>{r}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
