// Series 3, play-along film 1: "The Dragon's Three Riddles". A pop-up book.
// Pip must cross the dragon's bridge to reach the Library Tower. Ember the
// dragon asks three riddles; the viewer taps the answers to help Pip.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadFell } from "@remotion/google-fonts/IMFellEnglish";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { rise, pop, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";

const { fontFamily: FELL } = loadFell();
const { fontFamily: CINZEL } = loadCinzel("normal", { weights: ["600"] });

const P = {
  paper: "#F4EBDA", paperShade: "#E4D6BC", ink: "#2B2320",
  sky: "#9CC3C9", skyDeep: "#6E9FAB", hill: "#8FAF7E", hillDeep: "#6D8F63",
  stone: "#B9AFA2", stoneDeep: "#958B80", roof: "#8E5A6B", banner: "#C98F3F",
  dragon: "#4E8C7A", dragonDeep: "#3A6E5F", belly: "#E9D9A6", water: "#6FA3B5", gold: "#D8A444",
};
const hash = n => { const x = Math.sin(n * 91.7 + 17.3) * 43758.5453; return x - Math.floor(x); };

// ---------- The pop-up page ----------

// A paper layer that stands up off the page when the scene opens.
function Layer({ t, at = 0, depth = 0, children, style }) {
  const k = pop(t, at);
  return (
    <div style={{
      position: "absolute", inset: 0, transformOrigin: "50% 100%",
      transform: `perspective(2200px) rotateX(${lerp(88, 0, Math.min(1, k))}deg) translateY(${Math.sin(t / 45 + depth) * depth * 1.5}px)`,
      filter: `drop-shadow(0 ${6 + depth * 3}px ${6 + depth * 3}px rgba(60,40,20,0.35))`,
      opacity: Math.min(1, k * 3), ...style,
    }}>{children}</div>
  );
}

// Paper grain and a soft page gutter, over everything.
function Overlay({ frame }) {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.12, mixBlendMode: "multiply" }}>
        <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="4" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="1920" height="1080" filter="url(#paper)" />
      </svg>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, transparent 47%, rgba(80,50,20,0.16) 50%, transparent 53%)" }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 160px rgba(60,35,15,0.45)" }} />
    </AbsoluteFill>
  );
}

// Storybook captions on a paper ribbon.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, display: "flex", justifyContent: "center", opacity }}>
      <div style={{
        maxWidth: 1400, padding: "14px 40px 18px", background: "rgba(244,235,218,0.94)", borderRadius: 6,
        boxShadow: "0 8px 20px rgba(60,40,20,0.35)", fontFamily: FELL, fontSize: 46, lineHeight: 1.2, textAlign: "center", color: P.ink,
      }}>
        {actor && <span style={{ fontFamily: CINZEL, fontSize: 26, color: actor.colour, marginRight: 18, letterSpacing: 2 }}>{actor.name}</span>}
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.38 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// ---------- The world, in paper ----------

function Sky({ t }) {
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${P.sky}, #CFE2DA 70%)` }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute", top: 90 + i * 70, left: ((i * 700 + t * (0.4 + i * 0.2)) % 2400) - 300,
          width: 300 + i * 60, height: 70, borderRadius: 60, background: "#F8F3E8",
          boxShadow: "0 6px 0 rgba(0,0,0,0.05)",
        }} />
      ))}
    </AbsoluteFill>
  );
}

function Hills({ colour = P.hill, y = 700, amp = 60, seed = 1 }) {
  let d = `M0 1080 L0 ${y}`;
  for (let x = 0; x <= 1920; x += 160) d += ` Q ${x + 80} ${y - amp * (0.5 + hash(x + seed))} ${x + 160} ${y}`;
  d += " L1920 1080 Z";
  return <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}><path d={d} fill={colour} /></svg>;
}

// The castle, with five towers flying banners (the first riddle).
const TOWERS = [300, 630, 960, 1290, 1620];
function Castle({ banners, t }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <rect x="220" y="560" width="1480" height="260" fill={P.stone} />
      {Array.from({ length: 30 }, (_, i) => <rect key={i} x={220 + i * 50} y="535" width="30" height="30" fill={P.stone} />)}
      {TOWERS.map((x, i) => (
        <g key={i}>
          <rect x={x - 70} y="330" width="140" height="490" fill={P.stoneDeep} />
          <path d={`M${x - 90} 335 L${x} 210 L${x + 90} 335 Z`} fill={P.roof} />
          <line x1={x} y1="215" x2={x} y2="120" stroke={P.ink} strokeWidth="5" />
          {/* The banner ripples a little in the wind. */}
          <path d={`M${x} 124 Q ${x + 60} ${118 + Math.sin(t / 8 + i) * 6} ${x + 120} 130 L ${x + 120} 200 Q ${x + 60} ${192 + Math.sin(t / 8 + i) * 6} ${x} 200 Z`} fill={P.banner} />
          {banners && <g transform={`translate(${x + 60} 164)`}><Shape {...banners[i]} x={0} y={0} /></g>}
          <rect x={x - 22} y="430" width="44" height="70" rx="22" fill={P.ink} opacity="0.7" />
        </g>
      ))}
      <path d="M880 820 L880 700 Q960 630 1040 700 L1040 820 Z" fill={P.ink} opacity="0.75" />
    </svg>
  );
}

// Ember the dragon: friendly, paper-cut, with a blink and a gentle breath.
function Dragon({ t, x = 1500, y = 620, scale = 1, flip = false, talking = false }) {
  const blink = (Math.floor(t / 70) % 5 === 0 && t % 70 < 5) ? 0.15 : 1;
  const breathe = Math.sin(t / 20) * 6;
  const jaw = talking ? Math.abs(Math.sin(t / 3)) * 10 : 0;
  return (
    <svg width="700" height="700" viewBox="-350 -350 700 700" style={{ position: "absolute", left: x - 350 * scale, top: y - 350 * scale, width: 700 * scale, height: 700 * scale, transform: flip ? "scaleX(-1)" : "none", overflow: "visible" }}>
      {/* Tail and wing behind. */}
      <path d="M-120 160 Q -300 200 -320 60 Q -290 120 -230 110 Q -200 150 -120 120 Z" fill={P.dragonDeep} />
      <path d={`M-40 -30 L -250 ${-230 + breathe} L -170 ${-120 + breathe} L -260 ${-90 + breathe} L -150 ${-40 + breathe} L -200 ${10 + breathe} L -40 40 Z`} fill={P.dragonDeep} />
      {/* Body and belly. */}
      <ellipse cx="0" cy={120} rx="190" ry={150 + breathe / 2} fill={P.dragon} />
      <ellipse cx="30" cy={150} rx="110" ry={100 + breathe / 2} fill={P.belly} />
      {[0, 1, 2, 3].map(i => <path key={i} d={`M-40 ${80 + i * 38} Q 30 ${95 + i * 38} 100 ${80 + i * 38}`} stroke={P.gold} strokeWidth="4" fill="none" opacity="0.6" />)}
      {/* Neck and head. */}
      <path d="M40 20 Q 60 -120 140 -170 L 210 -120 Q 140 -80 130 40 Z" fill={P.dragon} />
      <g transform={`translate(170 -190)`}>
        <path d="M-40 -60 L -70 -130 L -10 -75 Z M 20 -70 L 20 -140 L 50 -70 Z" fill={P.gold} />
        <ellipse cx="0" cy="0" rx="110" ry="80" fill={P.dragon} />
        <path d={`M 20 20 Q 110 20 150 ${35 + jaw / 2} Q 110 ${70 + jaw} 20 ${55 + jaw} Z`} fill={P.dragonDeep} />
        <ellipse cx="120" cy="14" rx="48" ry="34" fill={P.dragon} />
        <circle cx="146" cy="6" r="5" fill={P.ink} />
        <ellipse cx="30" cy="-20" rx="26" ry={26 * blink} fill="#FFF8E6" />
        <circle cx="38" cy="-18" r={12 * blink} fill={P.ink} />
        <circle cx="42" cy="-23" r={4 * blink} fill="#fff" />
        <ellipse cx="-20" cy="30" rx="22" ry="12" fill="#E5A08A" opacity="0.55" />
      </g>
      {/* Little arms and feet. */}
      <ellipse cx="-90" cy="250" rx="60" ry="30" fill={P.dragonDeep} />
      <ellipse cx="90" cy="255" rx="60" ry="30" fill={P.dragonDeep} />
    </svg>
  );
}

// Pip: a small hero with a satchel of books.
function Pip({ t, x = 420, y = 820, scale = 1, talking = false }) {
  const bob = Math.sin(t / 12) * 3;
  return (
    <svg width="260" height="360" viewBox="-130 -300 260 360" style={{ position: "absolute", left: x - 130 * scale, top: y - 300 * scale, width: 260 * scale, height: 360 * scale, overflow: "visible" }}>
      <path d="M-60 40 L -45 -120 Q 0 -150 45 -120 L 60 40 Z" fill="#5F7FA6" transform={`translate(0 ${bob})`} />
      <rect x="-70" y="-60" width="46" height="60" rx="8" fill="#9C6B3E" transform={`translate(0 ${bob})`} />
      <circle cx="0" cy={-170 + bob} r="56" fill="#F2C9A5" />
      <path d={`M-58 ${-180 + bob} Q -50 ${-240 + bob} 0 ${-236 + bob} Q 56 ${-240 + bob} 60 ${-176 + bob} Q 20 ${-205 + bob} -58 ${-180 + bob} Z`} fill="#7A4A2A" />
      <circle cx="-18" cy={-170 + bob} r="6" fill={P.ink} />
      <circle cx="20" cy={-170 + bob} r="6" fill={P.ink} />
      <path d={`M-14 ${-146 + bob} Q 2 ${talking ? -130 + Math.abs(Math.sin(t / 3)) * 8 : -138} ${18} ${-146 + bob}`} stroke={P.ink} strokeWidth="4" fill={talking ? "#8A3B3B" : "none"} />
      <rect x="-40" y="40" width="26" height="30" fill="#3E3A38" /><rect x="14" y="40" width="26" height="30" fill="#3E3A38" />
    </svg>
  );
}

// A paper title plate that pops up.
function Plaque({ t, at, text, sub, y = 170 }) {
  const k = pop(t, at);
  return (
    <div style={{
      position: "absolute", left: "50%", top: y, transform: `translateX(-50%) scale(${lerp(0.7, 1, k)})`, opacity: Math.min(1, k * 2),
      background: P.paper, padding: "18px 60px 22px", borderRadius: 8, textAlign: "center",
      boxShadow: "0 12px 28px rgba(60,40,20,0.4), inset 0 0 0 3px #CDB88E, inset 0 0 0 7px " + P.paper + ", inset 0 0 0 8px #CDB88E",
    }}>
      <div style={{ fontFamily: CINZEL, fontSize: 66, color: P.ink, letterSpacing: 3 }}>{text}</div>
      {sub && <div style={{ fontFamily: FELL, fontStyle: "italic", fontSize: 36, color: "#6B5A48", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// A golden ring that grows round the chosen answer.
function Glow({ t, at, x, y, r = 110 }) {
  const k = pop(t, at);
  if (k <= 0) return null;
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `8px solid ${P.gold}`, transform: `scale(${lerp(1.5, 1, k)})`, opacity: Math.min(1, k * 1.5), boxShadow: `0 0 40px ${P.gold}` }} />;
}

// ---------- The riddles ----------

// Riddle 1: star banners. Four stars have five points; one has six.
const BANNERS = [
  { kind: "star", points: 5, r: 30, fill: "white" },
  { kind: "star", points: 5, r: 30, fill: "black", rot: 20 },
  { kind: "star", points: 6, r: 30, fill: "white" },
  { kind: "star", points: 5, r: 30, fill: "black" },
  { kind: "star", points: 5, r: 30, fill: "white", rot: -15 },
];
const bannerSpot = i => ({ x: TOWERS[i] - 10, y: 104, w: 140, h: 120 });

// Riddle 2: stepping stones across the moat. The arrows go left, up, right:
// a quarter turn clockwise each stone, so the next one points down.
const STONES = [300, 560, 820, 1080];
const STONE_Y = 760;
const STONE_ROTS = [180, 270, 0]; // left, up, right
const NEXT = [ // the three floating choices
  { id: "right", rot: 0, x: 1310, correct: false },  // hasn't turned
  { id: "down", rot: 90, x: 1545, correct: true },
  { id: "up", rot: -90, x: 1780, correct: false },   // turned back the wrong way
];
const PLACED = 3; // three stones placed; the fourth is the gap

// Riddle 3: an analogy. A small white circle becomes a big black circle.
// So a small white triangle becomes...?
const ANALOGY = [
  { id: "bigblack", label: "big black triangle", fill: "black", r: 78, correct: true, x: 1000 },
  { id: "bigwhite", label: "big white triangle", fill: "white", r: 78, correct: false, x: 1300 },
  { id: "smallblack", label: "small black triangle", fill: "black", r: 40, correct: false, x: 1600 },
];

// ---------- The film ----------
export default {
  id: "p3-dragon",
  order: 201,
  series: 3,
  title: "The Dragon's Three Riddles",
  genre: "Pop-up book",
  strap: "Help Pip past the dragon. Tap your answers on the page.",
  music: "music/dragon.wav",
  musicVolume: 0.16,
  cast: {
    herald: { name: "The Storyteller", voice: "bm_fable", speed: 0.9, colour: "#7A5C3E" },
    pip: { name: "Pip", voice: "bf_lily", speed: 1.02, colour: "#4F6F99" },
    ember: { name: "Ember", voice: "bm_george", speed: 0.82, colour: "#3A6E5F" },
  },
  Overlay,
  Subtitles,
  scenes: [
    {
      id: "open",
      next: "gate",
      beats: [
        { who: "herald", say: "Once upon a time, in a kingdom made of paper, there lived a reader called Pip.", sfxs: [{ sfx: "page", at: 0 }] },
        { who: "herald", say: "Pip had read every single book in the village, and now Pip wanted more." },
        { who: "pip", say: "The Library Tower! It has a book for every question in the world." },
      ],
      render: s => (
        <AbsoluteFill>
          <Sky t={s.t} />
          <Layer t={s.t} at={4} depth={1}><Hills colour={P.hillDeep} y={640} amp={90} seed={2} /></Layer>
          <Layer t={s.t} at={12} depth={2}>
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              <rect x="1380" y="210" width="170" height="460" fill={P.stoneDeep} />
              <path d="M1360 215 L1465 80 L1570 215 Z" fill={P.roof} />
              {[0, 1, 2, 3].map(i => <rect key={i} x="1440" y={270 + i * 95} width="50" height="60" rx="25" fill={P.gold} opacity={0.9} />)}
            </svg>
          </Layer>
          <Layer t={s.t} at={20} depth={3}><Hills colour={P.hill} y={780} amp={50} seed={5} /></Layer>
          <Layer t={s.t} at={28} depth={4}><Pip t={s.t} x={520} y={900} talking={s.beat === 2} /></Layer>
          <Plaque t={s.t} at={36} text="The Dragon's Three Riddles" sub="a play-along story" y={120} />
        </AbsoluteFill>
      ),
    },
    {
      id: "gate",
      next: "riddle1",
      beats: [
        { who: "herald", say: "But the only way to the tower was across the castle bridge. And the bridge had a guard.", sfxs: [{ sfx: "page", at: 0 }] },
        { who: "ember", say: "Halt, little reader! Nobody crosses my bridge unless they answer my three riddles.", sfxs: [{ sfx: "roar", at: 0, volume: 0.5 }] },
        { who: "pip", say: "Three riddles? I'm good at reading, but I'm not sure about riddles. Will you help me? You can tap the answers on the page." },
      ],
      render: s => (
        <AbsoluteFill>
          <Sky t={s.t} />
          <Layer t={s.t} at={4} depth={1}><Castle t={s.t} /></Layer>
          <Layer t={s.t} at={14} depth={3}><Hills colour={P.hill} y={880} amp={30} seed={9} /></Layer>
          <Layer t={s.t} at={s.at(1) - 10} depth={4}><Dragon t={s.t} x={1460} y={640} scale={1} talking={s.beat === 1} /></Layer>
          <Layer t={s.t} at={10} depth={4}><Pip t={s.t} x={430} y={960} talking={s.beat === 2} /></Layer>
        </AbsoluteFill>
      ),
    },

    // Riddle 1: the odd banner.
    {
      id: "riddle1",
      choice: {
        prompt: "Tap the banner that is the odd one out",
        next: "r1-yes",
        options: [
          ...[0, 1, 3, 4].map(i => ({ id: `b${i}`, ...bannerSpot(i), slip: i % 2 ? "r1-colour" : "r1-turn" })),
          { id: "b2", ...bannerSpot(2), correct: true },
        ],
      },
      beats: [
        { who: "ember", say: "Riddle number one! Look at the banners on my five towers. Four of them are the same in one way. One is different." },
        { who: "ember", say: "Which banner is the odd one out? Tap it!" },
      ],
      render: s => (
        <AbsoluteFill>
          <Sky t={s.t} />
          <Layer t={s.t} at={0} depth={1}><Castle t={s.t} banners={BANNERS} /></Layer>
          <Layer t={s.t} at={10} depth={3}><Hills colour={P.hill} y={900} amp={30} seed={9} /></Layer>
          <Plaque t={s.t} at={8} text="Riddle One" y={400} />
        </AbsoluteFill>
      ),
    },
    {
      id: "r1-colour",
      returnTo: "riddle1",
      beats: [{ who: "ember", say: "That star is black, but another star is black too, so colour can't be the answer. Count the points on every star." }],
      render: s => <AbsoluteFill><Sky t={s.t} /><Castle t={s.t} banners={BANNERS} /><Dragon t={s.t} x={1680} y={900} scale={0.7} talking /></AbsoluteFill>,
    },
    {
      id: "r1-turn",
      returnTo: "riddle1",
      beats: [{ who: "ember", say: "That star is only turned a little. A turned star is still the same star. Count the points on every star." }],
      render: s => <AbsoluteFill><Sky t={s.t} /><Castle t={s.t} banners={BANNERS} /><Dragon t={s.t} x={1680} y={900} scale={0.7} talking /></AbsoluteFill>,
    },
    {
      id: "r1-yes",
      next: "riddle2",
      beats: [
        { who: "ember", say: "Correct! Four stars have five points, but the middle one has six.", sfxs: [{ sfx: "fanfare", at: 0.2, volume: 0.7 }] },
        { who: "pip", say: "We did it! That's one riddle done, and two more to go." },
      ],
      render: s => (
        <AbsoluteFill>
          <Sky t={s.t} />
          <Castle t={s.t} banners={BANNERS} />
          <Glow t={s.t} at={6} x={TOWERS[2] + 60} y={164} r={86} />
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ position: "absolute", left: TOWERS[i] + 20, top: 230, width: 80, textAlign: "center", fontFamily: CINZEL, fontSize: 48, color: i === 2 ? P.gold : P.paper, textShadow: "0 3px 6px rgba(0,0,0,0.5)", opacity: rise(s.t, 10, 20 + i * 8) }}>
              {BANNERS[i].points}
            </div>
          ))}
          <Layer t={s.t} at={s.at(1) - 6} depth={4}><Pip t={s.t} x={430} y={960} talking={s.beat === 1} /></Layer>
        </AbsoluteFill>
      ),
    },

    // Riddle 2: the stepping stones.
    {
      id: "riddle2",
      choice: {
        prompt: "Tap the stone that comes next",
        next: "r2-yes",
        options: NEXT.map(n => ({ id: n.id, x: n.x - 110, y: 380, w: 220, h: 200, correct: n.correct, slip: n.correct ? undefined : `r2-${n.id}` })),
      },
      beats: [
        { who: "ember", say: "Riddle number two! To cross my moat, you need one more stepping stone." },
        { who: "ember", say: "Look at the arrows. They point left, then up, then right. On each stone, the arrow turns a quarter of the way round, clockwise." },
        { who: "ember", say: "Which stone comes next? Tap it!" },
      ],
      render: s => <StonesScene s={s} />,
    },
    {
      id: "r2-right",
      returnTo: "riddle2",
      beats: [{ who: "ember", say: "That arrow points right, the same as the last stone. It hasn't turned at all. The arrow needs one more quarter turn, clockwise." }],
      render: s => <StonesScene s={s} still />,
    },
    {
      id: "r2-up",
      returnTo: "riddle2",
      beats: [{ who: "ember", say: "Pointing up would mean turning back the other way. Clockwise is the way the hands of a clock go round. Turn the arrow that way, starting from right." }],
      render: s => <StonesScene s={s} still />,
    },
    {
      id: "r2-yes",
      next: "riddle3",
      beats: [
        { who: "ember", say: "Well done! The arrows go left, up, right, then down. Each one turns a quarter of the way round.", sfxs: [{ sfx: "fanfare", at: 0.1, volume: 0.7 }, { sfx: "splash", at: 1.2, volume: 0.6 }] },
        { who: "pip", say: "That's two riddles done. Just one more." },
      ],
      render: s => <StonesScene s={s} placed />,
    },

    // Riddle 3: the analogy.
    {
      id: "riddle3",
      choice: {
        prompt: "Tap what the little triangle becomes",
        next: "r3-yes",
        options: ANALOGY.map(a => ({ id: a.id, x: a.x - 130, y: 560, w: 260, h: 260, correct: a.correct, slip: a.correct ? undefined : `r3-${a.id}`, label: a.label })),
      },
      beats: [
        { who: "ember", say: "Riddle number three is the hardest of all. My magic changes shapes." },
        { who: "ember", say: "Watch. A small white circle... becomes a big black circle.", sfxs: [{ sfx: "magic", at: 1.6, volume: 0.6 }] },
        { who: "ember", say: "So what does the small white triangle become? Tap it!" },
      ],
      render: s => <MagicScene s={s} />,
    },
    {
      id: "r3-bigwhite",
      returnTo: "riddle3",
      beats: [{ who: "ember", say: "That triangle is bigger, but it is still white. My magic did two things to the circle. It grew, and it turned black. The triangle needs both changes." }],
      render: s => <MagicScene s={s} still />,
    },
    {
      id: "r3-smallblack",
      returnTo: "riddle3",
      beats: [{ who: "ember", say: "That triangle is black, but it is still small. My magic did two things to the circle. It turned black, and it grew. The triangle needs both changes." }],
      render: s => <MagicScene s={s} still />,
    },
    {
      id: "r3-yes",
      next: "end",
      beats: [
        { who: "ember", say: "Yes, a big black triangle! It made both changes, just like the circle. You've answered all three riddles!", sfxs: [{ sfx: "fanfare", at: 0.1, volume: 0.8 }] },
      ],
      render: s => <MagicScene s={s} solved />,
    },
    {
      id: "end",
      beats: [
        { who: "herald", say: "And so the dragon bowed low, and the great bridge came down.", sfxs: [{ sfx: "page", at: 0 }, { sfx: "drawbridge", at: 1.4, volume: 0.7 }] },
        { who: "ember", say: "Go on, little reader. Tell them at the tower that nothing gets past you." },
        { who: "pip", say: "Thank you, Ember. And thank you for helping me!" },
        { who: "herald", say: "The end. Or perhaps, just the beginning." },
      ],
      render: s => {
        const down = rise(s.t, 60, s.at(0) + 40);
        return (
          <AbsoluteFill>
            <Sky t={s.t} />
            <Layer t={s.t} at={2} depth={1}><Castle t={s.t} banners={BANNERS} /></Layer>
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              <rect x="880" y={820 - 260 * (1 - down)} width="160" height={260} fill="#8A6A4A" transform={`rotate(${lerp(-80, 0, down)} 960 820)`} />
            </svg>
            <Layer t={s.t} at={10} depth={3}><Hills colour={P.hill} y={900} amp={30} seed={9} /></Layer>
            <Layer t={s.t} at={10} depth={4}><Dragon t={s.t} x={1560} y={700} scale={0.9} talking={s.beat === 1} /></Layer>
            <Layer t={s.t} at={10} depth={4}><Pip t={s.t} x={lerp(430, 900, rise(s.t, 90, s.at(3)))} y={960} talking={s.beat === 2} /></Layer>
            <Plaque t={s.t} at={s.at(3) + 10} text="The End" sub="or just the beginning" y={140} />
          </AbsoluteFill>
        );
      },
    },
  ],
};

// The moat with stepping stones. `placed` shows the answer stone dropped in.
function StonesScene({ s, still = false, placed = false }) {
  const bob = n => Math.sin(s.t / 14 + n) * 8;
  return (
    <AbsoluteFill>
      <Sky t={s.t} />
      <Layer t={s.t} at={still ? -40 : 0} depth={1}><Hills colour={P.hillDeep} y={560} amp={60} seed={3} /></Layer>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, bottom: 0, background: `linear-gradient(${P.water}, #4F8698)` }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M ${((i * 190 + s.t * 1.5) % 2100) - 100} ${690 + (i % 4) * 110} q 30 -12 60 0`} stroke="#DDEFF2" strokeWidth="4" fill="none" opacity="0.6" />)}
        {STONES.map((x, i) => {
          const show = i < PLACED || placed;
          const drop = placed && i === PLACED ? rise(s.t, 20, 30) : 1;
          return show && (
            <g key={i} transform={`translate(${x} ${STONE_Y - (1 - drop) * 300})`} opacity={drop}>
              <ellipse cx="0" cy="40" rx="120" ry="44" fill={P.stoneDeep} />
              <ellipse cx="0" cy="20" rx="120" ry="44" fill={P.stone} />
              <g transform="translate(0 20) scale(1 0.55)"><Shape kind="arrow" r={60} fill="black" rot={i < PLACED ? STONE_ROTS[i] : 90} /></g>
            </g>
          );
        })}
        {!placed && <ellipse cx={STONES[PLACED]} cy={STONE_Y + 30} rx="120" ry="44" fill="none" stroke="#F4EBDA" strokeWidth="5" strokeDasharray="14 12" />}
        {/* The three floating choices. */}
        {!placed && NEXT.map((n, i) => (
          <g key={n.id} transform={`translate(${n.x} ${480 + bob(i)})`} opacity={still ? 1 : rise(s.t, 16, s.at(2) + i * 6)}>
            <ellipse cx="0" cy="20" rx="98" ry="60" fill={P.paper} stroke="#CDB88E" strokeWidth="4" />
            <Shape kind="arrow" r={56} fill="black" rot={n.rot} />
          </g>
        ))}
      </svg>
      {!still && !placed && (
        <div style={{ position: "absolute", left: 220, top: 836, display: "flex", gap: 128, fontFamily: CINZEL, fontSize: 38, color: P.paper, textShadow: "0 2px 6px rgba(20,40,50,0.8)", zIndex: 2, opacity: rise(s.t, 14, s.at(1) + 20) }}>
          {["left", "up", "right", "?"].map(w => <span key={w} style={{ width: 132, textAlign: "center" }}>{w}</span>)}
        </div>
      )}
      <Layer t={s.t} at={still ? -40 : 4} depth={4}><Dragon t={s.t} x={1720} y={930} scale={0.6} talking={!placed} flip /></Layer>
    </AbsoluteFill>
  );
}

// The dragon's magic: circle -> big black circle, and the triangle to transform.
function MagicScene({ s, still = false, solved = false }) {
  const grow = still || solved ? 1 : rise(s.t, 30, s.at(1) + 50);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #6B5A7A, #2E2438 75%)" }} />
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: hash(i) * 1920, top: hash(i + 9) * 700, width: 6, height: 6, borderRadius: 3, background: P.gold, opacity: 0.3 + 0.5 * Math.abs(Math.sin(s.t / 15 + i)) }} />
      ))}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {/* The example: small white circle becomes big black circle. */}
        <g transform="translate(260 300)"><Shape kind="circle" r={40} fill="white" /></g>
        <path d="M340 300 L 470 300" stroke={P.gold} strokeWidth="6" markerEnd="" />
        <path d="M455 285 L 475 300 L 455 315" stroke={P.gold} strokeWidth="6" fill="none" />
        <g transform="translate(600 300)" opacity={grow}><Shape kind="circle" r={lerp(40, 78, grow)} fill={grow > 0.5 ? "black" : "white"} /></g>
        {/* The question: small white triangle becomes... */}
        <g transform="translate(260 690)" opacity={still || solved ? 1 : rise(s.t, 16, s.at(2))}><Shape kind="triangle" r={40} fill="white" /></g>
        <path d="M340 690 L 470 690" stroke={P.gold} strokeWidth="6" opacity={still || solved ? 1 : rise(s.t, 16, s.at(2))} />
        <text x="600" y="715" textAnchor="middle" fontFamily={CINZEL} fontSize="90" fill={P.gold} opacity={solved ? 0 : still ? 1 : rise(s.t, 16, s.at(2))}>?</text>
        {solved && <g transform="translate(600 690)"><Shape kind="triangle" r={78} fill="black" draw={rise(s.t, 20, 10)} /></g>}
        {/* The choices on paper cards. */}
        {!solved && ANALOGY.map((a, i) => (
          <g key={a.id} opacity={still ? 1 : rise(s.t, 16, s.at(2) + 12 + i * 6)}>
            <rect x={a.x - 130} y={560} width={260} height={260} rx={16} fill={P.paper} stroke="#CDB88E" strokeWidth="4" />
            <Shape kind="triangle" r={a.r} fill={a.fill} x={a.x} y={690} />
          </g>
        ))}
      </svg>
      <Dragon t={s.t} x={1640} y={330} scale={0.55} talking={!solved || s.beat === 0} flip />
    </AbsoluteFill>
  );
}
