// Series 2, film 5: "Planet Shapes". A hushed wildlife documentary.
// Sir Basil, a whispering naturalist, and Poppy, his field assistant, watch
// shape creatures on a dawn meadow, photograph them before and after a
// time-lapse, and go down the twelve things that can change in their notebook.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { loadFont as loadFell } from "@remotion/google-fonts/IMFellEnglish";
import { rise, pop, window, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";

// Only the Latin subsets and weights we use, so fonts load quickly.
const { fontFamily: HAND } = loadCaveat("normal", { weights: ["400", "700"], subsets: ["latin"] });
const { fontFamily: TITLE } = loadCinzel("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: FELL } = loadFell("italic", { weights: ["400"], subsets: ["latin"] });

const INK = "#3B2A1A";      // sepia notebook ink
const RUST = "#B2542A";     // "changed!" marks
const CREAM = "#F4EEDC";
const GOLD = "#E8C27A";

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const mixHex = (a, b, k) => {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(lerp(v, y[i], Math.max(0, Math.min(1, k)))).toString(16).padStart(2, "0")).join("");
};

const TWELVE = [
  "Shape", "How many", "Size", "Shading", "Rotation", "Flipped",
  "Position on screen", "In front or behind", "Line style", "Touching", "Pointing at", "Inside or outside",
];

// ---------- The habitat ----------

// Sky colours for times of day: [top, horizon].
const SKIES = {
  dawn: ["#2F3B63", "#F3B489"],
  morning: ["#79A9D1", "#F4E3C3"],
  noon: ["#6FA2D0", "#DDEBF0"],
  winter: ["#8A9BB0", "#E3E6E8"],
  dusk: ["#35295A", "#E8895A"],
};
function sky(a, b, k) {
  const [s1, s2] = [SKIES[a], SKIES[b]];
  return [mixHex(s1[0], s2[0], k), mixHex(s1[1], s2[1], k)];
}

// The meadow: sky, sun, layered hills, trees, the watering hole and blurred
// foreground grass for that long-lens, shallow depth-of-field look.
function Meadow({ t, from = "dawn", to = "dawn", k = 0, snow = 0, sunX = 1350, sunY = 430 }) {
  const [top, horizon] = sky(from, to, k);
  const grass = (side, n, seed) => Array.from({ length: n }, (_, i) => {
    const x = side === "left" ? hash(seed + i) * 520 - 40 : 1440 + hash(seed + i) * 520;
    const h = 180 + hash(seed + i * 3) * 260;
    const sway = Math.sin(t / 34 + i * 0.7) * 14;
    return <path key={i} d={`M ${x} 1090 Q ${x + sway * 0.5} ${1090 - h * 0.5} ${x + sway} ${1090 - h}`} stroke={i % 3 ? "#26401F" : "#35552A"} strokeWidth={10 + hash(seed + i * 5) * 12} fill="none" strokeLinecap="round" />;
  });
  const flakes = snow > 0 && Array.from({ length: 90 }, (_, i) => {
    const x = (hash(i * 7) * 1960 + Math.sin(t / 40 + i) * 30) % 1960;
    const y = ((hash(i * 11) * 1100 + t * (2 + hash(i) * 2.5)) % 1100);
    return <circle key={i} cx={x} cy={y} r={2 + hash(i * 3) * 4} fill="white" opacity={0.85 * snow} />;
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(${top} 0%, ${horizon} 58%, ${horizon} 100%)` }} />
      <div style={{ position: "absolute", left: sunX - 260, top: sunY - 260, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(255,240,200,0.95), rgba(255,210,150,0.35) 40%, transparent)" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <g style={{ filter: "blur(4px)" }}>
          <path d="M0 560 Q 300 470 620 530 T 1260 510 T 1920 540 L1920 1080 L0 1080Z" fill={mixHex("#9DB3A2", "#C9D2D6", snow)} />
        </g>
        <g style={{ filter: "blur(2px)" }}>
          {Array.from({ length: 9 }, (_, i) => {
            const x = 120 + i * 210 + hash(i) * 60, y = 560 + hash(i * 2) * 20, r = 28 + hash(i * 3) * 20;
            return <g key={i}><rect x={x - 4} y={y} width={8} height={r * 1.2} fill="#4B5B45" /><circle cx={x} cy={y} r={r} fill={mixHex("#5E7E57", "#B8C4C6", snow)} /></g>;
          })}
          <path d="M0 620 Q 400 570 900 610 T 1920 600 L1920 1080 L0 1080Z" fill={mixHex("#6E8F5F", "#D8DEE0", snow)} />
        </g>
        <path d="M0 690 Q 500 650 1000 680 T 1920 670 L1920 1080 L0 1080Z" fill={mixHex("#4F7045", "#E8ECEE", snow)} />
        {/* The watering hole. */}
        <ellipse cx="960" cy="800" rx="560" ry="92" fill={mixHex("#6D96A6", "#AFC3CB", snow)} />
        <ellipse cx="960" cy="792" rx="530" ry="78" fill={mixHex("#86AFBE", "#C6D5DA", snow)} opacity="0.7" />
        {Array.from({ length: 6 }, (_, i) => (
          <line key={i} x1={640 + i * 110 + Math.sin(t / 20 + i) * 20} x2={700 + i * 110 + Math.sin(t / 20 + i) * 20} y1={780 + (i % 3) * 16} y2={780 + (i % 3) * 16} stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" />
        ))}
        {flakes}
      </svg>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, filter: "blur(7px)" }}>
        {grass("left", 34, 1)}{grass("right", 34, 100)}
      </svg>
    </AbsoluteFill>
  );
}

// A shape creature: the shape plus two eyes that blink and look about, and a
// gentle breathing. Eyes turn and flip with the creature, so they show which
// way it faces. `copies` draws a little family side by side.
function Creature({ t, x, y, r = 70, kind, fill = "white", line = "solid", rot = 0, flip = false, draw = 1, copies = 1, gap = 1.5, points, opacity = 1 }) {
  const breathe = 1 + 0.018 * Math.sin(t / 22);
  const blink = hash(Math.floor(t / 50) + x) > 0.75 && t % 50 < 5 ? 0.1 : 1;
  const eyeInk = fill === "black" ? "#FFFFFF" : "#1B2A24";
  const pupil = fill === "black" ? "#1B2A24" : "#FFFFFF";
  return Array.from({ length: copies }, (_, c) => {
    const cx = x + (c - (copies - 1) / 2) * r * gap * 2 * 0.7;
    return (
      <g key={c} transform={`translate(${cx} ${y}) scale(${breathe})`} opacity={opacity}>
        <g transform={`rotate(${rot}) scale(${flip ? -1 : 1} 1)`}>
          <Shape kind={kind} r={r} fill={fill} line={line} draw={draw} points={points} />
          <g opacity={Math.max(0, (draw - 0.7) / 0.3)}>
            {[-1, 1].map(s => (
              <g key={s} transform={`translate(${s * r * 0.2 + r * 0.08} ${-r * 0.08}) scale(1 ${blink})`}>
                <circle r={r * 0.11} fill={eyeInk} />
                <circle cx={r * 0.035} r={r * 0.05} fill={pupil} />
              </g>
            ))}
          </g>
        </g>
      </g>
    );
  });
}

// ---------- Documentary chrome ----------

// Camera viewfinder over the whole film: corner brackets, REC and timecode.
function Overlay({ frame }) {
  const s = Math.floor(frame / 30), f = frame % 30;
  const tc = `06:${String(12 + Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
  const corner = (x, y, dx, dy) => <path d={`M ${x} ${y + dy * 60} L ${x} ${y} L ${x + dx * 60} ${y}`} stroke="rgba(255,255,255,0.75)" strokeWidth="3" fill="none" />;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(20,15,5,0.45) 100%)" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {corner(70, 60, 1, 1)}{corner(1850, 60, -1, 1)}{corner(70, 1020, 1, -1)}{corner(1850, 1020, -1, -1)}
        <circle cx="120" cy="104" r="11" fill="#E0442E" opacity={Math.floor(frame / 20) % 2 ? 1 : 0.25} />
      </svg>
      <div style={{ position: "absolute", left: 142, top: 88, fontFamily: "monospace", fontSize: 26, color: "rgba(255,255,255,0.85)", letterSpacing: 2 }}>REC</div>
      <div style={{ position: "absolute", right: 110, top: 88, fontFamily: "monospace", fontSize: 26, color: "rgba(255,255,255,0.85)", letterSpacing: 2 }}>{tc}</div>
      <div style={{ position: "absolute", right: 110, top: 126, fontFamily: "monospace", fontSize: 22, color: "rgba(255,255,255,0.6)", letterSpacing: 2 }}>600mm  f/5.6</div>
    </AbsoluteFill>
  );
}

// Documentary captions: italic, soft and low, with the speaker's name in gold.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{
      position: "absolute", left: 220, right: 220, bottom: 64, opacity, textAlign: "center",
      fontFamily: FELL, fontStyle: "italic", fontSize: 44, lineHeight: 1.25,
      textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)",
    }}>
      {actor && <span style={{ fontFamily: TITLE, fontStyle: "normal", fontSize: 24, letterSpacing: 4, color: GOLD, marginRight: 18 }}>{actor.name}</span>}
      {words.map((w, i) => (
        <span key={i} style={{ color: i < spoken ? "#FFFDF5" : "rgba(255,253,245,0.45)" }}>{w}{i < words.length - 1 ? " " : ""}</span>
      ))}
    </div>
  );
}

// A label that names the creature, like a documentary caption card.
function Species({ t, at, common, latin, x = 140, y = 190 }) {
  const k = rise(t, 24, at);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: k, transform: `translateX(${(1 - k) * -20}px)` }}>
      <div style={{ fontFamily: TITLE, fontSize: 40, color: "#FFFDF5", letterSpacing: 3, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>{common}</div>
      <div style={{ fontFamily: FELL, fontStyle: "italic", fontSize: 32, color: GOLD, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>{latin}</div>
    </div>
  );
}

// A fast-forward badge and a spinning clock during the time-lapse.
function TimeLapse({ t, from, to, label }) {
  const k = window(t, from, to, 8);
  const spin = ((t - from) / Math.max(1, to - from)) * 720;
  return (
    <div style={{ position: "absolute", left: 140, top: 300, opacity: k, display: "flex", alignItems: "center", gap: 18 }}>
      <svg width="84" height="84" viewBox="-42 -42 84 84">
        <circle r="38" fill="rgba(255,255,255,0.85)" stroke={INK} strokeWidth="3" />
        <line x1="0" y1="0" x2="0" y2="-26" stroke={INK} strokeWidth="4" strokeLinecap="round" transform={`rotate(${spin / 12})`} />
        <line x1="0" y1="0" x2="0" y2="-32" stroke={INK} strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${spin})`} />
      </svg>
      <div style={{ fontFamily: TITLE, fontSize: 38, color: "#FFFDF5", letterSpacing: 3, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>{label}</div>
    </div>
  );
}

// A white flash for the camera shutter.
const Flash = ({ t, at }) => <AbsoluteFill style={{ background: "white", opacity: at === undefined ? 0 : window(t, at, at + 8, 3) * 0.85 }} />;

// A polaroid photo of a creature, pinned at a jaunty angle.
function Polaroid({ t, at, x, y, w = 430, rot = -3, label, creatures, bg = ["#79A9D1", "#F4E3C3"], snow = false }) {
  const k = pop(t, at);
  if (k <= 0) return null;
  const h = w * 0.82;
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, padding: "18px 18px 70px", background: "#FBFAF5",
      boxShadow: "0 18px 40px rgba(0,0,0,0.45)", transform: `rotate(${rot}deg) scale(${lerp(1.25, 1, k)})`, opacity: Math.min(1, k * 1.5),
    }}>
      <svg width={w - 36} height={h} viewBox={`${-(w - 36) / 2} ${-h / 2} ${w - 36} ${h}`} style={{ display: "block" }}>
        <defs>
          <linearGradient id={`g${label}${x}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={bg[0]} /><stop offset="0.65" stopColor={bg[1]} /><stop offset="0.65" stopColor={snow ? "#E6EBEE" : "#6E8F5F"} /><stop offset="1" stopColor={snow ? "#D4DDE2" : "#4F7045"} />
          </linearGradient>
        </defs>
        <rect x={-(w - 36) / 2} y={-h / 2} width={w - 36} height={h} fill={`url(#g${label}${x})`} />
        {creatures}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontFamily: HAND, fontSize: 46, color: INK }}>{label}</div>
      <div style={{ position: "absolute", left: "50%", top: -14, width: 26, height: 26, marginLeft: -13, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #E57B5B, #9E3A22)", boxShadow: "0 3px 6px rgba(0,0,0,0.4)" }} />
    </div>
  );
}

// The field notebook: the twelve things in order, with pencil ticks for
// "same" and a rust ring round "changed!". marks: [{ row, kind, at }].
function Notebook({ t, x = 1110, y = 150, w = 720, title, marks = [], written = 12, writeAt = [], appear = 1, rowH = 52 }) {
  const lastMark = [...marks].filter(m => t >= m.at).pop();
  return (
    <div style={{
      position: "absolute", left: x, top: y + (1 - appear) * 60, width: w, height: 110 + rowH * 12 + 20, opacity: appear,
      background: CREAM, borderRadius: 6, transform: "rotate(1.2deg)",
      boxShadow: "0 30px 60px rgba(0,0,0,0.45), inset 0 0 60px rgba(160,130,80,0.2)",
      backgroundImage: `repeating-linear-gradient(transparent 0 ${rowH - 2}px, rgba(90,130,170,0.35) ${rowH - 2}px ${rowH}px)`,
      backgroundPosition: `0 ${110 - 6}px`,
    }}>
      <div style={{ position: "absolute", left: 92, top: 0, bottom: 0, width: 2, background: "rgba(200,70,60,0.45)" }} />
      {/* Spiral binding. */}
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: -14, top: 30 + i * 49, width: 30, height: 14, borderRadius: 7, border: "3px solid #8E8E8E", background: "transparent" }} />
      ))}
      <div style={{ position: "absolute", left: 110, top: 26, fontFamily: HAND, fontSize: 50, color: INK }}>{title}</div>
      {TWELVE.map((name, i) => {
        const shown = i < written ? (writeAt[i] !== undefined ? rise(t, 12, writeAt[i]) : 1) : 0;
        const mark = marks.find(m => m.row === i);
        const m = mark ? rise(t, 14, mark.at) : 0;
        const active = lastMark && lastMark.row === i && t < lastMark.at + 45;
        return (
          <div key={i} style={{ position: "absolute", left: 40, right: 20, top: 110 + i * rowH, height: rowH, display: "flex", alignItems: "center" }}>
            {active && <div style={{ position: "absolute", left: 50, right: 0, top: 6, bottom: 6, background: "rgba(255,226,120,0.55)", borderRadius: 4 }} />}
            <span style={{ position: "relative", width: 48, fontFamily: HAND, fontSize: 36, color: "rgba(59,42,26,0.55)", opacity: shown }}>{i + 1}</span>
            <span style={{ position: "relative", marginLeft: 30, paddingRight: 12, fontFamily: HAND, fontSize: 42, color: INK, opacity: shown, clipPath: shown < 1 ? `inset(-20% ${100 - shown * 100}% -20% 0)` : "none" }}>{name}</span>
            {mark && m > 0 && (mark.kind === "same" ? (
              <span style={{ position: "relative", marginLeft: "auto", marginRight: 30, fontFamily: HAND, fontSize: 40, color: "rgba(59,42,26,0.6)", opacity: m }}>✓ same</span>
            ) : (
              <span style={{ position: "relative", marginLeft: "auto", marginRight: 20, fontFamily: HAND, fontSize: 44, fontWeight: 700, color: RUST, opacity: m }}>
                changed!
                <svg style={{ position: "absolute", left: -16, top: -8, overflow: "visible" }} width="170" height="64">
                  <ellipse cx="82" cy="32" rx="92" ry="30" fill="none" stroke={RUST} strokeWidth="3.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - m} transform="rotate(-3 82 32)" />
                </svg>
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Sweep marks: given a list of rows and a start time and spacing, returns marks.
const sweep = (rows, kind, at, gap) => rows.map((row, i) => ({ row, kind, at: at + i * gap }));

// ---------- The film ----------
export default {
  id: "s2-nature",
  order: 105,
  series: 2,
  title: "Planet Shapes",
  frame: "none",
  push: 0.02,
  cast: {
    basil: { name: "SIR BASIL", voice: "bm_fable", speed: 0.82 },
    poppy: { name: "POPPY", voice: "bf_emma", speed: 0.94 },
  },
  music: { src: "music/nature.wav", volume: 0.3, duck: 0.45 },
  Overlay,
  Subtitles,
  scenes: [
    // Dawn over the meadow.
    {
      beats: [
        { who: "basil", say: "Dawn. On the great meadow of Planet Shapes.", sfxs: [{ sfx: "nature-meadow", at: 0, volume: 0.55 }] },
        { who: "basil", say: "Every creature here can change. A turn. A new coat. A move across the grass." },
        { who: "basil", say: "And only the sharpest eyes can say exactly what changed." },
      ],
      render: s => {
        const k = rise(s.t, s.length, 0);
        return (
          <AbsoluteFill>
            <Meadow t={s.t} from="dawn" to="morning" k={k * 0.5} sunY={lerp(560, 400, k)} />
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              <Creature t={s.t} x={520} y={660} r={46} kind="triangle" fill="white" draw={rise(s.t, 30, s.at(1) + 10)} />
              <Creature t={s.t} x={1320} y={650} r={40} kind="hexagon" fill="grey" copies={2} draw={rise(s.t, 30, s.at(1) + 30)} />
              <Creature t={s.t} x={960} y={620} r={34} kind="circle" fill="striped" draw={rise(s.t, 30, s.at(1) + 50)} />
            </svg>
          </AbsoluteFill>
        );
      },
    },

    // Title card over the meadow.
    {
      beats: [{ who: "basil", say: "Planet Shapes. Episode one. Spot the Change.", hold: 1.2, sfxs: [{ sfx: "chime", at: 0.2, volume: 0.5 }] }],
      render: s => (
        <AbsoluteFill>
          <Meadow t={s.t} from="morning" to="morning" />
          <AbsoluteFill style={{ background: "rgba(20,25,15,0.35)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", opacity: rise(s.t, 30, 5) }}>
            <div style={{ fontFamily: TITLE, fontSize: 150, letterSpacing: 18, color: "#FFFDF5", textShadow: "0 6px 40px rgba(0,0,0,0.5)" }}>PLANET SHAPES</div>
            <div style={{ width: rise(s.t, 40, 20) * 520, height: 2, background: GOLD, margin: "14px auto 20px" }} />
            <div style={{ fontFamily: FELL, fontStyle: "italic", fontSize: 50, color: GOLD, opacity: rise(s.t, 30, 35) }}>Episode one: Spot the Change</div>
          </div>
        </AbsoluteFill>
      ),
    },

    // The notebook: the twelve things, three lines of four.
    {
      beats: [
        { who: "poppy", say: "Sir Basil, what exactly are we looking for?" },
        { who: "basil", say: "Twelve things. Always in the same order. Shape. How many. Size. Shading.", sfxs: [{ sfx: "nature-pencil", at: 2.6 }] },
        { who: "basil", say: "Rotation. Flipped. Position on screen. In front or behind." },
        { who: "basil", say: "Line style. Touching. Pointing at. Inside or outside." },
        { who: "poppy", say: "Three lines of four. I'll write them down." },
      ],
      render: s => {
        const writeAt = [
          ...[0.3, 0.45, 0.6, 0.78].map(f => s.at(1) + s.speech(1) * f),
          ...[0.05, 0.28, 0.5, 0.75].map(f => s.at(2) + s.speech(2) * f),
          ...[0.05, 0.3, 0.52, 0.75].map(f => s.at(3) + s.speech(3) * f),
        ];
        return (
          <AbsoluteFill>
            <Meadow t={s.t} from="morning" to="morning" />
            <AbsoluteFill style={{ background: "rgba(20,25,15,0.3)", filter: "blur(2px)" }} />
            <Notebook t={s.t} x={600} y={70} w={720} title="The twelve things" written={12} writeAt={writeAt} appear={rise(s.t, 24, 6)} rowH={62} />
            {/* Brackets grouping the three lines of four. */}
            {[0, 1, 2].map(g => (
              <div key={g} style={{
                position: "absolute", left: 1350, top: 70 + 110 + g * 4 * 62 + 8, height: 4 * 62 - 16, width: 30,
                borderTop: `3px solid ${RUST}`, borderRight: `3px solid ${RUST}`, borderBottom: `3px solid ${RUST}`, borderRadius: "0 12px 12px 0",
                opacity: rise(s.t, 16, s.at(4) + g * 10),
              }}>
                <div style={{ position: "absolute", left: 44, top: "50%", transform: "translateY(-50%)", fontFamily: HAND, fontSize: 44, color: "#FFFDF5", whiteSpace: "nowrap", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>four</div>
              </div>
            ))}
          </AbsoluteFill>
        );
      },
    },

    // Encounter one: the common triangle, before and after an hour.
    {
      beats: [
        { who: "basil", say: "There, by the water. The common triangle. Quite shy.", sfxs: [{ sfx: "nature-rustle", at: 0.6, volume: 0.7 }] },
        { who: "poppy", say: "I'll take a photo. Before.", sfxs: [{ sfx: "nature-shutter", at: 1.2 }] },
        { who: "basil", say: "Now we wait. One whole hour, in the blink of an eye.", hold: 1.2 },
        { who: "poppy", say: "And after!", sfxs: [{ sfx: "nature-shutter", at: 0.5 }] },
      ],
      render: s => {
        const lapse = rise(s.t, s.speech(2) + 36, s.at(2) + 20);
        const shadeK = rise(s.t, 12, s.at(2) + 20 + (s.speech(2) + 36) * 0.5);
        const shutter1 = s.at(1) + 36, shutter2 = s.at(3) + 15;
        return (
          <AbsoluteFill>
            <Meadow t={s.t} from="morning" to="noon" k={lapse} sunX={lerp(1350, 700, lapse)} sunY={lerp(400, 240, lapse)} />
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              <Creature t={s.t} x={760} y={640} r={80} kind="triangle" fill="white" rot={lerp(0, 90, lapse)} draw={rise(s.t, 30, 20)} opacity={1 - shadeK} />
              <Creature t={s.t} x={760} y={640} r={80} kind="triangle" fill="black" rot={lerp(0, 90, lapse)} opacity={shadeK} />
            </svg>
            <Species t={s.t} at={40} common="The Common Triangle" latin="Triangulus vulgaris" />
            <TimeLapse t={s.t} from={s.at(2) + 20} to={s.at(2) + s.speech(2) + 56} label="One hour later..." />
            <Flash t={s.t} at={s.t >= shutter2 ? shutter2 : shutter1} />
            <Polaroid t={s.t} at={shutter1 + 4} x={1380} y={190} w={340} rot={4} label="before"
              creatures={<g transform="rotate(0)"><Shape kind="triangle" r={80} fill="white" /></g>} />
            <Polaroid t={s.t} at={shutter2 + 4} x={1400} y={560} w={340} rot={-3} label="after" bg={["#6FA2D0", "#DDEBF0"]}
              creatures={<g transform="rotate(90)"><Shape kind="triangle" r={80} fill="black" /></g>} />
          </AbsoluteFill>
        );
      },
    },

    // Comparing the two photos, down the list.
    {
      beats: [
        { who: "basil", say: "Now, down the list. Shape, the same. How many, the same. Size, the same." },
        { who: "basil", say: "Shading. Different! It was pale. Now it is dark.", sfxs: [{ sfx: "nature-pencil", at: 1.2 }] },
        { who: "basil", say: "Rotation. Different too. It has turned to face the water.", sfxs: [{ sfx: "nature-pencil", at: 1.4 }] },
        { who: "basil", say: "Flipped, position, and everything else. The same." },
        { who: "poppy", say: "Two changes. Shading, and rotation!", sfxs: [{ sfx: "chime", at: 1.4, volume: 0.5 }] },
      ],
      render: s => {
        const marks = [
          ...sweep([0, 1, 2], "same", s.at(0) + s.speech(0) * 0.33, s.speech(0) * 0.25),
          { row: 3, kind: "diff", at: s.at(1) + s.speech(1) * 0.3 },
          { row: 4, kind: "diff", at: s.at(2) + s.speech(2) * 0.3 },
          ...sweep([5, 6, 7, 8, 9, 10, 11], "same", s.at(3) + s.speech(3) * 0.1, s.speech(3) * 0.12),
        ];
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", inset: 0, filter: "blur(10px) brightness(0.7)" }}><Meadow t={s.t} from="noon" to="noon" /></div>
            <Polaroid t={s.t} at={2} x={130} y={140} w={420} rot={-4} label="before"
              creatures={<Shape kind="triangle" r={84} fill="white" />} />
            <Polaroid t={s.t} at={8} x={560} y={180} w={420} rot={3} label="after" bg={["#6FA2D0", "#DDEBF0"]}
              creatures={<g transform="rotate(90)"><Shape kind="triangle" r={84} fill="black" /></g>} />
            <Notebook t={s.t} title="Triangulus vulgaris" marks={marks} appear={rise(s.t, 20, 4)} />
          </AbsoluteFill>
        );
      },
    },

    // Encounter two: a family of hexagons through the turn of the season.
    {
      beats: [
        { who: "basil", say: "Ah. A family of speckled hexagons, settling in for the winter.", sfxs: [{ sfx: "nature-rustle", at: 0.4, volume: 0.6 }] },
        { who: "poppy", say: "Before.", sfxs: [{ sfx: "nature-shutter", at: 0.4 }] },
        { who: "basil", say: "And as the season turns... the snow comes. And something wonderful happens.", hold: 1.4 },
        { who: "poppy", say: "After! Oh, there's a baby!", sfxs: [{ sfx: "nature-shutter", at: 0.3 }] },
      ],
      render: s => {
        const lapse = rise(s.t, s.speech(2) + 42, s.at(2) + 10);
        const born = rise(s.t, 24, s.at(2) + (s.speech(2) + 42) * 0.65);
        const coat = rise(s.t, 20, s.at(2) + (s.speech(2) + 42) * 0.45);
        const shutter1 = s.at(1) + 12, shutter2 = s.at(3) + 9;
        return (
          <AbsoluteFill>
            <Meadow t={s.t} from="morning" to="winter" k={lapse} snow={lapse} sunY={lerp(400, 520, lapse)} />
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              {/* Two parents; their solid coats give way to dotted winter coats. */}
              <g opacity={1 - coat}><Creature t={s.t} x={760} y={640} r={62} kind="hexagon" fill="grey" copies={2} gap={1.35} draw={rise(s.t, 30, 20)} /></g>
              <g opacity={coat}><Creature t={s.t} x={760} y={640} r={62} kind="hexagon" fill="grey" line="dotted" copies={2} gap={1.35} /></g>
              <g opacity={born} transform={`translate(0 ${(1 - born) * 20})`}>
                <Creature t={s.t} x={760 + 62 * 1.35 * 2 * 0.7 * 1.5} y={640} r={62} kind="hexagon" fill="grey" line="dotted" />
              </g>
            </svg>
            <Species t={s.t} at={40} common="The Speckled Hexagon" latin="Hexagonus hibernus" />
            <TimeLapse t={s.t} from={s.at(2) + 10} to={s.at(2) + s.speech(2) + 52} label="One season later..." />
            <Flash t={s.t} at={s.t >= shutter2 ? shutter2 : shutter1} />
          </AbsoluteFill>
        );
      },
    },

    // Comparing the hexagon family.
    {
      beats: [
        { who: "basil", say: "How many. Different. Two became three.", sfxs: [{ sfx: "nature-pencil", at: 1.2 }] },
        { who: "basil", say: "And look at their coats. Line style. Different. Their solid lines have turned to dots, for winter.", sfxs: [{ sfx: "nature-pencil", at: 2.8 }] },
        { who: "poppy", say: "And everything else stayed just the same." },
      ],
      render: s => {
        const marks = [
          { row: 0, kind: "same", at: s.at(0) },
          { row: 1, kind: "diff", at: s.at(0) + s.speech(0) * 0.3 },
          ...sweep([2, 3, 4, 5, 6, 7], "same", s.at(0) + s.speech(0) * 0.7, 4),
          { row: 8, kind: "diff", at: s.at(1) + s.speech(1) * 0.45 },
          ...sweep([9, 10, 11], "same", s.at(2) + s.speech(2) * 0.3, s.speech(2) * 0.2),
        ];
        const hexes = (dotted, n) => Array.from({ length: n }, (_, i) => (
          <Shape key={i} kind="hexagon" r={44} fill="grey" line={dotted ? "dotted" : "solid"} x={(i - (n - 1) / 2) * 100} y={30} />
        ));
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", inset: 0, filter: "blur(10px) brightness(0.7)" }}><Meadow t={s.t} from="winter" to="winter" snow={1} /></div>
            <Polaroid t={s.t} at={2} x={130} y={140} w={420} rot={-4} label="before" creatures={hexes(false, 2)} />
            <Polaroid t={s.t} at={8} x={560} y={180} w={420} rot={3} label="after" bg={SKIES.winter} snow creatures={hexes(true, 3)} />
            <Notebook t={s.t} title="Hexagonus hibernus" marks={marks} appear={rise(s.t, 20, 4)} />
          </AbsoluteFill>
        );
      },
    },

    // Encounter three: the rare mirror flag, with its reflection in the pond.
    {
      beats: [
        { who: "basil", say: "And now... something very rare indeed. The mirror flag.", sfxs: [{ sfx: "nature-rustle", at: 0.5, volume: 0.6 }] },
        { who: "poppy", say: "Before.", sfxs: [{ sfx: "nature-shutter", at: 0.4 }] },
        { who: "basil", say: "Watch it very closely.", hold: 1.6 },
        { who: "poppy", say: "After. Oh, it's just turned round, hasn't it?", sfxs: [{ sfx: "nature-shutter", at: 0.3 }] },
      ],
      render: s => {
        const flip = rise(s.t, 26, s.at(2) + s.speech(2) + 10);
        const shutter1 = s.at(1) + 12, shutter2 = s.at(3) + 9;
        const sx = lerp(1, -1, flip);
        return (
          <AbsoluteFill>
            <Meadow t={s.t} from="noon" to="dusk" k={rise(s.t, s.length, 0) * 0.6} />
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              <defs><clipPath id="pond"><ellipse cx="960" cy="800" rx="530" ry="80" /></clipPath></defs>
              <g transform={`translate(960 640) scale(${sx} 1) translate(-960 -640)`}>
                <Creature t={s.t} x={960} y={640} r={90} kind="flag" fill="white" draw={rise(s.t, 30, 20)} />
              </g>
              {/* Its reflection in the still water. */}
              <g clipPath="url(#pond)" opacity="0.45">
                <g transform={`translate(960 ${640 + 2 * 95}) scale(${sx} -0.55) translate(-960 -640)`}>
                  <Creature t={s.t} x={960} y={640} r={90} kind="flag" fill="white" />
                </g>
              </g>
            </svg>
            <Species t={s.t} at={40} common="The Mirror Flag" latin="Vexillum speculum" />
            <div style={{ position: "absolute", left: 140, top: 300, fontFamily: FELL, fontStyle: "italic", fontSize: 34, color: GOLD, opacity: rise(s.t, 20, 60) }}>extremely rare</div>
            <Flash t={s.t} at={s.t >= shutter2 ? shutter2 : shutter1} />
          </AbsoluteFill>
        );
      },
    },

    // The mirror flag, compared: turning never matches; flipping does.
    {
      beats: [
        { who: "basil", say: "Has it? Let us try turning the old photograph, to see if it matches." },
        { who: "basil", say: "All the way round... and it never matches. So it has not simply turned.", sfxs: [{ sfx: "nature-pencil", at: 3.6 }] },
        { who: "basil", say: "But hold it up to the water, like a reflection... and there. A mirror image. It has flipped.", sfxs: [{ sfx: "nature-pencil", at: 4.6 }, { sfx: "chime", at: 4.8, volume: 0.5 }] },
        { who: "poppy", say: "Rotation, the same. Flipped, different! The rarest change of all." },
      ],
      render: s => {
        const turn = rise(s.t, s.speech(0) + s.speech(1) * 0.6, s.at(0) + s.speech(0) * 0.5) * 360;
        const flip = rise(s.t, 30, s.at(2) + s.speech(2) * 0.55);
        const matched = flip > 0.95;
        const marks = [
          ...sweep([0, 1, 2, 3], "same", s.at(1) + s.speech(1) * 0.6, 5),
          { row: 4, kind: "same", at: s.at(1) + s.speech(1) * 0.85 },
          { row: 5, kind: "diff", at: s.at(2) + s.speech(2) * 0.72 },
          ...sweep([6, 7, 8, 9, 10, 11], "same", s.at(3) + s.speech(3) * 0.5, 5),
        ];
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", inset: 0, filter: "blur(10px) brightness(0.65)" }}><Meadow t={s.t} from="dusk" to="dusk" k={0} /></div>
            <Polaroid t={s.t} at={2} x={180} y={150} w={560} rot={-2} label="after" bg={SKIES.dusk}
              creatures={<>
                <g transform="scale(-1 1)"><Shape kind="flag" r={100} fill="white" /></g>
                {/* The old photo's flag, held over it as a gilt ghost that turns, then flips. */}
                <g transform={`rotate(${turn}) scale(${lerp(1, -1, flip)} 1)`} opacity={s.t > 10 ? 0.9 : 0}>
                  <Shape kind="flag" r={100} fill="none" line="dashed" ink={matched ? "#2F8F4E" : RUST} />
                  <Shape kind="flag" r={101.5} fill="none" line="dashed" ink={matched ? "#2F8F4E" : RUST} />
                </g>
              </>} />
            <div style={{ position: "absolute", left: 180, top: 730, width: 560, textAlign: "center", fontFamily: HAND, fontSize: 60, color: matched ? "#BDF0C8" : "#FFD9C4", textShadow: "0 2px 8px rgba(0,0,0,0.6)", opacity: rise(s.t, 12, s.at(0) + 30) }}>
              {matched ? "a perfect match!" : "no match..."}
            </div>
            <div style={{ position: "absolute", left: 180, top: 812, width: 560, textAlign: "center", fontFamily: FELL, fontStyle: "italic", fontSize: 32, color: "rgba(255,253,245,0.85)", opacity: rise(s.t, 12, s.at(0) + 30) }}>
              dashed: the "before" photo
            </div>
            <Notebook t={s.t} title="Vexillum speculum" marks={marks} appear={rise(s.t, 20, 4)} />
          </AbsoluteFill>
        );
      },
    },

    // Your turn: the lesser star.
    {
      beats: [
        { who: "basil", say: "Your turn, young naturalist. The lesser star, before, and after. Go down the list. What changed? Pause if you would like more time.", hold: 7,
          sfxs: Array.from({ length: 7 }, (_, i) => ({ sfx: "nature-pencil", at: 9.2 + i, volume: 0.5 })) },
        { who: "basil", say: "Size. Different, it has grown. And position on screen. Different. It has climbed up to the top corner.", sfxs: [{ sfx: "chime", at: 4.6, volume: 0.5 }] },
        { who: "poppy", say: "And everything else, exactly the same. Nothing gets past us!" },
      ],
      render: s => {
        const reveal = s.at(1);
        const marks = [
          ...sweep([0, 1], "same", reveal + 4, 5),
          { row: 2, kind: "diff", at: reveal + s.speech(1) * 0.18 },
          ...sweep([3, 4, 5], "same", reveal + s.speech(1) * 0.35, 5),
          { row: 6, kind: "diff", at: reveal + s.speech(1) * 0.6 },
          ...sweep([7, 8, 9, 10, 11], "same", s.at(2) + s.speech(2) * 0.15, 5),
        ];
        const waiting = s.t >= s.at(0) + s.speech(0) && s.t < s.at(1);
        const left = Math.max(0, 7 - Math.floor((s.t - s.at(0) - s.speech(0)) / 30));
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", inset: 0, filter: "blur(10px) brightness(0.7)" }}><Meadow t={s.t} from="dusk" to="dusk" /></div>
            <Polaroid t={s.t} at={4} x={120} y={140} w={420} rot={-4} label="before" bg={SKIES.dusk}
              creatures={<Shape kind="star" r={40} fill="grey" x={-90} y={60} />} />
            <Polaroid t={s.t} at={14} x={560} y={180} w={420} rot={3} label="after" bg={SKIES.dusk}
              creatures={<Shape kind="star" r={78} fill="grey" x={60} y={-40} />} />
            <Notebook t={s.t} title="Stella minor" marks={marks} appear={rise(s.t, 20, 4)} />
            {waiting && (
              <div style={{ position: "absolute", left: 520, top: 700, fontFamily: HAND, fontSize: 110, color: "#FFFDF5", textShadow: "0 3px 12px rgba(0,0,0,0.7)" }}>
                {left > 0 ? left : ""}
              </div>
            )}
          </AbsoluteFill>
        );
      },
    },

    // Sunset: the lesson, and good night.
    {
      beats: [
        { who: "basil", say: "Twelve things. Always in order. Go slowly, and say what changed, and what did not." },
        { who: "poppy", say: "Because nothing gets past us." },
        { who: "basil", say: "Planet Shapes. Good night.", sfxs: [{ sfx: "chime", at: 0.6, volume: 0.5 }] },
      ],
      tail: 2,
      render: s => {
        const k = rise(s.t, s.length, 0);
        return (
          <AbsoluteFill>
            <Meadow t={s.t} from="dusk" to="dusk" sunY={lerp(560, 700, k)} sunX={1100} />
            <AbsoluteFill style={{ background: `rgba(10,8,25,${0.2 + 0.4 * k})` }} />
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              <Creature t={s.t} x={560} y={660} r={50} kind="triangle" fill="black" rot={90} />
              <Creature t={s.t} x={1200} y={660} r={40} kind="hexagon" fill="grey" line="dotted" copies={3} gap={1.3} />
              <Creature t={s.t} x={900} y={650} r={46} kind="flag" fill="white" flip />
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", opacity: rise(s.t, 30, s.at(2)) }}>
              <div style={{ fontFamily: TITLE, fontSize: 110, letterSpacing: 14, color: "#FFFDF5", textShadow: "0 6px 30px rgba(0,0,0,0.5)" }}>PLANET SHAPES</div>
              <div style={{ fontFamily: FELL, fontStyle: "italic", fontSize: 46, color: GOLD, marginTop: 10 }}>where nothing gets past you</div>
            </div>
          </AbsoluteFill>
        );
      },
    },
  ],
};
