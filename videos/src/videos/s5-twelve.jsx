// Series 5, music video: "The Twelve Things". Bauhaus kinetic typography,
// cut to the beat of a song composed in music/twelve.py. Each of the twelve
// things gets a shape that acts it out, and a strip of twelve tiles lights up
// in order so the list sticks.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { loadFont as loadRubik } from "@remotion/google-fonts/RubikMonoOne";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { Shape } from "../lib/shapes.jsx";
import timing from "../generated/twelve-timing.json";

const { fontFamily: MONO } = loadRubik("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: BEBAS } = loadBebas("normal", { weights: ["400"], subsets: ["latin"] });

const B = { red: "#E0301E", yellow: "#F6C426", blue: "#1F4E9E", black: "#141414", paper: "#F2EDE3" };
const FIELDS = [[B.blue, B.yellow], [B.red, B.paper], [B.yellow, B.black], [B.black, B.yellow], [B.paper, B.red]];
const NAMES = ["Shape", "How many", "Size", "Shading", "Rotation", "Flipped", "Position", "Front / behind", "Line style", "Touching", "Pointing at", "Inside / outside"];
const FPS = 30;
const BEAT = 60 / timing.bpm;

// The line being sung at time `sec`, and how far into it we are.
function current(sec) {
  let line = null;
  for (const l of timing.lines) if (sec >= l.start - 0.05) line = l;
  return line;
}
const lastThing = sec => {
  let n = -1;
  for (const l of timing.lines) if (sec >= l.start && l.thing != null) n = Math.max(n, l.thing);
  return n;
};

function MusicVideo() {
  const frame = useCurrentFrame();
  const sec = frame / FPS;
  const beat = sec / BEAT;
  const barN = Math.floor(beat / 4);
  const pulse = Math.exp(-((beat % 1) * 6)); // 1 on the beat, falling away
  const line = current(sec);
  const [bg, fg] = FIELDS[barN % FIELDS.length];
  const chorus = line?.kind === "chorus";
  const into = line ? sec - line.start : 0;

  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <Audio src={staticFile("music/twelve.wav")} />
      <Grid beat={beat} fg={fg} pulse={pulse} />

      {/* The big number of the thing being named. */}
      {line?.thing != null && (
        <div style={{
          position: "absolute", left: 70, top: 40, fontFamily: MONO, fontSize: 420, lineHeight: 1,
          color: "transparent", WebkitTextStroke: `10px ${fg}`, opacity: 0.9,
          transform: `translateY(${Math.max(0, 1 - into * 5) * -80}px) scale(${1 + pulse * 0.03})`,
        }}>{line.thing + 1}</div>
      )}

      {/* The shape that acts out the thing. */}
      {line?.thing != null && <Demo thing={line.thing} into={into} beat={beat} fg={fg} bg={bg} />}

      {/* Before the first words: the title, stamped on the beat. */}
      {sec < timing.lines[0].start && (
        <div style={{ position: "absolute", left: 120, top: 250, fontFamily: MONO, fontSize: 150, lineHeight: 1, color: fg, transform: `scale(${1 + pulse * 0.04})`, transformOrigin: "0 0" }}>
          {["THE", "TWELVE", "THINGS"].map((w, i) => (
            <div key={w} style={{ opacity: beat >= i * 2 ? 1 : 0, transform: `translateX(${beat >= i * 2 ? 0 : -60}px)` }}>{w}</div>
          ))}
        </div>
      )}

      {/* The words, dropping in one at a time. */}
      {line && <Lyric line={line} into={into} fg={fg} bg={bg} chorus={chorus} pulse={pulse} />}

      <Strip lit={lastThing(sec)} active={line?.thing} chorus={chorus} beat={beat} fg={fg} bg={bg} />
    </AbsoluteFill>
  );
}

// A Bauhaus grid of circles and bars that pulses on every beat.
function Grid({ beat, fg, pulse }) {
  const b = Math.floor(beat);
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.22 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={1920 - 160 - (i % 3) * 170} cy={160 + Math.floor(i / 3) * 170} r={60 * (1 + (b % 6 === i ? pulse * 0.4 : 0))} fill={fg} />
      ))}
      <rect x={0} y={1080 - 210} width={1920 * ((beat % 4) / 4)} height={10} fill={fg} />
      <rect x={1920 - 60} y={0} width={60} height={1080 * ((beat % 16) / 16)} fill={fg} />
    </svg>
  );
}

function Lyric({ line, into, fg, bg, chorus, pulse }) {
  const words = line.text.split(" ");
  const dur = Math.max(0.3, line.end - line.start);
  const echo = line.who === "echo";
  const size = chorus ? 110 : echo ? 120 : line.text.length > 22 ? 96 : 130;
  return (
    <div style={{
      position: "absolute", left: echo ? 900 : chorus ? 120 : 700, right: echo ? undefined : 120, top: echo ? 620 : chorus ? 330 : 470,
      fontFamily: chorus ? MONO : BEBAS, fontSize: size, lineHeight: 1.02, letterSpacing: chorus ? 0 : 2,
      color: echo ? bg : fg, textTransform: "uppercase",
      background: echo ? fg : "transparent", padding: echo ? "10px 30px" : 0, display: "inline-block",
      transform: `scale(${1 + pulse * 0.02})`, transformOrigin: "0 50%",
    }}>
      {words.map((w, i) => {
        const at = (i / words.length) * dur * 0.9;
        const k = Math.max(0, Math.min(1, (into - at) * 10));
        return (
          <span key={i} style={{ display: "inline-block", marginRight: "0.28em", opacity: k, transform: `translateY(${(1 - k) * -60}px) rotate(${(1 - k) * -8}deg)` }}>{w}</span>
        );
      })}
    </div>
  );
}

// The shape acting out each of the twelve things, beat by beat.
function Demo({ thing, into, beat, fg, bg }) {
  const b = Math.floor(beat);
  const swing = (beat % 2) / 2;
  const cx = 420, cy = 640;
  const base = { r: 110, fill: "white", ink: B.black };
  const fillFor = n => ["white", "grey", "black", "striped"][n % 4];
  let body;
  switch (thing) {
    case 0: body = <Shape {...base} kind={["triangle", "square", "pentagon", "hexagon", "circle"][b % 5]} x={cx} y={cy} />; break;
    case 1: { const n = (b % 3) + 1; body = Array.from({ length: n }, (_, i) => <Shape key={i} {...base} kind="circle" r={60} x={cx + (i - (n - 1) / 2) * 140} y={cy} />); break; }
    case 2: body = <Shape {...base} kind="square" r={b % 2 ? 150 : 70} x={cx} y={cy} />; break;
    case 3: body = <Shape {...base} kind="heart" fill={fillFor(b)} x={cx} y={cy} />; break;
    case 4: body = <Shape {...base} kind="arrow" rot={beat * 45} x={cx} y={cy} />; break;
    case 5: body = <Shape {...base} kind="flag" flip={b % 2 === 1} x={cx} y={cy} />; break;
    case 6: { const cells = [[-1, -1], [1, -1], [1, 1], [-1, 1]]; const c = cells[b % 4]; body = <Shape {...base} kind="circle" r={60} x={cx + c[0] * 130} y={cy + c[1] * 110} />; break; }
    case 7: { const front = b % 2; body = <>{front ? <><Shape {...base} kind="circle" fill="grey" x={cx - 50} y={cy} /><Shape {...base} kind="square" x={cx + 50} y={cy} /></> : <><Shape {...base} kind="square" x={cx + 50} y={cy} /><Shape {...base} kind="circle" fill="grey" x={cx - 50} y={cy} /></>}</>; break; }
    case 8: body = <Shape {...base} kind="hexagon" line={["solid", "dotted", "double"][b % 3]} fill="none" x={cx} y={cy} />; break;
    case 9: { const gap = b % 2 ? 0 : 80; body = <><Shape {...base} kind="circle" r={80} x={cx - 80 - gap / 2} y={cy} /><Shape {...base} kind="circle" r={80} fill="black" x={cx + 80 + gap / 2} y={cy} /></>; break; }
    case 10: { const target = b % 2; body = <><Shape {...base} kind="star" r={50} x={cx - 180} y={cy - 120} fill="black" /><Shape {...base} kind="heart" r={50} x={cx + 180} y={cy - 120} fill="grey" /><Shape {...base} kind="arrow" r={80} x={cx} y={cy + 60} rot={target ? -34 : -146} /></>; break; }
    case 11: { const inside = b % 2 === 0; body = <><Shape {...base} kind="square" r={120} fill="none" x={cx} y={cy} /><Shape {...base} kind="circle" r={34} fill="black" x={inside ? cx : cx + 210} y={inside ? cy : cy - 140} /></>; break; }
    default: body = null;
  }
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <circle cx={cx} cy={cy} r={230 + swing * 6} fill={fg} opacity={0.95} />
      <g opacity={Math.min(1, into * 6)}>{body}</g>
    </svg>
  );
}

// Twelve tiles along the bottom, lighting up in order as each is named.
function Strip({ lit, active, chorus, beat, fg, bg }) {
  const w = 1920 / 12;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, display: "flex", background: B.black }}>
      {NAMES.map((n, i) => {
        const on = i <= lit;
        const now = i === active;
        const flash = chorus && Math.floor(beat) % 12 === i;
        return (
          <div key={n} style={{
            width: w, borderRight: "3px solid #000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            background: now || flash ? B.yellow : on ? [B.red, B.blue, B.paper][i % 3] : "#262626",
            color: now || flash ? B.black : on ? (i % 3 === 2 ? B.black : B.paper) : "#555",
            transition: "none",
          }}>
            <div style={{ fontFamily: MONO, fontSize: 38 }}>{i + 1}</div>
            <div style={{ fontFamily: BEBAS, fontSize: 28, letterSpacing: 1, textAlign: "center", lineHeight: 1 }}>{n}</div>
          </div>
        );
      })}
    </div>
  );
}

export default {
  id: "s5-twelve",
  order: 401,
  series: 5,
  title: "The Twelve Things",
  Component: MusicVideo,
  frames: Math.ceil(timing.seconds * FPS),
};
