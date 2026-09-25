// Series 2, film 2: "Code Breaker 3000". An 8-bit arcade game.
// An arcade announcer and Byte the robot teach Player One to crack codes:
// each letter stands for one thing about a sprite. CRT scanlines, pixel
// sprites, a chiptune score, levels, a bonus round and a high-score table.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/PressStart2P";
import { rise, pop, window, lerp } from "../lib/anim.js";

const { fontFamily: PIXEL } = loadFont();

const BG = "#070A18";
const CYAN = "#3CF0FF";
const PINK = "#FF4FB8";
const YELLOW = "#FFE14D";
const GREEN = "#4DFF88";
const ORANGE = "#FF9A3C";
const DIM = "#3A3F5C";

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const blink = (t, rate = 16) => Math.floor(t / rate) % 2 === 0;

// ---------- Pixel sprites ----------
// Each kind is a test: is the point (x, y) in -1..1 inside the shape? (y points down)
function starPoly(points = 5, inner = 0.42) {
  return Array.from({ length: points * 2 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const r = i % 2 ? inner : 1;
    return [r * Math.cos(a), r * Math.sin(a)];
  });
}
function inPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const STAR = starPoly();
const KINDS = {
  circle: (x, y) => x * x + y * y <= 0.9,
  square: (x, y) => Math.abs(x) <= 0.78 && Math.abs(y) <= 0.78,
  diamond: (x, y) => Math.abs(x) + Math.abs(y) <= 0.95,
  triangle: (x, y) => y <= 0.8 && y >= -0.9 && Math.abs(x) <= (y + 0.9) * 0.56,
  heart: (x, y) => {
    const X = x * 1.15, Y = -y * 1.15 + 0.3;
    return (X * X + Y * Y - 1) ** 3 - X * X * Y ** 3 <= 0;
  },
  cross: (x, y) => (Math.abs(x) <= 0.3 && Math.abs(y) <= 0.9) || (Math.abs(y) <= 0.3 && Math.abs(x) <= 0.9),
  arrow: (x, y) => (Math.abs(x) <= 0.26 && y >= -0.15 && y <= 0.92) || (y < -0.15 && y >= -0.95 && Math.abs(x) <= ((y + 0.95) / 0.8) * 0.78),
  star: (x, y) => inPoly(x, y, STAR),
};

// A shape drawn as chunky pixels. fill: solid | hollow | dither.
// rot turns it; `reveal` 0..1 draws it row by row like a loading sprite.
function Sprite({ kind, fill = "solid", rot = 0, color = CYAN, cells = 16, px = 12, x, y, reveal = 1, glow = 1 }) {
  const test = KINDS[kind];
  if (!test) throw new Error(`No sprite kind ${kind}`);
  const a = (-rot * Math.PI) / 180;
  const inside = (i, j) => {
    if (i < 0 || j < 0 || i >= cells || j >= cells) return false;
    const u = ((i + 0.5) / cells) * 2 - 1, v = ((j + 0.5) / cells) * 2 - 1;
    return test(u * Math.cos(a) - v * Math.sin(a), u * Math.sin(a) + v * Math.cos(a));
  };
  const rects = [];
  const rows = Math.floor(reveal * cells + 0.001);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cells; i++) {
    if (!inside(i, j)) continue;
    const edge = !inside(i - 1, j) || !inside(i + 1, j) || !inside(i, j - 1) || !inside(i, j + 1);
    const on = fill === "solid" || edge || (fill === "dither" && (i + j) % 2 === 0);
    if (on) rects.push(<rect key={`${i}-${j}`} x={i * px} y={j * px} width={px - 1} height={px - 1} fill={color} />);
  }
  const size = cells * px;
  return (
    <svg width={size} height={size} style={{
      position: "absolute", left: x - size / 2, top: y - size / 2, overflow: "visible",
      filter: glow ? `drop-shadow(0 0 ${6 * glow}px ${color})` : "none",
    }} shapeRendering="crispEdges">{rects}</svg>
  );
}

// ---------- The cabinet ----------

// CRT: scanlines, a bright bloom, curved dark corners and the bezel.
function Overlay({ frame, scene }) {
  const roll = (frame * 3) % 1080;
  const score = [0, 0, 0, 0, 1000, 3000, 8000, 8000][scene.index] ?? 8000;
  const credit = scene.index === 0 && frame < 150 ? 0 : 1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* The heads-up display along the top of the screen. */}
      <div style={{ position: "absolute", top: 58, left: 110, right: 110, display: "flex", justifyContent: "space-between", fontFamily: PIXEL, fontSize: 26, color: "#fff" }}>
        <span><span style={{ color: PINK }}>1UP </span>{String(score).padStart(6, "0")}</span>
        <span><span style={{ color: YELLOW }}>HI </span>999999</span>
        <span><span style={{ color: CYAN }}>CREDIT </span>{credit}</span>
      </div>
      <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 2px, transparent 2px 4px)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: roll, height: 140, background: "linear-gradient(transparent, rgba(160,200,255,0.05), transparent)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 60%, rgba(0,0,0,0.55) 90%, rgba(0,0,0,0.9) 100%)" }} />
      {/* The cabinet bezel with its rounded screen opening. */}
      <AbsoluteFill style={{ borderRadius: 60, boxShadow: "0 0 0 40px #111, inset 0 0 60px rgba(0,0,0,0.9)", margin: 22 }} />
      <AbsoluteFill style={{ border: "22px solid #111" }} />
    </AbsoluteFill>
  );
}

function Backdrop({ frame }) {
  // A slow scrolling star field behind every screen.
  const stars = Array.from({ length: 90 }, (_, i) => {
    const x = hash(i) * 1920;
    const y = (hash(i + 7) * 1080 + frame * (0.6 + hash(i + 3) * 1.6)) % 1080;
    const tw = hash(i + Math.floor(frame / 10)) > 0.85 ? 0.3 : 1;
    return <rect key={i} x={x} y={y} width={3} height={3} fill="#9FB2FF" opacity={0.5 * tw} />;
  });
  return <AbsoluteFill style={{ background: BG }}><svg width="1920" height="1080">{stars}</svg></AbsoluteFill>;
}

// The dialogue box, like a retro role-playing game, with a name tag.
function Subtitles({ words, spoken, opacity, actor }) {
  const colour = actor?.colour ?? "#fff";
  return (
    <div style={{
      position: "absolute", left: 150, right: 150, bottom: 70, minHeight: 130, opacity,
      background: "rgba(5,7,20,0.92)", border: `5px solid ${colour}`, boxShadow: `0 0 18px ${colour}66`,
      padding: "30px 34px 22px", fontFamily: PIXEL, fontSize: 25, lineHeight: 1.7, color: "#fff",
    }}>
      {actor && <div style={{ position: "absolute", top: -22, left: 26, background: BG, border: `4px solid ${colour}`, color: colour, padding: "6px 14px", fontSize: 20 }}>{actor.name}</div>}
      {words.map((w, i) => <span key={i} style={{ color: i < spoken ? "#fff" : "#4A4F6E" }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
    </div>
  );
}

// Byte the robot: blinking eyes, a light on his antenna when he talks.
function Byte({ x, y, t, talking = false, scale = 1 }) {
  const px = 10 * scale;
  const eyesOpen = Math.floor(t / 75) % 12 !== 0;
  const mouth = talking && Math.floor(t / 4) % 2 === 0;
  const P = (i, j, c, w = 1, h = 1) => <rect key={`${i}-${j}-${c}`} x={i * px} y={j * px} width={w * px - 1} height={h * px - 1} fill={c} />;
  const bob = Math.sin(t / 12) * 6;
  return (
    <svg width={16 * px} height={20 * px} style={{ position: "absolute", left: x, top: y + bob, filter: `drop-shadow(0 0 8px ${CYAN}88)` }} shapeRendering="crispEdges">
      {P(7, 0, talking && blink(t, 6) ? YELLOW : ORANGE, 2, 2)}
      {P(7.5, 2, "#9AA4C8", 1, 2)}
      {P(2, 4, "#C8D0F0", 12, 8)}
      {P(3, 5, "#1A1F3A", 10, 6)}
      {eyesOpen ? [P(5, 6, CYAN, 2, 2), P(9, 6, CYAN, 2, 2)] : [P(5, 7, CYAN, 2, 1), P(9, 7, CYAN, 2, 1)]}
      {P(6, 9, mouth ? PINK : "#556", mouth ? 4 : 4, mouth ? 1.5 : 1)}
      {P(0, 6, "#9AA4C8", 2, 3)}{P(14, 6, "#9AA4C8", 2, 3)}
      {P(4, 12, "#9AA4C8", 8, 1)}
      {P(3, 13, "#C8D0F0", 10, 6)}
      {P(5, 14, blink(t, 20) ? GREEN : "#1A1F3A", 2, 2)}{P(9, 14, blink(t + 10, 20) ? PINK : "#1A1F3A", 2, 2)}
    </svg>
  );
}

// Big pixel text with a glow.
function PText({ children, x, y, size = 40, color = "#fff", align = "left", width, opacity = 1, style }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width, textAlign: align, opacity,
      fontFamily: PIXEL, fontSize: size, color, lineHeight: 1.5,
      textShadow: `0 0 10px ${color}, 0 4px 0 rgba(0,0,0,0.6)`, ...style,
    }}>{children}</div>
  );
}

// ---------- The puzzle board ----------
const CARD = 250;
const COLX = [140, 440, 740];
const CARD_Y = 200;
const MYST = { x: 1110, y: 180, w: 290 };
const OPT = { x: 300, y: 690, w: 230, gap: 40 };

function Card({ x, y, w = CARD, border = CYAN, pulse = 0, children, dim = 0 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, height: w, background: "rgba(10,14,34,0.9)",
      border: `5px solid ${border}`, boxShadow: `0 0 ${14 + 16 * pulse}px ${border}${pulse ? "cc" : "55"}`, opacity: 1 - dim * 0.7,
    }}>{children}</div>
  );
}

// Three coded sprites, each with its code in big pixel letters.
function Board({ s, sprites, glow = {}, scan = [], dim = [] }) {
  return sprites.map((sp, i) => {
    const a = rise(s.t, 8, 6 + i * 10);
    return (
      <div key={i} style={{ opacity: a }}>
        <Card x={COLX[i]} y={CARD_Y} border={scan.includes(i) ? YELLOW : CYAN} pulse={scan.includes(i) ? 1 : 0} dim={dim.includes(i) ? 1 : 0}>
          <Sprite {...sp.sprite} x={CARD / 2 - 5} y={CARD / 2 - 5} reveal={rise(s.t, 24, 10 + i * 10)} />
          {scan.includes(i) && <ScanBeam t={s.t} />}
        </Card>
        <div style={{ position: "absolute", left: COLX[i], width: CARD + 10, top: CARD_Y + CARD + 34, textAlign: "center", fontFamily: PIXEL, fontSize: 64, letterSpacing: 18 }}>
          {sp.code.split("").map((ch, j) => {
            const g = glow[`${i}${j}`] ?? 0;
            return <span key={j} style={{ color: g ? YELLOW : "#fff", textShadow: g ? `0 0 18px ${YELLOW}, 0 0 40px ${YELLOW}` : "0 0 8px #fff8" }}>{ch}</span>;
          })}
        </div>
      </div>
    );
  });
}

// Byte's scanning beam sweeping over a card.
function ScanBeam({ t }) {
  const y = ((t * 7) % 260) - 10;
  return <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 6, background: YELLOW, boxShadow: `0 0 20px ${YELLOW}, 0 0 40px ${YELLOW}`, opacity: 0.8 }} />;
}

// The mystery sprite and its code slots filling in.
function Mystery({ s, sprite, built = "", buildAt = [], appear = 0 }) {
  return (
    <div style={{ opacity: rise(s.t, 10, appear) }}>
      <Card x={MYST.x} y={MYST.y} w={MYST.w} border={PINK} pulse={blink(s.t, 20) ? 0.6 : 0.2}>
        <Sprite {...sprite} x={MYST.w / 2 - 5} y={MYST.w / 2 - 5} px={14} reveal={rise(s.t, 30, appear + 6)} />
      </Card>
      <div style={{ position: "absolute", left: MYST.x - 10, width: MYST.w + 20, top: MYST.y + MYST.w + 30, display: "flex", justifyContent: "center", gap: 26 }}>
        {[0, 1].map(j => {
          const k = buildAt[j] !== undefined ? pop(s.t, buildAt[j]) : 0;
          return (
            <div key={j} style={{ width: 90, height: 100, borderBottom: `6px solid ${PINK}`, fontFamily: PIXEL, fontSize: 70, color: YELLOW, textAlign: "center", textShadow: `0 0 16px ${YELLOW}` }}>
              {k > 0 ? <span style={{ display: "inline-block", transform: `scale(${lerp(2, 1, k)})` }}>{built[j]}</span> : <span style={{ color: DIM, opacity: blink(s.t, 14) ? 1 : 0.3 }}>?</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Four answer buttons. The trap one explodes into pixels; the right one wins.
function Options({ s, options, appear, correct, winAt, boomAt, boomIndex }) {
  return options.map((o, i) => {
    const x = OPT.x + i * (OPT.w + OPT.gap);
    const a = rise(s.t, 8, appear + i * 5);
    const win = i === correct && s.t >= winAt;
    const boom = i === boomIndex && s.t >= boomAt;
    const bt = s.t - boomAt;
    if (boom && bt > 4) {
      // Explode into flying pixels.
      const bits = Array.from({ length: 60 }, (_, k) => {
        const ang = hash(k) * Math.PI * 2, sp = 6 + hash(k + 9) * 14;
        return <rect key={k} x={x + OPT.w / 2 + Math.cos(ang) * sp * bt} y={OPT.y + 50 + Math.sin(ang) * sp * bt + 0.4 * bt * bt} width={12} height={12}
          fill={[PINK, ORANGE, YELLOW][k % 3]} opacity={Math.max(0, 1 - bt / 40)} />;
      });
      return <svg key={i} width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>{bits}</svg>;
    }
    return (
      <div key={i} style={{ opacity: a }}>
        <div style={{
          position: "absolute", left: x, top: OPT.y, width: OPT.w, height: 100,
          border: `5px solid ${win ? GREEN : boom ? PINK : "#8A92C0"}`, background: win ? "rgba(77,255,136,0.15)" : "rgba(10,14,34,0.9)",
          boxShadow: win ? `0 0 30px ${GREEN}` : "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 18,
          fontFamily: PIXEL, fontSize: 44, color: win ? GREEN : "#fff",
          transform: boom ? `translateX(${Math.sin(bt * 2) * 8}px)` : undefined,
        }}>
          <span style={{ fontSize: 22, color: "#8A92C0" }}>{"abcd"[i]}</span>{o}
        </div>
        {win && <PText x={x - 40} y={OPT.y - 60} width={OPT.w + 80} align="center" size={26} color={GREEN} opacity={blink(s.t, 8) ? 1 : 0.6}>+1000</PText>}
      </div>
    );
  });
}

// A splash for "LEVEL 1" and friends.
function Splash({ t, text, sub, color = YELLOW }) {
  const k = pop(t, 4);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingBottom: 120 }}>
      <PText x={0} y={0} size={110} color={color} style={{ position: "relative", transform: `scale(${lerp(3, 1, k)})`, opacity: Math.min(1, k * 1.5) }}>{text}</PText>
      {sub && <PText x={0} y={0} size={30} color="#fff" style={{ position: "relative", marginTop: 40, opacity: rise(t, 10, 24) }}>{sub}</PText>}
    </AbsoluteFill>
  );
}

// ---------- The levels ----------
const L1 = {
  sprites: [
    { sprite: { kind: "heart", fill: "solid", color: PINK }, code: "AX" },
    { sprite: { kind: "heart", fill: "hollow", color: PINK }, code: "AY" },
    { sprite: { kind: "diamond", fill: "solid", color: PINK }, code: "BX" },
  ],
  mystery: { kind: "diamond", fill: "hollow", color: PINK },
  options: ["BX", "YB", "BY", "AY"],
  correct: 2,
};
// Level 2: colours change, but colour is NOT in the code. A decoy.
const L2 = {
  sprites: [
    { sprite: { kind: "arrow", fill: "solid", color: CYAN }, code: "PM" },
    { sprite: { kind: "arrow", fill: "solid", rot: 180, color: ORANGE }, code: "QM" },
    { sprite: { kind: "arrow", fill: "dither", color: YELLOW }, code: "PN" },
  ],
  mystery: { kind: "arrow", fill: "dither", rot: 180, color: GREEN },
  options: ["QM", "NQ", "PN", "QN"],
  correct: 3,
};
const BONUS = {
  sprites: [
    { sprite: { kind: "star", fill: "solid", color: YELLOW }, code: "KR" },
    { sprite: { kind: "star", fill: "dither", color: YELLOW }, code: "KS" },
    { sprite: { kind: "cross", fill: "solid", color: YELLOW }, code: "LR" },
  ],
  mystery: { kind: "cross", fill: "dither", color: YELLOW },
  options: ["LR", "SL", "LS", "KS"],
  correct: 2,
};

const at = (s, i, k = 0) => s.at(i) + s.speech(i) * k;
const TITLE = "CODE BREAKER";

// ---------- The film ----------
export default {
  id: "s2-arcade",
  order: 102,
  series: 2,
  title: "Code Breaker 3000",
  frame: "none",
  push: 0,
  cast: {
    host: { name: "ANNOUNCER", voice: "am_michael", speed: 1.08, colour: YELLOW },
    byte: { name: "BYTE", voice: "am_puck", speed: 1.02, colour: CYAN },
  },
  music: { src: "music/arcade.wav", volume: 0.24, duck: 0.4 },
  Backdrop,
  Overlay,
  Subtitles,
  scenes: [
    // Attract screen: logo, insert coin.
    {
      beats: [
        { who: "host", say: "Welcome to... CODE BREAKER THREE THOUSAND!", voice: "Welcome to. Code Breaker three thousand!", sfxs: [{ sfx: "arcade-powerup", at: 0.2, volume: 0.6 }] },
        { who: "host", say: "Player One, insert coin!", sfxs: [{ sfx: "arcade-coin", at: 1.8, volume: 0.8 }] },
        { who: "byte", say: "Beep boop! Hello, Player One. I'm Byte. Every sprite in this game has a secret code, and we're going to crack them all!" },
      ],
      render: s => {
        const k = pop(s.t, 6);
        const hue = (s.t * 4) % 360;
        return (
          <AbsoluteFill>
            <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", transform: `scale(${lerp(0.2, 1, k)})` }}>
              {TITLE.split("").map((ch, i) => (
                <span key={i} style={{
                  fontFamily: PIXEL, fontSize: 104, color: `hsl(${(hue + i * 24) % 360} 100% 65%)`,
                  textShadow: `0 8px 0 #1A1F3A, 0 0 24px hsl(${(hue + i * 24) % 360} 100% 60%)`,
                  display: "inline-block", transform: `translateY(${Math.sin(s.t / 8 + i / 1.5) * 10}px)`,
                }}>{ch}</span>
              ))}
            </div>
            <PText x={0} y={360} width={1920} align="center" size={150} color={YELLOW} opacity={rise(s.t, 10, 20)}
              style={{ textShadow: `0 10px 0 ${ORANGE}, 0 0 40px ${YELLOW}` }}>3000</PText>
            <PText x={0} y={610} width={1920} align="center" size={40} color="#fff"
              opacity={s.t < at(s, 1, 0.9) ? (blink(s.t, 18) ? 1 : 0) : 0}>INSERT COIN</PText>
            <PText x={0} y={610} width={1920} align="center" size={40} color={GREEN}
              opacity={s.t >= at(s, 1, 0.9) ? (blink(s.t, 8) ? 1 : 0.5) : 0}>PRESS START</PText>
            {s.t >= s.at(2) && <Byte x={1560} y={560} t={s.t} talking={s.beat === 2} />}
          </AbsoluteFill>
        );
      },
    },

    // How to play.
    {
      beats: [
        { who: "host", say: "How to play! Each sprite has a two letter code. Every letter stands for one thing about the sprite.", sfxs: [{ sfx: "arcade-blip", at: 0.1 }] },
        { who: "byte", say: "Step one. Find two sprites that share a letter. Step two. See what those two sprites have in common. That's what the letter means!" },
        { who: "byte", say: "Step three. Build the code for the mystery sprite, one letter at a time." },
        { who: "host", say: "But watch out for decoys! Some things change, but they're not in the code at all." },
      ],
      render: s => {
        const lines = ["1. FIND 2 SPRITES", "   THAT SHARE A LETTER", "2. WHAT DO THEY SHARE?", "   THAT'S THE MEANING", "3. BUILD THE NEW CODE"];
        const times = [at(s, 1, 0.05), at(s, 1, 0.2), at(s, 1, 0.55), at(s, 1, 0.8), at(s, 2, 0.1)];
        return (
          <AbsoluteFill>
            <PText x={0} y={140} width={1920} align="center" size={56} color={PINK}>HOW TO PLAY</PText>
            <div style={{ position: "absolute", left: 360, top: 250, width: 1200, height: 470, border: `5px solid ${CYAN}`, background: "rgba(10,14,34,0.85)", boxShadow: `0 0 20px ${CYAN}55` }} />
            {lines.map((l, i) => (
              <PText key={i} x={420} y={290 + i * 70} size={34} color={i % 2 ? "#B8C0E8" : "#fff"} opacity={rise(s.t, 6, times[i])} style={{ whiteSpace: "pre" }}>
                {l}
              </PText>
            ))}
            <PText x={420} y={640} size={34} color={ORANGE} opacity={s.t >= at(s, 3, 0.2) ? (blink(s.t, 10) ? 1 : 0.4) : 0}>! BEWARE THE DECOYS !</PText>
            <Byte x={1600} y={420} t={s.t} talking={s.beat === 1 || s.beat === 2} />
          </AbsoluteFill>
        );
      },
    },

    // LEVEL 1 splash.
    {
      beats: [{ who: "host", say: "Level one!", sfxs: [{ sfx: "arcade-levelup", at: 0, volume: 0.8 }], hold: 0.4 }],
      render: s => <Splash t={s.t} text="LEVEL 1" sub="THE HEART OF THE CODE" color={PINK} />,
    },

    // LEVEL 1.
    {
      beats: [
        { who: "host", say: "Three sprites, three codes. And one mystery sprite with no code at all!" },
        { who: "byte", say: "First letters. Sprites one and two both start with A. Scanning..." },
        { who: "byte", say: "They're both hearts! So A means heart. That means B, on the diamond, means diamond." },
        { who: "byte", say: "Second letters. Sprites one and three both end with X. Scanning... they're both solid! X means solid, so Y means hollow." },
        { who: "host", say: "Now crack the mystery! It's a diamond, so B. It's hollow, so Y. B, Y!" },
        { who: "byte", say: "Warning! Warning! Answer b is Y B. The right letters in the wrong order. Shape comes first!", sfxs: [{ sfx: "arcade-wrong", at: 0.2, volume: 0.7 }] },
        { who: "host", say: "The answer is c! B, Y! One thousand points!", sfxs: [{ sfx: "arcade-win", at: 1.4, volume: 0.8 }] },
      ],
      render: s => {
        const glow = {
          "00": window(s.t, s.at(1) + 10, s.at(3)) > 0.5 ? 1 : 0,
          "10": window(s.t, s.at(1) + 10, s.at(3)) > 0.5 ? 1 : 0,
          "01": window(s.t, s.at(3) + 10, s.at(4)) > 0.5 ? 1 : 0,
          "21": window(s.t, s.at(3) + 10, s.at(4)) > 0.5 ? 1 : 0,
        };
        const scan = s.t >= at(s, 1, 0.6) && s.t < s.at(3) ? [0, 1] : s.t >= at(s, 3, 0.45) && s.t < s.at(4) ? [0, 2] : [];
        return (
          <AbsoluteFill>
            <Board s={s} sprites={L1.sprites} glow={glow} scan={scan} />
            <Mystery s={s} sprite={L1.mystery} appear={12} built="BY" buildAt={[at(s, 4, 0.4), at(s, 4, 0.72)]} />
            <Legend s={s} rows={[
              { k: "A", v: "HEART", at: at(s, 2, 0.3) }, { k: "B", v: "DIAMOND", at: at(s, 2, 0.85) },
              { k: "X", v: "SOLID", at: at(s, 3, 0.75) }, { k: "Y", v: "HOLLOW", at: at(s, 3, 0.92) },
            ]} />
            <Options s={s} options={L1.options} appear={at(s, 4, 0.9)} correct={L1.correct} winAt={at(s, 6, 0.3)} boomAt={at(s, 5, 0.5)} boomIndex={1} />
          </AbsoluteFill>
        );
      },
    },

    // LEVEL 2: the colour decoy.
    {
      beats: [
        { who: "host", say: "Level two! These arrows point different ways, they're solid or speckled, and they're all different colours!", sfxs: [{ sfx: "arcade-levelup", at: 0, volume: 0.7 }] },
        { who: "byte", say: "Sprites one and three both start with P. Both point up! But look, they're different colours. So colour can't be what P means. P means pointing up." },
        { who: "byte", say: "So Q means pointing down. And the second letter: M is solid, N is speckled." },
        { who: "host", say: "The mystery arrow points down, so Q. It's speckled, so N. Q, N! Answer d!", sfxs: [{ sfx: "arcade-win", at: 3.6, volume: 0.8 }] },
        { who: "byte", say: "And its green colour? Doesn't matter one bit. Colour was a decoy!" },
      ],
      render: s => {
        const glow = {
          "00": window(s.t, at(s, 1, 0.1), s.at(2)) > 0.5 ? 1 : 0,
          "20": window(s.t, at(s, 1, 0.1), s.at(2)) > 0.5 ? 1 : 0,
          "01": window(s.t, at(s, 2, 0.5), s.at(3)) > 0.5 ? 1 : 0,
          "11": window(s.t, at(s, 2, 0.5), s.at(3)) > 0.5 ? 1 : 0,
          "21": window(s.t, at(s, 2, 0.8), s.at(3)) > 0.5 ? 1 : 0,
        };
        const decoy = window(s.t, at(s, 1, 0.4), s.at(2) + 10) + window(s.t, s.at(4), s.at(4) + s.speech(4) + 20);
        return (
          <AbsoluteFill>
            <Board s={s} sprites={L2.sprites} glow={glow} scan={s.t >= at(s, 1, 0.25) && s.t < s.at(2) ? [0, 2] : []} />
            <Mystery s={s} sprite={L2.mystery} appear={12} built="QN" buildAt={[at(s, 3, 0.35), at(s, 3, 0.62)]} />
            <Legend s={s} rows={[
              { k: "P", v: "UP", at: at(s, 1, 0.9) }, { k: "Q", v: "DOWN", at: at(s, 2, 0.2) },
              { k: "M", v: "SOLID", at: at(s, 2, 0.6) }, { k: "N", v: "SPECKLED", at: at(s, 2, 0.85) },
            ]} />
            {decoy > 0 && (
              <PText x={140} y={140} size={30} color={ORANGE} opacity={Math.min(1, decoy) * (blink(s.t, 8) ? 1 : 0.5)}>DECOY: COLOUR IS NOT IN THE CODE</PText>
            )}
            <Options s={s} options={L2.options} appear={at(s, 3, 0.1)} correct={L2.correct} winAt={at(s, 3, 0.85)} boomAt={99999} boomIndex={-1} />
          </AbsoluteFill>
        );
      },
    },

    // BONUS ROUND: your turn.
    {
      beats: [
        { who: "host", say: "BONUS ROUND! This one's all yours, Player One. Crack the mystery code before the timer runs out!", sfxs: [{ sfx: "arcade-powerup", at: 0.1, volume: 0.6 }], hold: 6,
        },
        { who: "byte", say: "Time's up! K means star and L means cross. R means solid and S means speckled. So it's L, S. Answer c!", sfxs: [{ sfx: "arcade-win", at: 6.4, volume: 0.8 }] },
        { who: "host", say: "Five thousand bonus points!" },
      ],
      render: s => {
        const clockStart = at(s, 0, 1);
        const left = Math.max(0, 6 - Math.floor((s.t - clockStart) / 30));
        const ticking = s.t >= clockStart && s.t < s.at(1);
        return (
          <AbsoluteFill>
            <Board s={s} sprites={BONUS.sprites} />
            <Mystery s={s} sprite={BONUS.mystery} appear={12} built="LS" buildAt={[at(s, 1, 0.62), at(s, 1, 0.75)]} />
            <Options s={s} options={BONUS.options} appear={20} correct={BONUS.correct} winAt={at(s, 1, 0.85)} boomAt={99999} boomIndex={-1} />
            <PText x={1470} y={170} size={30} color={ORANGE} opacity={s.t < s.at(1) ? 1 : 0}>BONUS</PText>
            <PText x={1470} y={230} size={96} color={left <= 2 ? PINK : YELLOW} opacity={ticking ? 1 : 0}>{left}</PText>
            {s.t >= s.at(1) && <Legend s={s} rows={[
              { k: "K", v: "STAR", at: at(s, 1, 0.1) }, { k: "L", v: "CROSS", at: at(s, 1, 0.2) },
              { k: "R", v: "SOLID", at: at(s, 1, 0.33) }, { k: "S", v: "SPECKLED", at: at(s, 1, 0.45) },
            ]} />}
            {/* A blip every second while the timer runs. */}
          </AbsoluteFill>
        );
      },
    },

    // High score: enter initials, then the recap.
    {
      beats: [
        { who: "host", say: "NEW HIGH SCORE! Enter your initials, code breaker!", sfxs: [{ sfx: "arcade-levelup", at: 0, volume: 0.7 }, ...[1.6, 2.2, 2.8].map(a => ({ sfx: "arcade-key", at: a }))] },
        { who: "byte", say: "Remember, Player One. Find two sprites that share a letter. See what they share. Build the new code, and watch the order!" },
        { who: "host", say: "And never trust a decoy! Game over... just kidding. You win!", sfxs: [{ sfx: "arcade-win", at: 3.2, volume: 0.9 }] },
      ],
      tail: 1.5,
      render: s => {
        const typed = ["Y", "O", "U"].filter((_, i) => s.t >= s.at(0) + 48 + i * 18).join("");
        const rows = [
          ["1ST", typed.padEnd(3, "_"), "999999", PINK],
          ["2ND", "BYT", "008000", CYAN],
          ["3RD", "AAA", "005000", YELLOW],
          ["4TH", "ZZZ", "001000", GREEN],
        ];
        const tips = ["FIND A SHARED LETTER", "SEE WHAT THEY SHARE", "BUILD IT IN ORDER"];
        return (
          <AbsoluteFill>
            <PText x={0} y={130} width={1920} align="center" size={60} color={blink(s.t, 10) ? YELLOW : PINK}>NEW HIGH SCORE!</PText>
            {rows.map(([r, n, sc, c], i) => (
              <PText key={i} x={560} y={250 + i * 76} size={44} color={c} opacity={rise(s.t, 6, 10 + i * 6)}>
                {r}&nbsp;&nbsp;{n}&nbsp;&nbsp;{sc}
              </PText>
            ))}
            {tips.map((tip, i) => (
              <PText key={i} x={0} y={580 + i * 56} width={1920} align="center" size={30} color="#fff" opacity={rise(s.t, 6, at(s, 1, 0.1 + i * 0.3))}>{`${i + 1}. ${tip}`}</PText>
            ))}
            <Byte x={1560} y={330} t={s.t} talking={s.beat === 1} />
          </AbsoluteFill>
        );
      },
    },
  ],
};

// The code key, filling in as Byte cracks each letter.
function Legend({ s, rows }) {
  return (
    <div style={{ position: "absolute", left: 1470, top: 180, width: 330 }}>
      {rows.map((r, i) => {
        const k = pop(s.t, r.at);
        return (
          <div key={i} style={{ height: 78, display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, k * 1.5), transform: `translateX(${(1 - Math.min(1, k)) * 40}px)` }}>
            <span style={{ fontFamily: PIXEL, fontSize: 44, color: YELLOW, textShadow: `0 0 12px ${YELLOW}` }}>{r.k}</span>
            <span style={{ fontFamily: PIXEL, fontSize: 24, color: "#8A92C0" }}>=</span>
            <span style={{ fontFamily: PIXEL, fontSize: 24, color: "#fff" }}>{r.v}</span>
          </div>
        );
      })}
    </div>
  );
}
