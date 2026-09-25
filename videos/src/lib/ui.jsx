// Building blocks for scenes: plates, rings, seals, strikes, notes and cards.
// All sizes are in pixels on the 1920x1080 frame.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, SERIF, SANS } from "./theme.js";
import { rise, pop, lerp } from "./anim.js";

// A paper plate holding a figure, like a plate in a fine book.
// `appear` 0..1 fades and lifts it in; `dim` greys it out; `glow` warms it.
export function Plate({ x, y, w = 240, h = 240, label, appear = 1, dim = 0, glow = 0, children, labelSize = 34 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y + (1 - appear) * 24, width: w, height: h,
      opacity: appear * (1 - dim * 0.62),
    }}>
      <div style={{
        position: "absolute", inset: 0, borderRadius: 8, background: C.white,
        boxShadow: `0 0 0 1.5px ${glow > 0 ? mix(C.rule, C.gilt, glow) : C.rule}, 0 ${10 + glow * 8}px 28px -18px rgba(27,42,36,${0.45 + glow * 0.2})`,
      }} />
      <svg width={w} height={h} viewBox={`${-w / 2} ${-h / 2} ${w} ${h}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {children}
      </svg>
      {label && (
        <div style={{
          position: "absolute", top: h + 12, left: 0, right: 0, textAlign: "center",
          fontFamily: SERIF, fontStyle: "italic", fontSize: labelSize, color: C.soft,
        }}>{label}</div>
      )}
    </div>
  );
}

// Blend two hex colours.
export function mix(a, b, k) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(lerp(v, y[i], k)).toString(16).padStart(2, "0")).join("");
}

// A gilt ring drawn round something, like a careful pencil circle.
export function Ring({ x, y, w, h, progress, color = C.gilt, width = 5 }) {
  if (progress <= 0) return null;
  const rx = w / 2, ry = h / 2;
  // A slightly overlapping loop so it looks hand-drawn, not mechanical.
  const d = `M ${rx * 0.2} ${-ry * 1.02} C ${rx * 1.15} ${-ry * 1.05}, ${rx * 1.08} ${ry * 1.06}, 0 ${ry}
             C ${-rx * 1.1} ${ry * 0.98}, ${-rx * 1.06} ${-ry * 1.04}, ${rx * 0.32} ${-ry * 0.96}`;
  return (
    <svg style={{ position: "absolute", left: x - rx - 20, top: y - ry - 20, overflow: "visible" }} width={w + 40} height={h + 40}
      viewBox={`${-rx - 20} ${-ry - 20} ${w + 40} ${h + 40}`}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, progress)} />
    </svg>
  );
}

// A soft diagonal stroke through a wrong option.
export function Strike({ x, y, w, h, progress, color = C.mud }) {
  if (progress <= 0) return null;
  return (
    <svg style={{ position: "absolute", left: x, top: y, overflow: "visible" }} width={w} height={h}>
      <line x1={w * 0.12} y1={h * 0.86} x2={w * 0.88} y2={h * 0.14} stroke={color} strokeWidth={6} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, progress)} opacity={0.75} />
    </svg>
  );
}

// A gilt wax seal with a tick, stamped on with a little bounce.
export function Seal({ x, y, size = 96, t, start = 0 }) {
  const k = pop(t, start);
  if (k <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%",
      transform: `scale(${lerp(1.6, 1, k)}) rotate(${lerp(-25, 0, k)}deg)`, opacity: Math.min(1, k * 1.5),
      background: `radial-gradient(circle at 35% 30%, ${C.giltLight}, ${C.gilt} 55%, ${C.giltDark})`,
      boxShadow: "0 6px 18px rgba(0,0,0,0.35), inset 0 0 0 4px rgba(255,255,255,0.22)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
        <path d="m4.5 12.5 4.8 4.8L19.5 7" fill="none" stroke={C.clothDeep} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Text set in the storybook serif. `appear` fades and lifts it in.
export function Words({ x, y, w, children, size = 44, italic = false, color = C.ink, align = "left", appear = 1, weight = 500, style }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y + (1 - appear) * 16, width: w, opacity: appear,
      fontFamily: SERIF, fontStyle: italic ? "italic" : "normal", fontWeight: weight, fontSize: size,
      lineHeight: 1.25, color, textAlign: align, ...style,
    }}>{children}</div>
  );
}

// A small note, like a label written in the margin with a highlighter.
export function Note({ x, y, children, appear = 1, size = 36, color = C.ink, bg = C.highlight }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, opacity: appear,
      transform: `translateY(${(1 - appear) * 12}px)`,
      fontFamily: SERIF, fontStyle: "italic", fontSize: size, color,
      background: bg, padding: "6px 18px 8px", borderRadius: 8, whiteSpace: "nowrap",
    }}>{children}</div>
  );
}

// A letter or code in the clean sans, e.g. the code letters beside figures.
export function Code({ x, y, children, size = 54, color = C.ink, glow = 0, appear = 1, style }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, opacity: appear,
      fontFamily: SANS, fontWeight: 800, fontSize: size, letterSpacing: 6, color,
      textShadow: glow > 0 ? `0 0 ${18 * glow}px rgba(201,162,75,${0.9 * glow})` : "none", ...style,
    }}>{children}</div>
  );
}

// A thin ink arrow from one point to another, drawn on.
export function Arrow({ x1, y1, x2, y2, progress = 1, color = C.ink, width = 4 }) {
  if (progress <= 0) return null;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const a = Math.atan2(y2 - y1, x2 - x1);
  const k = Math.min(1, progress);
  const ex = x1 + (x2 - x1) * k, ey = y1 + (y2 - y1) * k;
  const head = 18;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      <line x1={x1} y1={y1} x2={ex} y2={ey} stroke={color} strokeWidth={width} strokeLinecap="round" />
      {k > 0.95 && len > 0 && (
        <path d={`M ${ex - head * Math.cos(a - 0.45)} ${ey - head * Math.sin(a - 0.45)} L ${ex} ${ey} L ${ex - head * Math.cos(a + 0.45)} ${ey - head * Math.sin(a + 0.45)}`}
          fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

// The title page: cloth, a gilt emblem, the title in foil and one line.
export function TitleCard({ t, title, strap, emblem = "eye", kicker }) {
  const foil = rise(t, 70, 6);
  const a = rise(t, 24, 10);
  const b = rise(t, 24, 34);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 120 }}>
      <div style={{ opacity: a, transform: `translateY(${(1 - a) * 12}px)` }}>
        <Emblem name={emblem} size={96} />
      </div>
      {kicker && (
        <div style={{ opacity: a, fontFamily: SERIF, fontStyle: "italic", fontSize: 40, color: C.giltLight, marginTop: 18 }}>{kicker}</div>
      )}
      <div style={{
        fontFamily: SERIF, fontWeight: 600, fontSize: 190, lineHeight: 1.05, marginTop: 6,
        background: `linear-gradient(100deg, ${C.giltDark} 0%, ${C.gilt} 22%, ${C.giltLight} 48%, ${C.gilt} 70%, ${C.giltDark} 100%)`,
        backgroundSize: "200% 100%", backgroundPosition: `${lerp(100, 30, foil)}% 0`,
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        opacity: a,
      }}>{title}</div>
      <div style={{
        opacity: b, transform: `translateY(${(1 - b) * 14}px)`,
        fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: "rgba(250,251,248,0.88)", marginTop: 12,
      }}>{strap}</div>
    </AbsoluteFill>
  );
}

// Line icons in gilt (a few from the app's set).
const ICONS = {
  eye: <><path d="M1.8 12S5.5 5.5 12 5.5 22.2 12 22.2 12 18.5 18.5 12 18.5 1.8 12 1.8 12Z" /><circle cx="12" cy="12" r="3.4" /></>,
  book: <><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" /><path d="M12 6.5v13" /></>,
  key: <><circle cx="7.5" cy="12" r="4" /><path d="M11.5 12H21M17.5 12v3.5M20.5 12v2.5" /></>,
  lens: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5.5 5.5" /></>,
  scales: <><path d="M12 3v18M7 21h10M4 7h16" /><path d="M4 7l-2.5 6a2.5 2.5 0 0 0 5 0L4 7ZM20 7l-2.5 6a2.5 2.5 0 0 0 5 0L20 7Z" /></>,
  swap: <><path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5" /></>,
  grid: <><rect x="3.5" y="3.5" width="17" height="17" rx="1.5" /><path d="M12 3.5v17M3.5 12h17" /></>,
  sequence: <><rect x="2" y="8" width="5" height="8" rx="1" /><rect x="9.5" y="8" width="5" height="8" rx="1" /><path d="M17 12h5M19.5 9.5 22 12l-2.5 2.5" /></>,
  twins: <><circle cx="8" cy="12" r="4.5" /><circle cx="16" cy="12" r="4.5" /></>,
  odd: <><circle cx="5" cy="12" r="2.5" /><circle cx="12" cy="12" r="2.5" /><path d="M17 9.5h5v5h-5z" /></>,
  arrow: <><path d="M3 12h15M13 6.5l5.5 5.5-5.5 5.5" /></>,
  quote: <><path d="M5 17c0-4 1-7 5-9M13 17c0-4 1-7 5-9" /></>,
  bridge: <><path d="M2 17c4-8 16-8 20 0M6 12v5M18 12v5M12 9v8" /></>,
  mask: <><path d="M3 7c3-2 6 0 9 0s6-2 9 0c0 6-3 10-9 10S3 13 3 7Z" /><circle cx="8.5" cy="10.5" r="1.3" /><circle cx="15.5" cy="10.5" r="1.3" /></>,
};
export function Emblem({ name, size = 64, color = C.gilt, strokeWidth = 1.3 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

// "Your turn" countdown: a gilt ring that empties while he thinks.
export function Countdown({ x, y, t, start, seconds = 6, size = 120 }) {
  const total = seconds * 30;
  const k = Math.max(0, Math.min(1, (t - start) / total));
  if (t < start) return null;
  const left = Math.ceil(seconds * (1 - k));
  const r = size / 2 - 6;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.ruleSoft} strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.gilt} strokeWidth={8} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={k} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: size * 0.4, color: C.ink }}>
        {left > 0 ? left : ""}
      </div>
    </div>
  );
}

// The closing recap: numbered steps (a real sequence) on paper.
export function Steps({ t, starts, steps, x = 360, y = 230, w = 1200 }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w }}>
      {steps.map((s, i) => {
        const a = rise(t, 18, starts[i] ?? 0);
        return (
          <div key={i} style={{
            display: "flex", alignItems: "baseline", gap: 32, marginBottom: 34,
            opacity: a, transform: `translateX(${(1 - a) * -20}px)`,
          }}>
            <div style={{ fontFamily: SERIF, fontSize: 64, color: C.gilt, width: 60, textAlign: "right", fontWeight: 500 }}>{i + 1}</div>
            <div style={{ fontFamily: SERIF, fontSize: 50, color: C.ink, lineHeight: 1.2 }}>{s}</div>
          </div>
        );
      })}
    </div>
  );
}
