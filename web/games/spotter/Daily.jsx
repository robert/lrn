// The daily challenge: about twenty items, mostly Spot the Change, with a
// few Odd One Out, Codes and Question Types. Only a progress bar is shown.
import { useState } from "react";
import { post } from "../../api.js";
import { go } from "../../App.jsx";
import { ErrorBox, ProgressBar } from "../../components.jsx";
import { FORMAT_KEYS } from "./formats.js";
import SpotChange from "./SpotChange.jsx";
import OddOneOut from "./OddOneOut.jsx";
import Codes from "./Codes.jsx";
import Flashcards from "./Flashcards.jsx";
import { Lesson, Mixed } from "./Questions.jsx";
import { ANIMALS, Cameo } from "./animals.jsx";
import Icon from "../../icons.jsx";

// Each item has a weight: roughly how many "comparisons" it is worth.
export function buildPlan(state) {
  const spot = n => Array.from({ length: n }, () => ({ type: "spot", weight: 1 }));
  const newFormat = FORMAT_KEYS.find(f => !state.metFormats.includes(f));
  const plan = [];
  if (state.flashcards) plan.push({ type: "flash", weight: 2 });
  plan.push(...spot(4), { type: "odd", weight: 1 }, ...spot(3));
  if (newFormat) plan.push({ type: "lesson", format: newFormat, weight: 4 });
  plan.push(...spot(3), { type: "codes", weight: 1 }, ...spot(3), { type: "odd", weight: 1 });
  plan.push(...spot(newFormat ? 0 : 1));
  if (!newFormat) plan.push({ type: "mixed", weight: 1 }, { type: "mixed", weight: 1 }, { type: "mixed", weight: 1 });
  return plan;
}

export default function Daily({ state, onFinished }) {
  const [plan] = useState(() => buildPlan(state));
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState({ spot: 0, caught: 0, missed: 0 });
  const [promotion, setPromotion] = useState(null);
  const [error, setError] = useState(null);

  const totalWeight = plan.reduce((s, it) => s + it.weight, 0);
  const doneWeight = plan.slice(0, index).reduce((s, it) => s + it.weight, 0);

  async function itemDone(item, result) {
    const next = {
      spot: tally.spot + (item.type === "spot" ? 1 : 0),
      caught: tally.caught + result.caught,
      missed: tally.missed + result.missed,
    };
    setTally(next);
    window.scrollTo(0, 0);
    try {
      if (item.type === "lesson") await post("/api/spotter/format", { format: item.format });
      if (index + 1 < plan.length) return setIndex(index + 1);
      const res = await post("/api/spotter/day", next);
      setIndex(index + 1);
      setPromotion(res.promotion ?? { again: true });
    } catch (e) { setError(e); }
  }

  if (promotion) return <Promotion promotion={promotion} onDone={onFinished} />;
  const item = plan[index];
  const key = `${index}`;
  const props = { onDone: r => itemDone(item, r) };
  return (
    <div className="stack">
      <div className="daily-bar"><ProgressBar value={doneWeight / totalWeight} /></div>
      <ErrorBox error={error} />
      {item.type === "spot" && <SpotChange key={key} done={state.spotDone + tally.spot} {...props} />}
      {item.type === "odd" && <OddOneOut key={key} {...props} />}
      {item.type === "codes" && <Codes key={key} {...props} />}
      {item.type === "flash" && <Flashcards key={key} {...props} />}
      {item.type === "lesson" && <Lesson key={key} format={item.format} {...props} />}
      {item.type === "mixed" && <Mixed key={key} {...props} />}
    </div>
  );
}

// The promotion screen, laid out like a certificate.
function Promotion({ promotion, onDone }) {
  if (promotion.again) {
    return (
      <div className="sheet stack center pop">
        <Icon name="eye" size={48} strokeWidth={1.2} className="certificate-icon" />
        <h2 className="display">Extra round done</h2>
        <p className="lead">You've already climbed today. Come back tomorrow for your next animal.</p>
        <button className="btn wide" onClick={onDone}>Back</button>
      </div>
    );
  }
  const animal = ANIMALS[promotion.animal];
  const a = /^[aeiou]/i.test(animal.name) ? "an" : "a";
  return (
    <div className="certificate pop">
      <div className="certificate-frame stack center">
        <p className="certificate-kicker">Today's challenge is complete</p>
        <Cameo animal={animal.key} width={150} current />
        {promotion.levelComplete ? (
          <>
            <h2 className="certificate-title">Level {promotion.level} complete: you're the kid nothing gets past.</h2>
            <p className="certificate-fact">You're {a} {animal.name.toLowerCase()}. {animal.fact}</p>
            <p className="certificate-why">Tomorrow Level {promotion.level + 1} begins, and you start again as a mole. Can you climb all the way again?</p>
          </>
        ) : (
          <>
            <h2 className="certificate-title">You're now {a} {animal.name}</h2>
            <p className="certificate-fact">{animal.fact}</p>
            <p className="certificate-why">{animal.why}</p>
          </>
        )}
        <div className="flourish certificate-rule"><Icon name="sparkle" size={16} strokeWidth={1.3} /></div>
        <button className="btn gold wide" onClick={onDone}>Brilliant!</button>
        <button className="btn quiet" onClick={() => go("")}>Back to all the games</button>
      </div>
    </div>
  );
}
