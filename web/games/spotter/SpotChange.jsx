// Mode 1: Spot the Change. Two figures; for every shape, Same or Different
// for each of the twelve attributes. No skipping.
import { useState } from "react";
import { ATTRIBUTES } from "../../../shared/attributes.js";
import { byId, describe } from "./figure.js";
import { spotChange, spotLevel } from "./generate.js";
import Figure, { zoomFor } from "./Figure.jsx";
import { Feedback, praise } from "./parts.jsx";

// done: how many Spot the Change rounds he has finished (sets difficulty).
export default function SpotChange({ done, onDone }) {
  const [q] = useState(() => spotChange(Math.random, spotLevel(done)));
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const ids = q.fig1.elements.map(e => e.id);
  const total = ids.length * ATTRIBUTES.length;
  const allAnswered = Object.keys(answers).length === total;
  const truth = (id, key) => q.changes[id].includes(key);

  const rows = ids.flatMap(id => ATTRIBUTES.map(a => ({ id, key: a.key })));
  const caught = rows.filter(r => truth(r.id, r.key) && answers[`${r.id}:${r.key}`] === "diff").length;
  const missed = rows.filter(r => truth(r.id, r.key) && answers[`${r.id}:${r.key}`] === "same").length;
  const falseAlarms = rows.filter(r => !truth(r.id, r.key) && answers[`${r.id}:${r.key}`] === "diff").length;
  const changedIds = ids.filter(id => q.changes[id].length);
  const zoom = zoomFor([q.fig1, q.fig2]);

  const set = (id, key, value) => !checked && setAnswers(a => ({ ...a, [`${id}:${key}`]: value }));

  return (
    <div className="stack">
      <div className="spot-figures">
        <div><div className="fig-label">1</div><Figure fig={q.fig1} zoom={zoom} tags highlight={checked ? changedIds : []} /></div>
        <div className="spot-arrow">→</div>
        <div><div className="fig-label">2</div><Figure fig={q.fig2} zoom={zoom} tags highlight={checked ? changedIds : []} /></div>
      </div>

      {!checked && <p className="center soft spot-help">What changed from picture 1 to picture 2? Choose Same or Different for every one.</p>}

      {ids.map(id => (
        <section key={id} className="card spot-shape">
          <h3 className="spot-shape-title">Shape {id} <span className="soft">({describe(byId(q.fig1, id))})</span></h3>
          <div className="spot-rows">
            {ATTRIBUTES.map(a => {
              const answer = answers[`${id}:${a.key}`];
              const changed = truth(id, a.key);
              let result = "";
              if (checked) result = changed ? (answer === "diff" ? "caught" : "slipped") : answer === "diff" ? "stayed" : "fine";
              return (
                <div key={a.key} className={`spot-row ${result}`}>
                  <span className="spot-attr">{a.label}</span>
                  <span className="spot-choices">
                    <button className={`choice ${answer === "same" ? "on" : ""}`} onClick={() => set(id, a.key, "same")}>Same</button>
                    <button className={`choice ${answer === "diff" ? "on" : ""}`} onClick={() => set(id, a.key, "diff")}>Different</button>
                  </span>
                  {checked && result === "caught" && <span className="spot-note">✓ Caught it!</span>}
                  {checked && result === "slipped" && <span className="spot-note">This one slipped past</span>}
                  {checked && result === "stayed" && <span className="spot-note">This stayed the same</span>}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {!checked ? (
        <button className="btn wide" disabled={!allAnswered} onClick={() => setChecked(true)}>
          {allAnswered ? "Check my answers" : "Choose Same or Different for every one"}
        </button>
      ) : (
        <>
          <Feedback kind={missed === 0 ? "great" : "ok"}>
            {missed === 0 && falseAlarms === 0 && <div className="feedback-big">{praise()} Nothing got past you!</div>}
            {missed === 0 && falseAlarms > 0 && <div className="feedback-big">You caught every change!</div>}
            {missed > 0 && <div className="feedback-big">You caught {caught} {caught === 1 ? "change" : "changes"}! {missed === 1 ? "One" : missed} slipped past.</div>}
            {q.notes.map(n => <p key={n}>{n}</p>)}
          </Feedback>
          <button className="btn wide" onClick={() => onDone({ caught, missed })}>Next</button>
        </>
      )}
    </div>
  );
}
