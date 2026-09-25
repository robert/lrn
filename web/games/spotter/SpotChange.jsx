// Mode 1: Spot the Change. Two figures; for every shape, Same or Different
// for each of the twelve attributes. No skipping.
import { useState } from "react";
import { ATTRIBUTES } from "../../../shared/attributes.js";
import { byId, describe } from "./figure.js";
import { spotChange, spotLevel } from "./generate.js";
import Figure, { zoomFor } from "./Figure.jsx";
import { Feedback, praise } from "./parts.jsx";
import Icon from "../../icons.jsx";

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
        <figure className="spot-fig"><Figure fig={q.fig1} zoom={zoom} tags highlight={checked ? changedIds : []} /><figcaption>Before</figcaption></figure>
        <Icon name="next" size={30} strokeWidth={1.4} className="spot-arrow" />
        <figure className="spot-fig"><Figure fig={q.fig2} zoom={zoom} tags highlight={checked ? changedIds : []} /><figcaption>After</figcaption></figure>
      </div>

      {!checked && <p className="spot-help">What changed? Choose <b>Same</b> or <b>Different</b> for every line.</p>}

      {ids.map(id => (
        <section key={id} className="sheet spot-shape">
          <h3 className="spot-shape-title">Shape {id} <span className="spot-shape-desc">{describe(byId(q.fig1, id))}</span></h3>
          <div className="spot-rows">
            {ATTRIBUTES.map((a, i) => {
              const answer = answers[`${id}:${a.key}`];
              const changed = truth(id, a.key);
              let result = "";
              if (checked) result = changed ? (answer === "diff" ? "caught" : "slipped") : answer === "diff" ? "stayed" : "fine";
              return (
                <div key={a.key} className={`spot-row ${result}`}>
                  <span className="spot-attr">
                    <span className="spot-num">{i + 1}</span>{a.label}
                    {result === "caught" && <span className="spot-note caught"><Icon name="check" size={16} strokeWidth={2.4} />Caught</span>}
                    {result === "slipped" && <span className="spot-note slipped">Slipped past</span>}
                    {result === "stayed" && <span className="spot-note stayed">This stayed the same</span>}
                  </span>
                  <span className={`seg ${answer ?? ""}`} role="group" aria-label={a.label}>
                    <button className={`seg-btn same ${answer === "same" ? "on" : ""}`} aria-pressed={answer === "same"} disabled={checked} onClick={() => set(id, a.key, "same")}>Same</button>
                    <button className={`seg-btn diff ${answer === "diff" ? "on" : ""}`} aria-pressed={answer === "diff"} disabled={checked} onClick={() => set(id, a.key, "diff")}>Different</button>
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {!checked ? (
        <button className="btn wide" disabled={!allAnswered} onClick={() => setChecked(true)}>
          {allAnswered ? "Check my answers" : "Choose Same or Different for every line"}
        </button>
      ) : (
        <>
          <Feedback kind={missed === 0 ? "great" : "ok"}>
            {missed === 0 && falseAlarms === 0 && <div className="feedback-big">{praise()} Nothing got past you.</div>}
            {missed === 0 && falseAlarms > 0 && <div className="feedback-big">You caught every change!</div>}
            {missed > 0 && <div className="feedback-big">You caught {caught} {caught === 1 ? "change" : "changes"}. {missed === 1 ? "One" : missed} slipped past.</div>}
            {q.notes.map(n => <p key={n}>{n}</p>)}
          </Feedback>
          <button className="btn wide" onClick={() => onDone({ caught, missed })}>Next</button>
        </>
      )}
    </div>
  );
}
