// The prediction round: how many "what happens next" ideas can he think of?
import { useState } from "react";
import Icon from "../../icons.jsx";

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
    <section id="predict" className="sheet reader-predict pop">
      <div className="reader-left">
        <div className="reader-left-label">Where we left them</div>
        <p className="reader-left-text">{whereLeft}</p>
      </div>

      {stage === "count" && (
        <>
          <h2 className="reader-predict-title">What happens next?</h2>
          <p className="reader-predict-ask">
            Every idea needs a <strong>problem</strong> and a <strong>solution</strong>: what goes wrong, and how it gets fixed.
            How many can you think of? At least three. Say each one out loud and press +.
          </p>
          <div className="reader-counter">
            <button className="reader-counter-btn" onClick={() => setCount(Math.max(0, count - 1))} aria-label="One fewer">
              <Icon name="minus" size={30} strokeWidth={2} />
            </button>
            <div className="reader-counter-num" aria-live="polite">{count}</div>
            <button className="reader-counter-btn plus" onClick={() => setCount(count + 1)} aria-label="One more idea">
              <Icon name="plus" size={30} strokeWidth={2} />
            </button>
          </div>
          <button className="btn wide" onClick={submit}>{count === 0 ? "I can't think of any" : "Submit"}</button>
        </>
      )}

      {stage === "hints" && (
        <>
          <p className="reader-predict-ask reader-predict-push">
            You can be more creative than that! Mega Readers know so many stories they can always imagine a problem and a way out of it.
          </p>
          <div className="reader-hint pop" key={hintIndex}>
            <div className="reader-left-label">Hint {hintIndex + 1}</div>
            <p className="reader-left-text">{hints[hintIndex]}</p>
          </div>
          <div className="reader-hint-actions">
            <button className="btn" onClick={() => answerHint(true)}><Icon name="star" size={20} />I like that story idea</button>
            <button className="btn secondary" onClick={() => answerHint(false)}>Nah</button>
          </div>
        </>
      )}

      {stage === "done" && (
        <>
          <div className="reader-predict-done">
            <Icon name="sparkle" size={28} strokeWidth={1.2} className="reader-praise-icon" />
            <p>{total >= 3 ? `${total} story ideas! What an imagination!` : "Great thinking! Every idea makes you a sharper reader."}</p>
          </div>
          <button className="btn wide" disabled={saving} onClick={finish}>Finish tonight's challenge</button>
        </>
      )}
    </section>
  );
}
