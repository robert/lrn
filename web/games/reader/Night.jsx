// One night of the Mega Reader Challenge: passage, ten questions, prediction round, finish.
import { useEffect, useRef, useState } from "react";
import { post } from "../../api.js";
import { go } from "../../App.jsx";
import { ErrorBox } from "../../components.jsx";
import { locate, parseItalics, quoteIn } from "../../../shared/text.js";
import {
  RUNGS, rungFor, PRAISE, RUN_MESSAGES, FLAW_NAMES, NUDGES,
  shuffledOptions, finishTitle, nextNight, stripStars,
} from "./logic.js";
import Predict from "./Predict.jsx";

const scrollToId = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });

export default function Night({ night, data }) {
  const [phase, setPhase] = useState("reading"); // reading, questions, predict, finish
  const [readToEnd, setReadToEnd] = useState(false);
  const [qi, setQi] = useState(0);
  // One entry per question: { tried: [option keys in order], solved, firstTry }
  const [answers, setAnswers] = useState(() => night.questions.map(() => ({ tried: [], solved: false, firstTry: false })));
  const [highlight, setHighlight] = useState(null); // { para, range } range null = whole paragraph
  const [popup, setPopup] = useState(null); // the wrong option just picked
  const [feedback, setFeedback] = useState(null); // shown after a correct answer
  const [run, setRun] = useState(0); // first-time answers in a row
  const [finish, setFinish] = useState(null);
  const [error, setError] = useState(null);
  const endRef = useRef(null);

  // "I've read it!" only wakes up once the end of the passage has been on screen.
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) setReadToEnd(true);
    });
    obs.observe(endRef.current);
    return () => obs.disconnect();
  }, []);

  const solvedCount = answers.filter(a => a.solved).length;
  const score = solvedCount * 2;
  const q = night.questions[qi];
  const options = shuffledOptions(q.options, `${night.id}:${qi}`);
  const answer = answers[qi];

  function showClue(para) {
    setHighlight({ para, range: null });
    scrollToId(`para-${para}`);
  }

  function showQuote(quote, para) {
    setHighlight({ para, range: locate(night.paras[para - 1], quote) });
    scrollToId(`para-${para}`);
  }

  function pick(opt) {
    if (answer.solved || answer.tried.includes(opt.key)) return;
    const tried = [...answer.tried, opt.key];
    if (!opt.correct) {
      setAnswers(a => a.map((x, i) => (i === qi ? { ...x, tried } : x)));
      setPopup(opt);
      return;
    }
    const firstTry = tried.length === 1;
    const newRun = firstTry ? run + 1 : 0;
    setRun(newRun);
    setAnswers(a => a.map((x, i) => (i === qi ? { tried, solved: true, firstTry } : x)));
    setFeedback({
      why: opt.why,
      rung: RUNGS[rungFor(solvedCount + 1) - 1],
      praise: PRAISE[(qi + solvedCount * 3) % PRAISE.length],
      runMessage: firstTry ? RUN_MESSAGES[newRun] : null,
    });
  }

  function nextQuestion() {
    setFeedback(null);
    setHighlight(null);
    if (qi + 1 < night.questions.length) {
      setQi(qi + 1);
      setTimeout(() => scrollToId("question"), 50);
    } else {
      setPhase("predict");
      setTimeout(() => scrollToId("predict"), 50);
    }
  }

  async function finishNight(ideas) {
    const results = night.questions.map((question, i) => ({
      q: stripStars(question.q),
      firstTry: answers[i].firstTry,
      tried: answers[i].tried.map(k => question.options[k].text),
      correct: question.options.find(o => o.correct).text,
    }));
    const firstTry = answers.filter(a => a.firstTry).length;
    try {
      const saved = await post("/api/reader/night", {
        id: night.id, score, firstTry, total: night.questions.length, results, ideas,
      });
      const progress = { ...data.progress, nights: { ...data.progress.nights, [night.id]: { firstTry } } };
      setFinish({ firstTry, streak: saved.streak, next: nextNight(data.chapters, progress) });
      setPhase("finish");
      window.scrollTo(0, 0);
    } catch (e) {
      setError(e);
    }
  }

  if (phase === "finish") return <Finish score={score} finish={finish} />;

  const litRungs = solvedCount ? rungFor(solvedCount) : 0;

  return (
    <div className="reader-night">
      <header className="reader-sticky">
        <button className="back" onClick={() => go("reader")}>‹</button>
        <div className="reader-score">
          <div className="reader-score-label">Mega Reader Score</div>
          <div className="reader-score-num">{score}</div>
        </div>
        <div className="reader-ladder" aria-label="Reader ladder">
          {RUNGS.map((r, i) => (
            <div key={r} className={`reader-rung ${i < litRungs ? "lit" : ""}`} title={r} />
          ))}
          <div className="reader-rung-name">{litRungs ? RUNGS[litRungs - 1] : "Climb the ladder!"}</div>
        </div>
        {phase === "questions" && (
          <button className="btn small secondary reader-jump" onClick={() => scrollToId("question")}>Question ↓</button>
        )}
      </header>

      <div className="page stack">
        <article className="card reader-passage">
          {night.paras.map((p, i) => (
            <Paragraph key={i} n={i + 1} text={p} highlight={highlight?.para === i + 1 ? highlight : null} />
          ))}
          <div ref={endRef} />
        </article>

        {phase === "reading" && (
          <button className="btn wide" disabled={!readToEnd} onClick={() => {
            setPhase("questions");
            setTimeout(() => scrollToId("question"), 50);
          }}>
            {readToEnd ? "I've read it! Bring on the questions" : "Read to the end first…"}
          </button>
        )}

        {phase === "questions" && (
          <section id="question" className="card stack reader-question pop" key={qi}>
            <div className="reader-q-text"><QuestionText text={q.q} onQuote={quote => showQuote(quote, q.para)} /></div>
            <div className="stack">
              {options.map(opt => {
                const tried = answer.tried.includes(opt.key);
                const state = answer.solved && opt.correct ? "right" : tried ? "greyed" : "";
                return (
                  <button key={opt.key} className={`reader-option ${state}`} disabled={tried || answer.solved} onClick={() => pick(opt)}>
                    {opt.text}
                  </button>
                );
              })}
            </div>
            {answer.tried.length > 0 && !answer.solved && (
              <button className="btn small secondary" onClick={() => showClue(q.para)}>Show me the clue: paragraph {q.para}</button>
            )}
            {feedback && (
              <div className="reader-feedback pop">
                <div className="reader-praise">{feedback.praise} {feedback.runMessage && <span>{feedback.runMessage}</span>}</div>
                <p>{feedback.why}</p>
                <div className="reader-rung-up">You're now a {feedback.rung}!</div>
                <button className="btn wide" onClick={nextQuestion}>
                  {qi + 1 < night.questions.length ? "Next question" : "What happens next?"}
                </button>
              </div>
            )}
          </section>
        )}

        {phase === "predict" && (
          <Predict
            whereLeft={night.questions.at(-1).options.find(o => o.correct).text}
            hints={night.hints}
            onFinish={finishNight}
          />
        )}
        <ErrorBox error={error} />
      </div>

      {popup && (
        <div className="overlay" onClick={() => setPopup(null)}>
          <div className="card stack pop" onClick={e => e.stopPropagation()}>
            <div className="title">Try again!</div>
            <div className="reader-flaw">{FLAW_NAMES[popup.flaw]}</div>
            <p>{popup.why}</p>
            <p className="soft">{NUDGES[answer.tried.length % NUDGES.length]}</p>
            <button className="btn wide" onClick={() => { setPopup(null); showClue(q.para); }}>
              Show me the clue in paragraph {q.para}
            </button>
            <button className="btn wide secondary" onClick={() => setPopup(null)}>I'll try again without looking</button>
          </div>
        </div>
      )}
    </div>
  );
}

// A numbered paragraph with the book's italics, plus an optional highlight.
function Paragraph({ n, text, highlight }) {
  const chars = parseItalics(text);
  const [from, to] = highlight?.range ?? (highlight ? [0, chars.length] : [-1, -1]);
  // Group neighbouring characters that share the same styling.
  const runs = [];
  chars.forEach((c, i) => {
    const lit = i >= from && i < to;
    const last = runs.at(-1);
    if (last && last.italic === c.italic && last.lit === lit) last.text += c.ch;
    else runs.push({ italic: c.italic, lit, text: c.ch });
  });
  return (
    <p id={`para-${n}`} className="reader-para">
      <span className="reader-para-num">{n}</span>
      {runs.map((r, i) => {
        const inner = r.italic ? <em>{r.text}</em> : r.text;
        return r.lit ? <mark key={i}>{inner}</mark> : <span key={i}>{inner}</span>;
      })}
    </p>
  );
}

// Question text with *quoted* words shown as tappable brown italics.
function QuestionText({ text, onQuote }) {
  return text.split(/(\*[^*]+\*)/).map((part, i) => {
    const quote = quoteIn(part);
    if (!quote) return <span key={i}>{part}</span>;
    return <button key={i} className="reader-quote" onClick={() => onQuote(quote)}>{quote}</button>;
  });
}

function Finish({ score, finish }) {
  return (
    <div className="page stack center reader">
      <div className="card stack pop">
        <div style={{ fontSize: 64 }}>🏆</div>
        <div className="reader-finish-score">{score} points</div>
        <div className="big-title">{finishTitle(finish.firstTry)}</div>
        <div className="reader-tile-big">🔥 {finish.streak}</div>
        <div className="soft">{finish.streak === 1 ? "night" : "nights"} in a row</div>
        <p className="reader-finish-note">See if you can keep up your streak tomorrow with another Mega Reader challenge!</p>
        <button className="btn wide" onClick={() => go("reader")}>Back to home</button>
        {finish.next?.questions?.length > 0 && (
          <button className="btn wide secondary" onClick={() => go(`reader/night/${finish.next.id}`)}>
            I want more! Start the next night
          </button>
        )}
      </div>
    </div>
  );
}
