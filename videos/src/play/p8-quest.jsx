// Series 8, play-along film 1: "Shape Quest". A playable Game Boy style RPG.
// Four greens, chunky pixels, typed text boxes, and a battle menu where every
// attack is an answer. Three monsters guard the Library of Sharp Eyes: the Odd
// One Out Ogre, the Codes Goblin and the Mirror Wraith. A right answer is a
// critical hit; a slip costs a heart, the monster gloats, and the Sage helps.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadPixel } from "@remotion/google-fonts/PressStart2P";
import { rise, pop, lerp } from "../lib/anim.js";

const { fontFamily: PIXEL } = loadPixel("normal", { weights: ["400"], subsets: ["latin"] });

// The four Game Boy greens, darkest to lightest.
const G = ["#0F380F", "#306230", "#8BAC0F", "#9BBC0F"];
const DK = G[0], MD = G[1], LT = G[2], BG = G[3];
const hash = n => { const x = Math.sin(n * 91.345 + 47.853) * 43758.5453; return x - Math.floor(x); };

// ---------- Pixels ----------

// Draw a sprite from rows of characters: "." clear, "1".."4" = G[0..3].
function Sprite({ rows, x, y, px = 8, flip = false, opacity = 1 }) {
  const w = rows[0].length;
  const rects = [];
  rows.forEach((row, j) => [...row].forEach((c, i) => {
    if (c === ".") return;
    rects.push(<rect key={`${i}-${j}`} x={(flip ? w - 1 - i : i) * px} y={j * px} width={px + 0.5} height={px + 0.5} fill={G[+c - 1]} />);
  }));
  return <svg width={w * px} height={rows.length * px} style={{ position: "absolute", left: x, top: y, opacity, overflow: "visible" }} shapeRendering="crispEdges">{rects}</svg>;
}

// The hero: a little knight with a sword.
const HERO = [
  "....111111......",
  "...12222221.....",
  "...12111121.....",
  "...11344311.....",
  "...13434431.....",
  "....133331...1..",
  "...11222211.141.",
  "..1222222221141.",
  "..12122221211411",
  "..1.1222221.141.",
  "....1222221..1..",
  "....1221221.....",
  "....122.221.....",
  "...1111.1111....",
];
const HERO_STEP = [...HERO.slice(0, 12), "....122..221....", "...1111..1111..."];

// The Sage: an old owl in a hat.
const SAGE = [
  ".....1111.....",
  "....122221....",
  "...12222221...",
  "..1111111111..",
  "...13311331...",
  "...14131413...",
  "...13311331...",
  "....133331....",
  "...123333211..",
  "..12233332211.",
  "..12233332211.",
  "...12222221...",
  "....11..11....",
];

// Monsters are grown from a seed, mirror-symmetric like the old games.
function monster(seed, w = 7, h = 12, eyes = 3) {
  const half = [];
  for (let j = 0; j < h; j++) {
    let row = "";
    for (let i = 0; i < w; i++) {
      const edge = Math.abs(j - h / 2) / (h / 2) + (w - i) / w * 0.35;
      const v = hash(seed * 1000 + j * 31 + i * 7);
      row += v > edge * 0.95 ? (v > 0.8 ? "2" : "1") : ".";
    }
    half.push(row);
  }
  const rows = half.map(r => r + [...r].reverse().join(""));
  // Big bright eyes, and a toothy mouth.
  const e = rows.map(r => [...r]);
  const cx = w;
  e[eyes][cx - 3] = "4"; e[eyes][cx - 2] = "4"; e[eyes][cx + 1] = "4"; e[eyes][cx + 2] = "4";
  e[eyes + 1][cx - 3] = "4"; e[eyes + 1][cx - 2] = "1"; e[eyes + 1][cx + 1] = "1"; e[eyes + 1][cx + 2] = "4";
  for (let i = cx - 3; i <= cx + 2; i++) e[eyes + 4][i] = i % 2 ? "4" : "1";
  return e.map(r => r.join("").replace(/\./g, "."));
}
const OGRE = monster(3, 8, 13, 3);
const GOBLIN = monster(11, 7, 11, 3);
const WRAITH = monster(29, 8, 15, 4).map((r, j) => (j > 11 ? r.replace(/1/g, j % 2 ? "2" : ".") : r));

// Turn a polygon into chunky pixels: outline dark, inside in `fill`.
function PixelShape({ poly, cells = 14, px = 10, fill = BG, x = 0, y = 0 }) {
  const inside = (cx, cy) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > cy) !== (yj > cy) && cx < ((xj - xi) * (cy - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  };
  const cellIn = (i, j) => inside(((i + 0.5) / cells) * 2 - 1, ((j + 0.5) / cells) * 2 - 1);
  const rects = [];
  for (let j = 0; j < cells; j++) for (let i = 0; i < cells; i++) {
    if (!cellIn(i, j)) continue;
    const edge = !cellIn(i - 1, j) || !cellIn(i + 1, j) || !cellIn(i, j - 1) || !cellIn(i, j + 1);
    rects.push(<rect key={`${i}-${j}`} x={i * px} y={j * px} width={px + 0.5} height={px + 0.5} fill={edge ? DK : fill} />);
  }
  return <svg width={cells * px} height={cells * px} style={{ position: "absolute", left: x, top: y }} shapeRendering="crispEdges">{rects}</svg>;
}

// Polygons in -1..1 space.
const ngon = (n, r = 0.9, turn = -Math.PI / 2) => Array.from({ length: n }, (_, i) => [r * Math.cos(turn + (i * 2 * Math.PI) / n), r * Math.sin(turn + (i * 2 * Math.PI) / n)]);
const SQUARE = [[-0.75, -0.75], [0.75, -0.75], [0.75, 0.75], [-0.75, 0.75]];
const CIRCLE = ngon(24, 0.85);
// A clear flag: pole on the left, pennant pointing right at the top.
const FLAG_POLY = [[-0.6, -0.9], [0.75, -0.55], [-0.35, -0.2], [-0.35, 0.9], [-0.6, 0.9]];
const turn = (poly, deg, mirror = false) => {
  const a = (deg * Math.PI) / 180;
  return poly.map(([x, y]) => {
    const mx = mirror ? -x : x;
    return [mx * Math.cos(a) - y * Math.sin(a), mx * Math.sin(a) + y * Math.cos(a)];
  });
};

// ---------- Screen furniture ----------

// The dot-matrix screen: faint pixel grid over everything.
function Overlay() {
  return (
    <AbsoluteFill style={{ pointerEvents: "none", backgroundImage: `repeating-linear-gradient(0deg, rgba(15,56,15,0.07) 0 2px, transparent 2px 8px), repeating-linear-gradient(90deg, rgba(15,56,15,0.07) 0 2px, transparent 2px 8px)` }} />
  );
}

// A chunky double-bordered box, like every old RPG menu.
function Box({ x, y, w, h, children, style }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, background: BG, border: `8px solid ${DK}`, boxShadow: `inset 0 0 0 6px ${BG}, inset 0 0 0 12px ${MD}`, ...style }}>{children}</div>
  );
}

// The text box: words appear as they're spoken, like a real RPG.
function Subtitles({ words, spoken, opacity, actor, frame }) {
  const done = spoken >= words.length;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 28, height: 200, opacity: Math.max(0.999, opacity) }}>
      <Box x={0} y={0} w={1840} h={200}>
        <div style={{ position: "absolute", left: 40, top: 34, right: 60, fontFamily: PIXEL, fontSize: 34, lineHeight: 1.6, color: DK }}>
          {actor?.name && <span style={{ color: MD }}>{actor.name}: </span>}
          {words.slice(0, spoken).join(" ")}
        </div>
        {done && Math.floor(frame / 12) % 2 === 0 && <div style={{ position: "absolute", right: 40, bottom: 26, fontFamily: PIXEL, fontSize: 30, color: DK }}>▼</div>}
      </Box>
    </div>
  );
}

// Grass, trees and a path: the overworld.
function Overworld({ t }) {
  const tiles = [];
  for (let j = 0; j < 12; j++) for (let i = 0; i < 20; i++) {
    const k = hash(i * 57 + j * 13);
    if (k > 0.85) tiles.push(<g key={`${i}-${j}`}>{[[2, 3], [6, 1], [4, 5]].map(([a, b], n) => <rect key={n} x={i * 96 + a * 12} y={j * 96 + b * 12} width={12} height={12} fill={LT} />)}</g>);
  }
  const trees = [[80, 60], [260, 40], [1500, 70], [1700, 120], [1820, 30], [60, 420], [1760, 460]];
  return (
    <AbsoluteFill style={{ background: BG }}>
      <svg width="1920" height="1080" shapeRendering="crispEdges" style={{ position: "absolute", inset: 0 }}>
        {tiles}
        <rect x="0" y="560" width="1920" height="130" fill={LT} />
        {Array.from({ length: 40 }, (_, i) => <rect key={i} x={i * 48 + 8} y={575 + (i % 3) * 30} width={16} height={8} fill={MD} opacity={0.5} />)}
        {trees.map(([x, y], i) => (
          <g key={i}>
            <rect x={x + 32} y={y + 104} width={32} height={40} fill={MD} />
            <rect x={x} y={y + 24} width={96} height={80} fill={DK} />
            <rect x={x + 16} y={y} width={64} height={24} fill={DK} />
            <rect x={x + 16} y={y + 32} width={24} height={16} fill={MD} />
          </g>
        ))}
        {/* The Library of Sharp Eyes, far off. */}
        <rect x="860" y="120" width="200" height="300" fill={MD} />
        <rect x="840" y="96" width="240" height="32" fill={DK} />
        <rect x="920" y="300" width="80" height="120" fill={DK} />
        {[0, 1, 2].map(i => <rect key={i} x={880 + i * 56} y={170} width={32} height={48} fill={LT} />)}
        <rect x="930" y="40" width="60" height="60" fill={DK} />
        <rect x="945" y="55" width="30" height="30" fill={LT} />
      </svg>
    </AbsoluteFill>
  );
}

// The white flash and stripy wipe when a monster appears.
function Encounter({ t }) {
  if (t > 40) return null;
  const k = t / 40;
  return (
    <AbsoluteFill>
      {Array.from({ length: 12 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, top: i * 90, height: 90, width: `${Math.max(0, 1 - k * 1.6 + (i % 2) * 0.2) * 100}%`, background: i % 2 ? DK : MD, marginLeft: i % 2 ? "auto" : 0, right: i % 2 ? 0 : "auto" }} />
      ))}
    </AbsoluteFill>
  );
}

// ---------- Battle screen ----------

const MENU = { x: 1010, y: 560, w: 420, h: 110, gx: 20, gy: 16 };
const menuAt = i => ({ x: MENU.x + (i % 2) * (MENU.w + MENU.gx), y: MENU.y + Math.floor(i / 2) * (MENU.h + MENU.gy) });
const menuSpots = (labels, correct, slips) => labels.map((label, i) => ({ id: `m${i}`, label, ...menuAt(i), w: MENU.w, h: MENU.h, correct: i === correct, slip: i === correct ? undefined : slips[i] }));

function Hearts({ n, broken = -1, t = 0 }) {
  return (
    <div style={{ position: "absolute", left: 80, top: 720, display: "flex", gap: 16 }}>
      {[0, 1, 2].map(i => {
        const gone = i >= n;
        const breaking = i === broken;
        return (
          <svg key={i} width="56" height="48" viewBox="0 0 7 6" shapeRendering="crispEdges" style={{ transform: breaking ? `translateY(${Math.min(40, t)}px) rotate(${Math.min(40, t) * 2}deg)` : "none", opacity: breaking ? Math.max(0, 1 - t / 40) : 1 }}>
            <path d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z" fill={gone && !breaking ? MD : DK} />
            {!gone && <rect x="1" y="1" width="1" height="1" fill={BG} />}
          </svg>
        );
      })}
    </div>
  );
}

function HPBar({ x, y, name, hp, level = 5 }) {
  return (
    <Box x={x} y={y} w={640} h={130}>
      <div style={{ position: "absolute", left: 30, top: 24, fontFamily: PIXEL, fontSize: 28, color: DK }}>{name}</div>
      <div style={{ position: "absolute", right: 30, top: 24, fontFamily: PIXEL, fontSize: 22, color: MD }}>LV{level}</div>
      <div style={{ position: "absolute", left: 30, top: 76, fontFamily: PIXEL, fontSize: 20, color: DK }}>HP</div>
      <div style={{ position: "absolute", left: 96, top: 72, width: 480, height: 26, background: MD, border: `4px solid ${DK}` }}>
        <div style={{ width: `${hp * 100}%`, height: "100%", background: DK }} />
      </div>
    </Box>
  );
}

// The battle scene. `puzzle` draws the riddle; `menu` labels the four attacks.
function Battle({ t, name, sprite, hp = 1, hearts = 3, puzzle, menu, pointer = -1, hit = null, hurt = null, still = false }) {
  const shake = hit ? Math.max(0, 1 - (t - hit) / 18) * (hash(t) - 0.5) * 30 : 0;
  const flash = hit && t >= hit && t < hit + 6 && Math.floor((t - hit) / 2) % 2 === 0;
  const hurtShake = hurt ? Math.max(0, 1 - (t - hurt) / 16) * (hash(t + 3) - 0.5) * 24 : 0;
  const monsterGone = hit ? rise(t, 30, hit + 30) : 0;
  const bob = Math.round(Math.sin(t / 10) * 2) * 8;
  return (
    <AbsoluteFill style={{ background: BG, transform: `translate(${shake + hurtShake}px, ${-shake}px)` }}>
      <HPBar x={60} y={40} name={name} hp={hit ? lerp(hp, 0, rise(t, 20, hit + 4)) : hp} />
      {/* The monster, on its little ground patch. */}
      <div style={{ position: "absolute", left: 1320, top: 520, width: 460, height: 60, borderRadius: "50%", background: LT }} />
      <Sprite rows={sprite} x={1360} y={130 + bob} px={24} opacity={1 - monsterGone} />
      {/* The hero, seen from behind-ish, bottom left. */}
      <div style={{ position: "absolute", left: 60, top: 640, width: 360, height: 50, borderRadius: "50%", background: LT }} />
      <Sprite rows={HERO} x={140} y={440 - (hit && t > hit - 12 && t < hit ? 40 : 0)} px={16} />
      <Hearts n={hearts} broken={hurt != null ? hearts : -1} t={hurt != null ? t - hurt : 0} />
      {/* The riddle, in a box at the top middle. */}
      <Box x={740} y={40} w={1120} h={470}>{puzzle}</Box>
      {/* The battle menu: every attack is an answer. */}
      {menu.map((m, i) => {
        const p = menuAt(i);
        return (
          <Box key={i} x={p.x} y={p.y} w={MENU.w} h={MENU.h}>
            <div style={{ position: "absolute", left: 26, top: 34, fontFamily: PIXEL, fontSize: 30, color: DK, whiteSpace: "nowrap" }}>
              <span style={{ color: pointer === i && Math.floor(t / 8) % 2 === 0 ? DK : BG }}>▶</span> {m}
            </div>
          </Box>
        );
      })}
      {/* The hit: a big damage number and a star burst. */}
      {hit && t >= hit && (
        <>
          <div style={{ position: "absolute", left: 1480, top: 200 - Math.min(60, (t - hit) * 3), fontFamily: PIXEL, fontSize: 64, color: DK, opacity: 1 - rise(t, 20, hit + 30) }}>CRIT! 99</div>
          <svg width="400" height="400" viewBox="-5 -5 10 10" shapeRendering="crispEdges" style={{ position: "absolute", left: 1400, top: 160, opacity: 1 - rise(t, 16, hit + 10) }}>
            {[[0, -4], [0, 4], [-4, 0], [4, 0], [-3, -3], [3, 3], [-3, 3], [3, -3]].map(([a, b], i) => <rect key={i} x={a * Math.min(1, (t - hit) / 8) - 0.5} y={b * Math.min(1, (t - hit) / 8) - 0.5} width={1} height={1} fill={DK} />)}
          </svg>
        </>
      )}
      {flash && <AbsoluteFill style={{ background: "#E8F5B0" }} />}
    </AbsoluteFill>
  );
}

// Four little framed figures, lettered A to D, inside the riddle box.
function Figures({ items, label = true }) {
  return items.map((it, i) => (
    <div key={i} style={{ position: "absolute", left: 60 + i * 260, top: 90, width: 220, height: 220, background: BG, border: `6px solid ${DK}` }}>
      {it}
      {label && <div style={{ position: "absolute", left: 0, right: 0, top: 236, textAlign: "center", fontFamily: PIXEL, fontSize: 30, color: DK }}>{"ABCD"[i]}</div>}
    </div>
  ));
}
const Title = ({ text }) => <div style={{ position: "absolute", left: 40, top: 30, fontFamily: PIXEL, fontSize: 26, color: MD }}>{text}</div>;

// Riddle 1: dots in a box. Three have three dots; one has four.
const dots = (pts, fill = DK) => pts.map(([a, b], i) => <div key={i} style={{ position: "absolute", left: a, top: b, width: 40, height: 40, background: fill, boxShadow: `inset 0 0 0 6px ${DK}` }} />);
const OGRE_FIGS = [
  dots([[40, 40], [130, 90], [40, 140]]),
  dots([[90, 30], [30, 130], [140, 130]], MD),
  dots([[30, 30], [140, 30], [30, 140], [140, 140]]),
  dots([[30, 90], [90, 90], [150, 90]]),
];
const OgrePuzzle = () => <><Title text="WHICH ONE IS THE ODD ONE OUT?" /><Figures items={OGRE_FIGS} /></>;

// Riddle 2: codes. First letter is the shape, second letter is the shading.
function CodeFig({ poly, fill, code, x }) {
  return (
    <div style={{ position: "absolute", left: x, top: 90, width: 200, height: 250 }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 200, height: 200, background: BG, border: `6px solid ${DK}` }}>
        <PixelShape poly={poly} cells={14} px={11} fill={fill} x={23} y={23} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 216, textAlign: "center", fontFamily: PIXEL, fontSize: 34, color: DK }}>{code}</div>
    </div>
  );
}
const GoblinPuzzle = () => (
  <>
    <Title text="CRACK THE CODE OF THE NEW ONE" />
    <CodeFig poly={CIRCLE} fill={DK} code="RX" x={50} />
    <CodeFig poly={CIRCLE} fill={BG} code="RY" x={290} />
    <CodeFig poly={SQUARE} fill={DK} code="TX" x={530} />
    <div style={{ position: "absolute", left: 760, top: 200, fontFamily: PIXEL, fontSize: 40, color: MD }}>▶</div>
    <CodeFig poly={SQUARE} fill={BG} code="??" x={850} />
  </>
);

// Riddle 3: four flags. Three are only turned; one is flipped.
const WRAITH_FIGS = [
  <PixelShape key="a" poly={turn(FLAG_POLY, 90)} cells={16} px={11} fill={LT} x={22} y={22} />,
  <PixelShape key="b" poly={turn(FLAG_POLY, 180)} cells={16} px={11} fill={LT} x={22} y={22} />,
  <PixelShape key="c" poly={turn(FLAG_POLY, 0, true)} cells={16} px={11} fill={LT} x={22} y={22} />,
  <PixelShape key="d" poly={turn(FLAG_POLY, 270)} cells={16} px={11} fill={LT} x={22} y={22} />,
];
const WraithPuzzle = () => <><Title text="WHICH FLAG IS FLIPPED?" /><Figures items={WRAITH_FIGS} /></>;

const ABCD = ["A", "B", "C", "D"];

// A slip scene: the monster gloats, a heart breaks, the Sage gives a hint.
const slip = (back, battle, lines) => ({
  returnTo: back,
  beats: lines,
  render: s => <Battle t={s.t} {...battle} hurt={8} hearts={2} still />,
});

// ---------- The film ----------
const OGRE_B = { name: "ODD OGRE", sprite: OGRE, puzzle: <OgrePuzzle />, menu: ABCD };
const GOBLIN_B = { name: "CODE GOBLIN", sprite: GOBLIN, puzzle: <GoblinPuzzle />, menu: ["TY", "TX", "RY", "YT"] };
const WRAITH_B = { name: "MIRROR WRAITH", sprite: WRAITH, puzzle: <WraithPuzzle />, menu: ABCD };

export default {
  id: "p8-quest",
  order: 701,
  series: 8,
  title: "Shape Quest",
  strap: "A retro adventure. Every attack is an answer. Defeat three monsters to reach the Library of Sharp Eyes.",
  music: "music/quest.wav",
  musicVolume: 0.13,
  cast: {
    narrator: { name: "", voice: "bm_lewis", speed: 1.0 },
    sage: { name: "SAGE", voice: "bf_alice", speed: 0.95 },
    ogre: { name: "OGRE", voice: "bm_george", speed: 0.82 },
    goblin: { name: "GOBLIN", voice: "bm_fable", speed: 1.12 },
    wraith: { name: "WRAITH", voice: "bm_fable", speed: 0.8 },
  },
  Overlay,
  Subtitles,
  scenes: [
    {
      id: "title",
      next: "village",
      beats: [{ who: "narrator", say: "Shape Quest. Press start!", sfxs: [{ sfx: "quest-select", at: 1.4 }] }],
      render: s => (
        <AbsoluteFill style={{ background: BG }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: PIXEL, fontSize: 130, color: DK, textShadow: `8px 8px 0 ${LT}`, transform: `translateY(${(1 - Math.min(1, s.t / 30)) * -300}px)` }}>SHAPE<br />QUEST</div>
          <Sprite rows={HERO} x={560} y={560} px={16} />
          <Sprite rows={OGRE} x={1150} y={520} px={14} />
          {Math.floor(s.t / 15) % 2 === 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: PIXEL, fontSize: 40, color: DK }}>PRESS START</div>}
        </AbsoluteFill>
      ),
    },
    {
      id: "village",
      next: "ogre-appears",
      beats: [
        { who: "narrator", say: "Far away stands the Library of Sharp Eyes. Every book in the world is inside." },
        { who: "sage", say: "Hoo! Young hero. Three monsters guard the road. Each one asks a riddle. Answer right, and your attack hits for sure." },
        { who: "sage", say: "Choose your attack by tapping it. Ready? Here comes the first!" },
      ],
      render: s => {
        const walk = Math.min(1, s.t / (s.length * 0.7));
        const step = Math.floor(s.t / 8) % 2;
        return (
          <AbsoluteFill>
            <Overworld t={s.t} />
            <Sprite rows={step ? HERO_STEP : HERO} x={lerp(120, 760, walk)} y={500} px={10} />
            <Sprite rows={SAGE} x={1040} y={480} px={10} />
            {s.beat >= 1 && <Box x={1000} y={380} w={200} h={80}><div style={{ position: "absolute", left: 60, top: 18, fontFamily: PIXEL, fontSize: 30, color: DK }}>!</div></Box>}
          </AbsoluteFill>
        );
      },
    },

    // Battle 1: the Odd One Out Ogre.
    {
      id: "ogre-appears",
      next: "ogre",
      beats: [
        { who: "narrator", say: "A wild Odd Ogre appeared!", sfxs: [{ sfx: "quest-appear", at: 0 }] },
        { who: "ogre", say: "Hur hur! Four boxes of dots. Three belong together. One does not. Which is the odd one out?" },
      ],
      render: s => <><Battle t={s.t} {...OGRE_B} /><Encounter t={s.t} /></>,
    },
    {
      id: "ogre",
      choice: { prompt: "Tap your attack", next: "ogre-win", options: menuSpots(ABCD, 2, ["ogre-slip-a", "ogre-slip-b", null, "ogre-slip-a"]) },
      beats: [{ who: "sage", say: "Count carefully, hero. What's the same about three of them?" }],
      render: s => <Battle t={s.t} {...OGRE_B} pointer={0} />,
    },
    { id: "ogre-slip-a", ...slip("ogre", OGRE_B, [
      { who: "ogre", say: "Ha! Missed! That box has three dots, just like two others.", sfxs: [{ sfx: "quest-hurt", at: 0 }] },
      { who: "sage", say: "Hoo. Don't look at where the dots are. Count them!" },
    ]) },
    { id: "ogre-slip-b", ...slip("ogre", OGRE_B, [
      { who: "ogre", say: "Ha! Those dots are a different shade, but so what? Missed!", sfxs: [{ sfx: "quest-hurt", at: 0 }] },
      { who: "sage", say: "Shading is a red herring here. Count how many dots are in each box." },
    ]) },
    {
      id: "ogre-win",
      next: "goblin-appears",
      beats: [
        { who: "narrator", say: "Critical hit! Box C has four dots. All the others have three!", sfxs: [{ sfx: "quest-hit", at: 0.3 }] },
        { who: "ogre", say: "Ooof! How many... was the secret. Hurr..." },
        { who: "narrator", say: "The Odd Ogre was defeated! You gained 50 experience.", sfxs: [{ sfx: "quest-victory", at: 0 }] },
      ],
      render: s => <Battle t={s.t} {...OGRE_B} pointer={2} hit={10} />,
    },

    // Battle 2: the Codes Goblin.
    {
      id: "goblin-appears",
      next: "goblin",
      beats: [
        { who: "narrator", say: "A sneaky Code Goblin appeared!", sfxs: [{ sfx: "quest-appear", at: 0 }] },
        { who: "goblin", say: "Hee hee! Every shape has a secret code. Circle black is R X. Circle white is R Y. Square black is T X. What's the code for the white square?", voice: "Hee hee! Every shape has a secret code. Circle black is R, X. Circle white is R, Y. Square black is T, X. What's the code for the white square?" },
      ],
      render: s => <><Battle t={s.t} {...GOBLIN_B} /><Encounter t={s.t} /></>,
    },
    {
      id: "goblin",
      choice: { prompt: "Tap your attack", next: "goblin-win", options: menuSpots(GOBLIN_B.menu, 0, [null, "goblin-slip-tx", "goblin-slip-ry", "goblin-slip-yt"]) },
      beats: [{ who: "sage", say: "Find two shapes that share a letter. What else do they share?" }],
      render: s => <Battle t={s.t} {...GOBLIN_B} pointer={0} />,
    },
    { id: "goblin-slip-tx", ...slip("goblin", GOBLIN_B, [
      { who: "goblin", say: "Hee! T X is a black square. Mine is white! Missed!", sfxs: [{ sfx: "quest-hurt", at: 0 }] },
      { who: "sage", say: "X is on both black shapes. So which letter means white?" },
    ]) },
    { id: "goblin-slip-ry", ...slip("goblin", GOBLIN_B, [
      { who: "goblin", say: "Hee! R is on both circles. My new shape isn't a circle! Missed!", sfxs: [{ sfx: "quest-hurt", at: 0 }] },
      { who: "sage", say: "R means circle. So which letter means square?" },
    ]) },
    { id: "goblin-slip-yt", ...slip("goblin", GOBLIN_B, [
      { who: "goblin", say: "Hee hee! Right letters, wrong order! The shape letter comes first!", sfxs: [{ sfx: "quest-hurt", at: 0 }] },
      { who: "sage", say: "So close, hero. Shape first, then shading." },
    ]) },
    {
      id: "goblin-win",
      next: "wraith-appears",
      beats: [
        { who: "narrator", say: "Critical hit! T means square, and Y means white. T, Y!", sfxs: [{ sfx: "quest-hit", at: 0.3 }] },
        { who: "goblin", say: "Nooo! My code is cracked!" },
        { who: "narrator", say: "The Code Goblin ran away! Just one monster left.", sfxs: [{ sfx: "quest-victory", at: 0 }] },
      ],
      render: s => <Battle t={s.t} {...GOBLIN_B} pointer={0} hit={10} />,
    },

    // Battle 3: the Mirror Wraith.
    {
      id: "wraith-appears",
      next: "wraith",
      beats: [
        { who: "narrator", say: "The air goes cold. The Mirror Wraith appeared!", sfxs: [{ sfx: "quest-appear", at: 0 }] },
        { who: "wraith", say: "Four flags... three are only turned... one of them is flipped, like a reflection in my mirror. Which one?" },
      ],
      render: s => <><Battle t={s.t} {...WRAITH_B} /><Encounter t={s.t} /></>,
    },
    {
      id: "wraith",
      choice: { prompt: "Tap your attack", next: "wraith-win", options: menuSpots(ABCD, 2, ["wraith-slip-turned", "wraith-slip-upside", null, "wraith-slip-turned"]) },
      beats: [{ who: "sage", say: "Imagine turning each flag round until its pole stands up. Which one points the wrong way?" }],
      render: s => <Battle t={s.t} {...WRAITH_B} pointer={0} />,
    },
    { id: "wraith-slip-upside", ...slip("wraith", WRAITH_B, [
      { who: "wraith", say: "Upside down... is only turned... Missed...", sfxs: [{ sfx: "quest-hurt", at: 0 }] },
      { who: "sage", say: "Spin flag B halfway round and it's the same as a normal flag. Turned, not flipped!" },
    ]) },
    { id: "wraith-slip-turned", ...slip("wraith", WRAITH_B, [
      { who: "wraith", say: "That one is only turned... Missed...", sfxs: [{ sfx: "quest-hurt", at: 0 }] },
      { who: "sage", say: "Turn it until the pole stands up. Does the flag point right, like the others? Then it's only turned." },
    ]) },
    {
      id: "wraith-win",
      next: "level-up",
      beats: [
        { who: "narrator", say: "Critical hit! Flag C is flipped. However you turn it, it points the wrong way!", sfxs: [{ sfx: "quest-hit", at: 0.3 }] },
        { who: "wraith", say: "Nooo... nothing... gets past... you..." },
        { who: "narrator", say: "The Mirror Wraith faded away! The road to the Library is clear!", sfxs: [{ sfx: "quest-victory", at: 0 }] },
      ],
      render: s => <Battle t={s.t} {...WRAITH_B} pointer={2} hit={10} />,
    },
    {
      id: "level-up",
      beats: [
        { who: "narrator", say: "Level up! You are now: Nothing Gets Past You, level two!", sfxs: [{ sfx: "quest-levelup", at: 0.4 }] },
        { who: "sage", say: "Hoo hoo! Welcome to the Library of Sharp Eyes, hero. The end... of this quest." },
      ],
      render: s => (
        <AbsoluteFill style={{ background: BG }}>
          <Box x={360} y={120} w={1200} h={560}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", fontFamily: PIXEL, fontSize: 70, color: DK, transform: `scale(${1 + (Math.floor(s.t / 10) % 2) * 0.04})` }}>LEVEL UP!</div>
            <div style={{ position: "absolute", left: 80, top: 200, fontFamily: PIXEL, fontSize: 30, lineHeight: 2, color: DK }}>
              NOTHING GETS PAST YOU<br />LV 1 ▶ LV 2<br />
              <span style={{ color: MD }}>EYES  +3</span><br />
              <span style={{ color: MD }}>WITS  +3</span>
            </div>
            <Sprite rows={HERO} x={930} y={220} px={14} />
          </Box>
          {s.beat === 1 && <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontFamily: PIXEL, fontSize: 44, color: DK, opacity: rise(s.t, 10, s.at(1) + 20) }}>THE END</div>}
        </AbsoluteFill>
      ),
    },
  ],
};
