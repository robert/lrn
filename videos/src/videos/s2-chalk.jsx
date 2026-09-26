// Series 2, film 3: "Professor Chalk's Magic Changes". A blackboard lecture.
// The eccentric Professor Chalk and his one-pupil class, Lily, learn to
// read an analogy as a spell: say the change as a rule, then cast ALL of it.
// Everything is drawn live in wobbly chalk on a green slate.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { rise, pop, window, lerp } from "../lib/anim.js";

const { fontFamily: HAND } = loadCaveat("normal", { weights: ["400", "600", "700"] });

const SLATE = "#2C4A3D";
const CHALK = "#F1EFE4";
const YELLOW = "#F3E08A";
const PINK = "#F4B3C6";
const BLUE = "#A9D8F0";
const WOOD = "#6A4528";

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- The classroom ----------

// The slate: green board, chalk-dust smudges, a wooden frame and a tray.
function Backdrop() {
  const smudges = [[380, 300, 420], [1400, 250, 380], [900, 700, 520], [1650, 780, 300], [220, 820, 300]];
  return (
    <AbsoluteFill style={{ background: WOOD }}>
      <div style={{ position: "absolute", left: 34, top: 34, right: 34, bottom: 96, background: SLATE, boxShadow: "inset 0 0 120px rgba(0,0,0,0.55)" }}>
        {smudges.map(([x, y, r], i) => (
          <div key={i} style={{ position: "absolute", left: x - r, top: y - r * 0.5, width: r * 2, height: r, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(241,239,228,0.07), transparent)", transform: `rotate(${i * 23}deg)` }} />
        ))}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.18, mixBlendMode: "screen" }}>
          <filter id="slate"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
          <rect width="100%" height="100%" filter="url(#slate)" />
        </svg>
      </div>
      {/* Wood grain on the frame, and the chalk tray with its chalk and eraser. */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 30 }, (_, i) => <line key={i} x1={0} x2={1920} y1={3 + i * 3.3 + (i > 9 ? 950 : 0)} y2={5 + i * 3.3 + (i > 9 ? 950 : 0)} stroke="rgba(0,0,0,0.12)" strokeWidth={1} />)}
        <rect x={20} y={984} width={1880} height={40} rx={6} fill="#57391F" />
        <rect x={20} y={984} width={1880} height={8} fill="#7C5431" />
        <rect x={1380} y={962} width={70} height={16} rx={7} fill={CHALK} transform="rotate(-4 1415 970)" />
        <rect x={1470} y={966} width={50} height={14} rx={6} fill={YELLOW} />
        <rect x={1540} y={964} width={40} height={14} rx={6} fill={PINK} transform="rotate(6 1560 971)" />
        <rect x={1640} y={950} width={150} height={34} rx={6} fill="#3B3A38" />
        <rect x={1640} y={970} width={150} height={14} rx={3} fill="#9C8F7A" />
      </svg>
    </AbsoluteFill>
  );
}

// The chalk filter: breaks every stroke into grainy, slightly shaky chalk.
function ChalkDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <filter id="chalk" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.6 0 0 0 -0.62" result="speck" />
        <feComposite in="SourceGraphic" in2="speck" operator="in" result="grainy" />
        <feDisplacementMap in="grainy" in2="noise" scale="2.5" />
      </filter>
    </svg>
  );
}

// Handwritten subtitles along the bottom of the board, in chalk.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{
      position: "absolute", left: 200, right: 200, bottom: 120, opacity, textAlign: "center",
      fontFamily: HAND, fontSize: 54, lineHeight: 1.1, color: CHALK, filter: "url(#chalk)",
    }}>
      {actor && <span style={{ color: actor.colour, fontWeight: 700 }}>{actor.name}: </span>}
      {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.32 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
    </div>
  );
}

// ---------- Chalk drawing ----------

// Outlines as point lists in -1..1 (y down).
function outline(kind) {
  const ring = (n, f) => Array.from({ length: n }, (_, i) => f((i / n) * Math.PI * 2));
  switch (kind) {
    case "circle": return ring(44, a => [Math.cos(a) * 0.9, Math.sin(a) * 0.9]);
    case "square": return [[-0.78, -0.78], [0.78, -0.78], [0.78, 0.78], [-0.78, 0.78]];
    case "triangle": return [[0, -0.9], [0.88, 0.72], [-0.88, 0.72]];
    case "star": return Array.from({ length: 10 }, (_, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? 0.4 : 0.95;
      return [Math.cos(a) * r, Math.sin(a) * r];
    });
    case "heart": return ring(48, a => {
      const x = 16 * Math.sin(a) ** 3, y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      return [x / 18, y / 18 + 0.05];
    });
    case "arrow": return [[-0.9, -0.24], [0.2, -0.24], [0.2, -0.6], [0.92, 0], [0.2, 0.6], [0.2, 0.24], [-0.9, 0.24]];
    // A flag has no mirror symmetry, so flipping it is not the same as turning it.
    case "flag": return [[-0.5, -0.92], [0.72, -0.56], [-0.3, -0.18], [-0.3, 0.92], [-0.5, 0.92]];
    default: throw new Error(`No chalk outline ${kind}`);
  }
}

// A shape drawn in chalk. fill: none | solid (scribbled in) | striped.
// draw 0..1 draws the outline on, then the fill goes in.
function ChalkShape({ kind, x, y, r = 80, rot = 0, flip = false, fill = "none", draw = 1, colour = CHALK, seed = 1 }) {
  const a = (rot * Math.PI) / 180;
  const pts = outline(kind).map(([u, v], i) => {
    const px = (flip ? -u : u) * r, py = v * r;
    const jx = (hash(seed * 97 + i) - 0.5) * 3, jy = (hash(seed * 31 + i) - 0.5) * 3;
    return [x + px * Math.cos(a) - py * Math.sin(a) + jx, y + px * Math.sin(a) + py * Math.cos(a) + jy];
  });
  const d = "M" + pts.map(p => p.map(n => n.toFixed(1)).join(" ")).join(" L") + " Z";
  const clip = `chalkclip-${kind}-${seed}-${Math.round(x)}-${Math.round(y)}`;
  const fillK = Math.max(0, (draw - 0.55) / 0.45);
  // Fill: a zigzag scribble (solid) or even slanting lines (striped), clipped to the shape.
  let fillLines = null;
  if (fill !== "none" && fillK > 0) {
    const gap = fill === "solid" ? 6 : 16;
    const lines = [];
    for (let k = -r * 2; k < r * 2; k += gap) lines.push(`M ${x + k - r} ${y + r * 1.1} L ${x + k + r} ${y - r * 1.1}`);
    fillLines = (
      <g clipPath={`url(#${clip})`} opacity={fill === "solid" ? 0.75 * fillK : fillK}>
        <path d={lines.join(" ")} stroke={colour} strokeWidth={fill === "solid" ? 5 : 3.5} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g filter="url(#chalk)">
      <defs><clipPath id={clip}><path d={d} /></clipPath></defs>
      {fillLines}
      <path d={d} fill="none" stroke={colour} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, draw * 1.8)} />
    </g>
  );
}

// A chalk line or arrow, drawn on.
function ChalkLine({ x1, y1, x2, y2, draw = 1, head = false, colour = CHALK, width = 5 }) {
  const k = Math.min(1, draw);
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k);
  const ang = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g filter="url(#chalk)" stroke={colour} strokeWidth={width} strokeLinecap="round" fill="none">
      <path d={`M ${x1} ${y1} Q ${(x1 + ex) / 2} ${(y1 + ey) / 2 - 6} ${ex} ${ey}`} />
      {head && k > 0.95 && <path d={`M ${ex - 22 * Math.cos(ang - 0.5)} ${ey - 22 * Math.sin(ang - 0.5)} L ${ex} ${ey} L ${ex - 22 * Math.cos(ang + 0.5)} ${ey - 22 * Math.sin(ang + 0.5)}`} />}
    </g>
  );
}

// A loop drawn round something, like circling an answer.
function ChalkLoop({ x, y, w, h, draw, colour = YELLOW }) {
  if (draw <= 0) return null;
  const rx = w / 2, ry = h / 2;
  const d = `M ${x + rx * 0.3} ${y - ry} C ${x + rx * 1.2} ${y - ry * 1.05}, ${x + rx * 1.1} ${y + ry * 1.1}, ${x} ${y + ry} C ${x - rx * 1.15} ${y + ry}, ${x - rx * 1.1} ${y - ry * 1.1}, ${x + rx * 0.45} ${y - ry * 0.92}`;
  return <path d={d} fill="none" stroke={colour} strokeWidth={6} strokeLinecap="round" filter="url(#chalk)" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, draw)} />;
}

// Handwriting that appears left to right, as if being written.
function Written({ x, y, children, at, t, dur = 30, size = 56, colour = CHALK, weight = 600, width, align = "left", style }) {
  const k = rise(t, dur, at);
  return (
    <div style={{
      position: "absolute", left: x, top: y, width, textAlign: align, fontFamily: HAND, fontWeight: weight,
      fontSize: size, color: colour, lineHeight: 1.1, filter: "url(#chalk)", whiteSpace: "nowrap",
      clipPath: `inset(-20% ${100 - k * 100}% -20% 0)`, ...style,
    }}>{children}</div>
  );
}

// A puff of chalk dust where the chalk tapped the board.
function Dust({ x, y, t, at }) {
  const e = t - at;
  if (e < 0 || e > 30) return null;
  return (
    <g>
      {Array.from({ length: 14 }, (_, i) => {
        const ang = hash(i + x) * Math.PI * 2, sp = 1 + hash(i + y) * 2.5;
        return <circle key={i} cx={x + Math.cos(ang) * sp * e} cy={y + Math.sin(ang) * sp * e - 0.2 * e} r={3 + hash(i) * 4} fill={CHALK} opacity={0.35 * (1 - e / 30)} />;
      })}
    </g>
  );
}

// An eraser sweeping across at the start of a scene, leaving a smudge.
function EraserWipe({ t }) {
  if (t > 26) return null;
  const k = rise(t, 24);
  const x = lerp(-200, 2000, k);
  return (
    <>
      <div style={{ position: "absolute", left: 34, top: 34, width: Math.max(0, x - 34), bottom: 96, background: "rgba(241,239,228,0.05)", opacity: 1 - k }} />
      <div style={{ position: "absolute", left: x - 90, top: 380, width: 180, height: 70, borderRadius: 10, background: "#3B3A38", transform: "rotate(-8deg)", boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 26, borderRadius: "0 0 10px 10px", background: "#9C8F7A" }} />
      </div>
    </>
  );
}

// Chalk doodles of the two characters, who bob when they talk.
function Doodles({ t, speaking }) {
  const bob = who => (speaking === who ? Math.sin(t / 3) * 4 : 0);
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }} filter="url(#chalk)">
      {/* Professor Chalk: spectacles, a grand moustache and a mortarboard. */}
      <g transform={`translate(150 ${150 + bob("prof")})`} stroke={YELLOW} strokeWidth={5} fill="none" strokeLinecap="round">
        <circle r="58" />
        <path d="M -70 -60 L 0 -92 L 70 -60 L 0 -34 Z" fill={YELLOW} opacity="0.35" /><path d="M 44 -58 L 58 -18" />
        <circle cx="-22" cy="-6" r="14" /><circle cx="22" cy="-6" r="14" /><path d="M -8 -6 L 8 -6" />
        <path d="M -40 22 Q -20 8 0 20 Q 20 8 40 22" strokeWidth="7" />
        <path d="M -14 38 Q 0 44 14 38" />
      </g>
      {/* Lily: bunches and a big grin. */}
      <g transform={`translate(1770 ${150 + bob("lily")})`} stroke={PINK} strokeWidth={5} fill="none" strokeLinecap="round">
        <circle r="54" />
        <path d="M -54 -20 Q -96 -30 -84 16 Q -76 0 -54 4" /><path d="M 54 -20 Q 96 -30 84 16 Q 76 0 54 4" />
        <circle cx="-18" cy="-8" r="5" fill={PINK} /><circle cx="18" cy="-8" r="5" fill={PINK} />
        <path d="M -24 16 Q 0 40 24 16" />
      </g>
    </svg>
  );
}

// ---------- The analogy board ----------
const ROW_Y = 330;
const SLOTS = { A: 330, B: 650, C: 1130, Q: 1450 };
const OPTS_Y = 640;
const OPTS_X = [520, 800, 1080, 1360];

// A is to B as C is to ?, drawn step by step.
function Analogy({ t, A, B, C, drawA = 0, drawB = 0, drawC = 0, drawQ = 0, answer, answerDraw = 0 }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <ChalkShape {...A} x={SLOTS.A} y={ROW_Y} r={95} draw={drawA} seed={1} />
      <ChalkLine x1={SLOTS.A + 120} y1={ROW_Y} x2={SLOTS.B - 120} y2={ROW_Y} draw={rise(drawB * 30, 10)} head />
      <ChalkShape {...B} x={SLOTS.B} y={ROW_Y} r={95} draw={drawB} seed={2} />
      <g opacity={drawC > 0 ? 1 : 0}>
        <circle cx={(SLOTS.B + SLOTS.C) / 2} cy={ROW_Y - 22} r={7} fill={CHALK} filter="url(#chalk)" />
        <circle cx={(SLOTS.B + SLOTS.C) / 2} cy={ROW_Y + 22} r={7} fill={CHALK} filter="url(#chalk)" />
      </g>
      <ChalkShape {...C} x={SLOTS.C} y={ROW_Y} r={95} draw={drawC} seed={3} />
      <ChalkLine x1={SLOTS.C + 120} y1={ROW_Y} x2={SLOTS.Q - 120} y2={ROW_Y} draw={rise(drawQ * 30, 10)} head />
      {answer && answerDraw > 0
        ? <ChalkShape {...answer} x={SLOTS.Q} y={ROW_Y} r={95} draw={answerDraw} seed={9} colour={YELLOW} />
        : <text x={SLOTS.Q} y={ROW_Y + 44} textAnchor="middle" fontFamily={HAND} fontSize={150} fill={CHALK} opacity={drawQ} filter="url(#chalk)">?</text>}
    </svg>
  );
}

// Answer options along the second row, lettered a to d, with crosses and loops.
function Options({ t, opts, appear, crossed = {}, chosen, chosenAt }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {opts.map((o, i) => {
        const x = OPTS_X[i];
        const d = rise(t, 26, appear + i * 12);
        const xk = crossed[i] !== undefined ? rise(t, 12, crossed[i]) : 0;
        return (
          <g key={i} opacity={xk ? 1 - 0.45 * xk : 1}>
            <ChalkShape {...o} x={x} y={OPTS_Y} r={o.r ?? 68} draw={d} seed={20 + i} />
            <text x={x} y={OPTS_Y + 130} textAnchor="middle" fontFamily={HAND} fontSize={52} fill={CHALK} opacity={d} filter="url(#chalk)">{"abcd"[i]}</text>
            {xk > 0 && <>
              <ChalkLine x1={x - 70} y1={OPTS_Y - 70} x2={x + 70} y2={OPTS_Y + 70} draw={xk * 2} colour={PINK} width={7} />
              <ChalkLine x1={x + 70} y1={OPTS_Y - 70} x2={x - 70} y2={OPTS_Y + 70} draw={Math.max(0, xk * 2 - 1)} colour={PINK} width={7} />
            </>}
          </g>
        );
      })}
      {chosen !== undefined && <ChalkLoop x={OPTS_X[chosen]} y={OPTS_Y + 20} w={200} h={230} draw={rise(t, 22, chosenAt)} />}
    </svg>
  );
}

const at = (s, i, k = 0) => s.at(i) + s.speech(i) * k;
const erase = { sfx: "chalk-eraser", at: 0, volume: 0.6 };
const scratch = when => ({ sfx: "chalk-scratch", at: when, volume: 0.5 });

// ---------- The film ----------
export default {
  id: "s2-chalk",
  order: 103,
  series: 2,
  title: "Professor Chalk's Magic Changes",
  frame: "none",
  push: 0,
  cast: {
    prof: { name: "Prof. Chalk", voice: "bm_fable", speed: 0.92, colour: YELLOW },
    lily: { name: "Lily", voice: "bf_lily", speed: 1.02, colour: PINK },
  },
  music: { src: "music/chalk.wav", volume: 0.22, duck: 0.35 },
  Backdrop,
  Subtitles,
  scenes: [
    // The title, written up on a freshly wiped board.
    {
      beats: [
        { who: "prof", say: "Ahem! Good morning, class. Or rather, good morning, Lily. You are the class.", sfxs: [erase, scratch(1.0), scratch(2.0)] },
        { who: "lily", say: "Good morning, Professor Chalk!" },
        { who: "prof", say: "Today's lesson is my very favourite. Magic changes!", sfxs: [{ sfx: "chalk-tap", at: 2.4 }] },
      ],
      render: s => (
        <AbsoluteFill>
          <ChalkDefs />
          <Doodles t={s.t} speaking={s.beat === 1 ? "lily" : "prof"} />
          <Written t={s.t} at={24} dur={50} x={0} width={1920} align="center" y={300} size={124} weight={700}>Professor Chalk's</Written>
          <Written t={s.t} at={70} dur={50} x={0} width={1920} align="center" y={440} size={170} weight={700} colour={YELLOW}>Magic Changes</Written>
          <Written t={s.t} at={at(s, 2, 0.7)} dur={24} x={0} width={1920} align="center" y={660} size={60} colour={BLUE}>(also known as analogies)</Written>
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}><Dust x={1500} y={640} t={s.t} at={at(s, 2, 0.95)} /></svg>
          <EraserWipe t={s.t} />
        </AbsoluteFill>
      ),
    },

    // What an analogy asks: a spell to spot and cast again.
    {
      beats: [
        { who: "prof", say: "Here's how it works. The first picture changes into the second one, as if by magic.", sfxs: [erase] },
        { who: "prof", say: "Your job is to spot the spell, then cast exactly the same spell on the third picture." },
        { who: "lily", say: "Like a real spell?" },
        { who: "prof", say: "Precisely like a real spell. And the secret is this. First, say the spell out loud, as a rule. Then cast the whole of it." },
      ],
      render: s => (
        <AbsoluteFill>
          <ChalkDefs />
          <Doodles t={s.t} speaking={s.beat === 2 ? "lily" : "prof"} />
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }} filter="url(#chalk)">
            {[["A", SLOTS.A], ["B", SLOTS.B], ["C", SLOTS.C], ["?", SLOTS.Q]].map(([l, x], i) => {
              const k = rise(s.t, 20, 20 + i * 18 + (i > 1 ? s.at(1) - 38 : 0));
              return (
                <g key={l} opacity={k}>
                  <rect x={x - 110} y={ROW_Y - 110} width={220} height={220} rx={14} fill="none" stroke={CHALK} strokeWidth={5} strokeDasharray="14 10" />
                  <text x={x} y={ROW_Y + 44} textAnchor="middle" fontFamily={HAND} fontSize={130} fill={i === 3 ? YELLOW : CHALK}>{l}</text>
                </g>
              );
            })}
          </svg>
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            <ChalkLine x1={SLOTS.A + 125} y1={ROW_Y} x2={SLOTS.B - 125} y2={ROW_Y} draw={rise(s.t, 16, 44)} head />
            <ChalkLine x1={SLOTS.C + 125} y1={ROW_Y} x2={SLOTS.Q - 125} y2={ROW_Y} draw={rise(s.t, 16, s.at(1) + 30)} head />
          </svg>
          <Written t={s.t} at={60} x={SLOTS.A - 60} y={ROW_Y - 200} size={46} colour={BLUE}>the spell</Written>
          <Written t={s.t} at={s.at(1) + 50} x={SLOTS.C - 30} y={ROW_Y - 200} size={46} colour={BLUE}>cast it again</Written>
          <Written t={s.t} at={at(s, 3, 0.35)} x={430} y={560} size={70}>1. Say the spell as a rule.</Written>
          <Written t={s.t} at={at(s, 3, 0.8)} x={430} y={660} size={70}>2. Cast <span style={{ color: YELLOW }}>all</span> of it.</Written>
          <EraserWipe t={s.t} />
        </AbsoluteFill>
      ),
    },

    // Example 1: one change, "colour it in".
    {
      beats: [
        { who: "prof", say: "Watch closely. This circle...", sfxs: [erase, scratch(0.6)] },
        { who: "prof", say: "becomes this circle. What's the spell, Lily?", sfxs: [scratch(0.2)] },
        { who: "lily", say: "It got coloured in!" },
        { who: "prof", say: "Splendid! The spell is: colour it in. Nothing else changed. Same shape, same size, same way up.", sfxs: [scratch(1.2)] },
        { who: "prof", say: "So now we cast it on the triangle. Colour it in, and change nothing else.", sfxs: [scratch(1.0)] },
        { who: "lily", say: "Answer a! The coloured-in triangle!", sfxs: [{ sfx: "chalk-ding", at: 1.0, volume: 0.8 }] },
        { who: "prof", say: "Bravo. And answer c? A coloured square. But our spell never changed the shape. Half marks for chalk, none for magic!", sfxs: [{ sfx: "chalk-bonk", at: 1.2, volume: 0.7 }] },
      ],
      render: s => (
        <AbsoluteFill>
          <ChalkDefs />
          <Doodles t={s.t} speaking={[2, 5].includes(s.beat) ? "lily" : "prof"} />
          <Analogy t={s.t}
            A={{ kind: "circle" }} B={{ kind: "circle", fill: "solid" }} C={{ kind: "triangle" }}
            drawA={rise(s.t, 30, 20)} drawB={rise(s.t, 36, s.at(1))} drawC={rise(s.t, 30, at(s, 4, 0.2))} drawQ={rise(s.t, 12, at(s, 4, 0.5))}
            answer={{ kind: "triangle", fill: "solid" }} answerDraw={rise(s.t, 30, at(s, 5, 0.5))} />
          <Written t={s.t} at={at(s, 3, 0.2)} x={0} width={1920} align="center" y={120} size={62} colour={YELLOW}>Spell: colour it in</Written>
          <Options t={s.t} appear={at(s, 4, 0.55)} opts={[
            { kind: "triangle", fill: "solid" }, { kind: "triangle" }, { kind: "square", fill: "solid" }, { kind: "triangle", fill: "striped" },
          ]} chosen={0} chosenAt={at(s, 5, 0.2)} crossed={{ 2: at(s, 6, 0.25) }} />
          <EraserWipe t={s.t} />
        </AbsoluteFill>
      ),
    },

    // Example 2: a two-part spell, and the half-spell trap.
    {
      beats: [
        { who: "prof", say: "Now, a trickier spell. What happened to this arrow?", sfxs: [erase, scratch(1.5)] },
        { who: "lily", say: "It turned! A quarter turn, clockwise." },
        { who: "prof", say: "Yes... and?" },
        { who: "lily", say: "Oh! It got stripes as well!" },
        { who: "prof", say: "Two changes, one spell. A quarter turn clockwise, and stripes. Now cast both on the flag.", sfxs: [scratch(1.0), scratch(2.6)] },
        { who: "prof", say: "Beware the half-spells! Answer a only did the turn. Answer b only did the stripes. Half a spell is no spell at all.", sfxs: [{ sfx: "chalk-bonk", at: 1.8, volume: 0.7 }, { sfx: "chalk-bonk", at: 3.4, volume: 0.7 }] },
        { who: "lily", say: "And answer d has stripes, but the flag's been flipped over, not turned!", sfxs: [{ sfx: "chalk-bonk", at: 2.4, volume: 0.7 }] },
        { who: "prof", say: "Mischief indeed. So it's answer c. Turned, and striped. The whole spell.", sfxs: [{ sfx: "chalk-ding", at: 1.6, volume: 0.8 }] },
      ],
      render: s => (
        <AbsoluteFill>
          <ChalkDefs />
          <Doodles t={s.t} speaking={[1, 3, 6].includes(s.beat) ? "lily" : "prof"} />
          <Analogy t={s.t}
            A={{ kind: "arrow", rot: -90 }} B={{ kind: "arrow", rot: 0, fill: "striped" }} C={{ kind: "flag" }}
            drawA={rise(s.t, 30, 20)} drawB={rise(s.t, 36, 60)} drawC={rise(s.t, 30, at(s, 4, 0.7))} drawQ={rise(s.t, 12, at(s, 4, 0.85))}
            answer={{ kind: "flag", rot: 90, fill: "striped" }} answerDraw={rise(s.t, 30, at(s, 7, 0.45))} />
          <Written t={s.t} at={at(s, 4, 0.15)} x={0} width={1920} align="center" y={120} size={62} colour={YELLOW}>
            Spell: a quarter turn <span style={{ color: CHALK }}>+</span> stripes
          </Written>
          {/* A curly arrow showing the turn, once Lily spots it. */}
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            <path d={`M ${SLOTS.A + 40} ${ROW_Y - 150} A 90 90 0 0 1 ${SLOTS.A + 130} ${ROW_Y - 60}`} fill="none" stroke={BLUE} strokeWidth={5} filter="url(#chalk)"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rise(s.t, 20, at(s, 1, 0.4))} />
          </svg>
          <Options t={s.t} appear={at(s, 5, 0.05)} opts={[
            { kind: "flag", rot: 90 }, { kind: "flag", fill: "striped" }, { kind: "flag", rot: 90, fill: "striped" }, { kind: "flag", rot: 90, flip: true, fill: "striped" },
          ]} crossed={{ 0: at(s, 5, 0.35), 1: at(s, 5, 0.6), 3: at(s, 6, 0.5) }} chosen={2} chosenAt={at(s, 7, 0.35)} />
          <EraserWipe t={s.t} />
        </AbsoluteFill>
      ),
    },

    // Your turn.
    {
      beats: [
        { who: "prof", say: "Your turn, clever clogs. What is the spell, and which answer casts all of it? Pause if you need a moment.", sfxs: [erase], hold: 6 },
        { who: "lily", say: "The heart grew bigger, and it got coloured in. Two changes!" },
        { who: "prof", say: "So the star must grow and be coloured in. That's answer b. Answer a grew but forgot the colour, and answer c was coloured but never grew. Half-spells, both!", sfxs: [{ sfx: "chalk-ding", at: 2.4, volume: 0.8 }] },
      ],
      render: s => {
        const clock = at(s, 0, 1);
        const left = Math.max(0, 6 - Math.floor((s.t - clock) / 30));
        return (
          <AbsoluteFill>
            <ChalkDefs />
            <Doodles t={s.t} speaking={s.beat === 1 ? "lily" : "prof"} />
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              <ChalkShape kind="heart" x={SLOTS.A} y={ROW_Y} r={52} draw={rise(s.t, 30, 20)} seed={1} />
              <ChalkLine x1={SLOTS.A + 120} y1={ROW_Y} x2={SLOTS.B - 120} y2={ROW_Y} draw={rise(s.t, 12, 50)} head />
              <ChalkShape kind="heart" x={SLOTS.B} y={ROW_Y} r={100} fill="solid" draw={rise(s.t, 30, 60)} seed={2} />
              <circle cx={(SLOTS.B + SLOTS.C) / 2} cy={ROW_Y - 22} r={7} fill={CHALK} filter="url(#chalk)" />
              <circle cx={(SLOTS.B + SLOTS.C) / 2} cy={ROW_Y + 22} r={7} fill={CHALK} filter="url(#chalk)" />
              <ChalkShape kind="star" x={SLOTS.C} y={ROW_Y} r={52} draw={rise(s.t, 30, 90)} seed={3} />
              <ChalkLine x1={SLOTS.C + 120} y1={ROW_Y} x2={SLOTS.Q - 120} y2={ROW_Y} draw={rise(s.t, 12, 110)} head />
              {s.t < at(s, 2, 0.4)
                ? <text x={SLOTS.Q} y={ROW_Y + 44} textAnchor="middle" fontFamily={HAND} fontSize={150} fill={CHALK} filter="url(#chalk)" opacity={rise(s.t, 10, 110)}>?</text>
                : <ChalkShape kind="star" x={SLOTS.Q} y={ROW_Y} r={100} fill="solid" draw={rise(s.t, 30, at(s, 2, 0.4))} seed={9} colour={YELLOW} />}
            </svg>
            <Options t={s.t} appear={120} opts={[
              { kind: "star", r: 84 }, { kind: "star", r: 84, fill: "solid" }, { kind: "star", r: 42, fill: "solid" }, { kind: "heart", r: 84, fill: "solid" },
            ]} chosen={s.t >= at(s, 2, 0.45) ? 1 : undefined} chosenAt={at(s, 2, 0.45)} crossed={s.t >= at(s, 2, 0.7) ? { 0: at(s, 2, 0.7) } : {}} />
            {/* Six tally marks, rubbed out one per second. */}
            {s.t >= clock && s.t < s.at(1) && (
              <Written t={s.t} at={clock} dur={1} x={0} width={1920} align="center" y={110} size={84} colour={YELLOW}>
                {"|".repeat(left).split("").join(" ") || "Time!"}
              </Written>
            )}
            <EraserWipe t={s.t} />
          </AbsoluteFill>
        );
      },
    },

    // Recap and farewell.
    {
      beats: [
        { who: "prof", say: "So. The Magic Changes method.", sfxs: [erase] },
        { who: "lily", say: "One. Say the spell out loud, as a rule.", sfxs: [scratch(0.3)] },
        { who: "lily", say: "Two. Check if there's more than one change.", sfxs: [scratch(0.3)] },
        { who: "lily", say: "Three. Cast the whole spell. No half-spells!", sfxs: [scratch(0.3)] },
        { who: "prof", say: "Top marks, Lily. Class dismissed!", sfxs: [{ sfx: "chalk-ding", at: 1.0, volume: 0.8 }] },
      ],
      tail: 1.5,
      render: s => (
        <AbsoluteFill>
          <ChalkDefs />
          <Doodles t={s.t} speaking={[1, 2, 3].includes(s.beat) ? "lily" : "prof"} />
          <Written t={s.t} at={16} x={0} width={1920} align="center" y={180} size={92} colour={YELLOW}>The Magic Changes Method</Written>
          <Written t={s.t} at={at(s, 1, 0.2)} x={460} y={360} size={72}>1. Say the spell as a rule.</Written>
          <Written t={s.t} at={at(s, 2, 0.2)} x={460} y={470} size={72}>2. More than one change?</Written>
          <Written t={s.t} at={at(s, 3, 0.2)} x={460} y={580} size={72}>3. Cast the <span style={{ color: YELLOW }}>whole</span> spell.</Written>
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            <ChalkShape kind="star" x={1540} y={700} r={60} fill="solid" colour={YELLOW} draw={rise(s.t, 30, at(s, 4, 0.5))} seed={40} />
            <Dust x={1540} y={700} t={s.t} at={at(s, 4, 0.6)} />
          </svg>
          <Written t={s.t} at={at(s, 4, 0.55)} x={1420} y={780} size={54} colour={YELLOW}>Top marks!</Written>
          <EraserWipe t={s.t} />
        </AbsoluteFill>
      ),
    },
  ],
};
