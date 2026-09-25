// "Are you the kid that nothing gets past?": game home, intro, daily
// challenge and free practice. Paths: #/spotter, #/spotter/daily,
// #/spotter/practice/<mode>, #/spotter/types, #/spotter/types/<format>.
import { useEffect, useState } from "react";
import { get, post } from "../../api.js";
import { go } from "../../App.jsx";
import { BackHome, ErrorBox, Loading } from "../../components.jsx";
import { FORMATS } from "./formats.js";
import { ANIMALS, Portrait } from "./animals.jsx";
import Daily from "./Daily.jsx";
import SpotChange from "./SpotChange.jsx";
import OddOneOut from "./OddOneOut.jsx";
import Codes from "./Codes.jsx";
import Flashcards from "./Flashcards.jsx";
import { Lesson, Mixed, TryQuestion } from "./Questions.jsx";
import "./spotter.css";

export default function SpotterApp({ sub }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const load = () => get("/api/spotter").then(setState, setError);
  useEffect(() => { load(); }, [sub.join("/")]);

  if (error) return <div className="page"><ErrorBox error={error} /></div>;
  if (!state) return <Loading />;

  if (!state.introSeen) return <Intro onReady={() => post("/api/spotter/intro").then(setState, setError)} />;

  const [where, what] = sub;
  let body;
  if (where === "daily") body = <Daily state={state} onFinished={() => go("spotter")} />;
  else if (where === "practice") body = <Practice mode={what} state={state} />;
  else if (where === "types" && what) body = <TypePractice format={what} met={state.metFormats.includes(what)} />;
  else if (where === "types") body = <TypesMenu state={state} />;
  else body = <GameHome state={state} />;

  return (
    <div className="page stack spotter">
      <BackHome to={where ? "spotter" : ""} label={where ? "‹ Back" : "‹ Home"} />
      {body}
    </div>
  );
}

function Intro({ onReady }) {
  return (
    <div className="page">
      <div className="card stack center pop intro">
        <div className="big-title">Are you the kid that nothing gets past?</div>
        <p className="lesson-line">Every day you complete the challenge, your eyes get sharper.</p>
        <p className="lesson-line"><b>Start as a mole. Finish as an eagle.</b></p>
        <div className="ladder">{ANIMALS.map(a => <Portrait key={a.key} animal={a.key} size={52} />)}</div>
        <button className="btn wide" onClick={onReady}>I'm ready!</button>
      </div>
    </div>
  );
}

function Ladder({ state }) {
  return (
    <div className="ladder">
      {ANIMALS.map((a, i) => (
        <div key={a.key} className={`rung ${i < state.rungs ? "earned" : ""}`}>
          <Portrait animal={a.key} silhouette={i >= state.rungs} size={64} />
          <div className="rung-name">{i < state.rungs ? a.name : "?"}</div>
        </div>
      ))}
    </div>
  );
}

function GameHome({ state }) {
  const current = state.rungs > 0 ? ANIMALS[state.rungs - 1] : null;
  const next = state.rungs < 7 ? ANIMALS[state.rungs] : ANIMALS[0];
  return (
    <>
      <header className="center">
        <div className="big-title spotter-title">Are you the kid that nothing gets past?</div>
      </header>
      <section className="card stack center">
        <div className="soft level-label">Level {state.rungs === 7 && !state.doneToday ? state.level + 1 : state.level}</div>
        <Ladder state={state.rungs === 7 && !state.doneToday ? { ...state, rungs: 0 } : state} />
        <p className="lesson-line">
          {state.rungs === 7 && state.doneToday && "Level complete: you're the kid nothing gets past!"}
          {state.rungs === 7 && !state.doneToday && "A fresh climb! Complete today's challenge to become a Mole."}
          {state.rungs < 7 && current && `You're ${/^[aeiou]/i.test(current.name) ? "an" : "a"} ${current.name}! `}
          {state.rungs < 7 && (state.doneToday ? `Come back tomorrow to become ${/^[aeiou]/i.test(next.name) ? "an" : "a"} ${next.name}.` : `Complete today's challenge to become ${/^[aeiou]/i.test(next.name) ? "an" : "a"} ${next.name}!`)}
        </p>
        {state.doneToday ? (
          <>
            <div className="done-today">✓ Today's challenge done!</div>
            <button className="btn secondary wide" onClick={() => go("spotter/daily")}>Do it again for fun</button>
          </>
        ) : (
          <button className="btn wide big-start" onClick={() => go("spotter/daily")}>Start today's challenge</button>
        )}
      </section>

      <section className="card stack">
        <h2 className="title">Practice</h2>
        <div className="practice-grid">
          <button className="btn secondary" onClick={() => go("spotter/practice/spot")}>Spot the Change</button>
          <button className="btn secondary" onClick={() => go("spotter/practice/odd")}>Odd One Out</button>
          <button className="btn secondary" onClick={() => go("spotter/practice/codes")}>Codes</button>
          <button className="btn secondary" onClick={() => go("spotter/types")}>Question Types</button>
          {state.flashcards && <button className="btn secondary" onClick={() => go("spotter/practice/flash")}>Name the twelve</button>}
        </div>
      </section>
    </>
  );
}

// Free practice: one item after another until he's had enough.
function Practice({ mode, state }) {
  const [round, setRound] = useState(0);
  const [spotDone, setSpotDone] = useState(state.spotDone);
  const [error, setError] = useState(null);
  const done = () => {
    window.scrollTo(0, 0);
    if (mode === "spot") {
      setSpotDone(n => n + 1);
      post("/api/spotter/practice", { spot: 1 }).catch(setError);
    }
    setRound(r => r + 1);
  };
  const Screens = { spot: SpotChange, odd: OddOneOut, codes: Codes, flash: Flashcards, mixed: Mixed };
  const Screen = Screens[mode];
  if (!Screen) throw new Error(`Unknown practice mode ${mode}`);
  return (
    <>
      <ErrorBox error={error} />
      <Screen key={round} done={spotDone} onDone={done} />
    </>
  );
}

function TypesMenu({ state }) {
  const allMet = FORMATS.every(f => state.metFormats.includes(f.key));
  return (
    <section className="card stack">
      <h2 className="title">Question Types</h2>
      <p className="soft">The six kinds of puzzle in the exam. {allMet ? "You've met them all!" : "You'll meet a new one in your daily challenge."}</p>
      <div className="practice-grid">
        {FORMATS.map(f => (
          <button key={f.key} className="btn secondary" onClick={() => go(`spotter/types/${f.key}`)}>
            {state.metFormats.includes(f.key) ? "✓ " : ""}{f.name}
          </button>
        ))}
        {allMet && <button className="btn" onClick={() => go("spotter/practice/mixed")}>Mixed round</button>}
      </div>
    </section>
  );
}

// A question type: the lesson first (if new), then as many tries as he likes.
function TypePractice({ format, met }) {
  const [learning, setLearning] = useState(!met);
  const [round, setRound] = useState(0);
  const [error, setError] = useState(null);
  if (!FORMATS.some(f => f.key === format)) throw new Error(`Unknown question type ${format}`);
  if (learning) {
    return <Lesson format={format} onDone={() => { post("/api/spotter/format", { format }).catch(setError); setLearning(false); }} />;
  }
  return (
    <>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h2 className="title">{FORMATS.find(f => f.key === format).name}</h2>
        <button className="btn small secondary" onClick={() => setLearning(true)}>Show me how again</button>
      </div>
      <ErrorBox error={error} />
      <TryQuestion key={round} format={format} onDone={() => { window.scrollTo(0, 0); setRound(r => r + 1); }} />
    </>
  );
}
