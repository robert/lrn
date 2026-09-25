// Building one plan: show his idea, then fill every slot in the fixed order.
import { useState } from "react";
import { post } from "../../api.js";
import { ErrorBox } from "../../components.jsx";
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
      <div className="page stack">
        <div className="card center pop">
          <div style={{ fontSize: 64 }}>🏗️</div>
          <div className="title">Plan complete!</div>
          <p className="story-tagline">That's a story ready to write. This is exactly how great writers start.</p>
        </div>
        <Stars count={saved} of={plansPerDay} />
        <PlanOutline values={values} />
        <button className="btn mud wide" onClick={onAnother}>Build another plan</button>
        <button className="btn secondary wide" onClick={onDone}>Back to Story Builder</button>
      </div>
    );
  }

  if (step === -1) {
    return (
      <div className="page stack">
        <button className="back" onClick={onDone}>‹ Story Builder</button>
        <div className="card stack story-idea">
          <div className="title">
            {idea.starter ? "Here's a starter idea to warm up!" : `This was your idea from ${whenLabel(idea.date, today)}!`}
          </div>
          {idea.situation && <div className="soft">{idea.situation}</div>}
          <div><b className="story-tag problem">Problem</b> {idea.problem}</div>
          <div><b className="story-tag solution">Solution</b> {idea.solution}</div>
          {idea.starter && (
            <p className="soft">Once you've played the Imagination Engine, your own ideas will show up here.</p>
          )}
        </div>
        <button className="btn mud wide" onClick={() => setStep(0)}>Let's plan it!</button>
      </div>
    );
  }

  const prefilled = PREFILLED.includes(slot.id);
  return (
    <div className="page stack">
      <button className="back" onClick={() => setStep(s => s - 1)}>‹ Back</button>
      <div className="card stack">
        <div className="story-slot-label">{slot.label}</div>
        <div className="story-slot-prompt">
          {prefilled ? `Here's your ${slot.label.toLowerCase()}. Keep it, or make it even better!` : slot.prompt}
        </div>
        <textarea className="story-text" rows={3} value={values[slot.id] ?? ""}
          onChange={e => setSlot(slot.id, e.target.value)} placeholder="Say it or type it…" />
        <MicButton key={slot.id} onPhrase={appendToSlot} />
      </div>
      <ErrorBox error={error} />
      <button className="btn mud wide" disabled={!values[slot.id]?.trim()}
        onClick={() => (isLast ? save() : setStep(s => s + 1))}>
        {isLast ? "Finish my plan ✓" : prefilled ? "Yes, that's it ➜" : "Next ➜"}
      </button>
      <PlanOutline values={values} current={slot.id} />
    </div>
  );
}

// The whole plan in its fixed order, so the shape of it sinks in.
function PlanOutline({ values, current }) {
  return (
    <div className="card story-outline">
      {PLAN_SLOTS.map(s => (
        <div key={s.id} className={`story-outline-row ${s.id === current ? "current" : ""} ${values[s.id]?.trim() ? "filled" : ""}`}>
          <div className="story-outline-label">{s.label}</div>
          <div className="story-outline-text">{values[s.id] || "…"}</div>
        </div>
      ))}
    </div>
  );
}
