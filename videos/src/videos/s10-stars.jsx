// Series 10, film 1: "Goodnight, Twelve Things". A bedtime film: the twelve
// things that can change, each shown in the night sky, many of them real
// astronomy (the moon's phases, the Plough turning round the Pole Star and
// its pointer stars, the moon passing in front of a star). Slow and calm.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { rise, lerp } from "../lib/anim.js";

const { fontFamily: SERIF } = loadFraunces("italic", { weights: ["400"], subsets: ["latin"] });
const hash = n => { const x = Math.sin(n * 71.3 + 3.1) * 43758.5453; return x - Math.floor(x); };
const STAR = "#FFF6DC";
const LINE = "rgba(190,210,255,0.55)";
const GOLD = "#F2D58C";

// ---------- The sky ----------

function Backdrop({ frame }) {
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#070B1F, #131A3D 60%, #1E2350)" }}>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 260 }, (_, i) => {
          const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame / (30 + hash(i) * 50) + i));
          return <circle key={i} cx={hash(i) * 1920} cy={hash(i + 500) * 1080} r={0.6 + hash(i + 900) * 1.6} fill={STAR} opacity={0.25 + 0.55 * tw * hash(i + 3)} />;
        })}
      </svg>
      {/* A soft milky band. */}
      <AbsoluteFill style={{ background: "linear-gradient(115deg, transparent 30%, rgba(140,150,220,0.08) 45%, transparent 60%)" }} />
      {/* Sleeping hills. */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <path d="M0 1080 L0 900 Q 300 840 620 900 T 1250 880 T 1920 890 L1920 1080 Z" fill="#05071A" />
      </svg>
    </AbsoluteFill>
  );
}

function Subtitles({ words, spoken, opacity }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ maxWidth: 1400, fontFamily: SERIF, fontStyle: "italic", fontSize: 46, lineHeight: 1.3, color: "#E9ECFF", textAlign: "center", textShadow: "0 2px 12px #000" }}>
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.35 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// A constellation: stars joined by faint lines, drawing on over time.
function Constellation({ pts, lines, t, at = 0, dx = 0, dy = 0, rot = 0, cx = 0, cy = 0, scale = 1, flipX = false, opacity = 1, dashed = false, off = [0, 0] }) {
  const k = rise(t, 50, at);
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity }}>
      <g transform={`translate(${cx + dx} ${cy + dy}) rotate(${rot}) translate(${off[0]} ${off[1]}) scale(${flipX ? -scale : scale} ${scale})`}>
        {lines.map(([a, b], i) => (
          <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke={LINE} strokeWidth={2.5 / scale}
            strokeDasharray={dashed ? `${6 / scale} ${10 / scale}` : undefined}
            pathLength={dashed ? undefined : 1} strokeDashoffset={dashed ? undefined : 1 - Math.min(1, k * 1.2)} {...(dashed ? {} : { strokeDasharray: 1 })} />
        ))}
        {pts.map(([x, y], i) => (
          <g key={i} opacity={Math.min(1, k * 3)}>
            <circle cx={x} cy={y} r={14 / scale} fill={STAR} opacity={0.18} />
            <circle cx={x} cy={y} r={5 / scale} fill={STAR} />
          </g>
        ))}
      </g>
    </svg>
  );
}

// The number and name of the thing, like a label in a star atlas.
function Atlas({ t, n, name }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 100, textAlign: "center", opacity: rise(t, 40, 10) }}>
      <div style={{ fontFamily: SERIF, fontSize: 36, color: GOLD, letterSpacing: 4 }}>{n}</div>
      <div style={{ fontFamily: SERIF, fontSize: 84, color: "#F4F1FF", marginTop: -6 }}>{name}</div>
    </div>
  );
}

// The moon, with a phase from 0 (new) to 1 (full), drawn as light and shadow.
function Moon({ x, y, r = 110, phase = 1, halo = 0 }) {
  const k = 1 - 2 * Math.min(1, Math.max(0, phase)); // terminator curve
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {halo > 0 && <circle cx={x} cy={y} r={r * 2.3} fill="none" stroke="rgba(230,235,255,0.35)" strokeWidth={r * 0.35} opacity={halo} />}
      <circle cx={x} cy={y} r={r * 1.5} fill="rgba(240,235,210,0.08)" />
      <circle cx={x} cy={y} r={r} fill="#2A2E4A" />
      <path d={`M ${x} ${y - r} A ${r} ${r} 0 0 1 ${x} ${y + r} A ${Math.abs(k) * r} ${r} 0 0 ${k > 0 ? 0 : 1} ${x} ${y - r} Z`} fill="#F4EED8" />
    </svg>
  );
}

// ---------- The twelve, as skies ----------
const TRI = { pts: [[0, -120], [110, 80], [-110, 80]], lines: [[0, 1], [1, 2], [2, 0]] };
const SQUARE = { pts: [[-100, -100], [100, -100], [100, 100], [-100, 100]], lines: [[0, 1], [1, 2], [2, 3], [3, 0]] };
const PLOUGH = { pts: [[-260, -40], [-150, -60], [-50, -30], [40, 0], [60, 110], [210, 120], [220, 10]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 3]] };
const FLAG = { pts: [[-60, 120], [-60, -120], [90, -70], [-60, -20]], lines: [[0, 1], [1, 2], [2, 3]] };

const thing = (n, name, say, draw) => ({
  beats: [{ who: "night", say }],
  render: s => <AbsoluteFill><Atlas t={s.t} n={n} name={name} />{draw(s)}</AbsoluteFill>,
});

export default {
  id: "s10-stars",
  order: 901,
  series: 10,
  title: "Goodnight, Twelve Things",
  frame: "none",
  push: 0.012,
  cast: { night: { name: "", voice: "bf_emma", speed: 0.82 } },
  music: { src: "music/lullaby.wav", volume: 0.3, duck: 0.55 },
  Backdrop,
  Subtitles,
  scenes: [
    {
      beats: [
        { who: "night", say: "It's nearly time for sleep. The sky is full of stars. And tonight, the stars will show us the twelve things that can change." },
        { who: "night", say: "Just watch, and listen. You don't have to do anything at all." },
      ],
      render: s => (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: SERIF, fontSize: 110, color: "#F4F1FF", opacity: rise(s.t, 60, 20) }}>Goodnight,</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", fontFamily: SERIF, fontSize: 110, color: GOLD, opacity: rise(s.t, 60, 60) }}>Twelve Things</div>
        </AbsoluteFill>
      ),
    },
    thing("one", "Shape", "One. Shape. Three stars make a triangle. Add one more, and it becomes a square. The shape has changed.", s => {
      const m = rise(s.t, 60, s.speech(0) * 0.5);
      return <>
        <Constellation {...TRI} t={s.t} cx={960} cy={560} scale={1.7} opacity={1 - m} />
        <Constellation {...SQUARE} t={s.t} at={s.speech(0) * 0.5} cx={960} cy={560} scale={1.7} opacity={m} />
      </>;
    }),
    thing("two", "How many", "Two. How many. One star on its own... then two... then three. The number has changed.", s => (
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2].map(i => <g key={i} opacity={rise(s.t, 30, 20 + i * s.speech(0) * 0.28)}><circle cx={760 + i * 200} cy={560} r={34} fill={STAR} opacity={0.2} /><circle cx={760 + i * 200} cy={560} r={11} fill={STAR} /></g>)}
      </svg>
    )),
    thing("three", "Size", "Three. Size. The moon rises big and golden near the hills, then looks small and silver high in the sky.", s => {
      const up = rise(s.t, s.speech(0) * 0.9, 20);
      return <Moon x={lerp(560, 1300, up)} y={lerp(820, 380, up)} r={lerp(170, 70, up)} phase={1} />;
    }),
    thing("four", "Shading", "Four. Shading. Night after night, the moon fills with light. A thin sliver, then half, then full and bright.", s => (
      <>{[0.15, 0.5, 1].map((p, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, opacity: rise(s.t, 30, 20 + i * s.speech(0) * 0.3) }}>
          <Moon x={620 + i * 340} y={560} r={100} phase={p} />
        </div>
      ))}</>
    )),
    thing("five", "Rotation", "Five. Rotation. All night long, the Plough turns slowly around the Pole Star, like the hand of a giant clock.", s => {
      const turn = rise(s.t, s.speech(0) + 40, 10) * 70;
      return <>
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}><circle cx={960} cy={520} r={9} fill={GOLD} /><circle cx={960} cy={520} r={26} fill={GOLD} opacity={0.25} /></svg>
        <Constellation {...PLOUGH} t={s.t} cx={960} cy={500} rot={turn} off={[-40, 260]} scale={1.3} />
      </>;
    }),
    thing("six", "Flipped", "Six. Flipped. On the still lake below, the stars shine back upside down and the wrong way round. A mirror image.", s => (
      <>
        <Constellation {...FLAG} t={s.t} cx={960} cy={390} scale={1.5} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 620, bottom: 0, background: "linear-gradient(#0A1030, #10183C)" }} />
        <div style={{ position: "absolute", inset: 0, transform: "scaleY(-1)", transformOrigin: "50% 57.4%", opacity: 0.75 * rise(s.t, 40, s.speech(0) * 0.35), filter: "blur(0.6px)" }}>
          <Constellation {...FLAG} t={s.t} cx={960} cy={390} scale={1.5} />
        </div>
      </>
    )),
    thing("seven", "Position on screen", "Seven. Position. A bright planet wanders slowly across the sky, from one side to the other.", s => {
      const p = rise(s.t, s.speech(0) + 30, 10);
      return <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <path d="M 400 700 Q 960 300 1520 700" stroke="rgba(242,213,140,0.25)" strokeWidth="2" strokeDasharray="4 12" fill="none" />
        <circle cx={lerp(400, 1520, p)} cy={700 - Math.sin(p * Math.PI) * 400 * 0.75 - 0} r={16} fill={GOLD} /><circle cx={lerp(400, 1520, p)} cy={700 - Math.sin(p * Math.PI) * 300} r={40} fill={GOLD} opacity={0.2} />
      </svg>;
    }),
    thing("eight", "In front or behind", "Eight. In front or behind. The moon glides across the sky, and passes in front of a star. The star hides behind it, then peeps out again.", s => {
      const p = rise(s.t, s.speech(0) + 30, 10);
      return <>
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}><circle cx={960} cy={540} r={12} fill={STAR} /><circle cx={960} cy={540} r={34} fill={STAR} opacity={0.25} /></svg>
        <Moon x={lerp(600, 1320, p)} y={540} r={120} phase={1} />
      </>;
    }),
    thing("nine", "Line style", "Nine. Line style. A shooting star leaves a bright, solid trail. A far-off comet leaves a trail of little dots.", s => {
      const a = rise(s.t, 25, 30), b = rise(s.t, 60, s.speech(0) * 0.5);
      return <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <line x1={500} y1={300} x2={lerp(500, 1000, a)} y2={lerp(300, 520, a)} stroke={STAR} strokeWidth="5" strokeLinecap="round" opacity={1 - rise(s.t, 30, 70)} />
        <line x1={900} y1={700} x2={lerp(900, 1450, b)} y2={lerp(700, 420, b)} stroke={GOLD} strokeWidth="7" strokeDasharray="1 18" strokeLinecap="round" />
      </svg>;
    }),
    thing("ten", "Touching", "Ten. Touching. Two little star clusters drift closer and closer... until they just touch.", s => {
      const p = rise(s.t, s.speech(0) * 0.9, 10);
      return <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {[-1, 1].map(side => <g key={side} transform={`translate(${960 + side * lerp(330, 100, p)} 540)`}>
          <circle r={100} fill="rgba(170,180,255,0.12)" stroke="rgba(200,210,255,0.4)" strokeWidth="2" />
          {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={(hash(i + side * 7) - 0.5) * 140} cy={(hash(i + 30 + side) - 0.5) * 140} r={3 + hash(i) * 3} fill={STAR} />)}
        </g>)}
      </svg>;
    }),
    thing("eleven", "Pointing at", "Eleven. Pointing at. The two end stars of the Plough are called the pointers. Follow them, and they point right at the North Star.", s => {
      const g = rise(s.t, 50, s.speech(0) * 0.55);
      const sc = 1.5, cx = 820, cy = 760;
      const [ax, ay] = [cx + PLOUGH.pts[5][0] * sc, cy + PLOUGH.pts[5][1] * sc];
      const [bx, by] = [cx + PLOUGH.pts[6][0] * sc, cy + PLOUGH.pts[6][1] * sc];
      const [nx, ny] = [bx + (bx - ax) * 2.6, by + (by - ay) * 2.6];
      return <>
        <Constellation {...PLOUGH} t={s.t} cx={cx} cy={cy} scale={sc} />
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
          <line x1={ax} y1={ay} x2={lerp(ax, nx, g)} y2={lerp(ay, ny, g)} stroke={GOLD} strokeWidth="3" strokeDasharray="10 10" />
          <circle cx={nx} cy={ny} r={12} fill={GOLD} opacity={g} /><circle cx={nx} cy={ny} r={36} fill={GOLD} opacity={0.25 * g} />
        </svg>
      </>;
    }),
    thing("twelve", "Inside or outside", "Twelve. Inside or outside. On a frosty night, a ring of light forms round the moon. One star sits inside the ring. Another sits outside.", s => (
      <>
        <Moon x={960} y={540} r={90} phase={1} halo={rise(s.t, 50, 20)} />
        <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: rise(s.t, 40, s.speech(0) * 0.5) }}>
          <circle cx={1090} cy={470} r={8} fill={STAR} /><circle cx={1300} cy={330} r={8} fill={STAR} />
        </svg>
      </>
    )),
    {
      beats: [
        { who: "night", say: "Shape. How many. Size. Shading. Rotation. Flipped." },
        { who: "night", say: "Position. In front or behind. Line style. Touching. Pointing at. Inside or outside." },
        { who: "night", say: "Twelve things, written in the stars. Nothing gets past you. Not even in your dreams. Goodnight." },
      ],
      tail: 3,
      render: s => (
        <AbsoluteFill>
          <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
              const on = rise(s.t, 20, (i < 6 ? s.at(0) + (i / 6) * s.speech(0) : s.at(1) + ((i - 6) / 6) * s.speech(1)));
              return <g key={i} opacity={on}><circle cx={960 + Math.cos(a) * 300} cy={500 + Math.sin(a) * 300} r={30} fill={GOLD} opacity={0.2} /><circle cx={960 + Math.cos(a) * 300} cy={500 + Math.sin(a) * 300} r={9} fill={GOLD} /></g>;
            })}
          </svg>
          <Moon x={960} y={500} r={80} phase={lerp(1, 0.2, rise(s.t, 120, s.at(2)))} />
        </AbsoluteFill>
      ),
    },
  ],
};
