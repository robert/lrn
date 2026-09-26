// Series 2, film 9: "Match of the Day: Most Alike". A football highlights show.
// Pundits Lewis and Izzy explain similarities questions: two teammates share
// a secret tactic; four hopefuls try out; only one really plays like them.
// Telestrator circles, red cards for impostors, and GOAL for the right one.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { rise, pop, window, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";

const { fontFamily: BEBAS } = loadBebas("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: SANS } = loadNunito("normal", { weights: ["700", "800", "900"], subsets: ["latin"] });

const NAVY = "#0B1B36";
const NAVY2 = "#15325E";
const PITCH = "#2E8B3E";
const YELLOW = "#FFD23F"; // telestrator pen
const RED = "#E03A3E";
const WHITE = "#FFFFFF";
const INK = "#1B2A24";

const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- Broadcast chrome ----------

// Captions in a TV lower-third bar, with the pundit's name on a tab.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{ position: "absolute", left: 160, right: 160, bottom: 40, opacity, display: "flex", alignItems: "stretch", justifyContent: "center" }}>
      {actor && (
        <div style={{ background: actor.colour, color: WHITE, fontFamily: BEBAS, fontSize: 40, letterSpacing: 2, padding: "10px 22px 4px", display: "flex", alignItems: "center" }}>{actor.name}</div>
      )}
      <div style={{ background: "rgba(255,255,255,0.96)", padding: "12px 26px", fontFamily: SANS, fontWeight: 800, fontSize: 38, lineHeight: 1.25, color: NAVY, boxShadow: "0 8px 30px rgba(0,0,0,0.35)" }}>
        {words.map((w, i) => (
          <span key={i} style={{ color: i < spoken ? NAVY : "#A2AEBF" }}>{w}{i < words.length - 1 ? " " : ""}</span>
        ))}
      </div>
    </div>
  );
}

// The score bug, top left: how many hopefuls picked right, and traps dodged.
function ScoreBug({ you = 0, traps = 0, flash = 0, label = "MOST ALIKE" }) {
  return (
    <div style={{ position: "absolute", left: 70, top: 50, display: "flex", fontFamily: BEBAS, fontSize: 38, letterSpacing: 1.5, boxShadow: "0 6px 20px rgba(0,0,0,0.4)" }}>
      <div style={{ background: RED, color: WHITE, padding: "6px 16px 2px" }}>{label}</div>
      <div style={{ background: WHITE, color: NAVY, padding: "6px 16px 2px" }}>YOU</div>
      <div style={{ background: NAVY2, color: flash > 0 ? YELLOW : WHITE, padding: "6px 16px 2px", transform: `scale(${1 + flash * 0.2})` }}>{you} – {traps}</div>
      <div style={{ background: WHITE, color: NAVY, padding: "6px 16px 2px" }}>TRAPS</div>
    </div>
  );
}

// The studio: a deep navy set with a glowing pitch-green floor and LED lines.
function Studio({ t }) {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% 110%, rgba(46,139,62,0.55), transparent 70%), linear-gradient(${NAVY} 0%, ${NAVY2} 70%, #0A1428 100%)` }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-200 + i * 170 + ((t * 1.5) % 170)} y1={0} x2={-500 + i * 170 + ((t * 1.5) % 170)} y2={1080} stroke="#2B5A9A" strokeWidth={2} />
        ))}
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, transparent 50%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
}

// The stadium at night for the opening: floodlights, crowd and pitch.
function Stadium({ t }) {
  const flashes = Array.from({ length: 40 }, (_, i) => {
    const on = hash(Math.floor(t / 4) * 97 + i) > 0.9;
    return on ? <circle key={i} cx={hash(i) * 1920} cy={380 + hash(i * 3) * 170} r={3 + hash(i * 5) * 4} fill="white" /> : null;
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(#050B1A, #0E1E3D 55%, #0B1530)" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
        {/* Stands full of people. */}
        <path d="M0 360 L1920 360 L1920 600 L0 600 Z" fill="#141C2E" />
        {Array.from({ length: 900 }, (_, i) => (
          <circle key={i} cx={(i * 37.7) % 1920} cy={380 + ((i * 13) % 11) * 20} r={5} fill={["#5A2A36", "#27406B", "#6B6F7A", "#8A3A2A"][i % 4]} opacity={0.65} />
        ))}
        {flashes}
        {/* The pitch in perspective, mown in stripes. */}
        {Array.from({ length: 8 }, (_, i) => {
          const y0 = 600 + (i * 480) / 8, y1 = 600 + ((i + 1) * 480) / 8;
          const w0 = 1400 + (i * 1400) / 8, w1 = 1400 + ((i + 1) * 1400) / 8;
          return <path key={i} d={`M ${960 - w0 / 2} ${y0} L ${960 + w0 / 2} ${y0} L ${960 + w1 / 2} ${y1} L ${960 - w1 / 2} ${y1} Z`} fill={i % 2 ? "#2E8B3E" : "#34994A"} />;
        })}
        <ellipse cx="960" cy="820" rx="420" ry="90" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="5" />
        <line x1="960" y1="600" x2="960" y2="1080" stroke="rgba(255,255,255,0.8)" strokeWidth="5" />
        {/* Floodlight towers. */}
        {[220, 1700].map(x => (
          <g key={x}>
            <rect x={x - 6} y={120} width={12} height={260} fill="#2A3346" />
            <rect x={x - 80} y={80} width={160} height={60} rx={6} fill="#DDE6F5" />
          </g>
        ))}
      </svg>
      {[220, 1700].map(x => (
        <div key={x} style={{ position: "absolute", left: x - 500, top: 110 - 500, width: 1000, height: 1000, borderRadius: "50%", background: "radial-gradient(closest-side, rgba(235,245,255,0.55), rgba(200,220,255,0.12) 45%, transparent)" }} />
      ))}
    </AbsoluteFill>
  );
}

// A diagonal wipe graphic, for transitions like REPLAY.
function Wipe({ t, at, text, colour = RED }) {
  const k = window(t, at, at + 50, 12);
  if (k <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: -200, right: -200, top: 440, height: 170, background: colour,
      transform: `skewY(-6deg) translateX(${lerp(-2200, 0, rise(t, 12, at)) + lerp(0, 2200, rise(t, 12, at + 38))}px)`,
      display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
    }}>
      <div style={{ fontFamily: BEBAS, fontSize: 150, color: WHITE, letterSpacing: 10, transform: "skewY(6deg)" }}>{text}</div>
    </div>
  );
}

// ---------- The puzzle as a team ----------

// A player card: white card with a figure, a kit stripe, and a label.
function Card({ t, at, x, y, w = 250, h = 300, label, kit = NAVY2, children, dim = 0, glow = 0, scale = 1 }) {
  const k = pop(t, at);
  if (k <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 14, background: WHITE,
      transform: `translateY(${(1 - k) * 60}px) scale(${scale})`, opacity: Math.min(1, k * 1.3) * (1 - dim * 0.6),
      boxShadow: glow > 0 ? `0 0 0 ${6 * glow}px ${YELLOW}, 0 0 ${60 * glow}px rgba(255,210,63,0.7)` : "0 14px 40px rgba(0,0,0,0.45)",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 46, background: kit, color: WHITE, fontFamily: BEBAS, fontSize: 36, letterSpacing: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>{label}</div>
      <svg width={w} height={h - 46} viewBox={`${-w / 2} ${-(h - 46) / 2} ${w} ${h - 46}`} style={{ position: "absolute", left: 0, top: 46 }}>{children}</svg>
    </div>
  );
}

// A small checklist under a hopeful's card: one mark per team-sheet line.
function Checks({ t, x, y, w = 230, marks }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", justifyContent: "center", gap: 12 }}>
      {marks.map((m, i) => {
        const k = pop(t, m.at);
        return (
          <div key={i} style={{
            width: 52, height: 52, borderRadius: 26, background: m.ok ? PITCH : RED, color: WHITE,
            fontFamily: SANS, fontWeight: 900, fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${k})`, boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}>{m.ok ? "✓" : "✗"}</div>
        );
      })}
    </div>
  );
}

// The referee's red card, shown to an impostor.
function RedCard({ t, at, x, y }) {
  const k = pop(t, at);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 70, height: 100, background: RED, borderRadius: 8, transform: `rotate(${lerp(-40, 12, k)}deg) scale(${k})`, boxShadow: "0 8px 20px rgba(0,0,0,0.5)", border: "3px solid white" }} />
  );
}

// GOAL! A burst of light, confetti and a banner.
function Goal({ t, at }) {
  const k = window(t, at, at + 75, 8);
  if (k <= 0) return null;
  const e = t - at;
  const bits = Array.from({ length: 70 }, (_, i) => {
    const a = hash(i) * Math.PI * 2, v = 8 + hash(i * 3) * 16;
    const x = 960 + Math.cos(a) * v * e, y = 480 + Math.sin(a) * v * e + 0.35 * e * e;
    return <rect key={i} x={x} y={y} width={14} height={8} fill={[YELLOW, WHITE, RED, "#4FC3F7"][i % 4]} transform={`rotate(${e * 12 + i * 20} ${x} ${y})`} />;
  });
  return (
    <AbsoluteFill style={{ opacity: k, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,230,120,0.45), transparent 60%)" }} />
      <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>{bits}</svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: BEBAS, fontSize: 220, color: YELLOW, letterSpacing: 16, textShadow: "0 8px 0 #A06A00, 0 20px 60px rgba(0,0,0,0.6)", transform: `scale(${lerp(0.6, 1, pop(t, at))})` }}>GOAL!</div>
    </AbsoluteFill>
  );
}

// The telestrator: a hand-drawn yellow circle around a spot.
function Pen({ t, at, x, y, w, h, dur = 18 }) {
  const k = rise(t, dur, at);
  if (k <= 0) return null;
  const rx = w / 2, ry = h / 2;
  const d = `M ${x + rx * 0.3} ${y - ry * 1.02} C ${x + rx * 1.18} ${y - ry * 1.02}, ${x + rx * 1.1} ${y + ry * 1.08}, ${x} ${y + ry} C ${x - rx * 1.12} ${y + ry * 0.95}, ${x - rx * 1.05} ${y - ry * 1.06}, ${x + rx * 0.42} ${y - ry * 0.94}`;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={d} fill="none" stroke={YELLOW} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} style={{ filter: "drop-shadow(0 0 6px rgba(255,210,63,0.8))" }} />
    </svg>
  );
}

// A telestrator arrow from one point to another.
function PenArrow({ t, at, x1, y1, x2, y2 }) {
  const k = rise(t, 16, at);
  if (k <= 0) return null;
  const ex = lerp(x1, x2, k), ey = lerp(y1, y2, k), a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <path d={`M ${x1} ${y1} Q ${(x1 + ex) / 2} ${Math.min(y1, ey) - 80} ${ex} ${ey}`} fill="none" stroke={YELLOW} strokeWidth={8} strokeLinecap="round" />
      {k > 0.95 && <path d={`M ${ex - 30 * Math.cos(a - 0.5)} ${ey - 30 * Math.sin(a - 0.5)} L ${ex} ${ey} L ${ex - 30 * Math.cos(a + 0.5)} ${ey - 30 * Math.sin(a + 0.5)}`} fill="none" stroke={YELLOW} strokeWidth={8} strokeLinecap="round" />}
    </svg>
  );
}

// The team sheet: what the two teammates really share, line by line.
function TeamSheet({ t, x, y, w = 560, title = "TEAM SHEET: THEY SHARE", lines }) {
  const k = rise(t, 16, lines[0]?.at ?? 0);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, opacity: k, transform: `translateY(${(1 - k) * 20}px)`, boxShadow: "0 12px 40px rgba(0,0,0,0.45)" }}>
      <div style={{ background: RED, color: WHITE, fontFamily: BEBAS, fontSize: 36, letterSpacing: 2, padding: "8px 20px 2px" }}>{title}</div>
      <div style={{ background: "rgba(255,255,255,0.97)", padding: "10px 20px" }}>
        {lines.map((l, i) => {
          const a = rise(t, 12, l.at);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, height: 54, opacity: a, transform: `translateX(${(1 - a) * -20}px)` }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: PITCH, color: WHITE, fontFamily: SANS, fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: NAVY }}>{l.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- The matches ----------
const TEAM_X = [120, 400];
const HOPE_X = [800, 1060, 1320, 1580];
const CARD_Y = 190;

// Three small shapes placed around the middle of a big shape.
const trio = (kind, fill, r = 20, spread = 36, outside = false) => {
  const pts = outside ? [[-90, -86], [90, -78], [0, 96]] : [[-spread, -spread * 0.5], [spread, -spread * 0.4], [0, spread * 0.8]];
  return pts.map(([x, y], i) => <Shape key={i} kind={kind} r={r} fill={fill} x={x} y={y} />);
};
const MATCH1 = {
  team: [
    <><Shape kind="circle" r={92} fill="white" />{trio("triangle", "black")}</>,
    <><Shape kind="square" r={92} fill="white" />{trio("circle", "black", 18)}</>,
  ],
  hopefuls: [
    <><Shape kind="triangle" r={96} fill="white" y={10} /><Shape kind="square" r={16} fill="black" x={-22} y={30} /><Shape kind="square" r={16} fill="black" x={22} y={30} /></>,
    <><Shape kind="hexagon" r={92} fill="white" />{trio("star", "black", 20)}</>,
    <><Shape kind="circle" r={92} fill="white" />{trio("triangle", "white")}</>,
    <><Shape kind="square" r={70} fill="white" />{trio("circle", "black", 16, 36, true)}</>,
  ],
};

// A small circle (or other shape) touching the outside edge of a striped shape.
const MATCH2 = {
  team: [
    <><Shape kind="pentagon" r={80} fill="striped" y={14} /><Shape kind="circle" r={22} fill="black" x={0} y={14 - 80 - 22} /></>,
    <><Shape kind="triangle" r={80} fill="striped" y={14} /><Shape kind="square" r={20} fill="black" x={70} y={42} /></>,
  ],
  hopefuls: [
    <><Shape kind="heart" r={86} fill="striped" y={10} /><Shape kind="circle" r={20} fill="black" y={10} /></>,
    <><Shape kind="pentagon" r={80} fill="white" y={14} /><Shape kind="circle" r={22} fill="black" x={0} y={14 - 80 - 22} /></>,
    <><Shape kind="cross" r={80} fill="striped" y={14} /><Shape kind="star" r={22} fill="black" x={0} y={14 - 72 - 26} /></>,
    <><Shape kind="pentagon" r={80} fill="striped" y={24} /><Shape kind="circle" r={22} fill="black" x={0} y={24 - 80 - 62} /></>,
  ],
};

const PENS = {
  team: [
    <Shape kind="hexagon" r={86} fill="grey" line="dotted" />,
    <Shape kind="heart" r={86} fill="black" line="dotted" />,
  ],
  hopefuls: [
    <Shape kind="hexagon" r={86} fill="grey" />,
    <Shape kind="star" r={92} fill="white" line="dotted" />,
    <Shape kind="heart" r={86} fill="black" />,
    <Shape kind="circle" r={86} fill="grey" line="double" />,
  ],
};

// The whole pitch of cards: two teammates and four hopefuls.
function Lineup({ t, match, at = 0, hopeAt = 0, dim = [], glow = [], teamGlow = 0 }) {
  return (
    <>
      <div style={{ position: "absolute", left: TEAM_X[0], top: CARD_Y - 60, width: 530, textAlign: "center", fontFamily: BEBAS, fontSize: 44, color: YELLOW, letterSpacing: 3, opacity: rise(t, 12, at) }}>THE TEAMMATES</div>
      <div style={{ position: "absolute", left: HOPE_X[0], top: CARD_Y - 60, width: 1010, textAlign: "center", fontFamily: BEBAS, fontSize: 44, color: WHITE, letterSpacing: 3, opacity: rise(t, 12, hopeAt) }}>THE HOPEFULS</div>
      {match.team.map((fig, i) => (
        <Card key={i} t={t} at={at + i * 8} x={TEAM_X[i]} y={CARD_Y} label={`TEAMMATE ${i + 1}`} kit={RED} glow={teamGlow}>{fig}</Card>
      ))}
      <div style={{ position: "absolute", left: 690, top: CARD_Y + 60, width: 4, height: 200, background: "rgba(255,255,255,0.35)", opacity: rise(t, 12, hopeAt) }} />
      {match.hopefuls.map((fig, i) => (
        <Card key={i} t={t} at={hopeAt + i * 6} x={HOPE_X[i]} y={CARD_Y} w={230} label={"ABCD"[i]} dim={dim.includes(i) ? 1 : 0} glow={glow.includes(i) ? 1 : 0}>{fig}</Card>
      ))}
    </>
  );
}
const cardCentre = i => ({ x: HOPE_X[i] + 115, y: CARD_Y + 173 });
const teamCentre = i => ({ x: TEAM_X[i] + 125, y: CARD_Y + 173 });

// ---------- The film ----------
export default {
  id: "s2-sports",
  order: 109,
  series: 2,
  title: "Match of the Day: Most Alike",
  frame: "none",
  push: 0.012,
  cast: {
    lewis: { name: "LEWIS", voice: "bm_lewis", speed: 1.06, colour: NAVY2 },
    izzy: { name: "IZZY", voice: "bf_isabella", speed: 1.06, colour: RED },
  },
  music: { src: "music/sports.wav", volume: 0.22, duck: 0.35 },
  Subtitles,
  scenes: [
    // The stadium at night: the show opens.
    {
      beats: [
        { who: "lewis", say: "Good evening, and welcome to Match of the Day. Most Alike!", sfxs: [{ sfx: "sports-crowd", at: 0, volume: 0.6 }, { sfx: "sports-sting", at: 0.1, volume: 0.9 }] },
        { who: "izzy", say: "Tonight: two teammates, four hopefuls, and only one of them really belongs in the team." },
      ],
      render: s => (
        <AbsoluteFill>
          <Stadium t={s.t} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", transform: `scale(${lerp(1.4, 1, rise(s.t, 20, 4))})`, opacity: rise(s.t, 14, 4) }}>
            <div style={{ display: "inline-block", background: WHITE, color: NAVY, fontFamily: BEBAS, fontSize: 150, letterSpacing: 8, padding: "10px 50px 0", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>MATCH OF THE DAY</div>
            <div style={{ fontFamily: BEBAS, fontSize: 96, color: YELLOW, letterSpacing: 18, marginTop: 14, textShadow: "0 6px 30px rgba(0,0,0,0.8)", opacity: rise(s.t, 14, 20) }}>MOST ALIKE</div>
          </div>
        </AbsoluteFill>
      ),
    },

    // The rules, in the studio.
    {
      beats: [
        { who: "lewis", say: "Here's how it works. The two figures on the left are teammates. They're alike in some secret way.", sfxs: [{ sfx: "sports-swoosh", at: 0.1 }] },
        { who: "izzy", say: "Our job is to find the one on the right that's most like them. Not the one that looks a bit similar. The one that shares their secret." },
        { who: "lewis", say: "So we ask: what do the two teammates really share? We write it on the team sheet. Then we check every hopeful against it." },
      ],
      render: s => (
        <AbsoluteFill>
          <Studio t={s.t} />
          <Lineup t={s.t} match={MATCH1} at={s.at(0) + 20} hopeAt={s.at(1) + 10} />
          <TeamSheet t={s.t} x={TEAM_X[0]} y={620} w={530} title="TEAM SHEET: THEY SHARE" lines={[
            { text: "?", at: s.at(2) + s.speech(2) * 0.55 },
            { text: "?", at: s.at(2) + s.speech(2) * 0.6 },
            { text: "?", at: s.at(2) + s.speech(2) * 0.65 },
          ]} />
          <div style={{ position: "absolute", left: HOPE_X[0], top: 620, width: 1010, textAlign: "center", fontFamily: BEBAS, fontSize: 54, color: WHITE, letterSpacing: 3, opacity: rise(s.t, 16, s.at(2) + s.speech(2) * 0.8) }}>
            CHECK EVERY HOPEFUL AGAINST THE SHEET
          </div>
        </AbsoluteFill>
      ),
    },

    // Match one.
    {
      beats: [
        { who: "lewis", say: "Kick off! Teammate one: a big circle, with three little black triangles inside.", sfxs: [{ sfx: "sports-whistle", at: 0.2 }] },
        { who: "izzy", say: "Teammate two: a big square, with three little black circles inside." },
        { who: "lewis", say: "Different big shapes. Different little shapes. So what do they share?" },
        { who: "izzy", say: "Three little shapes. All black. All inside!", sfxs: [{ sfx: "sports-swoosh", at: 0.2, volume: 0.6 }] },
        { who: "lewis", say: "A has only two little shapes. Red card!" },
        { who: "izzy", say: "C looks just like teammate one. But its triangles are white, not black. Off you go!" },
        { who: "lewis", say: "D has three black circles, but they're outside the square. Off!" },
        { who: "izzy", say: "And B. Three little shapes, black, and inside. That's our player!", sfxs: [{ sfx: "sports-cheer", at: 3.0, volume: 0.9 }] },
      ],
      render: s => {
        const sheet = [
          { text: "Three little shapes", at: s.at(3) + s.speech(3) * 0.2 },
          { text: "All black", at: s.at(3) + s.speech(3) * 0.55 },
          { text: "All inside", at: s.at(3) + s.speech(3) * 0.85 },
        ];
        const off = (i, beat, f) => s.at(beat) + s.speech(beat) * f;
        const goalAt = s.at(7) + s.speech(7) * 0.75;
        return (
          <AbsoluteFill>
            <Studio t={s.t} />
            <ScoreBug you={s.t > goalAt ? 1 : 0} traps={s.t > off(2, 5, 0.9) ? 1 : 0} flash={window(s.t, goalAt, goalAt + 30)} />
            <Lineup t={s.t} match={MATCH1} at={4} hopeAt={s.at(2)}
              dim={[s.t > off(0, 4, 0.8) ? 0 : -1, s.t > off(2, 5, 0.9) ? 2 : -1, s.t > off(3, 6, 0.8) ? 3 : -1]}
              glow={s.t > goalAt ? [1] : []} teamGlow={window(s.t, s.at(2), s.at(4)) * 0.6} />
            <Pen t={s.t} at={s.at(0) + s.speech(0) * 0.6} {...teamCentre(0)} w={150} h={120} />
            <Pen t={s.t} at={s.at(1) + s.speech(1) * 0.6} {...teamCentre(1)} w={150} h={120} />
            <TeamSheet t={s.t} x={TEAM_X[0]} y={620} w={530} lines={sheet} />
            <Checks t={s.t} x={HOPE_X[0]} y={610} marks={[{ ok: false, at: off(0, 4, 0.3) }, { ok: true, at: off(0, 4, 0.4) }, { ok: true, at: off(0, 4, 0.5) }]} />
            <RedCard t={s.t} at={off(0, 4, 0.8)} x={HOPE_X[0] + 160} y={CARD_Y - 30} />
            <Pen t={s.t} at={s.at(5) + s.speech(5) * 0.45} x={cardCentre(2).x} y={cardCentre(2).y} w={130} h={110} />
            <Checks t={s.t} x={HOPE_X[2]} y={610} marks={[{ ok: true, at: off(2, 5, 0.3) }, { ok: false, at: off(2, 5, 0.5) }, { ok: true, at: off(2, 5, 0.6) }]} />
            <RedCard t={s.t} at={off(2, 5, 0.9)} x={HOPE_X[2] + 160} y={CARD_Y - 30} />
            <Checks t={s.t} x={HOPE_X[3]} y={610} marks={[{ ok: true, at: off(3, 6, 0.3) }, { ok: true, at: off(3, 6, 0.4) }, { ok: false, at: off(3, 6, 0.6) }]} />
            <RedCard t={s.t} at={off(3, 6, 0.8)} x={HOPE_X[3] + 160} y={CARD_Y - 30} />
            <Checks t={s.t} x={HOPE_X[1]} y={610} marks={[{ ok: true, at: off(1, 7, 0.25) }, { ok: true, at: off(1, 7, 0.35) }, { ok: true, at: off(1, 7, 0.45) }]} />
            <Goal t={s.t} at={goalAt} />
          </AbsoluteFill>
        );
      },
    },

    // The replay: why the lookalike was a trap.
    {
      beats: [
        { who: "lewis", say: "Let's see that again in slow motion.", sfxs: [{ sfx: "sports-swoosh", at: 0.1 }] },
        { who: "izzy", say: "Look at C. Same big circle as teammate one. Same triangles. It looks like a twin!" },
        { who: "lewis", say: "But the team sheet says black, and C's triangles are white. It looks alike, but it doesn't share the secret." },
        { who: "izzy", say: "Don't be fooled by lookalikes. Check the team sheet!" },
      ],
      render: s => (
        <AbsoluteFill>
          <Studio t={s.t} />
          <AbsoluteFill style={{ filter: `saturate(${lerp(1, 0.5, rise(s.t, 20, 20))})` }}>
            <Lineup t={s.t} match={MATCH1} at={-100} hopeAt={-100} dim={[0, 3]} glow={[]} />
          </AbsoluteFill>
          <div style={{ position: "absolute", right: 70, top: 50, fontFamily: BEBAS, fontSize: 48, color: WHITE, background: RED, padding: "4px 18px 0", letterSpacing: 4, opacity: rise(s.t, 10, 20) }}>REPLAY</div>
          <Pen t={s.t} at={s.at(1) + s.speech(1) * 0.25} {...teamCentre(0)} w={180} h={180} />
          <Pen t={s.t} at={s.at(1) + s.speech(1) * 0.35} {...cardCentre(2)} w={170} h={180} />
          <PenArrow t={s.t} at={s.at(1) + s.speech(1) * 0.7} x1={teamCentre(0).x + 60} y1={CARD_Y + 30} x2={cardCentre(2).x - 40} y2={CARD_Y + 30} />
          <div style={{ position: "absolute", left: cardCentre(2).x - 180, top: 620, width: 360, textAlign: "center", fontFamily: BEBAS, fontSize: 60, color: YELLOW, letterSpacing: 2, opacity: rise(s.t, 12, s.at(1) + s.speech(1) * 0.85) }}>
            LOOKS LIKE A TWIN...
          </div>
          <div style={{ position: "absolute", left: cardCentre(2).x - 200, top: 690, width: 400, textAlign: "center", fontFamily: BEBAS, fontSize: 60, color: RED, letterSpacing: 2, opacity: rise(s.t, 12, s.at(2) + s.speech(2) * 0.5), textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
            ...BUT WHITE, NOT BLACK
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: BEBAS, fontSize: 64, color: WHITE, letterSpacing: 4, opacity: rise(s.t, 14, s.at(3)) }}>
            DON'T BE FOOLED BY LOOKALIKES
          </div>
          <Wipe t={s.t} at={0} text="REPLAY" />
        </AbsoluteFill>
      ),
    },

    // Match two: the second half, with two lookalikes.
    {
      beats: [
        { who: "izzy", say: "Second half! Teammate one: a striped pentagon, with a little black circle touching its edge.", sfxs: [{ sfx: "sports-whistle", at: 0.2 }] },
        { who: "lewis", say: "Teammate two: a striped triangle, with a little black square touching its edge." },
        { who: "izzy", say: "Team sheet! A big striped shape. And a little shape, touching the outside edge.", sfxs: [{ sfx: "sports-swoosh", at: 0.3, volume: 0.6 }] },
        { who: "lewis", say: "Careful now. Two of these hopefuls look just like teammate one." },
        { who: "izzy", say: "B is a pentagon with a circle on top. But it isn't striped. Red card!" },
        { who: "lewis", say: "D is a striped pentagon with a circle. But look, there's a gap. They're not touching. Off!" },
        { who: "izzy", say: "A's circle is inside the heart, not touching the edge. Off!" },
        { who: "lewis", say: "Which leaves C. Striped cross, little star, touching the edge. What a player!", sfxs: [{ sfx: "sports-cheer", at: 3.4, volume: 0.9 }] },
      ],
      render: s => {
        const off = (beat, f) => s.at(beat) + s.speech(beat) * f;
        const goalAt = off(7, 0.8);
        return (
          <AbsoluteFill>
            <Studio t={s.t} />
            <ScoreBug you={s.t > goalAt ? 2 : 1} traps={s.t > off(5, 0.9) ? 3 : s.t > off(4, 0.9) ? 2 : 1} flash={window(s.t, goalAt, goalAt + 30)} />
            <Lineup t={s.t} match={MATCH2} at={4} hopeAt={s.at(3)}
              dim={[s.t > off(4, 0.85) ? 1 : -1, s.t > off(5, 0.85) ? 3 : -1, s.t > off(6, 0.85) ? 0 : -1]}
              glow={s.t > goalAt ? [2] : []} />
            <TeamSheet t={s.t} x={TEAM_X[0]} y={620} w={530} lines={[
              { text: "A big striped shape", at: off(2, 0.3) },
              { text: "A little shape", at: off(2, 0.6) },
              { text: "Touching the outside edge", at: off(2, 0.85) },
            ]} />
            <PenArrow t={s.t} at={off(3, 0.5)} x1={teamCentre(0).x} y1={CARD_Y + 20} x2={cardCentre(1).x} y2={CARD_Y + 20} />
            <PenArrow t={s.t} at={off(3, 0.7)} x1={teamCentre(0).x + 40} y1={CARD_Y + 10} x2={cardCentre(3).x} y2={CARD_Y + 20} />
            <Checks t={s.t} x={HOPE_X[1]} y={610} marks={[{ ok: false, at: off(4, 0.55) }, { ok: true, at: off(4, 0.3) }, { ok: true, at: off(4, 0.4) }]} />
            <RedCard t={s.t} at={off(4, 0.85)} x={HOPE_X[1] + 160} y={CARD_Y - 30} />
            <Pen t={s.t} at={off(5, 0.5)} x={cardCentre(3).x} y={cardCentre(3).y - 70} w={80} h={70} />
            <Checks t={s.t} x={HOPE_X[3]} y={610} marks={[{ ok: true, at: off(5, 0.3) }, { ok: true, at: off(5, 0.4) }, { ok: false, at: off(5, 0.6) }]} />
            <RedCard t={s.t} at={off(5, 0.85)} x={HOPE_X[3] + 160} y={CARD_Y - 30} />
            <Checks t={s.t} x={HOPE_X[0]} y={610} marks={[{ ok: true, at: off(6, 0.3) }, { ok: true, at: off(6, 0.4) }, { ok: false, at: off(6, 0.6) }]} />
            <RedCard t={s.t} at={off(6, 0.85)} x={HOPE_X[0] + 160} y={CARD_Y - 30} />
            <Checks t={s.t} x={HOPE_X[2]} y={610} marks={[{ ok: true, at: off(7, 0.3) }, { ok: true, at: off(7, 0.45) }, { ok: true, at: off(7, 0.6) }]} />
            <Goal t={s.t} at={goalAt} />
          </AbsoluteFill>
        );
      },
    },

    // Your turn: penalties.
    {
      beats: [
        { who: "lewis", say: "It's gone to penalties! Your turn at home. What do the two teammates share, and which hopeful has it too? Pause if you need more time.", hold: 6.5,
          sfxs: [{ sfx: "sports-whistle", at: 0.3 }] },
        { who: "izzy", say: "It's B! Both teammates have a dotted outline. Only B has one too.", sfxs: [{ sfx: "sports-cheer", at: 2.2, volume: 0.9 }] },
        { who: "lewis", say: "A looked like a twin of teammate one. But its line is solid. Nothing gets past you!" },
      ],
      render: s => {
        const reveal = s.at(1) + s.speech(1) * 0.35;
        const waiting = s.t >= s.at(0) + s.speech(0) && s.t < s.at(1);
        const left = Math.max(0, 6 - Math.floor((s.t - s.at(0) - s.speech(0)) / 30));
        return (
          <AbsoluteFill>
            <Studio t={s.t} />
            <ScoreBug label="PENALTIES" you={s.t > reveal ? 3 : 2} traps={s.t > s.at(2) + s.speech(2) * 0.5 ? 4 : 3} flash={window(s.t, reveal, reveal + 30)} />
            <Lineup t={s.t} match={PENS} at={10} hopeAt={30} dim={s.t > reveal ? [0, 2, 3] : []} glow={s.t > reveal ? [1] : []} />
            {waiting && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 20, background: "rgba(255,255,255,0.97)", padding: "10px 34px 4px", fontFamily: BEBAS, fontSize: 80, color: NAVY, letterSpacing: 4 }}>
                  YOUR SHOT <span style={{ color: RED, minWidth: 50 }}>{left > 0 ? left : ""}</span>
                </div>
              </div>
            )}
            <TeamSheet t={s.t} x={TEAM_X[0]} y={620} w={530} lines={[{ text: "A dotted outline", at: s.at(1) + s.speech(1) * 0.55 }]} />
            <Pen t={s.t} at={s.at(2) + s.speech(2) * 0.25} {...cardCentre(0)} w={170} h={180} />
            <Goal t={s.t} at={reveal} />
          </AbsoluteFill>
        );
      },
    },

    // Post-match analysis on the tactics board, then goodnight.
    {
      beats: [
        { who: "lewis", say: "Post-match analysis. How do you win at Most Alike?", sfxs: [{ sfx: "sports-swoosh", at: 0.1 }] },
        { who: "izzy", say: "One. Write down what the two teammates really share." },
        { who: "lewis", say: "Two. Check every hopeful against the team sheet." },
        { who: "izzy", say: "Three. Don't be fooled by lookalikes." },
        { who: "lewis", say: "That's all from us. Goodnight!", sfxs: [{ sfx: "sports-sting", at: 1.0, volume: 0.9 }] },
      ],
      tail: 2,
      render: s => {
        const steps = ["WRITE DOWN WHAT THE TWO REALLY SHARE", "CHECK EVERY HOPEFUL AGAINST THE SHEET", "DON'T BE FOOLED BY LOOKALIKES"];
        return (
          <AbsoluteFill>
            <Studio t={s.t} />
            {/* A tactics board: a green chalk pitch. */}
            <div style={{ position: "absolute", left: 260, top: 130, width: 1400, height: 700, background: "linear-gradient(#2A7A38, #236A30)", borderRadius: 18, boxShadow: "0 30px 80px rgba(0,0,0,0.5), inset 0 0 0 10px #1B4F25", opacity: rise(s.t, 16, 4) * (1 - rise(s.t, 14, s.at(4))) }}>
              <svg width="1400" height="700" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
                <rect x="40" y="40" width="1320" height="620" fill="none" stroke="white" strokeWidth="4" />
                <line x1="700" y1="40" x2="700" y2="660" stroke="white" strokeWidth="4" />
                <circle cx="700" cy="350" r="110" fill="none" stroke="white" strokeWidth="4" />
              </svg>
              <div style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center", fontFamily: BEBAS, fontSize: 80, color: YELLOW, letterSpacing: 6 }}>TACTICS</div>
              {steps.map((st, i) => {
                const k = pop(s.t, s.at(i + 1) + 6);
                return (
                  <div key={i} style={{ position: "absolute", left: 120, top: 220 + i * 140, display: "flex", alignItems: "center", gap: 30, opacity: Math.min(1, k), transform: `scale(${lerp(0.8, 1, k)})`, transformOrigin: "left center" }}>
                    <div style={{ width: 90, height: 90, borderRadius: 45, background: WHITE, color: NAVY, fontFamily: BEBAS, fontSize: 70, display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 6 }}>{i + 1}</div>
                    <div style={{ fontFamily: BEBAS, fontSize: 66, color: WHITE, letterSpacing: 3 }}>{st}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", opacity: rise(s.t, 16, s.at(4) + 10) }}>
              <div style={{ display: "inline-block", background: WHITE, color: NAVY, fontFamily: BEBAS, fontSize: 120, letterSpacing: 8, padding: "10px 50px 0", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>MATCH OF THE DAY</div>
              <div style={{ fontFamily: BEBAS, fontSize: 80, color: YELLOW, letterSpacing: 16, marginTop: 10 }}>MOST ALIKE</div>
            </div>
          </AbsoluteFill>
        );
      },
    },
  ],
};
