// The memory challenge: a blank plan with no labels. He names the slots from
// memory; each one he names is written onto its line.
import { useState } from "react";
import { post } from "../../api.js";
import { ErrorBox, Volume, VolumeHeader } from "../../components.jsx";
import Icon from "../../icons.jsx";
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
      <Volume game="story">
        <VolumeHeader game="story" title="Memory challenge" compact to="story" backLabel="Story Builder" />
        <div className="page stack">
          <section className="story-done center pop">
            <div className="story-wreath"><Icon name="laurel" size={150} strokeWidth={0.7} /><Icon name={all ? "trophy" : "star"} size={44} strokeWidth={1.3} /></div>
            <h2 className="display">{all ? "Every single one" : "Look how many you remembered"}</h2>
            <p className="lead soft">{all ? "That plan lives in your head now." : "The ones that slipped past are written in for next time."}</p>
          </section>
          <section className="sheet story-outline">
            {PLAN_SLOTS.map(s => {
              const got = result.remembered.includes(s.id);
              return (
                <div key={s.id} className={`story-outline-row ${got ? "filled" : "missed"}`}>
                  <span className="story-outline-label">{s.label}</span>
                  <span className="story-outline-text">
                    {got ? <><Icon name="check" size={18} strokeWidth={2} className="story-got" />You remembered</> : "One that slipped past"}
                  </span>
                </div>
              );
            })}
          </section>
          <button className="btn wide story-go" onClick={onDone}><Icon name="quill" />Now let's build a plan</button>
        </div>
      </Volume>
    );
  }

  return (
    <Volume game="story">
      <VolumeHeader game="story" title="Memory challenge" lead="A blank plan. Can you name every part of it, from memory?" to="story" backLabel="Story Builder" />
      <div className="page stack">
        <section className="sheet story-outline story-blank">
          {PLAN_SLOTS.map((s, i) => (
            <div key={s.id} className={`story-outline-row ${named.has(s.id) ? "filled" : ""}`}>
              <span className="story-outline-label">
                {named.has(s.id) ? <span className="story-written">{s.label}</span> : <span className="story-blank-no">{i + 1}</span>}
              </span>
              <span className="story-outline-text" />
            </div>
          ))}
        </section>
        <section className="sheet story-answer">
          <MicButton onPhrase={addAnswer} />
          <form className="story-type" onSubmit={addTyped}>
            <Icon name="keys" size={22} />
            <input className="story-input" value={typing} onChange={e => setTyping(e.target.value)} placeholder="Or type a part of the plan" />
            <button className="btn small">Add</button>
          </form>
        </section>
        <ErrorBox error={error} />
        <button className="btn wide story-go" disabled={!answers.length} onClick={finish}>I've named all I can remember</button>
      </div>
    </Volume>
  );
}
