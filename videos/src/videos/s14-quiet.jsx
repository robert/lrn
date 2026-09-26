// Series 14, film 1: "Doors". A wordless film. A small round hero walks
// through four pastel rooms; each door is sealed by a picture puzzle in the
// wall. The hero tries a tempting wrong piece (it bounces off), stops to
// think while light sweeps along the clues, then the right piece clicks in
// and the door slides open. No narration and no words: only pictures,
// music and a few sounds. Timing lives entirely in this file.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Shape } from "../lib/shapes.jsx";
import { rise, lerp } from "../lib/anim.js";

const FPS = 30;
const INK = "#3A3550";
const FLOOR_Y = 780;
const hash = n => { const x = Math.sin(n * 91.3 + 7.7) * 43758.5453; return x - Math.floor(x); };
const clamp01 = v => Math.max(0, Math.min(1, v));
const ease = k => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
// Seconds-based "rise": 0 before a, 1 after a + d, smooth between.
const sr = (sec, a, d = 1) => ease(clamp01((sec - a) / d));

// ---------- Timeline (seconds) ----------
const TITLE = 8;
const ROOM_LEN = 30;
const ROOM_STARTS = [8, 38, 68, 98];
const END_START = 128;
const TOTAL = 146;
// Moments inside a room, relative to its start.
const T = { walkIn: 0, look: 3, pieces: 4, wrong: 9, bounce: 10.2, puzzled: 11, think: 13, thinkEnd: 19.5, right: 20.5, click: 21.6, open: 22.6, walkOut: 24.4, leave: 27.4 };

// ---------- The hero ----------
// A round little traveller with a scarf. Eyes look where told; blinks.
function Hero({ x, y = FLOOR_Y, sec, walking = false, look = [0, 0], tilt = 0, scale = 1, thinking = false, opacity = 1 }) {
  const step = walking ? Math.sin(sec * 9) : 0;
  const bob = walking ? Math.abs(step) * 8 : Math.sin(sec * 2) * 2;
  const blink = (sec * 10) % 37 < 1.2 ? 0.1 : 1;
  const scarf = Math.sin(sec * 5) * 8;
  return (
    <svg width="360" height="380" viewBox="-180 -330 360 380" style={{ position: "absolute", left: x - 180 * scale, top: y - 330 * scale, width: 360 * scale, height: 380 * scale, overflow: "visible", opacity }}>
      {/* A long soft shadow, cast away from the light. */}
      <ellipse cx="60" cy="8" rx="120" ry="16" fill="rgba(58,53,80,0.18)" transform="skewX(-30)" />
      <g transform={`translate(0 ${-bob}) rotate(${tilt})`}>
        {/* Feet. */}
        <ellipse cx={-26 + step * 14} cy="-6" rx="22" ry="12" fill={INK} />
        <ellipse cx={26 - step * 14} cy="-6" rx="22" ry="12" fill={INK} />
        {/* Body. */}
        <circle cx="0" cy="-86" r="78" fill="#FFF7EC" stroke={INK} strokeWidth="5" />
        {/* Scarf, fluttering behind. */}
        <path d={`M -66 -60 Q 0 -30 66 -60 L 62 -44 Q 0 -14 -62 -44 Z`} fill="#E0655A" />
        <path d={`M -58 -52 Q -110 ${-40 + scarf} -140 ${-26 - scarf}`} stroke="#E0655A" strokeWidth="18" strokeLinecap="round" fill="none" />
        {/* Eyes. */}
        {[-24, 24].map(ex => (
          <g key={ex}>
            <ellipse cx={ex} cy="-104" rx="14" ry={16 * blink} fill="#FFFFFF" stroke={INK} strokeWidth="3" />
            <circle cx={ex + look[0] * 6} cy={-104 + look[1] * 6} r={7 * blink} fill={INK} />
          </g>
        ))}
        <ellipse cx="-44" cy="-78" rx="10" ry="6" fill="#F4A9A0" opacity="0.7" />
        <ellipse cx="44" cy="-78" rx="10" ry="6" fill="#F4A9A0" opacity="0.7" />
      </g>
      {/* A thought bubble of three little dots while thinking (no words). */}
      {thinking && [0, 1, 2].map(i => (
        <circle key={i} cx={70 + i * 34} cy={-220 - i * 18} r={10 + i * 5} fill="#FFFFFF" stroke={INK} strokeWidth="3" opacity={0.4 + 0.6 * Math.abs(Math.sin(sec * 2 + i))} />
      ))}
    </svg>
  );
}

// ---------- The room ----------
const PALETTES = [
  { wall: ["#FBE3D2", "#F4CDB6"], floor: "#EFC1A5", accent: "#E0896A" },
  { wall: ["#DDF1E6", "#BFE3CF"], floor: "#B2D9C3", accent: "#5BA886" },
  { wall: ["#E7E0F6", "#D2C7EE"], floor: "#C6B9E6", accent: "#8D78C9" },
  { wall: ["#DCEAF6", "#C2D9EE"], floor: "#B4CDE6", accent: "#5E8FC0" },
];
const DOOR = { x: 1560, w: 230, h: 380 };
const PANEL = { x: 520, y: 150, w: 820, h: 270 };

function Room({ p, sec, doorOpen }) {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(${p.wall[0]}, ${p.wall[1]})` }} />
      {/* Light falling from a high window on the left. */}
      <AbsoluteFill style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.35) 0%, transparent 40%)" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {/* Floor, with gentle perspective lines. */}
        <rect x="0" y={FLOOR_Y} width="1920" height={1080 - FLOOR_Y} fill={p.floor} />
        {Array.from({ length: 13 }, (_, i) => <line key={i} x1={960 + (i - 6) * 170} y1={FLOOR_Y} x2={960 + (i - 6) * 420} y2={1080} stroke="rgba(255,255,255,0.35)" strokeWidth="2" />)}
        <line x1="0" y1={FLOOR_Y} x2="1920" y2={FLOOR_Y} stroke="rgba(58,53,80,0.25)" strokeWidth="3" />
        {/* The door: an arch, a warm light behind, a stone panel that slides up. */}
        <path d={`M ${DOOR.x - DOOR.w / 2} ${FLOOR_Y} L ${DOOR.x - DOOR.w / 2} ${FLOOR_Y - DOOR.h + DOOR.w / 2} A ${DOOR.w / 2} ${DOOR.w / 2} 0 0 1 ${DOOR.x + DOOR.w / 2} ${FLOOR_Y - DOOR.h + DOOR.w / 2} L ${DOOR.x + DOOR.w / 2} ${FLOOR_Y} Z`} fill="#FFF1C9" />
        <clipPath id="doorclip">
          <path d={`M ${DOOR.x - DOOR.w / 2} ${FLOOR_Y} L ${DOOR.x - DOOR.w / 2} ${FLOOR_Y - DOOR.h + DOOR.w / 2} A ${DOOR.w / 2} ${DOOR.w / 2} 0 0 1 ${DOOR.x + DOOR.w / 2} ${FLOOR_Y - DOOR.h + DOOR.w / 2} L ${DOOR.x + DOOR.w / 2} ${FLOOR_Y} Z`} />
        </clipPath>
        <g clipPath="url(#doorclip)">
          <rect x={DOOR.x - DOOR.w / 2} y={FLOOR_Y - DOOR.h - doorOpen * DOOR.h} width={DOOR.w} height={DOOR.h} fill={p.accent} />
          <rect x={DOOR.x - 6} y={FLOOR_Y - DOOR.h - doorOpen * DOOR.h + 40} width="12" height={DOOR.h - 80} fill="rgba(255,255,255,0.25)" />
        </g>
        <path d={`M ${DOOR.x - DOOR.w / 2 - 18} ${FLOOR_Y} L ${DOOR.x - DOOR.w / 2 - 18} ${FLOOR_Y - DOOR.h + DOOR.w / 2} A ${DOOR.w / 2 + 18} ${DOOR.w / 2 + 18} 0 0 1 ${DOOR.x + DOOR.w / 2 + 18} ${FLOOR_Y - DOOR.h + DOOR.w / 2} L ${DOOR.x + DOOR.w / 2 + 18} ${FLOOR_Y}`} fill="none" stroke="rgba(58,53,80,0.35)" strokeWidth="10" />
        {/* The light spilling out once it's open. */}
        {doorOpen > 0 && <path d={`M ${DOOR.x - DOOR.w / 2} ${FLOOR_Y} L ${DOOR.x + DOOR.w / 2} ${FLOOR_Y} L ${DOOR.x + DOOR.w / 2 - 220} 1080 L ${DOOR.x - DOOR.w / 2 - 520} 1080 Z`} fill="#FFF1C9" opacity={0.45 * doorOpen} />}
      </svg>
      {/* The puzzle panel set into the wall. */}
      <div style={{ position: "absolute", left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, borderRadius: 28, background: "rgba(255,255,255,0.55)", boxShadow: `inset 0 0 0 6px ${p.accent}55, 0 14px 30px rgba(58,53,80,0.15)` }} />
    </AbsoluteFill>
  );
}

// A tile in the wall (or a floating piece). `glow` lights it from behind.
function Tile({ x, y, size = 170, glow = 0, children, lit = 0, opacity = 1, dash = false }) {
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, opacity }}>
      {glow > 0 && <div style={{ position: "absolute", inset: -26, borderRadius: 40, background: "radial-gradient(rgba(255,236,170,0.95), rgba(255,236,170,0) 70%)", opacity: glow }} />}
      <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: dash ? "rgba(255,255,255,0.35)" : "#FFFCF6", border: dash ? `5px dashed ${INK}55` : `4px solid ${INK}33`, boxShadow: lit ? `0 0 0 6px rgba(255,210,110,${lit})` : glow > 0.05 ? `0 0 0 ${Math.round(7 * glow)}px rgba(240,180,70,${0.9 * glow}), 0 6px 12px rgba(58,53,80,0.15)` : "0 6px 12px rgba(58,53,80,0.15)" }} />
      <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>{children}</svg>
    </div>
  );
}

// ---------- The four puzzles ----------
// Each puzzle: slots (wall tile centres), what's drawn in each, which slot is
// the gap (or, for odd one out, which is odd), the two pieces, and a
// "thinking" cue drawn while the light sweeps.

const row4 = [635, 825, 1015, 1205].map(x => [x, 285]);

const P1 = { // Sequence: an arrow turns a quarter turn clockwise each tile.
  slots: row4,
  tiles: [{ kind: "arrow", rot: -90 }, { kind: "arrow", rot: 0 }, { kind: "arrow", rot: 90 }],
  gap: 3,
  wrong: { kind: "arrow", rot: -90 }, // up again: tempting, but it skips a turn
  right: { kind: "arrow", rot: 180 },
};
const P2 = { // Grid: across, white turns black; down, circle turns square.
  slots: [[810, 205], [1010, 205], [810, 355], [1010, 355]],
  tiles: [{ kind: "circle", fill: "white" }, { kind: "circle", fill: "black" }, { kind: "square", fill: "white" }],
  gap: 3,
  wrong: { kind: "circle", fill: "black" }, // right colour, wrong shape
  right: { kind: "square", fill: "black" },
  small: true,
};
const P3 = { // Odd one out: three flags only turned, one flipped over.
  slots: row4,
  tiles: [{ kind: "flag", rot: 0 }, { kind: "flag", rot: 90 }, { kind: "flag", rot: 20, flip: true }, { kind: "flag", rot: 200 }],
  odd: 2,
  wrongIndex: 3, // the upside-down one looks strangest, but it's only turned
};
const P4 = { // Analogy: small white triangle becomes big black triangle; so the circle...
  slots: row4,
  tiles: [{ kind: "triangle", fill: "white", r: 34 }, { kind: "triangle", fill: "black", r: 62 }, { kind: "circle", fill: "white", r: 34 }],
  gap: 3,
  wrong: { kind: "circle", fill: "white", r: 62 }, // grew, but forgot to turn black
  right: { kind: "circle", fill: "black", r: 62 },
};
const PUZZLES = [P1, P2, P3, P4];

// Where the two floating pieces wait, to the left of the hero.
const FLOAT = [[260, 560], [470, 520]];
const HERO_X = 760;

function PuzzleRoom({ index, sec }) {
  const P = PUZZLES[index];
  const r = sec - ROOM_STARTS[index];
  const pal = PALETTES[index];
  const doorOpen = sr(r, T.open, 1.4);
  const fade = Math.min(sr(r, 0, 0.8), 1 - sr(r, ROOM_LEN - 1.2, 1.2));

  // The hero walks in, stops, later walks to the door and through it.
  let hx = lerp(-120, HERO_X, sr(r, T.walkIn, 3));
  if (r > T.walkOut) hx = lerp(HERO_X, DOOR.x, sr(r, T.walkOut, 2.4));
  const walking = r < 3 || (r > T.walkOut && r < T.walkOut + 2.4);
  const through = sr(r, T.leave - 0.6, 1.2);

  // Where the hero looks: up at the wall, at the pieces, along the sweep.
  const thinkK = clamp01((r - T.think) / (T.thinkEnd - T.think));
  let look = [0.6, -0.9];
  if (r > T.pieces && r < T.wrong) look = [-1, -0.2];
  if (r > T.puzzled && r < T.think) look = [0, -0.3];
  if (r >= T.think && r < T.thinkEnd) look = [lerp(-0.6, 0.9, thinkK), -1];
  if (r >= T.open) look = [1, -0.3];
  const tilt = r > T.puzzled && r < T.think ? Math.sin((r - T.puzzled) * 3) * 10 : 0;

  // Sweep: which wall tile the thinking light is on right now.
  const sweepAt = i => (r >= T.think && r < T.thinkEnd ? Math.exp(-(((thinkK * (P.slots.length - 0.3)) - i) ** 2) * 2.2) : 0);

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Room p={pal} sec={sec} doorOpen={doorOpen} />
      {index === 2 ? <OddWall P={P} r={r} sweepAt={sweepAt} /> : <GapWall P={P} r={r} sweepAt={sweepAt} index={index} />}
      <Hero x={hx} sec={sec} walking={walking} look={look} tilt={tilt} thinking={r > T.think - 0.5 && r < T.thinkEnd} scale={lerp(1.25, 0.9, through)} opacity={1 - through} />
    </AbsoluteFill>
  );
}

// Puzzles with a gap: tiles in the wall, a dashed empty slot, two pieces
// floating by the hero; wrong one flies up and bounces back, right one seats.
function GapWall({ P, r, sweepAt, index }) {
  const size = P.small ? 140 : 170;
  const [gx, gy] = P.slots[P.gap];
  const appear = sr(r, T.pieces, 1);
  // Wrong piece: flies up to the gap, bounces back down, fades to the side.
  const wFly = sr(r, T.wrong, 1.2);
  const wBack = sr(r, T.bounce, 0.8);
  const wPos = [lerp(lerp(FLOAT[0][0], gx, wFly), FLOAT[0][0] - 60, wBack), lerp(lerp(FLOAT[0][1], gy + 30, wFly), FLOAT[0][1] + 60, wBack)];
  // Right piece: flies up and seats.
  const rFly = sr(r, T.right, 1.1);
  const rPos = [lerp(FLOAT[1][0], gx, rFly), lerp(FLOAT[1][1], gy, rFly)];
  const bob = i => Math.sin(r * 2 + i) * 10;
  const seated = r > T.click;
  const pieceScale = P.small ? 0.85 : 1;
  return (
    <>
      {P.slots.map(([x, y], i) => i === P.gap
        ? <Tile key={i} x={x} y={y} size={size} dash glow={sweepAt(i) * 0.6} />
        : <Tile key={i} x={x} y={y} size={size} glow={sweepAt(i)}>
            <Shape {...P.tiles[i]} r={(P.tiles[i].r ?? 52) * pieceScale} x={0} y={0} />
          </Tile>)}
      {/* The thinking cue, drawn softly over the wall. */}
      <Cue index={index} r={r} P={P} />
      {/* Wrong piece. */}
      <Tile x={wPos[0]} y={wPos[1] + (wFly > 0 ? 0 : bob(0))} size={size} opacity={appear * (1 - sr(r, T.bounce + 0.6, 0.8) * 0.65)}>
        <Shape {...P.wrong} r={(P.wrong.r ?? 52) * pieceScale} x={0} y={0} />
      </Tile>
      {/* Right piece. */}
      <Tile x={rPos[0]} y={rPos[1] + (rFly > 0 ? 0 : bob(1))} size={size} opacity={appear} lit={seated ? 1 - sr(r, T.click + 1.5, 1.5) * 0.7 : 0}>
        <Shape {...P.right} r={(P.right.r ?? 52) * pieceScale} x={0} y={0} />
      </Tile>
    </>
  );
}

// The quiet visual hint for each puzzle during the thinking sweep.
function Cue({ index, r, P }) {
  const on = sr(r, T.think, 1) * (1 - sr(r, T.thinkEnd, 1));
  if (on <= 0) return null;
  const stroke = { stroke: "#E0896A", strokeWidth: 7, fill: "none", strokeLinecap: "round" };
  if (index === 0) {
    // Little clockwise turn arrows between neighbouring tiles.
    return (
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: on }}>
        {[0, 1, 2].map(i => {
          const [x1] = P.slots[i], [x2] = P.slots[i + 1];
          const mx = (x1 + x2) / 2;
          const k = sr(r, T.think + i * 1.8, 0.8);
          return <g key={i} opacity={k}><path d={`M ${mx - 26} 130 A 30 30 0 1 1 ${mx + 26} 130`} {...stroke} /><path d={`M ${mx + 12} 118 L ${mx + 27} 132 L ${mx + 38} 114`} {...stroke} /></g>;
        })}
      </svg>
    );
  }
  if (index === 1) {
    // An arrow along the top row, then one down the left column.
    const a = sr(r, T.think + 0.5, 1.2), b = sr(r, T.think + 3.2, 1.2);
    return (
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: on }}>
        <path d={`M 740 120 L ${lerp(740, 1080, a)} 120`} {...stroke} /><path d={`M ${lerp(740, 1080, a) - 14} 106 L ${lerp(740, 1080, a)} 120 L ${lerp(740, 1080, a) - 14} 134`} {...stroke} opacity={a} />
        <path d={`M 700 150 L 700 ${lerp(150, 420, b)}`} {...stroke} /><path d={`M 686 ${lerp(150, 420, b) - 14} L 700 ${lerp(150, 420, b)} L 714 ${lerp(150, 420, b) - 14}`} {...stroke} opacity={b} />
      </svg>
    );
  }
  // Analogy: a curved "becomes" arrow from tile 1 to tile 2, then from 3 to the gap.
  const a = sr(r, T.think + 0.5, 1.2), b = sr(r, T.think + 3.5, 1.2);
  const arc = (x1, x2, k) => <path d={`M ${x1} 175 Q ${(x1 + x2) / 2} 110 ${lerp(x1, x2, k)} 175`} {...stroke} />;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: on }}>
      {arc(P.slots[0][0], P.slots[1][0], a)}
      {arc(P.slots[2][0], P.slots[3][0], b)}
    </svg>
  );
}

// Odd one out: four flags in the wall. A ghost of the first flag turns over
// each tile in turn: it fits three, never the flipped one. The hero first
// presses the upside-down flag (it sinks and pops back), then the odd one,
// which slides out and drops away.
function OddWall({ P, r, sweepAt }) {
  const size = 170;
  const wrongPress = Math.sin(clamp01((r - T.wrong) / 1.2) * Math.PI) * 18;
  const out = sr(r, T.right, 1.2);
  // Each tile gets its own turn of the ghost as the thinking light reaches it.
  const span = (T.thinkEnd - T.think) / 3;
  const ghostStart = i => T.think + (i - 1) * span;
  const ghostTurn = i => sr(r, ghostStart(i) + 0.2, span * 0.7);
  const ghostOn = i => Math.min(sr(r, ghostStart(i), 0.3), 1 - sr(r, ghostStart(i) + span - 0.2, 0.3));
  return (
    <>
      {P.slots.map(([x, y], i) => {
        const odd = i === P.odd;
        const dy = i === P.wrongIndex ? wrongPress : odd ? out * 520 : 0;
        return (
          <Tile key={i} x={x} y={y + dy} size={size} glow={sweepAt(i)} opacity={odd ? 1 - sr(r, T.right + 1, 0.6) : 1} lit={odd && r > T.right - 0.3 && r < T.right + 1 ? 1 : 0}>
            <Shape kind="flag" r={56} rot={P.tiles[i].rot} flip={!!P.tiles[i].flip} x={0} y={0} />
            {/* The turning ghost: the first flag, spun to match this tile if it can. */}
            {r > T.think && r < T.thinkEnd && i > 0 && ghostOn(i) > 0 && (
              <g opacity={0.95 * ghostOn(i)}>
                <Shape kind="flag" r={60} rot={i === P.odd ? ghostTurn(i) * 540 : lerp(0, P.tiles[i].rot, ghostTurn(i))} fill="none" ink="#E08A2E" x={0} y={0} />
              </g>
            )}
          </Tile>
        );
      })}
    </>
  );
}

// ---------- Title and ending ----------

// A symbol-only title: a door arch with a glowing keyhole, the hero peeking in.
function Title({ sec }) {
  const k = sr(sec, 0.5, 1.5);
  const out = sr(sec, TITLE - 1.2, 1.2);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#FBE3D2, #E8C9E0)", opacity: 1 - out }}>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: k }}>
        <path d="M 820 820 L 820 470 A 140 140 0 0 1 1100 470 L 1100 820 Z" fill="#8D78C9" />
        <circle cx="960" cy="560" r={26} fill="#FFF1C9" /><path d="M 945 575 L 975 575 L 985 660 L 935 660 Z" fill="#FFF1C9" />
        <circle cx="960" cy="600" r={130 + Math.sin(sec * 2) * 8} fill="#FFF1C9" opacity="0.18" />
        <line x1="600" y1="820" x2="1320" y2="820" stroke="rgba(58,53,80,0.25)" strokeWidth="4" />
      </svg>
      <Hero x={lerp(-100, 600, sr(sec, 2.5, 3))} y={820} sec={sec} walking={sec > 2.5 && sec < 5.5} look={sec > 5.5 ? [1, -0.4] : [1, 0]} />
    </AbsoluteFill>
  );
}

// The rooftop garden at sunset: plants, a bench of sky, fireflies.
function Ending({ sec }) {
  const e = sec - END_START;
  const k = sr(e, 0, 1.5);
  const dusk = sr(e, 6, 10);
  return (
    <AbsoluteFill style={{ opacity: k * (1 - sr(e, TOTAL - END_START - 2.5, 2.5)) }}>
      <AbsoluteFill style={{ background: `linear-gradient(${dusk > 0.5 ? "#3E3A6E" : "#6B5B95"}, #F2A07B 60%, #F7D08A)` }} />
      <AbsoluteFill style={{ background: "linear-gradient(#2B2850, transparent 70%)", opacity: dusk * 0.7 }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <circle cx="1350" cy={lerp(560, 700, dusk)} r="120" fill="#FFE3A3" opacity="0.95" />
        <circle cx="1350" cy={lerp(560, 700, dusk)} r="220" fill="#FFE3A3" opacity="0.18" />
        {/* Distant rooftops. */}
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 200 - 20} y={700 - hash(i) * 120} width={170} height={400} fill="#5C4A7A" opacity="0.55" />)}
        {/* The garden roof. */}
        <rect x="0" y="800" width="1920" height="280" fill="#7C6A9E" />
        <rect x="0" y="790" width="1920" height="16" fill="#9C8BC0" />
        {/* Pots and plants. */}
        {[240, 480, 1500, 1720].map((x, i) => (
          <g key={i}>
            {Array.from({ length: 5 }, (_, j) => <ellipse key={j} cx={x} cy={640} rx="18" ry="58" fill={j % 2 ? "#6FAE8C" : "#89C4A2"} transform={`rotate(${(j - 2) * 22 + Math.sin(sec + j) * 4} ${x} 700)`} />)}
            <circle cx={x} cy={600} r="16" fill={i % 2 ? "#F4A9A0" : "#FFE3A3"} />
            <path d={`M ${x - 56} 700 L ${x + 56} 700 L ${x + 42} 800 L ${x - 42} 800 Z`} fill="#E0896A" />
          </g>
        ))}
        {/* Fireflies once the sun is low. */}
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={200 + hash(i) * 1520 + Math.sin(sec * 0.7 + i) * 30} cy={400 + hash(i + 9) * 330 + Math.cos(sec * 0.9 + i) * 20} r="5" fill="#FFF3B0" opacity={dusk * (0.3 + 0.7 * Math.abs(Math.sin(sec * 1.5 + i)))} />)}
      </svg>
      {/* The hero sits and watches the sun go down. */}
      <Hero x={lerp(-120, 900, sr(e, 1, 4))} y={800} sec={sec} walking={e > 1 && e < 5} look={e > 5 ? [0.8, -0.5] : [1, 0]} />
    </AbsoluteFill>
  );
}

// ---------- Sound events (seconds) ----------
const SFX = [];
ROOM_STARTS.forEach(s => {
  SFX.push({ at: s + T.bounce, sfx: "quiet-thud" });
  SFX.push({ at: s + T.click, sfx: "quiet-click" });
  SFX.push({ at: s + T.open, sfx: "quiet-chime" });
  SFX.push({ at: s + T.open + 0.2, sfx: "quiet-slide" });
});
SFX.push({ at: END_START + 6, sfx: "quiet-chime" });

function Doors() {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  const room = ROOM_STARTS.findIndex(s => sec >= s && sec < s + ROOM_LEN);
  return (
    <AbsoluteFill style={{ background: "#FBE3D2" }}>
      <Audio src={staticFile("music/quiet.wav")} volume={0.9} />
      {SFX.map((x, i) => (
        <Sequence key={i} from={Math.round(x.at * FPS)} durationInFrames={90} layout="none">
          <Audio src={staticFile(`sfx/${x.sfx}.wav`)} volume={0.8} />
        </Sequence>
      ))}
      {sec < TITLE + 0.5 && <Title sec={sec} />}
      {room >= 0 && <PuzzleRoom index={room} sec={sec} />}
      {sec >= END_START && <Ending sec={sec} />}
    </AbsoluteFill>
  );
}

export default {
  id: "s14-quiet",
  order: 1301,
  series: 14,
  title: "Doors",
  Component: Doors,
  frames: TOTAL * FPS,
};
