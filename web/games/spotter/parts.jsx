// Small pieces shared by the spotter screens.
import { ATTRIBUTES } from "../../../shared/attributes.js";

const PRAISE = ["Sharp eyes!", "Nothing gets past you!", "Spotted!", "Eagle eyes!", "Brilliant looking!", "You caught it!"];
export const praise = () => PRAISE[Math.floor(Math.random() * PRAISE.length)];

// The twelve attributes as big buttons, always in the same order.
// marks: { key: "right" | "slipped" } colours buttons already tried.
export function AttributeButtons({ onPick, marks = {}, disabled = false }) {
  return (
    <div className="attr-buttons">
      {ATTRIBUTES.map((a, i) => (
        <button key={a.key} className={`attr-btn ${marks[a.key] ?? ""}`} disabled={disabled || marks[a.key] === "slipped"} onClick={() => onPick(a.key)}>
          <span className="attr-num">{i + 1}</span> {a.label}
        </button>
      ))}
    </div>
  );
}

export function Feedback({ kind, children }) {
  return <div className={`feedback ${kind} pop`}>{children}</div>;
}
