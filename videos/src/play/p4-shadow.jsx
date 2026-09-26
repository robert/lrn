// Series 4, film 1: "Into the Wild Wood". A shadow-puppet film of a passage
// he has already read, in the style of the old silhouette films: black paper
// cut-outs against glowing skies. The storyteller reads the real text; the
// film pauses three times for an inference question he answers by tapping.
// (Public-domain text. The book's title and author are never shown.)
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadFell } from "@remotion/google-fonts/IMFellEnglish";
import { rise, pop, lerp } from "../lib/anim.js";

const { fontFamily: FELL } = loadFell("normal", { weights: ["400"], subsets: ["latin"] });
const hash = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const SIL = "#0B0A0C";
const EYE = "#F2D8A0";

// ---------- Silent-film finish ----------

function Overlay({ frame, scene }) {
  // An iris that opens at the start of every scene.
  const t = frame; // frames since this scene began (the live player counts per scene)
  const iris = Math.min(1, t / 24);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.18, mixBlendMode: "overlay" }}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 61} /></filter>
        <rect width="1920" height="1080" filter="url(#g)" />
      </svg>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, transparent ${lerp(0, 72, iris)}%, #000 ${lerp(2, 76, iris)}%)` }} />
      <AbsoluteFill style={{ boxShadow: "inset 0 0 200px rgba(0,0,0,0.85)" }} />
    </AbsoluteFill>
  );
}

// The real words of the story, set like a silent-film intertitle.
function Subtitles({ words, spoken, opacity, who }) {
  const question = who === "host";
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center", opacity }}>
      <div style={{
        maxWidth: 1500, padding: "12px 36px 16px", background: "rgba(8,7,9,0.72)", borderRadius: 4,
        border: `1px solid rgba(242,216,160,${question ? 0.7 : 0.3})`,
        fontFamily: FELL, fontStyle: question ? "italic" : "normal", fontSize: 46, lineHeight: 1.25, color: "#F4ECDB", textAlign: "center",
      }}>
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.35 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// ---------- Cut-paper world ----------

function Sky({ from, to, glow = "rgba(255,230,180,0.35)", sun = null }) {
  return (
    <AbsoluteFill style={{ background: `linear-gradient(${from}, ${to})` }}>
      {sun && <div style={{ position: "absolute", left: sun[0] - 90, top: sun[1] - 90, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(#FFF1CF, rgba(255,210,140,0.2) 60%, transparent 70%)" }} />}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 85%, ${glow}, transparent 60%)` }} />
    </AbsoluteFill>
  );
}

// A branching silhouette tree, grown from a seed.
function Tree({ x, base = 1080, h = 700, seed = 1, sway = 0, lean = 0 }) {
  const lines = [];
  function branch(x1, y1, angle, len, depth, n) {
    const a = angle + sway * 0.01 * (6 - depth);
    const x2 = x1 + Math.cos(a) * len, y2 = y1 + Math.sin(a) * len;
    lines.push(<line key={lines.length} x1={x1} y1={y1} x2={x2} y2={y2} stroke={SIL} strokeWidth={Math.max(1.5, depth * depth * 1.6)} strokeLinecap="round" />);
    if (depth <= 0) return;
    const spread = 0.35 + hash(n) * 0.35;
    branch(x2, y2, a - spread, len * (0.68 + hash(n + 1) * 0.12), depth - 1, n * 2 + 1);
    branch(x2, y2, a + spread, len * (0.66 + hash(n + 2) * 0.12), depth - 1, n * 2 + 2);
    if (hash(n + 3) > 0.6) branch(x2, y2, a + (hash(n + 4) - 0.5) * 0.4, len * 0.55, depth - 2, n * 3 + 5);
  }
  branch(x, base, -Math.PI / 2 + lean, h * 0.3, 6, seed);
  return <g>{lines}</g>;
}

function Wood({ seeds, sway = 0, density = 1 }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {seeds.map((s, i) => <Tree key={i} x={s[0]} h={s[1]} seed={s[2]} sway={sway * (i % 2 ? 1 : -1)} lean={(hash(s[2]) - 0.5) * 0.12} />)}
      <path d={`M0 1080 L0 930 Q 480 ${900 - density * 20} 960 940 T 1920 925 L1920 1080 Z`} fill={SIL} />
    </svg>
  );
}

// The Mole: a round little silhouette who walks with a bob.
function Mole({ x, y, t, walking = false, scale = 1, hurry = 1, facing = 1, curl = 0 }) {
  const step = walking ? Math.sin(t / (5 / hurry)) : 0;
  return (
    <svg width="300" height="220" viewBox="-150 -170 300 220" style={{ position: "absolute", left: x - 150 * scale, top: y - 170 * scale, width: 300 * scale, height: 220 * scale, transform: `scaleX(${facing})`, overflow: "visible" }}>
      <g transform={`translate(0 ${Math.abs(step) * -6}) rotate(${curl * 30})`}>
        <ellipse cx="0" cy="-60" rx={lerp(78, 60, curl)} ry={lerp(56, 60, curl)} fill={SIL} />
        <path d="M60 -80 Q 118 -70 122 -52 Q 100 -44 58 -46 Z" fill={SIL} />
        <circle cx="-30" cy="-108" r="14" fill={SIL} />
        {/* Feet swing as he walks. */}
        <ellipse cx={-30 + step * 16} cy="-6" rx="22" ry="10" fill={SIL} />
        <ellipse cx={30 - step * 16} cy="-6" rx="22" ry="10" fill={SIL} />
        <path d="M40 -40 Q 60 -20 78 -24" stroke={SIL} strokeWidth="12" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// A face in a hole: a wedge of darkness with two gleaming eyes.
function Face({ x, y, on, t, size = 1 }) {
  if (on <= 0) return null;
  const blink = Math.floor(t / 40 + x) % 9 === 0 && t % 40 < 4 ? 0.2 : 1;
  return (
    <svg width="120" height="80" viewBox="-60 -40 120 80" style={{ position: "absolute", left: x - 60 * size, top: y - 40 * size, width: 120 * size, height: 80 * size, opacity: on }}>
      <ellipse cx="0" cy="8" rx="52" ry="30" fill="#000" />
      <path d="M-26 -2 L 0 26 L 26 -2 Q 0 -18 -26 -2 Z" fill="#141216" />
      <ellipse cx="-11" cy="2" rx="6" ry={3.5 * blink} fill={EYE} />
      <ellipse cx="11" cy="2" rx="6" ry={3.5 * blink} fill={EYE} />
    </svg>
  );
}

// Whistles: thin curls of sound drifting through the trees.
function Whistles({ t, amount }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: amount }}>
      {Array.from({ length: 10 }, (_, i) => {
        const x = hash(i) * 1920, y = 250 + hash(i + 3) * 450;
        const k = (t / 60 + hash(i + 7)) % 1;
        return <path key={i} d={`M ${x} ${y} q 20 -30 40 0 t 40 0 t 40 0`} stroke={EYE} strokeWidth="3" fill="none" opacity={Math.sin(k * Math.PI) * 0.8} transform={`translate(${k * 60} ${-k * 30})`} />;
      })}
    </svg>
  );
}

// Pattering: little footprints appearing all around, closing in.
function Patter({ t, amount, close = 0 }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: Math.floor(80 * amount) }, (_, i) => {
        const a = hash(i) * Math.PI * 2;
        const r = lerp(900, 380, close) * (0.6 + hash(i + 1) * 0.5);
        const x = 960 + Math.cos(a) * r, y = 900 + Math.sin(a) * r * 0.18;
        const on = (Math.floor(t / 4) + i) % 7 < 2;
        return on ? <ellipse key={i} cx={x} cy={y} rx="7" ry="4" fill={SIL} /> : null;
      })}
    </svg>
  );
}

// A rabbit, dashing past.
function Rabbit({ x, y, t }) {
  const leap = Math.abs(Math.sin(t / 3)) * 30;
  return (
    <svg width="260" height="200" viewBox="-130 -160 260 200" style={{ position: "absolute", left: x - 130, top: y - 160 - leap }}>
      <ellipse cx="0" cy="-50" rx="70" ry="42" fill={SIL} />
      <circle cx="62" cy="-78" r="30" fill={SIL} />
      <path d="M60 -100 Q 50 -160 40 -150 Q 44 -120 52 -98 Z M 76 -100 Q 84 -160 74 -154 Q 68 -126 70 -98 Z" fill={SIL} />
      <path d="M-60 -20 L -110 -6 M 40 -12 L 90 6" stroke={SIL} strokeWidth="14" strokeLinecap="round" />
    </svg>
  );
}

// Three answer cards, cut from pale paper, for the questions.
const CARD = { y: 290, w: 520, h: 330, xs: [110, 700, 1290] };
function Cards({ t, at, options, chosen }) {
  return options.map((o, i) => {
    const k = pop(t, at + i * 6);
    const win = chosen === i;
    return (
      <div key={i} style={{
        position: "absolute", left: CARD.xs[i], top: CARD.y, width: CARD.w, height: CARD.h,
        background: win ? "#F6E3B4" : "#EFE6D3", borderRadius: 6, padding: "30px 34px",
        boxShadow: win ? `0 0 0 6px ${EYE}, 0 20px 50px rgba(0,0,0,0.7)` : "0 20px 50px rgba(0,0,0,0.7)",
        fontFamily: FELL, fontSize: 42, lineHeight: 1.25, color: "#1A1714",
        opacity: Math.min(1, k * 2), transform: `translateY(${(1 - Math.min(1, k)) * 40}px) rotate(${(i - 1) * 1.2}deg)`,
      }}>
        <div style={{ fontSize: 30, fontStyle: "italic", color: "#7A6A55", marginBottom: 10 }}>{"abc"[i]}</div>
        {o}
      </div>
    );
  });
}
const cardSpots = (correct, slips) => CARD.xs.map((x, i) => ({
  id: `c${i}`, x, y: CARD.y, w: CARD.w, h: CARD.h, correct: i === correct, slip: i === correct ? undefined : slips[i],
}));

// The question panel: dark theatre with the question written above the cards.
function Question({ t, text, options, chosen, instant = false }) {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, #3B3226, #0B0A0C 75%)" }} />
      <div style={{ position: "absolute", left: 160, right: 160, top: 110, textAlign: "center", fontFamily: FELL, fontStyle: "italic", fontSize: 54, lineHeight: 1.2, color: "#F4ECDB", opacity: instant ? 1 : rise(t, 16, 4) }}>{text}</div>
      <Cards t={instant ? 999 : t} at={instant ? 0 : 20} options={options} chosen={chosen} />
    </AbsoluteFill>
  );
}

// ---------- The questions ----------
const Q1 = {
  text: "Why is “Then the faces began.” a paragraph all on its own?",
  options: [
    "To make it feel sudden and scary, like a gasp.",
    "Because the storyteller ran out of things to say.",
    "Because the faces in the holes were very small.",
  ],
};
const Q2 = {
  text: "The rabbit says “Get out of this, you fool, get out!” What is he telling the Mole?",
  options: [
    "That he is silly for wearing new goloshes.",
    "That something dangerous is coming, so run!",
    "That the rabbit wants the Mole’s burrow.",
  ],
};
const Q3 = {
  text: "At the end the Mole “knew it at last”. What did he know?",
  options: [
    "The quickest way home to the river bank.",
    "That the faces were only funguses on stumps.",
    "That the Wild Wood really is dangerous for a small animal alone.",
  ],
};

const WOOD1 = [[120, 760, 3], [420, 900, 7], [760, 820, 11], [1120, 950, 13], [1480, 800, 17], [1800, 900, 19]];
const WOOD2 = [[60, 980, 23], [300, 1000, 29], [560, 940, 31], [860, 1020, 37], [1160, 980, 41], [1440, 1000, 43], [1700, 960, 47], [1880, 1020, 53]];

// ---------- The film ----------
export default {
  id: "p4-shadow",
  order: 301,
  series: 4,
  title: "Into the Wild Wood",
  strap: "A shadow-theatre film of a story you've already read. It stops three times for you to answer.",
  music: "music/shadow.wav",
  musicVolume: 0.16,
  cast: {
    teller: { name: "", voice: "bm_fable", speed: 0.9 },
    host: { name: "", voice: "bf_emma", speed: 0.95 },
  },
  Overlay,
  Subtitles,
  scenes: [
    {
      id: "open",
      next: "enter",
      beats: [
        { who: "host", say: "A story you already know, told in shadows. Listen, and watch closely. There will be questions." },
      ],
      render: s => (
        <AbsoluteFill>
          <Sky from="#2A2233" to="#6B4E3D" />
          <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: FELL, fontSize: 130, color: "#F4ECDB", opacity: rise(s.t, 30, 10), letterSpacing: 2 }}>Into the Wild Wood</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: FELL, fontStyle: "italic", fontSize: 48, color: EYE, opacity: rise(s.t, 30, 40) }}>a shadow play</div>
        </AbsoluteFill>
      ),
    },
    {
      id: "enter",
      next: "dusk",
      beats: [
        { who: "teller", say: "There was nothing to alarm him at first entry. Twigs crackled under his feet, logs tripped him, funguses on stumps resembled caricatures, and startled him for the moment by their likeness to something familiar and far away; but that was all fun, and exciting." },
        { who: "teller", say: "It led him on, and he penetrated to where the light was less, and trees crouched nearer and nearer, and holes made ugly mouths at him on either side." },
      ],
      render: s => {
        const walk = rise(s.t, s.length, 0);
        return (
          <AbsoluteFill>
            <Sky from="#E9C68E" to="#B97D55" sun={[1500, 360]} />
            <Wood seeds={WOOD1} sway={Math.sin(s.t / 40) * 3} />
            <Mole x={lerp(200, 1300, walk)} y={960} t={s.t} walking />
          </AbsoluteFill>
        );
      },
    },
    {
      id: "dusk",
      next: "q1",
      beats: [
        { who: "teller", say: "Everything was very still now. The dusk advanced on him steadily, rapidly, gathering in behind and before; and the light seemed to be draining away like flood-water." },
        { who: "teller", say: "Then the faces began." },
      ],
      render: s => {
        const dark = rise(s.t, s.at(1), 0);
        return (
          <AbsoluteFill>
            <Sky from={dark > 0.5 ? "#3B2E3E" : "#C98F5E"} to={dark > 0.5 ? "#2A1F2B" : "#7E5245"} />
            <AbsoluteFill style={{ background: "#120E14", opacity: dark * 0.6 }} />
            <Wood seeds={WOOD2} sway={Math.sin(s.t / 40) * 2} density={2} />
            <Mole x={900} y={960} t={s.t} walking={s.beat === 0} />
            <Face x={330} y={900} t={s.t} on={rise(s.t, 8, s.at(1) + s.speech(1))} />
          </AbsoluteFill>
        );
      },
    },
    {
      id: "q1",
      choice: { prompt: "Tap the best answer", next: "faces", options: cardSpots(0, [undefined, "q1-slip", "q1-slip"]) },
      beats: [{ who: "host", say: "A question. Why is “Then the faces began” a paragraph all on its own? Tap the best answer." }],
      render: s => <Question t={s.t} {...Q1} />,
    },
    {
      id: "q1-slip",
      returnTo: "q1",
      beats: [{ who: "host", say: "Try reading it aloud. Four short words, standing alone after a long, slow paragraph. How does that make you feel?" }],
      render: s => <Question t={s.t} {...Q1} instant />,
    },
    {
      id: "faces",
      next: "whistle",
      beats: [
        { who: "host", say: "Yes. A short line all alone feels like a sudden gasp. Now, back to the wood.", sfxs: [{ sfx: "shadow-chime", at: 0 }] },
        { who: "teller", say: "It was over his shoulder, and indistinctly, that he first thought he saw a face; a little evil wedge-shaped face, looking out at him from a hole. When he turned and confronted it, the thing had vanished." },
        { who: "teller", say: "Then suddenly, and as if it had been so all the time, every hole, far and near, and there were hundreds of them, seemed to possess its face, coming and going rapidly, all fixing on him glances of malice and hatred: all hard-eyed and evil and sharp." },
      ],
      render: s => {
        const many = rise(s.t, 50, s.at(2) + 20);
        return (
          <AbsoluteFill>
            <Sky from="#2E2433" to="#1A141D" />
            <Wood seeds={WOOD2} sway={Math.sin(s.t / 30) * 3} density={2} />
            <Face x={1400} y={880} t={s.t} on={window2(s.t, s.at(1) + 30, s.at(1) + s.speech(1) * 0.8)} />
            {Array.from({ length: 22 }, (_, i) => (
              <Face key={i} x={80 + hash(i) * 1760} y={500 + hash(i + 40) * 420} t={s.t + i * 7} size={0.5 + hash(i + 9) * 0.7}
                on={many * ((Math.floor(s.t / 12) + i) % 5 < 3 ? 1 : 0.2)} />
            ))}
            <Mole x={900} y={960} t={s.t} walking hurry={lerp(1, 2, many)} />
          </AbsoluteFill>
        );
      },
    },
    {
      id: "whistle",
      next: "q2",
      beats: [
        { who: "teller", say: "Then the whistling began.", sfxs: [{ sfx: "shadow-whistle", at: 0.6, volume: 0.6 }] },
        { who: "teller", say: "Very faint and shrill it was, and far behind him, when first he heard it; but somehow it made him hurry forward." },
        { who: "teller", say: "Then the pattering began.", sfxs: [{ sfx: "shadow-patter", at: 0.4, volume: 0.7 }] },
        { who: "teller", say: "As he stood still to hearken, a rabbit came running hard towards him through the trees. “Get out of this, you fool, get out!” the Mole heard him mutter, as he swung round a stump and disappeared down a friendly burrow." },
      ],
      render: s => {
        const dash = rise(s.t, 50, s.at(3) + s.speech(3) * 0.25);
        return (
          <AbsoluteFill>
            <Sky from="#231B28" to="#120E14" />
            <Wood seeds={WOOD2} sway={Math.sin(s.t / 20) * 4} density={2} />
            <Whistles t={s.t} amount={rise(s.t, 20, s.at(0)) * (1 - rise(s.t, 20, s.at(3)) * 0.5)} />
            <Patter t={s.t} amount={rise(s.t, 30, s.at(2))} close={rise(s.t, 200, s.at(2))} />
            {dash > 0 && dash < 1 && <Rabbit x={lerp(1900, -100, dash)} y={950} t={s.t} />}
            <Mole x={900} y={960} t={s.t} walking={s.beat < 3} hurry={1.6} />
          </AbsoluteFill>
        );
      },
    },
    {
      id: "q2",
      choice: { prompt: "Tap the best answer", next: "terror", options: cardSpots(1, ["q2-slip", undefined, "q2-slip"]) },
      beats: [{ who: "host", say: "Another question. The rabbit says, get out of this, you fool, get out! What is he really telling the Mole?" }],
      render: s => <Question t={s.t} {...Q2} />,
    },
    {
      id: "q2-slip",
      returnTo: "q2",
      beats: [{ who: "host", say: "Look at what the rabbit does. He's running hard, and he dives down a burrow to hide. Why would he run and hide?" }],
      render: s => <Question t={s.t} {...Q2} instant />,
    },
    {
      id: "terror",
      next: "q3",
      beats: [
        { who: "host", say: "That's right. He's running from danger, and warning the Mole to run too.", sfxs: [{ sfx: "shadow-chime", at: 0 }] },
        { who: "teller", say: "The whole wood seemed running now, running hard, hunting, chasing, closing in round something or... somebody? In panic, he began to run too, aimlessly, he knew not whither.", sfxs: [{ sfx: "shadow-patter", at: 0, volume: 0.9 }] },
        { who: "teller", say: "At last he took refuge in the deep dark hollow of an old beech tree, which offered shelter, concealment... perhaps even safety, but who could tell?" },
        { who: "teller", say: "And as he lay there panting and trembling, he knew it at last, in all its fullness, that dread thing which the Rat had vainly tried to shield him from: the Terror of the Wild Wood!" },
      ],
      render: s => {
        const run = rise(s.t, s.at(2) - s.at(1), s.at(1));
        const hide = rise(s.t, 30, s.at(2));
        return (
          <AbsoluteFill>
            <Sky from="#1B1520" to="#0C0A0E" />
            <Wood seeds={WOOD2} sway={Math.sin(s.t / 12) * 6} density={3} />
            <Patter t={s.t} amount={1} close={lerp(0.4, 1, run)} />
            {/* The old beech with its hollow. */}
            <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
              <path d="M1480 1080 L1500 520 Q 1560 420 1640 520 L1660 1080 Z" fill={SIL} />
              <ellipse cx="1570" cy="880" rx="60" ry="90" fill="#2A2230" opacity={hide} />
            </svg>
            <Mole x={lerp(300, 1570, Math.max(run, hide))} y={lerp(960, 920, hide)} t={s.t} walking={hide < 1} hurry={2.2} scale={lerp(1, 0.55, hide)} curl={s.beat === 3 ? 1 : 0} />
            {Array.from({ length: 14 }, (_, i) => (
              <Face key={i} x={80 + hash(i + 3) * 1300} y={520 + hash(i + 50) * 380} t={s.t + i * 5} size={0.5 + hash(i) * 0.6} on={rise(s.t, 30, s.at(3)) * ((Math.floor(s.t / 10) + i) % 4 < 3 ? 1 : 0.3)} />
            ))}
          </AbsoluteFill>
        );
      },
    },
    {
      id: "q3",
      choice: { prompt: "Tap the best answer", next: "end", options: cardSpots(2, ["q3-slip", "q3-slip", undefined]) },
      beats: [{ who: "host", say: "Last question. At the end, the Mole knew it at last. What did he know?" }],
      render: s => <Question t={s.t} {...Q3} />,
    },
    {
      id: "q3-slip",
      returnTo: "q3",
      beats: [{ who: "host", say: "Think back. What had the Rat tried to warn him about, before he ever set off? The Mole didn't believe it. Until now." }],
      render: s => <Question t={s.t} {...Q3} instant />,
    },
    {
      id: "end",
      beats: [
        { who: "host", say: "Exactly. The Wild Wood really is dangerous for a small animal on his own, just as the Rat had warned.", sfxs: [{ sfx: "shadow-chime", at: 0 }] },
        { who: "host", say: "You read between the lines, three times out of three. A true Mega Reader. And what happens next? You already know. Or you soon will." },
      ],
      render: s => (
        <AbsoluteFill>
          <Sky from="#34283A" to="#6E4A36" glow="rgba(255,200,120,0.5)" />
          <Wood seeds={WOOD1} />
          {/* Far off, a small lantern: help is coming. */}
          <div style={{ position: "absolute", left: 1600, top: 860, width: 30, height: 30, borderRadius: "50%", background: EYE, boxShadow: `0 0 40px 20px rgba(242,216,160,0.6)`, opacity: rise(s.t, 40, s.at(1)) }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: FELL, fontSize: 110, color: "#F4ECDB", opacity: rise(s.t, 30, s.at(1) + 30) }}>The End</div>
        </AbsoluteFill>
      ),
    },
  ],
};

// On then off between two frames (a local helper).
function window2(t, a, b) {
  return Math.min(rise(t, 10, a), 1 - rise(t, 10, b));
}
