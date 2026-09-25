// One timed round. The microphone runs the whole time; every phrase is saved
// with the time it was said and the picture that was on screen.
import { useEffect, useRef, useState } from "react";
import { post } from "../../api.js";
import { useSpeech } from "../../lib/useSpeech.js";
import { ErrorBox, Volume, VolumeHeader } from "../../components.jsx";
import Icon from "../../icons.jsx";
import { MODES } from "./modes.js";

const OPENER_CHANCE = 0.2; // how often a sentence appears instead of a picture

const shuffle = list => list.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);
const capitalise = s => s.charAt(0).toUpperCase() + s.slice(1);

// Turn the pictures folder into a shuffled list of prompts to show.
function buildPrompts({ pictures, openers }) {
  const pics = shuffle(pictures).map(p => ({ id: `pic:${p.id}`, type: "picture", url: p.url, label: p.label }));
  const sentences = shuffle(openers).map((text, i) => ({ id: `opener:${i}`, type: "opener", text, label: "opening sentence" }));
  const prompts = [];
  while (pics.length || sentences.length) {
    const useOpener = sentences.length && (!pics.length || Math.random() < OPENER_CHANCE);
    prompts.push(useOpener ? sentences.shift() : pics.shift());
  }
  return prompts;
}

export default function Round({ mode, library, onFinish, onQuit }) {
  const [prompts] = useState(() => buildPrompts(library));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("ready"); // ready | playing | sending | unsent
  const [segments, setSegments] = useState([]);
  const [remaining, setRemaining] = useState(MODES[mode].minutes * 60_000);
  const [typing, setTyping] = useState("");
  const [error, setError] = useState(null);
  const startRef = useRef(0);
  const promptRef = useRef(null);
  const segmentsRef = useRef([]);
  const shownRef = useRef(new Set());
  const finishingRef = useRef(false);

  const prompt = prompts[index % prompts.length];
  promptRef.current = prompt;
  const total = MODES[mode].minutes * 60_000;

  // Remember every prompt that was actually on screen during play.
  useEffect(() => {
    if (phase === "playing" && prompt) shownRef.current.add(prompt.id);
  }, [phase, index]);

  function addPhrase(text) {
    const seg = { promptId: promptRef.current.id, text, t: Date.now() - startRef.current };
    segmentsRef.current = [...segmentsRef.current, seg];
    setSegments(segmentsRef.current);
  }
  const speech = useSpeech(addPhrase);

  function start() {
    startRef.current = Date.now();
    setPhase("playing");
    speech.start();
  }

  // Countdown. When it runs out the round ends by itself.
  useEffect(() => {
    if (phase !== "playing") return;
    const timer = setInterval(() => {
      const left = total - (Date.now() - startRef.current);
      setRemaining(Math.max(0, left));
      if (left <= 0) finish();
    }, 250);
    return () => clearInterval(timer);
  }, [phase]);

  async function finish() {
    if (finishingRef.current) return;
    finishingRef.current = true;
    speech.stop();
    setPhase("sending");
    // Give the browser a moment to hand over the last phrase.
    await new Promise(r => setTimeout(r, 800));
    send();
  }

  async function send() {
    setPhase("sending");
    setError(null);
    const shown = prompts.filter(p => shownRef.current.has(p.id));
    try {
      onFinish(await post("/api/imagination/round", { mode, prompts: shown, segments: segmentsRef.current }));
    } catch (e) {
      setError(e);
      setPhase("unsent");
    }
  }

  function addTyped(e) {
    e.preventDefault();
    if (typing.trim()) addPhrase(typing.trim());
    setTyping("");
  }

  if (!prompt) {
    return (
      <Volume game="imagination">
        <VolumeHeader game="imagination" compact to="imagination" backLabel="Imagination Engine" />
        <div className="page"><ErrorBox error="There are no pictures in the pictures folder yet." /></div>
      </Volume>
    );
  }

  const m = MODES[mode];

  if (phase === "ready") {
    return (
      <Volume game="imagination">
        <header className="volume-band cloth">
          <div className="volume-band-inner">
            <button className="home-link" onClick={onQuit}><Icon name="back" />Imagination Engine</button>
            <Icon name={m.icon} className="emblem" strokeWidth={1.3} />
            <h1 className="big-title">{m.name}</h1>
            <p className="lead">{m.blurb}</p>
          </div>
        </header>
        <div className="page stack">
          <section className="sheet imag-formula">
            <p className="imag-formula-lead">Say every idea out loud, like this</p>
            <p className="imag-formula-words">The problem is… <span>the solution is…</span></p>
            <p className="imag-formula-foot"><Icon name="mic" size={18} />The engine listens the whole time. {m.length}.</p>
          </section>
          <button className="btn wide imag-start" onClick={start}>Start the engine</button>
        </div>
      </Volume>
    );
  }

  const showTyping = !speech.supported || speech.error;
  const recent = segments.filter(s => s.promptId === prompt.id).slice(-5);
  const shownCount = index + 1;

  return (
    <Volume game="imagination">
      <header className="imag-bar cloth">
        <div className="imag-bar-inner">
          <div className="imag-bar-title">
            <Icon name={m.icon} size={22} strokeWidth={1.4} />
            <span>{m.name}</span>
          </div>
          <Listening on={speech.listening} typing={showTyping} />
          <TimerRing remaining={remaining} total={total} />
        </div>
      </header>

      <div className="page imag-play">
        <figure className="imag-plate">
          <div className="imag-plate-mount">
            {prompt.type === "opener"
              ? <p className="imag-opener">“{prompt.text}”</p>
              : <img key={prompt.id} className="imag-plate-img" src={prompt.url} alt={prompt.label} />}
          </div>
          <figcaption>
            {mode === "breadth" && <span className="imag-plate-no">Plate {shownCount}</span>}
            {prompt.type === "opener" ? "An opening sentence" : capitalise(prompt.label)}
          </figcaption>
        </figure>

        <section className="imag-heard sheet">
          <h2 className="imag-heard-title">Your ideas</h2>
          {speech.error && <div className="error">{speech.error}</div>}
          <div className="imag-lines">
            {recent.length === 0 && !speech.interim && (
              <p className="imag-line placeholder">The problem is… the solution is…</p>
            )}
            {recent.map((s, i) => <p key={`${s.t}-${i}`} className="imag-line written">{s.text}</p>)}
            {speech.interim && <p className="imag-line interim">{speech.interim}</p>}
          </div>
          {showTyping && (
            <form className="imag-type" onSubmit={addTyped}>
              <Icon name="keys" size={22} />
              <input className="imag-input" value={typing} onChange={e => setTyping(e.target.value)}
                placeholder="Type an idea, then press Add" />
              <button className="btn small">Add</button>
            </form>
          )}
        </section>

        <ErrorBox error={error} />
        <div className="imag-actions">
          {phase === "sending" ? (
            <p className="imag-sending"><Icon name="sparkle" size={20} strokeWidth={1.3} />Gathering up your ideas…</p>
          ) : phase === "unsent" ? (
            <button className="btn wide" onClick={send}><Icon name="refresh" />Send my ideas again</button>
          ) : (
            <>
              {mode === "breadth" && (
                <button className="btn imag-next" onClick={() => setIndex(i => i + 1)}>
                  Next picture<Icon name="next" />
                </button>
              )}
              <button className="btn secondary" onClick={finish}>I'm finished</button>
            </>
          )}
        </div>
      </div>
    </Volume>
  );
}

// Gilt ring that empties as time runs out, with a quiet reading in the middle.
function TimerRing({ remaining, total }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const frac = remaining / total;
  const secs = Math.ceil(remaining / 1000);
  const label = secs > 60 ? `${Math.ceil(secs / 60)} min` : `${secs}s`;
  return (
    <div className="imag-ring" role="timer" aria-label={`${label} left`}>
      <svg viewBox="0 0 56 56" width="56" height="56">
        <circle cx="28" cy="28" r={r} className="imag-ring-track" />
        <circle cx="28" cy="28" r={r} className="imag-ring-fill"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - frac)} transform="rotate(-90 28 28)" />
      </svg>
      <span>{label}</span>
    </div>
  );
}

// Four gilt bars that sway while the microphone is listening.
function Listening({ on, typing }) {
  return (
    <div className={`imag-listen ${on ? "on" : ""}`}>
      <span className="imag-bars" aria-hidden="true"><i /><i /><i /><i /></span>
      <span>{on ? "Listening" : typing ? "Type your ideas" : "Waking the microphone"}</span>
    </div>
  );
}
