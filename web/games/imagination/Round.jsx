// One timed round. The microphone runs the whole time; every phrase is saved
// with the time it was said and the picture that was on screen.
import { useEffect, useRef, useState } from "react";
import { post } from "../../api.js";
import { useSpeech } from "../../lib/useSpeech.js";
import { ErrorBox } from "../../components.jsx";
import { MODES } from "./modes.js";

const OPENER_CHANCE = 0.2; // how often a sentence appears instead of a picture

const shuffle = list => list.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

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
    const total = MODES[mode].minutes * 60_000;
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

  if (!prompt) return <div className="page"><ErrorBox error="There are no pictures in the pictures folder yet." /></div>;

  if (phase === "ready") {
    return (
      <div className="page stack center">
        <button className="back" onClick={onQuit}>‹ Imagination Engine</button>
        <div className="big-title">{MODES[mode].icon} {MODES[mode].name}</div>
        <div className="card stack">
          <p className="imag-tagline">{MODES[mode].blurb}</p>
          <div className="imag-say">"The problem is… The solution is…"</div>
          <p className="soft">Say every idea out loud. The engine is listening!</p>
        </div>
        <button className="btn wide" onClick={start}>Start the engine!</button>
      </div>
    );
  }

  const showTyping = !speech.supported || speech.error;
  const recent = segments.filter(s => s.promptId === prompt.id).slice(-4);
  const mins = Math.floor(remaining / 60_000);
  const secs = String(Math.floor((remaining % 60_000) / 1000)).padStart(2, "0");

  return (
    <div className="page stack">
      <div className="imag-timer">
        <div className="progress"><div style={{ width: `${(remaining / (MODES[mode].minutes * 60_000)) * 100}%`, background: "var(--plum)" }} /></div>
        <div className="imag-clock">{mins}:{secs}</div>
      </div>

      <div className="imag-prompt">
        {prompt.type === "opener"
          ? <div className="imag-opener">"{prompt.text}"</div>
          : <img src={prompt.url} alt={prompt.label} />}
      </div>

      <div className="card imag-heard">
        <div className="row imag-mic">
          <span className={`imag-dot ${speech.listening ? "on" : ""}`} />
          <b>{speech.listening ? "Listening…" : showTyping ? "Type your ideas" : "Microphone starting…"}</b>
        </div>
        {speech.error && <div className="error">{speech.error}</div>}
        {recent.map((s, i) => <div key={i} className="imag-phrase">{s.text}</div>)}
        {speech.interim && <div className="imag-phrase interim">{speech.interim}</div>}
        {showTyping && (
          <form className="row" onSubmit={addTyped}>
            <input className="imag-input" value={typing} onChange={e => setTyping(e.target.value)}
              placeholder="The problem is… the solution is…" />
            <button className="btn small">Add</button>
          </form>
        )}
      </div>

      <ErrorBox error={error} />
      {phase === "sending" ? (
        <div className="card center"><b>Counting your ideas… 🧠</b></div>
      ) : phase === "unsent" ? (
        <button className="btn wide" onClick={send}>Send my ideas again</button>
      ) : (
        <div className="row">
          {mode === "breadth" && (
            <button className="btn wide imag-next" onClick={() => setIndex(i => i + 1)}>Next picture ➜</button>
          )}
          <button className="btn secondary wide" onClick={finish}>I'm finished</button>
        </div>
      )}
    </div>
  );
}
