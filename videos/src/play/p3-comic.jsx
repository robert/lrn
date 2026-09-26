// Series 3, play-along film 2: "Captain Sharp-Eye and the Switcheroo".
// A comic book. The Switcheroo sneaks into the Shape Museum and changes the
// exhibits. In each round the viewer taps the shape that changed, then taps
// which of the twelve things it was.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { rise, pop, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";

const { fontFamily: BANG } = loadBangers("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: ROUND } = loadFredoka("normal", { weights: ["500", "600"], subsets: ["latin"] });

const K = { paper: "#F3E9D2", ink: "#1A1A1A", red: "#E2382B", yellow: "#FFD23F", cyan: "#27A9D6", purple: "#6B3FA0", white: "#FFFFFF", skin: "#F4C7A1" };

// The twelve things, in the fixed order (as in shared/attributes.js).
const TWELVE = ["Shape", "How many", "Size", "Shading", "Rotation", "Flipped", "Position on screen", "In front or behind", "Line style", "Touching", "Pointing at", "Inside or outside"];

// ---------- Comic furniture ----------

// Newsprint with halftone dots.
function Page({ tint = K.paper, dots = "rgba(226,56,43,0.10)" }) {
  return (
    <AbsoluteFill style={{
      background: tint,
      backgroundImage: `radial-gradient(${dots} 28%, transparent 30%)`,
      backgroundSize: "18px 18px",
    }} />
  );
}

// A panel with a thick ink border that slams into place.
function Panel({ t, at = 0, x, y, w, h, bg = K.white, rot = 0, children, from = "left" }) {
  const k = pop(t, at);
  const dx = from === "left" ? -1 : from === "right" ? 1 : 0;
  const dy = from === "top" ? -1 : from === "bottom" ? 1 : 0;
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, height: h, background: bg,
      border: `8px solid ${K.ink}`, boxShadow: `10px 10px 0 ${K.ink}`, overflow: "hidden",
      transform: `translate(${(1 - k) * dx * 400}px, ${(1 - k) * dy * 300}px) rotate(${rot}deg)`, opacity: Math.min(1, k * 2),
    }}>{children}</div>
  );
}

// A yellow caption box, like the narrator's boxes in a comic.
function Caption({ t, at = 0, x, y, text, size = 40 }) {
  const k = pop(t, at);
  return (
    <div style={{
      position: "absolute", left: x, top: y, background: K.yellow, border: `5px solid ${K.ink}`, padding: "8px 18px",
      fontFamily: BANG, fontSize: size, letterSpacing: 1.5, color: K.ink, opacity: Math.min(1, k * 2), transform: `scale(${lerp(0.8, 1, k)})`, transformOrigin: "0 0",
    }}>{text}</div>
  );
}

// A sound-effect burst: KAPOW!, SWISH! and so on.
function Burst({ t, at, x, y, text, colour = K.yellow, size = 110, rot = -8 }) {
  const k = pop(t, at);
  if (k <= 0) return null;
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const r = i % 2 ? 0.62 : 1;
    return `${Math.cos(a) * r * 190},${Math.sin(a) * r * 120}`;
  }).join(" ");
  return (
    <div style={{ position: "absolute", left: x - 200, top: y - 130, width: 400, height: 260, transform: `scale(${lerp(0.2, 1, Math.min(1, k))}) rotate(${rot}deg)` }}>
      <svg width="400" height="260" viewBox="-200 -130 400 260" style={{ position: "absolute", inset: 0 }}>
        <polygon points={pts} fill={colour} stroke={K.ink} strokeWidth="7" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BANG, fontSize: size, color: K.red, WebkitTextStroke: `4px ${K.ink}`, letterSpacing: 2 }}>{text}</div>
    </div>
  );
}

// Subtitles as a comic caption strip at the foot of the page.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ maxWidth: 1500, background: K.white, border: `5px solid ${K.ink}`, boxShadow: `6px 6px 0 ${K.ink}`, padding: "10px 28px 12px", fontFamily: ROUND, fontWeight: 500, fontSize: 40, lineHeight: 1.2, color: K.ink, textAlign: "center" }}>
        {actor && <span style={{ fontFamily: BANG, fontSize: 34, color: actor.colour, marginRight: 14, letterSpacing: 1 }}>{actor.name}:</span>}
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.35 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// ---------- Characters ----------

function Hero({ t, x, y, scale = 1, pose = "stand" }) {
  const cape = Math.sin(t / 7) * 8;
  const fly = pose === "fly";
  return (
    <svg width="400" height="520" viewBox="-200 -380 400 520" style={{ position: "absolute", left: x - 200 * scale, top: y - 380 * scale, width: 400 * scale, height: 520 * scale, overflow: "visible", transform: fly ? "rotate(-18deg)" : "none" }}>
      <path d={`M-60 -170 Q ${-150 + cape} 20 ${-120 + cape} 110 L 120 110 Q ${150 - cape} 20 60 -170 Z`} fill={K.red} stroke={K.ink} strokeWidth="7" />
      <path d="M-62 -180 L -52 60 L 52 60 L 62 -180 Q 0 -205 -62 -180 Z" fill={K.cyan} stroke={K.ink} strokeWidth="7" />
      {/* The eye emblem on the chest. */}
      <ellipse cx="0" cy="-100" rx="42" ry="24" fill={K.yellow} stroke={K.ink} strokeWidth="6" />
      <circle cx="0" cy="-100" r="13" fill={K.ink} />
      <rect x="-56" y="50" width="112" height="22" fill={K.yellow} stroke={K.ink} strokeWidth="6" />
      <path d="M-50 70 L -60 130 L -12 130 L -10 70 Z M 10 70 L 12 130 L 60 130 L 50 70 Z" fill={K.cyan} stroke={K.ink} strokeWidth="6" />
      <circle cx="0" cy="-250" r="62" fill={K.skin} stroke={K.ink} strokeWidth="7" />
      <path d="M-64 -262 Q 0 -300 64 -262 L 64 -236 Q 0 -250 -64 -236 Z" fill={K.red} stroke={K.ink} strokeWidth="6" />
      <ellipse cx="-24" cy="-250" rx="10" ry="8" fill={K.white} stroke={K.ink} strokeWidth="3" />
      <ellipse cx="24" cy="-250" rx="10" ry="8" fill={K.white} stroke={K.ink} strokeWidth="3" />
      <path d="M-58 -300 Q -10 -350 50 -310 Q 10 -318 -58 -300 Z" fill={K.ink} />
      <path d="M-18 -215 Q 0 -200 18 -215" stroke={K.ink} strokeWidth="5" fill="none" />
    </svg>
  );
}

function Villain({ t, x, y, scale = 1, sneak = false }) {
  const tiptoe = sneak ? Math.abs(Math.sin(t / 6)) * 18 : 0;
  return (
    <svg width="400" height="560" viewBox="-200 -420 400 560" style={{ position: "absolute", left: x - 200 * scale, top: y - 420 * scale - tiptoe, width: 400 * scale, height: 560 * scale, overflow: "visible" }}>
      <path d="M-110 -150 Q -150 60 -90 130 L 90 130 Q 150 60 110 -150 Q 0 -190 -110 -150 Z" fill={K.purple} stroke={K.ink} strokeWidth="7" />
      <path d="M-40 -150 L 0 60 L 40 -150 Z" fill={K.yellow} stroke={K.ink} strokeWidth="5" />
      <circle cx="0" cy="-230" r="58" fill="#E8D9C4" stroke={K.ink} strokeWidth="7" />
      <path d="M-50 -210 Q -25 -190 0 -208 Q 25 -190 50 -210 Q 60 -196 44 -188 Q 20 -196 0 -196 Q -20 -196 -44 -188 Q -60 -196 -50 -210 Z" fill={K.ink} />
      <path d="M-30 -250 L -10 -244 M 30 -250 L 10 -244" stroke={K.ink} strokeWidth="6" />
      <rect x="-60" y="-340" width="120" height="70" fill={K.ink} />
      <rect x="-90" y="-282" width="180" height="16" rx="6" fill={K.ink} />
      <rect x="-60" y="-300" width="120" height="14" fill={K.red} />
    </svg>
  );
}

// ---------- Exhibits: before and after ----------

// Two panels side by side; `after` shapes may differ. Returns screen hotspots.
const BEFORE = { x: 150, y: 170, w: 740, h: 560 };
const AFTER = { x: 1030, y: 170, w: 740, h: 560 };

function Exhibit({ t, at = 0, shapes, box, label, colour, highlight }) {
  return (
    <Panel t={t} at={at} {...box} bg="#FFFDF6" from={label === "BEFORE" ? "left" : "right"}>
      <div style={{ position: "absolute", left: 16, top: 12, background: colour, border: `4px solid ${K.ink}`, padding: "2px 14px", fontFamily: BANG, fontSize: 38, color: K.white, WebkitTextStroke: `1.5px ${K.ink}` }}>{label}</div>
      {/* The museum plinth. */}
      <svg width={box.w} height={box.h} style={{ position: "absolute", inset: 0 }}>
        <rect x={box.w / 2 - 230} y={box.h - 90} width={460} height={40} fill="#D9CBB3" stroke={K.ink} strokeWidth="5" />
        {shapes.map((sh, i) => <Shape key={i} {...sh} draw={rise(t, 20, at + 10 + i * 5)} />)}
        {highlight !== undefined && (
          <circle cx={shapes[highlight].x} cy={shapes[highlight].y} r={shapes[highlight].r + 36} fill="none" stroke={K.red} strokeWidth="9" strokeDasharray="4 16" strokeLinecap="round" opacity={rise(t, 10, at)} />
        )}
      </svg>
    </Panel>
  );
}

// Hotspot over a shape in the AFTER panel.
const spotOver = (sh, id, extra) => ({ id, x: AFTER.x + 8 + sh.x - sh.r - 30, y: AFTER.y + 8 + sh.y - sh.r - 30, w: 2 * sh.r + 60, h: 2 * sh.r + 60, ...extra });

// The badge board of the twelve things, 4 across, 3 down.
const BADGE = { x: 180, y: 250, w: 380, h: 120, gx: 30, gy: 34 };
const badgeAt = i => ({ x: BADGE.x + (i % 4) * (BADGE.w + BADGE.gx), y: BADGE.y + Math.floor(i / 4) * (BADGE.h + BADGE.gy) });
function Badges({ t, at = 0, lit, struck = [] }) {
  return TWELVE.map((name, i) => {
    const p = badgeAt(i);
    const k = pop(t, at + i * 2);
    const on = lit === i;
    return (
      <div key={name} style={{
        position: "absolute", left: p.x, top: p.y, width: BADGE.w, height: BADGE.h,
        background: on ? K.yellow : K.white, border: `6px solid ${K.ink}`, borderRadius: 60, boxShadow: `6px 6px 0 ${K.ink}`,
        display: "flex", alignItems: "center", gap: 14, padding: "0 22px", opacity: Math.min(1, k * 2) * (struck.includes(i) ? 0.35 : 1),
        transform: `scale(${lerp(0.6, 1, Math.min(1, k))})`,
      }}>
        <span style={{ fontFamily: BANG, fontSize: 40, color: K.red, width: 38 }}>{i + 1}</span>
        <span style={{ fontFamily: ROUND, fontWeight: 600, fontSize: 34, color: K.ink, lineHeight: 1 }}>{name}</span>
      </div>
    );
  });
}
const badgeSpots = (correct, slipFor) => TWELVE.map((name, i) => ({
  id: `a${i}`, label: name, ...badgeAt(i), w: BADGE.w, h: BADGE.h,
  correct: i === correct, slip: i === correct ? undefined : slipFor(i),
}));

// ---------- The three heists ----------
const R1 = {
  before: [{ kind: "circle", r: 70, fill: "white", x: 170, y: 300 }, { kind: "square", r: 70, fill: "grey", x: 370, y: 300 }, { kind: "star", r: 80, fill: "black", x: 575, y: 300 }],
  after: [{ kind: "circle", r: 70, fill: "white", x: 170, y: 300 }, { kind: "square", r: 70, fill: "grey", x: 370, y: 300 }, { kind: "star", r: 80, fill: "striped", x: 575, y: 300 }],
  changed: 2, attr: 3,
};
const R2 = {
  before: [{ kind: "flag", r: 90, fill: "white", x: 200, y: 290 }, { kind: "heart", r: 70, fill: "grey", x: 520, y: 300 }],
  after: [{ kind: "flag", r: 90, fill: "white", x: 200, y: 290, flip: true }, { kind: "heart", r: 70, fill: "grey", x: 520, y: 300 }],
  changed: 0, attr: 5,
};
// Round three: the triangle slips from in front of the square to behind it.
function OverlapPanel({ t, at, box, label, colour, front }) {
  return (
    <Panel t={t} at={at} {...box} bg="#FFFDF6" from={label === "BEFORE" ? "left" : "right"}>
      <div style={{ position: "absolute", left: 16, top: 12, background: colour, border: `4px solid ${K.ink}`, padding: "2px 14px", fontFamily: BANG, fontSize: 38, color: K.white, WebkitTextStroke: `1.5px ${K.ink}` }}>{label}</div>
      <svg width={box.w} height={box.h} style={{ position: "absolute", inset: 0 }}>
        <rect x={box.w / 2 - 230} y={box.h - 90} width={460} height={40} fill="#D9CBB3" stroke={K.ink} strokeWidth="5" />
        {front === "triangle" ? <>
          <Shape kind="square" r={110} fill="grey" x={330} y={290} draw={rise(t, 20, at + 10)} />
          <Shape kind="triangle" r={100} fill="white" x={430} y={300} draw={rise(t, 20, at + 15)} />
        </> : <>
          <Shape kind="triangle" r={100} fill="white" x={430} y={300} draw={rise(t, 20, at + 10)} />
          <Shape kind="square" r={110} fill="grey" x={330} y={290} draw={rise(t, 20, at + 15)} />
        </>}
      </svg>
    </Panel>
  );
}

function TwoPanels({ t, at = 0, round, highlight }) {
  return (
    <>
      <Exhibit t={t} at={at} shapes={round.before} box={BEFORE} label="BEFORE" colour={K.cyan} />
      <Exhibit t={t} at={at + 8} shapes={round.after} box={AFTER} label="AFTER" colour={K.red} highlight={highlight} />
    </>
  );
}

// ---------- The film ----------
const lookAgain = n => ({
  returnTo: `r${n}-spot`,
  beats: [{ who: "dot", say: "Beep! That one looks exactly the same as before. Compare each shape, one at a time." }],
});

export default {
  id: "p3-comic",
  order: 202,
  series: 3,
  title: "Captain Sharp-Eye and the Switcheroo",
  strap: "A comic book adventure. Spot what the villain changed, then name it.",
  music: "music/comic.wav",
  musicVolume: 0.14,
  cast: {
    narrator: { name: "Meanwhile", voice: "bm_daniel", speed: 0.95, colour: "#444" },
    hero: { name: "Sharp-Eye", voice: "bm_lewis", speed: 1.0, colour: K.red },
    villain: { name: "Switcheroo", voice: "bm_fable", speed: 1.05, colour: K.purple },
    dot: { name: "Dot", voice: "af_sky", speed: 1.08, colour: K.cyan },
  },
  Subtitles,
  scenes: [
    {
      id: "open",
      next: "r1-look",
      beats: [
        { who: "narrator", say: "Shape City. Midnight. The Shape Museum is locked up tight...", sfxs: [{ sfx: "comic-swish", at: 0 }] },
        { who: "villain", say: "Heh heh heh. Nobody will ever notice my little changes. I am the Switcheroo!", sfxs: [{ sfx: "comic-sneak", at: 0 }] },
        { who: "hero", say: "Not so fast, Switcheroo! Nothing gets past Captain Sharp-Eye. Or my sidekick. That's you, reader!", sfxs: [{ sfx: "comic-whoosh", at: 0.2 }] },
      ],
      render: s => (
        <AbsoluteFill>
          <Page tint="#1F2A44" dots="rgba(255,255,255,0.06)" />
          <Panel t={s.t} at={2} x={100} y={80} w={1720} h={300} bg="#2B3A63" from="top">
            <svg width="1720" height="300">{Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 125} y={120 - (i % 3) * 40} width={100} height={200} fill="#1A2440" stroke={K.ink} strokeWidth="5" />)}
              <circle cx="1500" cy="80" r="50" fill={K.yellow} stroke={K.ink} strokeWidth="6" /></svg>
            <div style={{ position: "absolute", left: 40, top: 30, fontFamily: BANG, fontSize: 110, color: K.yellow, WebkitTextStroke: `4px ${K.ink}`, letterSpacing: 3 }}>Captain Sharp-Eye</div>
          </Panel>
          <Panel t={s.t} at={s.at(1) - 4} x={100} y={420} w={820} h={470} bg="#D8CCEB" rot={-1.5}>
            <Villain t={s.t} x={410} y={450} sneak />
          </Panel>
          <Panel t={s.t} at={s.at(2) - 4} x={980} y={420} w={840} h={470} bg="#FFE9A8" rot={1.2} from="right">
            <Hero t={s.t} x={420} y={470} pose="stand" />
          </Panel>
          <Burst t={s.t} at={s.at(2) + 10} x={1600} y={520} text="HALT!" />
        </AbsoluteFill>
      ),
    },

    // Round one: the star.
    {
      id: "r1-look",
      next: "r1-spot",
      beats: [
        { who: "narrator", say: "Exhibit one. Before the Switcheroo struck... and after.", sfxs: [{ sfx: "comic-swish", at: 0 }] },
        { who: "hero", say: "Something's different in the after picture. Compare them, shape by shape." },
      ],
      render: s => <AbsoluteFill><Page /><TwoPanels t={s.t} round={R1} /><Caption t={s.t} at={4} x={150} y={60} text="EXHIBIT ONE" size={52} /></AbsoluteFill>,
    },
    {
      id: "r1-spot",
      choice: {
        prompt: "Tap the shape that changed",
        next: "r1-what",
        options: R1.after.map((sh, i) => spotOver(sh, `s${i}`, i === R1.changed ? { correct: true } : { slip: "r1-same" })),
      },
      beats: [{ who: "hero", say: "Which shape did he change? Tap it!" }],
      render: s => <AbsoluteFill><Page /><TwoPanels t={s.t} at={-40} round={R1} /><Caption t={s.t} at={-40} x={150} y={60} text="EXHIBIT ONE" size={52} /></AbsoluteFill>,
    },
    { id: "r1-same", ...lookAgain(1), render: s => <AbsoluteFill><Page /><TwoPanels t={s.t} at={-40} round={R1} /></AbsoluteFill> },
    {
      id: "r1-what",
      choice: { prompt: "Tap what the Switcheroo changed", next: "r1-kapow", options: badgeSpots(R1.attr, () => "r1-notthat") },
      beats: [
        { who: "hero", say: "The star! Great spotting. Now, which of the twelve things did he change? Its shape? Its size? Something else?", sfxs: [{ sfx: "comic-ding", at: 0 }] },
      ],
      render: s => <AbsoluteFill><Page tint="#FFF6DD" /><Caption t={s.t} at={4} x={180} y={120} text="WHAT CHANGED? THE TWELVE THINGS" size={48} /><Badges t={s.t} at={10} /></AbsoluteFill>,
    },
    {
      id: "r1-notthat",
      returnTo: "r1-what",
      beats: [{ who: "dot", say: "Beep boop. Still a star, still the same size, still in the same place. But look at the inside of it..." }],
      render: s => <AbsoluteFill><Page /><TwoPanels t={s.t} at={-40} round={R1} highlight={R1.changed} /></AbsoluteFill>,
    },
    {
      id: "r1-kapow",
      next: "r2-look",
      beats: [
        { who: "hero", say: "Shading! It was black, and now it's striped. One nil to us!", sfxs: [{ sfx: "comic-kapow", at: 0.1 }] },
        { who: "villain", say: "Curses! A lucky guess. Let's see you spot the next one..." },
      ],
      render: s => (
        <AbsoluteFill><Page /><TwoPanels t={s.t} at={-40} round={R1} highlight={R1.changed} />
          <Burst t={s.t} at={4} x={960} y={470} text="SHADING!" size={90} />
        </AbsoluteFill>
      ),
    },

    // Round two: the flag. The trap: it isn't turned, it's flipped.
    {
      id: "r2-look",
      next: "r2-spot",
      beats: [
        { who: "narrator", say: "Exhibit two. The Switcheroo has been extra sneaky.", sfxs: [{ sfx: "comic-sneak", at: 0 }] },
      ],
      render: s => <AbsoluteFill><Page /><TwoPanels t={s.t} round={R2} /><Caption t={s.t} at={4} x={150} y={60} text="EXHIBIT TWO" size={52} /></AbsoluteFill>,
    },
    {
      id: "r2-spot",
      choice: {
        prompt: "Tap the shape that changed",
        next: "r2-what",
        options: R2.after.map((sh, i) => spotOver(sh, `s${i}`, i === R2.changed ? { correct: true } : { slip: "r2-same" })),
      },
      beats: [{ who: "hero", say: "Which one did he change this time? Tap it!" }],
      render: s => <AbsoluteFill><Page /><TwoPanels t={s.t} at={-40} round={R2} /><Caption t={s.t} at={-40} x={150} y={60} text="EXHIBIT TWO" size={52} /></AbsoluteFill>,
    },
    { id: "r2-same", ...lookAgain(2), render: s => <AbsoluteFill><Page /><TwoPanels t={s.t} at={-40} round={R2} /></AbsoluteFill> },
    {
      id: "r2-what",
      choice: { prompt: "Tap what the Switcheroo changed", next: "r2-kapow", options: badgeSpots(R2.attr, i => (i === 4 ? "r2-turned" : "r2-notthat")) },
      beats: [{ who: "hero", say: "The flag! Now, careful. What exactly did he do to it?", sfxs: [{ sfx: "comic-ding", at: 0 }] }],
      render: s => <AbsoluteFill><Page tint="#FFF6DD" /><Caption t={s.t} at={4} x={180} y={120} text="WHAT CHANGED? THE TWELVE THINGS" size={48} /><Badges t={s.t} at={10} /></AbsoluteFill>,
    },
    {
      id: "r2-turned",
      returnTo: "r2-what",
      beats: [
        { who: "villain", say: "Ha! You think I turned it? Try turning it back, then. Round and round and round..." },
        { who: "dot", say: "Beep! No turn ever matches. The flag is facing the other way, like in a mirror." },
      ],
      render: s => <AbsoluteFill><Page /><TwoPanels t={s.t} at={-40} round={R2} highlight={R2.changed} /><Villain t={s.t} x={960} y={900} scale={0.45} /></AbsoluteFill>,
    },
    {
      id: "r2-notthat",
      returnTo: "r2-what",
      beats: [{ who: "dot", say: "Beep boop. Same shape, same size, same shading, same place. But which way is the flag facing?" }],
      render: s => <AbsoluteFill><Page /><TwoPanels t={s.t} at={-40} round={R2} highlight={R2.changed} /></AbsoluteFill>,
    },
    {
      id: "r2-kapow",
      next: "r3-look",
      beats: [
        { who: "hero", say: "Flipped! A mirror image. Not turned, flipped! Two nil!", sfxs: [{ sfx: "comic-kapow", at: 0.1 }] },
        { who: "villain", say: "Grr! Right, reader. My final trick. You'll never see this one coming." },
      ],
      render: s => (
        <AbsoluteFill><Page /><TwoPanels t={s.t} at={-40} round={R2} highlight={R2.changed} />
          <Burst t={s.t} at={4} x={960} y={470} text="FLIPPED!" size={96} colour={K.cyan} />
        </AbsoluteFill>
      ),
    },

    // Round three: the triangle slips from in front to behind.
    {
      id: "r3-look",
      next: "r3-what",
      beats: [
        { who: "narrator", say: "Exhibit three. A triangle and a square, leaning on each other...", sfxs: [{ sfx: "comic-swish", at: 0 }] },
        { who: "hero", say: "Both shapes are still there. Same size, same shading. So what's he done?" },
      ],
      render: s => (
        <AbsoluteFill><Page />
          <OverlapPanel t={s.t} at={0} box={BEFORE} label="BEFORE" colour={K.cyan} front="triangle" />
          <OverlapPanel t={s.t} at={8} box={AFTER} label="AFTER" colour={K.red} front="square" />
          <Caption t={s.t} at={4} x={150} y={60} text="EXHIBIT THREE" size={52} />
        </AbsoluteFill>
      ),
    },
    {
      id: "r3-what",
      choice: { prompt: "Tap what the Switcheroo changed", next: "r3-kapow", options: badgeSpots(7, () => "r3-notthat") },
      beats: [{ who: "hero", say: "Tap the thing that changed!" }],
      render: s => <AbsoluteFill><Page tint="#FFF6DD" /><Caption t={s.t} at={4} x={180} y={120} text="WHAT CHANGED? THE TWELVE THINGS" size={48} /><Badges t={s.t} at={6} /></AbsoluteFill>,
    },
    {
      id: "r3-notthat",
      returnTo: "r3-what",
      beats: [{ who: "dot", say: "Beep! Look at where they overlap. Before, which shape was on top? And after?" }],
      render: s => (
        <AbsoluteFill><Page />
          <OverlapPanel t={s.t} at={-40} box={BEFORE} label="BEFORE" colour={K.cyan} front="triangle" />
          <OverlapPanel t={s.t} at={-40} box={AFTER} label="AFTER" colour={K.red} front="square" />
        </AbsoluteFill>
      ),
    },
    {
      id: "r3-kapow",
      next: "end",
      beats: [
        { who: "hero", say: "In front or behind! The triangle was in front of the square. Now it's hiding behind it!", sfxs: [{ sfx: "comic-kapow", at: 0.1 }] },
      ],
      render: s => (
        <AbsoluteFill><Page />
          <OverlapPanel t={s.t} at={-40} box={BEFORE} label="BEFORE" colour={K.cyan} front="triangle" />
          <OverlapPanel t={s.t} at={-40} box={AFTER} label="AFTER" colour={K.red} front="square" />
          <Burst t={s.t} at={4} x={960} y={470} text="BEHIND!" size={100} />
        </AbsoluteFill>
      ),
    },
    {
      id: "end",
      beats: [
        { who: "narrator", say: "And so, the Switcheroo was caught red-handed.", sfxs: [{ sfx: "comic-kapow", at: 0.4 }] },
        { who: "villain", say: "Foiled! By a kid with sharp eyes!" },
        { who: "hero", say: "Twelve things can change, Switcheroo. And we check every single one. Nothing gets past us!" },
        { who: "dot", say: "Beep beep! The end!" },
      ],
      render: s => (
        <AbsoluteFill>
          <Page tint="#FFE9A8" />
          <Panel t={s.t} at={2} x={120} y={90} w={820} h={760} bg="#D8CCEB" rot={-1.5}>
            <Villain t={s.t} x={410} y={700} />
            {/* The cage bars drop down. */}
            <svg width="820" height="760" style={{ position: "absolute", inset: 0 }}>
              {Array.from({ length: 8 }, (_, i) => <rect key={i} x={70 + i * 95} y={lerp(-760, 0, rise(s.t, 20, 18))} width="18" height="760" fill="#555" stroke={K.ink} strokeWidth="4" />)}
            </svg>
          </Panel>
          <Panel t={s.t} at={s.at(2) - 6} x={990} y={90} w={810} h={760} bg="#BFE6F5" rot={1.2} from="right">
            <Hero t={s.t} x={400} y={680} pose="stand" />
          </Panel>
          <Burst t={s.t} at={10} x={530} y={170} text="CAUGHT!" size={100} />
          <Caption t={s.t} at={s.at(3)} x={1250} y={120} text="THE END!" size={70} />
        </AbsoluteFill>
      ),
    },
  ],
};
