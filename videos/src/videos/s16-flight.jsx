// Series 16, film 1: "Cleared for Take-off: Exam Day". Exam technique as a
// flight: the pre-flight checklist, take-off nerves, a mini paper flown
// together (read the instruction, skip the storm cloud and come back, watch
// the clock, check every answer), and a smooth landing. Cockpit at dawn.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";
import { SERIF, SANS } from "../lib/theme.js";
import { rise, pop, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";

const { fontFamily: DISPLAY } = loadOrbitron("normal", { weights: ["500", "700"], subsets: ["latin"] });
const { fontFamily: HAND } = loadCaveat("normal", { weights: ["700"], subsets: ["latin"] });

const AMBER = "#FFB547";
const GREEN = "#7CF2A6";
const CYAN = "#7FD8FF";
const PANEL = "#1A1F24";
const GOLD = "#E8B64C";
const INK = "#1B2A24";
const RED = "#D8453B";
const hash = n => { const x = Math.sin(n * 17.17 + 4.4) * 43758.5453; return x - Math.floor(x); };

// ---------- The world through the windscreen ----------

// phase: 0 on the runway at dawn, 1 climbing through clouds, 2 above the clouds.
function Sky({ t, phase = 0, speed = 0, bank = 0, landing = 0 }) {
  const dawn = `linear-gradient(#1B2448 0%, #5B4A7A 35%, #F29E6B 62%, #FFD39A 70%)`;
  const day = `linear-gradient(#2E6FB8 0%, #7FB8E6 55%, #CFE6F5 70%)`;
  const horizon = lerp(440, 520, Math.min(1, phase)) - landing * 60;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 640, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: -200, transform: `rotate(${bank}deg)`, transformOrigin: "50% 60%" }}>
        <AbsoluteFill style={{ background: dawn, opacity: 1 - Math.min(1, phase * 0.8) }} />
        <AbsoluteFill style={{ background: day, opacity: Math.min(1, phase * 0.8) }} />
        {/* The low sun. */}
        <div style={{ position: "absolute", left: 1350, top: horizon - 70, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(#FFF6D8, rgba(255,210,140,0.4) 55%, transparent 70%)" }} />
        {/* Ground and runway while on the ground. */}
        {phase < 1 && (
          <svg width="2320" height="1040" style={{ position: "absolute", left: 0, top: 0 }}>
            <rect x="0" y={horizon + 200} width="2320" height="800" fill={landing > 0 ? "#4F6B3E" : "#3B4A36"} opacity={1 - phase} />
            <path d={`M ${1300 - 40} ${horizon + 200} L ${1300 + 40} ${horizon + 200} L ${1300 + 700} ${1040} L ${1300 - 700} ${1040} Z`} fill="#2B2E33" opacity={1 - phase} />
            {Array.from({ length: 10 }, (_, i) => {
              const k = ((i / 10 + t * speed * 0.004) % 1);
              const y = horizon + 200 + k * k * 640;
              const w = 4 + k * 26;
              return <rect key={i} x={1300 - w / 2} y={y} width={w} height={6 + k * 50} fill="#EDEDED" opacity={(1 - phase) * 0.9} />;
            })}
          </svg>
        )}
        {/* Clouds that stream past once airborne. */}
        {phase > 0.2 && Array.from({ length: 12 }, (_, i) => {
          const x = ((hash(i) * 2400 - t * (3 + hash(i + 1) * 4)) % 2600 + 2600) % 2600 - 300;
          const y = horizon + 60 + hash(i + 2) * 320 - (phase > 1.5 ? 200 : 0);
          return <div key={i} style={{ position: "absolute", left: x, top: y, width: 260 + hash(i + 3) * 260, height: 70 + hash(i + 4) * 50, borderRadius: 80, background: "rgba(255,255,255,0.85)", filter: "blur(3px)", opacity: Math.min(1, (phase - 0.2) * 2) }} />;
        })}
      </div>
    </div>
  );
}

// The cockpit: window pillars, glare shield and the instrument panel.
function Cockpit({ t, alt = 0, heading = 0, time = 1, timeGlow = 0 }) {
  return (
    <AbsoluteFill>
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        <path d="M 0 0 L 330 0 L 250 640 L 0 640 Z" fill="#101316" />
        <path d="M 1920 0 L 1590 0 L 1670 640 L 1920 640 Z" fill="#101316" />
        <path d="M 952 0 L 968 0 L 972 600 L 948 600 Z" fill="#101316" />
        <path d="M 0 0 L 1920 0 L 1920 40 L 0 40 Z" fill="#0B0D0F" />
        <path d="M 0 600 Q 960 540 1920 600 L 1920 1080 L 0 1080 Z" fill={PANEL} />
        <path d="M 0 600 Q 960 540 1920 600 L 1920 640 Q 960 580 0 640 Z" fill="#0E1114" />
      </svg>
      <Gauge x={330} y={800} label="ALT" t={t}>
        <Needle angle={-120 + alt * 240} colour={GREEN} />
        {Array.from({ length: 11 }, (_, i) => <line key={i} x1="0" y1="-92" x2="0" y2="-80" stroke={GREEN} strokeWidth="3" transform={`rotate(${-120 + i * 24})`} opacity="0.7" />)}
      </Gauge>
      <Gauge x={760} y={800} label="HDG" t={t}>
        <g transform={`rotate(${-heading})`}>
          {["N", "E", "S", "W"].map((d, i) => <text key={d} x="0" y="-66" textAnchor="middle" fontFamily={DISPLAY} fontSize="22" fill={CYAN} transform={`rotate(${i * 90})`}>{d}</text>)}
          {Array.from({ length: 36 }, (_, i) => <line key={i} x1="0" y1="-92" x2="0" y2={i % 3 ? -86 : -80} stroke={CYAN} strokeWidth="2" transform={`rotate(${i * 10})`} opacity="0.6" />)}
        </g>
        <path d="M 0 -40 L 12 20 L 0 10 L -12 20 Z" fill={AMBER} />
      </Gauge>
      {/* The time gauge: an arc that empties as the exam goes on. */}
      <Gauge x={1190} y={800} label="TIME" t={t} glow={timeGlow}>
        <circle r="78" fill="none" stroke="#2C343B" strokeWidth="14" />
        <circle r="78" fill="none" stroke={time > 0.25 ? AMBER : RED} strokeWidth="14" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - time} transform="rotate(-90)" />
        <text x="0" y="12" textAnchor="middle" fontFamily={DISPLAY} fontWeight="700" fontSize="34" fill={AMBER}>{Math.round(time * 100)}%</text>
      </Gauge>
      {/* Two glowing screens. */}
      {[1500, 1720].map((x, i) => (
        <div key={x} style={{ position: "absolute", left: x - 90, top: 700, width: 180, height: 200, borderRadius: 10, background: "#07140E", boxShadow: `inset 0 0 0 3px #2C343B, 0 0 24px rgba(124,242,166,0.15)`, padding: 14, fontFamily: DISPLAY, fontSize: 18, color: i ? CYAN : GREEN, lineHeight: 1.6 }}>
          {i ? <>FLIGHT<br />MEGA 1<br />STATUS<br />{alt > 0.5 ? "CRUISE" : alt > 0 ? "CLIMB" : "READY"}</> : <>ENG 1 OK<br />ENG 2 OK<br />CALM {Math.round(90 + 10 * Math.sin(t / 40))}%<br />FOCUS ON</>}
        </div>
      ))}
    </AbsoluteFill>
  );
}

function Gauge({ x, y, label, children, glow = 0 }) {
  return (
    <svg width="240" height="260" viewBox="-120 -120 240 260" style={{ position: "absolute", left: x - 120, top: y - 120 }}>
      <circle r="108" fill="#0B0E11" stroke={glow > 0 ? AMBER : "#2C343B"} strokeWidth={glow > 0 ? 6 : 5} style={{ filter: glow > 0 ? `drop-shadow(0 0 ${20 * glow}px ${AMBER})` : "none" }} />
      {children}
      <circle r="6" fill="#DDD" />
      <text x="0" y="132" textAnchor="middle" fontFamily={DISPLAY} fontSize="20" fill="#8A96A0" letterSpacing="3">{label}</text>
    </svg>
  );
}
const Needle = ({ angle, colour }) => <line x1="0" y1="14" x2="0" y2="-84" stroke={colour} strokeWidth="5" strokeLinecap="round" transform={`rotate(${angle})`} />;

// ---------- Clipboard checklist ----------
const CHECKS = [
  "Read every instruction",
  "Look at the example first",
  "If stuck, star it and come back",
  "Check the clock at halfway",
  "Check every answer at the end",
  "Breathe slowly and stay calm",
];
function Clipboard({ t, ticks, appear = 1 }) {
  return (
    <div style={{ position: "absolute", left: 1120, top: 90, width: 700, height: 840, transform: `translateY(${(1 - appear) * 500}px) rotate(2deg)`, opacity: appear }}>
      <div style={{ position: "absolute", inset: 0, background: "#8B6A45", borderRadius: 26, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", left: 240, top: -18, width: 220, height: 70, background: "#B8BEC4", borderRadius: 14, boxShadow: "inset 0 -6px 0 #8A9096" }} />
      <div style={{ position: "absolute", left: 36, right: 36, top: 60, bottom: 36, background: "#FBF8F0", borderRadius: 6, padding: "36px 40px" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: INK, letterSpacing: 2 }}>PRE-FLIGHT CHECKS</div>
        <div style={{ height: 3, background: "#DDD", margin: "14px 0 20px" }} />
        {CHECKS.map((c, i) => {
          const k = ticks[i] === undefined ? 0 : pop(t, ticks[i]);
          return (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 20, height: 100, borderBottom: "2px dashed #E6E0D2" }}>
              <div style={{ width: 52, height: 52, border: `4px solid ${INK}`, borderRadius: 8, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {k > 0 && <svg width="46" height="46" viewBox="0 0 24 24" style={{ transform: `scale(${Math.min(1, k)})` }}><path d="m4 12.5 5 5L20 6.5" fill="none" stroke="#1F7A4D" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, color: INK, opacity: 0.35 + 0.65 * Math.min(1, k + (ticks[i] === undefined ? 0 : 0)) || 0.35 }}>{c}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- The mini exam paper ----------
function Paper({ appear = 1, children, section, instruction, glowInstruction = 0 }) {
  return (
    <div style={{ position: "absolute", left: 300, top: 40, width: 1320, height: 600, transform: `translateY(${(1 - appear) * 900}px)`, opacity: Math.min(1, appear * 2) }}>
      <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", borderRadius: 4, boxShadow: "0 30px 70px rgba(0,0,0,0.6)" }} />
      <div style={{ position: "absolute", left: 60, top: 40, fontFamily: SANS, fontWeight: 800, fontSize: 30, color: "#666", letterSpacing: 2 }}>{section}</div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 90, padding: "14px 20px", fontFamily: SANS, fontWeight: 700, fontSize: 38, color: INK, lineHeight: 1.3, borderRadius: 10, background: `rgba(255,217,102,${0.55 * glowInstruction})`, boxShadow: glowInstruction > 0 ? `0 0 0 4px rgba(232,182,76,${glowInstruction})` : "none" }}>{instruction}</div>
      {children}
    </div>
  );
}

// A hand-drawn mark (circle, underline, cross or star) in pen.
function Pen({ kind, x, y, w = 200, h = 80, progress, colour = "#1F4FA0" }) {
  if (progress <= 0) return null;
  const k = Math.min(1, progress);
  const style = { position: "absolute", left: x, top: y, overflow: "visible" };
  const common = { fill: "none", stroke: colour, strokeWidth: 6, strokeLinecap: "round", pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - k };
  if (kind === "circle") return <svg width={w} height={h} style={style}><path d={`M ${w * 0.55} 4 C ${w * 1.05} 0, ${w * 1.05} ${h}, ${w * 0.5} ${h - 2} C ${-w * 0.05} ${h}, ${-w * 0.02} 2, ${w * 0.62} 8`} {...common} /></svg>;
  if (kind === "underline") return <svg width={w} height={20} style={style}><path d={`M 4 10 Q ${w / 2} 16 ${w - 4} 8`} {...common} /></svg>;
  if (kind === "cross") return <svg width={w} height={h} style={style}><path d={`M 6 6 L ${w - 6} ${h - 6} M ${w - 6} 6 L 6 ${h - 6}`} {...common} stroke={RED} /></svg>;
  if (kind === "star") return <svg width="90" height="90" viewBox="-45 -45 90 90" style={style}><path d="M0 -38 L11 -12 L38 -12 L16 6 L24 34 L0 18 L-24 34 L-16 6 L-38 -12 L-11 -12 Z" {...common} stroke={GOLD} /></svg>;
  return null;
}

// Answer options a to d under little figures.
function Options({ figures, x = 180, y = 520, gap = 250 }) {
  const w = boxWidth(gap);
  return figures.map((f, i) => (
    <div key={i} style={{ position: "absolute", left: x + i * gap, top: y, width: w, textAlign: "center" }}>
      <div style={{ width: w, height: 160, border: "3px solid #CCC", borderRadius: 8, position: "relative" }}>
        <svg width={w} height="160" viewBox={`${-w / 2} -80 ${w} 160`} style={{ position: "absolute", inset: 0 }}><Shape {...f} /></svg>
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: "#555", marginTop: 6 }}>{"abcd"[i]}</div>
    </div>
  ));
}
const boxWidth = gap => Math.min(180, gap - 20);
// Where a 100 by 80 pen circle sits to ring option i's letter.
const letterSpot = (i, x, y, gap) => ({ x: x + i * gap + boxWidth(gap) / 2 - 50, y: y + 160 });

// ---------- Overlay and captions ----------
function Overlay() {
  return <AbsoluteFill style={{ pointerEvents: "none", boxShadow: "inset 0 0 160px rgba(0,0,0,0.55)" }} />;
}
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ maxWidth: 1560, background: "rgba(6,10,12,0.9)", border: `2px solid ${actor?.colour ?? AMBER}`, borderRadius: 12, padding: "10px 28px 12px", fontFamily: SANS, fontWeight: 700, fontSize: 40, lineHeight: 1.25, color: "#F4F1E8", textAlign: "center" }}>
        {actor && <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, color: actor.colour, marginRight: 16, letterSpacing: 2 }}>{actor.name}</span>}
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.4 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// ---------- The film ----------
const Q2_GRID = [
  ["circle", "triangle", "square"],
  ["triangle", "square", "circle"],
  ["square", "circle", null],
];

export default {
  id: "s16-flight",
  order: 1501,
  series: 16,
  title: "Cleared for Take-off: Exam Day",
  frame: "none",
  push: 0.01,
  cast: {
    captain: { name: "CAPTAIN", voice: "bm_george", speed: 0.9, colour: AMBER },
    fo: { name: "FIRST OFFICER", voice: "bm_lewis", speed: 1.08, colour: CYAN },
    tower: { name: "TOWER", voice: "bf_isabella", speed: 1.0, colour: GREEN },
  },
  music: { src: "music/flight.wav", volume: 0.24, duck: 0.45 },
  Overlay,
  Subtitles,
  scenes: [
    // Dawn on the runway.
    {
      beats: [
        { who: "captain", say: "Good morning, First Officer. That's you. Today's flight is a special one, because it is exam day.", sfxs: [{ sfx: "flight-hum", at: 0, volume: 0.4 }, { sfx: "flight-chime", at: 0.4, volume: 0.6 }] },
        { who: "fo", say: "Ready when you are, Captain!" },
        { who: "captain", say: "Good. Every flight starts with our pre-flight checks." },
      ],
      render: s => (
        <AbsoluteFill>
          <Sky t={s.t} phase={0} />
          <Cockpit t={s.t} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", opacity: rise(s.t, 30, 10) * (1 - rise(s.t, 20, s.at(1))) }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: "#FFF7E6", textShadow: "0 6px 30px rgba(0,0,0,0.6)", letterSpacing: 4 }}>CLEARED FOR TAKE-OFF</div>
            <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: AMBER, marginTop: 10 }}>exam day</div>
          </div>
        </AbsoluteFill>
      ),
    },
    // The checklist.
    {
      beats: [
        { who: "captain", say: "Check one. Always read the instructions carefully, because different sections ask you to do different things.", sfxs: [{ sfx: "flight-tick", at: 1.2 }] },
        { who: "captain", say: "Check two. If there's a worked example, look at it first. It shows you exactly what to do.", sfxs: [{ sfx: "flight-tick", at: 1.2 }] },
        { who: "captain", say: "Check three. If you get stuck on a question, don't spend ages on it. Put a star next to it, move on, and come back to it later.", sfxs: [{ sfx: "flight-tick", at: 1.2 }] },
        { who: "captain", say: "Check four. When half the time has gone, look at the clock, and keep working at a steady speed.", sfxs: [{ sfx: "flight-tick", at: 1.2 }] },
        { who: "captain", say: "Check five. At the end, go back and check every answer.", sfxs: [{ sfx: "flight-tick", at: 1.2 }] },
        { who: "captain", say: "And check six. Take a slow breath and stay calm. You have practised for this.", sfxs: [{ sfx: "flight-tick", at: 1.0 }] },
      ],
      render: s => (
        <AbsoluteFill>
          <Sky t={s.t} phase={0} />
          <Cockpit t={s.t} />
          <Clipboard t={s.t} appear={rise(s.t, 30, 0)} ticks={[0, 1, 2, 3, 4, 5].map(i => s.at(i) + 36)} />
        </AbsoluteFill>
      ),
    },
    // Take-off.
    {
      beats: [
        { who: "tower", say: "Flight Mega One, runway clear. You are cleared for take-off.", sfxs: [{ sfx: "flight-squelch", at: 0, volume: 0.8 }] },
        { who: "fo", say: "My tummy's gone all fluttery, Captain.", sfxs: [{ sfx: "flight-spool", at: 0.4, volume: 0.8 }] },
        { who: "captain", say: "That feeling is just nerves. Every good pilot feels it. Breathe in slowly, and then breathe out. Here we go." },
      ],
      render: s => {
        const roll = rise(s.t, s.at(2) + s.speech(2) - s.at(1), s.at(1));
        const lift = rise(s.t, 80, s.at(2) + s.speech(2) * 0.75);
        const breath = Math.sin(Math.max(0, s.t - s.at(2)) / 22);
        return (
          <AbsoluteFill>
            <Sky t={s.t} phase={lift * 1.2} speed={roll * 30} bank={0} />
            <Cockpit t={s.t} alt={lift * 0.4} />
            {s.beat === 2 && <div style={{ position: "absolute", left: 960 - 90 - breath * 30, top: 250 - 90 - breath * 30, width: 180 + breath * 60, height: 180 + breath * 60, borderRadius: "50%", border: `4px solid ${CYAN}`, opacity: 0.6 * rise(s.t, 20, s.at(2)) * (1 - lift) }} />}
          </AbsoluteFill>
        );
      },
    },
    // Question one: the instruction matters.
    {
      beats: [
        { who: "captain", say: "We're in the air. Here is our first question. Let's read what it asks us to do." },
        { who: "fo", say: "Easy! The biscuit's in the wrong place. I'll circle it!" },
        { who: "captain", say: "Hold on. Read the instruction again. It says underline, not circle. And it says two words." },
        { who: "fo", say: "Oh! Biscuit and Grandad have swapped. I'll underline them both." },
        { who: "captain", say: "Perfect. Grandad dunked the biscuit in his tea. The instruction told you exactly what to do." },
      ],
      render: s => {
        const a = rise(s.t, 30, 10);
        return (
          <AbsoluteFill>
            <Sky t={s.t} phase={1.6} />
            <Cockpit t={s.t} alt={0.6} heading={40} time={0.95} />
            <Paper appear={a} section="SECTION A" glowInstruction={rise(s.t, 16, s.at(2) + 20) * (1 - rise(s.t, 16, s.at(3) + 10))}
              instruction={<>In each sentence, two words have swapped places. <u>Underline</u> the <b>two</b> words that need to swap.</>}>
              <div style={{ position: "absolute", left: 90, top: 290, fontFamily: SERIF, fontSize: 64, color: INK, display: "flex", gap: 18 }}>
                {"The biscuit dunked Grandad in his tea.".split(" ").map((w, i) => (
                  <span key={i} style={{ position: "relative" }}>
                    {w}
                    {i === 1 && <>
                      <Pen kind="circle" x={-22} y={-4} w={260} h={96} progress={rise(s.t, 20, s.at(1) + s.speech(1) * 0.6)} />
                      <Pen kind="cross" x={-10} y={0} w={230} h={86} progress={rise(s.t, 14, s.at(2) + s.speech(2) * 0.3)} />
                    </>}
                    {(i === 1 || i === 3) && <Pen kind="underline" x={-4} y={88} w={i === 1 ? 210 : 250} progress={rise(s.t, 16, s.at(3) + s.speech(3) * (i === 1 ? 0.7 : 0.8))} colour="#1F7A4D" />}
                  </span>
                ))}
              </div>
              <div style={{ position: "absolute", left: 90, top: 450, fontFamily: HAND, fontWeight: 700, fontSize: 56, color: "#1F7A4D", opacity: rise(s.t, 20, s.at(4) + 10) }}>Grandad dunked the biscuit in his tea. ✓</div>
            </Paper>
          </AbsoluteFill>
        );
      },
    },
    // Question two: the storm cloud, starred and skipped.
    {
      beats: [
        { who: "fo", say: "Question two looks tricky. It's a grid with a gap, and I've been staring at it for ages." },
        { who: "captain", say: "That question is like a storm cloud. A pilot doesn't circle round a storm for ages, wasting fuel. Put a star next to the question, and move on to the next one." },
        { who: "fo", say: "So I star it, skip it, and come back to it later." },
      ],
      render: s => {
        const a = rise(s.t, 30, 0);
        const away = rise(s.t, 30, s.at(2) + s.speech(2) * 0.6);
        return (
          <AbsoluteFill>
            <Sky t={s.t} phase={1.6} />
            <Cockpit t={s.t} alt={0.7} heading={60} time={0.8} />
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${away * -1400}px)` }}>
              <Paper appear={a} section="SECTION B" instruction={<>Choose the figure that completes the grid. <u>Circle</u> the letter.</>}>
                <div style={{ position: "absolute", left: 120, top: 180 }}>
                  <svg width="400" height="400" viewBox="0 0 420 420">
                    {Q2_GRID.flat().map((k, i) => (
                      <g key={i} transform={`translate(${(i % 3) * 140 + 70} ${Math.floor(i / 3) * 140 + 70})`}>
                        <rect x="-68" y="-68" width="136" height="136" fill="none" stroke="#999" strokeWidth="3" />
                        {k ? <Shape kind={k} r={44} fill={i % 2 ? "black" : "white"} /> : <text y="20" textAnchor="middle" fontFamily={SANS} fontWeight="800" fontSize="60" fill="#BBB">?</text>}
                      </g>
                    ))}
                  </svg>
                </div>
                <Options figures={[{ kind: "circle", r: 44, fill: "white" }, { kind: "triangle", r: 44, fill: "white" }, { kind: "square", r: 44, fill: "black" }, { kind: "circle", r: 44, fill: "black" }]} x={620} y={220} gap={170} />
                <Pen kind="star" x={30} y={170} progress={rise(s.t, 20, s.at(1) + s.speech(1) * 0.65)} />
                {/* Storm clouds hang over it while he stares. */}
                <div style={{ position: "absolute", left: 100, top: 170, width: 460, height: 420, borderRadius: 80, background: "radial-gradient(rgba(70,80,95,0.35), transparent 70%)", opacity: 1 - rise(s.t, 20, s.at(1) + s.speech(1) * 0.65) }} />
              </Paper>
            </div>
          </AbsoluteFill>
        );
      },
    },
    // Halfway: check the clock.
    {
      beats: [
        { who: "captain", say: "We're halfway now. Look at the time gauge. Half the time has gone, and we've done more than half the questions. So we're on time." },
        { who: "fo", say: "Nice and steady, Captain!" },
      ],
      render: s => {
        const drop = lerp(0.75, 0.5, rise(s.t, 50, 20));
        return (
          <AbsoluteFill>
            <Sky t={s.t} phase={2} />
            <Cockpit t={s.t} alt={0.9} heading={75} time={drop} timeGlow={rise(s.t, 20, s.speech(0) * 0.15)} />
            <div style={{ position: "absolute", left: 990, width: 400, textAlign: "center", top: 630, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: AMBER, opacity: rise(s.t, 20, s.speech(0) * 0.35), textShadow: `0 0 20px ${AMBER}` }}>HALFWAY: ON TIME</div>
          </AbsoluteFill>
        );
      },
    },
    // Back to the starred question with fresh eyes.
    {
      beats: [
        { who: "captain", say: "We have plenty of time left, so let's go back to the starred question. Now that we are looking at it again, it seems much easier." },
        { who: "fo", say: "Each row has one circle, one triangle and one square, so the bottom row needs a triangle. The shading takes turns, white then black then white, so it's a white triangle. That's b!" },
        { who: "captain", say: "Well done. Skipping the question saved you time, so you could come back to it later with a clear head." },
      ],
      render: s => (
        <AbsoluteFill>
          <Sky t={s.t} phase={2} />
          <Cockpit t={s.t} alt={0.9} heading={90} time={0.4} />
          <Paper appear={rise(s.t, 30, 0)} section="SECTION B" instruction={<>Choose the figure that completes the grid. <u>Circle</u> the letter.</>}>
            <div style={{ position: "absolute", left: 120, top: 180 }}>
              <svg width="400" height="400" viewBox="0 0 420 420">
                {Q2_GRID.flat().map((k, i) => (
                  <g key={i} transform={`translate(${(i % 3) * 140 + 70} ${Math.floor(i / 3) * 140 + 70})`}>
                    <rect x="-68" y="-68" width="136" height="136" fill={Math.floor(i / 3) === 2 && s.t > s.at(1) + 20 ? "rgba(255,217,102,0.3)" : "none"} stroke="#999" strokeWidth="3" />
                    {k ? <Shape kind={k} r={44} fill={i % 2 ? "black" : "white"} /> : <Shape kind="triangle" r={44} fill="white" draw={rise(s.t, 30, s.at(1) + s.speech(1) * 0.8)} />}
                  </g>
                ))}
              </svg>
            </div>
            <Options figures={[{ kind: "circle", r: 44, fill: "white" }, { kind: "triangle", r: 44, fill: "white" }, { kind: "square", r: 44, fill: "black" }, { kind: "circle", r: 44, fill: "black" }]} x={620} y={220} gap={170} />
            <Pen kind="star" x={30} y={170} progress={1} />
            <Pen kind="circle" x={letterSpot(1, 620, 220, 170).x} y={letterSpot(1, 620, 220, 170).y} w={100} h={80} progress={rise(s.t, 20, s.at(1) + s.speech(1) * 0.9)} colour="#1F7A4D" />
          </Paper>
        </AbsoluteFill>
      ),
    },
    // Final checks: catching a slip.
    {
      beats: [
        { who: "captain", say: "We're coming in to land, so it's time for our final checks. Let's look back over every answer." },
        { who: "captain", say: "Look at question four. Your working says d. But which letter did you circle?" },
        { who: "fo", say: "I circled b! I worked it out right, but I circled the wrong letter. I'll fix it now." },
        { who: "captain", say: "That's why we check. The answer was right in your head. Now it's right on the paper too." },
      ],
      render: s => (
        <AbsoluteFill>
          <Sky t={s.t} phase={1.6} landing={0.3} />
          <Cockpit t={s.t} alt={0.5} heading={100} time={0.15} />
          <Paper appear={rise(s.t, 30, 0)} section="SECTION B" instruction={<>4. Which figure is the odd one out? <u>Circle</u> the letter.</>}>
            <Options figures={[{ kind: "square", r: 44, fill: "grey" }, { kind: "square", r: 44, fill: "grey", rot: 45 }, { kind: "square", r: 44, fill: "grey", rot: 20 }, { kind: "pentagon", r: 44, fill: "grey" }]} x={180} y={200} gap={250} />
            <div style={{ position: "absolute", left: 1130, top: 250, whiteSpace: "nowrap", fontFamily: HAND, fontWeight: 700, fontSize: 60, color: "#1F4FA0", transform: "rotate(-6deg)" }}>5 sides! = d</div>
            <Pen kind="circle" x={letterSpot(1, 180, 200, 250).x} y={letterSpot(1, 180, 200, 250).y} w={100} h={80} progress={1} />
            <Pen kind="cross" x={letterSpot(1, 180, 200, 250).x + 6} y={letterSpot(1, 180, 200, 250).y + 4} w={90} h={70} progress={rise(s.t, 14, s.at(2) + s.speech(2) * 0.6)} />
            <Pen kind="circle" x={letterSpot(3, 180, 200, 250).x} y={letterSpot(3, 180, 200, 250).y} w={100} h={80} colour="#1F7A4D" progress={rise(s.t, 18, s.at(2) + s.speech(2) * 0.8)} />
            <div style={{ position: "absolute", left: letterSpot(1, 180, 200, 250).x - 20, top: letterSpot(1, 180, 200, 250).y + 70, fontFamily: HAND, fontWeight: 700, fontSize: 44, color: RED, opacity: rise(s.t, 14, s.at(1) + s.speech(1) * 0.7) * (1 - rise(s.t, 14, s.at(2) + s.speech(2) * 0.8)) }}>oops?</div>
          </Paper>
        </AbsoluteFill>
      ),
    },
    // Landing.
    {
      beats: [
        { who: "tower", say: "Flight Mega One, you are cleared to land.", sfxs: [{ sfx: "flight-squelch", at: 0, volume: 0.8 }] },
        { who: "captain", say: "We read every instruction. We skipped the hard question and then solved it. We checked the clock, and we checked every answer.", sfxs: [{ sfx: "flight-touchdown", at: 6.3, volume: 0.8 }] },
        { who: "captain", say: "Smooth landing, First Officer. Well done.", sfxs: [{ sfx: "flight-chime", at: 2.2, volume: 0.6 }] },
      ],
      tail: 1.5,
      render: s => {
        const down = rise(s.t, s.at(1) + s.speech(1) * 0.9, 0);
        const done = rise(s.t, 30, s.at(2) + s.speech(2) * 0.72);
        return (
          <AbsoluteFill>
            <Sky t={s.t} phase={lerp(1.2, 0, down)} speed={lerp(30, 0, done)} landing={1} />
            <Cockpit t={s.t} alt={lerp(0.4, 0, down)} heading={100} time={0.05} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", opacity: done }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, color: "#FFF7E6", textShadow: "0 6px 30px rgba(0,0,0,0.6)", letterSpacing: 4 }}>SMOOTH LANDING</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: AMBER, marginTop: 8 }}>well done, First Officer</div>
            </div>
          </AbsoluteFill>
        );
      },
    },
  ],
};
