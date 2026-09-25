// The memory challenge: a blank plan with no labels. He names the slots from
// memory; each one he names lights up in its place.
import { useState } from "react";
import { post } from "../../api.js";
import { ErrorBox } from "../../components.jsx";
import { PLAN_SLOTS, slotsNamedIn } from "../../../shared/storyPlan.js";
import MicButton from "./MicButton.jsx";

export default function Recall({ onDone }) {
  const [answers, setAnswers] = useState([]);
  const [typing, setTyping] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const named = new Set(answers.flatMap(slotsNamedIn));
  const addAnswer = text => setAnswers(a => [...a, text]);

  function addTyped(e) {
    e.preventDefault();
    if (typing.trim()) addAnswer(typing.trim());
    setTyping("");
  }

  async function finish() {
    setError(null);
    try { setResult(await post("/api/story/recall", { answers })); } catch (e) { setError(e); }
  }

  if (result) {
    const all = result.missed.length === 0;
    return (
      <div className="page stack">
        <div className="card center pop">
          <div style={{ fontSize: 64 }}>{all ? "🏆" : "🧠"}</div>
          <div className="title">{all ? "Every single one! That plan lives in your head now." : "Look how many you remembered!"}</div>
        </div>
        <div className="card story-outline">
          {PLAN_SLOTS.map(s => {
            const got = result.remembered.includes(s.id);
            return (
              <div key={s.id} className={`story-outline-row ${got ? "filled" : "missed"}`}>
                <div className="story-outline-label">{s.label}</div>
                <div className="story-outline-text">{got ? "✓ You remembered!" : "This one slipped past. Now you know it for next time."}</div>
              </div>
            );
          })}
        </div>
        <button className="btn mud wide" onClick={onDone}>Now let's build a plan</button>
      </div>
    );
  }

  return (
    <div className="page stack">
      <div className="card stack center">
        <div className="title">🧠 Memory challenge</div>
        <p>Here's a blank plan. Can you name every part of it, from memory? Say them or type them.</p>
      </div>
      <div className="card story-outline">
        {PLAN_SLOTS.map(s => (
          <div key={s.id} className={`story-outline-row ${named.has(s.id) ? "filled pop" : ""}`}>
            <div className="story-outline-label">{named.has(s.id) ? s.label : "?"}</div>
            <div className="story-outline-text" />
          </div>
        ))}
      </div>
      <div className="card stack">
        <MicButton onPhrase={addAnswer} />
        <form className="row" onSubmit={addTyped}>
          <input className="story-input" value={typing} onChange={e => setTyping(e.target.value)} placeholder="Type a part of the plan…" />
          <button className="btn small mud">Add</button>
        </form>
      </div>
      <ErrorBox error={error} />
      <button className="btn mud wide" disabled={!answers.length} onClick={finish}>I've named all I can remember</button>
    </div>
  );
}
