// Mode 1: Codes. Work out what each letter stands for (from the twelve),
// then pick the code for a new figure.
import { useState } from "react";
import { labelFor } from "../../../shared/attributes.js";
import { codes } from "./generate.js";
import Figure, { zoomFor } from "./Figure.jsx";
import { AttributeButtons, Feedback, praise } from "./parts.jsx";

export function CodedFigures({ q, showTest }) {
  const zoom = zoomFor([...q.figures.map(f => f.fig), q.test]);
  return (
    <div className="code-row">
      {q.figures.map((f, i) => (
        <div key={i} className="code-fig">
          <Figure fig={f.fig} zoom={zoom} />
          <div className="code-label">{f.code}</div>
        </div>
      ))}
      {showTest && (
        <div className="code-fig test">
          <Figure fig={q.test} zoom={zoom} />
          <div className="code-label">??</div>
        </div>
      )}
    </div>
  );
}

export default function Codes({ onDone }) {
  const [q] = useState(() => codes(Math.random));
  const [step, setStep] = useState(0); // 0: first letter, 1: second letter, 2: the new code
  const [marks, setMarks] = useState({});
  const [slippedCodes, setSlippedCodes] = useState([]);
  const [right, setRight] = useState(false);
  const [firstTry, setFirstTry] = useState(true);

  function pickAttr(key) {
    if (key === q.attrs[step]) { setMarks(m => ({ ...m, [key]: "right" })); setRight(true); }
    else { setMarks(m => ({ ...m, [key]: "slipped" })); setFirstTry(false); }
  }
  function pickCode(code) {
    if (code === q.answer) setRight(true);
    else { setSlippedCodes(s => [...s, code]); setFirstTry(false); }
  }
  function next() {
    if (step === 2) return onDone({ caught: firstTry ? 1 : 0, missed: firstTry ? 0 : 1 });
    setStep(step + 1);
    setMarks({});
    setRight(false);
  }

  const letters = step === 0 ? q.figures.map(f => f.code[0]) : q.figures.map(f => f.code[1]);
  return (
    <div className="stack">
      <CodedFigures q={q} showTest={step === 2} />
      {step < 2 ? (
        <>
          <p className="center big-q">What does the {step === 0 ? "FIRST" : "SECOND"} letter stand for?</p>
          <p className="center soft">Look at the figures that share a letter ({[...new Set(letters)].join(", ")}). What is the same about them?</p>
          <AttributeButtons onPick={pickAttr} marks={marks} disabled={right} />
          {Object.values(marks).includes("slipped") && !right && <Feedback kind="ok">That one slipped past. Try another!</Feedback>}
          {right && <Feedback kind="great">{praise()} The {step === 0 ? "first" : "second"} letter is the {labelFor(q.attrs[step]).toLowerCase()}.</Feedback>}
        </>
      ) : (
        <>
          <p className="center big-q">What is the code for the new picture?</p>
          <div className="code-options">
            {q.options.map(code => (
              <button key={code} className={`btn secondary code-option ${slippedCodes.includes(code) ? "slipped" : ""} ${right && code === q.answer ? "right" : ""}`}
                disabled={slippedCodes.includes(code) || right} onClick={() => pickCode(code)}>{code}</button>
            ))}
          </div>
          {slippedCodes.length > 0 && !right && <Feedback kind="ok">That one slipped past. Check each letter again!</Feedback>}
          {right && <Feedback kind="great">{praise()} It's {q.answer}!</Feedback>}
        </>
      )}
      {right && <button className="btn wide" onClick={next}>Next</button>}
    </div>
  );
}
