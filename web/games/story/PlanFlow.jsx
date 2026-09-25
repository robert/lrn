// Building one plan: show his idea, then fill every slot in the fixed order.
import { useState } from "react";
import { post } from "../../api.js";
import { ErrorBox, Volume, VolumeHeader } from "../../components.jsx";
import Icon from "../../icons.jsx";
import { PLAN_SLOTS } from "../../../shared/storyPlan.js";
import MicButton from "./MicButton.jsx";
import Stars from "./Stars.jsx";

const PREFILLED = ["problem", "solution"]; // these come from his idea; he just confirms

// "today", "yesterday" or the weekday name, for "This was your idea from Tuesday!"
function whenLabel(date, today) {
  const parse = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const days = Math.round((parse(today) - parse(date)) / 86_400_000);
  if (days === 0) return "earlier today";
  if (days === 1) return "yesterday";
  const weekday = parse(date).toLocaleDateString("en-GB", { weekday: "long" });
  return days < 7 ? weekday : `last ${weekday}`;
}

export default function PlanFlow({ idea, today, plansPerDay, onDone, onAnother }) {
  const [step, setStep] = useState(-1); // -1 = the idea card, then one step per slot
  const [values, setValues] = useState({ problem: idea.problem, solution: idea.solution });
  const [saved, setSaved] = useState(null);
  const [error, setError] = useState(null);

  const slot = PLAN_SLOTS[step];
  const isLast = step === PLAN_SLOTS.length - 1;
  const setSlot = (id, text) => setValues(v => ({ ...v, [id]: text }));
  const appendToSlot = text => setValues(v => ({ ...v, [slot.id]: [v[slot.id], text].filter(Boolean).join(" ") }));

  async function save() {
    setError(null);
    try {
      const { plansToday } = await post("/api/story/plan", {
        pairId: idea.starter ? null : idea.id,
        idea: { situation: idea.situation, problem: idea.problem, solution: idea.solution },
        slots: values,
      });
      setSaved(plansToday);
    } catch (e) { setError(e); }
  }

  if (saved !== null) {
    return (
      <Volume game="story">
        <VolumeHeader game="story" title="Plan complete" compact to="story" backLabel="Story Builder" />
        <div className="page stack">
          <section className="story-done center pop">
            <div className="story-wreath"><Icon name="laurel" size={150} strokeWidth={0.7} /><Icon name="quill" size={44} strokeWidth={1.3} /></div>
            <h2 className="display">That's a story ready to write</h2>
            <p className="lead soft">This is exactly how great writers begin.</p>
          </section>
          <Stars count={saved} of={plansPerDay} />
          <PlanOutline values={values} />
          <div className="story-actions">
            <button className="btn" onClick={onAnother}><Icon name="quill" />Build another plan</button>
            <button className="btn secondary" onClick={onDone}>Back to Story Builder</button>
          </div>
        </div>
      </Volume>
    );
  }

  if (step === -1) {
    return (
      <Volume game="story">
        <VolumeHeader game="story" title="Your idea" compact to="story" backLabel="Story Builder" />
        <div className="page stack">
          <section className="sheet story-idea">
            <p className="story-idea-when">
              {idea.starter ? "A starter idea to warm up with" : `This was your idea from ${whenLabel(idea.date, today)}!`}
            </p>
            {idea.situation && <h2 className="story-idea-situation">{idea.situation}</h2>}
            <div className="story-pair">
              <p><span className="story-pair-label">Problem</span>{idea.problem}</p>
              <p><span className="story-pair-label solution">Solution</span>{idea.solution}</p>
            </div>
            {idea.starter && (
              <p className="story-idea-note">Once you've played the Imagination Engine, your own ideas will show up here.</p>
            )}
          </section>
          <button className="btn wide story-go" onClick={() => setStep(0)}>Let's plan it<Icon name="next" /></button>
        </div>
      </Volume>
    );
  }

  const prefilled = PREFILLED.includes(slot.id);
  return (
    <Volume game="story">
      <header className="story-bar cloth">
        <div className="story-bar-inner">
          <button className="home-link" onClick={() => setStep(s => s - 1)}><Icon name="back" />Back</button>
          <ol className="story-steps" aria-label="The plan, in order">
            {PLAN_SLOTS.map((s, i) => (
              <li key={s.id} className={i === step ? "current" : i < step ? "done" : ""}>{s.label}</li>
            ))}
          </ol>
        </div>
      </header>

      <div className="page stack">
        <section className="story-page sheet" key={slot.id}>
          <h1 className="story-slot-label">{slot.label}</h1>
          <p className="story-slot-prompt">
            {prefilled ? `Here's your ${slot.label.toLowerCase()}. Keep it, or make it even better.` : slot.prompt}
          </p>
          <textarea className="story-lines" rows={3} value={values[slot.id] ?? ""}
            onChange={e => setSlot(slot.id, e.target.value)} placeholder="Say it or write it here…" />
          <MicButton key={slot.id} onPhrase={appendToSlot} />
        </section>
        <ErrorBox error={error} />
        <button className="btn wide story-go" disabled={!values[slot.id]?.trim()}
          onClick={() => (isLast ? save() : setStep(s => s + 1))}>
          {isLast ? <><Icon name="check" />Finish my plan</> : prefilled ? <>Yes, that's it<Icon name="next" /></> : <>Next<Icon name="next" /></>}
        </button>
        <PlanOutline values={values} current={slot.id} />
      </div>
    </Volume>
  );
}

// The whole plan in its fixed order, so the shape of it sinks in.
function PlanOutline({ values, current }) {
  return (
    <section className="sheet story-outline">
      <h2 className="story-outline-title">Your plan</h2>
      {PLAN_SLOTS.map(s => (
        <div key={s.id} className={`story-outline-row ${s.id === current ? "current" : ""} ${values[s.id]?.trim() ? "filled" : ""}`}>
          <span className="story-outline-label">{s.label}</span>
          <span className="story-outline-text">{values[s.id] || ""}</span>
        </div>
      ))}
    </section>
  );
}
