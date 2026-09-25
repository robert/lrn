// Small bits of UI shared by every game.
import { go } from "./App.jsx";

export function BackHome({ to = "", label = "‹ Home" }) {
  return <button className="back" onClick={() => go(to)}>{label}</button>;
}

export function ProgressBar({ value }) {
  return <div className="progress"><div style={{ width: `${Math.round(Math.min(1, value) * 100)}%` }} /></div>;
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="error">Something went wrong: {String(error.message ?? error)}</div>;
}

export function Loading() {
  return <div className="page center soft">Loading…</div>;
}
