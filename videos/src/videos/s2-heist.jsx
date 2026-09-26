// Series 2, film 8: "The Evidence Heist". A night-time museum caper.
// The story is an old manuscript in a glass case. The crew turn the
// question into clue words, sweep a torch over each paragraph, and lift
// the evidence. The safe dial only opens for an answer that names it.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadFell } from "@remotion/google-fonts/IMFellEnglish";
import { rise, pop, window, lerp } from "../lib/anim.js";

const { fontFamily: BEBAS } = loadBebas();
const { fontFamily: FELL } = loadFell();

const NIGHT = "#0B1420";
const CYAN = "#6FE3FF";
const RED = "#FF3B4E";
const PARCH = "#EFE2BF";
const INK = "#2B2016";
const GOLD = "#E6B94F";

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- The museum ----------

function Hall({ t }) {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 30%, #1B2A3E, ${NIGHT} 70%)` }}>
      {/* Tall arched windows with moonlight falling across the floor. */}
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {[260, 960, 1660].map((x, i) => (
          <g key={i}>
            <path d={`M ${x - 110} 520 V 200 A 110 110 0 0 1 ${x + 110} 200 V 520 Z`} fill="#1E3350" stroke="#2E4868" strokeWidth={6} />
            <line x1={x} y1={90} x2={x} y2={520} stroke="#2E4868" strokeWidth={5} />
            <line x1={x - 110} y1={330} x2={x + 110} y2={330} stroke="#2E4868" strokeWidth={5} />
            <path d={`M ${x - 110} 520 L ${x - 260} 1080 L ${x + 40} 1080 L ${x + 110} 520 Z`} fill="rgba(160,200,255,0.05)" />
          </g>
        ))}
        <rect x={0} y={760} width={1920} height={320} fill="#0A1119" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={i * 180 - 40} y1={760} x2={i * 260 - 600} y2={1080} stroke="#16212E" strokeWidth={2} />)}
      </svg>
    </AbsoluteFill>
  );
}

// Grain, a faint blueprint grid and a dark vignette.
function Overlay({ frame }) {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.1, mixBlendMode: "overlay" }}>
        <filter id="hgrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" seed={frame % 61} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="1920" height="1080" filter="url(#hgrain)" />
      </svg>
    </AbsoluteFill>
  );
}

// Subtitles in a sleek earpiece-style HUD.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{
      position: "absolute", left: 220, right: 220, bottom: 34, opacity, textAlign: "center",
      background: "rgba(8,16,26,0.82)", border: `1.5px solid ${CYAN}55`, borderRadius: 6, padding: "12px 26px",
      fontFamily: "Georgia, serif", fontSize: 38, lineHeight: 1.25,
    }}>
      {actor && <span style={{ fontFamily: BEBAS, fontSize: 36, letterSpacing: 3, color: actor.colour, marginRight: 16 }}>{actor.name}</span>}
      {words.map((w, i) => <span key={i} style={{ color: i < spoken ? "#F2F6FA" : "#56677A" }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
    </div>
  );
}

// ---------- The manuscript ----------
// A page of numbered paragraphs, in a glass case. `torch` sweeps a beam
// across paragraph `torch.p` (0 based); `found` highlights exact phrases.
const PAGE = { x: 410, y: 130, w: 1100 };

function Manuscript({ t, paras, torch, found = [], lasers = 0, appear = 1, dimOthers = -1, y = PAGE.y }) {
  return (
    <div style={{ position: "absolute", left: PAGE.x, top: y, width: PAGE.w, opacity: appear }}>
      {/* The glass case glinting. */}
      <div style={{ position: "absolute", inset: -26, border: `2px solid ${CYAN}44`, borderRadius: 8, background: "rgba(120,200,255,0.05)" }} />
      <div style={{
        position: "relative", padding: "30px 44px 26px 70px", borderRadius: 4,
        background: `radial-gradient(ellipse at 40% 30%, ${PARCH}, #D9C79A)`,
        boxShadow: "0 30px 80px rgba(0,0,0,0.8), inset 0 0 60px rgba(120,80,30,0.35)",
      }}>
        {paras.map((p, i) => {
          const lit = torch && torch.p === i ? torch.k : 0;
          const dim = dimOthers >= 0 && dimOthers !== i;
          return (
            <div key={i} style={{ position: "relative", marginBottom: 18, opacity: dim ? 0.35 : 1 }}>
              <div style={{ position: "absolute", left: -48, top: 4, fontFamily: BEBAS, fontSize: 36, color: "#8C6A3A" }}>{i + 1}</div>
              <div style={{ fontFamily: FELL, fontSize: 38, lineHeight: 1.4, color: INK }}>
                {renderFound(p, found.filter(f => f.p === i), t)}
              </div>
              {lit > 0 && (
                <div style={{
                  position: "absolute", top: -6, bottom: -6, left: `${lit * 100 - 22}%`, width: "30%",
                  background: "radial-gradient(ellipse at center, rgba(255,245,200,0.55), transparent 70%)", mixBlendMode: "screen",
                }} />
              )}
            </div>
          );
        })}
      </div>
      {lasers > 0 && <Lasers t={t} k={lasers} />}
    </div>
  );
}

// Wrap each found phrase in a sweeping gold highlight.
function renderFound(text, found, t) {
  if (!found.length) return text;
  const out = [];
  let rest = text;
  let key = 0;
  for (const f of found) {
    const i = rest.indexOf(f.text);
    if (i < 0) continue;
    out.push(rest.slice(0, i));
    const k = rise(t, 18, f.at);
    out.push(
      <span key={key++} style={{
        backgroundImage: `linear-gradient(90deg, ${GOLD}AA ${k * 100}%, transparent ${k * 100}%)`,
        borderRadius: 4, padding: "0 2px", boxShadow: k > 0.99 ? `0 0 18px ${GOLD}` : "none",
      }}>{f.text}</span>
    );
    rest = rest.slice(i + f.text.length);
  }
  out.push(rest);
  return out;
}

// Red laser beams crisscrossing the case.
function Lasers({ t, k }) {
  return (
    <svg width={PAGE.w + 200} height={900} style={{ position: "absolute", left: -100, top: -60, opacity: k }}>
      {Array.from({ length: 6 }, (_, i) => {
        const y1 = 60 + i * 140 + Math.sin(t / 20 + i) * 20;
        return <line key={i} x1={0} y1={y1} x2={PAGE.w + 200} y2={y1 + (i % 2 ? 120 : -120)} stroke={RED} strokeWidth={3} opacity={0.75}
          style={{ filter: `drop-shadow(0 0 6px ${RED})` }} />;
      })}
    </svg>
  );
}

// ---------- The plan and the gadgets ----------

// A blueprint card listing the plan or the clue words.
function Blueprint({ title, lines, x, y, w, appear = 1 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, opacity: appear, transform: `translateY(${(1 - appear) * 24}px)`,
      background: "#133A63", border: "2px solid #7FB2E5", borderRadius: 6, padding: "28px 40px",
      backgroundImage: "linear-gradient(#7FB2E522 1px, transparent 1px), linear-gradient(90deg, #7FB2E522 1px, transparent 1px)",
      backgroundSize: "28px 28px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
    }}>
      <div style={{ fontFamily: BEBAS, fontSize: 64, letterSpacing: 5, color: "#CFE6FF", marginBottom: 12 }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: BEBAS, fontSize: 54, letterSpacing: 2, color: "#E9F4FF", lineHeight: 1.35, opacity: l.show ?? 1 }}>{l.text}</div>
      ))}
    </div>
  );
}

// A question card slid across the table.
function QuestionCard({ text, x = 560, y = 180, w = 800, appear = 1 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, opacity: appear, transform: `rotate(-1deg) translateY(${(1 - appear) * 30}px)`,
      background: "#F7F3EA", borderRadius: 6, padding: "20px 30px", boxShadow: "0 20px 50px rgba(0,0,0,0.7)",
      fontFamily: "Georgia, serif", fontSize: 50, lineHeight: 1.3, color: INK, borderLeft: `10px solid ${RED}`,
    }}>{text}</div>
  );
}

// The safe: four answer tumblers. The dial turns to each; wrong ones buzz
// red, the right one clicks green and the door swings open.
function Safe({ t, options, turnTo, reveal = {}, correct, openAt }) {
  // turnTo: [{ at, i }] the dial swings to option i at frame `at`.
  let target = 0, prev = 0, since = 999;
  turnTo.forEach(s => { if (t >= s.at) { prev = target; target = s.i; since = t - s.at; } });
  const k = Math.min(1, since / 20);
  const angle = lerp(prev, target, k) * 90 - 45;
  const open = openAt !== undefined ? rise(t, 40, openAt) : 0;
  return (
    <div style={{ position: "absolute", left: 120, top: 150, width: 1680 }}>
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        <div style={{ position: "relative", width: 340, height: 420, flex: "none" }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #3A4552, #1C232C)", borderRadius: 16, border: "4px solid #56626F", boxShadow: "0 30px 60px rgba(0,0,0,0.7)" }} />
          <div style={{ position: "absolute", inset: 20, background: "#10161D", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: GOLD, fontFamily: BEBAS, fontSize: 44, letterSpacing: 4 }}>
            {open > 0.5 ? "THE EVIDENCE" : ""}
          </div>
          <div style={{
            position: "absolute", inset: 0, background: "linear-gradient(135deg, #4A5663, #262E38)", borderRadius: 16, border: "4px solid #6A7684",
            transformOrigin: "0% 50%", transform: `perspective(1200px) rotateY(${-open * 100}deg)`,
          }}>
            <svg width="340" height="420" viewBox="-170 -210 340 420">
              <circle r="110" fill="#1E2630" stroke="#8A96A4" strokeWidth="6" />
              {Array.from({ length: 40 }, (_, i) => <line key={i} x1="0" y1="-100" x2="0" y2={i % 5 ? -90 : -82} stroke="#B8C4D0" strokeWidth="2" transform={`rotate(${i * 9})`} />)}
              <g transform={`rotate(${angle})`}>
                <circle r="62" fill="#3A4552" stroke="#C9D3DC" strokeWidth="4" />
                <path d="M0 -60 L10 -40 L-10 -40 Z" fill={GOLD} />
              </g>
              <rect x="120" y="-20" width="30" height="40" rx="6" fill="#8A96A4" />
            </svg>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1 }}>
          {options.map((o, i) => {
            const r = reveal[i];
            const state = r !== undefined && t >= r ? (i === correct ? "yes" : "no") : null;
            const pointed = target === i && since < 9999;
            return (
              <div key={i} style={{
                display: "flex", gap: 20, alignItems: "center", padding: "14px 22px", borderRadius: 8,
                background: state === "yes" ? "#153D2A" : state === "no" ? "#3A1418" : "#141D27",
                border: `2px solid ${state === "yes" ? "#5BE39A" : state === "no" ? RED : pointed ? GOLD : "#34424F"}`,
                boxShadow: state === "yes" ? "0 0 30px #5BE39A55" : "none",
              }}>
                <span style={{ fontFamily: BEBAS, fontSize: 44, color: GOLD, width: 34 }}>{"ABCD"[i]}</span>
                <span style={{ fontFamily: "Georgia, serif", fontSize: 32, color: state === "no" ? "#9A7A80" : "#EEF3F8", textDecoration: state === "no" ? "line-through" : "none", lineHeight: 1.25 }}>{o}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// The crew's silhouettes at the edge of frame, lit by their torches.
function Crew({ t }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {[{ x: 150, c: "#1A2432" }, { x: 1780, c: "#1A2432" }].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${820 + Math.sin(t / 25 + i) * 3})`}>
          <circle cx={0} cy={-230} r={48} fill={p.c} />
          <path d="M-80 0 C -80 -140, 80 -140, 80 0 Z" fill={p.c} />
          <rect x={-60} y={-250} width={120} height={16} rx={6} fill="#0A0F16" />
        </g>
      ))}
    </svg>
  );
}

// ---------- The passages (public domain) ----------
const P1 = [
  "There was the noise of a bolt shot back, and the door opened a few inches, enough to show a long snout and a pair of sleepy blinking eyes.",
  "The Badger, who wore a long dressing-gown, and whose slippers were indeed very down at heel, carried a flat candlestick in his paw and had probably been on his way to bed when their summons sounded.",
  "He looked kindly down on them and patted both their heads. “This is not the sort of night for small animals to be out,” he said.",
];
const P2 = [
  "In accordance with the kindly Badger’s injunctions, the two tired animals came down to breakfast very late next morning, and found two young hedgehogs sitting on a bench at the table, eating oatmeal porridge out of wooden bowls.",
  "“Me and little Billy here, we was trying to find our way to school, and of course we lost ourselves, sir, and Billy he got frightened and took and cried.”",
];

const sweep = (at, n) => ({ sfx: "heist-torch", at, volume: 0.7 });

// ---------- The film ----------
export default {
  id: "s2-heist",
  order: 108,
  series: 2,
  title: "The Evidence Heist",
  frame: "none",
  push: 0.015,
  cast: {
    fox: { name: "FOX", voice: "bm_lewis", speed: 0.92, colour: GOLD },
    wren: { name: "WREN", voice: "bf_alice", speed: 1.02, colour: CYAN },
  },
  music: { src: "music/heist.wav", volume: 0.3, duck: 0.4 },
  Overlay,
  Subtitles,
  scenes: [
    // Cold open: the museum at midnight.
    {
      beats: [
        { who: "fox", say: "Midnight. The Grand Museum of Stories. And somewhere inside that old manuscript is the one thing we've come for." },
        { who: "wren", say: "Gold? Diamonds?" },
        { who: "fox", say: "Better. Evidence.", sfxs: [{ sfx: "heist-vault", at: 1.2, volume: 0.6 }] },
      ],
      render: s => (
        <AbsoluteFill>
          <Hall t={s.t} />
          <Crew t={s.t} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", opacity: rise(s.t, 30, s.at(2)) }}>
            <div style={{ fontFamily: BEBAS, fontSize: 40, letterSpacing: 16, color: CYAN }}>A MEGA READER CAPER</div>
            <div style={{ fontFamily: BEBAS, fontSize: 190, letterSpacing: 10, color: "#F4F0E6", lineHeight: 1, textShadow: `0 0 40px ${GOLD}66` }}>THE EVIDENCE HEIST</div>
          </div>
        </AbsoluteFill>
      ),
    },

    // The job: a question with no quote.
    {
      beats: [
        { who: "fox", say: "Here's the job. A question with no quote in it. It doesn't tell us where to look." },
        { who: "wren", say: "How do we know the Badger was about to go to bed? So where's the answer?" },
        { who: "fox", say: "Hidden somewhere in the story. We have to steal the clue ourselves." },
      ],
      render: s => (
        <AbsoluteFill>
          <Hall t={s.t} />
          <QuestionCard text="How do we know the Badger was just about to go to bed when they knocked?" appear={rise(s.t, 20, s.at(1))} x={410} y={330} w={1100} />
        </AbsoluteFill>
      ),
    },

    // The plan of attack.
    {
      beats: [
        { who: "fox", say: "The plan. Step one. Turn the question into clue words. What would going to bed look like?" },
        { who: "wren", say: "Pyjamas! Slippers! A candle, or yawning, or a bedroom!" },
        { who: "fox", say: "Step two. Sweep the story, paragraph by paragraph, hunting for those words." },
        { who: "fox", say: "Step three. When you find the evidence, pick the answer that names it. Not the answer that just sounds likely." },
      ],
      render: s => (
        <AbsoluteFill>
          <Hall t={s.t} />
          <Blueprint x={300} y={220} w={1320} title="PLAN OF ATTACK" appear={rise(s.t, 20, 4)} lines={[
            { text: "1.  TURN THE QUESTION INTO CLUE WORDS", show: rise(s.t, 14, s.speech(0) * 0.2) },
            { text: "      → slippers, candle, pyjamas, yawn, bedroom", show: rise(s.t, 14, s.at(1) + s.speech(1) * 0.3) },
            { text: "2.  SWEEP THE STORY, PARAGRAPH BY PARAGRAPH", show: rise(s.t, 14, s.at(2) + s.speech(2) * 0.3) },
            { text: "3.  PICK THE ANSWER THAT NAMES THE CLUE", show: rise(s.t, 14, s.at(3) + s.speech(3) * 0.3) },
          ]} />
        </AbsoluteFill>
      ),
    },

    // Heist one: sweep the paragraphs.
    {
      beats: [
        { who: "wren", say: "Lasers off. Torch on.", sfxs: [{ sfx: "heist-laser", at: 0.2, volume: 0.6 }, { sfx: "heist-torch", at: 1.2, volume: 0.8 }] },
        { who: "fox", say: "Paragraph one. A long snout and sleepy blinking eyes. Sleepy, that's a small clue. Keep going." },
        { who: "fox", say: "Paragraph two. A long dressing-gown. Slippers. A flat candlestick in his paw." },
        { who: "wren", say: "And there it is in plain words. He had probably been on his way to bed! That's our evidence.", sfxs: [{ sfx: "heist-click", at: 2.2 }] },
      ],
      render: s => {
        const torch = s.t < s.at(1) ? null
          : s.t < s.at(2) ? { p: 0, k: Math.min(1, (s.t - s.at(1)) / s.speech(1)) }
          : s.t < s.at(3) ? { p: 1, k: Math.min(1, (s.t - s.at(2)) / s.speech(2)) }
          : { p: 1, k: 0.9 };
        return (
          <AbsoluteFill>
            <Hall t={s.t} />
            <Manuscript t={s.t} paras={P1} lasers={1 - rise(s.t, 12, 12)} torch={torch} found={[
              { p: 0, text: "sleepy blinking eyes", at: s.at(1) + s.speech(1) * 0.55 },
              { p: 1, text: "long dressing-gown", at: s.at(2) + s.speech(2) * 0.2 },
              { p: 1, text: "slippers", at: s.at(2) + s.speech(2) * 0.4 },
              { p: 1, text: "flat candlestick in his paw", at: s.at(2) + s.speech(2) * 0.7 },
              { p: 1, text: "had probably been on his way to bed", at: s.at(3) + s.speech(3) * 0.3 },
            ]} />
          </AbsoluteFill>
        );
      },
    },

    // Crack the safe: the trap answer.
    {
      beats: [
        { who: "fox", say: "Now, the safe. Four answers. Only one opens the door." },
        { who: "wren", say: "A! He yawns and rubs his eyes. That sounds just right for bedtime!", sfxs: [{ sfx: "heist-alarm", at: 3.6, volume: 0.5 }] },
        { who: "fox", say: "Alarm! Did anybody yawn in our paragraphs? No. It sounds likely, but it isn't in the story. That's the trap." },
        { who: "fox", say: "C. He's in a dressing-gown and slippers, carrying a candle. That names our evidence.", sfxs: [{ sfx: "heist-click", at: 3.2 }, { sfx: "heist-click", at: 3.4 }, { sfx: "heist-vault", at: 3.8, volume: 0.8 }] },
      ],
      render: s => (
        <AbsoluteFill>
          <Hall t={s.t} />
          <Safe t={s.t} correct={2}
            options={[
              "He yawns and rubs his eyes, so he must be tired.",
              "He says it's far too late for visitors tonight.",
              "He's in a dressing-gown and slippers, carrying a candle.",
              "His bed is still warm when the door opens.",
            ]}
            turnTo={[{ at: s.at(1) + 10, i: 0 }, { at: s.at(3) + s.speech(3) * 0.1, i: 2 }]}
            reveal={{ 0: s.at(1) + s.speech(1) * 0.85, 1: s.at(2) + s.speech(2) * 0.9, 3: s.at(2) + s.speech(2) * 0.95, 2: s.at(3) + s.speech(3) * 0.8 }}
            openAt={s.at(3) + s.speech(3) * 0.85} />
          <div style={{ position: "absolute", inset: 0, background: RED, opacity: 0.18 * window(s.t, s.at(1) + s.speech(1) * 0.85, s.at(2) + 30, 6) * (Math.floor(s.t / 8) % 2) }} />
        </AbsoluteFill>
      ),
    },

    // Your turn.
    {
      beats: [
        { who: "wren", say: "Your turn, partner. How do we know the hedgehogs didn't mean to end up at Badger's house? Find the evidence. Pause if you need time.", hold: 6,
          sfxs: Array.from({ length: 6 }, (_, i) => ({ sfx: "heist-click", at: 9 + i, volume: 0.8 })) },
        { who: "fox", say: "They were trying to find their way to school, and they lost themselves. That's the clue.", sfxs: [{ sfx: "heist-vault", at: 4.4, volume: 0.7 }] },
      ],
      render: s => (
        <AbsoluteFill>
          <Hall t={s.t} />
          <QuestionCard text="How do we know the hedgehogs didn't mean to end up at Badger's house?" appear={rise(s.t, 20, 4)} x={410} y={110} w={1100} />
          <Manuscript t={s.t} paras={P2} appear={rise(s.t, 20, 20)} y={340}
            torch={s.t > s.at(1) ? { p: 1, k: Math.min(1, (s.t - s.at(1)) / s.speech(1)) } : null}
            found={[
              { p: 1, text: "trying to find our way to school", at: s.at(1) + s.speech(1) * 0.3 },
              { p: 1, text: "we lost ourselves", at: s.at(1) + s.speech(1) * 0.6 },
            ]} />
        </AbsoluteFill>
      ),
    },

    // Getaway.
    {
      beats: [
        { who: "fox", say: "Turn the question into clue words. Sweep the story. Pick the answer that names the evidence." },
        { who: "wren", say: "And never trust an answer that just sounds likely. Nothing gets past us!" },
      ],
      tail: 1.5,
      render: s => (
        <AbsoluteFill>
          <Hall t={s.t} />
          <Blueprint x={460} y={220} w={1000} title="THE GETAWAY" appear={rise(s.t, 20, 4)} lines={[
            { text: "✓  CLUE WORDS", show: rise(s.t, 14, s.speech(0) * 0.2) },
            { text: "✓  SWEEP EVERY PARAGRAPH", show: rise(s.t, 14, s.speech(0) * 0.5) },
            { text: "✓  NAME THE EVIDENCE", show: rise(s.t, 14, s.speech(0) * 0.8) },
            { text: "✗  SOUNDS LIKELY ISN'T PROOF", show: rise(s.t, 14, s.at(1) + s.speech(1) * 0.2) },
          ]} />
        </AbsoluteFill>
      ),
    },
  ],
};
