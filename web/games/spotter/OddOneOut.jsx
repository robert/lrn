// Mode 1: Odd One Out. Tap the figure that doesn't belong, then say why
// using the twelve attributes. Naming the reason matters as much as finding it.
import { useState } from "react";
import { oddOneOut } from "./generate.js";
import Figure, { zoomFor } from "./Figure.jsx";
import { AttributeButtons, Feedback, praise } from "./parts.jsx";

export default function OddOneOut({ onDone }) {
  const [q] = useState(() => oddOneOut(Math.random));
  const [slippedFigs, setSlippedFigs] = useState([]);
  const [found, setFound] = useState(false);
  const [marks, setMarks] = useState({});
  const [named, setNamed] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const zoom = zoomFor(q.figures);

  function tapFigure(i) {
    if (found) return;
    if (i === q.odd) setFound(true);
    else { setSlippedFigs(s => [...s, i]); setFirstTry(false); }
  }

  function pickAttr(key) {
    if (q.answers.includes(key)) { setMarks(m => ({ ...m, [key]: "right" })); setNamed(true); }
    else { setMarks(m => ({ ...m, [key]: "slipped" })); setFirstTry(false); }
  }

  return (
    <div className="stack">
      <p className="center big-q">{found ? "Why is it the odd one out?" : "Which one is the odd one out?"}</p>
      <div className="odd-row">
        {q.figures.map((fig, i) => (
          <button key={i} className={`fig-btn ${slippedFigs.includes(i) ? "slipped" : ""} ${found && i === q.odd ? "right" : ""}`} onClick={() => tapFigure(i)}>
            <Figure fig={fig} zoom={zoom} />
          </button>
        ))}
      </div>
      {slippedFigs.length > 0 && !found && <Feedback kind="ok">That one slipped past. Look again!</Feedback>}
      {found && !named && (
        <>
          <Feedback kind="great">{praise()} You found it. Now, what makes it different?</Feedback>
          <AttributeButtons onPick={pickAttr} marks={marks} />
        </>
      )}
      {named && (
        <>
          <Feedback kind="great"><div className="feedback-big">{praise()}</div><p>{q.explain}</p></Feedback>
          <button className="btn wide" onClick={() => onDone({ caught: firstTry ? 1 : 0, missed: firstTry ? 0 : 1 })}>Next</button>
        </>
      )}
    </div>
  );
}
