// Series 13, film 1: "The Story Recipe". A watercolour picture book that
// teaches the Story Builder plan: who, what, when, where, problem, solution,
// ending (the same order as shared/storyPlan.js). A seaside story is painted
// layer by layer as each ingredient goes on the recipe card.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { rise, pop, lerp } from "../lib/anim.js";

const { fontFamily: HAND } = loadCaveat("normal", { weights: ["500", "700"], subsets: ["latin"] });
const { fontFamily: SERIF } = loadFraunces("normal", { weights: ["500"], subsets: ["latin"] });
const PAPER = "#FBF6EC";
const INK = "#3B3530";

// ---------- Watercolour ----------

// Soft wobbly pigment edges, darker rims and paper grain, as SVG filters.
function Filters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <filter id="wash" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="18" result="d" />
          <feGaussianBlur in="d" stdDeviation="1.2" result="b" />
          <feComposite in="b" in2="b" operator="over" />
        </filter>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" /><feColorMatrix type="saturate" values="0" /></filter>
      </defs>
    </svg>
  );
}

// A wash of paint that blooms in: grows and darkens from wet to dry.
function Wash({ t, at, children, opacity = 0.85 }) {
  const k = rise(t, 26, at);
  if (k <= 0) return null;
  return <g filter="url(#wash)" opacity={opacity * k} style={{ mixBlendMode: "multiply" }} transform-origin="center">{children}</g>;
}

// The painting, built up in layers. `show` says when each layer appears.
function Painting({ t, show, wave = 0, rebuilt = 0 }) {
  const W = 1060, H = 760;
  return (
    <div style={{ position: "absolute", left: 90, top: 110, width: W, height: H, background: PAPER, boxShadow: "0 20px 40px rgba(60,40,20,0.25)", overflow: "hidden" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* Where: sky, sea, sand. */}
        <Wash t={t} at={show.where}>
          <rect x="-20" y="-20" width={W + 40} height="360" fill="#9CC7DD" />
          <path d={`M -20 330 Q 300 300 ${W / 2} 330 T ${W + 20} 320 L ${W + 20} 480 L -20 480 Z`} fill="#4F8FB0" />
          <path d={`M -20 470 Q 400 440 ${W + 20} 480 L ${W + 20} ${H + 20} L -20 ${H + 20} Z`} fill="#E8C98E" />
        </Wash>
        {/* When: a low morning sun and wind-blown clouds. */}
        <Wash t={t} at={show.when}>
          <circle cx="170" cy="150" r="70" fill="#F4C25B" />
          {[0, 1, 2].map(i => <ellipse key={i} cx={520 + i * 180 + Math.sin(t / 30 + i) * 12} cy={90 + i * 40} rx="110" ry="28" fill="#FFFFFF" />)}
          {[0, 1, 2].map(i => <path key={`w${i}`} d={`M ${560 + i * 40} ${200 + i * 30} q 60 -20 120 0 t 120 0`} stroke="#7AA6BF" strokeWidth="6" fill="none" />)}
        </Wash>
        {/* What: the sandcastle (swept away by the wave, then rebuilt higher up). */}
        <Wash t={t} at={show.what} opacity={0.9 * (1 - wave)}>
          <Castle x={640} y={600} />
        </Wash>
        <Wash t={t} at={show.solution} opacity={0.9 * rebuilt}>
          <Castle x={800} y={690} shells />
        </Wash>
        {/* Who: Maya and her dog. */}
        <Wash t={t} at={show.who}>
          <g transform="translate(300 610)">
            <path d="M -40 60 L -30 -60 Q 0 -80 30 -60 L 40 60 Z" fill="#D9534F" />
            <circle cx="0" cy="-100" r="42" fill="#F2C9A5" />
            <path d="M -44 -110 Q -40 -160 0 -150 Q 44 -160 46 -104 Q 20 -130 -44 -110 Z" fill="#6B3E26" />
            <rect x="-30" y="60" width="18" height="50" fill="#3B5B8C" /><rect x="12" y="60" width="18" height="50" fill="#3B5B8C" />
          </g>
          <g transform="translate(420 670)">
            <ellipse cx="0" cy="0" rx="60" ry="34" fill="#B07A45" />
            <circle cx="55" cy="-30" r="28" fill="#B07A45" />
            <ellipse cx="68" cy="-50" rx="10" ry="20" fill="#7A4E26" />
            <path d="M -58 -6 q -30 -30 -20 -50" stroke="#B07A45" strokeWidth="12" fill="none" />
          </g>
        </Wash>
        {/* Problem: the great wave. */}
        {wave > 0 && (
          <g filter="url(#wash)" opacity={0.85 * Math.min(1, wave * 1.5) * (1 - rebuilt)} style={{ mixBlendMode: "multiply" }}>
            <path d={`M ${lerp(W + 100, 300, wave)} 700 Q ${lerp(W + 150, 420, wave)} 380 ${lerp(W + 300, 620, wave)} 420 Q ${lerp(W + 380, 720, wave)} 470 ${lerp(W + 330, 660, wave)} 540 Q ${lerp(W + 500, 900, wave)} 520 ${W + 40} 700 Z`} fill="#3E7FA3" />
            <path d={`M ${lerp(W + 150, 420, wave)} 400 q 60 -30 110 10`} stroke="#FFFFFF" strokeWidth="10" fill="none" />
          </g>
        )}
        {/* Ending: a rosette and two ice creams. */}
        <Wash t={t} at={show.ending}>
          <g transform="translate(880 200)">
            {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx={Math.cos((i / 12) * Math.PI * 2) * 50} cy={Math.sin((i / 12) * Math.PI * 2) * 50} rx="28" ry="18" transform={`rotate(${(i / 12) * 360} ${Math.cos((i / 12) * Math.PI * 2) * 50} ${Math.sin((i / 12) * Math.PI * 2) * 50})`} fill="#4A7FC1" />)}
            <circle r="42" fill="#F4C25B" />
            <path d="M -20 40 L -34 130 L -6 110 L 0 140 L 10 40 Z M 20 40 L 30 130 L 8 112 L 2 140 Z" fill="#4A7FC1" />
          </g>
          {[0, 1].map(i => <g key={i} transform={`translate(${360 + i * 60} 520)`}><path d="M -18 0 L 0 60 L 18 0 Z" fill="#D9A55B" /><circle cx="0" cy="-8" r="22" fill={i ? "#F2B5C6" : "#FFF3D6"} /></g>)}
        </Wash>
      </svg>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.12, mixBlendMode: "multiply" }}><rect width={W} height={H} filter="url(#grain)" /></svg>
    </div>
  );
}

function Castle({ x, y, shells = false }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-90" y="-60" width="180" height="80" fill="#D9B06A" />
      <rect x="-110" y="-120" width="60" height="140" fill="#D9B06A" /><rect x="50" y="-120" width="60" height="140" fill="#D9B06A" />
      <rect x="-30" y="-150" width="60" height="170" fill="#CFA25A" />
      <line x1="0" y1="-150" x2="0" y2="-210" stroke={INK} strokeWidth="4" /><path d="M 0 -210 L 40 -198 L 0 -186 Z" fill="#D9534F" />
      {shells && [-80, -40, 0, 40, 80].map((sx, i) => <circle key={i} cx={sx} cy={-20} r="10" fill={i % 2 ? "#F2B5C6" : "#FFFFFF"} />)}
    </g>
  );
}

// ---------- The recipe card ----------
const SLOTS = [
  ["Who", "Maya and her dog, Biscuit"],
  ["What", "building a sandcastle for a competition"],
  ["When", "a windy Saturday morning"],
  ["Where", "the seaside"],
  ["Problem", "a huge wave washes the castle away"],
  ["Solution", "they rebuild it higher up the beach"],
  ["Ending", "they win a rosette and feel proud"],
];

function Recipe({ t, show, glow = 0 }) {
  const at = [show.who, show.what, show.when, show.where, show.problem, show.solution, show.ending];
  return (
    <div style={{ position: "absolute", left: 1200, top: 110, width: 640, height: 760, background: "#FFFDF7", boxShadow: "0 20px 40px rgba(60,40,20,0.25)", padding: "34px 40px" }}>
      <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 64, color: "#B5563D", textAlign: "center" }}>My story recipe</div>
      <div style={{ height: 3, background: "#E7D8C4", margin: "6px 0 18px" }} />
      {SLOTS.map(([label, text], i) => {
        const k = rise(t, 30, at[i]);
        const key = label === "Problem" || label === "Solution";
        return (
          <div key={label} style={{ display: "flex", gap: 16, alignItems: "baseline", minHeight: 88, borderBottom: "2px dashed #EADFCF",
            background: key ? `rgba(244,194,91,${0.3 * glow})` : "transparent", margin: "0 -16px", padding: "0 16px", borderRadius: 10 }}>
            <div style={{ fontFamily: SERIF, fontSize: 30, color: key ? "#B5563D" : "#8A7A6A", width: 150, flex: "none" }}>{label}</div>
            <div style={{ fontFamily: HAND, fontSize: 40, color: INK, lineHeight: 1.05, clipPath: `inset(0 ${100 - k * 100}% 0 0)` }}>{text}</div>
          </div>
        );
      })}
    </div>
  );
}

function Subtitles({ words, spoken, opacity }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ maxWidth: 1600, fontFamily: SERIF, fontSize: 42, lineHeight: 1.25, color: INK, textAlign: "center" }}>
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.35 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

function Backdrop() {
  return <AbsoluteFill style={{ background: "linear-gradient(#F2E8D8, #E9DCC6)" }}><Filters /></AbsoluteFill>;
}

const NEVER = 1e9;
const ALL = { who: -100, what: -100, when: -100, where: -100, problem: -100, solution: -100, ending: -100 };

export default {
  id: "s13-recipe",
  order: 1201,
  series: 13,
  title: "The Story Recipe",
  frame: "none",
  push: 0.01,
  cast: { teller: { name: "", voice: "bf_emma", speed: 0.93 } },
  music: { src: "music/recipe.wav", volume: 0.2, duck: 0.45 },
  Backdrop,
  Subtitles,
  scenes: [
    {
      beats: [
        { who: "teller", say: "Every good story is made from the same seven ingredients. Like a recipe. Let's cook one up together." },
      ],
      render: s => (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 170, color: "#B5563D", opacity: rise(s.t, 30, 10), transform: `rotate(-2deg)` }}>The Story Recipe</div>
          <div style={{ fontFamily: SERIF, fontSize: 44, color: "#8A7A6A", marginTop: 10, opacity: rise(s.t, 30, 40) }}>seven ingredients, always in the same order</div>
        </AbsoluteFill>
      ),
    },
    {
      beats: [
        { who: "teller", say: "First, who? Our story is about Maya, and her dog, Biscuit." },
        { who: "teller", say: "What are they doing? Building a sandcastle, for a competition." },
        { who: "teller", say: "When? On a windy Saturday morning." },
        { who: "teller", say: "And where? At the seaside." },
        { who: "teller", say: "Now, if we stopped here, it would just be a nice day at the beach. Nothing happens! A story needs something to go wrong." },
      ],
      render: s => {
        const show = { ...ALL, who: s.at(0) + 30, what: s.at(1) + 30, when: s.at(2) + 20, where: s.at(3) + 20, problem: NEVER, solution: NEVER, ending: NEVER };
        return <><Painting t={s.t} show={show} /><Recipe t={s.t} show={show} /></>;
      },
    },
    {
      beats: [
        { who: "teller", say: "So here comes the problem. A huge wave rolls up the beach... and washes the sandcastle away!", sfxs: [{ sfx: "recipe-wave", at: 2.4, volume: 0.7 }] },
        { who: "teller", say: "Maya could cry. Or she could give up. But good characters find a way." },
        { who: "teller", say: "Here's the solution. They rebuild the castle higher up the beach, where the waves can't reach, and decorate it with shells." },
        { who: "teller", say: "And the ending: the judges give them a rosette for the most determined builders. And ice creams all round. Maya feels proud." },
      ],
      render: s => {
        const show = { ...ALL, problem: s.at(0) + s.speech(0) * 0.35, solution: s.at(2) + s.speech(2) * 0.3, ending: s.at(3) + s.speech(3) * 0.4 };
        const wave = rise(s.t, 40, s.at(0) + s.speech(0) * 0.35);
        const rebuilt = rise(s.t, 40, s.at(2) + s.speech(2) * 0.3);
        return <><Painting t={s.t} show={show} wave={wave} rebuilt={rebuilt} /><Recipe t={s.t} show={show} /></>;
      },
    },
    {
      beats: [
        { who: "teller", say: "Look at the recipe. The problem and the solution are the heart of it. They're what make it a story." },
        { who: "teller", say: "So in the exam, before you write a single sentence, plan your recipe. And think of your problem and your solution first." },
      ],
      render: s => {
        const show = ALL;
        const glow = rise(s.t, 30, s.at(0) + 20);
        return <>
          <Painting t={s.t} show={show} wave={1} rebuilt={1} />
          <Recipe t={s.t} show={show} glow={glow} />
        </>;
      },
    },
    {
      beats: [
        { who: "teller", say: "Your turn. Here's a picnic in the park. What could go wrong? And how could it be fixed? Pause, and think of a problem and a solution.", hold: 6 },
        { who: "teller", say: "Here are two ideas. Problem: it starts to pour with rain. Solution: everyone squashes under the bandstand, and has the picnic there." },
        { who: "teller", say: "Or. Problem: a greedy goose steals the sandwiches. Solution: they trade the goose a crust for the rest back. Any idea works, as long as it has a problem and a way out." },
      ],
      render: s => {
        const k = rise(s.t, 30, 10);
        const left = Math.max(0, 6 - Math.floor(Math.max(0, s.t - s.at(0) - s.speech(0)) / 30));
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", left: 90, top: 110, width: 1060, height: 760, background: PAPER, boxShadow: "0 20px 40px rgba(60,40,20,0.25)", opacity: k, overflow: "hidden" }}>
              <svg width="1060" height="760">
                <g filter="url(#wash)" style={{ mixBlendMode: "multiply" }} opacity={0.85}>
                  <rect x="-20" y="-20" width="1100" height="420" fill="#BFDDEB" />
                  <path d="M -20 380 Q 500 330 1080 390 L 1080 780 L -20 780 Z" fill="#9BC47E" />
                  <circle cx="200" cy="330" r="110" fill="#6E9D5A" /><rect x="185" y="330" width="30" height="120" fill="#7A5A3A" />
                  <path d="M 420 560 L 780 560 L 740 680 L 380 680 Z" fill="#E36B5B" />
                  {[0, 1, 2, 3].map(i => <line key={i} x1={400 + i * 100} y1="560" x2={380 + i * 100} y2="680" stroke="#FFFFFF" strokeWidth="10" />)}
                  <circle cx="520" cy="590" r="24" fill="#F4C25B" /><rect x="600" y="575" width="70" height="30" fill="#E8D2A8" />
                </g>
              </svg>
            </div>
            <div style={{ position: "absolute", left: 1200, top: 110, width: 640, height: 760, background: "#FFFDF7", boxShadow: "0 20px 40px rgba(60,40,20,0.25)", padding: "40px", opacity: k }}>
              <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 60, color: "#B5563D" }}>Your turn</div>
              {s.t < s.at(1) && s.t > s.at(0) + s.speech(0) && <div style={{ fontFamily: SERIF, fontSize: 160, color: "#B5563D", textAlign: "center", marginTop: 120 }}>{left || ""}</div>}
              {s.t >= s.at(1) && <div style={{ fontFamily: HAND, fontSize: 42, color: INK, marginTop: 20, lineHeight: 1.15, opacity: rise(s.t, 20, s.at(1)) }}><b style={{ color: "#B5563D" }}>Problem:</b> pouring rain<br /><b style={{ color: "#B5563D" }}>Solution:</b> picnic under the bandstand</div>}
              {s.t >= s.at(2) && <div style={{ fontFamily: HAND, fontSize: 42, color: INK, marginTop: 40, lineHeight: 1.15, opacity: rise(s.t, 20, s.at(2)) }}><b style={{ color: "#B5563D" }}>Problem:</b> a greedy goose<br /><b style={{ color: "#B5563D" }}>Solution:</b> trade it a crust</div>}
            </div>
          </AbsoluteFill>
        );
      },
    },
    {
      beats: [
        { who: "teller", say: "So remember the recipe. Who. What. When. Where." },
        { who: "teller", say: "Problem. Solution. Ending." },
        { who: "teller", say: "Seven ingredients, every time. Now go and cook up a story of your own." },
      ],
      tail: 1.5,
      render: s => (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: 26, flexWrap: "wrap", justifyContent: "center", maxWidth: 1600 }}>
            {SLOTS.map(([label], i) => {
              const at = i < 4 ? s.at(0) + (i / 4) * s.speech(0) : s.at(1) + ((i - 4) / 3) * s.speech(1);
              const k = pop(s.t, at);
              const key = label === "Problem" || label === "Solution";
              return <div key={label} style={{ fontFamily: HAND, fontWeight: 700, fontSize: 90, color: key ? "#B5563D" : INK, opacity: Math.min(1, k * 2), transform: `translateY(${(1 - Math.min(1, k)) * 30}px) rotate(${(i % 2 ? 2 : -2)}deg)` }}>{label}</div>;
            })}
          </div>
        </AbsoluteFill>
      ),
    },
  ],
};
