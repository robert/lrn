// Series 2, film 7: "The Great Balance Bake-Off". A TV baking show.
// Two presenters in a marquee tent use brass balance scales to solve
// "weighs as much as" puzzles, by swapping bakes for what they equal.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { loadFont as loadPacifico } from "@remotion/google-fonts/Pacifico";
import { rise, pop, window, lerp } from "../lib/anim.js";

const { fontFamily: ROUND } = loadFredoka();
const { fontFamily: SCRIPT } = loadPacifico();

const MINT = "#CFEBDD";
const PINK = "#F4B8C5";
const CREAM = "#FFF8EC";
const BRASS = "#C9973A";
const BRASS_LIGHT = "#F0CE7A";
const INK = "#4A3226";
const BERRY = "#C23B5A";

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- The bakes ----------
// Each bake is drawn around (0, 0) sitting on its base, with a weight in
// cookie units used only to tip the scales convincingly.
const BAKES = {
  cookie: { w: 64, weight: 1, draw: () => (
    <g>
      <ellipse cx={0} cy={-12} rx={30} ry={12} fill="#D9A45B" stroke={INK} strokeWidth={2.5} />
      {[[-12, -14], [8, -10], [14, -16], [-2, -8]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#5A3A22" />)}
    </g>
  ) },
  cupcake: { w: 70, weight: 2, draw: () => (
    <g>
      <path d="M-24 -40 L24 -40 L17 0 L-17 0 Z" fill={PINK} stroke={INK} strokeWidth={2.5} />
      {[-12, 0, 12].map(x => <line key={x} x1={x} y1={-38} x2={x * 0.7} y2={-2} stroke={INK} strokeWidth={1.5} opacity={0.4} />)}
      <path d="M-28 -40 C -34 -62, -10 -58, -8 -66 C -4 -82, 16 -76, 14 -62 C 32 -62, 34 -44, 28 -40 Z" fill={CREAM} stroke={INK} strokeWidth={2.5} />
      <circle cx={4} cy={-78} r={7} fill={BERRY} stroke={INK} strokeWidth={2} />
    </g>
  ) },
  doughnut: { w: 88, weight: 4, draw: () => (
    <g>
      <ellipse cx={0} cy={-22} rx={40} ry={22} fill="#C98A4A" stroke={INK} strokeWidth={2.5} />
      <path d="M-36 -26 C -30 -48, 30 -48, 36 -26 C 30 -18, 20 -26, 12 -20 C 0 -14, -14 -24, -24 -18 C -30 -16, -34 -20, -36 -26 Z" fill={PINK} stroke={INK} strokeWidth={2} />
      <ellipse cx={0} cy={-30} rx={11} ry={6} fill="#8A5A30" stroke={INK} strokeWidth={2} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-26 + hash(i) * 50} y={-40 + hash(i + 3) * 12} width={7} height={2.6} rx={1.3}
          fill={["#6FB7D9", "#F7D358", "#FFFFFF", "#8BC98B"][i % 4]} transform={`rotate(${hash(i + 7) * 180} ${-24 + hash(i) * 50} ${-38 + hash(i + 3) * 12})`} />
      ))}
    </g>
  ) },
  pie: { w: 130, weight: 12, draw: () => (
    <g>
      <path d="M-62 -22 L62 -22 L52 0 L-52 0 Z" fill="#B7C9D6" stroke={INK} strokeWidth={2.5} />
      <ellipse cx={0} cy={-24} rx={62} ry={18} fill="#E0A94F" stroke={INK} strokeWidth={2.5} />
      {[-36, -12, 12, 36].map(x => <line key={x} x1={x} y1={-38} x2={x} y2={-10} stroke="#B97A2E" strokeWidth={5} strokeLinecap="round" />)}
      {[-10, 2].map(y => <line key={y} x1={-52} y1={y - 22} x2={52} y2={y - 22} stroke="#B97A2E" strokeWidth={5} strokeLinecap="round" />)}
    </g>
  ) },
  cake: { w: 140, weight: 12, draw: () => (
    <g>
      <rect x={-64} y={-8} width={128} height={8} rx={4} fill="#E8E2D6" stroke={INK} strokeWidth={2} />
      <rect x={-54} y={-84} width={108} height={78} rx={8} fill="#F6D7A7" stroke={INK} strokeWidth={2.5} />
      <line x1={-54} y1={-46} x2={54} y2={-46} stroke={BERRY} strokeWidth={6} />
      <path d="M-54 -76 C -40 -96, 40 -96, 54 -76 L54 -66 C 44 -58, 38 -70, 30 -60 C 20 -50, 12 -66, 2 -58 C -8 -50, -16 -66, -26 -58 C -36 -50, -44 -64, -54 -60 Z" fill={CREAM} stroke={INK} strokeWidth={2.5} />
      {[-30, 0, 30].map(x => <circle key={x} cx={x} cy={-90} r={8} fill={BERRY} stroke={INK} strokeWidth={2} />)}
    </g>
  ) },
};

// A small inline picture of a bake, for recipe cards and equations.
function Mini({ kind, size = 56 }) {
  const b = BAKES[kind];
  const s = size / 110;
  return (
    <svg width={size * 1.3} height={size} viewBox={`${-70} ${-100} 140 110`} style={{ display: "inline-block", verticalAlign: "middle" }}>
      {b.draw()}
    </svg>
  );
}

// ---------- The brass balance scales ----------
// `states` is a list of { at, left: [...kinds], right: [...kinds], balanced? }
// in time order. The beam tips towards the heavier pan and settles with a
// springy wobble whenever the pans change.
const PIVOT = { x: 960, y: 330 };
const ARM = 380;
const CHAIN = 190;

function tiltFor(state) {
  if (state.balanced) return 0;
  const w = list => list.reduce((a, k) => a + BAKES[k].weight, 0);
  const diff = w(state.right) - w(state.left);
  return Math.max(-13, Math.min(13, diff * 1.6));
}

function Scales({ t, states, appear = 1 }) {
  let cur = 0;
  states.forEach((st, i) => { if (t >= st.at) cur = i; });
  const target = tiltFor(states[cur]);
  const prev = cur > 0 ? tiltFor(states[cur - 1]) : 0;
  const dt = Math.max(0, (t - states[cur].at) / 30);
  const angle = target + (prev - target) * Math.exp(-2.6 * dt) * Math.cos(7 * dt);
  const rad = (angle * Math.PI) / 180;
  const ends = [-1, 1].map(side => ({ x: PIVOT.x + side * ARM * Math.cos(rad), y: PIVOT.y + side * ARM * Math.sin(rad) }));
  const since = t - states[cur].at;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: appear }}>
      <defs>
        <linearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={BRASS_LIGHT} /><stop offset="0.5" stopColor={BRASS} /><stop offset="1" stopColor="#8E6420" />
        </linearGradient>
      </defs>
      {/* Stand. */}
      <path d={`M ${PIVOT.x - 120} 800 Q ${PIVOT.x} 760 ${PIVOT.x + 120} 800 Z`} fill="url(#brass)" stroke={INK} strokeWidth={3} />
      <rect x={PIVOT.x - 12} y={PIVOT.y} width={24} height={470} rx={10} fill="url(#brass)" stroke={INK} strokeWidth={3} />
      {/* Beam. */}
      <g transform={`rotate(${angle} ${PIVOT.x} ${PIVOT.y})`}>
        <rect x={PIVOT.x - ARM - 10} y={PIVOT.y - 10} width={ARM * 2 + 20} height={20} rx={10} fill="url(#brass)" stroke={INK} strokeWidth={3} />
      </g>
      <circle cx={PIVOT.x} cy={PIVOT.y} r={22} fill="url(#brass)" stroke={INK} strokeWidth={3} />
      <path d={`M ${PIVOT.x - 10} ${PIVOT.y - 70} L ${PIVOT.x + 10} ${PIVOT.y - 70} L ${PIVOT.x + 4 + angle * 0.8} ${PIVOT.y - 10} L ${PIVOT.x - 4 + angle * 0.8} ${PIVOT.y - 10} Z`} fill="#8E6420" />
      {/* Pans, with the bakes on them. */}
      {ends.map((e, side) => {
        const items = side === 0 ? states[cur].left : states[cur].right;
        const panY = e.y + CHAIN;
        return (
          <g key={side}>
            <line x1={e.x} y1={e.y} x2={e.x - 130} y2={panY} stroke="#8E6420" strokeWidth={3} />
            <line x1={e.x} y1={e.y} x2={e.x + 130} y2={panY} stroke="#8E6420" strokeWidth={3} />
            <circle cx={e.x} cy={e.y} r={9} fill="url(#brass)" stroke={INK} strokeWidth={2.5} />
            <path d={`M ${e.x - 150} ${panY} Q ${e.x} ${panY + 60} ${e.x + 150} ${panY} Z`} fill="url(#brass)" stroke={INK} strokeWidth={3} />
            <Pile items={items} x={e.x} y={panY + 4} since={since} />
          </g>
        );
      })}
    </svg>
  );
}

// Bakes stacked on a pan in neat rows, popping in when they arrive.
function Pile({ items, x, y, since }) {
  const rows = [];
  let row = [];
  let width = 0;
  items.forEach(k => {
    const w = BAKES[k].w * (items.length > 4 ? 0.8 : 1);
    if (width + w > 280 && row.length) { rows.push(row); row = []; width = 0; }
    row.push(k); width += w;
  });
  if (row.length) rows.push(row);
  const small = items.length > 4 ? 0.8 : 1;
  let yy = y;
  return rows.map((r, ri) => {
    const total = r.reduce((a, k) => a + BAKES[k].w * small, 0);
    let xx = x - total / 2;
    const tallest = Math.max(...r.map(k => (k === "cake" ? 96 : k === "cupcake" ? 86 : k === "pie" ? 42 : k === "doughnut" ? 44 : 26))) * small;
    const g = (
      <g key={ri}>
        {r.map((k, i) => {
          const cx = xx + (BAKES[k].w * small) / 2;
          xx += BAKES[k].w * small;
          const p = pop(since, (ri * 3 + i) * 3);
          return (
            <g key={i} transform={`translate(${cx} ${yy}) scale(${small * p})`}>{BAKES[k].draw()}</g>
          );
        })}
      </g>
    );
    yy -= tallest + 4;
    return g;
  });
}

// ---------- The tent ----------

function Tent({ t }) {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(${CREAM} 0%, #F7EFE0 60%, #EADCC5 100%)` }} />
      {/* Canvas panels of the marquee roof. */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M ${960} -200 L ${i * 175 - 80} 170 L ${(i + 1) * 175 - 80} 170 Z`} fill={i % 2 ? "#FFFFFF" : "#DDEFE6"} opacity={0.9} />
        ))}
        <path d="M0 170 Q 80 200 160 170 Q 240 200 320 170 Q 400 200 480 170 Q 560 200 640 170 Q 720 200 800 170 Q 880 200 960 170 Q 1040 200 1120 170 Q 1200 200 1280 170 Q 1360 200 1440 170 Q 1520 200 1600 170 Q 1680 200 1760 170 Q 1840 200 1920 170" fill="none" stroke="#9CCBB3" strokeWidth={6} />
      </svg>
      {/* The counter at the back of the kitchen. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, bottom: 0, background: `linear-gradient(${MINT}, #A8D6BF)` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 752, height: 16, background: "#F2EBDD", boxShadow: "0 4px 10px rgba(0,0,0,0.12)" }} />
      <Bunting t={t} y={210} />
    </AbsoluteFill>
  );
}

// A string of pastel bunting that flutters in the breeze.
function Bunting({ t, y }) {
  const colours = [PINK, "#9CD3E3", "#F7D98B", "#B8E0C2", "#D7B8E8"];
  return (
    <svg width="1920" height="200" style={{ position: "absolute", left: 0, top: y - 40 }}>
      <path d="M-20 40 Q 960 110 1940 40" fill="none" stroke="#B89A7A" strokeWidth={3} />
      {Array.from({ length: 24 }, (_, i) => {
        const x = -20 + i * 84 + 40;
        const u = (x + 20) / 1960;
        const yy = 40 + 70 * 4 * u * (1 - u) * 0.98;
        const flap = Math.sin(t / 12 + i) * 5;
        return <path key={i} d={`M ${x - 30} ${yy} L ${x + 30} ${yy} L ${x + flap} ${yy + 62} Z`} fill={colours[i % 5]} stroke="#B89A7A" strokeWidth={1.5} />;
      })}
    </svg>
  );
}

// Soft sunlight through the tent canvas.
function Overlay({ frame }) {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 1100px 700px at 50% 20%, rgba(255,248,220,0.35), transparent 70%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(120,90,60,0.22) 100%)" }} />
    </AbsoluteFill>
  );
}

// TV lower-third subtitles with the presenter's name tag.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{ position: "absolute", left: 150, right: 150, bottom: 36, opacity, display: "flex", alignItems: "stretch", justifyContent: "center" }}>
      {actor && (
        <div style={{ background: actor.colour, color: "white", fontFamily: ROUND, fontWeight: 600, fontSize: 30, padding: "14px 22px", borderRadius: "18px 0 0 18px", display: "flex", alignItems: "center" }}>
          {actor.name}
        </div>
      )}
      <div style={{
        background: "rgba(255,255,255,0.95)", padding: "14px 30px", borderRadius: actor ? "0 18px 18px 0" : 18,
        fontFamily: ROUND, fontWeight: 500, fontSize: 40, lineHeight: 1.25, boxShadow: "0 10px 30px rgba(80,50,30,0.25)",
      }}>
        {words.map((w, i) => <span key={i} style={{ color: i < spoken ? INK : "#C7B5A5" }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// ---------- Cards and signs ----------

// A recipe card pinned up to the left, listing facts or steps.
function RecipeCard({ t, title, lines, x = 90, y = 250, w = 560, appear = 1 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, opacity: appear, transform: `rotate(-2deg) translateY(${(1 - appear) * 30}px)`,
      background: "#FFFDF7", borderRadius: 10, boxShadow: "0 16px 36px rgba(80,50,30,0.3)", padding: "20px 30px 16px",
      backgroundImage: "repeating-linear-gradient(transparent 0 57px, #D6E7F2 57px 59px)", backgroundPosition: "0 58px",
    }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 58, height: 3, background: "#E88AA0" }} />
      <div style={{ fontFamily: SCRIPT, fontSize: 38, color: BERRY, height: 58, lineHeight: "50px" }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ height: 58, display: "flex", alignItems: "center", gap: 10, fontFamily: ROUND, fontSize: 34, color: INK, opacity: l.show ?? 1 }}>{l.content}</div>
      ))}
    </div>
  );
}

// "2 🧁 = 1 🍩" style equation using the little bake pictures.
const Eq = ({ a, ak, b, bk, op = "=" }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
    <b>{a}</b><Mini kind={ak} size={48} /><span style={{ color: BERRY, margin: "0 6px" }}>{op}</span><b>{b}</b><Mini kind={bk} size={48} />
  </span>
);

// A big answer written across the top in icing.
function Answer({ t, at, children, x = 960, y = 720, bad }) {
  const k = pop(t, at);
  if (k <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${lerp(0.6, 1, k)})`, opacity: Math.min(1, k * 1.3),
      background: bad ? "#FBE3E3" : "#FFFFFF", border: `4px solid ${bad ? "#D86A6A" : "#7CC49C"}`, borderRadius: 22, padding: "10px 30px",
      fontFamily: ROUND, fontWeight: 600, fontSize: 44, color: INK, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 12px 30px rgba(80,50,30,0.25)",
    }}>{children}</div>
  );
}

// An oven timer dial for "your turn".
function OvenTimer({ t, at, seconds = 6 }) {
  const k = Math.max(0, Math.min(1, (t - at) / (seconds * 30)));
  const left = Math.max(0, Math.ceil(seconds * (1 - k)));
  return (
    <div style={{ position: "absolute", right: 110, top: 250, opacity: rise(t, 12, at - 6) }}>
      <svg width="220" height="220" viewBox="-110 -110 220 220">
        <circle r="100" fill="#F7F1E6" stroke={INK} strokeWidth="5" />
        <path d={`M 0 0 L 0 -86 A 86 86 0 ${1 - k > 0.5 ? 1 : 0} 1 ${86 * Math.sin(2 * Math.PI * (1 - k))} ${-86 * Math.cos(2 * Math.PI * (1 - k))} Z`} fill={PINK} opacity={k < 1 ? 1 : 0} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1="0" y1="-92" x2="0" y2="-80" stroke={INK} strokeWidth="4" transform={`rotate(${i * 30})`} />)}
        <circle r="30" fill={BRASS} stroke={INK} strokeWidth="4" />
        <text textAnchor="middle" y="12" fontFamily={ROUND} fontWeight="600" fontSize="34" fill={INK}>{left > 0 ? left : ""}</text>
      </svg>
      <div style={{ textAlign: "center", fontFamily: SCRIPT, fontSize: 36, color: BERRY }}>{left > 0 ? "Bake!" : "Time's up!"}</div>
    </div>
  );
}

// The title sign in the tent.
function TitleSign({ t, at }) {
  const k = pop(t, at);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", opacity: Math.min(1, k * 1.4), transform: `scale(${lerp(0.7, 1, k)}) rotate(${lerp(-6, -2, k)}deg)` }}>
      <div style={{ display: "inline-block", background: "#FFFFFF", borderRadius: 40, padding: "30px 80px 40px", border: `8px solid ${PINK}`, boxShadow: "0 30px 60px rgba(80,50,30,0.3)" }}>
        <div style={{ fontFamily: ROUND, fontWeight: 600, fontSize: 44, color: "#6FA88C", letterSpacing: 2 }}>The Great</div>
        <div style={{ fontFamily: SCRIPT, fontSize: 130, color: BERRY, lineHeight: 1.1 }}>Balance Bake-Off</div>
      </div>
    </div>
  );
}

// A judge's rosette for the finale.
function Rosette({ t, at }) {
  const k = pop(t, at);
  if (k <= 0) return null;
  return (
    <svg width="360" height="460" viewBox="-180 -180 360 460" style={{ position: "absolute", left: 780, top: 250, transform: `scale(${k}) rotate(${lerp(-30, 0, k)}deg)` }}>
      <path d="M-60 60 L-100 260 L-40 220 L0 270 L10 60 Z" fill="#6FA8D9" stroke={INK} strokeWidth="4" />
      <path d="M60 60 L100 260 L40 220 L0 270 L-10 60 Z" fill="#4E8EC4" stroke={INK} strokeWidth="4" />
      {Array.from({ length: 24 }, (_, i) => <ellipse key={i} rx="22" ry="60" fill={i % 2 ? "#F7D98B" : BRASS_LIGHT} stroke={INK} strokeWidth="2" transform={`rotate(${i * 15}) translate(0 -100)`} />)}
      <circle r="110" fill="#FFFFFF" stroke={INK} strokeWidth="5" />
      <text textAnchor="middle" y="-18" fontFamily={SCRIPT} fontSize="44" fill={BERRY}>A perfect</text>
      <text textAnchor="middle" y="40" fontFamily={SCRIPT} fontSize="58" fill={BERRY}>bake!</text>
    </svg>
  );
}

// ---------- The film ----------
const rep = (k, n) => Array.from({ length: n }, () => k);
const plop = (at, n = 1, gap = 0.12) => Array.from({ length: n }, (_, i) => ({ sfx: "bakeoff-tick", at: at + i * gap, volume: 0.6 }));
const settle = at => ({ sfx: "bakeoff-scale", at, volume: 0.8 });

export default {
  id: "s2-bakeoff",
  order: 107,
  series: 2,
  title: "The Great Balance Bake-Off",
  frame: "none",
  push: 0.012,
  cast: {
    bella: { name: "Bella", voice: "bf_emma", speed: 1.0, colour: BERRY },
    bertie: { name: "Bertie", voice: "bm_george", speed: 0.95, colour: "#5E9E7E" },
    judge: { name: "The Judge", voice: "bm_daniel", speed: 0.88, colour: "#4E8EC4" },
  },
  music: { src: "music/bakeoff.wav", volume: 0.24, duck: 0.35 },
  Overlay,
  Subtitles,
  scenes: [
    // Opening titles.
    {
      beats: [
        { who: "bella", say: "Hello, and welcome to the Great Balance Bake-Off!", sfxs: [{ sfx: "bakeoff-fanfare", at: 1.6, volume: 0.7 }] },
        { who: "bertie", say: "Where today's bakers won't need an oven. Just their brains!" },
      ],
      render: s => (
        <AbsoluteFill>
          <Tent t={s.t} />
          <TitleSign t={s.t} at={40} />
        </AbsoluteFill>
      ),
    },

    // What a balancing puzzle is.
    {
      beats: [
        { who: "bella", say: "Here's how a balancing puzzle works. First, you're told which bakes weigh the same as each other." },
        { who: "bertie", say: "Two cupcakes weigh the same as one doughnut, that sort of thing. See? The scales are perfectly level.", sfxs: [settle(0.2)] },
        { who: "bella", say: "Then you're asked about two bakes that have never been on the scales together." },
      ],
      render: s => (
        <AbsoluteFill>
          <Tent t={s.t} />
          <Scales t={s.t} states={[
            { at: 0, left: [], right: [] },
            { at: s.at(1), left: rep("cupcake", 2), right: ["doughnut"], balanced: true },
          ]} appear={rise(s.t, 20, 10)} />
          <Answer t={s.t} at={s.at(2) + s.speech(2) * 0.5} y={880}>
            How many <Mini kind="cupcake" size={52} /> weigh the same as a <Mini kind="pie" size={52} /> ?
          </Answer>
        </AbsoluteFill>
      ),
    },

    // The secret recipe.
    {
      beats: [
        { who: "bertie", say: "So what's the secret ingredient?" },
        { who: "bella", say: "Swapping! Put the bake on the scales, then swap it for the things it weighs the same as." },
        { who: "bella", say: "Keep swapping, until everything on the scales is the same kind of bake. Then just count them." },
      ],
      render: s => (
        <AbsoluteFill>
          <Tent t={s.t} />
          <RecipeCard t={s.t} x={560} y={290} w={800} title="Secret recipe" appear={rise(s.t, 20, 6)} lines={[
            { content: "1.  Put the bake on the scales.", show: rise(s.t, 14, s.at(1) + s.speech(1) * 0.2) },
            { content: "2.  Swap it for what it weighs the same as.", show: rise(s.t, 14, s.at(1) + s.speech(1) * 0.55) },
            { content: "3.  Keep swapping till they're all the same.", show: rise(s.t, 14, s.at(2) + s.speech(2) * 0.2) },
            { content: "4.  Count them up!", show: rise(s.t, 14, s.at(2) + s.speech(2) * 0.8) },
          ]} />
        </AbsoluteFill>
      ),
    },

    // Bake one: two steps.
    {
      beats: [
        { who: "bella", say: "Our first bake. Two cupcakes weigh the same as one doughnut. And two doughnuts weigh the same as one pie." },
        { who: "bella", say: "How many cupcakes weigh the same as a pie?" },
        { who: "bertie", say: "Pop the pie on one side. We know it balances two doughnuts.", sfxs: [settle(2.8)] },
        { who: "bella", say: "Now swap each doughnut for two cupcakes. One doughnut, two cupcakes. The other doughnut, two more.", sfxs: [...plop(3.2, 2), ...plop(5.2, 2), settle(5.6)] },
        { who: "bertie", say: "Still perfectly level! So one pie weighs the same as four cupcakes.", sfxs: [{ sfx: "bakeoff-ding", at: 3.6, volume: 0.7 }] },
      ],
      render: s => {
        const states = [
          { at: 0, left: [], right: [] },
          { at: s.at(2) + s.speech(2) * 0.25, left: ["pie"], right: [] },
          { at: s.at(2) + s.speech(2) * 0.7, left: ["pie"], right: rep("doughnut", 2), balanced: true },
          { at: s.at(3) + s.speech(3) * 0.55, left: ["pie"], right: ["doughnut", "cupcake", "cupcake"], balanced: true },
          { at: s.at(3) + s.speech(3) * 0.88, left: ["pie"], right: rep("cupcake", 4), balanced: true },
        ];
        return (
          <AbsoluteFill>
            <Tent t={s.t} />
            <RecipeCard t={s.t} x={60} y={250} w={470} title="The facts" appear={rise(s.t, 18, 4)} lines={[
              { content: <Eq a={2} ak="cupcake" b={1} bk="doughnut" />, show: rise(s.t, 14, s.speech(0) * 0.2) },
              { content: <Eq a={2} ak="doughnut" b={1} bk="pie" />, show: rise(s.t, 14, s.speech(0) * 0.6) },
            ]} />
            <Scales t={s.t} states={states} />
            <Answer t={s.t} at={s.at(4) + s.speech(4) * 0.55} y={880}>
              1 <Mini kind="pie" size={52} /> = 4 <Mini kind="cupcake" size={52} />
            </Answer>
          </AbsoluteFill>
        );
      },
    },

    // Bake two: "half as much", and the trap.
    {
      beats: [
        { who: "bella", say: "A trickier bake. One pie weighs the same as three doughnuts. And a cupcake weighs half as much as a doughnut." },
        { who: "bella", say: "How many cupcakes weigh the same as the pie?" },
        { who: "bertie", say: "Half as much? Easy! Halve the three. One and a half cupcakes!", sfxs: [settle(2.8)] },
        { who: "bella", say: "Oh, Bertie. Look at the scales. The pie crashes down! One and a half cupcakes is far too light." },
        { who: "bella", say: "If cupcakes are lighter, you need more of them, not fewer. Half as much means two cupcakes for every doughnut." },
        { who: "bertie", say: "So each of the three doughnuts becomes two cupcakes. Two, four, six!", sfxs: [...plop(2.6, 2), ...plop(3.4, 2), ...plop(4.2, 2), settle(4.8)] },
        { who: "bella", say: "Level again. The pie weighs the same as six cupcakes!", sfxs: [{ sfx: "bakeoff-ding", at: 2.4, volume: 0.7 }] },
      ],
      render: s => {
        const states = [
          { at: 0, left: ["pie"], right: rep("doughnut", 3), balanced: true },
          { at: s.at(2) + s.speech(2) * 0.8, left: ["pie"], right: ["cupcake", "cookie"] },
          { at: s.at(5) + s.speech(5) * 0.2, left: ["pie"], right: rep("doughnut", 3), balanced: true },
          { at: s.at(5) + s.speech(5) * 0.5, left: ["pie"], right: ["doughnut", "doughnut", "cupcake", "cupcake"], balanced: true },
          { at: s.at(5) + s.speech(5) * 0.65, left: ["pie"], right: ["doughnut", "cupcake", "cupcake", "cupcake", "cupcake"], balanced: true },
          { at: s.at(5) + s.speech(5) * 0.8, left: ["pie"], right: rep("cupcake", 6), balanced: true },
        ];
        return (
          <AbsoluteFill>
            <Tent t={s.t} />
            <RecipeCard t={s.t} x={60} y={250} w={470} title="The facts" lines={[
              { content: <Eq a={1} ak="pie" b={3} bk="doughnut" /> },
              { content: <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><Mini kind="cupcake" size={48} /> is <b style={{ color: BERRY }}>half</b> a <Mini kind="doughnut" size={48} /></span>, show: rise(s.t, 14, s.speech(0) * 0.6) },
              { content: <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>so <b>1</b><Mini kind="doughnut" size={48} /> = <b>2</b><Mini kind="cupcake" size={48} /></span>, show: rise(s.t, 14, s.at(4) + s.speech(4) * 0.7) },
            ]} />
            <Scales t={s.t} states={states} />
            <Answer t={s.t} at={s.at(2) + s.speech(2) * 0.8} y={880} bad>
              {s.t < s.at(5) ? <>1½ <Mini kind="cupcake" size={52} /> ? Far too light!</> : null}
            </Answer>
            {s.t >= s.at(5) && <Answer t={s.t} at={s.at(6) + s.speech(6) * 0.4} y={880}>1 <Mini kind="pie" size={52} /> = 6 <Mini kind="cupcake" size={52} /></Answer>}
          </AbsoluteFill>
        );
      },
    },

    // Your turn: the technical challenge.
    {
      beats: [
        { who: "bertie", say: "Now it's your technical challenge! Two cookies weigh the same as one cupcake. Three cupcakes weigh the same as one cake." },
        { who: "bella", say: "How many cookies weigh the same as the cake? Your time starts... now! Pause if you need longer.", voice: "How many cookies weigh the same as the cake? Your time starts, now! Pause if you need longer.", hold: 6,
          sfxs: Array.from({ length: 6 }, (_, i) => ({ sfx: "bakeoff-tick", at: 4.6 + i, volume: 0.9 })) },
        { who: "bella", say: "The cake is three cupcakes. And each cupcake is two cookies. Two, four, six cookies!", sfxs: [{ sfx: "bakeoff-ding", at: 0, volume: 0.8 }, settle(4.4)] },
      ],
      render: s => {
        const states = [
          { at: 0, left: ["cake"], right: [] },
          { at: s.at(2) + s.speech(2) * 0.2, left: ["cake"], right: rep("cupcake", 3), balanced: true },
          { at: s.at(2) + s.speech(2) * 0.8, left: ["cake"], right: rep("cookie", 6), balanced: true },
        ];
        return (
          <AbsoluteFill>
            <Tent t={s.t} />
            <RecipeCard t={s.t} x={60} y={250} w={470} title="Technical challenge" lines={[
              { content: <Eq a={2} ak="cookie" b={1} bk="cupcake" />, show: rise(s.t, 14, s.speech(0) * 0.2) },
              { content: <Eq a={3} ak="cupcake" b={1} bk="cake" />, show: rise(s.t, 14, s.speech(0) * 0.65) },
            ]} />
            <Scales t={s.t} states={states} appear={rise(s.t, 20, 10)} />
            <OvenTimer t={s.t} at={s.at(1) + s.speech(1) * 0.55} seconds={6} />
            <Answer t={s.t} at={s.at(2) + s.speech(2) * 0.85} y={880}>1 <Mini kind="cake" size={52} /> = 6 <Mini kind="cookie" size={52} /></Answer>
          </AbsoluteFill>
        );
      },
    },

    // Judging and recap.
    {
      beats: [
        { who: "judge", say: "Balanced, precise, and not a crumb out of place. That, my dears, is a perfect bake!", sfxs: [{ sfx: "bakeoff-fanfare", at: 3.4, volume: 0.8 }] },
        { who: "bella", say: "Remember the recipe. Swap each bake for what it weighs the same as, until they're all the same." },
        { who: "bertie", say: "And if the new bakes are lighter, you need more of them! Nothing gets past you." },
      ],
      tail: 1.5,
      render: s => (
        <AbsoluteFill>
          <Tent t={s.t} />
          <Rosette t={s.t} at={s.at(0) + s.speech(0) * 0.7} />
          <RecipeCard t={s.t} x={90} y={300} w={560} title="Remember" appear={rise(s.t, 18, s.at(1))} lines={[
            { content: "Swap each bake for its equal." },
            { content: "Keep going till they all match." },
            { content: "Lighter bakes? You need more!", show: rise(s.t, 14, s.at(2)) },
          ]} />
        </AbsoluteFill>
      ),
    },
  ],
};
