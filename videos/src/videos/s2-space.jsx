// Series 2, film 4: "Mission to the Missing Square". A space adventure.
// The star map has holes in it, and the ship can't jump home until every
// missing square is found. Teaches grids: read across, read down, check both.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { rise, pop, window, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";
import { SANS } from "../lib/theme.js";

const { fontFamily: HUD } = loadOrbitron();

const CYAN = "#7FF3FF";
const CYAN_DIM = "rgba(127,243,255,0.35)";
const AMBER = "#FFC46B";
const PINK = "#FF8FB8";
const DEEP = "#040816";

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- The universe ----------

// Three layers of stars drifting past at different speeds, and slow nebulae.
function Backdrop({ frame }) {
  const layers = [
    { n: 160, speed: 0.15, size: 1.2, alpha: 0.5 },
    { n: 90, speed: 0.4, size: 1.9, alpha: 0.75 },
    { n: 40, speed: 0.9, size: 2.8, alpha: 1 },
  ];
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 20%, #16204A 0%, #0A1030 40%, ${DEEP} 80%)` }}>
      <AbsoluteFill style={{
        background: [
          `radial-gradient(ellipse 700px 380px at ${1300 - (frame * 0.2) % 400}px 300px, rgba(120,80,200,0.28), transparent 70%)`,
          `radial-gradient(ellipse 600px 300px at ${500 - (frame * 0.12) % 300}px 700px, rgba(40,160,200,0.22), transparent 70%)`,
          `radial-gradient(ellipse 400px 260px at 1650px 820px, rgba(255,120,160,0.12), transparent 70%)`,
        ].join(","),
      }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {layers.flatMap((L, li) => Array.from({ length: L.n }, (_, i) => {
          const k = li * 1000 + i;
          const x = ((hash(k) * 2100 - frame * L.speed) % 2100 + 2100) % 2100 - 90;
          const y = hash(k + 7) * 1080;
          const tw = 0.6 + 0.4 * Math.sin(frame / (6 + hash(k + 3) * 10) + k);
          return <circle key={k} cx={x} cy={y} r={L.size * (0.6 + hash(k + 5))} fill="#DDEBFF" opacity={L.alpha * tw} />;
        }))}
      </svg>
    </AbsoluteFill>
  );
}

// HUD corners, faint scanlines, a vignette and a readout.
function Overlay({ frame }) {
  const corner = (x, y, sx, sy) => (
    <path d={`M ${x} ${y + sy * 60} L ${x} ${y} L ${x + sx * 60} ${y}`} stroke={CYAN} strokeWidth="3" fill="none" opacity="0.7" />
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(127,243,255,0.035) 0 1px, transparent 1px 4px)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,8,0.7) 100%)" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {corner(40, 40, 1, 1)}{corner(1880, 40, -1, 1)}{corner(40, 1040, 1, -1)}{corner(1880, 1040, -1, -1)}
      </svg>
      <div style={{ position: "absolute", left: 70, top: 52, fontFamily: HUD, fontSize: 18, letterSpacing: 3, color: CYAN_DIM }}>
        STARSHIP SHARP EYE &nbsp; / &nbsp; T+{String(Math.floor(frame / 30)).padStart(4, "0")}
      </div>
    </AbsoluteFill>
  );
}

// Subtitles on a glass strip across the console, speaker tag in their colour.
const TAG = { captain: AMBER, orbit: CYAN, bolt: PINK };
function Subtitles({ words, spoken, opacity, who, actor }) {
  return (
    <div style={{
      position: "absolute", left: 220, right: 220, bottom: 42, minHeight: 92, opacity,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 24,
      background: "linear-gradient(90deg, transparent, rgba(8,18,40,0.82) 12%, rgba(8,18,40,0.82) 88%, transparent)",
      borderTop: `1px solid ${CYAN_DIM}`, padding: "12px 30px",
    }}>
      {actor && <span style={{ fontFamily: HUD, fontSize: 22, letterSpacing: 4, color: TAG[who], flex: "none" }}>{actor.name}</span>}
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 42, lineHeight: 1.2, textAlign: "center" }}>
        {words.map((w, i) => (
          <span key={i} style={{ color: i < spoken ? "#F2FAFF" : "rgba(180,200,230,0.42)" }}>{w}{i < words.length - 1 ? " " : ""}</span>
        ))}
      </span>
    </div>
  );
}

// The bridge: the curved window frame and a console with blinking lights.
function Bridge({ t, alarm = 0 }) {
  const lights = Array.from({ length: 28 }, (_, i) => {
    const on = hash(i + Math.floor(t / (10 + (i % 5) * 4))) > 0.4;
    const col = [CYAN, AMBER, PINK, "#9CFFB0"][i % 4];
    return <rect key={i} x={260 + i * 50} y={968 + (i % 2) * 18} width={22} height={8} rx={3} fill={col} opacity={on ? 0.85 : 0.18} />;
  });
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <path d="M 0 0 L 1920 0 L 1920 90 Q 960 20 0 90 Z" fill="#0A0F1E" />
      <path d="M 0 1080 L 0 930 Q 960 860 1920 930 L 1920 1080 Z" fill="#0B1122" />
      <path d="M 0 930 Q 960 860 1920 930" stroke={CYAN_DIM} strokeWidth="2" fill="none" />
      {lights}
      {alarm > 0 && <rect width="1920" height="1080" fill={`rgba(255,110,90,${0.12 * alarm})`} />}
    </svg>
  );
}

// ---------- The hologram ----------

// Recolours ink drawings into a hologram: dark ink glows cyan, white goes
// see-through (its alpha falls with lightness), grey sits in between. So "black" reads as solid light, "white" as hollow.
function HoloDefs() {
  return (
    <defs>
      <filter id="holo" x="-30%" y="-30%" width="160%" height="160%">
        <feColorMatrix type="matrix" values="-0.15 -0.29 -0.06 0.5 0  -0.29 -0.57 -0.11 0.97 0  -0.3 -0.59 -0.11 1 0  -0.24 -0.47 -0.09 1 0" result="c" />
        <feGaussianBlur in="c" stdDeviation="4" result="g" />
        <feMerge><feMergeNode in="g" /><feMergeNode in="c" /></feMerge>
      </filter>
    </defs>
  );
}

// One cell's contents: a list of shapes with offsets from the cell centre.
function CellFigure({ items, size, draw = 1 }) {
  return (
    <g filter="url(#holo)">
      {items.map((it, i) => (
        <Shape key={i} {...it} x={(it.dx ?? 0) * size} y={(it.dy ?? 0) * size} r={(it.r ?? 0.3) * size} draw={draw} />
      ))}
    </g>
  );
}

// A projected grid. cells[row][col] is a list of shapes, or null for the gap.
// scanRow / scanCol light a band sweeping across a row or down a column.
function HoloGrid({ t, cells, x, y, cell, appear = 1, scanRow, scanCol, fill, fillAt, fillItems, gapLabel = "?" }) {
  const n = cells.length;
  const W = cell * n;
  const flick = appear < 1 ? (hash(Math.floor(t)) > 0.5 ? 1 : 0.6) : 1;
  const beam = (i, k, horizontal) => k > 0 && (
    <rect x={horizontal ? -10 : i * cell} y={horizontal ? i * cell : -10} width={horizontal ? W * k + 10 : cell} height={horizontal ? cell : W * k + 10}
      fill="rgba(127,243,255,0.13)" stroke={CYAN} strokeWidth="2" rx="8" />
  );
  const filled = fill != null ? pop(t, fillAt) : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: W, height: W, opacity: appear * flick, transform: `scaleY(${lerp(0.02, 1, Math.min(1, appear * 1.4))})` }}>
      {/* The projector beam from below. */}
      <div style={{ position: "absolute", left: -80, right: -80, top: W - 20, height: 200, background: "radial-gradient(ellipse at 50% 100%, rgba(127,243,255,0.25), transparent 70%)" }} />
      <svg width={W} height={W} style={{ overflow: "visible" }}>
        <HoloDefs />
        <rect x={0} y={0} width={W} height={W} fill="rgba(20,60,90,0.35)" stroke={CYAN} strokeWidth="3" rx="10" />
        {Array.from({ length: n - 1 }, (_, i) => (
          <g key={i}>
            <line x1={(i + 1) * cell} y1={0} x2={(i + 1) * cell} y2={W} stroke={CYAN_DIM} strokeWidth="2" />
            <line x1={0} y1={(i + 1) * cell} x2={W} y2={(i + 1) * cell} stroke={CYAN_DIM} strokeWidth="2" />
          </g>
        ))}
        {scanRow && beam(scanRow.i, scanRow.k, true)}
        {scanCol && beam(scanCol.i, scanCol.k, false)}
        {cells.map((row, r) => row.map((items, c) => (
          <g key={`${r}-${c}`} transform={`translate(${c * cell + cell / 2} ${r * cell + cell / 2})`}>
            {items ? <CellFigure items={items} size={cell} /> : (
              <>
                <rect x={-cell / 2 + 12} y={-cell / 2 + 12} width={cell - 24} height={cell - 24} rx="8" fill="none" stroke={AMBER}
                  strokeWidth="3" strokeDasharray="12 9" opacity={0.5 + 0.5 * Math.sin(t / 6)} />
                {filled < 0.5 && <text x={0} y={cell * 0.14} textAnchor="middle" fontFamily={HUD} fontSize={cell * 0.42} fill={AMBER}>{gapLabel}</text>}
                {filled > 0 && <g transform={`scale(${filled})`}><CellFigure items={fillItems} size={cell} /></g>}
              </>
            )}
          </g>
        )))}
      </svg>
    </div>
  );
}

// Answer choices as small holo tiles, lettered a to d.
function Choices({ t, x, y, cell = 150, options, appearAt, pick, pickAt, nope, nopeAt }) {
  return options.map((items, i) => {
    const a = rise(t, 14, appearAt + i * 5);
    const px = x + (i % 2) * (cell + 50);
    const py = y + Math.floor(i / 2) * (cell + 80);
    const isPick = i === pick && t >= pickAt;
    const isNope = i === nope && t >= nopeAt;
    const shake = isNope && t < nopeAt + 14 ? Math.sin((t - nopeAt) * 2.2) * 8 : 0;
    const border = isPick ? AMBER : isNope ? "#FF7A6A" : CYAN;
    return (
      <div key={i} style={{ position: "absolute", left: px + shake, top: py, width: cell, height: cell, opacity: a * (isNope ? 0.55 : 1) }}>
        <svg width={cell} height={cell} style={{ overflow: "visible" }}>
          <HoloDefs />
          <rect x={0} y={0} width={cell} height={cell} rx="10" fill={isPick ? "rgba(255,196,107,0.12)" : "rgba(20,60,90,0.4)"} stroke={border} strokeWidth={isPick ? 5 : 2.5} />
          <g transform={`translate(${cell / 2} ${cell / 2})`}><CellFigure items={items} size={cell} /></g>
          {isNope && <line x1={16} y1={cell - 16} x2={cell - 16} y2={16} stroke="#FF7A6A" strokeWidth="6" strokeLinecap="round" />}
        </svg>
        <div style={{ textAlign: "center", fontFamily: HUD, fontSize: 30, color: isPick ? AMBER : CYAN_DIM, marginTop: 10 }}>{"abcd"[i]}</div>
      </div>
    );
  });
}

// A HUD label chip.
function Chip({ x, y, text, appear = 1, color = CYAN, size = 30 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, opacity: appear, transform: `translateX(${(1 - appear) * -20}px)`,
      fontFamily: HUD, fontSize: size, letterSpacing: 3, color, padding: "8px 18px",
      border: `2px solid ${color}`, borderRadius: 8, background: "rgba(8,20,44,0.75)", whiteSpace: "nowrap",
      boxShadow: `0 0 18px ${color}55`,
    }}>{text}</div>
  );
}

// The star map: three sectors that light up as they're restored.
function StarMap({ t, restored, lightAt = -1 }) {
  return (
    <div style={{ position: "absolute", right: 90, top: 110, width: 300 }}>
      <div style={{ fontFamily: HUD, fontSize: 18, letterSpacing: 3, color: CYAN_DIM, marginBottom: 10 }}>STAR MAP</div>
      <svg width="300" height="120">
        {[0, 1, 2].map(i => {
          const done = i < restored || (i === restored && lightAt >= 0 && t >= lightAt);
          const k = i === restored && lightAt >= 0 ? pop(t, lightAt) : done ? 1 : 0;
          return (
            <g key={i} transform={`translate(${i * 100 + 50} 60)`}>
              <rect x={-42} y={-42} width={84} height={84} rx={8} fill={done ? `rgba(255,196,107,${0.25 * k})` : "rgba(20,60,90,0.4)"}
                stroke={done ? AMBER : CYAN_DIM} strokeWidth={done ? 3 : 2} strokeDasharray={done ? "none" : "8 6"} />
              {done && [0, 1, 2, 3, 4].map(j => (
                <circle key={j} cx={-26 + hash(i * 9 + j) * 52} cy={-26 + hash(i * 7 + j + 3) * 52} r={2 + hash(j + i) * 2.5} fill="#FFF3D6" opacity={k} />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// A HUD countdown ring for "your turn".
function Countdown({ t, at, seconds = 6 }) {
  if (t < at || t > at + seconds * 30 + 10) return null;
  const k = Math.min(1, (t - at) / (seconds * 30));
  const left = Math.ceil(seconds * (1 - k));
  return (
    <div style={{ position: "absolute", left: 1470, top: 700, width: 170, height: 170 }}>
      <svg width="170" height="170" viewBox="0 0 170 170">
        <circle cx="85" cy="85" r="74" fill="rgba(8,20,44,0.7)" stroke={CYAN_DIM} strokeWidth="6" />
        <circle cx="85" cy="85" r="74" fill="none" stroke={AMBER} strokeWidth="8" strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={k} transform="rotate(-90 85 85)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HUD, fontSize: 64, color: AMBER }}>
        {left > 0 ? left : ""}
      </div>
    </div>
  );
}

// ---------- The puzzles ----------
const arrow = rot => [{ kind: "arrow", rot, fill: "black", r: 0.34 }];
const SECTOR1 = [[arrow(-90), arrow(0)], [arrow(90), null]];
const SECTOR1_OPTS = [arrow(180), arrow(-90), arrow(90), arrow(0)]; // a is right

const circ = fill => [{ kind: "circle", fill, r: 0.28 }];
const tri = fill => [{ kind: "triangle", fill, r: 0.3 }];
const SECTOR2 = [
  [circ("white"), tri("white"), circ("white")],
  [tri("black"), circ("black"), tri("black")],
  [circ("striped"), tri("striped"), null],
];
const SECTOR2_OPTS = [circ("black"), tri("striped"), circ("striped"), circ("white")]; // c is right, a is the trap

const stars = (n, big) => n === 1
  ? [{ kind: "star", fill: "grey", r: big ? 0.3 : 0.16 }]
  : [{ kind: "star", fill: "grey", r: big ? 0.2 : 0.14, dx: -0.2 }, { kind: "star", fill: "grey", r: big ? 0.2 : 0.14, dx: 0.2 }];
const SECTOR3 = [[stars(1, false), stars(2, false)], [stars(1, true), null]];
const SECTOR3_OPTS = [stars(2, false), stars(1, true), stars(2, true), [...stars(2, true), { kind: "star", fill: "grey", r: 0.14, dy: -0.3 }]]; // c

// ---------- The film ----------
const G2 = { x: 420, y: 250, cell: 230 }; // 2x2 grid placement
const G3 = { x: 420, y: 200, cell: 170 }; // 3x3 grid placement

export default {
  id: "s2-space",
  order: 104,
  series: 2,
  title: "Mission to the Missing Square",
  frame: "none",
  push: 0.02,
  cast: {
    captain: { name: "CAPTAIN", voice: "bm_lewis", speed: 0.96 },
    orbit: { name: "ORBIT", voice: "af_sky", speed: 0.84 },
    bolt: { name: "BOLT", voice: "bf_lily", speed: 1.06 },
  },
  music: { src: "music/space.wav", volume: 0.34, duck: 0.45 },
  Backdrop,
  Overlay,
  Subtitles,
  scenes: [
    // Cold open: an alarm on the bridge.
    {
      beats: [
        { who: "orbit", say: "Warning. The star map is not complete. Three sectors are missing.", sfxs: [{ sfx: "space-beep", at: 0.1 }, { sfx: "space-beep", at: 0.5 }] },
        { who: "captain", say: "Missing? Without the whole map, we can't jump home!" },
        { who: "bolt", say: "Captain, look. The map is made of grids. Each missing square has to follow the pattern of the squares around it." },
        { who: "captain", say: "Then we'll find every one of them. Orbit, show us the map." },
      ],
      render: s => {
        const alarm = s.t < s.at(1) ? 0.5 + 0.5 * Math.sin(s.t / 5) : 0;
        return (
          <AbsoluteFill>
            <Bridge t={s.t} alarm={alarm} />
            <StarMap t={s.t} restored={0} />
            <div style={{
              position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: HUD, fontSize: 56, letterSpacing: 8,
              color: "#FF9A8A", opacity: window(s.t, 10, s.at(1) + 10) * (0.6 + 0.4 * Math.sin(s.t / 4)), textShadow: "0 0 24px rgba(255,120,100,0.8)",
            }}>MAP INCOMPLETE</div>
            <HoloGrid t={s.t} x={710} y={300} cell={170} appear={rise(s.t, 30, s.at(2))}
              cells={[[circ("white"), null, tri("black")], [null, tri("striped"), circ("grey")], [tri("grey"), circ("black"), null]]} />
          </AbsoluteFill>
        );
      },
    },

    // Title: the name drawn in light, stars streaking past.
    {
      beats: [{ who: "orbit", say: "Mission to the Missing Square.", sfxs: [{ sfx: "space-holo", at: 0.2 }, { sfx: "space-scan", at: 0.6, volume: 0.8 }], hold: 1.2 }],
      render: s => {
        const a = rise(s.t, 40, 8);
        return (
          <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 70 }, (_, i) => {
                const ang = hash(i) * Math.PI * 2;
                const d = ((s.t * (6 + hash(i + 1) * 8) + hash(i + 2) * 900) % 900) + 40;
                return <line key={i} x1={960 + Math.cos(ang) * d} y1={540 + Math.sin(ang) * d} x2={960 + Math.cos(ang) * (d + 40)} y2={540 + Math.sin(ang) * (d + 40)} stroke="#CFE6FF" strokeWidth="2" opacity={0.5} />;
              })}
            </svg>
            <div style={{ fontFamily: HUD, fontSize: 30, letterSpacing: 16, color: CYAN, opacity: a, marginBottom: 20 }}>A NOTHING GETS PAST ADVENTURE</div>
            <div style={{
              fontFamily: HUD, fontWeight: 700, fontSize: 104, letterSpacing: 6, color: "#EAF9FF", textAlign: "center", lineHeight: 1.1,
              textShadow: `0 0 20px ${CYAN}, 0 0 60px ${CYAN}`, clipPath: `inset(0 ${100 - a * 100}% 0 0)`,
            }}>MISSION TO THE<br />MISSING SQUARE</div>
          </AbsoluteFill>
        );
      },
    },

    // Briefing: the rule, shown on a big hologram.
    {
      beats: [
        { who: "orbit", say: "In a grid puzzle, one square is empty. All the other squares follow a pattern.", sfxs: [{ sfx: "space-holo", at: 0 }] },
        { who: "captain", say: "So first we read across the rows, like reading a book.", sfxs: [{ sfx: "space-scan", at: 0.8, volume: 0.6 }] },
        { who: "bolt", say: "Then we read down the columns, from top to bottom.", sfxs: [{ sfx: "space-scan", at: 0.6, volume: 0.6 }] },
        { who: "orbit", say: "Correct. And the missing square must fit both ways, across and down." },
      ],
      render: s => {
        const row = s.t >= s.at(1) && s.t < s.at(2) ? { i: Math.min(2, Math.floor((s.t - s.at(1)) / 30)), k: ((s.t - s.at(1)) % 30) / 30 * 1.2 } : null;
        const col = s.t >= s.at(2) && s.t < s.at(3) ? { i: Math.min(2, Math.floor((s.t - s.at(2)) / 30)), k: ((s.t - s.at(2)) % 30) / 30 * 1.2 } : null;
        return (
          <AbsoluteFill>
            <Bridge t={s.t} />
            <StarMap t={s.t} restored={0} />
            <HoloGrid t={s.t} {...G3} x={560} appear={rise(s.t, 26, 6)} scanRow={row} scanCol={col}
              cells={SECTOR2.map(r => r.map(c => c))} />
            <Chip x={1150} y={330} text="1  READ ACROSS" appear={rise(s.t, 16, s.at(1) + 10)} />
            <Chip x={1150} y={430} text="2  READ DOWN" appear={rise(s.t, 16, s.at(2) + 10)} />
            <Chip x={1150} y={530} text="3  FIT BOTH WAYS" color={AMBER} appear={rise(s.t, 16, s.at(3) + s.speech(3) * 0.5)} />
          </AbsoluteFill>
        );
      },
    },

    // Sector one: a 2x2 of turning arrows.
    {
      beats: [
        { who: "orbit", say: "This is sector one. It has four squares, and one is missing.", sfxs: [{ sfx: "space-holo", at: 0 }] },
        { who: "bolt", say: "Top row. The arrow points up, then it points right." },
        { who: "captain", say: "So going across, it turns a quarter turn, clockwise." },
        { who: "captain", say: "Now read down the left side. The arrow goes from up to down. That's a half turn." },
        { who: "bolt", say: "So along the bottom row, the down arrow turns a quarter turn clockwise... and points left!" },
        { who: "orbit", say: "Now check the right column. It goes from right to left, a half turn. So it fits both ways. Sector one is restored.", sfxs: [{ sfx: "space-confirm", at: 5.5 }] },
      ],
      render: s => {
        const row0 = window(s.t, s.at(1), s.at(3)) ? { i: 0, k: rise(s.t, 30, s.at(1) + 10) } : null;
        const col0 = s.t >= s.at(3) && s.t < s.at(4) ? { i: 0, k: rise(s.t, 30, s.at(3) + 10) } : null;
        const row1 = s.t >= s.at(4) && s.t < s.at(5) ? { i: 1, k: rise(s.t, 30, s.at(4) + 10) } : null;
        const col1 = s.t >= s.at(5) ? { i: 1, k: rise(s.t, 30, s.at(5) + 10) } : null;
        const pickAt = s.at(4) + s.speech(4) * 0.9;
        return (
          <AbsoluteFill>
            <Bridge t={s.t} />
            <StarMap t={s.t} restored={0} lightAt={s.at(5) + s.speech(5) * 0.88} />
            <HoloGrid t={s.t} {...G2} appear={rise(s.t, 24, 6)} scanRow={row0 ?? row1} scanCol={col0 ?? col1}
              cells={SECTOR1} fill fillAt={pickAt} fillItems={SECTOR1_OPTS[0]} />
            <Choices t={s.t} x={1050} y={320} cell={150} options={SECTOR1_OPTS} appearAt={30} pick={0} pickAt={pickAt} />
            <Chip x={G2.x} y={G2.y - 90} text="ACROSS: QUARTER TURN" appear={window(s.t, s.at(2) + s.speech(2) * 0.5, s.at(3) + 6)} />
            <Chip x={20} y={G2.y + 196} text="DOWN: HALF TURN" appear={window(s.t, s.at(3) + s.speech(3) * 0.65, s.at(5))} />
            <Chip x={G2.x} y={G2.y + 2 * G2.cell + 40} text="FITS BOTH WAYS" color={AMBER} appear={rise(s.t, 16, s.at(5) + s.speech(5) * 0.6)} />
          </AbsoluteFill>
        );
      },
    },

    // Sector two: a 3x3 with the trap. Right shape, wrong shading.
    {
      beats: [
        { who: "orbit", say: "This is sector two. It has nine squares.", sfxs: [{ sfx: "space-holo", at: 0 }] },
        { who: "bolt", say: "Easy! The bottom row goes circle, triangle... so it's a circle. It must be this solid one. Let's jump!" },
        { who: "orbit", say: "Negative. The shape is correct. The shading is not.", sfxs: [{ sfx: "space-nope", at: 0.1 }] },
        { who: "captain", say: "Read across properly, Bolt. Each row keeps one shading. The top row is all hollow, the middle row all solid, and the bottom row all striped." },
        { who: "captain", say: "Now read down the right-hand column. Circle, triangle, circle. So the gap needs a striped circle." },
        { who: "orbit", say: "Confirmed. It fits across, and it fits down. Sector two is restored.", sfxs: [{ sfx: "space-confirm", at: 2.6 }] },
        { who: "bolt", say: "I picked the right shape, but the wrong shading. I'll remember that." },
      ],
      render: s => {
        const sweep = i => ({ i, k: 1 });
        let row = null, col = null;
        if (s.t >= s.at(3) && s.t < s.at(4)) row = sweep(Math.min(2, Math.floor((s.t - s.at(3)) / (s.speech(3) / 3))));
        if (s.t >= s.at(4) && s.t < s.at(5)) col = { i: 2, k: rise(s.t, 40, s.at(4) + 10) };
        const nopeAt = s.at(2);
        const pickAt = s.at(4) + s.speech(4) * 0.85;
        return (
          <AbsoluteFill>
            <Bridge t={s.t} />
            <StarMap t={s.t} restored={1} lightAt={s.at(5) + s.speech(5) * 0.8} />
            <HoloGrid t={s.t} {...G3} appear={rise(s.t, 24, 6)} scanRow={row} scanCol={col}
              cells={SECTOR2} fill fillAt={pickAt} fillItems={SECTOR2_OPTS[2]} />
            <Choices t={s.t} x={1050} y={290} cell={150} options={SECTOR2_OPTS} appearAt={30} pick={2} pickAt={pickAt} nope={0} nopeAt={nopeAt} />
            <Chip x={1030} y={780} text="RIGHT SHAPE, WRONG SHADING" color="#FF9A8A" size={26} appear={window(s.t, s.at(2) + 10, s.at(4))} />
            {["HOLLOW", "SOLID", "STRIPED"].map((w, i) => (
              <Chip key={w} x={G3.x - 250} y={G3.y + i * G3.cell + 60} text={w} size={24}
                appear={window(s.t, s.at(3) + (s.speech(3) / 3) * i + 10, s.at(5))} />
            ))}
          </AbsoluteFill>
        );
      },
    },

    // Your turn: the final sector.
    {
      beats: [
        { who: "orbit", say: "This is the final sector. Captain, the whole crew is watching." },
        { who: "captain", say: "Over to you, cadet. Read across, then read down. Pause the video if you need more time.", hold: 6.5,
          sfxs: Array.from({ length: 6 }, (_, i) => ({ sfx: "space-beep", at: 5.2 + i, volume: 0.5 })) },
        { who: "captain", say: "Going across, one star becomes two stars. Going down, small stars become big stars. So the gap has two big stars. The answer is c.", sfxs: [{ sfx: "space-confirm", at: 7.7 }] },
        { who: "orbit", say: "The star map is complete." },
      ],
      render: s => {
        const pickAt = s.at(2) + s.speech(2) * 0.87;
        const row = s.t >= s.at(2) && s.t < s.at(2) + s.speech(2) * 0.35 ? { i: 0, k: rise(s.t, 30, s.at(2) + 6) } : null;
        const col = s.t >= s.at(2) + s.speech(2) * 0.35 && s.t < pickAt ? { i: 0, k: rise(s.t, 30, s.at(2) + s.speech(2) * 0.35) } : null;
        return (
          <AbsoluteFill>
            <Bridge t={s.t} />
            <StarMap t={s.t} restored={2} lightAt={s.at(3)} />
            <HoloGrid t={s.t} {...G2} appear={rise(s.t, 24, 6)} scanRow={row} scanCol={col}
              cells={SECTOR3} fill fillAt={pickAt} fillItems={SECTOR3_OPTS[2]} />
            <Choices t={s.t} x={1050} y={320} cell={150} options={SECTOR3_OPTS} appearAt={30} pick={2} pickAt={pickAt} />
            <Countdown t={s.t} at={s.at(1) + s.speech(1)} seconds={6} />
          </AbsoluteFill>
        );
      },
    },

    // The jump home.
    {
      beats: [
        { who: "orbit", say: "Jump coordinates locked. Engaging hyperdrive." },
        { who: "bolt", say: "Hold on to something!" },
        { who: "captain", say: "Read across, then read down, and check that it fits both ways. Punch it!", sfxs: [{ sfx: "space-warp", at: 2.8, volume: 0.9 }] },
        { who: "orbit", say: "Welcome home, crew. Nothing gets past you.", hold: 1.4 },
      ],
      tail: 1.5,
      render: s => {
        const go = rise(s.t, 70, s.at(2) + s.speech(2) * 0.85);
        const flash = window(s.t, s.at(3) - 12, s.at(3) + 20, 10);
        const home = rise(s.t, 30, s.at(3));
        return (
          <AbsoluteFill>
            {/* Stars stretching into light as the ship jumps. */}
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: go * (1 - home) }}>
              {Array.from({ length: 180 }, (_, i) => {
                const ang = hash(i) * Math.PI * 2;
                const d = 80 + hash(i + 1) * 900;
                const len = go * go * 900;
                return <line key={i} x1={960 + Math.cos(ang) * d} y1={540 + Math.sin(ang) * d} x2={960 + Math.cos(ang) * (d + len)} y2={540 + Math.sin(ang) * (d + len)}
                  stroke={i % 5 ? "#DDEBFF" : CYAN} strokeWidth={1.5 + go * 2} opacity={0.8} />;
              })}
            </svg>
            <AbsoluteFill style={{ background: "#FFFFFF", opacity: flash * 0.9 }} />
            {/* Home: a warm planet rising. */}
            <AbsoluteFill style={{ opacity: home }}>
              <div style={{ position: "absolute", left: 610, top: 520 - home * 60, width: 700, height: 700, borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #9FD8FF, #3A7BC8 45%, #1B3C78 75%)", boxShadow: "0 0 120px rgba(127,200,255,0.6)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", fontFamily: HUD, fontSize: 90, letterSpacing: 10, color: "#FFF3D6", textShadow: `0 0 30px ${AMBER}` }}>HOME</div>
            </AbsoluteFill>
            <div style={{ opacity: 1 - go }}>
              <Bridge t={s.t} />
              <StarMap t={s.t} restored={3} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", fontFamily: HUD, fontSize: 60, letterSpacing: 8, color: AMBER, textShadow: `0 0 24px ${AMBER}` }}>
                {s.t > s.at(0) + 30 ? "HYPERDRIVE READY" : "LOCKING COORDINATES"}
              </div>
            </div>
          </AbsoluteFill>
        );
      },
    },
  ],
};
