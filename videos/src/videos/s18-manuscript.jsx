// Series 18, film 1: "The Riddle Book of Brother Snail". An illuminated
// manuscript comes alive: vellum pages with ruled margins, gold-leaf initials
// gilded while we watch, and three creatures from the margins (Brother Quill
// the grumpy owl scribe, Sir Snail in his new helmet and Tansy the rabbit with
// her herald trumpet) who argue their way through four riddles: an analogy,
// an odd one out, a most-alike and a letter code. Every riddle is solved the
// same way: say the rule, test every answer, then check.
//
// The book is one continuous object, so the whole film draws in the Backdrop
// (which sees the global frame) and each scene's `render` is empty. Scenes
// give `left(s)` and `right(s)` for the two pages instead; that lets the page
// turn carry the old page over while the new one lies underneath.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadUncial } from "@remotion/google-fonts/UncialAntiqua";
import { loadFont as loadFraktur } from "@remotion/google-fonts/UnifrakturMaguntia";
import { loadFont as loadGaramond } from "@remotion/google-fonts/EBGaramond";
import { rise, lerp } from "../lib/anim.js";
import { buildTimeline } from "../lib/timeline.js";
import DURATIONS from "../lib/durations.js";

const { fontFamily: UNCIAL } = loadUncial("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: FRAKTUR } = loadFraktur("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: BODY } = loadGaramond("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
loadGaramond("italic", { weights: ["400", "500"], subsets: ["latin"] });

const ID = "s18-manuscript";
const INK = "#2B1C10";
const BROWN = "#6A4A2E";
const RED = "#A7321F";
const BLUE = "#26457F";
const GREEN = "#3F6E52";
const VELLUM = "#EFE0BE";
const CREAM = "#F7EDD5";
const hash = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const clamp01 = v => Math.max(0, Math.min(1, v));

// The open book: two pages meeting at the gutter.
const PW = 890, PH = 896, TOP = 18, LEFT = 70, GUT = 960;
const TURN = 44; // frames for a page to turn over

// When (in scene frames) a fraction of beat i's words has been spoken.
const W = (s, i, f) => s.at(i) + s.speech(i) * f;
// The same, in seconds from the beat's start, for placing a sound effect.
const said = (si, bi, f) => (DURATIONS[ID]?.[`s${si}b${bi}`] ?? 0) * f;
// Several lines written one after another, at an even pen speed.
function writeKs(t, start, dur, texts) {
  const total = texts.reduce((a, x) => a + x.length, 0);
  let acc = 0;
  return texts.map(x => {
    const a = start + (dur * acc) / total;
    acc += x.length;
    const b = start + (dur * acc) / total;
    return clamp01((t - a) / Math.max(1, b - a));
  });
}

// ---------- Textures, gold and ink ----------

function Defs({ frame }) {
  const sweep = ((frame % 150) / 150) * 3.2 - 1.6; // the glint that slides across the gold
  const mottle = (side, seed) => (
    <filter id={`ms-mottle-${side}`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0055" numOctaves="4" seed={seed} />
      <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.37  0 0 0 0 0.16  1.5 0 0 0 -0.6" />
    </filter>
  );
  const fibre = (side, seed) => (
    <filter id={`ms-fibre-${side}`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.045" numOctaves="3" seed={seed} />
      <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.34  0 0 0 0 0.16  1.5 0 0 0 -0.66" />
    </filter>
  );
  const grain = (side, seed) => (
    <filter id={`ms-grain-${side}`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="1" seed={seed} />
      <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.17  0 0 0 0 0.08  3.2 0 0 0 -1.55" />
    </filter>
  );
  return (
    <svg width="0" height="0" style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="ms-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8A6420" />
          <stop offset="0.28" stopColor="#E0BC62" />
          <stop offset="0.48" stopColor="#FFF1BC" />
          <stop offset="0.66" stopColor="#D1A241" />
          <stop offset="1" stopColor="#7C581B" />
        </linearGradient>
        <linearGradient id="ms-shine" x1="0" y1="0" x2="1" y2="0.5" gradientTransform={`translate(${sweep} 0)`}>
          <stop offset="0.36" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFBE6" stopOpacity="0.9" />
          <stop offset="0.64" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ms-lapis" cx="0.38" cy="0.32" r="0.85">
          <stop offset="0" stopColor="#3C66AE" />
          <stop offset="1" stopColor="#1B3363" />
        </radialGradient>
        <radialGradient id="ms-rose" cx="0.38" cy="0.32" r="0.85">
          <stop offset="0" stopColor="#C2543A" />
          <stop offset="1" stopColor="#7E2314" />
        </radialGradient>
        <radialGradient id="ms-edge" cx="0.5" cy="0.5" r="0.72">
          <stop offset="0.62" stopColor="#7A4E1E" stopOpacity="0" />
          <stop offset="1" stopColor="#7A4E1E" stopOpacity="0.38" />
        </radialGradient>
        <linearGradient id="ms-gutter-L" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.84" stopColor="#4A2C10" stopOpacity="0" />
          <stop offset="0.96" stopColor="#4A2C10" stopOpacity="0.22" />
          <stop offset="1" stopColor="#2A1606" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="ms-gutter-R" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0.84" stopColor="#4A2C10" stopOpacity="0" />
          <stop offset="0.96" stopColor="#4A2C10" stopOpacity="0.22" />
          <stop offset="1" stopColor="#2A1606" stopOpacity="0.5" />
        </linearGradient>
        {mottle("L", 11)}{mottle("R", 23)}
        {fibre("L", 5)}{fibre("R", 9)}
        {grain("L", 3)}{grain("R", 17)}
        <filter id="ms-wood" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.06" numOctaves="4" seed="2" />
          <feColorMatrix values="0 0 0 0 0.09  0 0 0 0 0.05  0 0 0 0 0.02  2.2 0 0 0 -0.7" />
        </filter>
        <filter id="ms-leather" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="6" />
          <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.03  0 0 0 0 0.02  2.5 0 0 0 -1.1" />
        </filter>
        {/* A faint tremble, so drawings look inked by hand rather than by machine. */}
        <filter id="ms-ink" x="-15%" y="-15%" width="130%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* Raised gilding on gesso casts a small shadow. */}
        <filter id="ms-raise" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="1.3" dy="1.8" stdDeviation="1.1" floodColor="#3A2408" floodOpacity="0.55" />
        </filter>
      </defs>
    </svg>
  );
}

// An ivy leaf in the border, gold or coloured, with an ink outline.
function Leaf({ x, y, rot = 0, s = 1, fill = "url(#ms-gold)" }) {
  return (
    <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      d="M 0 0 C -7 -5 -14 -13 -9 -20 C -5 -25 -1 -21 0 -16 C 1 -21 5 -25 9 -20 C 14 -13 7 -5 0 0 Z"
      fill={fill} stroke={INK} strokeWidth={1.2 / s} />
  );
}

// The page itself: vellum with its mottling, hair-side fibres and grain,
// darker edges, the shadow of the gutter, ruling, and the painted border.
function Vellum({ side }) {
  const L = side === "L";
  const x0 = L ? 230 : 50, x1 = L ? 840 : 660;
  const bar = L ? 198 : 692;
  const out = L ? -1 : 1; // which way the outer margin lies
  const rules = Array.from({ length: 11 }, (_, i) => 90 + i * 60);
  const segs = Array.from({ length: 10 }, (_, i) => i);
  return (
    <svg width={PW} height={PH} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect width={PW} height={PH} fill={VELLUM} />
      <rect width={PW} height={PH} filter={`url(#ms-mottle-${side})`} />
      <rect width={PW} height={PH} filter={`url(#ms-fibre-${side})`} opacity="0.55" />
      <rect width={PW} height={PH} filter={`url(#ms-grain-${side})`} opacity="0.4" />
      <rect width={PW} height={PH} fill="url(#ms-edge)" />
      <rect width={PW} height={PH} fill={`url(#ms-gutter-${side})`} />
      {/* Ruling in drypoint and pale ink, with the pricking in the outer margin. */}
      {rules.map(y => <line key={y} x1={x0} x2={x1} y1={y} y2={y} stroke="#A57B55" strokeWidth="1" opacity="0.16" />)}
      <path d={`M ${x0 - 10} 62 V 704 M ${x1 + 10} 62 V 704 M ${x0 - 20} 70 H ${x1 + 20} M ${x0 - 20} 696 H ${x1 + 20}`} stroke="#A57B55" strokeWidth="1" opacity="0.3" fill="none" />
      {rules.map(y => <circle key={y} cx={L ? 26 : PW - 26} cy={y} r="1.6" fill="#7A5A3A" opacity="0.45" />)}
      {/* Folio number, in red, in the top outer corner. */}
      <text x={L ? 60 : PW - 60} y="52" textAnchor="middle" fontFamily={BODY} fontStyle="italic" fontSize="24" fill={RED} opacity="0.75">{L ? "fol. ii" : "iii"}</text>
      {/* The bar border: gold between blue and rose, with white penwork. */}
      <g>
        {segs.map(i => (
          <rect key={i} x={bar - 6} y={76 + i * 61.4} width="12" height="61.4" fill={i % 2 ? "url(#ms-rose)" : "url(#ms-lapis)"} />
        ))}
        {segs.map(i => <circle key={`d${i}`} cx={bar} cy={107 + i * 61.4} r="2.2" fill="#FFF6E0" opacity="0.8" />)}
        <rect x={bar - 6} y="76" width="12" height="614" fill="none" stroke={INK} strokeWidth="1.4" />
        <line x1={bar - out * 10} x2={bar - out * 10} y1="72" y2="694" stroke="url(#ms-gold)" strokeWidth="4" />
      </g>
      {/* Sprays of ivy curling out of the bar's ends into the margins. */}
      <g fill="none" stroke={INK} strokeWidth="1.8">
        <path d={`M ${bar} 76 C ${bar} 40 ${bar + out * 60} 30 ${bar + out * 110} 44 C ${bar + out * 150} 56 ${bar + out * 140} 90 ${bar + out * 118} 84`} />
        <path d={`M ${bar} 60 C ${bar - out * 30} 36 ${bar - out * 90} 40 ${bar - out * 140} 50`} />
        <path d={`M ${bar} 690 C ${bar} 740 ${bar + out * 40} 770 ${bar + out * 90} 790 C ${bar + out * 130} 806 ${bar + out * 150} 830 ${bar + out * 140} 860`} />
        <path d={`M ${bar + out * 90} 790 C ${bar + out * 60} 830 ${bar + out * 10} 850 ${bar - out * 40} 868`} />
      </g>
      <Leaf x={bar + out * 118} y={84} rot={out * 120} s={1.1} />
      <Leaf x={bar + out * 70} y={36} rot={out * -20} s={0.9} fill={BLUE} />
      <Leaf x={bar - out * 140} y={50} rot={out * -80} s={1} />
      <Leaf x={bar - out * 80} y={42} rot={out * 20} s={0.8} fill={RED} />
      <Leaf x={bar + out * 40} y={770} rot={out * 140} s={1.1} fill={RED} />
      <Leaf x={bar + out * 140} y={860} rot={out * 170} s={1.1} />
      <Leaf x={bar + out * 128} y={810} rot={out * 60} s={0.9} fill={BLUE} />
      <Leaf x={bar - out * 40} y={868} rot={out * -100} s={1} />
      {/* The ground line of the lower margin, where the creatures stand. */}
      <path d={L ? "M 150 876 C 330 866 560 884 890 872" : "M 0 872 C 250 866 520 884 760 874 C 800 872 830 860 834 846"} fill="none" stroke={INK} strokeWidth="2" />
      {(L ? [[300, 872, -70, 1], [560, 877, 80, 0], [760, 874, -60, 2]] : [[120, 870, 70, 2], [330, 874, -80, 0], [640, 878, 80, 1]]).map(([x, y, r, c], i) => (
        <Leaf key={i} x={x} y={y} rot={r} s={0.9} fill={[BLUE, "url(#ms-gold)", RED][c]} />
      ))}
    </svg>
  );
}

// One page, positioned in the spread (or at 0,0 inside a turning leaf).
function PageFace({ side, children, left, top }) {
  return (
    <div style={{ position: "absolute", left: left ?? (side === "L" ? LEFT : GUT), top: top ?? TOP, width: PW, height: PH, overflow: "hidden" }}>
      <Vellum side={side} />
      <svg width={PW} height={PH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>{children}</svg>
    </div>
  );
}

// Text written letter by letter (k runs 0 to 1). `parts` colours words
// differently, e.g. [{ t: "quill", c: RED }].
function Ink({ x, y, size = 48, color = INK, font = BODY, italic = false, anchor = "start", weight = 400, k = 1, parts, children, spacing = 0, opacity = 1, fill, stroke }) {
  if (k <= 0) return null;
  const segs = parts ?? [{ t: String(children) }];
  const n = segs.reduce((a, p) => a + p.t.length, 0);
  const shown = k * (n + 2);
  let i = 0;
  return (
    <text x={x} y={y} fontFamily={font} fontSize={size} fill={fill ?? color} fontStyle={italic ? "italic" : "normal"} fontWeight={weight}
      textAnchor={anchor} letterSpacing={spacing} opacity={opacity} stroke={stroke} strokeWidth={stroke ? 1.2 : undefined} style={{ whiteSpace: "pre" }}>
      {segs.map((p, j) => k >= 1
        ? <tspan key={j} fill={p.c ?? fill ?? color} fontWeight={p.w ?? weight}>{p.t}</tspan>
        : [...p.t].map((c, m) => {
          const idx = i++;
          return <tspan key={`${j}-${m}`} fill={p.c ?? fill ?? color} fontWeight={p.w ?? weight} fillOpacity={clamp01(shown - idx)}>{c}</tspan>;
        }))}
    </text>
  );
}

// A gilded initial on a lapis ground, made in order while we watch: the red
// frame is ruled, the blue laid in, the letter outlined, the gold leaf pressed
// on, and then it catches the light.
function Initial({ x, y, size = 150, letter, glyph, start, t, frame, font = UNCIAL, fontSize, ground = "url(#ms-lapis)" }) {
  const frame1 = rise(t, 16, start);
  const blue = rise(t, 16, start + 8);
  const outline = rise(t, 26, start + 16);
  const gild = rise(t, 24, start + 34);
  const lit = rise(t, 20, start + 52);
  if (frame1 <= 0) return null;
  const fs = fontSize ?? size * 0.86;
  const curl = size / 150;
  const glint = ((frame + x) % 150) / 150;
  const sparkle = Math.max(0, 1 - Math.abs(glint - 0.52) * 14) * lit;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-7} y={-7} width={size + 14} height={size + 14} fill="none" stroke={RED} strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - frame1} />
      <rect x={0} y={0} width={size} height={size} fill={ground} opacity={blue} stroke={INK} strokeWidth="2" />
      <g opacity={blue * 0.75} fill="none" stroke="#F6EBD2" strokeWidth={1.6}>
        {[[0, 0, 1, 1], [size, 0, -1, 1], [0, size, 1, -1], [size, size, -1, -1]].map(([cx, cy, sx, sy], i) => (
          <g key={i} transform={`translate(${cx} ${cy}) scale(${sx * curl} ${sy * curl})`}>
            <path d="M 12 40 C 12 22 26 12 42 16 C 52 19 50 32 40 30" />
            <circle cx="22" cy="22" r="2" fill="#F6EBD2" stroke="none" />
            <circle cx="30" cy="11" r="1.5" fill="#F6EBD2" stroke="none" />
            <circle cx="11" cy="30" r="1.5" fill="#F6EBD2" stroke="none" />
          </g>
        ))}
      </g>
      <rect x={6} y={6} width={size - 12} height={size - 12} fill="none" stroke="url(#ms-gold)" strokeWidth={3 + size / 100} opacity={gild} />
      {glyph ? (
        <g transform={`translate(${size / 2} ${size / 2}) scale(${size / 84})`}>
          <path d={glyph} fill="url(#ms-gold)" fillOpacity={gild} stroke={INK} strokeWidth="1.4" {...dash(outline)} filter={gild > 0 ? "url(#ms-raise)" : undefined} />
          <path d={glyph} fill="url(#ms-shine)" opacity={lit} />
        </g>
      ) : (
        <>
          <text x={size / 2} y={size * 0.5 + fs * 0.34} textAnchor="middle" fontFamily={font} fontSize={fs}
            fill="url(#ms-gold)" fillOpacity={gild} stroke={INK} strokeWidth={1.4 + size / 250}
            strokeDasharray={`${outline * 1400} 4000`} filter={gild > 0 ? "url(#ms-raise)" : undefined}>{letter}</text>
          <text x={size / 2} y={size * 0.5 + fs * 0.34} textAnchor="middle" fontFamily={font} fontSize={fs} fill="url(#ms-shine)" opacity={lit}>{letter}</text>
        </>
      )}
      <rect x={6} y={6} width={size - 12} height={size - 12} fill="none" stroke="url(#ms-shine)" strokeWidth={3 + size / 100} opacity={lit} />
      {sparkle > 0 && (
        <path transform={`translate(${size * 0.72} ${size * 0.26}) scale(${sparkle * curl * 1.4})`} d="M 0 -14 L 2.5 -2.5 L 14 0 L 2.5 2.5 L 0 14 L -2.5 2.5 L -14 0 L -2.5 -2.5 Z" fill="#FFFBEA" />
      )}
    </g>
  );
}

// A heading in red uncials with an italic line under it.
function Heading({ s, title, sub, cx = 535, start = TURN - 8 }) {
  return (
    <>
      <Ink x={cx} y={112} size={46} font={UNCIAL} color={RED} anchor="middle" k={rise(s.t, 22, start)}>{title}</Ink>
      {sub && <Ink x={cx} y={152} size={31} italic color={BROWN} anchor="middle" k={rise(s.t, 18, start + 16)}>{sub}</Ink>}
    </>
  );
}

// "¶ The rule" in red and blue, and the rule under it in italic.
function Rule({ x, y, lines, t, start, dur, size = 42, gap = 54 }) {
  const ks = writeKs(t, start + 8, dur, lines);
  return (
    <>
      <Ink x={x} y={y} size={32} font={UNCIAL} k={rise(t, 10, start)} parts={[{ t: "¶ ", c: BLUE }, { t: "The rule", c: RED }]} />
      {lines.map((l, i) => <Ink key={i} x={x} y={y + 52 + i * gap} size={size} italic color={RED} k={ks[i]}>{l}</Ink>)}
    </>
  );
}

// ---------- Marks in the margins ----------

const dash = k => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - clamp01(k) });

// A stroke of red ink through a wrong answer.
function Strike({ x1, y1, x2, y2, k, color = RED, width = 5 }) {
  if (k <= 0) return null;
  const dx = x2 - x1;
  return <path d={`M ${x1} ${y1} C ${x1 + dx * 0.3} ${y1 - 9} ${x1 + dx * 0.7} ${y2 + 9} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" opacity="0.9" {...dash(k)} />;
}

function Tick({ x, y, k, s = 1, color = GREEN }) {
  if (k <= 0) return null;
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M -16 0 L -5 13 L 20 -18" fill="none" stroke={color} strokeWidth={6 / s} strokeLinecap="round" strokeLinejoin="round" {...dash(k)} />;
}

// A gold ring drawn round the right answer, overshooting like a real hand.
function Ring({ cx, cy, rx, ry, k }) {
  if (k <= 0) return null;
  const pts = Array.from({ length: 50 }, (_, i) => {
    const a = -1.9 + (i / 49) * (Math.PI * 2 + 0.5);
    const w = 1 + 0.05 * Math.sin(i * 0.7);
    return `${(cx + Math.cos(a) * rx * w).toFixed(1)} ${(cy + Math.sin(a) * ry * w).toFixed(1)}`;
  });
  const d = "M " + pts.join(" L ");
  return (
    <g>
      <path d={d} fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" opacity="0.28" {...dash(k)} />
      <path d={d} fill="none" stroke="url(#ms-gold)" strokeWidth="6" strokeLinecap="round" {...dash(k)} />
    </g>
  );
}

// Tansy's guess: a dotted blue ring, before anyone has tested it.
function Guess({ cx, cy, rx, ry, o }) {
  if (o <= 0) return null;
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={BLUE} strokeWidth="4.5" strokeDasharray="2 11" strokeLinecap="round" opacity={o} />;
}

// A manicule: the little pointing hand scribes drew beside what matters.
function Manicule({ x, y, k, s = 1.3 }) {
  if (k <= 0) return null;
  return (
    <g transform={`translate(${x + (1 - k) * 30} ${y}) scale(${s})`} opacity={k} stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
      <rect x="54" y="-15" width="22" height="30" fill={RED} />
      <path d="M 54 -13 C 44 -15 38 -12 32 -8 L 4 -8 C -4 -8 -4 2 4 2 L 30 2 C 30 8 34 14 42 15 L 54 13 Z" fill="#F4E6C9" />
      <path d="M 32 2 C 36 2 40 5 40 8 M 34 8 C 38 8 42 10 42 13" fill="none" />
    </g>
  );
}

// A painted roundel for a figure, with its letter in red.
function Roundel({ cx, cy, r, label, o = 1, glow = 0, children }) {
  if (o <= 0) return null;
  return (
    <g opacity={o}>
      {glow > 0 && <circle cx={cx} cy={cy} r={r + 12} fill="none" stroke="#EBCB6E" strokeWidth="12" opacity={glow * 0.55} />}
      <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="url(#ms-gold)" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={r} fill={CREAM} stroke={RED} strokeWidth="1.6" />
      <g transform={`translate(${cx} ${cy})`} filter="url(#ms-ink)">{children}</g>
      {label && <text x={cx - r - 16} y={cy - r + 26} textAnchor="middle" fontFamily={UNCIAL} fontSize="38" fill={RED}>{label}</text>}
    </g>
  );
}

// Regular shapes for the figures, first corner up.
function shapePts(kind, r) {
  const poly = (n, rot = 0, sx = 1, dy = 0) => Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + rot + (i * 2 * Math.PI) / n;
    return [r * Math.cos(a) * sx, r * Math.sin(a) + dy];
  });
  if (kind === "triangle") return poly(3, 0, 1.08, r * 0.18);
  if (kind === "square") return poly(4, Math.PI / 4, 1.0, 0).map(([x, y]) => [x * 0.92, y * 0.92]);
  if (kind === "pentagon") return poly(5, 0, 1, r * 0.06);
  if (kind === "hexagon") return poly(6, Math.PI / 6);
  if (kind === "diamond") return poly(4, 0, 0.78);
  return null;
}
const ptsPath = pts => "M " + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ") + " Z";
function Fig({ kind, r, fill = "none", stroke = INK, width = 4 }) {
  if (kind === "circle") return <circle r={r} fill={fill} stroke={stroke} strokeWidth={width} />;
  return <path d={ptsPath(shapePts(kind, r))} fill={fill} stroke={stroke} strokeWidth={width} strokeLinejoin="round" />;
}
// Trace round a shape's sides, numbering each as it is counted.
function CountSides({ kind, r, k, color = "#C99A2E" }) {
  if (k <= 0) return null;
  const pts = shapePts(kind, r);
  const n = pts.length;
  return (
    <g>
      <path d={ptsPath(pts)} fill="none" stroke={color} strokeWidth="7" strokeLinejoin="round" opacity="0.9" {...dash(k)} />
      {pts.map(([x1, y1], i) => {
        const [x2, y2] = pts[(i + 1) % n];
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const len = Math.hypot(mx, my) || 1;
        const on = clamp01((k * n - i) * 2);
        return on > 0 && <text key={i} x={mx + (mx / len) * 20} y={my + (my / len) * 20 + 9} textAnchor="middle" fontFamily={BODY} fontWeight="600" fontSize="24" fill={color === RED ? RED : BROWN} opacity={on}>{i + 1}</text>;
      })}
    </g>
  );
}
// n gold dots in a small ring.
function Dots({ n, r, pulse = 0 }) {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const d = n === 1 ? 0 : r;
    return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d + (n === 3 ? r * 0.25 : 0)} r={8.5 + pulse * 3} fill="url(#ms-gold)" stroke={INK} strokeWidth="1.8" />;
  });
}

// ---------- The creatures of the margins ----------

// Brother Quill, the grumpy owl scribe, in spectacles, with his quill.
function Owl({ x, y, sc = 1, talk = 0, frame, appear = 1, hop = 0 }) {
  if (appear <= 0) return null;
  const bp = frame % 113;
  const lid = 0.34 + 0.66 * (bp < 6 ? Math.sin((Math.PI * bp) / 6) : 0);
  const open = talk;
  const wag = talk > 0 ? Math.sin(frame / 4) * 7 : Math.sin(frame / 45) * 2;
  const breathe = 1 + 0.012 * Math.sin(frame / 22);
  const B = "#8A5A33", D = "#65401F", L = "#E6CC9D";
  const eye = cx => (
    <g>
      <circle cx={cx} cy={-150} r="31" fill="#EAD7AE" stroke={INK} strokeWidth="2" />
      <circle cx={cx} cy={-150} r="17" fill="#E4A534" stroke={INK} strokeWidth="2" />
      <circle cx={cx + 4} cy={-150} r="8.5" fill={INK} />
      <circle cx={cx + 7} cy={-154} r="2.6" fill="#FFF8E6" />
      <ellipse cx={cx} cy={-168 + 18 * lid} rx="19" ry={18 * lid} fill={B} stroke={INK} strokeWidth="2" />
      <circle cx={cx} cy={-150} r="22" fill="rgba(255,255,255,0.08)" stroke="#3A2A1A" strokeWidth="3" />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y - hop * 14}) scale(${sc})`} opacity={appear} filter="url(#ms-ink)">
      {/* An inkhorn on the branch beside him. */}
      <g transform="translate(-86 -2)">
        <path d="M -12 0 L -9 -30 L 9 -30 L 12 0 Z" fill={BLUE} stroke={INK} strokeWidth="2" />
        <ellipse cx="0" cy="-30" rx="10" ry="3.5" fill={INK} />
      </g>
      <g transform={`scale(1 ${breathe})`}>
        <path d="M -26 -14 L -8 22 L 12 -14 Z" fill={D} stroke={INK} strokeWidth="2.5" />
        <path d="M -62 -30 C -78 -110 -64 -192 0 -198 C 64 -192 78 -110 62 -30 C 50 2 -50 2 -62 -30 Z" fill={B} stroke={INK} strokeWidth="3.5" />
        <path d="M -40 -40 C -48 -98 -30 -126 0 -128 C 30 -126 48 -98 40 -40 C 30 -18 -30 -18 -40 -40 Z" fill={L} stroke={INK} strokeWidth="2" />
        {[[-100, 3], [-84, 4], [-68, 4], [-52, 3]].map(([yy, n], r) => Array.from({ length: n }, (_, c) => {
          const cx = (c - (n - 1) / 2) * 17;
          return <path key={`${r}-${c}`} d={`M ${cx - 7} ${yy} q 7 8 14 0`} fill="none" stroke={B} strokeWidth="2" />;
        }))}
        <g transform={`rotate(${-hop * 30} -60 -120)`}>
          <path d="M -60 -122 C -88 -92 -84 -48 -58 -26 C -50 -60 -48 -92 -60 -122 Z" fill={D} stroke={INK} strokeWidth="2.5" />
        </g>
        <path d="M -44 -182 L -60 -226 L -20 -194 Z" fill={D} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M 44 -182 L 60 -226 L 20 -194 Z" fill={D} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        {eye(-27)}{eye(27)}
        <path d="M -8 -152 Q 0 -160 8 -152" fill="none" stroke="#3A2A1A" strokeWidth="3" />
        {/* The famous frown. */}
        <path d="M -58 -181 L -9 -166" stroke={INK} strokeWidth="7.5" strokeLinecap="round" />
        <path d="M 58 -181 L 9 -166" stroke={INK} strokeWidth="7.5" strokeLinecap="round" />
        <path d={`M -7 -128 L 7 -128 L 0 ${-121 + open * 14} Z`} fill="#A87423" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M -10 -136 L 10 -136 L 0 -114 Z" fill="#D9A043" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        {/* The writing wing, and his quill. */}
        <g transform={`rotate(${wag - hop * 20} 56 -112)`}>
          <path d="M 60 -122 C 88 -92 84 -48 58 -26 C 50 -60 48 -92 60 -122 Z" fill={D} stroke={INK} strokeWidth="2.5" />
          <path d="M 70 -56 C 90 -110 112 -170 132 -228 C 118 -200 96 -140 80 -80 Z" fill="#FBF3E1" stroke={INK} strokeWidth="2" />
          <path d="M 64 -40 L 132 -228" stroke={INK} strokeWidth="2" />
          {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M ${86 + i * 9} ${-96 - i * 26} l 10 -6`} stroke={INK} strokeWidth="1" opacity="0.6" />)}
          <ellipse cx="68" cy="-60" rx="10" ry="7" fill={D} stroke={INK} strokeWidth="2" />
        </g>
      </g>
      <path d="M -24 0 l -6 8 M -20 0 l 0 9 M -16 0 l 6 8 M 16 0 l -6 8 M 20 0 l 0 9 M 24 0 l 6 8" stroke="#B07A28" strokeWidth="3.2" strokeLinecap="round" />
    </g>
  );
}

// Sir Snail, a knight at last: helmet, plume and a lance with a pennant.
function Snail({ x, y, sc = 1, talk = 0, frame, appear = 1, hop = 0 }) {
  if (appear <= 0) return null;
  const creep = Math.sin(frame / 70) * 4;
  const wob = Math.sin(frame / 17) * 4 + talk * Math.sin(frame / 3) * 3;
  const duck = hop * 26;
  const S = "#BDBB8C", SD = "#8E8C5E";
  const spiral = Array.from({ length: 66 }, (_, i) => {
    const a = i * 0.26;
    const r = 3 + a * 3.55;
    return `${(-30 + r * Math.cos(a + Math.PI)).toFixed(1)} ${(-86 + r * Math.sin(a + Math.PI)).toFixed(1)}`;
  });
  const flutter = Math.sin(frame / 6) * 4;
  const open = talk;
  return (
    <g transform={`translate(${x + creep} ${y}) scale(${sc})`} opacity={appear} filter="url(#ms-ink)">
      <path d="M -210 -2 C -180 -6 -150 0 -128 -2" stroke="#9FA7AE" strokeWidth="5" opacity="0.5" fill="none" strokeLinecap="round" />
      {/* Body and neck. */}
      <path d={`M -132 0 C -136 -14 -110 -22 -60 -22 L 40 -24 C 60 -30 64 ${-80 + duck} 70 ${-110 + duck} C 76 ${-142 + duck} 120 ${-146 + duck} 126 ${-112 + duck} C 130 ${-80 + duck} 114 -40 134 -8 C 138 0 130 4 120 2 Z`}
        fill={S} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[-100, -70, -40, -10, 20, 50].map(xx => <path key={xx} d={`M ${xx} -6 q 8 -6 16 0`} fill="none" stroke={SD} strokeWidth="2" />)}
      {/* Shell, with its spiral. */}
      <circle cx="-30" cy="-86" r="70" fill="#C98A3C" stroke={INK} strokeWidth="3.5" />
      <path d={"M " + spiral.join(" L ")} fill="none" stroke="#EBC47C" strokeWidth="9" strokeLinecap="round" opacity="0.8" />
      <path d={"M " + spiral.join(" L ")} fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      {/* Eye stalks through holes in the helmet. */}
      <g transform={`translate(0 ${duck})`}>
        {[[104, -154, -6], [120, -150, 8]].map(([sx, sy, lean], i) => {
          const ex = sx + lean + wob * (i ? 1 : -0.7), ey = sy - 34 - hop * 10;
          return (
            <g key={i}>
              <path d={`M ${sx} ${sy} Q ${sx + lean * 0.3} ${sy - 20} ${ex} ${ey}`} fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round" />
              <path d={`M ${sx} ${sy} Q ${sx + lean * 0.3} ${sy - 20} ${ex} ${ey}`} fill="none" stroke={S} strokeWidth="5" strokeLinecap="round" />
              <circle cx={ex} cy={ey} r="8" fill={INK} />
              <circle cx={ex + 2} cy={ey - 3} r="2.4" fill="#FFF8E6" />
            </g>
          );
        })}
        {/* The great helm, with a red plume. */}
        <path d="M 100 -158 C 84 -192 52 -190 40 -170 C 62 -178 80 -170 94 -150 Z" fill={RED} stroke={INK} strokeWidth="2" />
        <path d="M 70 -118 C 68 -162 128 -166 130 -122 L 131 -104 L 71 -104 Z" fill="#A9B1BA" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
        <path d="M 78 -150 C 90 -160 110 -160 118 -152" fill="none" stroke="#E8EEF2" strokeWidth="3" opacity="0.8" />
        <path d="M 96 -124 L 130 -124" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M 71 -110 L 131 -110" stroke={INK} strokeWidth="1.5" />
        {[80, 92].map(rx => <circle key={rx} cx={rx} cy="-136" r="2" fill={INK} />)}
        <ellipse cx="120" cy={-93} rx="7" ry={1.5 + open * 5} fill="#5A2A1C" stroke={INK} strokeWidth="1.5" />
      </g>
      {/* The lance, couched under his chin, with a swallowtail pennant. */}
      <g>
        <path d="M -84 -40 L 250 -92" stroke={INK} strokeWidth="10" strokeLinecap="round" />
        <path d="M -84 -40 L 250 -92" stroke="#9C6B3C" strokeWidth="6" strokeLinecap="round" />
        <path d="M 248 -99 L 284 -98 L 250 -85 Z" fill="#B8C0C8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d={`M 222 -87 L 170 ${-80 + flutter} L 186 ${-68 + flutter * 0.6} L 164 ${-56 + flutter} L 222 -74 Z`} fill={RED} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d={`M 220 -80 L 178 ${-72 + flutter * 0.8}`} stroke="#E8C36A" strokeWidth="3" />
        <rect x="-44" y="-56" width="12" height="20" fill={RED} stroke={INK} strokeWidth="1.5" transform="rotate(-9 -38 -46)" />
      </g>
    </g>
  );
}

// Tansy the rabbit and her herald trumpet with its hanging banner.
function Rabbit({ x, y, sc = 1, talk = 0, frame, appear = 1, hop = 0, blow = 0 }) {
  if (appear <= 0) return null;
  const bob = talk * Math.abs(Math.sin(frame / 5)) * 6;
  const twitch = frame % 97 < 8 ? Math.sin((frame % 97) / 8 * Math.PI) * 9 : 0;
  const bp = frame % 131;
  const blink = bp < 5 ? 1 : 0;
  const F = "#C9A57C", FD = "#9C7A55", PALE = "#F0E4CB";
  const ang = lerp(-24, 11, blow);
  const mx = lerp(-36, -52, blow), my = lerp(-100, -146, blow);
  const open = talk * (1 - blow);
  return (
    <g transform={`translate(${x} ${y - hop * 40 - bob}) scale(${sc})`} opacity={appear} filter="url(#ms-ink)">
      <circle cx="44" cy="-40" r="17" fill="#FBF6EA" stroke={INK} strokeWidth="2.5" />
      <ellipse cx="16" cy="-9" rx="42" ry="12" fill={F} stroke={INK} strokeWidth="2.5" />
      <path d="M -30 -20 C -52 -70 -42 -132 -6 -142 C 36 -147 52 -92 46 -40 C 42 -10 -20 -4 -30 -20 Z" fill={F} stroke={INK} strokeWidth="3" />
      <ellipse cx="-14" cy="-74" rx="19" ry="38" fill={PALE} />
      {/* Ears. */}
      <g transform={`rotate(${twitch * 0.6} -2 -186)`}>
        <ellipse cx="-2" cy="-238" rx="14" ry="50" transform="rotate(6 -2 -238)" fill={F} stroke={INK} strokeWidth="2.6" />
        <ellipse cx="-2" cy="-236" rx="6" ry="38" transform="rotate(6 -2 -236)" fill="#E8B9A6" />
      </g>
      <g transform={`rotate(${twitch} 16 -184)`}>
        <ellipse cx="22" cy="-230" rx="13" ry="48" transform="rotate(24 22 -230)" fill={FD} stroke={INK} strokeWidth="2.6" />
      </g>
      {/* Head. */}
      <circle cx="-16" cy="-164" r="36" fill={F} stroke={INK} strokeWidth="3" />
      <ellipse cx="-46" cy="-156" rx="18" ry="14" fill={F} stroke={INK} strokeWidth="2.5" />
      <ellipse cx="-44" cy="-154" rx="12" ry="9" fill={PALE} />
      <ellipse cx="-62" cy="-160" rx="4.5" ry="3.5" fill="#C9786A" stroke={INK} strokeWidth="1.2" />
      {blink ? <path d="M -38 -174 q 7 4 14 0" stroke={INK} strokeWidth="2.5" fill="none" /> : <>
        <circle cx="-31" cy="-174" r="7" fill={INK} />
        <circle cx="-33" cy="-177" r="2.4" fill="#FFF8E6" />
      </>}
      <path d="M -52 -146 q 5 4 10 0" stroke={INK} strokeWidth="1.8" fill="none" />
      {open > 0.05 && <ellipse cx="-48" cy="-142" rx="4.5" ry={2 + open * 5} fill="#5A2A1C" />}
      <path d="M -58 -152 l -22 -4 M -58 -150 l -22 3" stroke={INK} strokeWidth="1" opacity="0.6" />
      {/* The trumpet, lowered while she talks and raised to toot. */}
      <g transform={`translate(${mx} ${my}) rotate(${ang})`}>
        <path d="M 0 -3 L -170 -4 L -198 -19 L -198 19 L -170 4 L 0 3 Z" fill="url(#ms-gold)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="-198" cy="0" rx="5" ry="19" fill="#8A6420" stroke={INK} strokeWidth="1.5" />
        <path d="M -70 3 L -140 3 L -140 54 L -105 42 L -70 54 Z" fill={BLUE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M -105 12 L -105 38 M -116 24 L -94 24" stroke="#E8C36A" strokeWidth="4" />
        <ellipse cx="-14" cy="3" rx="10" ry="8" fill={F} stroke={INK} strokeWidth="2" />
      </g>
    </g>
  );
}

// ---------- Figures for the riddles ----------

// A row of letter tiles with hops between them: I to J to K.
function HopRow({ x, y, letters, k1 = 0, k2 = 0, back = 0, o = 1, gap = 118, glowFirst = 0 }) {
  if (o <= 0) return null;
  const tile = (i, on, col) => on > 0 && (
    <g key={i} opacity={on}>
      <rect x={x + i * gap - 28} y={y - 32} width="56" height="56" rx="5" fill={CREAM} stroke={BROWN} strokeWidth="1.5" />
      {i === 0 && glowFirst > 0 && <rect x={x - 28} y={y - 32} width="56" height="56" rx="5" fill="none" stroke="url(#ms-gold)" strokeWidth="5" opacity={glowFirst} />}
      <text x={x + i * gap} y={y + 11} textAnchor="middle" fontFamily={BODY} fontWeight="600" fontSize="40" fill={col}>{letters[i]}</text>
    </g>
  );
  const arc = (i, k) => {
    if (k <= 0) return null;
    const a = x + i * gap + 14, b = x + (i + 1) * gap - 14;
    const col = back > 0 ? GREEN : BLUE;
    const headAt = back > 0 ? a : b;
    const dir = back > 0 ? -1 : 1;
    return (
      <g key={`a${i}`}>
        <path d={`M ${a} ${y - 36} Q ${(a + b) / 2} ${y - 70} ${b} ${y - 36}`} fill="none" stroke={col} strokeWidth="3.2" {...dash(k)} />
        {k > 0.9 && <path d={`M ${headAt} ${y - 36} l ${-dir * 3} -12 M ${headAt} ${y - 36} l ${-dir * 12} -5`} stroke={col} strokeWidth="3.2" strokeLinecap="round" />}
      </g>
    );
  };
  return (
    <g opacity={o}>
      {tile(0, 1, INK)}
      {tile(1, k1, BROWN)}
      {tile(2, k2, RED)}
      {arc(0, k1)}
      {arc(1, k2)}
    </g>
  );
}

// ---------- The camera, the desk and the book ----------

// A slow, gentle drift over the open book.
function camera(f) {
  return {
    s: 1.024 + 0.016 * Math.sin(f / 310),
    x: 16 * Math.sin(f / 420),
    y: 7 * Math.sin(f / 360 + 1),
    r: 0.22 * Math.sin(f / 530),
  };
}

let TL = null;
const timeline = () => (TL ??= buildTimeline(film, DURATIONS[ID]));

// A scene's helpers at scene frame t, as the engine gives them to render().
function stateOf(sc, t) {
  const starts = sc.beats.map(b => b.start - sc.start);
  let beat = 0;
  starts.forEach((v, i) => { if (t >= v) beat = i; });
  return { t, beat, at: i => starts[i], speech: i => sc.beats[i].speech, length: sc.length, frame: sc.start + t };
}

function Desk() {
  return (
    <AbsoluteFill style={{ background: "radial-gradient(90% 80% at 40% 30%, #3A2616 0%, #22150B 60%, #150C06 100%)" }}>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <rect width="1920" height="1080" filter="url(#ms-wood)" opacity="0.9" />
      </svg>
    </AbsoluteFill>
  );
}

function Cover() {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <rect x="40" y="0" width="1840" height="948" rx="14" fill="#5B1F16" />
      <rect x="40" y="0" width="1840" height="948" rx="14" filter="url(#ms-leather)" />
      <rect x="40" y="0" width="1840" height="948" rx="14" fill="none" stroke="#2A0C06" strokeWidth="3" />
      <rect x="52" y="10" width="1816" height="928" rx="10" fill="none" stroke="#B88A3A" strokeWidth="1.5" opacity="0.5" />
      {/* The edges of the pages beneath, stacked. */}
      {[6, 5, 4, 3, 2, 1].map(i => (
        <g key={i}>
          <rect x={LEFT - i * 2.2} y={TOP + i * 1.6} width={PW} height={PH} fill={i % 2 ? "#D8C597" : "#E6D5AA"} stroke="#A88C5E" strokeWidth="0.6" />
          <rect x={GUT + i * 2.2} y={TOP + i * 1.6} width={PW} height={PH} fill={i % 2 ? "#D8C597" : "#E6D5AA"} stroke="#A88C5E" strokeWidth="0.6" />
        </g>
      ))}
    </svg>
  );
}

function Backdrop({ frame, scene }) {
  const tl = timeline();
  const index = scene.index;
  const sc = tl.scenes[index];
  const def = film.scenes[index];
  const t = frame - sc.start;
  const s = stateOf(sc, t);
  const turning = def.turn && t < TURN && index > 0;
  const p = turning ? 0.5 - 0.5 * Math.cos(Math.PI * clamp01(t / TURN)) : 1;
  const prevDef = index > 0 ? film.scenes[index - 1] : null;
  const prevSc = index > 0 ? tl.scenes[index - 1] : null;
  const prevS = prevSc ? stateOf(prevSc, prevSc.length - 1) : null;
  const cam = camera(frame);
  const angle = 180 * p;
  const shade = Math.sin((angle * Math.PI) / 180);
  const hop = turning ? Math.sin(Math.PI * p) : 0;

  // Who is speaking right now, and is Tansy tooting?
  const cur = sc.beats.find(b => frame >= b.start && frame < b.start + b.speech);
  const mouth = who => (cur && cur.who === who ? 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.55)) * (0.6 + 0.4 * hash(Math.floor(frame / 3))) : 0);
  let blow = 0;
  for (const scn of tl.scenes) for (const b of scn.beats) for (const x of b.sfxs ?? []) {
    if (x.sfx !== "manuscript-toot") continue;
    const f0 = b.start + Math.round(x.at * 30);
    blow = Math.max(blow, Math.min(rise(frame, 6, f0 - 8), 1 - rise(frame, 8, f0 + 30)));
  }
  const first = tl.scenes[0];

  return (
    <AbsoluteFill>
      <Defs frame={frame} />
      <Desk />
      <AbsoluteFill style={{ transform: `translate(${cam.x}px, ${cam.y}px) rotate(${cam.r}deg) scale(${cam.s})`, transformOrigin: "960px 470px" }}>
        <div style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.6))" }}><Cover /></div>
        <PageFace side="L">{turning ? prevDef.left(prevS) : def.left(s)}</PageFace>
        <PageFace side="R">{def.right(s)}</PageFace>
        {turning && (
          <>
            {/* The pages beneath darken as the leaf passes over them. */}
            <div style={{ position: "absolute", left: angle < 90 ? GUT : LEFT, top: TOP, width: PW, height: PH, background: `linear-gradient(${angle < 90 ? 90 : 270}deg, rgba(40,20,0,${0.32 * shade}), rgba(40,20,0,0) 70%)` }} />
            <div style={{ position: "absolute", left: GUT, top: TOP, width: PW, height: PH, transformOrigin: "0px 50%", transform: `perspective(5200px) rotateY(${-angle}deg)` }}>
              {angle < 90
                ? <PageFace side="R" left={0} top={0}>{prevDef.right(prevS)}</PageFace>
                : <div style={{ position: "absolute", inset: 0, transform: "scaleX(-1)" }}><PageFace side="L" left={0} top={0}>{def.left(s)}</PageFace></div>}
              <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, rgba(50,28,8,${0.4 * shade}) 0%, rgba(255,240,205,${0.1 * shade}) 55%, rgba(50,28,8,${0.25 * shade}) 100%)` }} />
            </div>
          </>
        )}
        {/* The creatures live on top of the page, alive rather than painted. */}
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <Owl x={LEFT + 100} y={TOP + 872} sc={0.92} frame={frame} talk={mouth("owl")} hop={hop} appear={rise(frame, 24, 4)} />
          <Snail x={LEFT + 430} y={TOP + 870} sc={0.9} frame={frame} talk={mouth("snail")} hop={hop} appear={rise(frame, 20, first.beats[2].start - 6)} />
          <Rabbit x={GUT + 560} y={TOP + 870} sc={0.84} frame={frame} talk={mouth("rabbit")} hop={hop} blow={blow} appear={rise(frame, 20, first.beats[3].start - 6)} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

// Candlelight from the upper left, and a soft vignette.
function Overlay({ frame }) {
  const flick = 0.5 + 0.3 * Math.sin(frame / 7.3) + 0.2 * Math.sin(frame / 2.9 + 1.3);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(55% 60% at 20% 12%, rgba(255,196,120,${0.08 + 0.03 * flick}), rgba(255,196,120,0) 70%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "radial-gradient(115% 100% at 50% 42%, rgba(0,0,0,0) 58%, rgba(12,6,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
}

function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ maxWidth: 1680, textAlign: "center", fontFamily: BODY, fontWeight: 500, fontSize: 46, lineHeight: 1.18, color: "#F6EAD0", textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.8)" }}>
        {actor && <span style={{ fontFamily: BODY, fontWeight: 600, fontVariant: "small-caps", fontSize: 36, color: actor.colour, marginRight: 18, letterSpacing: 1.5 }}>{actor.name}</span>}
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.42 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// ---------- The chapters ----------

const none = () => null;
const turnSfx = { sfx: "manuscript-turn", at: 0, volume: 0.8 };
const chime = (si, bi, f) => ({ sfx: "manuscript-chime", at: said(si, bi, f), volume: 0.7 });
const scratch = at => ({ sfx: "manuscript-scratch", at, volume: 0.55 });

// Chapter one: the analogy.
const ANALOGY = ["picture", "bristles", "painter", "wall"];
const ANALOGY_TESTS = ["a brush is the tool a picture uses?", "a brush is the tool bristles use?", "a brush is the tool a painter uses.", "a brush is the tool a wall uses?"];
const optY = i => 230 + i * 134;
const wordW = w => w.length * 28;

// Chapter two: the odd one out. Dots should match sides; the hexagon has one too few.
const ODD = [
  { label: "a", kind: "triangle", dots: 3, cx: 140, cy: 238 },
  { label: "b", kind: "square", dots: 4, cx: 365, cy: 238, blue: true },
  { label: "c", kind: "pentagon", dots: 5, cx: 590, cy: 238 },
  { label: "d", kind: "hexagon", dots: 5, cx: 252, cy: 478 },
  { label: "e", kind: "diamond", dots: 4, cx: 478, cy: 478, blue: true },
];
const SIDES = { triangle: 3, square: 4, pentagon: 5, hexagon: 6, diamond: 4 };

// Chapter three: most alike. The inside shape matches the outside shape.
const PAIR = [["circle", "circle"], ["triangle", "triangle"]];
const ALIKE = [
  { label: "a", out: "triangle", inn: "circle", cx: 205, cy: 300 },
  { label: "b", out: "square", inn: "square", cx: 480, cy: 300 },
  { label: "c", out: "circle", inn: "triangle", cx: 205, cy: 530 },
  { label: "d", out: "pentagon", inn: "square", cx: 480, cy: 530 },
];
function Nested({ out, inn, r = 62 }) {
  return (
    <>
      <Fig kind={out} r={r} stroke={INK} width={4.5} />
      <Fig kind={inn} r={r * 0.36} fill="url(#ms-gold)" stroke={INK} width={2.2} />
    </>
  );
}

// Chapter four: the letter code, two steps forward.
const CODES = ["MUJ", "PXM", "QYN", "QYM"];
const codeX = i => 110 + i * 150;

const film = {
  id: ID,
  order: 1701,
  series: 18,
  title: "The Riddle Book of Brother Snail",
  frame: "none",
  push: 0,
  cast: {
    owl: { name: "Brother Quill", voice: "bm_george", speed: 0.92, colour: "#E8C46A" },
    snail: { name: "Sir Snail", voice: "bm_fable", speed: 0.94, colour: "#BCD6A2" },
    rabbit: { name: "Tansy", voice: "bf_lily", speed: 1.06, colour: "#A9C8EE" },
  },
  music: { src: "music/manuscript.wav", volume: 0.24, duck: 0.4 },
  Backdrop,
  Overlay,
  Subtitles,
  scenes: [
    // 0. The title pages, and the cast.
    {
      beats: [
        { who: "owl", say: "Ahem. Quiet in the scriptorium. I am Brother Quill, the scribe.", sfxs: [{ sfx: "manuscript-bell", at: 0, volume: 0.6 }] },
        { who: "owl", say: "And this is the Riddle Book of Brother Snail." },
        { who: "snail", say: "Sir Snail, if you please. I have a helmet now." },
        { who: "rabbit", say: "And I'm Tansy! I'm very fast.", hold: 1.1, sfxs: [{ sfx: "manuscript-toot", at: said(0, 3, 1) + 0.1, volume: 0.7 }] },
        { who: "owl", say: "Fast is not the same as right. Say the rule, test every answer, then check. Turn the page." },
      ],
      render: none,
      left: s => (
        <>
          <Initial x={345} y={96} size={380} letter="R" font={FRAKTUR} start={16} t={s.t} frame={s.frame} />
          <Ink x={535} y={572} size={44} font={UNCIAL} color={RED} anchor="middle" k={rise(s.t, 30, 70)}>Here begins</Ink>
          <Ink x={535} y={630} size={40} font={UNCIAL} color={INK} anchor="middle" k={rise(s.t, 40, 90)}>the book of riddles</Ink>
        </>
      ),
      right: s => {
        const [a, b] = writeKs(s.t, W(s, 1, 0.1), s.speech(1) * 0.6, ["The Riddle", "Book"]);
        const of = rise(s.t, 24, W(s, 1, 0.65));
        const fix = rise(s.t, 20, W(s, 2, 0.35));
        const motto = writeKs(s.t, W(s, 4, 0.3), s.speech(4) * 0.55, ["Say the rule.", "Test every answer.", "Then check."]);
        return (
          <>
            <Ink x={355} y={200} size={80} font={UNCIAL} color={BLUE} anchor="middle" k={a}>The Riddle</Ink>
            <Ink x={355} y={290} size={80} font={UNCIAL} color={BLUE} anchor="middle" k={b}>Book</Ink>
            <g opacity={of}>
              <text x="140" y="372" textAnchor="middle" fontFamily={UNCIAL} fontSize="50" fill={RED}>of</text>
              <text x="330" y="372" textAnchor="middle" fontFamily={UNCIAL} fontSize="50" fill={RED}>Brother</text>
              <text x="540" y="372" textAnchor="middle" fontFamily={UNCIAL} fontSize="50" fill={RED}>Snail</text>
            </g>
            {/* Sir Snail's correction, with a caret, as scribes did. */}
            <Strike x1={225} y1={357} x2={438} y2={353} k={fix} color={INK} width={3} />
            <g opacity={rise(s.t, 12, W(s, 2, 0.45))}>
              <path d="M 318 384 L 330 366 L 342 384" fill="none" stroke={GREEN} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <Ink x={330} y={318} size={42} font={UNCIAL} color={GREEN} anchor="middle" k={rise(s.t, 18, W(s, 2, 0.5))}>Sir</Ink>
            <g opacity={of}>
              <path d="M 150 412 H 300 M 410 412 H 560" stroke="url(#ms-gold)" strokeWidth="3" />
              <path d="M 355 398 L 369 412 L 355 426 L 341 412 Z" fill="url(#ms-gold)" stroke={INK} strokeWidth="1.2" />
            </g>
            {["Say the rule.", "Test every answer.", "Then check."].map((m, i) => (
              <Ink key={m} x={355} y={492 + i * 56} size={42} italic color={i === 1 ? RED : INK} anchor="middle" k={motto[i]}>{m}</Ink>
            ))}
          </>
        );
      },
    },
    // 1. The first riddle: an analogy.
    {
      turn: true,
      beats: [
        { who: "owl", say: "The first riddle. As the quill is to the scribe, so the brush is to the what?", sfxs: [turnSfx] },
        { who: "rabbit", say: "Picture! Brushes make pictures!" },
        { who: "owl", say: "They go together. But first, say the rule for the quill and the scribe." },
        { who: "snail", say: "A quill is the tool that a scribe uses.", sfxs: [scratch(0.3)] },
        { who: "owl", say: "Now test each answer in that sentence. A brush is the tool that a picture uses?" },
        { who: "rabbit", say: "Oh. No. Pictures don't use anything." },
        { who: "snail", say: "Bristles? No, they are part of the brush. A wall? No, a wall just gets painted." },
        { who: "owl", say: "A brush is the tool that a painter uses. Yes! Tool and user, both times. The answer is painter.", sfxs: [chime(1, 7, 0.8)] },
        { who: "rabbit", say: "So picture was a trap. It goes with brush, but not in the same way." },
      ],
      render: none,
      left: s => {
        const ks = writeKs(s.t, TURN + 16, Math.max(40, W(s, 0, 0.95) - TURN - 16), ["s the quill is to", "the scribe,", "so the brush is to the"]);
        const key = rise(s.t, 12, W(s, 2, 0.7));
        const keyCol = key > 0.5 ? RED : INK;
        const answer = rise(s.t, 26, W(s, 7, 0.72));
        return (
          <>
            <Heading s={s} title="The First Riddle" sub="an analogy" />
            <Initial x={232} y={188} size={150} letter="A" font={BODY} fontSize={124} start={TURN} t={s.t} frame={s.frame} />
            <Ink x={404} y={244} size={52} k={ks[0]} parts={[{ t: "s the " }, { t: "quill", c: keyCol, w: key > 0.5 ? 600 : 400 }, { t: " is to" }]} />
            <Ink x={404} y={312} size={52} k={ks[1]} parts={[{ t: "the " }, { t: "scribe", c: keyCol, w: key > 0.5 ? 600 : 400 }, { t: "," }]} />
            <Ink x={232} y={380} size={52} k={ks[2]}>so the brush is to the</Ink>
            {ks[2] >= 1 && (
              <>
                <path d="M 234 452 H 470" stroke={BROWN} strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" opacity={1 - answer * 0.7} />
                <Ink x={488} y={448} size={52} color={BROWN} opacity={1 - answer}>?</Ink>
                <Ink x={242} y={446} size={60} weight={600} color={RED} k={answer}>painter.</Ink>
              </>
            )}
            <Rule x={232} y={548} lines={["A quill is the tool", "that a scribe uses."]} t={s.t} start={W(s, 3, 0)} dur={s.speech(3) * 0.9} size={48} gap={60} />
          </>
        );
      },
      right: s => {
        const show = i => rise(s.t, 16, W(s, 0, 0.55 + i * 0.1));
        const tests = [
          writeKs(s.t, W(s, 4, 0.55), s.speech(4) * 0.4, [ANALOGY_TESTS[0]])[0],
          writeKs(s.t, W(s, 6, 0.0), s.speech(6) * 0.2, [ANALOGY_TESTS[1]])[0],
          writeKs(s.t, W(s, 7, 0.0), s.speech(7) * 0.3, [ANALOGY_TESTS[2]])[0],
          writeKs(s.t, W(s, 6, 0.55), s.speech(6) * 0.2, [ANALOGY_TESTS[3]])[0],
        ];
        const strikes = [rise(s.t, 12, W(s, 5, 0.15)), rise(s.t, 12, W(s, 6, 0.3)), 0, rise(s.t, 12, W(s, 6, 0.85))];
        const guess = rise(s.t, 12, W(s, 1, 0.2)) * (1 - rise(s.t, 12, W(s, 5, 0.1)));
        return (
          <>
            <Ink x={355} y={118} size={36} italic color={BROWN} anchor="middle" k={rise(s.t, 20, TURN - 4)}>Which word fits the gap?</Ink>
            {ANALOGY.map((w, i) => {
              const y = optY(i);
              return (
                <g key={w} opacity={show(i)}>
                  <circle cx="98" cy={y - 17} r="26" fill="url(#ms-gold)" stroke={INK} strokeWidth="1.5" />
                  <text x="98" y={y - 5} textAnchor="middle" fontFamily={UNCIAL} fontSize="32" fill={RED}>{"abcd"[i]}</text>
                  <text x="148" y={y} fontFamily={BODY} fontSize="64" fill={INK}>{w}</text>
                  <Ink x={150} y={y + 46} size={32} italic color={BROWN} k={tests[i]}>{ANALOGY_TESTS[i]}</Ink>
                  <Strike x1={140} y1={y - 16} x2={160 + wordW(w)} y2={y - 20} k={strikes[i]} />
                </g>
              );
            })}
            <Guess cx={148 + wordW("picture") / 2} cy={optY(0) - 17} rx={wordW("picture") / 2 + 36} ry={44} o={guess} />
            <Tick x={200 + wordW("painter")} y={optY(2) - 20} k={rise(s.t, 12, W(s, 7, 0.28))} />
            <Ring cx={150 + wordW("painter") / 2} cy={optY(2) - 21} rx={wordW("painter") / 2 + 40} ry={40} k={rise(s.t, 22, W(s, 7, 0.8))} />
            <Manicule x={560} y={optY(2) - 20} k={rise(s.t, 16, W(s, 7, 0.9))} />
            <Ink x={410} y={optY(0) - 10} size={38} italic color={BLUE} k={rise(s.t, 20, W(s, 8, 0.15))}>a trap!</Ink>
          </>
        );
      },
    },
    // 2. The second riddle: the odd one out.
    {
      turn: true,
      beats: [
        { who: "owl", say: "The second riddle. Which one is the odd one out?", sfxs: [turnSfx] },
        { who: "rabbit", say: "The blue one!" },
        { who: "owl", say: "Which blue one? There are two. A rule has to split four from one." },
        { who: "snail", say: "Let me count, slowly. The triangle has three sides, and three dots." },
        { who: "owl", say: "So here is a rule to test. The dots match the sides.", sfxs: [scratch(0.8)] },
        { who: "owl", say: "The square, four and four. The pentagon, five and five. The diamond, four and four." },
        { who: "snail", say: "But the hexagon has six sides, and only five dots!" },
        { who: "owl", say: "Four follow the rule, and one breaks it. The hexagon is the odd one out.", sfxs: [chime(2, 7, 0.75)] },
      ],
      render: none,
      left: s => {
        const ks = writeKs(s.t, TURN + 16, Math.max(40, W(s, 0, 0.95) - TURN - 16), ["our figures are", "alike. Which one", "is the odd one out?"]);
        return (
          <>
            <Heading s={s} title="The Second Riddle" sub="the odd one out" />
            <Initial x={232} y={188} size={150} letter="F" start={TURN} t={s.t} frame={s.frame} />
            <Ink x={404} y={244} size={52} k={ks[0]}>our figures are</Ink>
            <Ink x={404} y={312} size={52} k={ks[1]}>alike. Which one</Ink>
            <Ink x={232} y={380} size={52} k={ks[2]}>is the odd one out?</Ink>
            <Rule x={232} y={478} lines={["The number of dots", "matches the number", "of sides."]} t={s.t} start={W(s, 4, 0.3)} dur={s.speech(4) * 0.7} size={48} gap={60} />
          </>
        );
      },
      right: s => {
        const tally = [W(s, 3, 0.75), W(s, 5, 0.05), W(s, 5, 0.38), W(s, 6, 0.75), W(s, 5, 0.7)];
        const ticks = [W(s, 3, 0.95), W(s, 5, 0.28), W(s, 5, 0.62), null, W(s, 5, 0.95)];
        const counts = [[W(s, 3, 0.25), s.speech(3) * 0.4], null, null, [W(s, 6, 0.15), s.speech(6) * 0.45], null];
        const guessB = rise(s.t, 10, W(s, 1, 0.2)) * (1 - rise(s.t, 12, W(s, 2, 0.95)));
        const guessE = rise(s.t, 10, W(s, 2, 0.2)) * (1 - rise(s.t, 12, W(s, 2, 0.95)));
        return (
          <>
            <Ink x={355} y={100} size={36} italic color={BROWN} anchor="middle" k={rise(s.t, 20, TURN - 4)}>Which is the odd one out?</Ink>
            {ODD.map((f, i) => {
              const odd = f.kind === "hexagon";
              const count = counts[i] ? clamp01((s.t - counts[i][0]) / counts[i][1]) : 0;
              const pulse = i === 0 ? Math.max(0, Math.sin(clamp01((s.t - W(s, 3, 0.7)) / 30) * Math.PI)) : 0;
              return (
                <g key={f.label}>
                  <Roundel cx={f.cx} cy={f.cy} r={92} label={f.label} o={rise(s.t, 16, W(s, 0, 0.3 + i * 0.1))}>
                    <Fig kind={f.kind} r={64} fill={f.blue ? "url(#ms-lapis)" : "none"} width={4.5} />
                    <Dots n={f.dots} r={f.dots === 3 ? 20 : 25} pulse={pulse} />
                    <CountSides kind={f.kind} r={64} k={count} color={odd ? RED : "#C99A2E"} />
                  </Roundel>
                  <Ink x={f.cx} y={f.cy + 136} size={30} italic anchor="middle" color={odd ? RED : BROWN} weight={odd ? 600 : 400}
                    k={rise(s.t, 16, tally[i])}>{`${SIDES[f.kind]} sides, ${f.dots} dots`}</Ink>
                  {ticks[i] !== null && <Tick x={f.cx + 82} y={f.cy + 70} k={rise(s.t, 10, ticks[i])} s={0.9} />}
                </g>
              );
            })}
            <Guess cx={ODD[1].cx} cy={ODD[1].cy} rx={112} ry={112} o={guessB} />
            <Guess cx={ODD[4].cx} cy={ODD[4].cy} rx={112} ry={112} o={guessE} />
            <Ring cx={ODD[3].cx} cy={ODD[3].cy} rx={106} ry={106} k={rise(s.t, 22, W(s, 7, 0.7))} />
          </>
        );
      },
    },
    // 3. The third riddle: most alike.
    {
      turn: true,
      beats: [
        { who: "owl", say: "The third riddle. Which answer is most like these two?", sfxs: [turnSfx] },
        { who: "rabbit", say: "This one! It has a triangle and a circle, just like them!" },
        { who: "owl", say: "It only borrows their shapes. What do the two really share?" },
        { who: "snail", say: "A small circle inside a big circle. And a small triangle inside a big triangle." },
        { who: "owl", say: "So the rule is: the inside shape matches the outside shape. Test each one.", sfxs: [scratch(0.6)] },
        { who: "snail", say: "A circle in a triangle? No. A square in a square? Yes!" },
        { who: "rabbit", say: "A triangle in a circle? No. A square in a pentagon? No." },
        { who: "owl", say: "Only one follows the rule. The square in the square, with no circles or triangles at all.", sfxs: [chime(3, 7, 0.4)] },
      ],
      render: none,
      left: s => {
        const ks = writeKs(s.t, TURN + 16, Math.max(40, W(s, 0, 0.95) - TURN - 16), ["hich answer is", "most like these", "two?"]);
        const glow1 = Math.min(rise(s.t, 12, W(s, 3, 0.05)), 1 - rise(s.t, 12, W(s, 3, 0.5)));
        const glow2 = Math.min(rise(s.t, 12, W(s, 3, 0.52)), 1 - rise(s.t, 12, W(s, 4, 0.1)));
        const pairO = i => rise(s.t, 18, W(s, 0, 0.55 + i * 0.12));
        return (
          <>
            <Heading s={s} title="The Third Riddle" sub="most alike" />
            <Initial x={232} y={188} size={150} letter="W" start={TURN} t={s.t} frame={s.frame} />
            <Ink x={404} y={244} size={52} k={ks[0]}>hich answer is</Ink>
            <Ink x={404} y={312} size={52} k={ks[1]}>most like these</Ink>
            <Ink x={232} y={380} size={52} k={ks[2]}>two?</Ink>
            {PAIR.map(([out, inn], i) => (
              <Roundel key={i} cx={i ? 690 : 400} cy={548} r={96} o={pairO(i)} glow={i ? glow2 : glow1}>
                <Nested out={out} inn={inn} />
              </Roundel>
            ))}
            <Ink x={545} y={566} size={56} font={UNCIAL} color={RED} anchor="middle" k={pairO(1)}>&amp;</Ink>
          </>
        );
      },
      right: s => {
        const ruleStart = W(s, 4, 0.1);
        const ks = writeKs(s.t, ruleStart + 6, s.speech(4) * 0.7, ["The inside shape matches", "the outside shape."]);
        const q = rise(s.t, 20, TURN - 4) * (1 - rise(s.t, 10, ruleStart));
        const strikes = [W(s, 5, 0.3), null, W(s, 6, 0.3), W(s, 6, 0.85)];
        const guess = rise(s.t, 10, W(s, 1, 0.2)) * (1 - rise(s.t, 12, W(s, 2, 0.9)));
        return (
          <>
            <Ink x={355} y={112} size={36} italic color={BROWN} anchor="middle" k={q > 0 ? 1 : 0} opacity={q}>Which is most like them?</Ink>
            <Ink x={70} y={104} size={30} font={UNCIAL} k={rise(s.t, 10, ruleStart)} parts={[{ t: "¶ ", c: BLUE }, { t: "The rule", c: RED }]} />
            <Ink x={70} y={150} size={36} italic color={RED} k={ks[0]}>The inside shape matches</Ink>
            <Ink x={70} y={192} size={36} italic color={RED} k={ks[1]}>the outside shape.</Ink>
            {ALIKE.map((f, i) => (
              <g key={f.label}>
                <Roundel cx={f.cx} cy={f.cy} r={92} label={f.label} o={rise(s.t, 16, W(s, 0, 0.55 + i * 0.1))}>
                  <Nested out={f.out} inn={f.inn} r={60} />
                </Roundel>
                {strikes[i] !== null && <Strike x1={f.cx - 80} y1={f.cy + 70} x2={f.cx + 80} y2={f.cy - 72} k={rise(s.t, 12, strikes[i])} />}
              </g>
            ))}
            <Tick x={ALIKE[1].cx + 80} y={ALIKE[1].cy - 80} k={rise(s.t, 10, W(s, 5, 0.85))} />
            <Guess cx={ALIKE[0].cx} cy={ALIKE[0].cy} rx={112} ry={112} o={guess} />
            <Ring cx={ALIKE[1].cx} cy={ALIKE[1].cy} rx={114} ry={114} k={rise(s.t, 22, W(s, 7, 0.35))} />
          </>
        );
      },
    },
    // 4. The fourth riddle: a letter code.
    {
      turn: true,
      beats: [
        { who: "owl", say: "The last riddle. In the secret code, INK is written KPM. How is OWL written?", voice: "The last riddle. In the secret code, ink is written K. P. M. How is owl written?", sfxs: [turnSfx] },
        { who: "rabbit", say: "Each letter moves one step! PXM!", voice: "Each letter moves one step! P. X. M!" },
        { who: "owl", say: "Test it on the example first. I, one step on, is J. But the code says K." },
        { who: "snail", say: "Count the steps. I, J, K. Two. N, O, P. Two. K, L, M. Two again." },
        { who: "owl", say: "So every letter moves two steps forward. Now use it on OWL.", voice: "So every letter moves two steps forward. Now use it on owl.", sfxs: [scratch(0.2)] },
        { who: "snail", say: "O, P, Q. W, X, Y. L, M, N. That makes QYN!", voice: "O, P, Q. W, X, Y. L, M, N. That makes Q. Y. N!" },
        { who: "owl", say: "Check it backwards. Each letter goes back two steps, and QYN spells OWL. It works.", voice: "Check it backwards. Each letter goes back two steps, and Q. Y. N. spells owl. It works.", sfxs: [chime(4, 6, 0.9)] },
        { who: "rabbit", say: "So MUJ went the wrong way, and QYM slipped on the last letter. More traps!", voice: "So M. U. J. went the wrong way, and Q. Y. M. slipped on the last letter. More traps!" },
      ],
      render: none,
      left: s => {
        const ks = writeKs(s.t, TURN + 16, Math.max(40, W(s, 0, 0.6) - TURN - 16), ["n the secret code,", "INK is written"]);
        const kpm = rise(s.t, 16, W(s, 0, 0.62));
        const firstHop = rise(s.t, 16, W(s, 2, 0.35));
        const notK = rise(s.t, 12, W(s, 2, 0.75)) * (1 - rise(s.t, 10, W(s, 3, 0.18)));
        const rows = [
          { l: "IJK", k1: firstHop, k2: rise(s.t, 14, W(s, 3, 0.25)) },
          { l: "NOP", k1: rise(s.t, 12, W(s, 3, 0.36)), k2: rise(s.t, 12, W(s, 3, 0.46)), o: rise(s.t, 10, W(s, 3, 0.32)) },
          { l: "KLM", k1: rise(s.t, 12, W(s, 3, 0.68)), k2: rise(s.t, 12, W(s, 3, 0.78)), o: rise(s.t, 10, W(s, 3, 0.64)) },
        ];
        const rowsIn = rise(s.t, 14, W(s, 2, 0.25));
        return (
          <>
            <Heading s={s} title="The Fourth Riddle" sub="a letter code" />
            <Initial x={232} y={188} size={150} letter="I" start={TURN} t={s.t} frame={s.frame} />
            <Ink x={404} y={244} size={52} k={ks[0]}>n the secret code,</Ink>
            <Ink x={404} y={312} size={52} k={ks[1]} parts={[{ t: "INK", w: 600 }, { t: " is written" }]} />
            <Ink x={232} y={380} size={52} k={kpm} parts={[{ t: "KPM", c: RED, w: 600 }, { t: "." }]} />
            {rows.map((r, i) => (
              <HopRow key={r.l} x={330} y={482 + i * 84} letters={r.l} k1={r.k1} k2={r.k2} o={i === 0 ? rowsIn : r.o} />
            ))}
            {rows.map((r, i) => (
              <Ink key={`two${i}`} x={640} y={492 + i * 84} size={30} italic color={BLUE} k={r.k2}>two steps</Ink>
            ))}
            <Ink x={500} y={492} size={32} italic weight={500} color={RED} opacity={notK} k={notK > 0 ? 1 : 0}>J, not K!</Ink>
          </>
        );
      },
      right: s => {
        const ks = writeKs(s.t, W(s, 4, 0.1), s.speech(4) * 0.6, ["Every letter moves", "two steps forward."]);
        const rows = [0, 1, 2].map(i => ({
          l: ["OPQ", "WXY", "LMN"][i],
          o: rise(s.t, 10, W(s, 5, i * 0.24)),
          k1: rise(s.t, 10, W(s, 5, i * 0.24 + 0.06)),
          k2: rise(s.t, 10, W(s, 5, i * 0.24 + 0.14)),
        }));
        const back = rise(s.t, 10, W(s, 6, 0.3));
        const guess = rise(s.t, 10, W(s, 1, 0.6)) * (1 - rise(s.t, 12, W(s, 2, 0.95)));
        const strikes = [W(s, 7, 0.2), W(s, 2, 0.9), null, W(s, 7, 0.6)];
        return (
          <>
            <Ink x={70} y={100} size={30} font={UNCIAL} k={rise(s.t, 10, W(s, 4, 0.05))} parts={[{ t: "¶ ", c: BLUE }, { t: "The rule", c: RED }]} />
            <Ink x={70} y={146} size={36} italic color={RED} k={ks[0]}>Every letter moves</Ink>
            <Ink x={70} y={188} size={36} italic color={RED} k={ks[1]}>two steps forward.</Ink>
            <Ink x={355} y={258} size={46} anchor="middle" k={rise(s.t, 20, W(s, 0, 0.75))} parts={[{ t: "How is " }, { t: "OWL", w: 600 }, { t: " written?" }]} />
            {rows.map((r, i) => (
              <HopRow key={r.l} x={170} y={336 + i * 76} letters={r.l} k1={r.k1} k2={r.k2} o={r.o} back={back} glowFirst={back} />
            ))}
            <Ink x={480} y={400} size={30} italic color={GREEN} k={rise(s.t, 16, W(s, 6, 0.4))}>back two:</Ink>
            <Ink x={480} y={442} size={36} weight={600} color={GREEN} k={rise(s.t, 16, W(s, 6, 0.55))}>O W L</Ink>
            {CODES.map((c, i) => (
              <g key={c} opacity={rise(s.t, 14, W(s, 0, 0.85) + i * 5)}>
                <text x={codeX(i)} y="548" textAnchor="middle" fontFamily={UNCIAL} fontSize="30" fill={RED}>{"abcd"[i]}</text>
                <rect x={codeX(i) - 62} y="560" width="124" height="64" rx="4" fill={CREAM} stroke={BROWN} strokeWidth="1.6" />
                <text x={codeX(i)} y="606" textAnchor="middle" fontFamily={BODY} fontWeight="500" fontSize="40" letterSpacing="3" fill={INK}>{c}</text>
                {strikes[i] !== null && <Strike x1={codeX(i) - 56} y1={598} x2={codeX(i) + 56} y2={582} k={rise(s.t, 12, strikes[i])} />}
              </g>
            ))}
            <Guess cx={codeX(1)} cy={574} rx={82} ry={56} o={guess} />
            <Ring cx={codeX(2)} cy={578} rx={86} ry={56} k={rise(s.t, 22, W(s, 6, 0.85))} />
          </>
        );
      },
    },
    // 5. The colophon: the three rules, and goodbye.
    {
      turn: true,
      tail: 1.2,
      beats: [
        { who: "owl", say: "Four riddles, and one way to crack them all.", sfxs: [turnSfx] },
        { who: "owl", say: "Say the rule. Test every answer. Then check." },
        { who: "snail", say: "Slow and steady wins the riddle." },
        { who: "rabbit", say: "And fast is fine, as long as you check!", hold: 1.1, sfxs: [{ sfx: "manuscript-toot", at: said(5, 3, 1) + 0.1, volume: 0.7 }] },
        { who: "owl", say: "Here ends the Riddle Book. Well done, scholar. Nothing gets past you.", sfxs: [{ sfx: "manuscript-bell", at: said(5, 4, 1) + 0.2, volume: 0.6 }] },
      ],
      render: none,
      left: s => {
        const items = ["Say the rule.", "Test every answer.", "Then check."];
        return (
          <>
            <Heading s={s} title="The Scribe's Three Rules" sub="for every riddle" />
            {items.map((m, i) => {
              const at = W(s, 1, i * 0.33);
              return (
                <g key={m}>
                  <Initial x={240} y={214 + i * 160} size={110} letter={["I", "II", "III"][i]} font={BODY} fontSize={[64, 58, 48][i]} start={at - 8} t={s.t} frame={s.frame} ground={i === 1 ? "url(#ms-rose)" : "url(#ms-lapis)"} />
                  <Ink x={384} y={288 + i * 160} size={58} k={rise(s.t, 22, at)} color={INK}>{m}</Ink>
                </g>
              );
            })}
          </>
        );
      },
      right: s => {
        const [a, b, c] = writeKs(s.t, TURN, 60, ["Here ends", "the Riddle Book", "of Brother Snail"]);
        return (
          <>
            <Ink x={355} y={170} size={56} font={UNCIAL} color={RED} anchor="middle" k={a}>Here ends</Ink>
            <Ink x={355} y={250} size={62} font={UNCIAL} color={BLUE} anchor="middle" k={b}>the Riddle Book</Ink>
            <Ink x={355} y={318} size={44} font={UNCIAL} color={RED} anchor="middle" k={c}>of Brother Snail</Ink>
            <g opacity={c}>
              <path d="M 150 364 H 300 M 410 364 H 560" stroke="url(#ms-gold)" strokeWidth="3" />
              <path d="M 355 350 L 369 364 L 355 378 L 341 364 Z" fill="url(#ms-gold)" stroke={INK} strokeWidth="1.2" />
            </g>
            <Ink x={355} y={460} size={50} italic anchor="middle" k={rise(s.t, 26, W(s, 4, 0.35))}>Well done, scholar.</Ink>
            <Ink x={355} y={530} size={50} italic color={RED} anchor="middle" k={rise(s.t, 26, W(s, 4, 0.6))}>Nothing gets past you.</Ink>
            <Initial x={305} y={580} size={100} glyph="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" start={W(s, 4, 0.75)} t={s.t} frame={s.frame} />
          </>
        );
      },
    },
  ],
};

export default film;
