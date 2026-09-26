// Series 2, film 6: "The Great Word Swap". A Victorian puppet theatre.
// Every word is a little marionette actor. Two actors have swapped places,
// so the sentence sounds silly; the Maestro finds them and swaps them back.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadFell } from "@remotion/google-fonts/IMFellEnglish";
import { loadFont as loadFellSC } from "@remotion/google-fonts/IMFellEnglishSC";
import { rise, pop, window, lerp } from "../lib/anim.js";

const { fontFamily: FELL } = loadFell();
const { fontFamily: FELLSC } = loadFellSC();

const VELVET = "#8E1B24";
const VELVET_DARK = "#4A0B12";
const GOLD = "#D4A94A";
const CREAM = "#F6EBD2";
const INK = "#2A1A12";

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const ease = k => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);

// Costume colours for the actors, chosen by a word's position in the script.
const COSTUMES = ["#2F6E8E", "#B5552B", "#5B7F3A", "#7A4A8C", "#C08A26", "#3D5A99", "#9C3D54", "#44807A", "#8A6A3A", "#5C6F85", "#A4583F", "#6E7F2E"];

// ---------- The theatre ----------

// The painted backdrop: a pastoral scene in gentle theatre-scenery colours.
function Backdrop({ tint = 0 }) {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#9CC3D6 0%, #CFE0D8 55%, #E9DDB8 70%)" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <circle cx="1460" cy="300" r="70" fill="#F7E3A1" opacity="0.9" />
        {[0, 1, 2].map(i => (
          <ellipse key={i} cx={420 + i * 520} cy={230 + (i % 2) * 40} rx={130} ry={34} fill="#F4F1E6" opacity={0.85} />
        ))}
        <path d="M0 640 C 300 520, 600 560, 900 610 S 1500 520, 1920 600 L1920 1080 L0 1080 Z" fill="#8FB07A" />
        <path d="M0 700 C 400 600, 800 680, 1200 650 S 1700 640, 1920 690 L1920 1080 L0 1080 Z" fill="#6E9460" />
        {[260, 620, 1540, 1720].map((x, i) => (
          <g key={i} transform={`translate(${x} ${620 + (i % 2) * 30})`}>
            <rect x={-8} y={0} width={16} height={60} fill="#6B4A2E" />
            <circle cx={0} cy={-20} r={48} fill="#557A45" />
          </g>
        ))}
      </svg>
      <AbsoluteFill style={{ background: `rgba(40,20,10,${0.18 + tint})` }} />
    </AbsoluteFill>
  );
}

// The stage floor, footlights, and the gilded proscenium with its curtains.
function Stage({ t, open = 1, lights = 1 }) {
  const glow = 0.75 + 0.06 * Math.sin(t / 5) * lights;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Boards of the stage. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, height: 320, background: "linear-gradient(#7A4F2C, #3E2615)" }}>
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: i * 140, top: 0, bottom: 0, width: 2, background: "rgba(0,0,0,0.25)" }} />
        ))}
      </div>
      {/* Footlights along the lip of the stage. */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="foot" cx="50%" cy="100%" r="80%">
            <stop offset="0%" stopColor="#FFE9B0" stopOpacity={0.55 * lights * glow} />
            <stop offset="100%" stopColor="#FFE9B0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="420" width="1920" height="380" fill="url(#foot)" />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`translate(${130 + i * 150} 790)`}>
            <path d="M-26 0 A 26 16 0 0 1 26 0 Z" fill="#E8C66A" opacity={0.35 + 0.65 * lights} />
            <rect x={-30} y={0} width={60} height={12} rx={3} fill="#5B3A1D" />
          </g>
        ))}
      </svg>
      <Curtains open={open} t={t} />
      <Proscenium />
    </AbsoluteFill>
  );
}

// Heavy red velvet curtains, drawn as folds; `open` 0 is shut, 1 is open.
function Curtains({ open, t }) {
  const half = 960 * (1 - open) + 150 * open;
  const folds = (w, flip) => Array.from({ length: 9 }, (_, i) => {
    const x = (i / 9) * w;
    return <div key={i} style={{
      position: "absolute", top: 0, bottom: 0, left: flip ? undefined : x, right: flip ? x : undefined, width: w / 9 + 2,
      background: `linear-gradient(90deg, ${VELVET_DARK}, ${VELVET} 40%, #B42A33 55%, ${VELVET} 70%, ${VELVET_DARK})`,
      transform: `skewX(${Math.sin(t / 30 + i) * 0.6}deg)`,
    }} />;
  });
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 60, width: half, height: 1020, overflow: "hidden" }}>{folds(half, false)}</div>
      <div style={{ position: "absolute", right: 0, top: 60, width: half, height: 1020, overflow: "hidden" }}>{folds(half, true)}</div>
      {/* The swagged valance across the top. */}
      <svg width="1920" height="220" style={{ position: "absolute", left: 0, top: 50 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} d={`M ${i * 240} 0 Q ${i * 240 + 120} 190 ${i * 240 + 240} 0 Z`} fill={i % 2 ? VELVET : "#A0222C"} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`g${i}`} d={`M ${i * 240} 4 Q ${i * 240 + 120} 196 ${i * 240 + 240} 4`} fill="none" stroke={GOLD} strokeWidth="5" />
        ))}
      </svg>
    </>
  );
}

// The gilded frame round the whole stage.
function Proscenium() {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <path d="M0 0 H1920 V1080 H1870 V120 Q 960 30 50 120 V1080 H0 Z" fill="#2B1510" />
      <path d="M50 1080 V120 Q 960 30 1870 120 V1080" fill="none" stroke={GOLD} strokeWidth="10" />
      <path d="M68 1080 V134 Q 960 48 1852 134 V1080" fill="none" stroke="#8C6A2A" strokeWidth="3" />
      <g transform="translate(960 58)">
        <ellipse rx="170" ry="38" fill="#2B1510" stroke={GOLD} strokeWidth="4" />
        <text textAnchor="middle" y="11" fontFamily={FELLSC} fontSize="32" fill={GOLD}>The Grand Word Theatre</text>
      </g>
    </svg>
  );
}

// Warm vignette and floating dust in the light.
function Overlay({ frame }) {
  const motes = Array.from({ length: 40 }, (_, i) => {
    const x = (hash(i) * 1920 + frame * (0.3 + hash(i + 9) * 0.6)) % 1920;
    const y = 200 + ((hash(i + 3) * 560 - frame * (0.2 + hash(i + 5) * 0.3)) % 560 + 560) % 560;
    return <circle key={i} cx={x} cy={y} r={1.5 + hash(i + 7) * 2} fill="#FFF3D0" opacity={0.25 + 0.3 * hash(i + 11)} />;
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>{motes}</svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(20,6,4,0.55) 100%)" }} />
    </AbsoluteFill>
  );
}

// Subtitles printed like lines on a theatre playbill.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{
      position: "absolute", left: 300, right: 300, bottom: 34, opacity,
      background: CREAM, border: `2px solid ${GOLD}`, borderRadius: 6, padding: "12px 30px",
      boxShadow: "0 10px 30px rgba(0,0,0,0.5)", textAlign: "center",
      fontFamily: FELL, fontSize: 40, lineHeight: 1.25,
    }}>
      {actor && <span style={{ fontFamily: FELLSC, color: "#9C1F28", fontSize: 30, marginRight: 16 }}>{actor.name}</span>}
      {words.map((w, i) => (
        <span key={i} style={{ color: i < spoken ? INK : "#B7A68A" }}>{w}{i < words.length - 1 ? " " : ""}</span>
      ))}
    </div>
  );
}

// ---------- The word actors ----------

const WORD_Y = 590;
const wordWidth = w => 25 * w.length + 62;

// x-centre of each actor for a given order, spaced to fit the stage.
function layout(words, order) {
  const gap = 26;
  const widths = order.map(id => wordWidth(words[id]));
  const total = widths.reduce((a, b) => a + b, 0) + gap * (order.length - 1);
  const scale = Math.min(1.6, 1600 / total);
  let x = 960 - (total * scale) / 2;
  const xs = {};
  order.forEach((id, i) => {
    xs[id] = x + (widths[i] * scale) / 2;
    x += (widths[i] + gap) * scale;
  });
  return { xs, scale };
}

// One marionette: strings from above, a round head, and a costume placard
// with its word written on it.
function Actor({ word, x, y, scale, colour, lit, t, i, lift = 0, squash = 0, dim = 0 }) {
  const bob = Math.sin(t / 9 + i * 1.3) * 5 * (1 - lift);
  const w = wordWidth(word) * scale;
  const h = 96 * scale;
  const top = y + bob - lift * 190;
  return (
    <g opacity={1 - dim * 0.55}>
      <line x1={x - w * 0.3} y1={0} x2={x - w * 0.3} y2={top} stroke="#E8DCC0" strokeWidth={1.4} opacity={0.6} />
      <line x1={x + w * 0.3} y1={0} x2={x + w * 0.3} y2={top} stroke="#E8DCC0" strokeWidth={1.4} opacity={0.6} />
      <line x1={x} y1={0} x2={x} y2={top - 70 * scale} stroke="#E8DCC0" strokeWidth={1.4} opacity={0.6} />
      {lit > 0 && <ellipse cx={x} cy={y + 150 * scale} rx={w * 0.7} ry={24 * scale} fill="#FFF1C4" opacity={0.5 * lit} />}
      <g transform={`translate(${x} ${top}) scale(${1 + squash * 0.15} ${1 - squash * 0.15})`}>
        {/* Head. */}
        <circle cx={0} cy={-58 * scale} r={30 * scale} fill="#F2D2B0" stroke={INK} strokeWidth={2.5} />
        <circle cx={-10 * scale} cy={-62 * scale} r={3.5 * scale} fill={INK} />
        <circle cx={10 * scale} cy={-62 * scale} r={3.5 * scale} fill={INK} />
        <path d={`M ${-10 * scale} ${-48 * scale} Q 0 ${-40 * scale} ${10 * scale} ${-48 * scale}`} fill="none" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
        {/* Costume placard. */}
        <rect x={-w / 2} y={-26 * scale} width={w} height={h} rx={14 * scale} fill={colour} stroke={lit > 0 ? "#FFE8A0" : INK} strokeWidth={lit > 0 ? 5 : 2.5} />
        <rect x={-w / 2 + 6 * scale} y={-20 * scale} width={w - 12 * scale} height={h - 12 * scale} rx={10 * scale} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
        <text x={0} y={36 * scale} textAnchor="middle" fontFamily={FELL} fontSize={50 * scale} fill={CREAM}>{word}</text>
        {/* Little legs dangling below. */}
        <line x1={-w * 0.15} y1={(h - 26) * scale} x2={-w * 0.15} y2={(h + 12) * scale} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <line x1={w * 0.15} y1={(h - 26) * scale} x2={w * 0.15} y2={(h + 12) * scale} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </g>
    </g>
  );
}

// A sentence of actors. `moves` is a list of { order, at, dur } in time
// order: from frame `at`, the actors scurry into the new `order`.
// `lit` maps actor ids to a glow; `read` sweeps a reading light along.
function Sentence({ t, words, order0, moves = [], lit = {}, read, enter = 0, dim = [] }) {
  let order = order0;
  let from = order0;
  let k = 1;
  for (const m of moves) {
    if (t >= m.at) { from = order; order = m.order; k = Math.min(1, (t - m.at) / (m.dur ?? 34)); }
  }
  const a = layout(words, from);
  const b = layout(words, order);
  const e = ease(k);
  // Only the actors whose place in the line changes hop; the rest shuffle along.
  const moving = id => from.indexOf(id) !== order.indexOf(id) && k < 1;
  // The reading light: lights each actor in current order, left to right.
  let readId = null;
  if (read && t >= read.at && t < read.at + read.dur) {
    const idx = Math.min(order.length - 1, Math.floor(((t - read.at) / read.dur) * order.length));
    readId = order[idx];
  }
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {order.map((id, i) => {
        const x = lerp(a.xs[id], b.xs[id], e);
        const lift = moving(id) ? Math.sin(Math.PI * k) : 0;
        const appear = rise(t, 18, enter + i * 4);
        return (
          <g key={id} opacity={appear} transform={`translate(0 ${(1 - appear) * -300})`}>
            <Actor word={words[id]} x={x} y={WORD_Y} scale={lerp(a.scale, b.scale, e)} colour={COSTUMES[id % COSTUMES.length]}
              lit={Math.max(lit[id] ?? 0, readId === id ? 1 : 0)} t={t} i={id} lift={lift} squash={moving(id) ? Math.abs(Math.sin(Math.PI * 4 * k)) : 0}
              dim={dim.includes(id) ? 1 : 0} />
          </g>
        );
      })}
    </svg>
  );
}

// A big spoken sentence shown on a banner above the stage.
function Banner({ text, appear, good }) {
  return (
    <div style={{
      position: "absolute", left: 260, right: 260, top: 200, opacity: appear, transform: `translateY(${(1 - appear) * -20}px)`,
      textAlign: "center", fontFamily: FELL, fontSize: 46, color: INK,
      background: good ? "#F3F0D6" : CREAM, border: `3px solid ${good ? "#6E8E3A" : GOLD}`, borderRadius: 8, padding: "10px 24px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
    }}>{text}</div>
  );
}

// A little sandglass on the stage for "your turn".
function Sandglass({ t, at, seconds = 6 }) {
  const k = Math.max(0, Math.min(1, (t - at) / (seconds * 30)));
  return (
    <svg width="160" height="220" style={{ position: "absolute", right: 170, top: 300, opacity: rise(t, 12, at) }} viewBox="-80 -110 160 220">
      <rect x={-60} y={-104} width={120} height={14} rx={4} fill="#6B4A2E" />
      <rect x={-60} y={90} width={120} height={14} rx={4} fill="#6B4A2E" />
      <path d="M-46 -90 L46 -90 L6 0 L46 90 L-46 90 L-6 0 Z" fill="rgba(255,255,255,0.25)" stroke={GOLD} strokeWidth="3" />
      <path d={`M${-40 * (1 - k)} ${-84 + 80 * k} L${40 * (1 - k)} ${-84 + 80 * k} L0 -4 Z`} fill="#E3B866" />
      <path d={`M-40 84 L40 84 L${40 - 34 * k} ${84 - 70 * k} L${-40 + 34 * k} ${84 - 70 * k} Z`} fill="#E3B866" opacity={k > 0 ? 1 : 0} />
      {k > 0 && k < 1 && <line x1="0" y1="-4" x2="0" y2="84" stroke="#E3B866" strokeWidth="3" />}
    </svg>
  );
}

// The playbill of steps, pinned up on stage.
function Playbill({ t, starts, steps }) {
  return (
    <div style={{
      position: "absolute", left: 560, top: 220, width: 800, padding: "30px 50px 20px",
      background: CREAM, border: `4px double ${GOLD}`, borderRadius: 6, boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
      opacity: rise(t, 16, starts[0] - 20), transform: `rotate(-1deg)`,
    }}>
      <div style={{ textAlign: "center", fontFamily: FELLSC, fontSize: 44, color: "#9C1F28", marginBottom: 14 }}>How to Swap Them Back</div>
      {steps.map((s, i) => {
        const k = rise(t, 16, starts[i]);
        return (
          <div key={i} style={{ display: "flex", gap: 22, alignItems: "baseline", opacity: k, transform: `translateX(${(1 - k) * -16}px)`, marginBottom: 12 }}>
            <span style={{ fontFamily: FELLSC, fontSize: 48, color: GOLD, width: 76, flex: "none" }}>{["I", "II", "III", "IV"][i]}</span>
            <span style={{ fontFamily: FELL, fontSize: 44, color: INK }}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- The scripts the actors perform ----------
// Words carry no full stop, so it never travels with a swapped word.
const S1 = "The cheese nibbled the mouse in the kitchen".split(" ");
const S1_FIXED = [0, 4, 2, 3, 1, 5, 6, 7];
const S2 = "I brushed my breakfast after eating my teeth".split(" ");
const S2_WRONG = [0, 5, 2, 3, 4, 1, 6, 7]; // Lil's idea: swap brushed and eating
const S2_FIXED = [0, 1, 2, 7, 4, 5, 6, 3];
const S3 = "The teacher put up her hand to ask the pupil a question".split(" ");
const S3_FIXED = [0, 9, 2, 3, 4, 5, 6, 7, 8, 1, 10, 11];
const ids = n => Array.from({ length: n }, (_, i) => i);
const said = (words, order) => order.map(i => words[i]).join(" ") + ".";

const swapSfx = at => [{ sfx: "theatre-slide", at, volume: 0.7 }, { sfx: "theatre-scurry", at: at + 0.1, volume: 0.8 }];

// ---------- The film ----------
export default {
  id: "s2-theatre",
  order: 106,
  series: 2,
  title: "The Great Word Swap",
  frame: "none",
  push: 0.012,
  cast: {
    maestro: { name: "The Maestro", voice: "bm_fable", speed: 0.9 },
    lil: { name: "Lil", voice: "bf_lily", speed: 1.05 },
  },
  music: { src: "music/theatre.wav", volume: 0.26, duck: 0.35 },
  Overlay,
  Subtitles,
  scenes: [
    // Overture: curtains shut, the house lights down.
    {
      beats: [
        { who: "maestro", say: "Ladies and gentlemen, boys and girls! Welcome to the Grand Word Theatre!", sfxs: [{ sfx: "theatre-applause", at: 3.8, volume: 0.6 }] },
        { who: "lil", say: "Get on with it!" },
        { who: "maestro", say: "Tonight's performance... The Great Word Swap!", voice: "Tonight's performance. The Great Word Swap!", sfxs: [{ sfx: "theatre-tada", at: 2.2, volume: 0.8 }] },
      ],
      render: s => (
        <AbsoluteFill>
          <Backdrop tint={0.3} />
          <Stage t={s.t} open={0} lights={rise(s.t, 30, 0)} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", opacity: rise(s.t, 24, s.at(2) + 20) }}>
            <div style={{ display: "inline-block", padding: "24px 70px", background: CREAM, border: `6px double ${GOLD}`, borderRadius: 10, boxShadow: "0 30px 60px rgba(0,0,0,0.6)", transform: `rotate(-1.5deg) scale(${lerp(0.8, 1, pop(s.t, s.at(2) + 20))})` }}>
              <div style={{ fontFamily: FELLSC, fontSize: 40, color: "#9C1F28" }}>Tonight's Performance</div>
              <div style={{ fontFamily: FELL, fontSize: 118, color: INK, lineHeight: 1.05 }}>The Great Word Swap</div>
              <div style={{ fontFamily: FELL, fontStyle: "italic", fontSize: 36, color: "#6B4A2E" }}>a comedy in one sentence</div>
            </div>
          </div>
        </AbsoluteFill>
      ),
    },

    // How the show works.
    {
      beats: [
        { who: "maestro", say: "In this theatre, every word is an actor, and every actor has a place in the line.", sfxs: [{ sfx: "theatre-curtain", at: 0, volume: 0.8 }] },
        { who: "maestro", say: "But tonight, disaster! Two of our actors have swapped places. And now the sentence sounds silly." },
        { who: "lil", say: "Swapped? So how do we find them?" },
      ],
      render: s => (
        <AbsoluteFill>
          <Backdrop />
          <Sentence t={s.t} words={S1} order0={ids(S1.length)} enter={30} lit={{ 1: window(s.t, s.at(1) + 40, s.at(2) + 20), 4: window(s.t, s.at(1) + 40, s.at(2) + 20) }} />
          <Stage t={s.t} open={rise(s.t, 50, 0)} />
        </AbsoluteFill>
      ),
    },

    // The secret, on a playbill.
    {
      beats: [
        { who: "maestro", say: "Here's how the finest detectives of the stage do it." },
        { who: "maestro", say: "One. Read the sentence out loud." },
        { who: "maestro", say: "Two. Listen for the silly bit, where it stops making sense." },
        { who: "maestro", say: "Three. Find the word in the wrong place, and its partner. Swap them." },
        { who: "maestro", say: "Four. Read it again, to check it makes sense." },
      ],
      render: s => (
        <AbsoluteFill>
          <Backdrop tint={0.15} />
          <Stage t={s.t} open={1} lights={0.7} />
          <Playbill t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} steps={["Read it out loud.", "Listen for the silly bit.", "Swap the two words.", "Read it again to check."]} />
        </AbsoluteFill>
      ),
    },

    // Act one: the cheese and the mouse.
    {
      beats: [
        { who: "maestro", say: "Act one! The cheese nibbled the mouse in the kitchen." },
        { who: "lil", say: "Ha! Cheese can't nibble anything. Cheese doesn't even have teeth!" },
        { who: "maestro", say: "Exactly! That's the silly bit. Mice nibble. So the cheese is standing in the mouse's place..." },
        { who: "maestro", say: "...and the mouse is standing in the cheese's place. Swap them back!", sfxs: swapSfx(2.6) },
        { who: "maestro", say: "Now read it again. The mouse nibbled the cheese in the kitchen. Perfect sense!", sfxs: [{ sfx: "theatre-tada", at: 4.6, volume: 0.7 }, { sfx: "theatre-applause", at: 4.8, volume: 0.5 }] },
      ],
      render: s => {
        const swapAt = s.at(3) + s.speech(3) * 0.62;
        return (
          <AbsoluteFill>
            <Backdrop />
            <Sentence t={s.t} words={S1} order0={ids(S1.length)} enter={0}
              read={{ at: s.at(0) + s.speech(0) * 0.25, dur: s.speech(0) * 0.7 }}
              lit={{ 1: window(s.t, s.at(1), s.at(4) + 20), 4: window(s.t, s.at(2) + s.speech(2) * 0.4, s.at(4) + 20) }}
              moves={[{ order: S1_FIXED, at: swapAt, dur: 40 }]} />
            <Banner text={said(S1, S1_FIXED)} appear={rise(s.t, 16, s.at(4) + 20)} good />
            <Stage t={s.t} open={1} />
          </AbsoluteFill>
        );
      },
    },

    // Act two: the plot twist. Lil swaps the wrong pair.
    {
      beats: [
        { who: "maestro", say: "Act two! I brushed my breakfast after eating my teeth." },
        { who: "lil", say: "Ooh, I know! Swap brushed and eating!", sfxs: swapSfx(2.0) },
        { who: "maestro", say: "Very well. Let's read it again. I eating my breakfast after brushed my teeth." },
        { who: "lil", say: "Hmm. That sounds even worse." },
        { who: "maestro", say: "That's why we always read it again! Back you go.", sfxs: swapSfx(1.8) },
        { who: "maestro", say: "The silly words are breakfast and teeth. You brush your teeth, and you eat your breakfast.", sfxs: swapSfx(4.6) },
        { who: "maestro", say: "I brushed my teeth after eating my breakfast. Bravo!", sfxs: [{ sfx: "theatre-tada", at: 3.0, volume: 0.7 }, { sfx: "theatre-applause", at: 3.2, volume: 0.55 }] },
      ],
      render: s => {
        const moves = [
          { order: S2_WRONG, at: s.at(1) + s.speech(1) * 0.7, dur: 36 },
          { order: ids(S2.length), at: s.at(4) + s.speech(4) * 0.7, dur: 36 },
          { order: S2_FIXED, at: s.at(5) + s.speech(5) * 0.85, dur: 44 },
        ];
        const wrongShown = window(s.t, s.at(2), s.at(4) + 10);
        return (
          <AbsoluteFill>
            <Backdrop />
            <Sentence t={s.t} words={S2} order0={ids(S2.length)} enter={0}
              read={s.t < s.at(1) ? { at: s.at(0) + s.speech(0) * 0.2, dur: s.speech(0) * 0.75 } : { at: s.at(2) + s.speech(2) * 0.35, dur: s.speech(2) * 0.6 }}
              lit={{ 1: window(s.t, s.at(1), s.at(2)), 5: window(s.t, s.at(1), s.at(2)), 3: window(s.t, s.at(5), s.at(6) + 30), 7: window(s.t, s.at(5), s.at(6) + 30) }}
              moves={moves} />
            <Banner text={`${said(S2, S2_WRONG)}  ✗`} appear={wrongShown} />
            <Banner text={said(S2, S2_FIXED)} appear={rise(s.t, 16, s.at(6) + 10)} good />
            <Stage t={s.t} open={1} />
          </AbsoluteFill>
        );
      },
    },

    // Your turn.
    {
      beats: [
        { who: "maestro", say: "And now, the grand finale is yours! Which two actors have swapped? Pause if you need more time.", hold: 6 },
        { who: "maestro", say: "Teacher and pupil! It's the pupil who puts up her hand, to ask the teacher a question.", sfxs: swapSfx(1.4) },
        { who: "lil", say: "The pupil put up her hand to ask the teacher a question. Bravo! Bravo!", sfxs: [{ sfx: "theatre-applause", at: 2.0, volume: 0.6 }] },
      ],
      render: s => (
        <AbsoluteFill>
          <Backdrop />
          <Sentence t={s.t} words={S3} order0={ids(S3.length)} enter={0}
            read={{ at: 20, dur: s.speech(0) * 0.5 }}
            lit={{ 1: window(s.t, s.at(1), s.at(2) + 40), 9: window(s.t, s.at(1), s.at(2) + 40) }}
            moves={[{ order: S3_FIXED, at: s.at(1) + s.speech(1) * 0.3, dur: 50 }]} />
          <Sandglass t={s.t} at={s.at(0) + s.speech(0)} seconds={6} />
          <Banner text={said(S3, S3_FIXED)} appear={rise(s.t, 16, s.at(2) + 10)} good />
          <Stage t={s.t} open={1} />
        </AbsoluteFill>
      ),
    },

    // Curtain call.
    {
      beats: [
        { who: "maestro", say: "So remember, my friends. Read it out loud, find the silly bit, swap the pair, and read it again." },
        { who: "lil", say: "Encore! Encore!" },
        { who: "maestro", say: "Goodnight, and thank you! Nothing gets past you.", sfxs: [{ sfx: "theatre-applause", at: 0.4, volume: 0.7 }, { sfx: "theatre-curtain", at: 2.0, volume: 0.7 }] },
      ],
      tail: 1.6,
      render: s => {
        const roses = Array.from({ length: 14 }, (_, i) => {
          const at = s.at(1) + i * 5;
          const k = Math.max(0, Math.min(1, (s.t - at) / 30));
          if (k <= 0) return null;
          const x = 300 + hash(i) * 1320;
          const y = lerp(-40, 760 + hash(i + 4) * 60, k * k);
          return <g key={i} transform={`translate(${x} ${y}) rotate(${hash(i + 2) * 360 + k * 200})`}>
            <line x1="0" y1="0" x2="0" y2="40" stroke="#3E6B2E" strokeWidth="4" />
            <circle r="12" fill="#C7303C" /><circle r="6" fill="#8E1B24" />
          </g>;
        });
        return (
          <AbsoluteFill>
            <Backdrop />
            <Sentence t={s.t} words={["Nothing", "gets", "past", "you"]} order0={[0, 1, 2, 3]} enter={0} lit={{ 0: 1, 1: 1, 2: 1, 3: 1 }} />
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>{roses}</svg>
            <Stage t={s.t} open={1 - rise(s.t, 60, s.at(2) + s.speech(2) * 0.6)} />
          </AbsoluteFill>
        );
      },
    },
  ],
};
