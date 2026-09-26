// Series 9, film 1: "The Midnight Muffin". A radio play you listen to.
// Almost everything happens in the sound: voices, a train, a parrot. On
// screen: an art-deco wireless in a lamp-lit room. Three pauses ask
// inference questions that need clues from the story held together.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadLime } from "@remotion/google-fonts/Limelight";
import { loadFont as loadFell } from "@remotion/google-fonts/IMFellEnglish";
import { rise, pop, lerp } from "../lib/anim.js";

const { fontFamily: DECO } = loadLime("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: FELL } = loadFell("normal", { weights: ["400"], subsets: ["latin"] });
const hash = n => { const x = Math.sin(n * 45.1 + 9.7) * 43758.5453; return x - Math.floor(x); };
const GOLD = "#E3B45C";
const CREAM = "#F6EBD2";

// The speakers' nameplates and dial positions (the needle swings to whoever talks).
const WHO = {
  announcer: { label: "The Announcer", dial: 0.1 },
  narrator: { label: "The Storyteller", dial: 0.25 },
  plum: { label: "Lady Plum", dial: 0.42 },
  sam: { label: "Sam the Porter", dial: 0.58 },
  crumb: { label: "Mr Crumb", dial: 0.74 },
  polly: { label: "Polly the Parrot", dial: 0.9 },
};

// ---------- The room and the wireless ----------

function Room({ t }) {
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, #4A3526, #1C130D 70%)" }}>
      {/* A rainy window behind, blue-dark. */}
      <div style={{ position: "absolute", left: 120, top: 90, width: 360, height: 460, background: "linear-gradient(#1B2433, #0E141D)", border: "14px solid #2A1C12", boxShadow: "inset 0 0 40px #000" }}>
        <svg width="360" height="460">{Array.from({ length: 30 }, (_, i) => { const y = ((hash(i) * 460 + t * (6 + hash(i + 1) * 5)) % 480) - 20; return <line key={i} x1={hash(i + 2) * 360} y1={y} x2={hash(i + 2) * 360 - 4} y2={y + 18} stroke="rgba(180,200,230,0.35)" strokeWidth="1.5" />; })}</svg>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 10, background: "#2A1C12" }} />
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 10, background: "#2A1C12" }} />
      </div>
      {/* A lamp throwing warm light. */}
      <div style={{ position: "absolute", right: 150, top: 150, width: 220, height: 130, borderRadius: "50% 50% 12px 12px", background: "linear-gradient(#D98F4E, #9A5A2C)" }} />
      <div style={{ position: "absolute", right: 250, top: 280, width: 20, height: 300, background: "#3B2718" }} />
      <div style={{ position: "absolute", right: -100, top: 180, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(rgba(255,190,110,0.28), transparent 65%)" }} />
      {/* The sideboard. */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, bottom: 0, background: "linear-gradient(#3A2618, #24170E)" }} />
    </AbsoluteFill>
  );
}

// The wireless: walnut case, sunburst grille, glowing dial with a needle.
function Wireless({ t, who, talking, level = 0 }) {
  const w = WHO[who];
  const needle = lerp(0.05, 0.95, w?.dial ?? 0.1);
  const glow = 0.75 + 0.25 * Math.sin(t / 7);
  return (
    <div style={{ position: "absolute", left: 610, top: 170, width: 700, height: 650 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "340px 340px 30px 30px", background: "linear-gradient(90deg, #5A3419, #8A5A33 30%, #6E4323 70%, #4A2A14)", boxShadow: "0 30px 60px rgba(0,0,0,0.7), inset 0 0 0 8px #3A2010" }} />
      {/* Sunburst grille over cloth. */}
      <svg width="700" height="420" viewBox="-350 -380 700 420" style={{ position: "absolute", left: 0, top: 40 }}>
        <path d="M-270 40 A 270 270 0 0 1 270 40 Z" fill="#C9A874" />
        {Array.from({ length: 13 }, (_, i) => {
          const a = Math.PI + (i + 1) * (Math.PI / 14);
          return <line key={i} x1={0} y1={40} x2={Math.cos(a) * 280} y2={40 + Math.sin(a) * 280} stroke="#5A3419" strokeWidth="16" />;
        })}
        <circle cx="0" cy="40" r="60" fill="#5A3419" />
        {/* The cloth glows a little with the voice. */}
        <path d="M-270 40 A 270 270 0 0 1 270 40 Z" fill={`rgba(255,200,120,${talking ? 0.08 + level * 0.12 : 0})`} />
      </svg>
      {/* The dial. */}
      <div style={{ position: "absolute", left: 100, top: 400, width: 500, height: 90, borderRadius: 12, background: `rgba(255,210,140,${0.55 * glow})`, boxShadow: `0 0 40px rgba(255,190,110,${0.5 * glow}), inset 0 0 0 4px ${GOLD}` }}>
        {Array.from({ length: 21 }, (_, i) => <div key={i} style={{ position: "absolute", left: 20 + i * 23, top: 12, width: 2, height: i % 5 ? 14 : 26, background: "#5A3419" }} />)}
        <div style={{ position: "absolute", left: 20 + needle * 460, top: 6, width: 4, height: 78, background: "#A5231A", transition: "none" }} />
      </div>
      {/* Two knobs. */}
      {[150, 550].map((x, i) => <div key={i} style={{ position: "absolute", left: x - 40, top: 520, width: 80, height: 80, borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, #D8B27A, #6B4322)", boxShadow: "0 6px 12px rgba(0,0,0,0.5)", transform: `rotate(${i ? t * 0.6 : needle * 270}deg)` }}><div style={{ width: 6, height: 30, background: "#3A2010", margin: "6px auto" }} /></div>)}
    </div>
  );
}

// The lit nameplate above the wireless shows who is speaking.
function Nameplate({ who, talking }) {
  const w = WHO[who];
  if (!w) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 60, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "10px 40px", border: `3px solid ${GOLD}`, borderRadius: 40, fontFamily: DECO, fontSize: 52, color: talking ? CREAM : "rgba(246,235,210,0.5)", background: "rgba(20,12,6,0.6)", textShadow: talking ? `0 0 20px ${GOLD}` : "none", letterSpacing: 2 }}>{w.label}</div>
    </div>
  );
}

// A live waveform that swells with the voice.
function Wave({ t, level }) {
  const pts = Array.from({ length: 120 }, (_, i) => {
    const x = i * (700 / 119);
    const y = Math.sin(i * 0.4 + t * 0.9) * Math.sin(i * 0.13 + t * 0.3) * 40 * level + Math.sin(i * 1.7 + t * 2.1) * 8 * level;
    return `${x},${45 + y}`;
  }).join(" ");
  return (
    <svg width="700" height="90" style={{ position: "absolute", left: 610, top: 840 }}>
      <polyline points={pts} fill="none" stroke={GOLD} strokeWidth="3" opacity="0.9" />
    </svg>
  );
}

function Subtitles({ words, spoken, opacity }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 36, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ maxWidth: 1500, padding: "10px 34px 14px", background: "rgba(14,9,5,0.8)", borderRadius: 8, borderTop: `2px solid ${GOLD}`, fontFamily: FELL, fontSize: 44, lineHeight: 1.25, color: CREAM, textAlign: "center" }}>
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.35 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// A scene: the room, the wireless tuned to whoever is speaking.
function OnAir({ s, beats }) {
  const b = beats[s.beat];
  const into = s.t - s.at(s.beat);
  const talking = into < s.speech(s.beat);
  // A made-up level that flutters while someone speaks.
  const level = talking ? 0.45 + 0.55 * Math.abs(Math.sin(s.t / 2.3) * Math.sin(s.t / 5.1 + 1)) : 0.05;
  return (
    <AbsoluteFill>
      <Room t={s.t} />
      <Wireless t={s.t} who={b.who} talking={talking} level={level} />
      <Nameplate who={b.who} talking={talking} />
      <Wave t={s.t} level={level} />
    </AbsoluteFill>
  );
}

// Question cards on the sideboard.
const CARD = { y: 300, w: 520, h: 340, xs: [110, 700, 1290] };
function Question({ t, text, options, instant = false }) {
  return (
    <AbsoluteFill>
      <Room t={t} />
      <AbsoluteFill style={{ background: "rgba(10,6,3,0.6)" }} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 120, textAlign: "center", fontFamily: FELL, fontStyle: "italic", fontSize: 54, lineHeight: 1.2, color: CREAM, opacity: instant ? 1 : rise(t, 16, 4) }}>{text}</div>
      {options.map((o, i) => {
        const k = instant ? 1 : pop(t, 20 + i * 6);
        return (
          <div key={i} style={{
            position: "absolute", left: CARD.xs[i], top: CARD.y, width: CARD.w, height: CARD.h, padding: "30px 34px",
            background: "linear-gradient(#FBF1DB, #EFDFBC)", borderRadius: 6, boxShadow: `0 20px 50px rgba(0,0,0,0.7), inset 0 0 0 3px ${GOLD}`,
            fontFamily: FELL, fontSize: 42, lineHeight: 1.25, color: "#2A1C12", opacity: Math.min(1, k * 2),
            transform: `translateY(${(1 - Math.min(1, k)) * 40}px) rotate(${(i - 1) * 1.2}deg)`,
          }}>
            <div style={{ fontFamily: DECO, fontSize: 32, color: "#8A5A33", marginBottom: 10 }}>{"abc"[i]}</div>
            {o}
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
const spots = (correct, slip) => CARD.xs.map((x, i) => ({ id: `c${i}`, x, y: CARD.y, w: CARD.w, h: CARD.h, correct: i === correct, slip: i === correct ? undefined : slip }));

const Q1 = {
  text: "Why can't the muffin thief be Sam the porter?",
  options: [
    "Porters are never allowed to eat on trains.",
    "His hands were sticky with polish, but the plate had no polish on it.",
    "He was far too polite to steal a muffin.",
  ],
};
const Q2 = {
  text: "Mr Crumb says he hasn't eaten since lunch. Which clue says he's not telling the truth?",
  options: [
    "He brushes something blue off his waistcoat, and the muffin was blueberry.",
    "He works at the far end of the train.",
    "He says he is starving.",
  ],
};
const Q3 = {
  text: "How does Lady Plum feel at the very end, and how do we know?",
  options: [
    "Furious: she wants Mr Crumb thrown off the train.",
    "Sad: she cries because her muffin is gone for ever.",
    "Not cross any more: she laughs and offers to share her next muffin.",
  ],
};

// Every scene uses the same wireless, so the beats list is shared into it.
const onAir = beats => ({ beats, render: s => <OnAir s={s} beats={beats} /> });

export default {
  id: "p9-radio",
  order: 801,
  series: 9,
  title: "The Midnight Muffin",
  genre: "Radio mystery",
  strap: "A radio mystery. Listen carefully: the clues are in the sounds and the voices.",
  music: "music/radio.wav",
  musicVolume: 0.12,
  cast: {
    announcer: { name: "", voice: "bm_daniel", speed: 0.92 },
    narrator: { name: "", voice: "bf_emma", speed: 0.95 },
    plum: { name: "", voice: "bf_alice", speed: 0.95 },
    sam: { name: "", voice: "bm_lewis", speed: 1.05 },
    crumb: { name: "", voice: "bm_george", speed: 0.9 },
    polly: { name: "", voice: "af_sky", speed: 1.35 },
  },
  Subtitles,
  scenes: [
    {
      id: "open", next: "train",
      ...onAir([
        { who: "announcer", say: "Good evening, listeners. Put the kettle on, and turn the lights down low. Tonight's mystery is called... The Midnight Muffin.", sfxs: [{ sfx: "radio-static", at: 0, volume: 0.6 }, { sfx: "radio-chime", at: 0.6, volume: 0.6 }] },
        { who: "announcer", say: "Listen very carefully. Every clue is in the story. And later, you'll be the detective." },
      ]),
    },
    {
      id: "train", next: "sam",
      ...onAir([
        { who: "narrator", say: "The midnight express rattled through the dark countryside. In the dining car sat Lady Plum, with her travelling parrot, Polly.", sfxs: [{ sfx: "radio-train", at: 0, volume: 0.7 }, { sfx: "radio-whistle", at: 4.5, volume: 0.5 }] },
        { who: "plum", say: "One pot of tea, and one blueberry muffin. The perfect midnight snack.", sfxs: [{ sfx: "radio-clink", at: 1.4, volume: 0.7 }] },
        { who: "narrator", say: "Lady Plum turned to look out of the window, just for a moment. And when she turned back..." },
        { who: "plum", say: "My muffin! It's gone! Someone has taken my blueberry muffin!", sfxs: [{ sfx: "radio-gasp", at: 0, volume: 0.6 }] },
        { who: "polly", say: "Pretty Polly! Muffin gone! Muffin gone!" },
      ]),
    },
    {
      id: "sam", next: "q1",
      ...onAir([
        { who: "narrator", say: "Along the corridor came Sam, the young porter.", sfxs: [{ sfx: "radio-door", at: 0.4, volume: 0.7 }] },
        { who: "sam", say: "Sorry, madam, I've been polishing the brass door handles all evening. Look at my hands. Sticky and shiny with polish!" },
        { who: "narrator", say: "Lady Plum looked at her plate. There was not a single smear of polish on it. Just a few blue crumbs." },
      ]),
    },
    {
      id: "q1",
      choice: { prompt: "Tap the best answer", next: "crumb", options: spots(1, "q1-slip") },
      beats: [{ who: "announcer", say: "Detective, a question. Why can't the muffin thief be Sam the porter?" }],
      render: s => <Question t={s.t} {...Q1} />,
    },
    {
      id: "q1-slip", returnTo: "q1",
      beats: [{ who: "announcer", say: "Put two clues together. What was on Sam's hands? And what was, and wasn't, on the plate?" }],
      render: s => <Question t={s.t} {...Q1} instant />,
    },
    {
      id: "crumb", next: "q2",
      ...onAir([
        { who: "announcer", say: "Exactly. Sticky hands would have left polish on the plate. Back to the train!", sfxs: [{ sfx: "radio-chime", at: 0, volume: 0.5 }] },
        { who: "narrator", say: "Next came the conductor, Mr Crumb, clipping tickets as he went.", sfxs: [{ sfx: "radio-train", at: 0, volume: 0.5 }, { sfx: "radio-clip", at: 3.2, volume: 0.7 }] },
        { who: "crumb", say: "A missing muffin? Well, it certainly wasn't me. I've been at the far end of the train. I haven't had a bite since lunch. I'm starving!" },
        { who: "narrator", say: "And as he spoke, Mr Crumb brushed something small and blue from the front of his waistcoat." },
        { who: "polly", say: "Crumbs! Crumbs! Waistcoat! Squawk!" },
      ]),
    },
    {
      id: "q2",
      choice: { prompt: "Tap the best answer", next: "reveal", options: spots(0, "q2-slip") },
      beats: [{ who: "announcer", say: "Another question. Mr Crumb says he hasn't eaten since lunch. Which clue says he's not telling the truth?" }],
      render: s => <Question t={s.t} {...Q2} />,
    },
    {
      id: "q2-slip", returnTo: "q2",
      beats: [{ who: "announcer", say: "Listen to what Polly the parrot noticed. Crumbs, on a waistcoat. What colour were the muffin crumbs?" }],
      render: s => <Question t={s.t} {...Q2} instant />,
    },
    {
      id: "reveal", next: "q3",
      ...onAir([
        { who: "announcer", say: "That's it. Blue crumbs, from a blueberry muffin. On with the story!", sfxs: [{ sfx: "radio-chime", at: 0, volume: 0.5 }] },
        { who: "plum", say: "Mr Crumb. Those are blue crumbs on your waistcoat. And my muffin was blueberry." },
        { who: "crumb", say: "Oh dear. Oh dear, oh dear. I'm so sorry, Lady Plum. I was just so terribly hungry." },
        { who: "narrator", say: "For a moment, nobody spoke. And then Lady Plum began to laugh." },
        { who: "plum", say: "Oh, Mr Crumb! Next time, just ask. I'll order two muffins, and you shall have one of them." },
        { who: "polly", say: "Two muffins! Two muffins! Pretty Polly!" },
      ]),
    },
    {
      id: "q3",
      choice: { prompt: "Tap the best answer", next: "end", options: spots(2, "q3-slip") },
      beats: [{ who: "announcer", say: "Last question. How does Lady Plum feel at the very end, and how do we know?" }],
      render: s => <Question t={s.t} {...Q3} />,
    },
    {
      id: "q3-slip", returnTo: "q3",
      beats: [{ who: "announcer", say: "Listen again to the end. What does Lady Plum do? She begins to laugh. And what does she offer?" }],
      render: s => <Question t={s.t} {...Q3} instant />,
    },
    {
      id: "end",
      ...onAir([
        { who: "announcer", say: "Quite right. She laughed, and she offered to share. So she wasn't cross any more.", sfxs: [{ sfx: "radio-chime", at: 0, volume: 0.5 }] },
        { who: "announcer", say: "You listened like a true detective, and you read between the lines, even without any lines to read. Good night, listeners.", sfxs: [{ sfx: "radio-static", at: 6.5, volume: 0.5 }] },
      ]),
    },
  ],
};
