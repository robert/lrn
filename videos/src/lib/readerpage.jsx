// Pieces for the "What do the words mean?" and "Find the evidence" videos:
// a typeset book page with numbered paragraphs, a highlighter that sweeps
// across words, the question card and the answer cards.
// Everything is a pure function of the scene frame `t`.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, SERIF, SANS } from "./theme.js";
import { rise, pop, lerp } from "./anim.js";
import { Emblem } from "./ui.jsx";

// Split `text` into plain runs and marked runs. Each mark is
// { text, kind: "highlight" | "underline", at, until? } and must appear in
// the text, in order. Marks sweep in over ~22 frames from their `at` frame.
function marked(text, marks, t) {
  const out = [];
  let rest = text;
  let key = 0;
  for (const m of marks) {
    const i = rest.indexOf(m.text);
    if (i === -1) throw new Error(`Mark "${m.text}" not found in paragraph (or out of order)`);
    if (i > 0) out.push(<span key={key++}>{rest.slice(0, i)}</span>);
    const k = rise(t, m.dur ?? 22, m.at);
    const fade = m.until !== undefined ? 1 - rise(t, 12, m.until) : 1;
    const p = k * fade;
    const style = m.kind === "underline"
      ? {
        backgroundImage: `linear-gradient(90deg, ${C.gilt}, ${C.gilt})`,
        backgroundRepeat: "no-repeat", backgroundPosition: "0 94%",
        backgroundSize: `${p * 100}% 4px`,
      }
      : {
        backgroundImage: `linear-gradient(90deg, ${C.highlight}, ${C.highlight})`,
        backgroundRepeat: "no-repeat", backgroundPosition: "0 60%",
        backgroundSize: `${p * 100}% 80%`, borderRadius: 4,
      };
    out.push(<span key={key++} style={{ ...style, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{m.text}</span>);
    rest = rest.slice(i + m.text.length);
  }
  if (rest) out.push(<span key={key++}>{rest}</span>);
  return out;
}

// A page from the book: numbered paragraphs in Fraunces with generous leading.
// paras: [{ n, text, marks?, dim?, focus?, ellipsisBefore?, ellipsisAfter? }].
// focus (0..1) lights a gilt bar in the margin, like a finger on the page.
export function StoryPage({ x, y, w = 920, paras, t, appear = 1, size = 32 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y + (1 - appear) * 20, width: w, opacity: appear,
      background: C.white, borderRadius: 8, padding: "34px 44px 32px 92px",
      boxShadow: `0 0 0 1.5px ${C.ruleSoft}, 0 22px 50px -30px rgba(27,42,36,0.55)`,
    }}>
      <div style={{ position: "absolute", left: 68, top: 28, bottom: 28, width: 1, background: C.gilt, opacity: 0.35 }} />
      {paras.map((p, i) => (
        <div key={i} style={{ position: "relative", marginTop: i ? 22 : 0, opacity: 1 - (p.dim ?? 0) * 0.62 }}>
          <div style={{
            position: "absolute", left: -84, top: size * 0.18, width: 50, textAlign: "right",
            fontFamily: SERIF, fontStyle: "italic", fontSize: size * 0.78, color: (p.focus ?? 0) > 0.5 ? C.giltDark : C.gilt,
          }}>{p.n}</div>
          <div style={{
            position: "absolute", left: -27, top: 6, bottom: 6, width: 5, borderRadius: 3,
            background: C.gilt, opacity: p.focus ?? 0,
          }} />
          <div style={{ fontFamily: SERIF, fontSize: size, lineHeight: 1.55, color: C.ink }}>
            {p.ellipsisBefore && <span style={{ color: C.faint }}>… </span>}
            {marked(p.text, p.marks ?? [], t)}
            {p.ellipsisAfter && <span style={{ color: C.faint }}> …</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// The question, as in the game: words wrapped in *asterisks* are the quote,
// set in italic brown.
export function AskCard({ x, y, w = 680, text, appear = 1, size = 36 }) {
  const parts = text.split(/\*([^*]+)\*/);
  return (
    <div style={{
      position: "absolute", left: x, top: y + (1 - appear) * 16, width: w, opacity: appear,
      background: C.white, borderRadius: 10, padding: "24px 30px 26px",
      borderTop: `4px solid ${C.gilt}`,
      boxShadow: `0 0 0 1.5px ${C.ruleSoft}, 0 18px 40px -26px rgba(27,42,36,0.5)`,
      fontFamily: SERIF, fontSize: size, lineHeight: 1.3, color: C.ink,
    }}>
      {parts.map((p, i) => i % 2
        ? <em key={i} style={{ color: C.mud, fontStyle: "italic" }}>{p}</em>
        : <span key={i}>{p}</span>)}
    </div>
  );
}

// Four answer cards stacked down the page, lettered a to d.
// strikes: { index: frame } draws a soft line through a wrong one;
// dims: { index: frame } just greys one out (e.g. a fragment).
export function Choices({ x, y, w = 680, options, t, appearAt = 0, correct, sealAt = Infinity, strikes = {}, dims = {}, size = 28, gap = 14 }) {
  let top = y;
  return options.map((o, i) => {
    const a = rise(t, 16, appearAt + i * 6);
    const struck = strikes[i] !== undefined ? rise(t, 16, strikes[i]) : 0;
    const dimmed = dims[i] !== undefined ? rise(t, 16, dims[i]) : 0;
    const fade = Math.max(struck, dimmed);
    const win = i === correct && t >= sealAt;
    const h = o.length > 40 ? 102 : 70;
    const cardTop = top;
    top += h + gap;
    return (
      <div key={i} style={{ position: "absolute", left: x, top: cardTop + (1 - a) * 14, width: w, height: h, opacity: a }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: 10, background: win ? "#FFFCF0" : C.white,
          boxShadow: `0 0 0 ${win ? 3 : 1.5}px ${win ? C.gilt : C.rule}, 0 10px 24px -20px rgba(27,42,36,0.5)`,
          opacity: 1 - fade * 0.45,
        }} />
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 62, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: SERIF, fontStyle: "italic", fontSize: 36, color: C.gilt, opacity: 1 - fade * 0.5,
        }}>{"abcd"[i]}</div>
        <div style={{
          position: "absolute", left: 62, right: 34, top: 0, bottom: 0, display: "flex", alignItems: "center",
          fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 1.25, color: C.ink,
          opacity: 1 - fade * 0.55,
        }}>{o}</div>
        {struck > 0 && (
          <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={w} height={h}>
            <line x1={56} y1={h / 2 + 2} x2={56 + (w - 90) * struck} y2={h / 2 - 1} stroke={C.mud} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
          </svg>
        )}
        {i === correct && <StampAt x={w - 6} y={6} t={t} start={sealAt} />}
      </div>
    );
  });
}

function StampAt({ x, y, t, start, size = 62 }) {
  const k = pop(t, start);
  if (k <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%",
      transform: `scale(${lerp(1.6, 1, k)}) rotate(${lerp(-25, 0, k)}deg)`, opacity: Math.min(1, k * 1.5),
      background: `radial-gradient(circle at 35% 30%, ${C.giltLight}, ${C.gilt} 55%, ${C.giltDark})`,
      boxShadow: "0 6px 18px rgba(0,0,0,0.35), inset 0 0 0 3px rgba(255,255,255,0.22)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
        <path d="m4.5 12.5 4.8 4.8L19.5 7" fill="none" stroke={C.clothDeep} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// Clue-word tags, like words jotted on a detective's notepad.
export function ClueWords({ x, y, words, starts, t, label = "Clue words", appear = 1 }) {
  const a = rise(t, 16, starts[0] - 6) * appear;
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: a, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", maxWidth: 700 }}>
      <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 32, color: C.soft, marginRight: 4 }}>{label}</span>
      {words.map((w, i) => {
        const k = pop(t, starts[i] ?? starts[0]);
        return (
          <span key={w} style={{
            opacity: Math.min(1, k * 1.4), transform: `scale(${0.8 + 0.2 * k})`,
            fontFamily: SERIF, fontStyle: "italic", fontSize: 32, color: C.ink,
            background: C.highlight, padding: "4px 18px 6px", borderRadius: 99,
          }}>{w}</span>
        );
      })}
    </div>
  );
}

// A title card whose title can be long: set smaller, on up to two lines.
export function LongTitleCard({ t, title, strap, kicker, emblem = "book", size = 128 }) {
  const foil = rise(t, 70, 6);
  const a = rise(t, 24, 10);
  const b = rise(t, 24, 34);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 120 }}>
      <div style={{ opacity: a, transform: `translateY(${(1 - a) * 12}px)` }}>
        <Emblem name={emblem} size={92} />
      </div>
      {kicker && (
        <div style={{ opacity: a, fontFamily: SERIF, fontStyle: "italic", fontSize: 40, color: C.giltLight, marginTop: 18 }}>{kicker}</div>
      )}
      <div style={{
        fontFamily: SERIF, fontWeight: 600, fontSize: size, lineHeight: 1.06, marginTop: 10, textAlign: "center", maxWidth: 1500,
        background: `linear-gradient(100deg, ${C.giltDark} 0%, ${C.gilt} 22%, ${C.giltLight} 48%, ${C.gilt} 70%, ${C.giltDark} 100%)`,
        backgroundSize: "200% 100%", backgroundPosition: `${lerp(100, 30, foil)}% 0`,
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", opacity: a,
      }}>{title}</div>
      <div style={{
        opacity: b, transform: `translateY(${(1 - b) * 14}px)`,
        fontFamily: SERIF, fontStyle: "italic", fontSize: 48, color: "rgba(250,251,248,0.88)", marginTop: 18,
      }}>{strap}</div>
    </AbsoluteFill>
  );
}
