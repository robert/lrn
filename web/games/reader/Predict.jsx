// The prediction round: how many "what happens next" ideas can he think of?
import { useState } from "react";

export default function Predict({ whereLeft, hints, onFinish }) {
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState("count"); // count, hints, done
  const [hintIndex, setHintIndex] = useState(0);
  const [liked, setLiked] = useState([]);
  const [saving, setSaving] = useState(false);

  function submit() {
    setStage(count >= 3 ? "done" : "hints");
  }

  function answerHint(like) {
    const nowLiked = like ? [...liked, hints[hintIndex]] : liked;
    setLiked(nowLiked);
    if (count + nowLiked.length >= 3 || hintIndex + 1 >= hints.length) setStage("done");
    else setHintIndex(hintIndex + 1);
  }

  async function finish() {
    setSaving(true);
    await onFinish({ said: count, liked });
    setSaving(false);
  }

  const total = count + liked.length;

  return (
    <section id="predict" className="card stack reader-predict pop">
      <div className="reader-left">
        <div className="reader-left-label">Where we left them</div>
        <div>{whereLeft}</div>
      </div>

      {stage === "count" && (
        <>
          <p className="reader-predict-ask">
            What happens next? Every idea needs a PROBLEM and a SOLUTION: what goes wrong, and how it gets fixed.
            How many can you think of? At least three. Say each one out loud and press +.
          </p>
          <div className="reader-counter">
            <button className="btn secondary" onClick={() => setCount(Math.max(0, count - 1))} aria-label="minus">−</button>
            <div className="reader-counter-num">{count}</div>
            <button className="btn" onClick={() => setCount(count + 1)} aria-label="plus">+</button>
          </div>
          <button className="btn wide" onClick={submit}>{count === 0 ? "I can't think of any" : "Submit"}</button>
        </>
      )}

      {stage === "hints" && (
        <>
          <p className="reader-predict-ask">
            You can be more creative than that! Mega Readers know so many stories they can always imagine a problem and a way out of it.
          </p>
          <div className="reader-hint pop" key={hintIndex}>
            <div className="reader-left-label">Hint {hintIndex + 1}</div>
            <div>{hints[hintIndex]}</div>
          </div>
          <div className="row">
            <button className="btn" onClick={() => answerHint(true)}>I like that story idea</button>
            <button className="btn secondary" onClick={() => answerHint(false)}>Nah</button>
          </div>
        </>
      )}

      {stage === "done" && (
        <>
          <div className="reader-praise center">
            {total >= 3 ? `${total} story ideas! What an imagination!` : "Great thinking! Every idea makes you a sharper reader."}
          </div>
          <button className="btn wide" disabled={saving} onClick={finish}>Finish tonight's challenge</button>
        </>
      )}
    </section>
  );
}
