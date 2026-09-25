// A typeset book page for the reading videos: numbered paragraphs, with
// words that can be highlighted, underlined in gilt or ringed as they are
// read, plus a gilt thread in the margin that joins two paragraphs.
// Also a question card and lettered answer cards for reading questions.
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, SERIF, SANS } from "./theme.js";
import { rise, pop, lerp } from "./anim.js";
import { Seal, Emblem } from "./ui.jsx";

const TEXT = 32;
const LINE = 1.52;

// paras: [{ n, text, top }] where top is px from the page's top edge.
//   A para with gap: true draws a quiet "· · ·" row instead of text.
// marks: [{ n, phrase, k, kind: "highlight" | "underline" | "both" | "soft" }]
//   k runs 0 to 1 and sweeps the mark across the words.
// thread: { from, to, k } joins two paragraph numbers in the margin.
export function BookPage({ x, y, w, h, paras, marks = [], thread, appear = 1, dim = [] }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y + (1 - appear) * 20, width: w, height: h, opacity: appear,
      background: C.white, borderRadius: 6,
      boxShadow: `0 0 0 1.5px ${C.ruleSoft}, 0 22px 50px -30px rgba(27,42,36,0.55)`,
    }}>
      {/* the gilt margin rule, like a fine edition */}
      <div style={{ position: "absolute", left: 96, top: 30, bottom: 30, width: 1, background: C.gilt, opacity: 0.35 }} />
      {paras.map((p, i) => p.gap ? (
        <div key={i} style={{ position: "absolute", left: 120, right: 40, top: p.top, textAlign: "center", fontFamily: SERIF, fontSize: 30, color: C.faint, letterSpacing: 14 }}>
          · · ·
        </div>
      ) : (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: p.top, opacity: dim.includes(p.n) ? 0.35 : 1 }}>
          <div style={{
            position: "absolute", left: 0, width: 70, textAlign: "right", top: 6,
            fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: C.gilt,
          }}>{p.n}</div>
          <div style={{
            marginLeft: 122, marginRight: 44,
            fontFamily: SERIF, fontSize: TEXT, lineHeight: LINE, color: C.ink,
          }}>
            <MarkedText text={p.text} marks={marks.filter(m => m.n === p.n)} />
          </div>
        </div>
      ))}
      {thread && <Thread paras={paras} {...thread} />}
    </div>
  );
}

function MarkedText({ text, marks }) {
  const found = marks
    .map(m => ({ ...m, at: text.indexOf(m.phrase) }))
    .filter(m => {
      if (m.at < 0) throw new Error(`Phrase not in paragraph: "${m.phrase}"`);
      return true;
    })
    .sort((a, b) => a.at - b.at);
  const out = [];
  let pos = 0;
  found.forEach((m, i) => {
    if (m.at < pos) throw new Error(`Overlapping marks at "${m.phrase}"`);
    out.push(<span key={`t${i}`}>{text.slice(pos, m.at)}</span>);
    out.push(<span key={`m${i}`} style={markStyle(m)}>{m.phrase}</span>);
    pos = m.at + m.phrase.length;
  });
  out.push(<span key="end">{text.slice(pos)}</span>);
  return out;
}

function markStyle({ kind = "highlight", k }) {
  const base = { boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone", backgroundRepeat: "no-repeat" };
  if (kind === "underline") {
    return {
      ...base,
      backgroundImage: `linear-gradient(${C.gilt}, ${C.gilt})`,
      backgroundSize: `${k * 100}% 4px`, backgroundPosition: "0 92%",
    };
  }
  if (kind === "both") {
    return {
      ...base,
      backgroundImage: `linear-gradient(${C.gilt}, ${C.gilt}), linear-gradient(${C.highlight}, ${C.highlight})`,
      backgroundSize: `${k * 100}% 4px, ${k * 100}% 78%`, backgroundPosition: "0 92%, 0 60%",
    };
  }
  const colour = kind === "soft" ? "#F3E9DF" : C.highlight;
  return {
    ...base,
    backgroundImage: `linear-gradient(${colour}, ${colour})`,
    backgroundSize: `${k * 100}% 78%`, backgroundPosition: "0 60%",
    borderRadius: 4,
  };
}

// A gilt thread down the margin from one paragraph number to another, with a
// bead at each end.
function Thread({ paras, from, to, k }) {
  if (k <= 0) return null;
  const y1 = paras.find(p => p.n === from).top + 24;
  const y2 = paras.find(p => p.n === to).top + 24;
  // Runs straight down the gilt margin rule, clear of the numbers.
  const x = 102;
  const d = `M ${x} ${y1} L ${x} ${y2}`;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      <path d={d} fill="none" stroke={C.gilt} strokeWidth={4} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, k)} />
      <circle cx={x} cy={y1} r={7} fill={C.gilt} opacity={Math.min(1, k * 4)} />
      <circle cx={x} cy={y2} r={7} fill={C.gilt} opacity={k >= 0.98 ? 1 : 0} />
    </svg>
  );
}

// The question, on a card with a thin gilt top edge.
export function QuestionCard({ x, y, w, children, appear = 1, size = 33 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y + (1 - appear) * 16, width: w, opacity: appear,
      background: C.white, borderRadius: 10, padding: "22px 28px 24px",
      boxShadow: `0 0 0 1.5px ${C.ruleSoft}, 0 18px 40px -28px rgba(27,42,36,0.5)`,
      borderTop: `4px solid ${C.gilt}`,
    }}>
      <div style={{ fontFamily: SERIF, fontSize: size, lineHeight: 1.32, color: C.ink }}>{children}</div>
    </div>
  );
}

// Lettered answer cards stacked in a column.
// options: [{ text, word? }]; word, if given, is set bold before a colon.
// strikes: { index: startFrame }, seal: { index, at }, tags: { index: { text, tone, at } }
// glow: { index: 0..1 } warms a card's edge.
export function AnswerCards({ t, x, y, w, options, appearAt = 0, gap = 14, height = 104, strikes = {}, seal, tags = {}, glow = {}, size = 30 }) {
  return options.map((o, i) => {
    const top = y + i * (height + gap);
    const a = rise(t, 16, appearAt + i * 6);
    const struck = strikes[i] !== undefined ? rise(t, 14, strikes[i]) : 0;
    const won = seal && seal.index === i && t >= seal.at;
    const g = won ? 1 : (glow[i] ?? 0);
    const tag = tags[i];
    const tagK = tag ? pop(t, tag.at) : 0;
    return (
      <div key={i}>
        <div style={{
          position: "absolute", left: x + (1 - a) * 20, top, width: w, height,
          background: C.white, borderRadius: 10, opacity: a * (1 - struck * 0.5),
          boxShadow: `0 0 0 ${g > 0 ? 1.5 + g * 1.5 : 1.5}px ${g > 0 ? C.gilt : C.rule}, 0 10px 24px -20px rgba(27,42,36,0.5)`,
          display: "flex", alignItems: "center", gap: 22, padding: "0 30px 0 24px",
        }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 38, color: C.gilt, width: 26, flexShrink: 0 }}>{"abcd"[i]}</div>
          <div style={{ fontFamily: SERIF, fontSize: size, lineHeight: 1.28, color: C.ink }}>
            {o.word && <span style={{ fontWeight: 600 }}>{o.word}: </span>}
            {o.text}
          </div>
        </div>
        {struck > 0 && (
          <svg style={{ position: "absolute", left: x, top, overflow: "visible" }} width={w} height={height}>
            <line x1={70} y1={height / 2 + 2} x2={70 + (w - 110) * Math.min(1, struck)} y2={height / 2 + 2}
              stroke={C.mud} strokeWidth={4} strokeLinecap="round" opacity={0.7} />
          </svg>
        )}
        {tag && tagK > 0 && (
          <div style={{
            position: "absolute", left: x + w - 24, top: top - 26,
            transform: `translateX(-100%) scale(${lerp(0.7, 1, tagK)})`, transformOrigin: "right center", opacity: Math.min(1, tagK * 1.4),
            background: tag.tone === "good" ? "#E3F0E8" : "#F3E9DF", color: tag.tone === "good" ? C.green : C.mud,
            fontFamily: SERIF, fontStyle: "italic", fontSize: 26, padding: "2px 16px 5px", boxShadow: "0 0 0 3px #FAFBF8", borderRadius: 8, whiteSpace: "nowrap",
          }}>{tag.text}</div>
        )}
        {seal && seal.index === i && <Seal x={x + w - 8} y={top + height / 2} size={70} t={t} start={seal.at} />}
      </div>
    );
  });
}

// A title card for longer titles: same as TitleCard, with the size adjustable.
export function BookTitle({ t, title, strap, emblem = "book", kicker, size = 150 }) {
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
        fontFamily: SERIF, fontWeight: 600, fontSize: size, lineHeight: 1.08, marginTop: 10, textAlign: "center",
        background: `linear-gradient(100deg, ${C.giltDark} 0%, ${C.gilt} 22%, ${C.giltLight} 48%, ${C.gilt} 70%, ${C.giltDark} 100%)`,
        backgroundSize: "200% 100%", backgroundPosition: `${lerp(100, 30, foil)}% 0`,
        WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
        opacity: a, padding: "0 40px",
      }}>{title}</div>
      <div style={{
        opacity: b, transform: `translateY(${(1 - b) * 14}px)`,
        fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: "rgba(250,251,248,0.88)", marginTop: 16,
      }}>{strap}</div>
    </AbsoluteFill>
  );
}
