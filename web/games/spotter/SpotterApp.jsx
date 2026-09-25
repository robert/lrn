// "Are you the kid that nothing gets past?": game home, intro, daily
// challenge and free practice. Paths: #/spotter, #/spotter/daily,
// #/spotter/practice/<mode>, #/spotter/types, #/spotter/types/<format>.
import { useEffect, useState } from "react";
import { get, post } from "../../api.js";
import { go } from "../../App.jsx";
import { ErrorBox, Loading, Seal, Volume, VolumeHeader } from "../../components.jsx";
import Icon from "../../icons.jsx";
import { FORMATS } from "./formats.js";
import { ANIMALS, Cameo } from "./animals.jsx";
import Daily from "./Daily.jsx";
import SpotChange from "./SpotChange.jsx";
import OddOneOut from "./OddOneOut.jsx";
import Codes from "./Codes.jsx";
import Flashcards from "./Flashcards.jsx";
import { Lesson, Mixed, TryQuestion } from "./Questions.jsx";
import "./spotter.css";

const PRACTICE_NAMES = { spot: "Spot the change", odd: "Odd one out", codes: "Codes", flash: "Name the twelve", mixed: "Mixed round" };
// "a horse", "an owl": animal names in the middle of a sentence.
const an = name => (/^[aeiou]/i.test(name) ? `an ${name.toLowerCase()}` : `a ${name.toLowerCase()}`);

export default function SpotterApp({ sub }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const load = () => get("/api/spotter").then(setState, setError);
  useEffect(() => { load(); }, [sub.join("/")]);

  if (error) return <div className="page"><ErrorBox error={error} /></div>;
  if (!state) return <Loading />;

  if (!state.introSeen) return <Intro onReady={() => post("/api/spotter/intro").then(setState, setError)} />;

  const [where, what] = sub;
  let body, title;
  if (where === "daily") {
    title = "Today's challenge";
    body = <Daily state={state} onFinished={() => go("spotter")} />;
  } else if (where === "practice") {
    title = PRACTICE_NAMES[what];
    body = <Practice mode={what} state={state} />;
  } else if (where === "types" && what) {
    title = FORMATS.find(f => f.key === what)?.name;
    body = <TypePractice format={what} met={state.metFormats.includes(what)} />;
  } else if (where === "types") {
    title = "Question types";
    body = <TypesMenu state={state} />;
  } else {
    body = <GameHome state={state} />;
  }

  return (
    <Volume game="spotter">
      {where
        ? <VolumeHeader game="spotter" title={title} to={where === "types" && what ? "spotter/types" : "spotter"} backLabel="Back" compact />
        : <VolumeHeader game="spotter" lead="Every day you finish the challenge, your eyes get sharper." />}
      <div className="page stack spotter">{body}</div>
    </Volume>
  );
}

// The first visit: a few punchy lines on the navy cloth.
function Intro({ onReady }) {
  return (
    <Volume game="spotter">
      <div className="spot-intro cloth">
        <div className="spot-intro-frame">
          <Icon name="eye" size={54} strokeWidth={1.1} className="spot-intro-emblem" />
          <h1 className="spot-intro-title gilt">Are you the kid that nothing gets past?</h1>
          <p className="spot-intro-line">Every day you complete the challenge, your eyes get sharper.</p>
          <p className="spot-intro-line strong">Start as a mole. Finish as an eagle.</p>
          <div className="cameo-row">
            {ANIMALS.map(a => <Cameo key={a.key} animal={a.key} width={58} />)}
          </div>
          <button className="btn gold spot-intro-go" onClick={onReady}>I'm ready</button>
        </div>
      </div>
    </Volume>
  );
}

// The seven animals as cameos; earned ones in colour, the rest as silhouettes.
function Ladder({ rungs }) {
  return (
    <ol className="ladder">
      {ANIMALS.map((a, i) => (
        <li key={a.key} className="rung">
          <Cameo animal={a.key} earned={i < rungs} current={i === rungs - 1} width={62} />
          <span className={`rung-name ${i < rungs ? "earned" : ""}`}>{i < rungs ? a.name : "?"}</span>
        </li>
      ))}
    </ol>
  );
}

function GameHome({ state }) {
  // After reaching the eagle, the next day starts a fresh climb.
  const fresh = state.rungs === 7 && !state.doneToday;
  const rungs = fresh ? 0 : state.rungs;
  const level = fresh ? state.level + 1 : state.level;
  const current = rungs > 0 ? ANIMALS[rungs - 1] : null;
  const next = rungs < 7 ? ANIMALS[rungs] : null;

  let status;
  if (state.rungs === 7 && state.doneToday) status = "Level complete. You're the kid nothing gets past!";
  else if (fresh) status = "A fresh climb! Finish today's challenge to become a mole again.";
  else if (state.doneToday) status = `You're ${an(current.name)}. Come back tomorrow to become ${an(next.name)}.`;
  else if (current) status = `You're ${an(current.name)}. Finish today's challenge to become ${an(next.name)}.`;
  else status = "Finish today's challenge to become a mole.";

  return (
    <>
      <section className="sheet stack center ladder-sheet">
        <p className="level-name">Level {level}</p>
        <Ladder rungs={rungs} />
        <p className="ladder-status">{status}</p>
        {state.doneToday ? (
          <>
            <div className="done-today"><Seal size={40} /> Today's challenge is done</div>
            <button className="btn secondary wide" onClick={() => go("spotter/daily")}>Play it again for fun</button>
          </>
        ) : (
          <button className="btn wide big-start" onClick={() => go("spotter/daily")}>Start today's challenge</button>
        )}
      </section>

      <section className="sheet stack">
        <h2 className="title">Practice</h2>
        <div className="practice-grid">
          <PracticeButton icon="lens" label="Spot the change" to="spotter/practice/spot" />
          <PracticeButton icon="eye" label="Odd one out" to="spotter/practice/odd" />
          <PracticeButton icon="sparkle" label="Codes" to="spotter/practice/codes" />
          <PracticeButton icon="book" label="Question types" to="spotter/types" />
          {state.flashcards && <PracticeButton icon="medal" label="Name the twelve" to="spotter/practice/flash" />}
        </div>
      </section>
    </>
  );
}

function PracticeButton({ icon, label, to }) {
  return (
    <button className="btn secondary practice-btn" onClick={() => go(to)}>
      <Icon name={icon} size={22} strokeWidth={1.5} />{label}
    </button>
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
    <section className="sheet stack">
      <p className="lead soft types-lead">The six kinds of picture puzzle in the exam. {allMet ? "You've met them all!" : "You'll meet a new one in your daily challenge."}</p>
      <ul className="types-list">
        {FORMATS.map(f => (
          <li key={f.key}>
            <button className="types-row" onClick={() => go(`spotter/types/${f.key}`)}>
              <span className="types-name">{f.name}</span>
              {state.metFormats.includes(f.key) ? <Seal size={32} /> : <span className="types-new">New</span>}
              <Icon name="next" size={20} className="types-chevron" />
            </button>
          </li>
        ))}
      </ul>
      {allMet && <button className="btn wide" onClick={() => go("spotter/practice/mixed")}>Play a mixed round</button>}
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
      <div className="row" style={{ justifyContent: "flex-end" }}>
        <button className="btn small secondary" onClick={() => setLearning(true)}>Show me how again</button>
      </div>
      <ErrorBox error={error} />
      <TryQuestion key={round} format={format} onDone={() => { window.scrollTo(0, 0); setRound(r => r + 1); }} />
    </>
  );
}
