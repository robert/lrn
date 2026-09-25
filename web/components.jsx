// Small bits of UI shared by every game. See DESIGN.md.
import { go } from "./App.jsx";
import Icon from "./icons.jsx";

// Each game is a "volume" with its own cloth colour.
export const VOLUMES = {
  reader: { colour: "var(--vol-reader)", emblem: "book", name: "Mega Reader Challenge" },
  imagination: { colour: "var(--vol-imagination)", emblem: "bulb", name: "Imagination Engine" },
  story: { colour: "var(--vol-story)", emblem: "quill", name: "Story Builder" },
  spotter: { colour: "var(--vol-spotter)", emblem: "eye", name: "Are you the kid that nothing gets past?" },
};

// Wrap a whole game screen in this so buttons and bars pick up its cloth colour.
export function Volume({ game, children }) {
  return <div style={{ "--vol": VOLUMES[game].colour, minHeight: "100vh" }}>{children}</div>;
}

// The cloth band across the top of a game screen, with the title stamped in gilt.
export function VolumeHeader({ game, title, lead, to = "", backLabel = "Home", compact = false }) {
  const v = VOLUMES[game];
  return (
    <header className="volume-band cloth" style={{ "--vol": v.colour, paddingBottom: compact ? 22 : undefined }}>
      <div className="volume-band-inner">
        <button className="home-link" onClick={() => go(to)}><Icon name="back" />{backLabel}</button>
        {!compact && <Icon name={v.emblem} className="emblem" strokeWidth={1.3} />}
        <h1 className="big-title" style={compact ? { fontSize: 26, marginTop: 28 } : undefined}>{title ?? v.name}</h1>
        {lead && !compact && <p className="lead">{lead}</p>}
      </div>
    </header>
  );
}

export function BackHome({ to = "", label = "Home" }) {
  return <button className="back" onClick={() => go(to)}><Icon name="back" size={18} />{label}</button>;
}

export function ProgressBar({ value }) {
  return <div className="progress"><div style={{ width: `${Math.round(Math.min(1, value) * 100)}%` }} /></div>;
}

export function Seal({ size = 42 }) {
  return <span className="seal" style={{ width: size, height: size }}><Icon name="check" strokeWidth={2.4} /></span>;
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return <div className="error">Something went wrong: {String(error.message ?? error)}</div>;
}

export function Loading() {
  return <div className="page center faint" style={{ paddingTop: 80 }}>Opening the book…</div>;
}
