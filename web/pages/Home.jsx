// The home screen that unites all four games.
import { useEffect, useState } from "react";
import { get, post } from "../api.js";
import { go } from "../App.jsx";
import { ErrorBox, Loading } from "../components.jsx";
import "./home.css";

const TILES = [
  { game: "reader", name: "Mega Reader Challenge", icon: "📖", colour: "var(--green)" },
  { game: "imagination", name: "Imagination Engine", icon: "💡", colour: "var(--plum)" },
  { game: "story", name: "Story Builder", icon: "🏗️", colour: "var(--mud)" },
  { game: "spotter", name: "Are you the kid that nothing gets past?", icon: "👁️", colour: "var(--sky)" },
];
const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

export default function Home() {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const load = () => get("/api/home").then(setState, setError);
  useEffect(() => { load(); }, []);

  if (error) return <div className="page"><ErrorBox error={error} /></div>;
  if (!state) return <Loading />;
  const litCount = state.week.days.filter(d => d.lit).length;

  return (
    <div className="page stack">
      <header className="center">
        <div className="big-title">MEGA</div>
        <p className="home-tagline">You're already a Mega Reader. This is where you prove you're mega at everything else too.</p>
      </header>

      <section className="card mega-week">
        <div className="mega-week-title">⚡ Mega Streak</div>
        <div className="mega-days">
          {state.week.days.map((d, i) => (
            <div key={d.date} className={`mega-day ${d.lit ? "lit" : ""} ${d.isToday ? "today" : ""}`}>
              <div className="mega-day-star">{d.lit ? "⭐" : ""}</div>
              <div className="mega-day-letter">{DAY_LETTERS[i]}</div>
            </div>
          ))}
        </div>
        <div className="soft mega-week-note">
          {litCount === 0 ? "Finish all four games in a day to light it up!" : "Light up every day this week to win a reward!"}
        </div>
      </section>

      <section className="tiles">
        {TILES.map(t => {
          const g = state.games[t.game];
          return (
            <button key={t.game} className="tile" style={{ "--tile": t.colour }} onClick={() => go(t.game)}>
              {g.done && <div className="tile-tick pop">✓</div>}
              <div className="tile-icon">{t.icon}</div>
              <div className="tile-name">{t.name}</div>
              <div className="tile-streak">🔥 {g.streak}</div>
            </button>
          );
        })}
      </section>

      {state.rewardDue && <RewardPicker state={state} onDone={load} />}
    </div>
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
      <div className="card stack center pop">
        <div style={{ fontSize: 64 }}>🏆</div>
        {chosen ? (
          <>
            <div className="title">{chosen}!</div>
            <p>A whole week of Mega days. You've earned it. Go and tell a grown-up!</p>
            <button className="btn wide" onClick={onDone}>Brilliant!</button>
          </>
        ) : (
          <>
            <div className="title">A whole Mega week!</div>
            <p>Every game, every day, all week. Pick your reward:</p>
            {state.rewards.map(r => (
              <button key={r} className="btn wide secondary" onClick={() => choose(r)}>{r}</button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
