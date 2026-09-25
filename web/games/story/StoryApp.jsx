// Story Builder: turn one of his own ideas into a story plan, slot by slot,
// always in the same order, until planning becomes automatic.
import { useEffect, useState } from "react";
import { get } from "../../api.js";
import { ErrorBox, Loading, Volume, VolumeHeader } from "../../components.jsx";
import Icon from "../../icons.jsx";
import { PLAN_SLOTS } from "../../../shared/storyPlan.js";
import PlanFlow from "./PlanFlow.jsx";
import Recall from "./Recall.jsx";
import Stars from "./Stars.jsx";
import "./story.css";

export default function StoryApp() {
  const [state, setState] = useState(null);
  const [view, setView] = useState("home"); // home | plan | recall
  const [planCount, setPlanCount] = useState(0); // gives each new plan a fresh PlanFlow
  const [error, setError] = useState(null);

  const load = () => get("/api/story").then(setState, setError);
  useEffect(() => { load(); }, []);

  function backHome() {
    setView("home");
    setState(null);
    load();
  }

  if (error) return <Volume game="story"><VolumeHeader game="story" compact /><div className="page"><ErrorBox error={error} /></div></Volume>;
  if (!state) return <Loading />;
  if (view === "recall") return <Recall onDone={backHome} />;
  if (view === "plan") {
    const another = () => { setPlanCount(n => n + 1); setState(null); load(); };
    return <PlanFlow key={planCount} idea={state.idea} today={state.today} plansPerDay={state.plansPerDay} onDone={backHome} onAnother={another} />;
  }

  return (
    <Volume game="story">
      <VolumeHeader game="story" lead="A good reader knows how good stories are built. Time to build some." />
      <div className="page stack">
        <Stars count={state.plansToday} of={state.plansPerDay} />

        {state.recallDue ? (
          <section className="sheet story-challenge">
            <Icon name="sparkle" size={30} strokeWidth={1.2} className="story-challenge-icon" />
            <h2 className="title">A memory challenge first</h2>
            <p className="soft">A blank plan with no labels. Can you name every part of it from memory?</p>
            <button className="btn wide" onClick={() => setView("recall")}>I'm ready</button>
          </section>
        ) : (
          <button className="btn wide story-go" onClick={() => setView("plan")}>
            <Icon name="quill" />{state.plansToday === 0 ? "Build a plan" : "Build another plan"}
          </button>
        )}

        <p className="story-order">
          Every plan, in the same order:{" "}
          {PLAN_SLOTS.map((s, i) => (
            <span key={s.id}>{s.label}{i < PLAN_SLOTS.length - 1 && <span className="story-order-sep" aria-hidden="true">·</span>}</span>
          ))}
        </p>
      </div>
    </Volume>
  );
}
