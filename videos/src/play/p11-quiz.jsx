// Series 11, play-along film 1: "Nothing Gets Past: The Big Quiz". A glossy
// Saturday-night TV quiz show. Seven rounds of mixed reasoning questions; the
// viewer taps one of four answer panels. Clever Trevor, the rival, sometimes
// blurts a wrong answer that has to be beaten. Right answers bring lights,
// confetti and points; a slip gets a kind "Ooh, so close!" and a reason.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { rise, pop, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";

const { fontFamily: BEBAS } = loadBebas("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: ROUND } = loadFredoka("normal", { weights: ["500", "600"], subsets: ["latin"] });

const Q = { night: "#120B2E", deep: "#0A0620", pink: "#FF3E9A", cyan: "#2EE6FF", gold: "#FFC83D", white: "#FFFFFF", ink: "#1B1330" };
const hash = n => { const x = Math.sin(n * 63.7 + 11.9) * 43758.5453; return x - Math.floor(x); };

// ---------- The studio ----------

// Sweeping light beams from the rig. `party` makes them wild (a right answer).
function Beams({ t, party = 0 }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
      <defs>
        {[Q.pink, Q.cyan, Q.gold].map((c, i) => (
          <linearGradient key={i} id={`beam${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c} stopOpacity={0.55} />
            <stop offset="1" stopColor={c} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      {Array.from({ length: 6 }, (_, i) => {
        const x = 160 + i * 320;
        const speed = 40 - party * 25;
        const a = Math.sin(t / speed + i * 1.7) * (28 + party * 25);
        return <path key={i} d={`M ${x} -20 L ${x - 130} 1080 L ${x + 130} 1080 Z`} fill={`url(#beam${i % 3})`} transform={`rotate(${a} ${x} -20)`} opacity={0.35 + party * 0.4} />;
      })}
      {/* The lamps on the rig. */}
      {Array.from({ length: 6 }, (_, i) => <circle key={`l${i}`} cx={160 + i * 320} cy={8} r={16} fill={[Q.pink, Q.cyan, Q.gold][i % 3]} />)}
    </svg>
  );
}

// The audience: rows of silhouettes along the front, cheering on cue.
function Audience({ t, cheer = 0 }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 34 }, (_, i) => {
        const x = i * 58 + (hash(i) - 0.5) * 20;
        const hop = cheer * Math.abs(Math.sin(t / 3 + i)) * 26;
        const arms = cheer > 0.3 && hash(i + 9) > 0.35;
        const y = 1000 - hop + (i % 2) * 18;
        return (
          <g key={i} fill="#05030F">
            <circle cx={x} cy={y - 58} r={22} />
            <path d={`M ${x - 34} ${y + 60} Q ${x - 34} ${y - 30} ${x} ${y - 30} Q ${x + 34} ${y - 30} ${x + 34} ${y + 60} Z`} />
            {arms && <path d={`M ${x - 24} ${y - 20} L ${x - 38} ${y - 95} M ${x + 24} ${y - 20} L ${x + 38} ${y - 95}`} stroke="#05030F" strokeWidth={12} strokeLinecap="round" />}
          </g>
        );
      })}
    </svg>
  );
}

// The host: a sparkly jacket, a big grin and a microphone.
function Host({ t, x = 240, y = 430, talking = false, scale = 0.8 }) {
  const bob = Math.sin(t / 10) * 4;
  const mouth = talking ? 6 + Math.abs(Math.sin(t / 2.6)) * 12 : 6;
  return (
    <svg width="300" height="460" viewBox="-150 -300 300 460" style={{ position: "absolute", left: x - 150 * scale, top: y - 300 * scale + bob, width: 300 * scale, height: 460 * scale, overflow: "visible" }}>
      <path d="M-110 160 L -95 -40 Q 0 -90 95 -40 L 110 160 Z" fill={Q.pink} />
      {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={-90 + hash(i) * 180} cy={-40 + hash(i + 5) * 190} r={3} fill={Q.white} opacity={0.4 + 0.6 * Math.abs(Math.sin(t / 6 + i))} />)}
      <path d="M-24 -60 L 0 20 L 24 -60 Z" fill={Q.white} />
      <path d="M-12 -52 L 0 -36 L 12 -52 Z" fill={Q.gold} />
      <circle cx="0" cy="-140" r="68" fill="#F2C29B" />
      <path d="M-70 -150 Q -60 -230 0 -222 Q 70 -228 72 -150 Q 40 -190 -70 -150 Z" fill="#3A2213" />
      <circle cx="-24" cy="-146" r="8" fill={Q.ink} />
      <circle cx="24" cy="-146" r="8" fill={Q.ink} />
      <path d={`M -30 -108 Q 0 ${-108 + mouth * 2} 30 -108 Z`} fill="#7A1F2E" />
      {/* Microphone. */}
      <rect x="62" y="-70" width="16" height="70" rx="6" fill="#222" transform="rotate(-20 70 -40)" />
      <circle cx="56" cy="-96" r="18" fill="#555" />
    </svg>
  );
}

// Clever Trevor: glasses, a quiff and a smug grin, at his podium.
function Trevor({ t, x, y, talking = false, sulk = false }) {
  const mouth = talking ? 4 + Math.abs(Math.sin(t / 2.2)) * 9 : 3;
  return (
    <svg width="160" height="200" viewBox="-80 -140 160 200" style={{ position: "absolute", left: x - 80, top: y - 140, overflow: "visible" }}>
      <path d="M-58 60 L -48 -10 Q 0 -30 48 -10 L 58 60 Z" fill="#3A7BD5" />
      <circle cx="0" cy="-62" r="44" fill="#F4CFA8" />
      <path d="M-44 -70 Q -40 -128 12 -122 Q 44 -140 40 -84 Q 20 -104 -44 -70 Z" fill="#C0762B" />
      <circle cx="-16" cy="-64" r="12" fill="none" stroke={Q.ink} strokeWidth="4" />
      <circle cx="16" cy="-64" r="12" fill="none" stroke={Q.ink} strokeWidth="4" />
      <line x1="-4" y1="-64" x2="4" y2="-64" stroke={Q.ink} strokeWidth="4" />
      <circle cx="-16" cy="-64" r="3" fill={Q.ink} /><circle cx="16" cy="-64" r="3" fill={Q.ink} />
      <path d={sulk ? "M -14 -30 Q 0 -40 14 -30" : `M -16 -36 Q 0 ${-36 + mouth} 16 -36`} stroke={Q.ink} strokeWidth="4" fill={talking ? "#7A1F2E" : "none"} />
    </svg>
  );
}

// The scoreboard: YOU against TREVOR, with a round counter.
function Scoreboard({ t, you, trevor, round, trevorTalking, trevorSulk }) {
  return (
    <div style={{ position: "absolute", left: 1510, top: 130, width: 340, height: 420, borderRadius: 26, background: "linear-gradient(#24164F, #140B33)", boxShadow: `0 0 0 4px ${Q.cyan}, 0 0 40px rgba(46,230,255,0.4)` }}>
      <div style={{ textAlign: "center", fontFamily: BEBAS, fontSize: 40, color: Q.gold, marginTop: 14, letterSpacing: 2 }}>{round}</div>
      {[["YOU", you, Q.pink], ["TREVOR", trevor, Q.cyan]].map(([name, score, c], i) => (
        <div key={name} style={{ margin: "16px 26px", padding: "8px 18px", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: `3px solid ${c}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: BEBAS, fontSize: 44, color: Q.white, letterSpacing: 1 }}>{name}</span>
          <span style={{ fontFamily: BEBAS, fontSize: 64, color: c }}>{Math.round(score)}</span>
        </div>
      ))}
      <Trevor t={t} x={170} y={400} talking={trevorTalking} sulk={trevorSulk} />
    </div>
  );
}

// The big video wall in the middle, where each question appears.
const WALL = { x: 460, y: 130, w: 1000, h: 400 };
function Wall({ title, children, glow = 0 }) {
  return (
    <div style={{ position: "absolute", left: WALL.x, top: WALL.y, width: WALL.w, height: WALL.h, borderRadius: 24, overflow: "hidden", background: "linear-gradient(#1D1450, #0E0830)", boxShadow: `0 0 0 5px ${glow > 0 ? Q.gold : Q.pink}, 0 0 ${40 + glow * 60}px ${glow > 0 ? "rgba(255,200,61,0.7)" : "rgba(255,62,154,0.45)"}` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 10, textAlign: "center", fontFamily: BEBAS, fontSize: 48, color: Q.gold, letterSpacing: 2 }}>{title}</div>
      <svg width={WALL.w} height={WALL.h} style={{ position: "absolute", inset: 0 }}>{children}</svg>
    </div>
  );
}

// Four answer panels, A to D. `win` lights one gold; `blurt` tags Trevor's.
const PANEL = { y: 590, w: 350, h: 200, xs: [185, 565, 945, 1325] };
function Panels({ t, at = 0, answers, win = -1, blurt = -1, struck = [] }) {
  return answers.map((a, i) => {
    const k = pop(t, at + i * 5);
    const lit = i === win;
    return (
      <div key={i} style={{
        position: "absolute", left: PANEL.xs[i], top: PANEL.y, width: PANEL.w, height: PANEL.h, borderRadius: 20,
        background: lit ? `linear-gradient(${Q.gold}, #FF9E1B)` : "linear-gradient(#2A1B63, #170E3D)",
        boxShadow: lit ? `0 0 0 4px ${Q.white}, 0 0 50px ${Q.gold}` : `0 0 0 3px ${i === blurt ? Q.cyan : "rgba(255,255,255,0.35)"}`,
        opacity: Math.min(1, k * 2) * (struck.includes(i) ? 0.35 : 1), transform: `scale(${lerp(0.7, 1, Math.min(1, k))})`,
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", left: 14, top: 8, fontFamily: BEBAS, fontSize: 46, color: lit ? Q.ink : Q.pink }}>{"ABCD"[i]}</div>
        {i === blurt && <div style={{ position: "absolute", right: 10, top: 10, fontFamily: BEBAS, fontSize: 28, background: Q.cyan, color: Q.ink, padding: "0 10px", borderRadius: 8 }}>TREVOR SAID</div>}
        {a.text && <div style={{ position: "absolute", inset: "54px 16px 12px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: ROUND, fontWeight: 600, fontSize: a.size ?? 40, lineHeight: 1.1, color: lit ? Q.ink : Q.white }}>{a.text}</div>}
        {a.shapes && (
          <svg width={PANEL.w} height={PANEL.h} style={{ position: "absolute", inset: 0 }}>
            <rect x={70} y={22} width={PANEL.w - 140} height={PANEL.h - 40} rx={14} fill="#FFFFFF" />
            {a.shapes.map((sh, j) => <Shape key={j} {...sh} x={PANEL.w / 2 + (sh.dx ?? 0)} y={PANEL.h / 2 + 2 + (sh.dy ?? 0)} />)}
          </svg>
        )}
      </div>
    );
  });
}
const panelSpots = (correct, slips) => PANEL.xs.map((x, i) => ({
  id: `p${i}`, x, y: PANEL.y, w: PANEL.w, h: PANEL.h, correct: i === correct,
  slip: i === correct ? undefined : slips[i],
}));

// Confetti for right answers.
function Confetti({ t, at }) {
  const e = t - at;
  if (e < 0) return null;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 90 }, (_, i) => {
        const x = hash(i) * 1920 + Math.sin(e / 8 + i) * 30;
        const y = -40 + e * (6 + hash(i + 3) * 7) - hash(i + 7) * 300;
        return <rect key={i} x={x} y={y} width={14} height={8} fill={[Q.pink, Q.cyan, Q.gold, Q.white][i % 4]} transform={`rotate(${e * 9 + i * 40} ${x} ${y})`} />;
      })}
    </svg>
  );
}

// Subtitles as a glowing lower-third strip.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ maxWidth: 1500, padding: "10px 30px 14px", background: "rgba(10,6,32,0.88)", borderRadius: 16, boxShadow: `0 0 0 3px ${actor?.colour ?? Q.pink}`, fontFamily: ROUND, fontWeight: 500, fontSize: 40, lineHeight: 1.2, color: Q.white, textAlign: "center" }}>
        {actor?.name && <span style={{ fontFamily: BEBAS, fontSize: 40, color: actor.colour, marginRight: 14, letterSpacing: 1 }}>{actor.name}</span>}
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.35 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// The whole studio around a question: beams, wall, panels, host, scores.
function Studio({ s, beats, round, you, youTo, trevor, wall, answers, win = -1, blurt = -1, party = 0, cheerAt = null, struck = [], still = false }) {
  const b = beats?.[s.beat];
  const talking = b ? s.t - s.at(s.beat) < s.speech(s.beat) : false;
  const cheer = cheerAt !== null ? Math.max(0, 1 - Math.abs(s.t - cheerAt - 40) / 60) : 0;
  const score = youTo !== undefined ? lerp(you, youTo, rise(s.t, 40, (cheerAt ?? 0) + 10)) : you;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 20%, #3B1F7A, ${Q.night} 55%, ${Q.deep})` }}>
      <Beams t={s.t} party={party} />
      {wall}
      {answers && <Panels t={still ? 999 : s.t} at={still ? 0 : 20} answers={answers} win={win} blurt={blurt} struck={struck} />}
      <Host t={s.t} talking={talking && b?.who === "host"} />
      <Scoreboard t={s.t} you={score} trevor={trevor} round={round} trevorTalking={talking && b?.who === "trevor"} trevorSulk={win >= 0} />
      <Audience t={s.t} cheer={cheer} />
      {cheerAt !== null && <Confetti t={s.t} at={cheerAt} />}
    </AbsoluteFill>
  );
}

// ---------- The questions ----------

// Round 1: odd one out. Three hexagons (turned and shaded differently), one pentagon.
const R1 = [
  { shapes: [{ kind: "hexagon", r: 52, fill: "grey" }] },
  { shapes: [{ kind: "hexagon", r: 52, fill: "white", rot: 20 }] },
  { shapes: [{ kind: "pentagon", r: 54, fill: "grey" }] },
  { shapes: [{ kind: "hexagon", r: 52, fill: "black", rot: -10 }] },
];
// Round 2: codes. First letter = shape, second letter = shading.
function CodeWall() {
  const items = [["circle", "black", "MX"], ["circle", "white", "MY"], ["triangle", "black", "NX"]];
  return <>
    {items.map(([k, f, code], i) => (
      <g key={i}>
        <rect x={60 + i * 230} y={110} width={180} height={180} rx={16} fill="#FFFFFF" />
        <Shape kind={k} r={60} fill={f} x={150 + i * 230} y={200} />
        <text x={150 + i * 230} y={345} textAnchor="middle" fontFamily={BEBAS} fontSize={60} fill={Q.white}>{code}</text>
      </g>
    ))}
    <rect x={780} y={110} width={180} height={180} rx={16} fill="#FFFFFF" stroke={Q.gold} strokeWidth={6} />
    <Shape kind="triangle" r={60} fill="white" x={870} y={200} />
    <text x={870} y={345} textAnchor="middle" fontFamily={BEBAS} fontSize={60} fill={Q.gold}>??</text>
  </>;
}
const R2 = [{ text: "MY", size: 72 }, { text: "NY", size: 72 }, { text: "YN", size: 72 }, { text: "NX", size: 72 }];
// Round 3: a grid. Across: it gets bigger. Down: the shape changes.
function GridWall({ solved = false }) {
  const cell = (x, y, content) => <g><rect x={x} y={y} width={140} height={140} fill="#FFFFFF" stroke={Q.ink} strokeWidth={3} />{content}</g>;
  return <>
    {cell(360, 80, <Shape kind="circle" r={28} fill="black" x={430} y={150} />)}
    {cell(500, 80, <Shape kind="circle" r={56} fill="black" x={570} y={150} />)}
    {cell(360, 220, <Shape kind="square" r={28} fill="black" x={430} y={290} />)}
    {cell(500, 220, solved ? <Shape kind="square" r={56} fill="black" x={570} y={290} /> : <text x={570} y={315} textAnchor="middle" fontFamily={BEBAS} fontSize={80} fill={Q.pink}>?</text>)}
  </>;
}
const R3 = [
  { shapes: [{ kind: "square", r: 30, fill: "black" }] },
  { shapes: [{ kind: "circle", r: 56, fill: "black" }] },
  { shapes: [{ kind: "square", r: 58, fill: "black" }] },
  { shapes: [{ kind: "triangle", r: 58, fill: "black" }] },
];
// Round 4: swapped words.
function SentenceWall({ fixed = false }) {
  const words = fixed ? ["The", "grandma", "baked", "the", "cake", "in", "a", "hot", "oven."] : ["The", "cake", "baked", "the", "grandma", "in", "a", "hot", "oven."];
  let x = 70;
  return <>{words.map((w, i) => {
    const width = w.length * 19 + 22;
    const swap = !fixed && (i === 1 || i === 4);
    const el = <g key={i}><rect x={x} y={150} width={width} height={90} rx={12} fill={swap ? "rgba(255,62,154,0.25)" : "rgba(255,255,255,0.08)"} /><text x={x + width / 2} y={210} textAnchor="middle" fontFamily={ROUND} fontWeight={600} fontSize={36} fill={Q.white}>{w}</text></g>;
    x += width + 8;
    return el;
  })}</>;
}
const R4 = [{ text: "baked and oven" }, { text: "hot and oven" }, { text: "The and in" }, { text: "cake and grandma" }];
// Round 5: an analogy. Small white triangle -> big white triangle; small black heart -> ?
function AnalogyWall() {
  return <>
    <rect x={80} y={100} width={170} height={170} rx={14} fill="#FFF" /><Shape kind="triangle" r={34} fill="white" x={165} y={190} />
    <text x={290} y={205} fontFamily={ROUND} fontSize={70} fill={Q.gold}>→</text>
    <rect x={350} y={100} width={170} height={170} rx={14} fill="#FFF" /><Shape kind="triangle" r={66} fill="white" x={435} y={195} />
    <text x={555} y={205} fontFamily={BEBAS} fontSize={70} fill={Q.white}>:</text>
    <rect x={600} y={100} width={170} height={170} rx={14} fill="#FFF" /><Shape kind="heart" r={34} fill="black" x={685} y={190} />
    <text x={805} y={205} fontFamily={ROUND} fontSize={70} fill={Q.gold}>→</text>
    <text x={900} y={215} fontFamily={BEBAS} fontSize={90} fill={Q.pink}>?</text>
  </>;
}
const R5 = [
  { shapes: [{ kind: "heart", r: 34, fill: "black" }] },
  { shapes: [{ kind: "heart", r: 62, fill: "white" }] },
  { shapes: [{ kind: "triangle", r: 62, fill: "black" }] },
  { shapes: [{ kind: "heart", r: 62, fill: "black" }] },
];
// Round 6: balancing. 2 apples = 1 pear; 2 pears = 1 melon; apples in a melon?
function ScalesWall() {
  const fruit = (x, y, c, r = 26) => <circle cx={x} cy={y} r={r} fill={c} stroke={Q.ink} strokeWidth={3} />;
  const row = (y, left, right) => <g>
    <line x1={120} y1={y} x2={880} y2={y} stroke={Q.gold} strokeWidth={6} />
    <polygon points={`500,${y} 480,${y + 40} 520,${y + 40}`} fill={Q.gold} />
    {left}{right}
    <text x={500} y={y - 30} textAnchor="middle" fontFamily={BEBAS} fontSize={50} fill={Q.white}>=</text>
  </g>;
  return <>
    {row(170, <>{fruit(240, 138, "#E23B3B")}{fruit(300, 138, "#E23B3B")}</>, fruit(700, 132, "#9BC53D", 34))}
    {row(320, <>{fruit(240, 282, "#9BC53D", 34)}{fruit(320, 282, "#9BC53D", 34)}</>, fruit(700, 272, "#3BB273", 50))}
  </>;
}
const R6 = [{ text: "2 apples", size: 52 }, { text: "3 apples", size: 52 }, { text: "4 apples", size: 52 }, { text: "8 apples", size: 52 }];
// Round 7, the jackpot: which flag is flipped? Three are only turned.
const R7 = [
  { shapes: [{ kind: "flag", r: 62, fill: "white", rot: 90 }] },
  { shapes: [{ kind: "flag", r: 62, fill: "white", rot: 180 }] },
  { shapes: [{ kind: "flag", r: 62, fill: "white", flip: true, rot: 30 }] },
  { shapes: [{ kind: "flag", r: 62, fill: "white", rot: -90 }] },
];
function FlagWall() {
  return <>
    <rect x={400} y={80} width={200} height={260} rx={16} fill="#FFF" />
    <Shape kind="flag" r={90} fill="white" x={500} y={210} />
    <text x={500} y={375} textAnchor="middle" fontFamily={ROUND} fontSize={30} fill={Q.white}>the original flag</text>
  </>;
}

// ---------- Scene helpers ----------
// A question scene (waits for a tap), its slips and its win, as a round.
function round({ n, name, wall, winWall, answers, correct, slips, ask, blurt = -1, win, after, you, trevor = 300, struck }) {
  const R = `Round ${n}`;
  return [
    {
      id: `r${n}`,
      choice: { prompt: "Tap your answer", next: `r${n}-win`, options: panelSpots(correct, slips.map(sl => sl && `r${n}-${sl.id}`)) },
      beats: ask,
      render: s => <Studio s={s} beats={ask} round={R} you={you} trevor={trevor} wall={<Wall title={name}>{wall}</Wall>} answers={answers} blurt={blurt} struck={struck} />,
    },
    ...slips.filter(Boolean).filter((sl, i, a) => a.findIndex(x => x.id === sl.id) === i).map(sl => ({
      id: `r${n}-${sl.id}`,
      returnTo: `r${n}`,
      beats: sl.beats,
      render: s => <Studio s={s} beats={sl.beats} round={R} you={you} trevor={trevor} wall={<Wall title={name}>{wall}</Wall>} answers={answers} blurt={blurt} still />,
    })),
    {
      id: `r${n}-win`,
      next: after,
      beats: win,
      render: s => <Studio s={s} beats={win} round={R} you={you} youTo={you + 100} trevor={trevor} wall={<Wall title={name} glow={1}>{winWall ?? wall}</Wall>} answers={answers} win={correct} party={1} cheerAt={4} still />,
    },
  ];
}

const DING = [{ sfx: "quiz-ding", at: 0 }, { sfx: "quiz-applause", at: 0.3, volume: 0.6 }];

export default {
  id: "p11-quiz",
  order: 1001,
  series: 11,
  title: "Nothing Gets Past: The Big Quiz",
  genre: "TV quiz show",
  strap: "Seven rounds against Clever Trevor. Tap your answers and win the trophy.",
  music: "music/quiz.wav",
  musicVolume: 0.12,
  cast: {
    host: { name: "HOST", voice: "bm_lewis", speed: 1.04, colour: Q.pink },
    trevor: { name: "TREVOR", voice: "bm_fable", speed: 1.12, colour: Q.cyan },
    voice: { name: "", voice: "am_michael", speed: 1.0, colour: Q.gold },
    granny: { name: "GRANNY BEA", voice: "bf_emma", speed: 0.95, colour: Q.gold },
  },
  Subtitles,
  scenes: [
    {
      id: "open", next: "rules",
      beats: [
        { who: "voice", say: "Live from Studio One, it's Saturday night, and it's time for... Nothing Gets Past: The Big Quiz!", sfxs: [{ sfx: "quiz-drumroll", at: 0 }, { sfx: "quiz-sting", at: 3.6 }, { sfx: "quiz-applause", at: 4.2, volume: 0.7 }] },
        { who: "host", say: "Good evening, and welcome! Tonight's challenger is you! And your opponent, the champion for three weeks running... Clever Trevor!" },
        { who: "trevor", say: "Hello, everyone. I never lose. It's simply not possible." },
      ],
      render: s => {
        const titleK = pop(s.t, 30);
        return (
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #4B2596, ${Q.night} 60%, ${Q.deep})` }}>
            <Beams t={s.t} party={0.6} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", transform: `scale(${lerp(0.4, 1, Math.min(1, titleK))})`, opacity: Math.min(1, titleK * 2) }}>
              <div style={{ fontFamily: BEBAS, fontSize: 90, color: Q.cyan, letterSpacing: 8 }}>NOTHING GETS PAST</div>
              <div style={{ fontFamily: BEBAS, fontSize: 230, lineHeight: 0.9, color: Q.gold, textShadow: `0 0 40px ${Q.pink}, 0 8px 0 ${Q.pink}` }}>THE BIG QUIZ</div>
            </div>
            <Host t={s.t} x={330} y={700} scale={1} talking={s.beat === 1} />
            <Scoreboard t={s.t} you={0} trevor={300} round="Tonight" trevorTalking={s.beat === 2} />
            <Audience t={s.t} cheer={Math.max(0, 1 - Math.abs(s.t - 150) / 120)} />
          </AbsoluteFill>
        );
      },
    },
    {
      id: "rules", next: "r1",
      beats: [
        { who: "host", say: "Trevor starts with three hundred points from last week. Seven rounds, a hundred points each. Tap the answer panel you think is right." },
        { who: "host", say: "And remember our motto. Nothing gets past you! Let's play!", sfxs: [{ sfx: "quiz-sting", at: 2.8 }] },
      ],
      render: s => <Studio s={s} beats={[{ who: "host" }, { who: "host" }]} round="The rules" you={0} trevor={300} wall={<Wall title="Seven rounds"><text x={500} y={230} textAnchor="middle" fontFamily={BEBAS} fontSize={110} fill={Q.white}>100 POINTS EACH</text></Wall>} />,
    },

    ...round({
      n: 1, name: "Odd one out", answers: R1, correct: 2, you: 0,
      wall: <text x={500} y={240} textAnchor="middle" fontFamily={ROUND} fontWeight={600} fontSize={62} fill={Q.white}>Which one doesn't belong?</text>,
      ask: [{ who: "host", say: "Round one! Odd one out. Four shapes on your panels. Three of them share a secret. Which one is the odd one out?", sfxs: [{ sfx: "quiz-whoosh", at: 0 }] }],
      slips: [
        { id: "count", beats: [{ who: "host", say: "Ooh, so close! That's a hexagon, like two others. Shading and turning are just decoys. Count the sides on every shape!", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        { id: "count", beats: [] }, null,
        { id: "count", beats: [] },
      ],
      win: [
        { who: "host", say: "Yes! Three hexagons with six sides, and one pentagon with five. A hundred points!", sfxs: DING },
        { who: "trevor", say: "Hmph. Beginner's luck." },
      ],
      after: "r2",
    }),
    ...round({
      n: 2, name: "Crack the code", answers: R2, correct: 1, you: 100, blurt: 2,
      wall: <CodeWall />,
      ask: [
        { who: "host", say: "Round two! Crack the code. What is the code for the white triangle?", sfxs: [{ sfx: "quiz-whoosh", at: 0 }] },
        { who: "trevor", say: "Easy! Y N! I buzz first, I win!", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] },
        { who: "host", say: "Ooh, Trevor's answer was wrong! Over to you. Can you crack it?" },
      ],
      slips: [
        { id: "letters", beats: [{ who: "host", say: "Not quite! M goes with the circles. This one's a triangle. Find the letter the triangle shares.", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        null,
        { id: "order", beats: [{ who: "host", say: "Ha! That's Trevor's answer. Right letters, wrong order! The shape letter always comes first.", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        { id: "shade", beats: [{ who: "host", say: "Close! N is right for the triangle. But X means black, and this triangle is white.", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
      ],
      win: [{ who: "host", say: "N for the triangle, Y for white. N, Y! Trevor had the letters back to front!", sfxs: DING }],
      after: "r3",
    }),
    ...round({
      n: 3, name: "Fill the grid", answers: R3, correct: 2, you: 200,
      wall: <GridWall />, winWall: <GridWall solved />,
      ask: [{ who: "host", say: "Round three! Fill the grid. Read across the rows, then down the columns. What goes in the gap?", sfxs: [{ sfx: "quiz-whoosh", at: 0 }] }],
      slips: [
        { id: "small", beats: [{ who: "host", say: "So close! Right shape, but read across. Each row goes from small to big.", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        { id: "down", beats: [{ who: "host", say: "Ooh! Right size, but read down. The bottom row is squares, not circles.", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        null,
        { id: "down", beats: [] },
      ],
      win: [
        { who: "host", say: "A big square! It fits across, and it fits down. And that means... you've drawn level with Trevor!", sfxs: DING },
        { who: "trevor", say: "What? Impossible!" },
      ],
      after: "r4",
    }),
    ...round({
      n: 4, name: "Swapped words", answers: R4, correct: 3, you: 300,
      wall: <SentenceWall />, winWall: <SentenceWall fixed />,
      ask: [{ who: "host", say: "Round four! Two words in this sentence have swapped places. Which two need to swap back?", sfxs: [{ sfx: "quiz-whoosh", at: 0 }] }],
      slips: [
        { id: "silly", beats: [{ who: "host", say: "Ooh, not those! Read it out loud. Where does it get silly? Who's doing the baking?", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        { id: "silly", beats: [] },
        { id: "silly", beats: [] },
        null,
      ],
      win: [{ who: "host", say: "The grandma baked the cake! Much better. The cake can't bake anybody!", sfxs: DING }],
      after: "friend",
    }),
    {
      id: "friend", next: "r5",
      beats: [
        { who: "host", say: "Now, round five is tricky, so we're giving you a lifeline. Let's phone a friend! Hello, Granny Bea?", sfxs: [{ sfx: "quiz-phone", at: 3.4 }] },
        { who: "granny", say: "Hello, dear! Here's my tip. When a shape changes, check every change. Do the whole change, not just half of it." },
        { who: "host", say: "Thank you, Granny Bea! Remember that. Here comes round five." },
      ],
      render: s => (
        <Studio s={s} beats={[{ who: "host" }, { who: "granny" }, { who: "host" }]} round="Lifeline" you={400} trevor={300}
          wall={<Wall title="Phone a friend">
            <circle cx={500} cy={220} r={110} fill="rgba(255,200,61,0.15)" stroke={Q.gold} strokeWidth={6} />
            <path d="M 440 190 Q 440 170 460 170 L 480 170 L 490 205 L 470 215 Q 485 250 520 265 L 530 245 L 565 255 L 565 275 Q 565 295 545 295 Q 440 290 440 190 Z" fill={Q.gold} />
            <text x={500} y={375} textAnchor="middle" fontFamily={ROUND} fontSize={40} fill={Q.white}>Granny Bea</text>
          </Wall>} />
      ),
    },
    ...round({
      n: 5, name: "What comes next?", answers: R5, correct: 3, you: 400,
      wall: <AnalogyWall />,
      ask: [{ who: "host", say: "Round five! The small triangle changes into the big triangle. Change the small black heart in exactly the same way.", sfxs: [{ sfx: "quiz-whoosh", at: 0 }] }],
      slips: [
        { id: "grow", beats: [{ who: "host", say: "Ooh! That heart hasn't changed at all. What happened to the triangle? It grew!", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        { id: "colour", beats: [{ who: "host", say: "So close! It grew, yes. But did the triangle change colour? No! So the heart should stay black.", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        { id: "shape", beats: [{ who: "host", say: "Careful! The triangle stayed a triangle. So the heart must stay a heart.", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        null,
      ],
      win: [{ who: "host", say: "A big black heart! It grew, and nothing else changed. Just like Granny Bea said: the whole change, and only the change!", sfxs: DING }],
      after: "r6",
    }),
    ...round({
      n: 6, name: "Balance it", answers: R6, correct: 2, you: 500, blurt: 0,
      wall: <ScalesWall />,
      ask: [
        { who: "host", say: "Round six! Two apples weigh the same as one pear. Two pears weigh the same as one melon. How many apples weigh the same as a melon?", sfxs: [{ sfx: "quiz-whoosh", at: 0 }] },
        { who: "trevor", say: "Two apples! Obviously!", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] },
        { who: "host", say: "Sorry Trevor, that's only one pear's worth. Your turn!" },
      ],
      slips: [
        { id: "pear", beats: [{ who: "host", say: "That's Trevor's answer! Two apples is only one pear. A melon needs two pears.", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        { id: "swap", beats: [{ who: "host", say: "Ooh! Swap each pear for two apples. Two pears, two apples each. How many is that?", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        null,
        { id: "swap", beats: [] },
      ],
      win: [{ who: "host", say: "Four apples! Two pears, and each pear is two apples. Two and two make four!", sfxs: DING }],
      after: "jackpot",
    }),
    {
      id: "jackpot", next: "r7",
      beats: [
        { who: "voice", say: "It's the final round... the jackpot question!", sfxs: [{ sfx: "quiz-drumroll", at: 0 }] },
        { who: "host", say: "You're ahead, but this is worth a hundred points and the trophy. Here's the original flag. One of the four panels is flipped. The other three are only turned." },
      ],
      render: s => <Studio s={s} beats={[{ who: "voice" }, { who: "host" }]} round="Jackpot" you={600} trevor={300} wall={<Wall title="The jackpot"><FlagWall /></Wall>} party={0.5} />,
    },
    ...round({
      n: 7, name: "Which one is flipped?", answers: R7, correct: 2, you: 600,
      wall: <FlagWall />,
      ask: [{ who: "host", say: "Which flag has been flipped? Take your time... and tap it!", sfxs: [{ sfx: "quiz-tick", at: 0, volume: 0.7 }] }],
      slips: [
        { id: "turned", beats: [{ who: "host", say: "Ooh! Spin that one round, and it matches the original. It's only turned. Find the one that never matches, however you spin it.", sfxs: [{ sfx: "quiz-buzzer", at: 0 }] }] },
        { id: "turned", beats: [] }, null,
        { id: "turned", beats: [] },
      ],
      win: [{ who: "host", say: "Flipped! A mirror image! However you turn it, it never matches the original. That's the jackpot!", sfxs: [{ sfx: "quiz-drumroll", at: 0 }, ...DING.map(d => ({ ...d, at: d.at + 1.2 }))] }],
      after: "champion",
    }),
    {
      id: "champion",
      beats: [
        { who: "host", say: "Ladies and gentlemen, with seven hundred points, we have a new champion!", sfxs: [{ sfx: "quiz-sting", at: 0 }, { sfx: "quiz-applause", at: 0.4 }] },
        { who: "trevor", say: "Well played. I suppose... nothing gets past you." },
        { who: "host", say: "Nothing gets past you! Goodnight, everybody!", sfxs: [{ sfx: "quiz-applause", at: 0.2 }] },
      ],
      render: s => {
        const k = pop(s.t, 20);
        return (
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, #6A2FB8, ${Q.night} 60%, ${Q.deep})` }}>
            <Beams t={s.t} party={1} />
            {/* The trophy. */}
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              <g transform={`translate(960 420) scale(${lerp(0.3, 1, Math.min(1, k))})`}>
                <path d="M -130 -200 L 130 -200 L 110 -40 Q 0 60 -110 -40 Z" fill={Q.gold} stroke="#B8860B" strokeWidth={8} />
                <path d="M -130 -170 Q -220 -170 -200 -90 Q -180 -40 -110 -60" fill="none" stroke={Q.gold} strokeWidth={22} />
                <path d="M 130 -170 Q 220 -170 200 -90 Q 180 -40 110 -60" fill="none" stroke={Q.gold} strokeWidth={22} />
                <rect x={-24} y={10} width={48} height={90} fill={Q.gold} />
                <rect x={-110} y={100} width={220} height={60} rx={10} fill="#B8860B" />
                <path d="M -40 -150 L 0 -120 L 40 -150" fill="none" stroke={Q.white} strokeWidth={10} opacity={0.5} />
              </g>
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: BEBAS, fontSize: 130, color: Q.gold, textShadow: `0 0 40px ${Q.pink}`, opacity: rise(s.t, 20, 30) }}>CHAMPION</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: ROUND, fontWeight: 600, fontSize: 54, color: Q.white, opacity: rise(s.t, 20, 50) }}>Nothing gets past you</div>
            <Audience t={s.t} cheer={1} />
            <Confetti t={s.t} at={10} />
          </AbsoluteFill>
        );
      },
    },
  ],
};
