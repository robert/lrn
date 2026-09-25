// Story Builder: turn one of his own ideas into a story plan, slot by slot,
// always in the same order, until planning becomes automatic.
import { useEffect, useState } from "react";
import { get } from "../../api.js";
import { BackHome, ErrorBox, Loading } from "../../components.jsx";
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

  if (error) return <div className="page"><BackHome /><ErrorBox error={error} /></div>;
  if (!state) return <Loading />;
  if (view === "recall") return <Recall onDone={backHome} />;
  if (view === "plan") {
    const another = () => { setPlanCount(n => n + 1); setState(null); load(); };
    return <PlanFlow key={planCount} idea={state.idea} today={state.today} plansPerDay={state.plansPerDay} onDone={backHome} onAnother={another} />;
  }

  return (
    <div className="page stack">
      <BackHome />
      <header className="center">
        <div className="big-title story-title">STORY BUILDER</div>
        <p className="story-tagline">A good reader knows how good stories are built. Time to build some.</p>
      </header>

      <Stars count={state.plansToday} of={state.plansPerDay} />

      {state.recallDue ? (
        <div className="card stack center">
          <div className="title">🧠 Memory challenge first!</div>
          <p>A blank plan with no labels. Can you name every part from memory?</p>
          <button className="btn mud wide" onClick={() => setView("recall")}>I'm ready</button>
        </div>
      ) : (
        <button className="btn mud wide story-go" onClick={() => setView("plan")}>
          {state.plansToday === 0 ? "Build a plan" : "Build another plan"}
        </button>
      )}
    </div>
  );
}
