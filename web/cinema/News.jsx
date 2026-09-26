// The Mega News: a bulletin written fresh from his progress each time it
// opens (server/routes/news.js), played live in a Remotion Player.
import { useEffect, useMemo, useRef, useState } from "react";
import { Player } from "@remotion/player";
import { AbsoluteFill, Audio, Sequence, useCurrentFrame, interpolate } from "remotion";
import { get } from "../api.js";
import { go } from "../App.jsx";
import Icon from "../icons.jsx";
import "./playalong.css";

const FPS = 30;
const LEAD = 70;          // frames of opening titles before the first line
const GAP = 36;           // frames of breath between lines, time to think
const NAVY = "#0E1B3D", RED = "#D7263D", GOLD = "#F2C14E", PAPER = "#F7F4EC";

// Frame timings for every line.
function layout(lines) {
  let f = LEAD;
  return lines.map(l => {
    const start = f;
    const length = Math.round(l.seconds * FPS) + GAP;
    f += length;
    return { ...l, start, length };
  });
}

function NewsComp({ lines, ticker }) {
  const frame = useCurrentFrame();
  const timed = useMemo(() => layout(lines), [lines]);
  const line = timed.findLast(l => frame >= l.start) ?? null;
  const intro = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 30%, #20397A, ${NAVY} 70%)`, fontFamily: "Nunito, sans-serif", overflow: "hidden" }}>
      <Audio src="/video-assets/sfx/news-theme.wav" volume={0.6} />
      {timed.map(l => (
        <Sequence key={l.id} from={l.start} durationInFrames={l.length} layout="none">
          <Audio src={`/video-assets/audio/news/${l.id}.wav`} />
        </Sequence>
      ))}
      <Globe frame={frame} />
      <Anchor frame={frame} talking={line && frame - line.start < line.length - GAP} />
      <Desk />
      <Graphic line={line} frame={frame} />
      <Opening frame={frame} opacity={1 - interpolate(frame, [LEAD - 20, LEAD], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} intro={intro} />
      {line && <LowerThird line={line} frame={frame} />}
      <Ticker items={ticker} frame={frame} />
    </AbsoluteFill>
  );
}

// A slowly spinning wireframe globe behind the desk.
function Globe({ frame }) {
  const spin = frame * 0.6;
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
      <g transform="translate(560 430)">
        <circle r="330" fill="none" stroke="#5B7BD5" strokeWidth="2" />
        {[-60, -30, 0, 30, 60].map(lat => <ellipse key={lat} rx={330 * Math.cos((lat * Math.PI) / 180)} ry={40 * Math.cos((lat * Math.PI) / 180)} cy={330 * Math.sin((lat * Math.PI) / 180)} fill="none" stroke="#5B7BD5" strokeWidth="1.5" />)}
        {Array.from({ length: 6 }, (_, i) => <ellipse key={i} rx={Math.abs(330 * Math.cos(((spin + i * 30) * Math.PI) / 180))} ry="330" fill="none" stroke="#5B7BD5" strokeWidth="1.5" />)}
      </g>
    </svg>
  );
}

// The newsreader: a smart owl in a suit.
function Anchor({ frame, talking }) {
  const blink = frame % 110 < 5 ? 0.15 : 1;
  const beak = talking ? Math.abs(Math.sin(frame / 3)) * 10 : 0;
  return (
    <svg width="600" height="620" viewBox="-300 -380 600 620" style={{ position: "absolute", left: 260, top: 240 }}>
      <path d="M -210 240 Q -200 20 0 0 Q 200 20 210 240 Z" fill="#1C2536" />
      <path d="M -60 10 L 0 150 L 60 10 Z" fill={PAPER} /><path d="M -14 30 L 0 140 L 14 30 Z" fill={RED} />
      <ellipse cx="0" cy="-140" rx="150" ry="140" fill="#8A6A4A" />
      <path d="M -120 -250 L -80 -190 L -140 -200 Z M 120 -250 L 80 -190 L 140 -200 Z" fill="#6E5236" />
      <ellipse cx="0" cy="-110" rx="95" ry="85" fill="#E8D5B5" />
      {[-48, 48].map(x => <g key={x}><circle cx={x} cy="-150" r="42" fill="#FFF" /><circle cx={x} cy="-150" r={20 * blink} fill="#1B1B1B" /><circle cx={x} cy="-150" r="42" fill="none" stroke="#3B2B1B" strokeWidth="6" /></g>)}
      <line x1="-6" y1="-150" x2="6" y2="-150" stroke="#3B2B1B" strokeWidth="6" />
      <path d={`M -16 -100 L 0 ${-66 + beak} L 16 -100 Z`} fill="#E3A33B" />
    </svg>
  );
}

function Desk() {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 760, height: 200, background: "linear-gradient(#1A2C62, #0B1533)", borderTop: `6px solid ${GOLD}` }}>
      <div style={{ position: "absolute", left: 250, top: 40, fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 64, color: PAPER, letterSpacing: 2 }}>
        MEGA <span style={{ color: RED }}>NEWS</span>
      </div>
    </div>
  );
}

// Big opening titles over the theme.
function Opening({ frame, opacity, intro }) {
  if (opacity <= 0) return null;
  return (
    <AbsoluteFill style={{ background: NAVY, opacity, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 180, color: PAPER, transform: `scale(${0.8 + 0.2 * intro})`, letterSpacing: 4 }}>
        MEGA <span style={{ color: RED }}>NEWS</span>
      </div>
      <div style={{ height: 8, width: 900 * intro, background: GOLD, marginTop: 10 }} />
    </AbsoluteFill>
  );
}

// The right-hand graphic for each story.
function Graphic({ line, frame }) {
  if (!line || line.kind === "open" || line.kind === "close") return null;
  const k = interpolate(frame - line.start, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const box = { position: "absolute", left: 1060, top: 130, width: 720, height: 470, background: "rgba(10,20,50,0.85)", border: `4px solid ${GOLD}`, borderRadius: 16, transform: `translateX(${(1 - k) * 80}px)`, opacity: k, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: PAPER, textAlign: "center", padding: 40 };
  const label = { headline: "BREAKING", story: "TODAY", weather: "WEATHER", puzzle: "PUZZLE OF THE DAY", answer: "THE ANSWER" }[line.kind];
  return (
    <div style={box}>
      <div style={{ fontWeight: 900, fontSize: 36, color: line.kind === "headline" ? RED : GOLD, letterSpacing: 3 }}>{label}</div>
      {typeof line.figure === "number" && <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 240, lineHeight: 1 }}>{line.figure}</div>}
      {typeof line.figure === "string" && <div style={{ fontFamily: "Fraunces, serif", fontSize: 120, textTransform: "capitalize" }}>{line.figure}</div>}
      {(line.kind === "puzzle" || line.kind === "answer") && <div style={{ fontFamily: "Fraunces, serif", fontSize: 44, lineHeight: 1.3, marginTop: 20 }}>{line.text.replace(/^Time for the puzzle of the day\. |^The answer: /, "")}</div>}
    </div>
  );
}

// The caption strip that follows the newsreader's words.
function LowerThird({ line, frame }) {
  const words = line.text.split(" ");
  const into = (frame - line.start) / (line.length - GAP);
  const spoken = Math.floor(words.length * Math.min(1, into * 1.02));
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 640, background: PAPER, borderLeft: `14px solid ${RED}`, padding: "14px 28px", fontSize: 38, fontWeight: 700, color: NAVY, lineHeight: 1.25 }}>
      {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.35 }}>{w} </span>)}
    </div>
  );
}

// The scrolling ticker of his records.
function Ticker({ items, frame }) {
  const text = items.join("   •   ");
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 70, background: RED, display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ background: NAVY, color: GOLD, fontWeight: 900, fontSize: 30, padding: "0 26px", height: "100%", display: "flex", alignItems: "center", zIndex: 1 }}>LIVE</div>
      <div style={{ whiteSpace: "nowrap", fontWeight: 800, fontSize: 32, color: "#FFF", transform: `translateX(${1900 - ((frame * 4) % (text.length * 19 + 1900))}px)` }}>{text}</div>
    </div>
  );
}

export default function News({ sub = [] }) {
  const [news, setNews] = useState(null);
  const [error, setError] = useState(null);
  // #/news/play starts straight away (handy for checking).
  const [started, setStarted] = useState(sub[0] === "play" || sub[0] === "frame");
  // #/news/frame/600 opens paused on that frame (for checking the pictures).
  const stillAt = sub[0] === "frame" ? Number(sub[1]) : null;
  const boxRef = useRef(null);
  const [width, setWidth] = useState(960);
  useEffect(() => { get("/api/news").then(setNews, setError); }, []);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [started]);

  const total = news ? layout(news.lines).reduce((f, l) => Math.max(f, l.start + l.length), 0) + 60 : 1;
  return (
    <div className="playalong">
      <button className="home-link playalong-back" onClick={() => go("watch")}><Icon name="back" />Film library</button>
      <div className="playalong-stage" ref={boxRef}>
        {error && <div className="playalong-poster"><span className="playalong-hint">The newsroom couldn't write tonight's bulletin: {error.message}</span></div>}
        {!error && !started && (
          <button className="playalong-poster" disabled={!news} onClick={() => setStarted(true)}>
            <span className="playalong-kicker">Your own news bulletin</span>
            <span className="playalong-title">The Mega News</span>
            <span className="playalong-hint">{news ? "Written tonight, all about you." : "Our reporters are writing tonight's bulletin…"}</span>
            {news && <span className="btn gold playalong-begin"><Icon name="play" />Watch</span>}
          </button>
        )}
        {started && news && (
          <Player component={NewsComp} inputProps={{ lines: news.lines, ticker: news.ticker }} durationInFrames={total}
            compositionWidth={1920} compositionHeight={1080} fps={FPS} autoPlay={stillAt === null} initialFrame={stillAt ?? 0} controls numberOfSharedAudioTags={16}
            style={{ position: "absolute", left: 0, top: 0, width, height: (width * 9) / 16 }} acknowledgeRemotionLicense />
        )}
      </div>
    </div>
  );
}
