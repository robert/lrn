// Series 2, film 1: "The Case of the Odd One Out". A film noir.
// Inspector Sharp and Constable Penny work a line-up of five suspects:
// four share a secret, one doesn't. Black and white, rain, grain, spotlights.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadElite } from "@remotion/google-fonts/SpecialElite";
import { loadFont as loadLime } from "@remotion/google-fonts/Limelight";
import { rise, pop, window, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";

const { fontFamily: TYPE } = loadElite();
const { fontFamily: NEON } = loadLime();

const INK = "#0E0E0E";
const PAPER = "#EDE8DA";
const WALL = "#8A8883";
const AMBER = "#E3A73D"; // the only colour in the film: neon and stamps

// Deterministic "random" from a number, so every frame renders the same.
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- The world ----------

// Grain, flicker, vignette and letterbox bars over everything.
function Overlay({ frame }) {
  const flicker = 0.035 * (hash(frame) - 0.5);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `rgba(255,255,255,${Math.max(0, flicker)})`, mixBlendMode: "overlay" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.16, mixBlendMode: "overlay" }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={frame % 97} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter="url(#grain)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 45%, rgba(0,0,0,0.75) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "#000" }} />
    </AbsoluteFill>
  );
}

// Typewritten subtitles in the bottom bar, with who's speaking.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{
      position: "absolute", left: 180, right: 180, bottom: 38, height: 90, opacity,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 22,
      fontFamily: TYPE, fontSize: 40, lineHeight: 1.2, textAlign: "center",
    }}>
      {actor && <span style={{ color: AMBER, fontSize: 28, letterSpacing: 3, flex: "none" }}>{actor.name}</span>}
      <span>
        {words.map((w, i) => (
          <span key={i} style={{ color: i < spoken ? PAPER : "#6F6C66" }}>{w}{i < words.length - 1 ? " " : ""}</span>
        ))}
      </span>
    </div>
  );
}

// Rain streaks falling across the frame.
function Rain({ t, amount = 1, angle = 12 }) {
  const drops = Array.from({ length: 140 }, (_, i) => {
    const speed = 38 + hash(i) * 30;
    const x = hash(i + 1) * 2100 - 90;
    const y = ((hash(i + 2) * 1300 + t * speed) % 1300) - 150;
    const len = 30 + hash(i + 3) * 50;
    return <line key={i} x1={x} y1={y} x2={x - len * Math.tan((angle * Math.PI) / 180)} y2={y + len}
      stroke="rgba(220,225,230,0.35)" strokeWidth={1.4} />;
  });
  return <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: amount }}>{drops}</svg>;
}

// The city at night: towers with a few lit windows.
function Skyline({ t }) {
  const towers = Array.from({ length: 16 }, (_, i) => {
    const w = 90 + hash(i * 3) * 110;
    const h = 260 + hash(i * 5) * 420;
    const x = i * 124 - 40 + hash(i * 7) * 30;
    const windows = [];
    for (let r = 0; r < h / 42 - 1; r++) for (let c = 0; c < w / 32 - 1; c++) {
      const k = hash(i * 1000 + r * 31 + c);
      if (k > 0.8) windows.push(<rect key={`${r}-${c}`} x={x + 14 + c * 32} y={1080 - h + 20 + r * 42} width={12} height={18}
        fill={k > 0.97 && Math.floor(t / 40 + k * 10) % 7 === 0 ? "#555" : "#CFC6A8"} opacity={0.55} />);
    }
    return <g key={i}><rect x={x} y={1080 - h} width={w} height={h} fill="#141414" />{windows}</g>;
  });
  return <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>{towers}</svg>;
}

// A neon sign that buzzes into life, then stutters now and then.
function Neon({ t, text, x, y, size = 96, on = 0 }) {
  const stutter = hash(Math.floor(t / 3)) > 0.93 ? 0.35 : 1;
  const k = Math.min(1, on) * stutter;
  return (
    <div style={{
      position: "absolute", left: x, top: y, fontFamily: NEON, fontSize: size, letterSpacing: 6,
      color: k > 0.5 ? "#FFE3A8" : "#5A4A2A",
      textShadow: k > 0.5 ? `0 0 12px ${AMBER}, 0 0 38px ${AMBER}, 0 0 80px rgba(227,167,61,0.6)` : "none",
      opacity: 0.35 + 0.65 * k,
    }}>{text}</div>
  );
}

// The line-up wall: height lines, numbered placards, spotlights.
const XS = [360, 660, 960, 1260, 1560];
const FLOOR = 610;
function LineupWall({ light = [1, 1, 1, 1, 1], house = 0.25 }) {
  const rows = [];
  for (let i = 0; i <= 8; i++) {
    const y = 140 + i * 58;
    rows.push(<line key={i} x1={0} x2={1920} y1={y} y2={y} stroke="#6E6C67" strokeWidth={i % 2 ? 1 : 2.5} />);
    if (i % 2 === 0) rows.push(<text key={`n${i}`} x={40} y={y - 8} fill="#6E6C67" fontFamily={TYPE} fontSize={26}>{7 - i / 2} ft</text>);
  }
  const spots = XS.map((x, i) => `radial-gradient(ellipse 190px 330px at ${x}px ${FLOOR - 120}px, rgba(255,250,235,${0.62 * light[i]}) 0%, rgba(255,250,235,${0.25 * light[i]}) 55%, transparent 100%)`);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: WALL }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>{rows}
        <rect x={0} y={FLOOR + 90} width={1920} height={400} fill="#3A3936" />
      </svg>
      <AbsoluteFill style={{ background: spots.join(","), mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: `rgba(0,0,0,${1 - house - 0.35 * Math.max(...light)})` }} />
    </AbsoluteFill>
  );
}

// Five suspects standing in the line-up, each with a placard.
function Suspects({ suspects, t, enter = 0, dim = [], transforms = {} }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {suspects.map((s, i) => {
        const k = rise(t, 20, enter + i * 8);
        const tr = transforms[i] ?? {};
        return (
          <g key={i} opacity={k * (dim.includes(i) ? 0.35 : 1)} transform={`translate(0 ${(1 - k) * 40})`}>
            <g transform={`translate(${XS[i]} ${FLOOR - 120})`}>
              <g transform={`rotate(${tr.rot ?? 0}) scale(${tr.sx ?? 1} 1)`}>
                <Shape {...s} x={0} y={0} draw={rise(t, 30, enter + i * 8 + 4)} />
              </g>
            </g>
            <rect x={XS[i] - 42} y={FLOOR + 40} width={84} height={58} rx={4} fill="#1A1A1A" stroke="#555" />
            <text x={XS[i]} y={FLOOR + 82} textAnchor="middle" fill={PAPER} fontFamily={TYPE} fontSize={38}>{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

// A rubber stamp slammed on at an angle.
function Stamp({ t, at, x, y, text, size = 46, rot = -8 }) {
  const k = pop(t, at);
  if (k <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${lerp(1.8, 1, k)})`,
      opacity: Math.min(1, k * 1.4), border: `5px solid ${AMBER}`, borderRadius: 8, padding: "6px 22px",
      fontFamily: TYPE, fontSize: size, color: AMBER, letterSpacing: 4, whiteSpace: "nowrap",
      boxShadow: `inset 0 0 0 3px rgba(227,167,61,0.25)`, mixBlendMode: "screen",
    }}>{text}</div>
  );
}

// Typed text that appears letter by letter.
function Typed({ t, at, text, x, y, size = 44, color = INK, perChar = 2.2, width, align = "left" }) {
  const n = Math.max(0, Math.floor((t - at) / perChar));
  return (
    <div style={{ position: "absolute", left: x, top: y, width, textAlign: align, fontFamily: TYPE, fontSize: size, color, whiteSpace: "pre-wrap" }}>
      {text.slice(0, n)}<span style={{ opacity: n < text.length && Math.floor(t / 8) % 2 ? 1 : 0 }}>|</span>
    </div>
  );
}

// Big number chalked above each suspect.
function Tally({ t, at, values, highlight }) {
  return values.map((v, i) => {
    const k = pop(t, at + i * 7);
    return (
      <div key={i} style={{
        position: "absolute", left: XS[i] - 40, top: 150, width: 80, textAlign: "center",
        fontFamily: TYPE, fontSize: 72, color: i === highlight && t > at + 50 ? AMBER : PAPER,
        opacity: k, transform: `scale(${lerp(0.5, 1, k)})`, textShadow: "0 2px 8px rgba(0,0,0,0.6)",
      }}>{v}</div>
    );
  });
}

// ---------- The cases ----------
const CASE1 = [
  { kind: "triangle", r: 70, fill: "white" },
  { kind: "triangle", r: 52, fill: "grey", rot: 180 },
  { kind: "triangle", r: 86, fill: "black", rot: 90 },
  { kind: "diamond", r: 70, fill: "white" },
  { kind: "triangle", r: 60, fill: "striped", rot: 30 },
];
const CASE2 = [
  { kind: "flag", r: 78, fill: "white" },
  { kind: "flag", r: 78, fill: "white", flip: true, rot: 90 },
  { kind: "flag", r: 78, fill: "white", rot: 180 },
  { kind: "flag", r: 78, fill: "white", rot: 270 },
  { kind: "flag", r: 78, fill: "white", rot: 45 },
];

// Case three: circles each keeping a little square. One lets it out.
function Case3({ t, enter }) {
  const fills = ["white", "grey", "striped", "white", "grey"];
  const inner = [[-18, 12], [16, -20], [0, 22], [-22, -10], null];
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {XS.map((x, i) => {
        const k = rise(t, 20, enter + i * 8);
        const d = rise(t, 30, enter + i * 8 + 4);
        return (
          <g key={i} opacity={k}>
            <Shape kind="circle" r={78} fill={fills[i]} x={x} y={FLOOR - 120} draw={d} />
            {inner[i]
              ? <Shape kind="square" r={17} fill="black" x={x + inner[i][0]} y={FLOOR - 120 + inner[i][1]} draw={d} />
              : <Shape kind="square" r={17} fill="black" x={x + 96} y={FLOOR - 220} draw={d} />}
            <rect x={x - 42} y={FLOOR + 40} width={84} height={58} rx={4} fill="#1A1A1A" stroke="#555" />
            <text x={x} y={FLOOR + 82} textAnchor="middle" fill={PAPER} fontFamily={TYPE} fontSize={38}>{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

// A wall clock ticking down the seconds.
function Clock({ t, at, seconds = 6 }) {
  const e = Math.max(0, t - at);
  const left = Math.max(0, seconds - Math.floor(e / 30));
  const a = (Math.floor(e / 30) / 60) * 360 * 10;
  return (
    <div style={{ position: "absolute", right: 110, top: 110, opacity: rise(t, 12, at) }}>
      <svg width="170" height="170" viewBox="-85 -85 170 170">
        <circle r="78" fill={PAPER} stroke="#222" strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1="0" y1="-66" x2="0" y2="-56" stroke="#222" strokeWidth="4" transform={`rotate(${i * 30})`} />)}
        <line x1="0" y1="0" x2="0" y2="-58" stroke={INK} strokeWidth="4" strokeLinecap="round" transform={`rotate(${a})`} />
        <circle r="6" fill={INK} />
      </svg>
      <div style={{ textAlign: "center", fontFamily: TYPE, fontSize: 40, color: PAPER, marginTop: 6 }}>{left > 0 ? `${left}` : "Time!"}</div>
    </div>
  );
}

// Timings of the typewritten title, reused for its sound.
const TITLE = "THE CASE OF THE ODD ONE OUT";
const typeClacks = (start, text, perChar) =>
  [...text].map((ch, i) => (ch === " " ? null : { sfx: "type", at: start + (i * perChar) / 30, volume: 0.6 })).filter(Boolean);

// ---------- The film ----------
export default {
  id: "s2-noir",
  order: 101,
  series: 2,
  title: "The Case of the Odd One Out",
  frame: "none",
  push: 0.03,
  cast: {
    sharp: { name: "SHARP", voice: "bm_george", speed: 0.86 },
    penny: { name: "PENNY", voice: "bf_isabella", speed: 1.0 },
  },
  music: { src: "music/noir.wav", volume: 0.32, duck: 0.4 },
  Overlay,
  Subtitles,
  scenes: [
    // Cold open: the city in the rain.
    {
      beats: [
        { who: "sharp", say: "The rain hadn't stopped for three days. Neither had the puzzles.", sfxs: [{ sfx: "rain", at: 0, volume: 0.45 }] },
        { who: "sharp", say: "The name's Sharp. Inspector Sharp. And in this city, nothing gets past me." },
      ],
      render: s => (
        <AbsoluteFill style={{ background: "linear-gradient(#050505, #1A1A1A 70%, #0A0A0A)" }}>
          <Skyline t={s.t} />
          <Neon t={s.t} text="NOTHING GETS PAST" x={560} y={250} size={92} on={rise(s.t, 6, s.at(1) + 30) + (s.t > s.at(1) + 30 ? 1 : 0)} />
          <Rain t={s.t} />
          {/* The window frame we're looking through. */}
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            <rect x="0" y="0" width="1920" height="1080" fill="none" stroke="#050505" strokeWidth="120" />
            <rect x="945" y="0" width="30" height="1080" fill="#050505" />
            <rect x="0" y="560" width="1920" height="26" fill="#050505" />
          </svg>
        </AbsoluteFill>
      ),
    },

    // Title: typed out under a single lamp.
    {
      beats: [
        { who: "sharp", say: "This one was called... the Case of the Odd One Out.", voice: "This one was called. The Case of the Odd One Out.",
          sfxs: [...typeClacks(0.6, TITLE, 3), { sfx: "bell", at: 0.6 + (TITLE.length * 3) / 30 + 0.1, volume: 0.6 }], hold: 1.2 },
      ],
      render: s => (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 900px 520px at 50% 48%, #3A3833 0%, #121212 70%, #050505 100%)" }}>
          <Typed t={s.t} at={18} text={TITLE} x={0} y={440} width={1920} align="center" size={96} color={PAPER} perChar={3} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 580, textAlign: "center", fontFamily: TYPE, fontSize: 34, color: AMBER, opacity: rise(s.t, 20, 110), letterSpacing: 8 }}>
            A NOTHING GETS PAST MYSTERY
          </div>
        </AbsoluteFill>
      ),
    },

    // The office: Penny brings the case, Sharp lays down the rules.
    {
      beats: [
        { who: "penny", say: "Inspector! Five suspects in the line-up. The chief says one of them doesn't belong.", sfxs: [{ sfx: "rain", at: 0, volume: 0.18 }] },
        { who: "sharp", say: "Four of them share a secret, Penny. The odd one out is the one that doesn't." },
        { who: "sharp", say: "So we find what the four have in common. We find the one that breaks it. And we say why." },
        { who: "penny", say: "Say why?" },
        { who: "sharp", say: "Always say why. A hunch isn't evidence." },
      ],
      render: s => {
        const open = rise(s.t, 26, s.at(1) + 10);
        const rules = ["1. Find what four share.", "2. Find the one that breaks it.", "3. Say why."];
        return (
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #3C3A35, #111 75%)" }}>
            {/* Desk lamp pool of light and the case file. */}
            <div style={{ position: "absolute", left: 360, top: 170, width: 1200, height: 700, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,245,215,0.28), transparent)" }} />
            <div style={{ position: "absolute", left: 560, top: 190, width: 800, height: 600, transform: `perspective(1600px) rotateX(${lerp(22, 12, open)}deg)` }}>
              <div style={{ position: "absolute", inset: 0, background: "#B9AE8E", borderRadius: 10, boxShadow: "0 30px 60px rgba(0,0,0,0.7)" }} />
              <div style={{ position: "absolute", left: 40, top: -34, width: 240, height: 50, background: "#B9AE8E", borderRadius: "10px 10px 0 0" }} />
              <div style={{ position: "absolute", inset: 26, background: PAPER, borderRadius: 4, opacity: open, padding: 40, boxShadow: "inset 0 0 40px rgba(120,100,60,0.25)" }}>
                <div style={{ fontFamily: TYPE, fontSize: 30, color: "#555", letterSpacing: 4 }}>CASE FILE No. 1</div>
                <div style={{ fontFamily: TYPE, fontSize: 52, color: INK, marginTop: 10 }}>The Odd One Out</div>
                <div style={{ height: 2, background: "#999", margin: "22px 0 30px" }} />
                {rules.map((r, i) => (
                  <Typed key={i} t={s.t} at={s.at(2) + s.speech(2) * (0.1 + i * 0.3)} text={r} x={40} y={200 + i * 72} size={44} perChar={1.5} />
                ))}
              </div>
            </div>
            <Stamp t={s.t} at={s.at(4) + s.speech(4) * 0.6} x={1250} y={640} text="SAY WHY" size={42} rot={-12} />
            <Rain t={s.t} amount={0.25} />
          </AbsoluteFill>
        );
      },
    },

    // Line-up one: count the corners.
    {
      beats: [
        { who: "sharp", say: "Bring them in.", sfxs: [{ sfx: "spotlight", at: 0.4, volume: 0.8 }] },
        { who: "penny", say: "Number three! The big black one. He looks guilty to me." },
        { who: "sharp", say: "Big, small, black, white, stripy. Red herrings. They're all different sizes and colours, so that can't be their secret." },
        { who: "sharp", say: "Count their corners, Penny. Every one." },
        { who: "penny", say: "Three, three, three... four! And three." },
        { who: "sharp", say: "Number four has four sides. Everyone else has three. That's our odd one out.", sfxs: [{ sfx: "stamp", at: 4.6 }] },
      ],
      render: s => {
        const light = s.t < s.at(1) ? [rise(s.t, 6, 14), rise(s.t, 6, 20), rise(s.t, 6, 26), rise(s.t, 6, 32), rise(s.t, 6, 38)]
          : s.t < s.at(2) ? [0.35, 0.35, 1, 0.35, 0.35] : s.t < s.at(5) ? [1, 1, 1, 1, 1] : [0.3, 0.3, 0.3, 1, 0.3];
        return (
          <AbsoluteFill>
            <LineupWall light={light} />
            <Suspects suspects={CASE1} t={s.t} enter={10} />
            <Tally t={s.t} at={s.at(4) + 6} values={[3, 3, 3, 4, 3]} highlight={3} />
            <Stamp t={s.t} at={s.at(5) + s.speech(5) * 0.72} x={XS[3]} y={FLOOR - 270} text="4 SIDES" />
          </AbsoluteFill>
        );
      },
    },

    // Line-up two: the twist. A mirror image.
    {
      beats: [
        { who: "penny", say: "Next line-up, guv. Five flags. And look, number three's upside down! Got him!", sfxs: [{ sfx: "spotlight", at: 0.2, volume: 0.7 }] },
        { who: "sharp", say: "Not so fast. Turning round isn't a crime. Watch." },
        { who: "sharp", say: "Spin number three the right way up, and it's the same flag as number one. Innocent." },
        { who: "sharp", say: "Now watch number two. I can turn it all night long, and it will never match." },
        { who: "sharp", say: "Because it isn't turned. It's flipped. A mirror image. That's our odd one out.", sfxs: [{ sfx: "stamp", at: 4.2 }] },
        { who: "penny", say: "So turning doesn't count... but flipping does." },
        { who: "sharp", say: "Now you're thinking like a detective." },
      ],
      render: s => {
        // Number three turns back upright; number two spins, then flips.
        const back = rise(s.t, 40, s.at(2) + 10);
        const spin = rise(s.t, 110, s.at(3) + 10);
        const flip = rise(s.t, 24, s.at(4) + 30);
        // After the flip, a last quarter turn stands it upright: now it's
        // exactly the same flag as number one.
        const settle = rise(s.t, 30, s.at(4) + 60);
        const transforms = {
          2: { rot: lerp(0, -180, back) },
          1: { rot: spin * 540 - settle * 90, sx: lerp(1, -1, flip) },
        };
        const light = s.t < s.at(1) ? [1, 1, 1, 1, 1] : s.t < s.at(3) ? [1, 0.3, 1, 0.3, 0.3] : s.t < s.at(5) ? [1, 1, 0.3, 0.3, 0.3] : [0.3, 1, 0.3, 0.3, 0.3];
        // A faint ghost of number one over number two, to compare against.
        const ghost = window(s.t, s.at(3), s.at(5) + 20);
        return (
          <AbsoluteFill>
            <LineupWall light={light} />
            <Suspects suspects={CASE2} t={s.t} enter={8} transforms={transforms} />
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.5 * ghost }}>
              <g transform={`translate(${XS[1]} ${FLOOR - 120})`}>
                <Shape kind="flag" r={78} fill="none" ink={AMBER} line="dashed" />
              </g>
            </svg>
            <div style={{ position: "absolute", left: XS[1] - 150, top: 250, width: 300, textAlign: "center", fontFamily: TYPE, fontSize: 30, color: AMBER, opacity: ghost }}>
              {settle > 0.9 ? "a perfect match!" : "no match..."}
            </div>
            <Stamp t={s.t} at={s.at(4) + s.speech(4) * 0.8} x={XS[1]} y={FLOOR - 290} text="FLIPPED" />
          </AbsoluteFill>
        );
      },
    },

    // Your turn: a line-up for the viewer.
    {
      beats: [
        { who: "sharp", say: "One more line-up. This one's yours, detective. What do four of them share? Pause if you need more time.", hold: 6.5,
          sfxs: Array.from({ length: 6 }, (_, i) => ({ sfx: "tick", at: 0 + i, volume: 0.9 })) },
        { who: "sharp", say: "Number five. Every other circle keeps its little square inside. Number five's square is outside.", sfxs: [{ sfx: "stamp", at: 5.4 }] },
        { who: "penny", say: "Inside or outside. One of the twelve things that can change!" },
      ],
      render: s => {
        const light = s.t < s.at(1) ? [1, 1, 1, 1, 1] : [0.3, 0.3, 0.3, 0.3, 1];
        return (
          <AbsoluteFill>
            <LineupWall light={light} />
            <Case3 t={s.t} enter={8} />
            <Clock t={s.t} at={s.at(0) + s.speech(0)} seconds={6} />
            <Stamp t={s.t} at={s.at(1) + s.speech(1) * 0.8} x={XS[4] - 40} y={FLOOR + 10} text="OUTSIDE" rot={-4} />
          </AbsoluteFill>
        );
      },
    },

    // Case closed: the rain stops and the sun comes up.
    {
      beats: [
        { who: "sharp", say: "Four share a secret. One doesn't. Find it, and say why." },
        { who: "penny", say: "And never trust a mirror image!" },
        { who: "sharp", say: "Case closed, Penny. Nothing gets past us.", sfxs: [{ sfx: "stamp", at: 2.2 }, { sfx: "chime", at: 2.4, volume: 0.6 }] },
      ],
      tail: 1.5,
      render: s => {
        const dawn = rise(s.t, 150, 0);
        return (
          <AbsoluteFill style={{ background: `linear-gradient(${lerp(0, 1, dawn) > 0.5 ? "#6B6760" : "#0A0A0A"}, #1A1A1A)` }}>
            <AbsoluteFill style={{ background: `linear-gradient(#050505, #262420 60%, #4A463E)`, opacity: 1 - dawn * 0.6 }} />
            <AbsoluteFill style={{ background: "radial-gradient(ellipse 900px 400px at 50% 100%, rgba(255,240,200,0.55), transparent 70%)", opacity: dawn }} />
            <Skyline t={s.t} />
            <Rain t={s.t} amount={1 - dawn} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: TYPE, fontSize: 60, color: PAPER, opacity: rise(s.t, 20, s.at(0)) }}>
              Four share a secret.<br />One doesn't.<br /><span style={{ color: AMBER }}>Say why.</span>
            </div>
            <Stamp t={s.t} at={s.at(2) + s.speech(2) * 0.75} x={960} y={250} text="CASE CLOSED" size={64} rot={-6} />
          </AbsoluteFill>
        );
      },
    },
  ],
};
