// Small pieces shared by the spotter screens.
import { ATTRIBUTES } from "../../../shared/attributes.js";
import Icon from "../../icons.jsx";
import { Seal } from "../../components.jsx";

const PRAISE = ["Sharp eyes!", "Nothing gets past you!", "Spotted!", "Eagle eyes!", "Brilliant looking!", "You caught it!"];
export const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

// The twelve attributes as a numbered ledger of buttons, always in the same order.
// marks: { key: "right" | "slipped" } shows buttons already tried.
export function AttributeButtons({ onPick, marks = {}, disabled = false }) {
  return (
    <div className="attr-buttons">
      {ATTRIBUTES.map((a, i) => (
        <button key={a.key} className={`attr-btn ${marks[a.key] ?? ""}`} disabled={disabled || marks[a.key] === "slipped"} onClick={() => onPick(a.key)}>
          <span className="attr-num">{i + 1}</span>
          <span className="attr-label">{a.label}</span>
          {marks[a.key] === "right" && <Icon name="check" size={20} strokeWidth={2.2} className="attr-tick" />}
        </button>
      ))}
    </div>
  );
}

// kind "great": a gilt seal and a gilt edge. kind "ok": warm, for one that slipped past.
export function Feedback({ kind, children }) {
  return (
    <div className={`feedback ${kind} pop`}>
      {kind === "great" ? <Seal size={34} /> : <Icon name="lens" size={30} strokeWidth={1.4} className="feedback-icon" />}
      <div className="feedback-body">{children}</div>
    </div>
  );
}
