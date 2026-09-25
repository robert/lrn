// Flashcards: no pictures. Name the twelve things that can change, in order,
// by tapping them from a shuffled set or by typing them.
import { useState } from "react";
import { ATTRIBUTES } from "../../../shared/attributes.js";
import { shuffle } from "./figure.js";
import { Feedback } from "./parts.jsx";

// Words he might type for each attribute.
const ALIASES = {
  shape: ["shape", "sides"], count: ["how many", "number", "count"], size: ["size"],
  shading: ["shading", "shade", "colour", "color"], rotation: ["rotation", "rotate", "turn"],
  flipped: ["flip", "mirror"], position: ["position", "place", "where"],
  layer: ["front", "behind", "layer"], line: ["line"], touching: ["touch"],
  pointing: ["point"], inside: ["inside", "outside"],
};
const matches = (typed, key) => ALIASES[key].some(word => typed.toLowerCase().includes(word));

export default function Flashcards({ onDone }) {
  const [chips] = useState(() => shuffle(Math.random, ATTRIBUTES));
  const [named, setNamed] = useState(0);
  const [slips, setSlips] = useState(0);
  const [wrongChip, setWrongChip] = useState(null);
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState("");
  const [nudge, setNudge] = useState(null);
  const expected = ATTRIBUTES[named];
  const finished = named === ATTRIBUTES.length;

  function tap(key) {
    if (key === expected.key) { setNamed(n => n + 1); setWrongChip(null); setNudge(null); }
    else { setWrongChip(key); setSlips(s => s + 1); setNudge("Not that one yet. What comes next?"); }
  }
  function submitTyped(e) {
    e.preventDefault();
    if (!text.trim()) return;
    if (matches(text, expected.key)) { setNamed(n => n + 1); setText(""); setNudge(null); }
    else { setSlips(s => s + 1); setNudge("Not quite. Try again, or tap Show me."); }
  }
  function showMe() {
    setSlips(s => s + 1);
    setNamed(n => n + 1);
    setNudge(`It was: ${expected.label}`);
    setText("");
  }

  return (
    <div className="stack">
      <div className="center">
        <h2 className="display flash-title">Name the twelve things that can change</h2>
        <p className="lead soft">In order, from memory.</p>
      </div>
      <ol className="flash-list">
        {ATTRIBUTES.map((a, i) => (
          <li key={a.key} className={i < named ? "done pop" : i === named ? "next" : ""}><span className="flash-num">{i + 1}</span>{i < named ? a.label : i === named ? "?" : ""}</li>
        ))}
      </ol>
      {!finished && (
        <>
          <div className="row" style={{ justifyContent: "center" }}>
            <button className={`btn small ${typing ? "secondary" : ""}`} onClick={() => setTyping(false)}>Tap them</button>
            <button className={`btn small ${typing ? "" : "secondary"}`} onClick={() => setTyping(true)}>Type them</button>
          </div>
          {typing ? (
            <form className="row" onSubmit={submitTyped} style={{ justifyContent: "center" }}>
              <input className="flash-input" value={text} onChange={e => setText(e.target.value)} autoFocus placeholder={`Number ${named + 1} is...`} />
              <button className="btn" type="submit">Go</button>
              <button className="btn secondary" type="button" onClick={showMe}>Show me</button>
            </form>
          ) : (
            <div className="attr-buttons">
              {chips.map(a => {
                const used = ATTRIBUTES.findIndex(x => x.key === a.key) < named;
                return (
                  <button key={a.key} className={`attr-btn ${wrongChip === a.key ? "shake" : ""}`} disabled={used} onClick={() => tap(a.key)}>{a.label}</button>
                );
              })}
            </div>
          )}
          {nudge && <Feedback kind="ok">{nudge}</Feedback>}
        </>
      )}
      {finished && (
        <>
          <Feedback kind="great">
            <div className="feedback-big">{slips === 0 ? "All twelve, perfectly! Nothing gets past you." : "You named all twelve!"}</div>
            {slips > 0 && <p>Keep saying them in order and soon none will slip past.</p>}
          </Feedback>
          <button className="btn wide" onClick={() => onDone({ caught: slips === 0 ? 1 : 0, missed: slips === 0 ? 0 : 1 })}>Next</button>
        </>
      )}
    </div>
  );
}
