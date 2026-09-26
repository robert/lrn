// Series 2, film 10: "The Sequence Express". A travel-poster railway journey.
// Each carriage window holds the next step of a pattern; the last carriage is
// missing and must be coupled on. Teaches sequences: one change at a time.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadPacifico } from "@remotion/google-fonts/Pacifico";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { rise, pop, window, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";

const { fontFamily: POSTER } = loadBebas();
const { fontFamily: SCRIPT } = loadPacifico();
const { fontFamily: FRIENDLY } = loadFredoka();

// A travel-poster palette: flat, warm and a little faded.
const P = {
  skyTop: "#A9D8D2", skyLow: "#F4E2BE", sun: "#F2B134",
  far: "#9CC3A0", mid: "#5E9C73", near: "#3F7A58", bed: "#6B5B4B",
  navy: "#1F3A5F", red: "#C8452C", brass: "#D9A441", maroon: "#7E2F2B",
  cream: "#F6EBD4", ink: "#1E2A2A", smoke: "#F8F4EA",
};

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- Scenery ----------

// Rolling hills as a smooth wavy band, scrolled for parallax.
function hills(offset, base, amp, seed) {
  const pts = [];
  for (let x = -200; x <= 2120; x += 40) {
    const u = x + offset;
    const y = base - amp * (0.55 * Math.sin(u / 310 + seed) + 0.3 * Math.sin(u / 170 + seed * 2) + 0.15 * Math.sin(u / 90 + seed * 3));
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M -200 1080 L ${pts.join(" L ")} L 2120 1080 Z`;
}

// The countryside sliding past; `pos` is how far the train has travelled.
function Countryside({ pos, sunY = 230 }) {
  const poles = Array.from({ length: 8 }, (_, i) => {
    const x = ((i * 300 + pos * 1.6) % 2400) - 240;
    return (
      <g key={i}>
        <rect x={x} y={560} width={9} height={220} fill="#5A4636" />
        <rect x={x - 26} y={575} width={61} height={7} fill="#5A4636" />
      </g>
    );
  });
  const clouds = Array.from({ length: 5 }, (_, i) => {
    const x = ((i * 520 + pos * 0.15 + hash(i) * 300) % 2600) - 300;
    const y = 120 + hash(i + 4) * 160;
    return (
      <g key={i} fill="#FFF8EC" opacity={0.9}>
        <ellipse cx={x} cy={y} rx={90} ry={30} />
        <ellipse cx={x + 50} cy={y - 18} rx={60} ry={34} />
        <ellipse cx={x - 50} cy={y - 8} rx={50} ry={24} />
      </g>
    );
  });
  // Sunburst rays behind everything, like a railway poster.
  const rays = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    return <path key={i} d={`M 1500 ${sunY} L ${1500 + Math.cos(a) * 1600} ${sunY + Math.sin(a) * 1600} L ${1500 + Math.cos(a + 0.12) * 1600} ${sunY + Math.sin(a + 0.12) * 1600} Z`} fill="#FFF3D0" opacity={0.18} />;
  });
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={P.skyTop} /><stop offset="0.75" stopColor={P.skyLow} /></linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#sky)" />
      {rays}
      <circle cx={1500} cy={sunY} r={90} fill={P.sun} />
      {clouds}
      <path d={hills(pos * 0.2, 560, 70, 1)} fill={P.far} />
      <path d={hills(pos * 0.45, 640, 60, 4)} fill={P.mid} />
      {poles}
      <path d={hills(pos * 0.9, 760, 40, 9)} fill={P.near} />
      {/* The track bed, sleepers and rails. */}
      <rect x={0} y={790} width={1920} height={300} fill={P.bed} />
      {Array.from({ length: 50 }, (_, i) => <rect key={i} x={((i * 44 + pos * 2.4) % 2200) - 140} y={800} width={24} height={20} fill="#4A3E33" />)}
      <rect x={0} y={796} width={1920} height={6} fill="#C9C1B5" />
    </svg>
  );
}

// Steam puffs rising from the chimney and drifting back along the train.
function Steam({ t, x, y, rate = 7 }) {
  const puffs = [];
  for (let i = Math.floor(t / rate) - 16; i <= Math.floor(t / rate); i++) {
    const age = t - i * rate;
    if (age < 0) continue;
    const k = age / (16 * rate);
    puffs.push(<circle key={i} cx={x + age * 3.2} cy={y - age * 1.6 - Math.sin(i) * 10} r={18 + age * 0.9} fill={P.smoke} opacity={Math.max(0, 0.85 - k)} />);
  }
  return <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>{puffs}</svg>;
}

// ---------- The train ----------
const TRAIN_Y = 560; // top of the carriages
const ENGINE_X = 90;
const CAR_W = 262;
const CAR_H = 190;
const carX = i => ENGINE_X + 330 + i * CAR_W;
const WIN = 150; // window size

function Wheel({ cx, cy, r, t }) {
  const a = (t * 9) % 360;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={r} fill={P.ink} />
      <circle r={r - 6} fill="#3A3A3A" />
      <g transform={`rotate(${a})`} stroke={P.brass} strokeWidth="3">
        {[0, 45, 90, 135].map(d => <line key={d} x1={-(r - 7)} y1={0} x2={r - 7} y2={0} transform={`rotate(${d})`} />)}
      </g>
      <circle r={5} fill={P.brass} />
    </g>
  );
}

// The engine at the front (the train travels left).
function Engine({ t, bob }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, transform: `translateY(${bob}px)` }}>
      <g transform={`translate(${ENGINE_X} ${TRAIN_Y})`}>
        <rect x={30} y={60} width={250} height={120} rx={14} fill={P.navy} />
        <rect x={0} y={82} width={60} height={80} rx={30} fill={P.navy} />
        <circle cx={22} cy={122} r={20} fill={P.brass} />
        <rect x={180} y={-10} width={110} height={110} rx={8} fill={P.maroon} />
        <rect x={198} y={10} width={74} height={50} rx={6} fill={P.cream} />
        <rect x={60} y={10} width={40} height={60} fill={P.ink} />
        <rect x={50} y={0} width={60} height={16} rx={4} fill={P.ink} />
        <rect x={120} y={36} width={34} height={30} rx={12} fill={P.brass} />
        <rect x={30} y={118} width={250} height={10} fill={P.red} />
        <path d="M -20 180 L 30 150 L 30 180 Z" fill={P.red} />
      </g>
      <Wheel cx={ENGINE_X + 90} cy={TRAIN_Y + 185} r={34} t={t} />
      <Wheel cx={ENGINE_X + 175} cy={TRAIN_Y + 185} r={34} t={t} />
      <Wheel cx={ENGINE_X + 255} cy={TRAIN_Y + 195} r={24} t={t} />
      <rect x={ENGINE_X + 90} y={TRAIN_Y + 178} width={165} height={8} rx={4} fill={P.brass} transform={`translate(0 ${Math.sin(t / 3) * 6})`} />
    </svg>
  );
}

// One carriage with a big window showing a step of the sequence.
function Carriage({ i, t, bob, items, label, glow = 0, dx = 0, faded = 0 }) {
  const x = carX(i) + dx;
  return (
    <div style={{ position: "absolute", left: x, top: TRAIN_Y + bob, width: CAR_W - 14, height: CAR_H + 60, opacity: 1 - faded }}>
      <svg width={CAR_W - 14} height={CAR_H + 60} style={{ overflow: "visible" }}>
        <rect x={-14} y={150} width={16} height={10} fill={P.ink} />
        <rect x={0} y={0} width={CAR_W - 14} height={CAR_H} rx={14} fill={P.maroon} />
        <rect x={0} y={-12} width={CAR_W - 14} height={22} rx={8} fill={P.ink} />
        <rect x={10} y={CAR_H - 34} width={CAR_W - 34} height={8} fill={P.brass} />
        <rect x={(CAR_W - 14 - WIN - 16) / 2} y={14} width={WIN + 16} height={WIN + 16} rx={10} fill={glow > 0 ? P.sun : P.brass} />
        <g transform={`translate(${(CAR_W - 14) / 2} ${22 + WIN / 2})`}>
          <rect x={-WIN / 2} y={-WIN / 2} width={WIN} height={WIN} rx={6} fill={P.cream} />
          {items && items.map((it, j) => <Shape key={j} {...it} x={(it.dx ?? 0) * WIN} y={(it.dy ?? 0) * WIN} r={(it.r ?? 0.3) * WIN} ink={P.ink} />)}
        </g>
        <circle cx={50} cy={CAR_H + 6} r={24} fill={P.ink} />
        <circle cx={CAR_W - 64} cy={CAR_H + 6} r={24} fill={P.ink} />
        <g transform={`translate(50 ${CAR_H + 6}) rotate(${(t * 12) % 360})`}><line x1={-18} x2={18} stroke={P.brass} strokeWidth="3" /><line y1={-18} y2={18} stroke={P.brass} strokeWidth="3" /></g>
        <g transform={`translate(${CAR_W - 64} ${CAR_H + 6}) rotate(${(t * 12) % 360})`}><line x1={-18} x2={18} stroke={P.brass} strokeWidth="3" /><line y1={-18} y2={18} stroke={P.brass} strokeWidth="3" /></g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 14, top: CAR_H - 30, textAlign: "center", fontFamily: POSTER, fontSize: 26, color: P.cream, letterSpacing: 2 }}>{label}</div>
    </div>
  );
}

// The empty slot at the back where the missing carriage belongs.
function MissingSlot({ t, bob, i }) {
  return (
    <div style={{ position: "absolute", left: carX(i), top: TRAIN_Y + bob, width: CAR_W - 14, height: CAR_H }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 14, border: `5px dashed ${P.cream}`, opacity: 0.6 + 0.4 * Math.sin(t / 6) }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: POSTER, fontSize: 120, color: P.cream }}>?</div>
    </div>
  );
}

// The whole train: engine, carriages 1..n, and either the gap or the answer
// carriage sliding in to couple on.
function Train({ t, steps, answer, coupleAt, bob }) {
  const n = steps.length;
  const k = answer ? rise(t, 26, coupleAt) : 0;
  return (
    <>
      <Steam t={t} x={ENGINE_X + 80} y={TRAIN_Y - 10} />
      <Engine t={t} bob={bob} />
      {steps.map((items, i) => <Carriage key={i} i={i} t={t} bob={bob * (i % 2 ? -1 : 1)} items={items} label={`Step ${i + 1}`} />)}
      {k < 1 && <MissingSlot t={t} bob={bob} i={n} />}
      {answer && k > 0 && <Carriage i={n} t={t} bob={bob} items={answer} label={`Step ${n + 1}`} glow={1} dx={(1 - k) * 700} />}
    </>
  );
}

// Four spare carriages waiting on the siding, lettered a to d.
function Siding({ t, options, appearAt, pick, pickAt, wrong = {}, y = 110 }) {
  const w = 190;
  return options.map((items, i) => {
    const x = 1010 + i * (w + 26);
    const a = rise(t, 14, appearAt + i * 5);
    const isPick = i === pick && t >= pickAt;
    const isWrong = wrong[i] !== undefined && t >= wrong[i];
    return (
      <div key={i} style={{ position: "absolute", left: x, top: y + (1 - a) * 30, width: w, opacity: a * (isWrong ? 0.45 : 1) }}>
        <svg width={w} height={w} style={{ overflow: "visible" }}>
          <rect x={0} y={0} width={w} height={w} rx={12} fill={isPick ? P.sun : P.navy} />
          <rect x={14} y={14} width={w - 28} height={w - 28} rx={6} fill={P.cream} />
          <g transform={`translate(${w / 2} ${w / 2})`}>
            {items.map((it, j) => <Shape key={j} {...it} x={(it.dx ?? 0) * (w - 28)} y={(it.dy ?? 0) * (w - 28)} r={(it.r ?? 0.3) * (w - 28)} ink={P.ink} />)}
          </g>
          {isWrong && <line x1={20} y1={w - 20} x2={w - 20} y2={20} stroke={P.red} strokeWidth="8" strokeLinecap="round" />}
        </svg>
        <div style={{ textAlign: "center", fontFamily: POSTER, fontSize: 38, color: isPick ? P.red : P.navy, marginTop: 4 }}>{"abcd"[i]}</div>
      </div>
    );
  });
}

// A railway sign or poster panel.
function Sign({ x, y, w, children, appear = 1, bg = P.cream, color = P.navy, size = 44, rot = 0 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, opacity: appear, transform: `translateY(${(1 - appear) * -30}px) rotate(${rot}deg)`,
      background: bg, color, fontFamily: POSTER, fontSize: size, letterSpacing: 2, textAlign: "center",
      padding: "10px 18px", borderRadius: 10, border: `5px solid ${P.navy}`, boxShadow: "0 8px 0 rgba(0,0,0,0.15)",
    }}>{children}</div>
  );
}

// A ticket clipped with "punched" holes, stamped as a verdict.
function Ticket({ t, at, x, y, text, color = P.red }) {
  const k = pop(t, at);
  if (k <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: `rotate(-6deg) scale(${lerp(1.6, 1, k)})`, opacity: Math.min(1, k * 1.5),
      background: P.cream, border: `4px dashed ${color}`, borderRadius: 10, padding: "8px 26px",
      fontFamily: POSTER, fontSize: 48, letterSpacing: 3, color, boxShadow: "0 10px 0 rgba(0,0,0,0.12)",
    }}>{text}</div>
  );
}

// Subtitles as a railway ticket strip along the bottom.
function Subtitles({ words, spoken, opacity, who, actor }) {
  const col = who === "guard" ? P.navy : P.red;
  return (
    <div style={{
      position: "absolute", left: 180, right: 180, bottom: 36, opacity,
      display: "flex", alignItems: "center", gap: 22, padding: "14px 34px",
      background: P.cream, borderRadius: 14, border: `4px solid ${P.navy}`, boxShadow: "0 8px 0 rgba(0,0,0,0.18)",
    }}>
      {actor && <span style={{ fontFamily: POSTER, fontSize: 32, letterSpacing: 2, color: P.cream, background: col, borderRadius: 8, padding: "2px 14px", flex: "none" }}>{actor.name}</span>}
      <span style={{ fontFamily: FRIENDLY, fontWeight: 600, fontSize: 38, lineHeight: 1.25, color: P.ink, flex: 1, textAlign: "center" }}>
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.35 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </span>
    </div>
  );
}

// ---------- The puzzles ----------
// Journey 1: a dot travelling clockwise round the corners of a square window.
const dotAt = (cx, cy) => [{ kind: "square", fill: "white", r: 0.36 }, { kind: "circle", fill: "black", r: 0.08, dx: cx, dy: cy }];
const TL = [-0.19, -0.19], TR = [0.19, -0.19], BR = [0.19, 0.19], BL = [-0.19, 0.19];
const J1 = [dotAt(...TL), dotAt(...TR), dotAt(...BR), dotAt(...BL)];
const J1_OPTS = [dotAt(0, 0), dotAt(...BL), dotAt(...TL), dotAt(...TR)]; // c

// Journey 2: dots counting up while the colour swaps black, white, black, white.
function dots(n, fill) {
  const spots = [[0, 0], [-0.2, -0.2], [0.2, 0.2], [0.2, -0.2], [-0.2, 0.2], [0, -0.27]];
  const layout = { 1: [0], 2: [1, 2], 3: [1, 0, 2], 4: [1, 3, 4, 2], 5: [1, 3, 0, 4, 2], 6: [1, 3, 0, 4, 2, 5] }[n];
  return layout.map(k => ({ kind: "circle", fill, r: 0.08, dx: spots[k][0], dy: spots[k][1] }));
}
const J2 = [dots(1, "black"), dots(2, "white"), dots(3, "black"), dots(4, "white")];
const J2_OPTS = [dots(5, "white"), dots(4, "black"), dots(5, "black"), dots(6, "black")]; // c; a and b get one change right

// Journey 3 (your turn): a triangle turning a quarter turn while the shading swaps white, grey.
const tri = (rot, fill) => [{ kind: "triangle", fill, rot, r: 0.3 }];
const J3 = [tri(0, "white"), tri(90, "grey"), tri(180, "white"), tri(270, "grey")];
const J3_OPTS = [tri(0, "grey"), tri(0, "white"), tri(270, "white"), tri(180, "white")]; // b

// ---------- The film ----------
const bobOf = t => Math.sin(t / 4.5) * 3;

export default {
  id: "s2-train",
  order: 110,
  series: 2,
  title: "The Sequence Express",
  frame: "none",
  push: 0.015,
  cast: {
    guard: { name: "THE GUARD", voice: "bm_george", speed: 0.96 },
    maisie: { name: "MAISIE", voice: "bf_alice", speed: 1.02 },
  },
  music: { src: "music/train.wav", volume: 0.3, duck: 0.4 },
  Subtitles,
  scenes: [
    // Cold open: the express steaming through the hills.
    {
      beats: [
        { who: "guard", say: "All aboard the Sequence Express! Every carriage carries the next step of a pattern.", sfxs: [{ sfx: "train-whistle", at: 0 }] },
        { who: "maisie", say: "Excuse me, Mister Guard. The last carriage is missing!" },
        { who: "guard", say: "So it is! Then we'd better work out what goes in it, before we reach the station." },
      ],
      render: s => (
        <AbsoluteFill>
          <Countryside pos={s.t * 6} />
          <Train t={s.t} steps={J1} bob={bobOf(s.t)} />
          <Sign x={1240} y={130} w={520} size={52} appear={rise(s.t, 20, s.at(1) + 20)} bg={P.sun}>Last carriage: missing!</Sign>
        </AbsoluteFill>
      ),
    },

    // Title: a travel poster.
    {
      beats: [{ who: "guard", say: "The Sequence Express.", sfxs: [{ sfx: "train-ding", at: 0.1 }], hold: 1.6 }],
      render: s => {
        const a = rise(s.t, 24, 6);
        const b = rise(s.t, 24, 26);
        return (
          <AbsoluteFill>
            <Countryside pos={s.t * 3} sunY={330} />
            <AbsoluteFill style={{ border: `24px solid ${P.cream}`, boxShadow: `inset 0 0 0 6px ${P.navy}` }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", opacity: a, transform: `translateY(${(1 - a) * -30}px)` }}>
              <div style={{ fontFamily: POSTER, fontSize: 40, letterSpacing: 14, color: P.navy }}>Nothing Gets Past Railways presents</div>
              <div style={{ fontFamily: SCRIPT, fontSize: 150, color: P.red, lineHeight: 1.2, textShadow: `5px 5px 0 ${P.cream}` }}>The Sequence Express</div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", opacity: b, fontFamily: POSTER, fontSize: 56, letterSpacing: 6, color: P.cream, textShadow: `3px 3px 0 ${P.navy}` }}>
              Follow one change at a time
            </div>
          </AbsoluteFill>
        );
      },
    },

    // Rule Junction: the secret.
    {
      beats: [
        { who: "guard", say: "In a sequence, more than one thing can change at the same time.", sfxs: [{ sfx: "train-ding", at: 0 }] },
        { who: "guard", say: "So follow one change at a time. Look at each carriage in turn, from the front of the train to the back." },
        { who: "maisie", say: "So I follow one change, then the next change, and then I put them together!" },
        { who: "guard", say: "That's right. Next stop, the first puzzle." },
      ],
      render: s => (
        <AbsoluteFill>
          <Countryside pos={200} />
          {/* A station: platform, canopy and the big board. */}
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            <rect x={0} y={720} width={1920} height={90} fill="#B9A58A" />
            <rect x={0} y={710} width={1920} height={14} fill="#8E7B62" />
            <rect x={140} y={160} width={1640} height={40} fill={P.navy} />
            {Array.from({ length: 9 }, (_, i) => <rect key={i} x={170 + i * 200} y={200} width={14} height={520} fill={P.navy} />)}
          </svg>
          <Sign x={660} y={225} w={600} size={70} appear={rise(s.t, 20, 6)} bg={P.cream}>Rule Junction</Sign>
          <div style={{ position: "absolute", left: 480, top: 360, width: 960, background: P.ink, borderRadius: 14, padding: "28px 44px", border: `8px solid ${P.brass}` }}>
            {["One change at a time", "Then the next change", "Put them together"].map((line, i) => {
              const k = rise(s.t, 16, i === 0 ? s.at(1) + s.speech(1) * 0.1 : s.at(2) + s.speech(2) * (i === 1 ? 0.3 : 0.58));
              return (
                <div key={line} style={{ display: "flex", gap: 30, alignItems: "baseline", opacity: k, fontFamily: POSTER, fontSize: 64, color: P.cream, letterSpacing: 3 }}>
                  <span style={{ color: P.sun, width: 40 }}>{i + 1}</span>{line}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ),
    },

    // Journey one: a single change.
    {
      beats: [
        { who: "guard", say: "Here is the first puzzle. Look in the windows. A dot moves round the corners, one corner each time.", sfxs: [{ sfx: "train-whistle", at: 0, volume: 0.6 }] },
        { who: "maisie", say: "Top left, top right, bottom right, bottom left. It's going round clockwise!" },
        { who: "guard", say: "So which corner comes next?" },
        { who: "maisie", say: "Round again, back to the top left. That's c!" },
        { who: "guard", say: "Couple it on!", sfxs: [{ sfx: "train-clank", at: 0.7 }] },
      ],
      render: s => {
        const lit = [0, 1, 2, 3].map(i => s.t >= s.at(1) + s.speech(1) * (0.05 + i * 0.22));
        const coupleAt = s.at(4) + 6;
        return (
          <AbsoluteFill>
            <Countryside pos={500 + s.t * 5} />
            <Siding t={s.t} options={J1_OPTS} appearAt={s.at(2)} pick={2} pickAt={s.at(3) + s.speech(3) * 0.8} y={110} />
            <Train t={s.t} steps={J1} bob={bobOf(s.t)} answer={J1_OPTS[2]} coupleAt={coupleAt} />
            {/* Little numbered corner arrows follow the dot round. */}
            {lit.map((on, i) => on && (
              <div key={i} style={{ position: "absolute", left: carX(i) + 90, top: TRAIN_Y - 70, fontFamily: POSTER, fontSize: 48, color: P.navy, opacity: pop(s.t, s.at(1) + s.speech(1) * (0.05 + i * 0.22)) }}>
                {["top left", "top right", "btm right", "btm left"][i]}
              </div>
            ))}
            <Ticket t={s.t} at={coupleAt + 20} x={1380} y={390} text="Clockwise!" color={P.navy} />
          </AbsoluteFill>
        );
      },
    },

    // Journey two: two changes at once, and the trap.
    {
      beats: [
        { who: "guard", say: "Here is the second puzzle. It is harder, because two things are changing.", sfxs: [{ sfx: "train-chuff", at: 0.2 }] },
        { who: "maisie", say: "I can count them. One dot, two, three, four. So next is five dots. Answer a!" },
        { who: "guard", say: "Hold your horses! You've only followed one change. The colour is changing too.", sfxs: [{ sfx: "train-ding", at: 0.3 }] },
        { who: "maisie", say: "Black, white, black, white. So next is black!" },
        { who: "guard", say: "Now put the two changes together. The next carriage needs five dots, and they must be black." },
        { who: "maisie", say: "Five black dots. Answer c!", sfxs: [{ sfx: "train-clank", at: 1.4 }] },
        { who: "guard", say: "Answer a only got the counting right, and b only got the colour right. Follow every change, and you won't be caught out." },
      ],
      render: s => {
        const count = window(s.t, s.at(1), s.at(3));
        const colour = rise(s.t, 14, s.at(3));
        const coupleAt = s.at(5) + s.speech(5) * 0.6;
        return (
          <AbsoluteFill>
            <Countryside pos={900 + s.t * 5} />
            <Siding t={s.t} options={J2_OPTS} appearAt={20} pick={2} pickAt={s.at(5) + s.speech(5) * 0.5}
              wrong={{ 0: s.at(2) + 10, 1: s.at(6) + s.speech(6) * 0.45, 3: s.at(6) + s.speech(6) * 0.75 }} />
            <Train t={s.t} steps={J2} bob={bobOf(s.t)} answer={J2_OPTS[2]} coupleAt={coupleAt} />
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ position: "absolute", left: carX(i) + 60, top: TRAIN_Y - 128, width: 130, textAlign: "center", fontFamily: POSTER, fontSize: 50, color: P.navy }}>
                <span style={{ opacity: count * rise(s.t, 10, s.at(1) + s.speech(1) * (0.15 + i * 0.13)) }}>{i + 1}</span>
                <span style={{ opacity: colour * rise(s.t, 10, s.at(3) + s.speech(3) * (0.05 + i * 0.2)), color: P.red, fontSize: 40, display: "block" }}>{i % 2 ? "white" : "black"}</span>
              </div>
            ))}
            <Sign x={300} y={130} w={600} size={40} bg={P.sun} appear={window(s.t, s.at(4), s.at(6) + 40)}>Count: five &nbsp;+&nbsp; Colour: black</Sign>
            <Ticket t={s.t} at={s.at(6) + s.speech(6) * 0.2} x={380} y={420} text="One change isn't enough!" />
          </AbsoluteFill>
        );
      },
    },

    // Your turn.
    {
      beats: [
        { who: "guard", say: "Final puzzle, and the station's in sight. Your turn, passenger! Follow one change at a time. Pause the video if you need more time.", hold: 6.5,
          sfxs: Array.from({ length: 6 }, (_, i) => ({ sfx: "train-chuff", at: 8.2 + i, volume: 0.8 })) },
        { who: "maisie", say: "It turns a quarter turn each time, so next it points up again. And the shading goes white, grey, white, grey, so next is white. Answer b!", sfxs: [{ sfx: "train-clank", at: 8.4 }] },
      ],
      render: s => {
        const start = s.at(0) + s.speech(0);
        const e = Math.max(0, s.t - start);
        const left = Math.max(0, 6 - Math.floor(e / 30));
        const coupleAt = s.at(1) + s.speech(1) * 0.93;
        return (
          <AbsoluteFill>
            <Countryside pos={1400 + s.t * 4} />
            <Siding t={s.t} options={J3_OPTS} appearAt={20} pick={1} pickAt={s.at(1) + s.speech(1) * 0.9} />
            <Train t={s.t} steps={J3} bob={bobOf(s.t)} answer={J3_OPTS[1]} coupleAt={coupleAt} />
            {/* A station clock counting down. */}
            {s.t >= start && s.t < s.at(1) + 20 && (
              <div style={{ position: "absolute", left: 360, top: 120, opacity: window(s.t, start, s.at(1) + 20) }}>
                <svg width="200" height="200" viewBox="-100 -100 200 200">
                  <circle r="90" fill={P.cream} stroke={P.navy} strokeWidth="10" />
                  {Array.from({ length: 12 }, (_, i) => <line key={i} y1="-78" y2="-66" stroke={P.navy} strokeWidth="5" transform={`rotate(${i * 30})`} />)}
                  <line y2="-70" stroke={P.red} strokeWidth="6" strokeLinecap="round" transform={`rotate(${(e / 30) * 60})`} />
                  <circle r="7" fill={P.navy} />
                </svg>
                <div style={{ textAlign: "center", fontFamily: POSTER, fontSize: 60, color: P.navy }}>{left > 0 ? left : "Time!"}</div>
              </div>
            )}
          </AbsoluteFill>
        );
      },
    },

    // Arrival: the train pulls into the station.
    {
      beats: [
        { who: "guard", say: "Sequence Express, arriving at Nothing Gets Past, bang on time!", sfxs: [{ sfx: "train-whistle", at: 0 }, { sfx: "train-ding", at: 2.4 }] },
        { who: "maisie", say: "Follow one change at a time, then put them together!" },
        { who: "guard", say: "And not a single step got past you. All change, please!", hold: 1.2 },
      ],
      tail: 1.5,
      render: s => {
        // The countryside slows to a stop as we pull in.
        const T = s.at(1);
        const e = Math.min(s.t, T);
        const pos = 2000 + 5 * (e - (e * e) / (2 * T));
        const stationX = lerp(1920, 0, rise(s.t, T, 0));
        return (
          <AbsoluteFill>
            <Countryside pos={pos} />
            <div style={{ position: "absolute", left: stationX, top: 0, width: 1920, height: 1080 }}>
              <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
                <rect x={0} y={720} width={1920} height={90} fill="#B9A58A" />
                <rect x={0} y={160} width={1920} height={40} fill={P.navy} />
                {Array.from({ length: 10 }, (_, i) => <rect key={i} x={120 + i * 190} y={200} width={14} height={520} fill={P.navy} />)}
                {Array.from({ length: 24 }, (_, i) => <path key={`b${i}`} d={`M ${80 + i * 76} 210 l 38 0 l -19 34 Z`} fill={[P.red, P.sun, P.cream, P.mid][i % 4]} />)}
              </svg>
              <Sign x={560} y={250} w={800} size={80} bg={P.cream}>Nothing Gets Past</Sign>
            </div>
            <Train t={s.t < T ? s.t : T + (s.t - T) * 0.02} steps={J3} answer={J3_OPTS[1]} coupleAt={-100} bob={s.t < T ? bobOf(s.t) : 0} />
            <Ticket t={s.t} at={s.at(2) + s.speech(2) * 0.7} x={1250} y={430} text="All steps followed" color={P.navy} />
          </AbsoluteFill>
        );
      },
    },
  ],
};
