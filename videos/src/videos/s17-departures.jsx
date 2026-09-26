// Series 17, film 1: "Departures: Name That Question". A recognition drill.
// A grand Victorian station at night. Each train pulls in carrying a small
// question on its side; a station clock sweeps for three seconds while you
// name the type; then the split-flap board clatters over to the answer.
import React from "react";
import { AbsoluteFill } from "remotion";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import { rise, pop, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";
import { SERIF, SANS } from "../lib/theme.js";
import DURATIONS from "../lib/durations.js";

const { fontFamily: FLAP } = loadOswald("normal", { weights: ["500", "600"], subsets: ["latin"] });
const { fontFamily: GILT } = loadCinzel("normal", { weights: ["700"], subsets: ["latin"] });

const ID = "s17-departures";
const GOLD = "#D9B25A";
const YELLOW = "#FFC933";
const CREAM = "#F2EBD8";
const INK = "#1D1D1F";
const MAROON = "#5E1A22";
const ENAMEL = "#173A86";

const hash = n => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const clamp01 = x => Math.max(0, Math.min(1, x));

// Seconds of speech for a beat: the voiced length once it exists, otherwise
// the same estimate the timeline uses, so the preview still lines up.
function speechSeconds(si, bi, text) {
  const s = DURATIONS[ID]?.[`s${si}b${bi}`];
  return typeof s === "number" ? s : text.split(/\s+/).length / 2.6;
}

// ---------- The questions on the trains (all freshly drawn) ----------

const Box = ({ x, y, s, h = s, q, dashed, fill = "#FFFFFF" }) => (
  <g>
    <rect x={x} y={y} width={s} height={h} rx={4} fill={fill} stroke={INK} strokeWidth={3} strokeDasharray={dashed ? "10 7" : undefined} />
    {q && <text x={x + s / 2} y={y + h / 2 + 22} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={s * 0.5} fill={INK}>?</text>}
  </g>
);
const Letter = ({ x, y, t }) => <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={28} fill="#555">{t}</text>;
const Arrow = ({ x1, x2, y }) => (
  <g stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round"><line x1={x1} y1={y} x2={x2} y2={y} /><path d={`M ${x2 - 12} ${y - 10} L ${x2} ${y} L ${x2 - 12} ${y + 10}`} /></g>
);
// A pulsing amber ring the porter points at during his tips.
const Hint = ({ x, y, w, h, k }) => k > 0 && (
  <rect x={x} y={y} width={w} height={h} rx={14} fill="rgba(255,190,40,0.14)" stroke="#E89B00" strokeWidth={6} strokeDasharray="16 10" opacity={k} />
);
// Rows of option boxes with a small letter under each.
function Options({ x, y, s, gap, shapes, letters = "abcde" }) {
  return shapes.map((sh, i) => (
    <g key={i}>
      <Box x={x + i * (s + gap)} y={y} s={s} />
      {sh && <Shape {...sh} x={x + i * (s + gap) + s / 2} y={y + s / 2} />}
      <Letter x={x + i * (s + gap) + s / 2} y={y + s + 32} t={letters[i]} />
    </g>
  ));
}
// Plain HTML text laid into the card.
const Html = ({ x, y, w, h, children, style }) => (
  <foreignObject x={x} y={y} width={w} height={h}>
    <div style={{ width: w, height: h, fontFamily: SANS, color: INK, ...style }}>{children}</div>
  </foreignObject>
);
const Chip = ({ children, dim, style }) => (
  <span style={{ display: "inline-block", border: `3px solid ${INK}`, borderRadius: 10, padding: "4px 18px", background: dim ? "#FFF" : "#FFF7DD", fontWeight: 800, ...style }}>{children}</span>
);

// Scales for the balancing puzzles: a post, a beam and two hanging pans,
// with whatever is weighed sitting in the pans.
function Scale({ cx, top, half, left, right }) {
  const rim = top + 100;
  return (
    <g>
      <path d={`M ${cx - 55} ${top + 200} L ${cx + 55} ${top + 200} L ${cx} ${top + 8} Z`} fill="#CFC4A8" stroke={INK} strokeWidth={3} />
      <line x1={cx - half} y1={top} x2={cx + half} y2={top} stroke={INK} strokeWidth={7} strokeLinecap="round" />
      <circle cx={cx} cy={top} r={9} fill={INK} />
      {[[cx - half, left], [cx + half, right]].map(([x, load]) => (
        <g key={x}>
          <line x1={x} y1={top} x2={x - 78} y2={rim} stroke={INK} strokeWidth={2} />
          <line x1={x} y1={top} x2={x + 78} y2={rim} stroke={INK} strokeWidth={2} />
          <g transform={`translate(${x} ${rim - 4})`}>{load}</g>
          <path d={`M ${x - 82} ${rim} Q ${x} ${rim + 42} ${x + 82} ${rim} Z`} fill="#FFF" stroke={INK} strokeWidth={3} />
        </g>
      ))}
    </g>
  );
}

// A sum on a card, sitting in a pan.
const Weight = ({ text }) => (
  <g>
    <rect x={-92} y={-66} width={184} height={66} rx={10} fill="#FFF7DD" stroke={INK} strokeWidth={3} />
    <text textAnchor="middle" y={-14} fontFamily={SANS} fontWeight={800} fontSize={48} fill={INK}>{text}</text>
  </g>
);

const CARDS = {
  oddShapes: () => (
    <Options x={70} y={75} s={150} gap={32} shapes={[
      { kind: "star", r: 52, fill: "white" },
      { kind: "star", r: 48, fill: "grey", rot: 18 },
      { kind: "star", r: 55, fill: "striped", rot: -12 },
      { kind: "star", r: 52, fill: "white", points: 6 },
      { kind: "star", r: 46, fill: "black", rot: 30 },
    ]} />
  ),
  analogyShapes: () => (
    <g>
      <Box x={30} y={95} s={130} /><Shape kind="triangle" r={44} fill="white" x={95} y={160} />
      <Arrow x1={172} x2={210} y={160} />
      <Box x={222} y={95} s={130} /><Shape kind="triangle" r={44} fill="black" rot={180} x={287} y={160} />
      <text x={390} y={178} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={54} fill={INK}>::</text>
      <Box x={425} y={95} s={130} /><Shape kind="pentagon" r={46} fill="white" x={490} y={160} />
      <Arrow x1={567} x2={605} y={160} />
      <Box x={617} y={95} s={130} q />
      <line x1={775} y1={50} x2={775} y2={290} stroke="#AAA" strokeWidth={3} />
      <Options x={795} y={125} s={60} gap={10} letters="abc" shapes={[
        { kind: "pentagon", r: 22, fill: "black", rot: 180 },
        { kind: "pentagon", r: 22, fill: "black" },
        { kind: "pentagon", r: 22, fill: "grey", rot: 180 },
      ]} />
    </g>
  ),
  codeShapes: () => {
    const items = [["circle", "striped", "AX"], ["square", "striped", "BX"], ["circle", "grey", "AY"], ["square", "grey", null]];
    return (
      <g>
        {items.map(([kind, fill, code], i) => (
          <g key={i}>
            <Box x={30 + i * 150} y={50} s={125} />
            <Shape kind={kind} r={44} fill={fill} x={92 + i * 150} y={112} />
            <text x={92 + i * 150} y={228} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={40} letterSpacing={4} fill={code ? INK : "#C0392B"}>{code ?? "?"}</text>
          </g>
        ))}
        <line x1={640} y1={50} x2={640} y2={290} stroke="#AAA" strokeWidth={3} />
        {["BY", "AY", "BX", "CY"].map((c, i) => (
          <g key={c}>
            <rect x={668 + i * 80} y={110} width={66} height={56} rx={6} fill="#FFF" stroke={INK} strokeWidth={3} />
            <text x={701 + i * 80} y={150} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={30} fill={INK}>{c}</text>
            <Letter x={701 + i * 80} y={205} t={"abcd"[i]} />
          </g>
        ))}
      </g>
    );
  },
  seqArrows: () => (
    <g>
      {[0, 45, 90, 135].map((rot, i) => (
        <g key={i}><Box x={165 + i * 138} y={22} s={120} /><Shape kind="arrow" r={44} fill="white" rot={rot} x={225 + i * 138} y={82} /></g>
      ))}
      <Box x={165 + 4 * 138} y={22} s={120} q dashed />
      <Options x={275} y={185} s={90} gap={30} letters="abcd" shapes={[
        { kind: "arrow", r: 32, fill: "white", rot: 270 },
        { kind: "arrow", r: 32, fill: "white", rot: 180 },
        { kind: "arrow", r: 32, fill: "black", rot: 180 },
        { kind: "arrow", r: 32, fill: "white", rot: 0 },
      ]} />
    </g>
  ),
  grid3: () => {
    const kinds = ["circle", "square", "triangle"], fills = ["white", "grey", "black"];
    return (
      <g>
        {kinds.map((k, r) => fills.map((f, c) => (
          <g key={`${r}${c}`}>
            <rect x={70 + c * 92} y={32 + r * 92} width={92} height={92} fill="#FFF" stroke={INK} strokeWidth={3} />
            {r === 2 && c === 2
              ? <text x={70 + c * 92 + 46} y={32 + r * 92 + 66} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={52} fill={INK}>?</text>
              : <Shape kind={k} r={30} fill={f} x={70 + c * 92 + 46} y={32 + r * 92 + 46} />}
          </g>
        )))}
        <line x1={400} y1={50} x2={400} y2={290} stroke="#AAA" strokeWidth={3} />
        <Options x={440} y={100} s={110} gap={24} letters="abcd" shapes={[
          { kind: "triangle", r: 36, fill: "grey" },
          { kind: "triangle", r: 36, fill: "black" },
          { kind: "square", r: 36, fill: "black" },
          { kind: "triangle", r: 36, fill: "striped" },
        ]} />
      </g>
    );
  },
  swap1: () => (
    <Html x={40} y={70} w={920} h={220} style={{ fontSize: 62, fontWeight: 800, textAlign: "center", lineHeight: 1.35 }}>
      The bread buttered the girl<br />before breakfast.
    </Html>
  ),
  balance1: () => (
    <Scale cx={500} top={70} half={260}
      left={<Weight text="6 × 4" />} right={<Weight text="30 − ?" />} />
  ),
  sim1: hl => (
    <g>
      <rect x={25} y={70} width={290} height={170} rx={10} fill="#FFF7DD" stroke={INK} strokeWidth={4} />
      <Shape kind="triangle" r={52} fill="white" inside="circle" x={100} y={158} />
      <Shape kind="hexagon" r={52} fill="white" inside="circle" x={240} y={155} />
      <Options x={350} y={100} s={110} gap={16} shapes={[
        { kind: "square", r: 40, fill: "white", inside: "circle" },
        { kind: "square", r: 40, fill: "white", inside: "square" },
        { kind: "circle", r: 40, fill: "white" },
        { kind: "pentagon", r: 40, fill: "white", inside: "triangle" },
        { kind: "star", r: 42, fill: "grey" },
      ]} />
      <Hint x={12} y={57} w={316} h={196} k={hl} />
    </g>
  ),
  quote1: hl => (
    <g>
      <Html x={24} y={40} w={470} h={260} style={{ fontFamily: SERIF, fontSize: 31, lineHeight: 1.6, color: "#2A2A2A" }}>
        {[["1", "The snow was deep and the"], ["2", <>wind was cruel. Mia <span style={{ background: `rgba(255,190,40,${0.55 * hl})`, borderRadius: 6, padding: "0 4px", textDecoration: "underline" }}>trudged</span></>], ["3", "up the hill, her boots heavy"], ["4", "with ice."]].map(([n, t]) => (
          <div key={n}><span style={{ fontFamily: SANS, fontSize: 18, color: "#999", display: "inline-block", width: 26 }}>{n}</span>{t}</div>
        ))}
      </Html>
      <line x1={505} y1={40} x2={505} y2={300} stroke="#AAA" strokeWidth={3} />
      <Html x={528} y={30} w={456} h={300} style={{ fontSize: 31, fontWeight: 800, lineHeight: 1.3 }}>
        <div>In line 2, what does the word “trudged” tell you about how Mia walked?</div>
        <div style={{ fontSize: 27, fontWeight: 700, marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", color: "#333" }}>
          <span>A quickly</span><span>B with effort</span><span>C on tiptoe</span><span>D happily</span>
        </div>
      </Html>
    </g>
  ),
  seqDots: () => {
    const dots = (n, cx, cy, fill) => Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rr = n === 1 ? 0 : 28;
      return <circle key={i} cx={cx + rr * Math.cos(a)} cy={cy + rr * Math.sin(a)} r={11} fill={fill} stroke={INK} strokeWidth={3} />;
    });
    return (
      <g>
        {[1, 2, 3, 4].map((n, i) => <g key={i}><Box x={165 + i * 138} y={22} s={120} />{dots(n, 225 + i * 138, 82, i % 2 ? "#FFF" : INK)}</g>)}
        <Box x={165 + 4 * 138} y={22} s={120} q dashed />
        {[[5, INK], [5, "#FFF"], [6, INK], [4, INK]].map(([n, f], i) => (
          <g key={i}><Box x={275 + i * 120} y={185} s={90} />{dots(n, 320 + i * 120, 230, f).map(d => React.cloneElement(d, { r: 8, cx: 320 + i * 120 + (d.props.cx - (320 + i * 120)) * 0.75, cy: 230 + (d.props.cy - 230) * 0.75 }))}<Letter x={320 + i * 120} y={307} t={"abcd"[i]} /></g>
        ))}
      </g>
    );
  },
  grid2: hl => (
    <g>
      {[["circle", 48, "white"], ["circle", 26, "white"], ["square", 48, "grey"], null].map((c, i) => {
        const x = 90 + (i % 2) * 130, y = 40 + Math.floor(i / 2) * 130;
        return (
          <g key={i}>
            <rect x={x} y={y} width={130} height={130} fill="#FFF" stroke={INK} strokeWidth={3} />
            {c ? <Shape kind={c[0]} r={c[1]} fill={c[2]} x={x + 65} y={y + 65} />
              : <text x={x + 65} y={y + 88} textAnchor="middle" fontFamily={SANS} fontWeight={800} fontSize={64} fill={INK}>?</text>}
          </g>
        );
      })}
      <line x1={400} y1={50} x2={400} y2={290} stroke="#AAA" strokeWidth={3} />
      <Options x={440} y={100} s={110} gap={24} letters="abcd" shapes={[
        { kind: "square", r: 38, fill: "grey" },
        { kind: "circle", r: 20, fill: "grey" },
        { kind: "square", r: 20, fill: "white" },
        { kind: "square", r: 20, fill: "grey" },
      ]} />
      <Hint x={74} y={24} w={292} h={292} k={hl} />
    </g>
  ),
  analogyWords: () => (
    <Html x={30} y={55} w={940} h={260} style={{ fontSize: 56, textAlign: "center", lineHeight: 1.6 }}>
      <div><Chip>bird</Chip> <i style={{ fontWeight: 600, color: "#666" }}>is to</i> <Chip>nest</Chip> <i style={{ fontWeight: 600, color: "#666" }}>as</i> <Chip>bee</Chip> <i style={{ fontWeight: 600, color: "#666" }}>is to</i> <Chip dim style={{ color: "#C0392B" }}>?</Chip></div>
      <div style={{ marginTop: 22, fontSize: 46 }}>( <Chip dim>honey</Chip> <Chip dim>hive</Chip> <Chip dim>sting</Chip> )</div>
    </Html>
  ),
  oddWords: () => (
    <Html x={10} y={100} w={980} h={200} style={{ fontSize: 52, display: "flex", justifyContent: "space-around", textAlign: "center" }}>
      {["apple", "pear", "carrot", "plum", "cherry"].map((w, i) => (
        <div key={w}><Chip dim>{w}</Chip><div style={{ fontSize: 28, color: "#555", fontWeight: 800, marginTop: 12 }}>{"abcde"[i]}</div></div>
      ))}
    </Html>
  ),
  sim2: () => (
    <g>
      <rect x={25} y={70} width={290} height={170} rx={10} fill="#FFF7DD" stroke={INK} strokeWidth={4} />
      <Shape kind="circle" r={50} fill="white" line="double" x={100} y={155} />
      <Shape kind="diamond" r={58} fill="white" line="double" x={240} y={155} />
      <Options x={350} y={100} s={110} gap={16} shapes={[
        { kind: "star", r: 44, fill: "white" },
        { kind: "square", r: 40, fill: "white", line: "dashed" },
        { kind: "star", r: 44, fill: "white", line: "double" },
        { kind: "circle", r: 40, fill: "grey" },
        { kind: "triangle", r: 40, fill: "white", line: "dotted" },
      ]} />
    </g>
  ),
  codeWords: () => (
    <Html x={30} y={22} w={940} h={310} style={{ fontSize: 66, fontWeight: 800, textAlign: "center", lineHeight: 1.35, letterSpacing: 6 }}>
      <div>MAP <span style={{ color: "#888" }}>→</span> NBQ</div>
      <div>SUN <span style={{ color: "#888" }}>→</span> <span style={{ color: "#C0392B" }}>?</span></div>
      <div style={{ fontSize: 42, marginTop: 12, letterSpacing: 3 }}><Chip dim>TVO</Chip> <Chip dim>RTM</Chip> <Chip dim>TUO</Chip> <Chip dim>SVO</Chip></div>
    </Html>
  ),
  evidence: () => (
    <g>
      <Html x={24} y={40} w={470} h={260} style={{ fontFamily: SERIF, fontSize: 31, lineHeight: 1.6, color: "#2A2A2A" }}>
        The fox had not eaten for two days. It crept from bin to bin, sniffing, and licked its lips at the smell of chips.
      </Html>
      <line x1={505} y1={40} x2={505} y2={300} stroke="#AAA" strokeWidth={3} />
      <Html x={528} y={36} w={456} h={290} style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.3 }}>
        Find and copy a phrase that shows the fox was hungry.
        <div style={{ borderBottom: "3px dotted #888", height: 58 }} />
        <div style={{ borderBottom: "3px dotted #888", height: 58 }} />
      </Html>
    </g>
  ),
  swap2: () => (
    <Html x={40} y={70} w={920} h={220} style={{ fontSize: 62, fontWeight: 800, textAlign: "center", lineHeight: 1.35 }}>
      We ate a picnic on our<br />sandwiches by the river.
    </Html>
  ),
  balance2: () => {
    const tri = x => <Shape kind="triangle" r={22} fill="black" x={x} y={-22} />;
    const circ = x => <Shape kind="circle" r={18} fill="white" x={x} y={-18} />;
    return (
      <g>
        <Scale cx={250} top={70} half={140} left={<>{tri(-24)}{tri(24)}</>} right={circ(0)} />
        <Scale cx={750} top={70} half={140} left={<>{circ(-40)}{circ(0)}{circ(40)}</>}
          right={<text textAnchor="middle" y={-6} fontFamily={SANS} fontWeight={800} fontSize={50} fill="#C0392B">?</text>} />
        <line x1={500} y1={40} x2={500} y2={300} stroke="#AAA" strokeWidth={3} />
      </g>
    );
  },
};

// ---------- The timetable ----------
const PORTER_TIP = (say, sign) => ({ say, sign });
const ARRIVALS = [
  { q: "ODD ONE OUT", say: "An odd one out!", plat: 1, hold: 3.0, card: "oddShapes", call: "Our first question is now arriving at platform one. What type of question is it?" },
  { q: "ANALOGY", say: "An analogy!", plat: 4, hold: 2.9, card: "analogyShapes", call: "The next question, arriving at platform four, is..." },
  { q: "CODES", say: "Codes!", plat: 7, hold: 2.9, card: "codeShapes", call: "Now arriving at platform seven..." },
  { q: "SEQUENCE", say: "A sequence!", plat: 2, hold: 2.8, card: "seqArrows", call: "Platform two. The next question is..." },
  { q: "GRID", say: "A grid!", plat: 9, hold: 2.8, card: "grid3", call: "Arriving at platform nine..." },
  { q: "SWAPPED WORDS", say: "Swapped words!", plat: 3, hold: 2.7, card: "swap1", call: "Platform three, please..." },
  { q: "BALANCING", say: "A balancing puzzle!", plat: 11, hold: 2.6, card: "balance1", call: "Now approaching platform eleven..." },
  { q: "SIMILARITIES", say: "Similarities!", plat: 5, hold: 2.5, card: "sim1", call: "Platform five. Careful now...",
    tip: PORTER_TIP("Careful! Two shapes set apart at the start means similarities. Find the one most like them.", ["TWO SET APART?", "SIMILARITIES"]) },
  { q: "QUOTED WORDS", say: "Quoted words!", plat: 8, hold: 2.5, card: "quote1", call: "Platform eight...",
    tip: PORTER_TIP("Words in quotes? Find them in the story first, then read the lines around them.", ["WORDS IN QUOTES?", "FIND THEM FIRST"]) },
  { q: "SEQUENCE", say: "A sequence!", plat: 6, hold: 2.4, card: "seqDots", call: "Platform six..." },
  { q: "GRID", say: "A grid!", plat: 10, hold: 2.4, card: "grid2", call: "Platform ten. Look closely...",
    tip: PORTER_TIP("Tricky! A sequence runs along one line. A grid has rows and columns, so check across and down.", ["ROWS AND COLUMNS?", "IT'S A GRID"]) },
  { q: "ANALOGY", say: "An analogy!", plat: 1, hold: 2.2, card: "analogyWords", call: "Platform one..." },
  { q: "ODD ONE OUT", say: "An odd one out!", plat: 12, hold: 2.0, card: "oddWords", call: "Platform twelve!" },
  { q: "SIMILARITIES", say: "Similarities!", plat: 4, hold: 2.0, card: "sim2", call: "Platform four!" },
  { q: "CODES", say: "Codes!", plat: 2, hold: 2.0, card: "codeWords", call: "Platform two!" },
  { q: "FIND EVIDENCE", say: "Find the evidence!", plat: 7, hold: 2.0, card: "evidence", call: "Platform seven!" },
  { q: "SWAPPED WORDS", say: "Swapped words!", plat: 3, hold: 2.0, card: "swap2", call: "Platform three!" },
  { q: "BALANCING", say: "A balancing puzzle!", plat: 9, hold: 2.2, card: "balance2", call: "And the last question of the night, at platform nine!" },
];
const TOTAL = ARRIVALS.length;
const TYPES = ["ODD ONE OUT", "ANALOGY", "SIMILARITIES", "CODES", "SEQUENCE", "GRID", "SWAPPED WORDS", "BALANCING", "QUOTED WORDS", "FIND EVIDENCE"];

// ---------- The split-flap board ----------
const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:-?!'.";
const CELL_W = 58, CELL_H = 82, CELL_GAP = 6, COL_GAP = 34;
const ROW_Y = [202, 294, 386];
const cellX = c => 92 + c * (CELL_W + CELL_GAP) + (c >= 5 ? COL_GAP : 0) + (c >= 19 ? COL_GAP : 0);

const clockTime = k => { const m = 19 * 60 + 4 * k; return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`; };
function row(time, q, plat) {
  const r = time.padEnd(5) + q.padEnd(14) + String(plat).padStart(2);
  if (r.length !== 21) throw new Error(`Board row too long: "${r}"`);
  return r;
}
const BLANK = row("", "", "");
const WELCOME = [row("19:00", "WELCOME TO", ""), row("", "NAME THAT", ""), row("", "QUESTION", "")];
const GOODNIGHT = [row(clockTime(TOTAL + 1), "ALL QUESTIONS", ""), row("", "HAVE ARRIVED", ""), row("", "GOODNIGHT!", "")];
const arrivalRow = (k, shown) => k < 1 ? BLANK : row(clockTime(k), shown ? ARRIVALS[k - 1].q : "", ARRIVALS[k - 1].plat);
const startRows = k => [arrivalRow(k, false), arrivalRow(k - 1, true), arrivalRow(k - 2, true)];
const endRows = k => k === 0 ? WELCOME : k > TOTAL ? GOODNIGHT : [arrivalRow(k, true), arrivalRow(k - 1, true), arrivalRow(k - 2, true)];

// Which characters a cell shows at time t, flipping from `from` to `to`
// through the drum of letters, one flap every `per` frames.
function flapAt(from, to, t, start, per, maxFlips, seed) {
  const L = CHARS.length;
  const fi = CHARS.indexOf(from), ti = CHARS.indexOf(to);
  if (fi < 0 || ti < 0) throw new Error(`No flap for "${from}" or "${to}"`);
  const dist = (ti - fi + L) % L;
  if (dist === 0 || t < start) return { a: from, b: from, p: 0 };
  const flips = Math.max(1, Math.min(dist, maxFlips - Math.floor(hash(seed) * 4)));
  const seq = j => (j === 0 ? from : CHARS[(ti - flips + j + L) % L]);
  const e = t - start;
  const j = Math.floor(e / per);
  if (j >= flips) return { a: to, b: to, p: 0 };
  return { a: seq(j), b: seq(j + 1), p: (e - j * per) / per };
}

const Glyph = ({ ch, color, top }) => (
  <div style={{ position: "absolute", left: 0, width: CELL_W, height: CELL_H, top: top ? 0 : -CELL_H / 2, display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: FLAP, fontWeight: 600, fontSize: 64, color, lineHeight: 1 }}>{ch}</div>
);
function Half({ ch, color, top, style }) {
  return (
    <div style={{ position: "absolute", left: 0, top: top ? 0 : CELL_H / 2, width: CELL_W, height: CELL_H / 2, overflow: "hidden",
      background: top ? "linear-gradient(#262626, #1B1B1B)" : "linear-gradient(#171717, #0F0F0F)", borderRadius: top ? "5px 5px 0 0" : "0 0 5px 5px", ...style }}>
      <Glyph ch={ch} color={color} top={top} />
    </div>
  );
}
function Cell({ x, y, a, b, p, color }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: CELL_W, height: CELL_H, boxShadow: "0 3px 6px rgba(0,0,0,0.7)" }}>
      <Half ch={b} color={color} top />
      <Half ch={a} color={color} />
      {p > 0 && p < 0.5 && <Half ch={a} color={color} top style={{ transform: `scaleY(${1 - 2 * p})`, transformOrigin: "50% 100%", filter: `brightness(${1 - p})` }} />}
      {p >= 0.5 && <Half ch={b} color={color} style={{ transform: `scaleY(${2 * p - 1})`, transformOrigin: "50% 0%", filter: `brightness(${0.5 + p / 2})` }} />}
      <div style={{ position: "absolute", left: 0, right: 0, top: CELL_H / 2 - 1, height: 2, background: "#050505" }} />
      <div style={{ position: "absolute", left: -3, top: CELL_H / 2 - 5, width: 4, height: 10, background: "#3A3A3A", borderRadius: 2 }} />
      <div style={{ position: "absolute", right: -3, top: CELL_H / 2 - 5, width: 4, height: 10, background: "#3A3A3A", borderRadius: 2 }} />
    </div>
  );
}

// The board's changes during one scene: rows it moves to, and when.
function boardEvents(scene, t) {
  const k = scene.index;
  const at = i => scene.beats[i].start - scene.start;
  const before = k === 0 ? [BLANK, BLANK, BLANK] : endRows(k - 1);
  if (k === 0) return [{ at: at(1), from: before, to: WELCOME, per: 3, max: 12 }];
  if (k > TOTAL) return [{ at: 8, from: before, to: GOODNIGHT, per: 3, max: 12 }];
  const events = [{ at: 4, from: before, to: startRows(k), per: 2, max: 9 }];
  if (t >= at(1)) events.push({ at: at(1), from: startRows(k), to: endRows(k), per: 2, max: 8, reveal: true });
  return events;
}

function Board({ scene, t }) {
  const events = boardEvents(scene, t);
  const e = events.at(-1);
  const cells = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 21; c++) {
    const stagger = e.reveal ? (c - 5) * 1.3 : c * 1 + r * 5;
    const f = flapAt(e.from[r][c], e.to[r][c], t, e.at + Math.max(0, stagger), e.per, e.max, r * 31 + c + scene.index * 7);
    const color = r === 0 && c >= 5 && c < 19 ? YELLOW : "#EEEAE0";
    cells.push(<div key={`${r}-${c}`} style={{ opacity: r === 0 ? 1 : 0.62 }}><Cell x={cellX(c)} y={ROW_Y[r]} {...f} color={color} /></div>);
  }
  // A shimmer of light across the board just as the answer lands.
  const reveal = events.find(x => x.reveal);
  const sheen = reveal ? clamp01((t - reveal.at - 10) / 24) : 0;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080 }}>
      {/* Chains it hangs from. */}
      <svg width="1920" height="130" style={{ position: "absolute", left: 0, top: 0 }}>
        {[220, 1380].map(x => <line key={x} x1={x} y1={0} x2={x} y2={112} stroke="#3B3F48" strokeWidth={6} strokeDasharray="10 5" />)}
      </svg>
      <div style={{ position: "absolute", left: 50, top: 108, width: 1490, height: 390, background: "#0A0A0A", borderRadius: 10,
        border: "10px solid #2B2E35", boxShadow: "0 0 0 3px #11131A, 0 30px 80px rgba(0,0,0,0.8), 0 0 140px rgba(255,200,90,0.08)" }} />
      <div style={{ position: "absolute", left: 60, top: 118, width: 1470, height: 58, background: "linear-gradient(#123F31, #0B2B21)", borderBottom: `3px solid ${GOLD}`, borderRadius: "4px 4px 0 0" }} />
      <div style={{ position: "absolute", left: 92, top: 122, fontFamily: FLAP, fontWeight: 600, fontSize: 40, letterSpacing: 10, color: CREAM }}>ARRIVALS</div>
      <div style={{ position: "absolute", right: 1920 - 1500, top: 128, fontFamily: GILT, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: GOLD }}>GRAND QUESTION STATION</div>
      {[["TIME", 0], ["QUESTION TYPE", 5], ["PLAT", 19]].map(([label, c]) => (
        <div key={label} style={{ position: "absolute", left: cellX(c), top: 178, fontFamily: FLAP, fontWeight: 500, fontSize: 18, letterSpacing: 4, color: "#8C8A84" }}>{label}</div>
      ))}
      {cells}
      <div style={{ position: "absolute", left: cellX(5) - 10, top: ROW_Y[0] - 8, width: cellX(18) + CELL_W - cellX(5) + 20, height: CELL_H + 16, borderRadius: 8,
        background: `linear-gradient(100deg, transparent ${sheen * 120 - 30}%, rgba(255,230,150,0.28) ${sheen * 120 - 15}%, transparent ${sheen * 120}%)`, opacity: sheen > 0 && sheen < 1 ? 1 : 0 }} />
    </div>
  );
}

// ---------- The station ----------
function Station({ frame }) {
  const stars = Array.from({ length: 70 }, (_, i) => (
    <circle key={i} cx={hash(i) * 1920} cy={hash(i + 99) * 520} r={0.8 + hash(i + 7) * 1.6} fill="#FFF" opacity={0.25 + 0.5 * Math.abs(Math.sin(frame / 40 + i))} />
  ));
  // Ribs of the iron-and-glass roof, receding toward the far end.
  const ribs = Array.from({ length: 9 }, (_, i) => {
    const s = Math.pow(0.8, i);
    const rx = 1500 * s, ry = 900 * s;
    return <path key={i} d={`M ${960 - rx} 620 A ${rx} ${ry} 0 0 1 ${960 + rx} 620`} fill="none" stroke={i === 0 ? "#2E3440" : "#262C38"} strokeWidth={26 * s + 3} />;
  });
  const bars = Array.from({ length: 23 }, (_, i) => {
    const a = Math.PI + (i / 22) * Math.PI;
    return <line key={i} x1={960} y1={620} x2={960 + 1600 * Math.cos(a)} y2={620 + 1000 * Math.sin(a)} stroke="#1E2430" strokeWidth={3} />;
  });
  const lamps = [[330, 60], [960, 40], [1560, 70]];
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="dep-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#060B1E" /><stop offset="0.6" stopColor="#15204A" /><stop offset="1" stopColor="#233066" /></linearGradient>
        <radialGradient id="dep-lamp"><stop offset="0" stopColor="rgba(255,214,140,0.55)" /><stop offset="1" stopColor="rgba(255,214,140,0)" /></radialGradient>
        <linearGradient id="dep-brick" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3A2522" /><stop offset="1" stopColor="#23191A" /></linearGradient>
        <pattern id="dep-bricks" width="60" height="30" patternUnits="userSpaceOnUse">
          <rect width="60" height="30" fill="none" /><path d="M0 29.5 H60 M0 14.5 H60 M30 0 V14.5 M0 15 V30 M60 15 V30" stroke="rgba(0,0,0,0.35)" strokeWidth="2" />
        </pattern>
        <linearGradient id="dep-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A453D" /><stop offset="1" stopColor="#24211D" /></linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#dep-sky)" />
      {stars}
      <circle cx={1480} cy={95} r={38} fill="#F4EBCF" opacity={0.9} />
      <circle cx={1480} cy={95} r={90} fill="url(#dep-lamp)" opacity={0.5} />
      {bars}
      {ribs}
      {/* The far wall under the board: brick, arches and a lit waiting room. */}
      <rect x={0} y={500} width={1920} height={460} fill="url(#dep-brick)" />
      <rect x={0} y={500} width={1920} height={460} fill="url(#dep-bricks)" />
      {[180, 1740].map(x => (
        <g key={x}>
          <path d={`M ${x - 110} 960 V 700 A 110 110 0 0 1 ${x + 110} 700 V 960 Z`} fill="#140E10" stroke="#5A3D34" strokeWidth={10} />
          <path d={`M ${x - 90} 960 V 705 A 90 90 0 0 1 ${x + 90} 705 V 960 Z`} fill="rgba(255,196,110,0.25)" />
        </g>
      ))}
      {/* Iron columns with gilded capitals. */}
      {[20, 1900].map(x => (
        <g key={x}>
          <rect x={x - 16} y={0} width={32} height={960} fill="#1E232D" />
          <rect x={x - 26} y={480} width={52} height={24} fill={GOLD} opacity={0.7} />
        </g>
      ))}
      {/* Gas lamps hanging from the roof. */}
      {lamps.map(([x, y], i) => {
        const flick = 0.85 + 0.15 * hash(Math.floor(frame / 4) + i * 13);
        return (
          <g key={i}>
            <line x1={x} y1={0} x2={x} y2={y} stroke="#333" strokeWidth={3} />
            <circle cx={x} cy={y + 18} r={140} fill="url(#dep-lamp)" opacity={flick} />
            <path d={`M ${x - 14} ${y} L ${x + 14} ${y} L ${x + 10} ${y + 34} L ${x - 10} ${y + 34} Z`} fill="#FFE2A0" stroke="#222" strokeWidth={3} />
          </g>
        );
      })}
      {/* Rails and the platform we stand on. */}
      <rect x={0} y={930} width={1920} height={40} fill="#0D0D10" />
      <rect x={0} y={936} width={1920} height={5} fill="#6B6B72" />
      <rect x={0} y={952} width={1920} height={128} fill="url(#dep-stone)" />
      <rect x={0} y={952} width={1920} height={8} fill="#8C877C" />
      <rect x={0} y={966} width={1920} height={9} fill="#D6A72A" />
    </svg>
  );
}

// Drifting steam, thickest just after a train pulls in.
function Steam({ frame, puff }) {
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <defs><filter id="dep-blur"><feGaussianBlur stdDeviation="40" /></filter></defs>
      <g filter="url(#dep-blur)">
        {Array.from({ length: 9 }, (_, i) => {
          const x = ((hash(i) * 2400 - frame * (0.6 + hash(i + 3))) % 2400 + 2400) % 2400 - 240;
          return <ellipse key={i} cx={x} cy={560 + hash(i + 5) * 330} rx={220 + hash(i + 8) * 160} ry={90} fill="#DDE3EE" opacity={0.05 + 0.12 * puff} />;
        })}
      </g>
    </svg>
  );
}

// The station clock, which sweeps an amber wedge through the countdown.
function Clock({ frame, k, sweep, label, labelColor }) {
  const time = k <= 0 ? 19 * 60 : k > TOTAL ? 19 * 60 + 4 * (TOTAL + 1) : 19 * 60 + 4 * k;
  const hourA = ((time / 60) % 12) * 30, minA = (time % 60) * 6;
  const secA = sweep > 0 ? sweep * 360 : Math.floor(frame / 30) * 6;
  const wedge = sweep >= 1 ? "M 0 -128 A 128 128 0 1 1 -0.1 -128 Z" : sweep > 0
    ? `M 0 0 L 0 -128 A 128 128 0 ${sweep > 0.5 ? 1 : 0} 1 ${128 * Math.sin(sweep * 2 * Math.PI)} ${-128 * Math.cos(sweep * 2 * Math.PI)} Z` : null;
  const numerals = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  return (
    <div style={{ position: "absolute", left: 1720 - 170, top: 0, width: 340, height: 520 }}>
      <svg width="340" height="520" viewBox="-170 -290 340 520">
        <rect x={-6} y={-290} width={12} height={140} fill="#2B2E35" />
        <path d="M -40 -150 Q 0 -175 40 -150 L 30 -140 L -30 -140 Z" fill="#2B2E35" stroke={GOLD} strokeWidth={2} />
        <circle r={156} fill="#20242C" stroke={GOLD} strokeWidth={5} />
        <circle r={140} fill="#2C313B" />
        <circle r={130} fill={CREAM} />
        <circle r={130} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth={12} />
        {wedge && <path d={wedge} fill="rgba(255,176,32,0.55)" />}
        {Array.from({ length: 60 }, (_, i) => (
          <line key={i} x1={0} y1={-124} x2={0} y2={i % 5 ? -118 : -110} stroke={INK} strokeWidth={i % 5 ? 2 : 4} transform={`rotate(${i * 6})`} />
        ))}
        {numerals.map((n, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <text key={n} x={90 * Math.sin(a)} y={-90 * Math.cos(a) + 7} textAnchor="middle" fontFamily={GILT} fontWeight={700} fontSize={19} fill={INK}>{n}</text>;
        })}
        <line x1={0} y1={12} x2={0} y2={-62} stroke={INK} strokeWidth={9} strokeLinecap="round" transform={`rotate(${hourA})`} />
        <line x1={0} y1={16} x2={0} y2={-100} stroke={INK} strokeWidth={6} strokeLinecap="round" transform={`rotate(${minA})`} />
        <g transform={`rotate(${secA})`}>
          <line x1={0} y1={30} x2={0} y2={-118} stroke="#B3261E" strokeWidth={3} />
          <circle cy={-86} r={8} fill="none" stroke="#B3261E" strokeWidth={3} />
        </g>
        <circle r={9} fill="#B3261E" />
      </svg>
      <div style={{ position: "absolute", left: 60, top: 458, width: 220, height: 50, background: "#0B0B0C", border: `3px solid ${GOLD}`, borderRadius: 8,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FLAP, fontWeight: 600, fontSize: 30, letterSpacing: 4, color: labelColor }}>{label}</div>
    </div>
  );
}

// The carriage: maroon and gold, with the question on a lit card in its side.
function Train({ k, offset, hl }) {
  const a = ARRIVALS[k - 1];
  const card = CARDS[a.card];
  if (!card) throw new Error(`No card "${a.card}"`);
  const win = x => (
    <g key={x}>
      <rect x={x} y={596} width={120} height={160} rx={14} fill="#2A0C10" />
      <rect x={x + 8} y={604} width={104} height={144} rx={10} fill="#F2C878" opacity={0.85} />
      <circle cx={x + 60} cy={690} r={24} fill="#6B3A22" opacity={0.55} />
      <rect x={x + 30} y={712} width={60} height={40} rx={20} fill="#6B3A22" opacity={0.55} />
    </g>
  );
  return (
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${offset} 0)`}>
        <path d="M 110 540 Q 120 500 200 498 L 1720 498 Q 1800 500 1810 540 Z" fill="#23252B" />
        <rect x={100} y={530} width={1720} height={415} rx={16} fill={MAROON} />
        <rect x={100} y={530} width={1720} height={415} rx={16} fill="url(#dep-carriage)" />
        <rect x={114} y={544} width={1692} height={387} rx={10} fill="none" stroke={GOLD} strokeWidth={3} />
        <defs>
          <linearGradient id="dep-carriage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(255,255,255,0.12)" /><stop offset="0.5" stopColor="rgba(0,0,0,0)" /><stop offset="1" stopColor="rgba(0,0,0,0.35)" /></linearGradient>
        </defs>
        {[150, 290, 1500, 1640].map(win)}
        {[440, 1480].map(x => <line key={x} x1={x} y1={560} x2={x} y2={920} stroke="#3E0F15" strokeWidth={4} />)}
        <text x={960} y={574} textAnchor="middle" fontFamily={GILT} fontWeight={700} fontSize={22} letterSpacing={6} fill={GOLD}>QUESTION {k} OF {TOTAL}  ·  PLATFORM {a.plat}</text>
        <rect x={452} y={586} width={1016} height={352} rx={8} fill="#1A0709" stroke={GOLD} strokeWidth={4} />
        <g transform="translate(460 594)">
          <rect width={1000} height={336} rx={4} fill="#F7F0DC" />
          <rect width={1000} height={336} rx={4} fill="none" stroke="rgba(120,90,40,0.25)" strokeWidth={10} />
          {card(hl)}
        </g>
        <rect x={100} y={945} width={1720} height={18} fill="#0E0E10" />
        {[92, 1828].map(x => <rect key={x} x={x - 14} y={880} width={28} height={40} rx={6} fill="#222" />)}
      </g>
    </svg>
  );
}

// The porter: peaked cap, grand moustache, lantern in hand.
function Porter({ frame, talking, wave }) {
  const blink = frame % 97 < 4 ? 0.1 : 1;
  const mouth = talking ? 3 + Math.abs(Math.sin(frame / 2.6)) * 10 : 2;
  const arm = talking ? -30 - 14 * Math.sin(frame / 9) : -8;
  return (
    <svg width="300" height="440" viewBox="0 0 300 440" style={{ overflow: "visible" }}>
      <ellipse cx={150} cy={432} rx={110} ry={10} fill="rgba(0,0,0,0.4)" />
      <rect x={100} y={320} width={40} height={110} fill="#111A33" /><rect x={160} y={320} width={40} height={110} fill="#111A33" />
      <rect x={92} y={420} width={52} height={14} rx={6} fill="#0A0A0A" /><rect x={156} y={420} width={52} height={14} rx={6} fill="#0A0A0A" />
      <path d="M 80 190 Q 150 165 220 190 L 232 330 L 68 330 Z" fill="#1B2A55" />
      <path d="M 128 180 L 150 300 L 172 180 Z" fill="#F0E8D8" />
      <path d="M 143 190 L 150 250 L 157 190 Z" fill="#8E1B24" />
      {[220, 250, 280].map(y => <g key={y}><circle cx={112} cy={y} r={5} fill={GOLD} /><circle cx={188} cy={y} r={5} fill={GOLD} /></g>)}
      {/* The lantern arm. */}
      <path d="M 222 195 Q 250 250 245 300" stroke="#1B2A55" strokeWidth={30} fill="none" strokeLinecap="round" />
      <circle cx={245} cy={305} r={15} fill="#E9B48A" />
      <circle cx={245} cy={352} r={70} fill="url(#dep-lamp-p)" />
      <defs><radialGradient id="dep-lamp-p"><stop offset="0" stopColor="rgba(255,210,120,0.6)" /><stop offset="1" stopColor="rgba(255,210,120,0)" /></radialGradient></defs>
      <line x1={245} y1={318} x2={245} y2={330} stroke="#222" strokeWidth={3} />
      <rect x={228} y={330} width={34} height={46} rx={4} fill="#FFE2A0" stroke="#222" strokeWidth={4} />
      {/* The gesturing arm. */}
      <g transform={`rotate(${arm + (wave ? -60 + 20 * Math.sin(frame / 4) : 0)} 82 200)`}>
        <path d="M 82 200 Q 50 250 58 300" stroke="#1B2A55" strokeWidth={30} fill="none" strokeLinecap="round" />
        <circle cx={58} cy={306} r={15} fill="#E9B48A" />
      </g>
      <rect x={134} y={150} width={32} height={28} fill="#E0A77C" />
      <circle cx={150} cy={112} r={58} fill="#E9B48A" />
      <circle cx={108} cy={126} r={12} fill="#E08A7A" opacity={0.5} /><circle cx={192} cy={126} r={12} fill="#E08A7A" opacity={0.5} />
      <ellipse cx={128} cy={104} rx={6} ry={7 * blink} fill="#1B1B1B" /><ellipse cx={172} cy={104} rx={6} ry={7 * blink} fill="#1B1B1B" />
      <ellipse cx={150} cy={122} rx={9} ry={11} fill="#D99A74" />
      <ellipse cx={150} cy={146} rx={12} ry={mouth / 2} fill="#5A1A1A" />
      <path d="M 150 134 Q 128 126 104 142 Q 126 146 150 138 Q 174 146 196 142 Q 172 126 150 134 Z" fill="#8A8A8A" />
      <path d="M 88 78 Q 150 30 212 78 L 208 90 L 92 90 Z" fill="#111A33" />
      <rect x={90} y={76} width={120} height={14} fill={GOLD} />
      <path d="M 90 90 Q 150 108 214 90 L 214 96 Q 150 116 86 96 Z" fill="#0A0F20" />
      <circle cx={150} cy={66} r={9} fill={GOLD} />
    </svg>
  );
}

// An enamel station sign the porter holds up with his tip.
function TipSign({ lines, k }) {
  return (
    <div style={{ position: "absolute", left: 24, top: 500, transform: `translateY(${(1 - k) * 40}px) rotate(-2deg)`, opacity: k,
      background: ENAMEL, border: `5px solid ${CREAM}`, borderRadius: 14, padding: "12px 34px", boxShadow: `inset 0 0 0 3px ${ENAMEL}, inset 0 0 0 6px ${CREAM}, 0 20px 40px rgba(0,0,0,0.6)` }}>
      <div style={{ fontFamily: FLAP, fontWeight: 500, fontSize: 26, letterSpacing: 3, color: "#C9D6F2" }}>{lines[0]}</div>
      <div style={{ fontFamily: FLAP, fontWeight: 600, fontSize: 40, letterSpacing: 4, color: "#FFFFFF" }}>{lines[1]}</div>
    </div>
  );
}

// The wall signs in the opening: the title, and tonight's question types.
function WallSigns({ k }) {
  return (
    <div style={{ position: "absolute", inset: 0, opacity: k }}>
      <div style={{ position: "absolute", left: 360, top: 570, width: 640, padding: "26px 0", textAlign: "center", background: ENAMEL, border: `6px solid ${CREAM}`, borderRadius: 18,
        boxShadow: `inset 0 0 0 4px ${ENAMEL}, inset 0 0 0 8px ${CREAM}, 0 20px 50px rgba(0,0,0,0.6)` }}>
        <div style={{ fontFamily: GILT, fontWeight: 700, fontSize: 38, letterSpacing: 10, color: "#C9D6F2" }}>DEPARTURES</div>
        <div style={{ fontFamily: GILT, fontWeight: 700, fontSize: 58, color: "#FFF", lineHeight: 1.1, marginTop: 8 }}>Name That<br />Question</div>
      </div>
      <div style={{ position: "absolute", left: 1060, top: 540, width: 540, height: 380, background: CREAM, borderRadius: 6, border: `8px solid #3A2A1C`, padding: "18px 30px", boxShadow: "0 20px 50px rgba(0,0,0,0.6)" }}>
        <div style={{ fontFamily: GILT, fontWeight: 700, fontSize: 28, color: MAROON, letterSpacing: 3, borderBottom: `3px double ${MAROON}`, paddingBottom: 6 }}>TONIGHT'S SERVICES</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 24px", marginTop: 16, fontFamily: FLAP, fontWeight: 500, fontSize: 25, letterSpacing: 2, color: INK }}>
          {TYPES.map(x => <div key={x}>• {x}</div>)}
        </div>
      </div>
    </div>
  );
}

function Backdrop({ frame, scene }) {
  const t = frame - scene.start;
  const k = scene.index;
  const at = i => scene.beats[i].start - scene.start;
  const arrival = k >= 1 && k <= TOTAL;
  // Countdown: from the end of the call to the reveal.
  let sweep = 0, label = k === 0 ? "WELCOME" : k > TOTAL ? "GOODNIGHT" : "DUE", labelColor = CREAM;
  if (arrival) {
    const cs = at(0) + scene.beats[0].speech + 2, ce = at(1) - 2;
    if (t >= cs && t < at(1)) {
      sweep = clamp01((t - cs) / (ce - cs));
      label = `NAME IT!  ${Math.max(1, Math.ceil(((ce - t) / 30)))}`;
      labelColor = YELLOW;
    } else if (t >= at(1)) { label = "ARRIVED"; labelColor = "#8FE3A0"; }
  }
  // The train pulls in at the start and pulls out at the end.
  const offset = arrival ? 2100 * (1 - rise(t, 46, 2)) - 2300 * Math.pow(clamp01((t - (scene.length - 18)) / 18), 2) : 0;
  const puff = arrival ? Math.max(0, 1 - Math.abs(t - 50) / 60) : 0;
  // The porter walks on for the opening, his tips and the ending.
  const porterBeats = scene.beats.map((b, i) => ({ b, i })).filter(x => x.b.who === "porter");
  const beat = scene.beats.findLast(b => frame >= b.start);
  const tipBeat = porterBeats.find(x => x.b.tip);
  const porterIn = porterBeats.length ? rise(t, 16, at(porterBeats[0].i) - 14) * (1 - rise(t, 14, porterBeats.at(-1).b.start - scene.start + porterBeats.at(-1).b.length - 4)) : 0;
  const porterStay = k === 0 || k > TOTAL;
  const pk = porterStay ? rise(t, 18, 6) : porterIn;
  const talking = beat && beat.who === "porter" && frame - beat.start < beat.speech;
  const hl = tipBeat ? rise(t, 12, at(tipBeat.i) + 20) * (0.75 + 0.25 * Math.sin(t / 5)) : 0;
  const signK = tipBeat ? pop(t, at(tipBeat.i) + 12) : 0;
  return (
    <AbsoluteFill style={{ background: "#05070F" }}>
      <Station frame={frame} />
      {!arrival && <WallSigns k={k === 0 ? rise(t, 30, 10) : 1} />}
      {arrival && <Train k={k} offset={offset} hl={hl} />}
      <Steam frame={frame} puff={puff} />
      <Board scene={scene} t={t} />
      <Clock frame={frame} k={k} sweep={sweep} label={label} labelColor={labelColor} />
      {pk > 0 && (
        <div style={{ position: "absolute", left: lerp(-340, 20, pk), top: 575 }}>
          <Porter frame={frame} talking={talking} wave={k > TOTAL && t > scene.length - 110} />
        </div>
      )}
      {tipBeat && signK > 0 && <TipSign lines={tipBeat.b.tip} k={Math.min(1, signK)} />}
    </AbsoluteFill>
  );
}

function Overlay() {
  return <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />;
}

// Station information strip along the platform edge.
function Subtitles({ words, spoken, opacity, actor }) {
  const porter = actor?.name === "PORTER";
  return (
    <div style={{ position: "absolute", left: 200, right: 200, bottom: 18, minHeight: 86, opacity, display: "flex", alignItems: "center", gap: 22,
      background: "rgba(6,8,14,0.88)", border: `2px solid ${GOLD}`, borderRadius: 12, padding: "8px 28px" }}>
      {actor && <span style={{ flex: "none", fontFamily: FLAP, fontWeight: 600, fontSize: 24, letterSpacing: 4, color: "#FFF", background: porter ? MAROON : ENAMEL, borderRadius: 6, padding: "4px 14px" }}>{actor.name}</span>}
      <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, lineHeight: 1.2 }}>
        {words.map((w, i) => <span key={i} style={{ color: i < spoken ? CREAM : "#6D6A63" }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </span>
    </div>
  );
}

// ---------- The film ----------
const ticks = (si, text, hold) => {
  const s = speechSeconds(si, 0, text);
  const n = Math.floor(hold + 0.45);
  return Array.from({ length: n }, (_, j) => ({ sfx: "departures-tick", at: s + 0.12 + j, volume: 0.8 }));
};
const OPEN_FIRST = "Evening! Busy night at the station tonight.";
const END_FIRST = "That's the last train of the night. Well spotted!";

const scenes = [
  {
    beats: [
      { who: "porter", say: OPEN_FIRST, hold: 1.4, sfxs: [{ sfx: "departures-whistle", at: 0.1, volume: 0.35 }, { sfx: "departures-chime", at: speechSeconds(0, 0, OPEN_FIRST) + 0.2, volume: 0.6 }] },
      { who: "announcer", say: "Welcome to the Grand Question Station. Every train tonight carries a question.", sfxs: [{ sfx: "departures-flap", at: 0, volume: 0.6 }] },
      { who: "porter", say: "When the clock sweeps, shout out what type of question it is. Then watch the board flip, and see if you were right!" },
      { who: "announcer", say: "Stand back, please. The first question is arriving." },
    ],
    render: () => null,
  },
  ...ARRIVALS.map((a, i) => {
    const si = i + 1;
    const beats = [
      { who: "announcer", say: a.call, hold: a.hold, sfxs: [{ sfx: "departures-arrive", at: 0, volume: 0.6 }, { sfx: "departures-flap", at: 0.05, volume: 0.35 }, ...ticks(si, a.call, a.hold)] },
      { who: "announcer", say: a.say, sfxs: [{ sfx: "departures-flap", at: 0, volume: 0.8 }] },
    ];
    if (a.tip) beats.push({ who: "porter", say: a.tip.say, tip: a.tip.sign, hold: 0.4 });
    return { beats, tail: 0.45, render: () => null };
  }),
  {
    beats: [
      { who: "porter", say: END_FIRST, hold: 1.4, sfxs: [{ sfx: "departures-whistle", at: 0, volume: 0.35 }, { sfx: "departures-flap", at: 0.2, volume: 0.6 }, { sfx: "departures-chime", at: speechSeconds(TOTAL + 1, 0, END_FIRST) + 0.2, volume: 0.6 }] },
      { who: "announcer", say: "All questions have arrived. Nothing gets past you.", hold: 1.2 },
    ],
    tail: 2,
    render: () => null,
  },
];

export default {
  id: ID,
  order: 1601,
  series: 17,
  title: "Departures: Name That Question",
  frame: "none",
  push: 0,
  cast: {
    announcer: { name: "ANNOUNCER", voice: "bf_emma", speed: 0.95 },
    porter: { name: "PORTER", voice: "bm_fable", speed: 1.02 },
  },
  music: { src: "music/departures.wav", volume: 0.3, duck: 0.45 },
  Backdrop,
  Overlay,
  Subtitles,
  scenes,
};
