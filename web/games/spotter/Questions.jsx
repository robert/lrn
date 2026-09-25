// Mode 2: the six exam question types. A lesson is: what the question asks,
// two worked examples, then a few to try. The mixed round asks which type
// it is first, then the question itself.
import { useState } from "react";
import { FORMATS, FORMAT_KEYS, formatName, makeQuestion } from "./formats.js";
import { pick } from "./figure.js";
import Fig, { zoomFor } from "./Figure.jsx";
import { CodedFigures } from "./Codes.jsx";
import { Feedback, praise } from "./parts.jsx";
import Icon from "../../icons.jsx";
import { FilmButton } from "../../Film.jsx";
import { FILM_FOR_FORMAT } from "../../../shared/videos.js";

const PROMPTS = {
  analogies: "Which one goes in the gap?",
  odd: "Which one is the odd one out?",
  similar: "Which option is most like the two pictures in the box?",
  codes: "What is the code for the new picture?",
  sequences: "What comes next?",
  grids: "Which one fills the gap?",
};

function Gap() {
  return <div className="gap-box"><span>?</span></div>;
}

const Arrow = () => <Icon name="next" size={26} strokeWidth={1.4} className="stem-arrow" />;

// Every figure in a question, so they can all be zoomed the same way.
function figuresOf(q) {
  const figs = [q.a, q.b, q.c, ...(q.examples ?? []), ...(q.frames ?? []), ...(q.cells ?? []).filter(Boolean), ...(q.figures ?? []).map(f => f.fig), q.test];
  if (q.format !== "codes") figs.push(...q.options);
  return figs.filter(Boolean);
}

// The top part of a question (everything except the options).
function Stem({ q }) {
  const zoom = zoomFor(figuresOf(q));
  if (q.format === "analogies") {
    return (
      <div className="stem-row">
        <Fig zoom={zoom} fig={q.a} /><Arrow /><Fig zoom={zoom} fig={q.b} />
        <span className="stem-sep" />
        <Fig zoom={zoom} fig={q.c} /><Arrow /><Gap />
      </div>
    );
  }
  if (q.format === "similar") {
    return <div className="stem-row"><div className="similar-box">{q.examples.map((f, i) => <Fig zoom={zoom} key={i} fig={f} />)}</div></div>;
  }
  if (q.format === "codes") return <CodedFigures q={q} showTest />;
  if (q.format === "sequences") {
    return <div className="stem-row">{q.frames.map((f, i) => <Fig zoom={zoom} key={i} fig={f} />)}<Gap /></div>;
  }
  if (q.format === "grids") {
    return (
      <div className={`grid-q grid-${q.size}`}>
        {q.cells.map((f, i) => (f ? <Fig zoom={zoom} key={i} fig={f} /> : <Gap key={i} />))}
      </div>
    );
  }
  return null; // odd one out: the options are the whole question
}

// A question with its options. slipped: option indexes already tried.
function Question({ q, onPick, slipped = [], reveal = false }) {
  const zoom = zoomFor(figuresOf(q));
  return (
    <div className="stack">
      <Stem q={q} />
      <p className="big-q">{PROMPTS[q.format]}</p>
      <div className={q.format === "codes" ? "code-options" : "option-row"}>
        {q.options.map((opt, i) => {
          const cls = `${slipped.includes(i) ? "slipped" : ""} ${reveal && i === q.answer ? "right" : ""}`;
          return q.format === "codes" ? (
            <button key={i} className={`btn secondary code-option ${cls}`} disabled={slipped.includes(i) || reveal} onClick={() => onPick(i)}>{opt}</button>
          ) : (
            <button key={i} className={`fig-btn ${cls}`} disabled={slipped.includes(i) || reveal} onClick={() => onPick(i)}>
              <Fig fig={opt} zoom={zoom} />
              <span className="option-letter">{"abcde"[i]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// One multiple-choice question: keep trying until right.
export function TryQuestion({ format, onDone }) {
  const [q] = useState(() => makeQuestion(Math.random, format));
  const [slipped, setSlipped] = useState([]);
  const [right, setRight] = useState(false);
  const choose = i => (i === q.answer ? setRight(true) : setSlipped(s => [...s, i]));
  return (
    <div className="stack">
      <Question q={q} onPick={choose} slipped={slipped} reveal={right} />
      {slipped.length > 0 && !right && <Feedback kind="ok">That one slipped past. Look again!</Feedback>}
      {right && (
        <>
          <Feedback kind="great"><div className="feedback-big">{praise()}</div><p>{q.explain}</p></Feedback>
          <button className="btn wide" onClick={() => onDone({ caught: slipped.length ? 0 : 1, missed: slipped.length ? 1 : 0 })}>Next</button>
        </>
      )}
    </div>
  );
}

function Worked({ format, n, onNext }) {
  const [q] = useState(() => makeQuestion(Math.random, format));
  return (
    <div className="stack">
      <p className="lesson-tag">Worked example {n} of 2</p>
      <Question q={q} onPick={() => {}} reveal />
      <Feedback kind="great"><p>The answer is <b>{q.format === "codes" ? q.options[q.answer] : "abcde"[q.answer]}</b>. {q.explain}</p></Feedback>
      <button className="btn wide" onClick={onNext}>Got it!</button>
    </div>
  );
}

// A lesson introducing one question type. tries: how many to try at the end.
export function Lesson({ format, tries = 3, onDone }) {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState({ caught: 0, missed: 0 });
  const info = FORMATS.find(f => f.key === format);
  const next = () => setStep(s => s + 1);

  if (step === 0) {
    return (
      <div className="sheet stack center pop lesson-intro">
        <Icon name="book" size={44} strokeWidth={1.2} className="lesson-icon" />
        <p className="lesson-tag">A new kind of puzzle</p>
        <h2 className="display">{info.name}</h2>
        {info.intro.map(line => <p key={line} className="lesson-line">{line}</p>)}
        <FilmButton id={FILM_FOR_FORMAT[format]} />
        <button className="btn wide" onClick={next}>Show me how</button>
      </div>
    );
  }
  if (step === 1 || step === 2) return <Worked key={step} format={format} n={step} onNext={next} />;
  if (step < 3 + tries) {
    return (
      <div className="stack">
        <p className="lesson-tag">Your turn</p>
        <TryQuestion key={step} format={format} onDone={r => {
          setScore(s => ({ caught: s.caught + r.caught, missed: s.missed + r.missed }));
          next();
        }} />
      </div>
    );
  }
  return (
    <div className="sheet stack center pop lesson-intro">
      <Icon name="laurel" size={48} strokeWidth={1.2} className="lesson-icon" />
      <h2 className="display">You've met {info.name}</h2>
      <p className="lesson-line">Next time you see one in the exam, you'll know exactly what to do.</p>
      <button className="btn wide" onClick={() => onDone(score)}>Next</button>
    </div>
  );
}

// Mixed round: first say which type it is, then answer it.
export function Mixed({ onDone }) {
  const [format] = useState(() => pick(Math.random, FORMAT_KEYS));
  const [q] = useState(() => makeQuestion(Math.random, format));
  const [typeSlipped, setTypeSlipped] = useState([]);
  const [typed, setTyped] = useState(false);
  const [slipped, setSlipped] = useState([]);
  const [right, setRight] = useState(false);

  if (!typed) {
    return (
      <div className="stack">
        <p className="big-q">Quick! What type of question is this?</p>
        <div className="type-preview"><Stem q={q} />{q.format === "odd" && <div className="option-row">{q.options.map((f, i) => <div key={i} className="fig-btn"><Fig fig={f} zoom={zoomFor(q.options)} /></div>)}</div>}</div>
        <div className="type-buttons">
          {FORMATS.map(f => (
            <button key={f.key} className={`btn secondary ${typeSlipped.includes(f.key) ? "slipped" : ""}`} disabled={typeSlipped.includes(f.key)}
              onClick={() => (f.key === format ? setTyped(true) : setTypeSlipped(s => [...s, f.key]))}>{f.name}</button>
          ))}
        </div>
        {typeSlipped.length > 0 && <Feedback kind="ok">That one slipped past. What is the question asking you to do?</Feedback>}
      </div>
    );
  }
  return (
    <div className="stack">
      <Feedback kind="great">Yes! It's {formatName(format)}.</Feedback>
      <Question q={q} onPick={i => (i === q.answer ? setRight(true) : setSlipped(s => [...s, i]))} slipped={slipped} reveal={right} />
      {slipped.length > 0 && !right && <Feedback kind="ok">That one slipped past. Look again!</Feedback>}
      {right && (
        <>
          <Feedback kind="great"><div className="feedback-big">{praise()}</div><p>{q.explain}</p></Feedback>
          <button className="btn wide" onClick={() => onDone({ caught: typeSlipped.length + slipped.length ? 0 : 1, missed: typeSlipped.length + slipped.length ? 1 : 0 })}>Next</button>
        </>
      )}
    </div>
  );
}
