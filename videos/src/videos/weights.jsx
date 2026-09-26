// Balancing puzzles: "Three rabbits weigh as much as one goat..."
// Every fact is drawn as a balance, and things are swapped for their equal
// weight until everything is the same animal. All puzzles written fresh.
import React from "react";
import { C, SERIF, SANS } from "../lib/theme.js";
import { rise, pop, window, lerp } from "../lib/anim.js";
import { Seal, Words, Note, TitleCard, Countdown, Steps, Ring, Strike } from "../lib/ui.jsx";

// ---------- Animal faces ----------
// Little ink-and-colour portraits, drawn round (0, 0) at radius r.
const PINK = "#E8A5A0";
const ANIMALS = {
  mouse: { name: "mouse", face: "#C9CCC5" },
  rabbit: { name: "rabbit", face: "#E6DBCB" },
  cat: { name: "cat", face: "#E8B26F" },
  dog: { name: "dog", face: "#B98A5E" },
  goat: { name: "goat", face: "#EEE7D5" },
  pony: { name: "pony", face: "#A06E48" },
  duck: { name: "duck", face: "#F2CF5B" },
  goose: { name: "goose", face: "#F6F4EC" },
};

function Face({ kind, r }) {
  const ink = { stroke: C.ink, strokeWidth: Math.max(2, r * 0.07), strokeLinejoin: "round", strokeLinecap: "round" };
  const face = ANIMALS[kind].face;
  const eyes = (
    <>
      <circle cx={-r * 0.32} cy={-r * 0.06} r={r * 0.085} fill={C.ink} />
      <circle cx={r * 0.32} cy={-r * 0.06} r={r * 0.085} fill={C.ink} />
      <circle cx={-r * 0.29} cy={-r * 0.1} r={r * 0.03} fill="#fff" />
      <circle cx={r * 0.35} cy={-r * 0.1} r={r * 0.03} fill="#fff" />
    </>
  );
  const cheeks = (
    <>
      <circle cx={-r * 0.55} cy={r * 0.24} r={r * 0.13} fill={PINK} opacity={0.35} />
      <circle cx={r * 0.55} cy={r * 0.24} r={r * 0.13} fill={PINK} opacity={0.35} />
    </>
  );
  const whiskers = (
    <g {...ink} strokeWidth={r * 0.035} fill="none" opacity={0.7}>
      <path d={`M ${-r * 0.3} ${r * 0.28} L ${-r * 0.95} ${r * 0.18} M ${-r * 0.3} ${r * 0.36} L ${-r * 0.92} ${r * 0.44}`} />
      <path d={`M ${r * 0.3} ${r * 0.28} L ${r * 0.95} ${r * 0.18} M ${r * 0.3} ${r * 0.36} L ${r * 0.92} ${r * 0.44}`} />
    </g>
  );
  const head = <circle r={r} fill={face} {...ink} />;

  switch (kind) {
    case "mouse": return (
      <g>
        {[-1, 1].map(s => (
          <g key={s}>
            <circle cx={s * r * 0.72} cy={-r * 0.72} r={r * 0.46} fill={face} {...ink} />
            <circle cx={s * r * 0.72} cy={-r * 0.72} r={r * 0.25} fill={PINK} opacity={0.7} />
          </g>
        ))}
        {head}{eyes}{cheeks}
        <circle cy={r * 0.24} r={r * 0.11} fill={PINK} {...ink} strokeWidth={r * 0.04} />
        {whiskers}
      </g>
    );
    case "rabbit": return (
      <g>
        {[-1, 1].map(s => (
          <g key={s} transform={`rotate(${s * 8} ${s * r * 0.34} ${-r * 0.8})`}>
            <ellipse cx={s * r * 0.34} cy={-r * 1.28} rx={r * 0.22} ry={r * 0.62} fill={face} {...ink} />
            <ellipse cx={s * r * 0.34} cy={-r * 1.22} rx={r * 0.09} ry={r * 0.42} fill={PINK} opacity={0.7} />
          </g>
        ))}
        {head}{eyes}{cheeks}
        <path d={`M ${-r * 0.1} ${r * 0.18} L ${r * 0.1} ${r * 0.18} L 0 ${r * 0.3} Z`} fill={PINK} {...ink} strokeWidth={r * 0.04} />
        {whiskers}
      </g>
    );
    case "cat": return (
      <g>
        {[-1, 1].map(s => (
          <path key={s} d={`M ${s * r * 0.25} ${-r * 0.9} L ${s * r * 0.82} ${-r * 1.18} L ${s * r * 0.9} ${-r * 0.42} Z`} fill={face} {...ink} />
        ))}
        {head}
        <path d={`M ${-r * 0.2} ${-r * 0.78} q ${r * 0.2} ${r * 0.18} ${r * 0.4} 0`} fill="none" {...ink} strokeWidth={r * 0.05} opacity={0.5} />
        {eyes}{cheeks}
        <path d={`M ${-r * 0.1} ${r * 0.16} L ${r * 0.1} ${r * 0.16} L 0 ${r * 0.28} Z`} fill={PINK} {...ink} strokeWidth={r * 0.04} />
        {whiskers}
      </g>
    );
    case "dog": return (
      <g>
        {head}
        <ellipse cy={r * 0.34} rx={r * 0.5} ry={r * 0.36} fill="#D9B48A" />
        {eyes}
        <ellipse cy={r * 0.2} rx={r * 0.16} ry={r * 0.11} fill={C.ink} />
        <path d={`M 0 ${r * 0.3} L 0 ${r * 0.42} M ${-r * 0.16} ${r * 0.48} Q 0 ${r * 0.56} ${r * 0.16} ${r * 0.48}`} fill="none" {...ink} strokeWidth={r * 0.05} />
        {[-1, 1].map(s => (
          <ellipse key={s} cx={s * r * 0.88} cy={-r * 0.05} rx={r * 0.28} ry={r * 0.58} fill="#7E5838" {...ink} transform={`rotate(${s * 18} ${s * r * 0.88} ${-r * 0.05})`} />
        ))}
      </g>
    );
    case "goat": return (
      <g>
        {[-1, 1].map(s => (
          <path key={s} d={`M ${s * r * 0.28} ${-r * 0.82} C ${s * r * 0.4} ${-r * 1.5}, ${s * r * 1.05} ${-r * 1.5}, ${s * r * 1.02} ${-r * 0.95}`} fill="none" stroke="#A89A7C" strokeWidth={r * 0.2} strokeLinecap="round" />
        ))}
        {[-1, 1].map(s => (
          <ellipse key={`e${s}`} cx={s * r * 1.02} cy={-r * 0.18} rx={r * 0.34} ry={r * 0.16} fill={face} {...ink} transform={`rotate(${s * 20} ${s * r * 1.02} ${-r * 0.18})`} />
        ))}
        <path d={`M ${-r * 0.2} ${r * 0.85} L 0 ${r * 1.35} L ${r * 0.2} ${r * 0.85} Z`} fill="#D6CCB2" {...ink} />
        {head}{eyes}{cheeks}
        <ellipse cy={r * 0.3} rx={r * 0.12} ry={r * 0.08} fill="#8C7B62" />
      </g>
    );
    case "pony": return (
      <g>
        {[-1, 1].map(s => (
          <path key={s} d={`M ${s * r * 0.2} ${-r * 0.9} L ${s * r * 0.55} ${-r * 1.35} L ${s * r * 0.62} ${-r * 0.72} Z`} fill={ANIMALS.pony.face} {...ink} />
        ))}
        <ellipse rx={r * 0.82} ry={r * 1.05} fill={ANIMALS.pony.face} {...ink} />
        <path d={`M ${-r * 0.45} ${-r * 0.82} Q ${-r * 0.1} ${-r * 1.4} ${r * 0.35} ${-r * 0.9} Q ${r * 0.05} ${-r * 0.6} ${-r * 0.45} ${-r * 0.82} Z`} fill="#4A3322" />
        <ellipse cy={r * 0.55} rx={r * 0.58} ry={r * 0.42} fill="#C99C74" {...ink} />
        <circle cx={-r * 0.2} cy={r * 0.55} r={r * 0.07} fill={C.ink} />
        <circle cx={r * 0.2} cy={r * 0.55} r={r * 0.07} fill={C.ink} />
        <circle cx={-r * 0.34} cy={-r * 0.18} r={r * 0.09} fill={C.ink} />
        <circle cx={r * 0.34} cy={-r * 0.18} r={r * 0.09} fill={C.ink} />
      </g>
    );
    case "duck": return (
      <g>
        <path d={`M ${-r * 0.05} ${-r * 0.95} q ${r * 0.1} ${-r * 0.35} ${r * 0.32} ${-r * 0.28}`} fill="none" {...ink} strokeWidth={r * 0.08} />
        {head}{eyes}
        <ellipse cy={r * 0.3} rx={r * 0.46} ry={r * 0.2} fill="#E8913A" {...ink} strokeWidth={r * 0.05} />
        <path d={`M ${-r * 0.36} ${r * 0.3} L ${r * 0.36} ${r * 0.3}`} {...ink} strokeWidth={r * 0.035} opacity={0.6} />
      </g>
    );
    case "goose": return (
      <g>
        {head}{eyes}
        <path d={`M ${-r * 0.42} ${r * 0.22} Q 0 ${r * 0.1} ${r * 0.42} ${r * 0.22} L 0 ${r * 0.62} Z`} fill="#E8913A" {...ink} strokeWidth={r * 0.05} />
        <circle cy={r * 0.12} r={r * 0.1} fill="#E8913A" {...ink} strokeWidth={r * 0.04} />
      </g>
    );
    default: throw new Error(`No animal called ${kind}`);
  }
}

// ---------- The balance ----------

// Where the tokens in a group sit, bottom-centre at (0, 0), stacked upwards.
function cluster(n, r) {
  const g = r * 2.1, row = r * 1.8;
  const rows = { 1: [[0]], 2: [[-0.5, 0.5]], 3: [[-0.5, 0.5], [0]], 4: [[-0.5, 0.5], [-0.5, 0.5]], 5: [[-1, 0, 1], [-0.5, 0.5]], 6: [[-1, 0, 1], [-1, 0, 1]] }[n];
  if (!rows) throw new Error(`Can't stack ${n} animals`);
  return rows.flatMap((xs, ri) => xs.map(x => [x * g, -r - ri * row]));
}

// How far the beam tips (degrees, positive = right side down) at time t.
// Each event sends it towards a new angle, overshooting and settling.
function tiltAt(t, events) {
  const past = events.filter(e => e.at <= t);
  if (!past.length) return 0;
  const last = past.at(-1);
  const from = tiltAt(last.at - 0.01, events.filter(e => e !== last));
  const d = t - last.at;
  return last.to + (from - last.to) * Math.exp(-d / 11) * Math.cos(d / 5.2);
}

// A balance: `left` and `right` are groups { kind, n, r, slot, in, out }.
// `tips` lists { at, to } tilt events. `count` numbers the tokens on one side.
function Balance({ t, cx, pivot, len = 460, hang = 175, left = [], right = [], tips = [], slots = [1, 1], count, appear = 1, glow = 0 }) {
  const tilt = tiltAt(t, tips) * (Math.PI / 180);
  const ends = [-1, 1].map(s => [cx + s * (len / 2) * Math.cos(tilt), pivot + s * (len / 2) * Math.sin(tilt)]);
  const panW = 290;
  const base = pivot + 290;
  const sideTokens = [[], []];

  const drawSide = (groups, si) => {
    const [ex, ey] = ends[si];
    const panY = ey + hang;
    return groups.map((g, gi) => {
      if (t < g.in) return null;
      const out = g.out !== undefined ? rise(t, 14, g.out) : 0;
      if (out >= 1) return null;
      const m = slots[si];
      const gx = ex + (g.slot - (m - 1) / 2) * (m > 1 ? panW / m : 0);
      return cluster(g.n, g.r).map(([dx, dy], ti) => {
        const k = pop(t, g.in + ti * 4);
        const x = gx + dx, y = panY - 3 + dy;
        if (!g.out || t < g.out) sideTokens[si].push({ x, y, r: g.r, at: g.in + ti * 4 });
        return (
          <g key={`${gi}-${ti}`} transform={`translate(${x} ${y - (1 - Math.min(1, k)) * 60}) scale(${Math.max(0.01, k * (1 - out * 0.7))})`} opacity={Math.min(1, k * 1.4) * (1 - out)}>
            <Face kind={g.kind} r={g.r} />
          </g>
        );
      });
    });
  };

  const pans = ends.map(([ex, ey], si) => {
    const panY = ey + hang;
    return (
      <g key={si}>
        <path d={`M ${ex} ${ey} L ${ex - panW / 2 + 8} ${panY} M ${ex} ${ey} L ${ex + panW / 2 - 8} ${panY}`} stroke={C.ink} strokeWidth={2} opacity={0.75} />
        <circle cx={ex} cy={ey} r={6} fill={C.paper} stroke={C.ink} strokeWidth={2.5} />
        <path d={`M ${ex - panW / 2} ${panY} Q ${ex} ${panY + 44} ${ex + panW / 2} ${panY} Z`} fill="#EFE8D6" stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
      </g>
    );
  });

  const leftTokens = drawSide(left, 0);
  const rightTokens = drawSide(right, 1);
  const numbered = count ? sideTokens[count.side === "right" ? 1 : 0] : [];

  return (
    <svg style={{ position: "absolute", left: 0, top: 0, opacity: appear, overflow: "visible" }} width={1920} height={1080}>
      {glow > 0 && <ellipse cx={cx} cy={pivot + 90} rx={len * 0.72} ry={210} fill={C.highlight} opacity={glow * 0.55} />}
      <ellipse cx={cx} cy={base + 12} rx={130} ry={10} fill="rgba(27,42,36,0.12)" />
      <path d={`M ${cx - 96} ${base + 10} L ${cx + 96} ${base + 10} L ${cx + 70} ${base - 12} L ${cx - 70} ${base - 12} Z`} fill={C.ink} />
      <line x1={cx} y1={pivot} x2={cx} y2={base - 12} stroke={C.ink} strokeWidth={9} strokeLinecap="round" />
      <line x1={ends[0][0]} y1={ends[0][1]} x2={ends[1][0]} y2={ends[1][1]} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
      <path d={`M ${cx} ${pivot - 30} L ${cx - 12} ${pivot - 8} L ${cx + 12} ${pivot - 8} Z`} fill={C.gilt} transform={`rotate(${tilt * 180 / Math.PI} ${cx} ${pivot})`} />
      <circle cx={cx} cy={pivot} r={13} fill={C.gilt} stroke={C.giltDark} strokeWidth={2} />
      {pans}
      {leftTokens}
      {rightTokens}
      {count && numbered.map((tk, i) => {
        const k = pop(t, count.start + i * count.gap);
        return k > 0 && (
          <g key={`n${i}`} transform={`translate(${tk.x + tk.r * 0.62} ${tk.y - tk.r * 0.62}) scale(${k})`}>
            <circle r={17} fill={C.gilt} stroke={C.paper} strokeWidth={2.5} />
            <text textAnchor="middle" dy={7} fontFamily={SANS} fontWeight={800} fontSize={21} fill={C.clothDeep}>{i + 1}</text>
          </g>
        );
      })}
    </svg>
  );
}

// The question and its answer medallion.
function Question({ s, text, y = 752, appear, answer, answerAt, wrong, wrongAt, hideMark = 0 }) {
  const k = answerAt !== undefined ? pop(s.t, answerAt) : 0;
  return (
    <>
      <Words x={260} w={1260} y={y} size={42} italic color={C.ink} align="center" appear={appear}>{text}</Words>
      <div style={{
        position: "absolute", left: 1560, top: y - 18, width: 96, height: 96, borderRadius: "50%", opacity: appear,
        background: k > 0 ? C.white : "transparent", boxShadow: `0 0 0 ${k > 0 ? 3 : 2}px ${k > 0 ? C.gilt : C.rule}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: SERIF, fontWeight: 600, fontSize: 56, color: k > 0 ? C.ink : C.faint,
      }}>
        <span style={{ transform: `scale(${k > 0 ? 0.6 + 0.4 * k : 1})`, opacity: k > 0 ? 1 : 1 - hideMark }}>{k > 0 ? answer : "?"}</span>
      </div>
      {answerAt !== undefined && <Seal x={1644} y={y - 12} size={52} t={s.t} start={answerAt + 8} />}
      {wrong !== undefined && (
        <div style={{ opacity: rise(s.t, 14, wrongAt) * (1 - rise(s.t, 14, answerAt ?? 1e9)) }}>
          <div style={{ position: "absolute", left: 1700, top: y - 8, fontFamily: SERIF, fontSize: 56, color: C.mud }}>{wrong}</div>
          <Strike x={1690} y={y - 10} w={56} h={76} progress={rise(s.t, 12, wrongAt + 16)} />
        </div>
      )}
    </>
  );
}

// ---------- The video ----------
const L = 530, R = 1390, PIVOT = 370; // two balances side by side

export default {
  id: "weights",
  order: 9,
  title: "Balancing Puzzles",
  cloth: "cover",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Balancing puzzles. Who weighs the same as who? Let's find out.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <TitleCard t={s.t} kicker="Nothing gets past you" title="Balancing Puzzles" strap="Swap until everything matches." emblem="scales" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "Balancing puzzles tell you which animals weigh the same." },
        { say: "Two mice weigh as much as one cat. So on a scale, they balance perfectly." },
        { say: "Then they ask you a question, like: how many mice weigh as much as something else?" },
      ],
      render: s => {
        const b1 = s.at(1);
        const mice = { kind: "mouse", n: 2, r: 36, slot: 0, in: b1 + s.speech(1) * 0.1 };
        const cat = { kind: "cat", n: 1, r: 54, slot: 0, in: b1 + s.speech(1) * 0.45 };
        return (
          <>
            <Words x={260} w={1400} y={170} size={50} align="center" appear={rise(s.t, 18, b1)}>Two mice weigh as much as one cat.</Words>
            <Balance t={s.t} cx={960} pivot={PIVOT} len={520} appear={rise(s.t, 20, 6)}
              left={[mice]} right={[cat]} tips={[{ at: mice.in + 6, to: -10 }, { at: cat.in + 6, to: 0 }]} />
            <Words x={260} w={1400} y={735} size={42} italic color={C.soft} align="center" appear={rise(s.t, 18, s.at(2) + s.speech(2) * 0.3)}>
              How many mice weigh as much as...?
            </Words>
          </>
        );
      },
    },

    // The secret.
    {
      beats: [
        { say: "Here's the secret. Draw each fact as a balance." },
        { say: "Then swap things for things that weigh just the same, until it's all the same animal." },
        { say: "Swapping never changes the weight, so the scale stays balanced." },
      ],
      render: s => {
        const mice = { kind: "mouse", n: 2, r: 32, slot: 0, in: s.at(0) + s.speech(0) * 0.4 };
        const cat = { kind: "cat", n: 1, r: 50, slot: 0, in: s.at(0) + s.speech(0) * 0.7, out: s.at(1) + s.speech(1) * 0.35 };
        const twoMore = { kind: "mouse", n: 2, r: 32, slot: 0, in: s.at(1) + s.speech(1) * 0.35 + 10 };
        return (
          <>
            <Words x={170} w={760} y={250} size={60} appear={rise(s.t, 20, s.at(0) + 6)}>Draw each fact as a balance.</Words>
            <Words x={170} w={760} y={420} size={60} appear={rise(s.t, 20, s.at(1) + 6)}>Swap for things that weigh the same.</Words>
            <Words x={170} w={760} y={600} size={46} italic color={C.giltDark} appear={rise(s.t, 20, s.at(2) + 6)}>The scale stays balanced.</Words>
            <Balance t={s.t} cx={1370} pivot={360} len={440} appear={rise(s.t, 20, s.at(0) + 10)}
              left={[mice]} right={[cat, twoMore]} tips={[{ at: mice.in + 6, to: -10 }, { at: cat.in + 6, to: 0 }]}
              glow={window(s.t, s.at(2), s.length, 16)} />
            <Note x={1250} y={180} size={32} appear={window(s.t, s.at(1) + s.speech(1) * 0.4, s.at(2) + 10)}>1 cat = 2 mice</Note>
          </>
        );
      },
    },

    // Worked example 1: two steps.
    {
      beats: [
        { say: "Try this one. Three rabbits weigh as much as one goat." },
        { say: "Two goats weigh as much as one pony." },
        { say: "How many rabbits weigh as much as a pony?" },
        { say: "The pony's scale has goats on it, but we want rabbits. So let's swap." },
        { say: "Each goat weighs the same as three rabbits. So swap the first goat for three rabbits." },
        { say: "And the second goat for three more." },
        { say: "Now count them. One, two, three, four, five, six. Six rabbits balance one pony! The answer is six.", sfx: "chime", sfxAt: 5.6 },
      ],
      render: s => {
        const a0 = s.at(0), a1 = s.at(1);
        const rabbitsA = { kind: "rabbit", n: 3, r: 30, slot: 0, in: a0 + s.speech(0) * 0.35 };
        const goatA = { kind: "goat", n: 1, r: 48, slot: 0, in: a0 + s.speech(0) * 0.8 };
        const swap1 = s.at(4) + s.speech(4) * 0.62, swap2 = s.at(5) + s.speech(5) * 0.3;
        const goat1 = { kind: "goat", n: 1, r: 42, slot: 0, in: a1 + s.speech(1) * 0.2, out: swap1 };
        const goat2 = { kind: "goat", n: 1, r: 42, slot: 1, in: a1 + s.speech(1) * 0.3, out: swap2 };
        const r1 = { kind: "rabbit", n: 3, r: 26, slot: 0, in: swap1 + 8 };
        const r2 = { kind: "rabbit", n: 3, r: 26, slot: 1, in: swap2 + 8 };
        const pony = { kind: "pony", n: 1, r: 54, slot: 0, in: a1 + s.speech(1) * 0.75 };
        const countStart = s.at(6) + s.speech(6) * 0.2;
        const countGap = (s.speech(6) * 0.38) / 6;
        return (
          <>
            <Words x={L - 380} w={760} y={180} size={38} align="center" appear={rise(s.t, 18, a0)}>Three rabbits weigh as much as one goat.</Words>
            <Words x={R - 380} w={760} y={180} size={38} align="center" appear={rise(s.t, 18, a1)}>Two goats weigh as much as one pony.</Words>
            <Balance t={s.t} cx={L} pivot={PIVOT} appear={rise(s.t, 20, 6)}
              left={[rabbitsA]} right={[goatA]} tips={[{ at: rabbitsA.in + 6, to: -10 }, { at: goatA.in + 6, to: 0 }]}
              glow={window(s.t, s.at(4), s.at(5) + s.speech(5) * 0.5, 14)} />
            <Balance t={s.t} cx={R} pivot={PIVOT} appear={rise(s.t, 20, a1)} slots={[2, 1]}
              left={[goat1, goat2, r1, r2]} right={[pony]} tips={[{ at: goat1.in + 6, to: -8 }, { at: pony.in + 6, to: 0 }]}
              count={{ side: "left", start: countStart, gap: countGap }} />
            <Ring x={R - 210} y={PIVOT + 90} w={260} h={170} progress={rise(s.t, 22, s.at(3) + s.speech(3) * 0.3) * (1 - rise(s.t, 10, s.at(4)))} />
            <Note x={L - 90} y={PIVOT + 196} size={30} appear={window(s.t, s.at(4) + 10, s.at(6))}>1 goat = 3 rabbits</Note>
            <Question s={s} text="How many rabbits weigh as much as a pony?" appear={rise(s.t, 18, s.at(2))}
              answer="6" answerAt={s.at(6) + s.speech(6) * 0.72} />
          </>
        );
      },
    },

    // Worked example 2: "half as much", and the trap.
    {
      beats: [
        { say: "Here's a trickier one. Four mice weigh as much as one cat." },
        { say: "A cat weighs half as much as a dog." },
        { say: "Careful, here's the trap. Which is heavier, the cat or the dog?" },
        { say: "The cat weighs only half as much, so the dog is the heavy one. It takes two cats to balance one dog." },
        { say: "If you read it the wrong way round, you'd think one cat balances two dogs, and you'd get the answer two. That's the trap!" },
        { say: "Now swap each cat for four mice. Four, and four more." },
        { say: "Eight mice balance one dog. The answer is eight.", sfx: "chime", sfxAt: 1.2 },
      ],
      render: s => {
        const a0 = s.at(0), a3 = s.at(3);
        const miceA = { kind: "mouse", n: 4, r: 25, slot: 0, in: a0 + s.speech(0) * 0.45 };
        const catA = { kind: "cat", n: 1, r: 48, slot: 0, in: a0 + s.speech(0) * 0.85 };
        const dog = { kind: "dog", n: 1, r: 56, slot: 0, in: a3 + s.speech(3) * 0.3 };
        const swap1 = s.at(5) + s.speech(5) * 0.45, swap2 = s.at(5) + s.speech(5) * 0.75;
        const cat1 = { kind: "cat", n: 1, r: 42, slot: 0, in: a3 + s.speech(3) * 0.62, out: swap1 };
        const cat2 = { kind: "cat", n: 1, r: 42, slot: 1, in: a3 + s.speech(3) * 0.72, out: swap2 };
        const m1 = { kind: "mouse", n: 4, r: 22, slot: 0, in: swap1 + 8 };
        const m2 = { kind: "mouse", n: 4, r: 22, slot: 1, in: swap2 + 8 };
        const heavier = window(s.t, s.at(2) + s.speech(2) * 0.4, s.at(4));
        return (
          <>
            <Words x={L - 380} w={760} y={180} size={38} align="center" appear={rise(s.t, 18, a0)}>Four mice weigh as much as one cat.</Words>
            <Words x={R - 380} w={760} y={180} size={38} align="center" appear={rise(s.t, 18, s.at(1))}>
              A cat weighs <span style={{ background: s.t > s.at(2) ? C.highlight : "transparent", padding: "0 6px", borderRadius: 6 }}>half as much</span> as a dog.
            </Words>
            <Balance t={s.t} cx={L} pivot={PIVOT} appear={rise(s.t, 20, 6)}
              left={[miceA]} right={[catA]} tips={[{ at: miceA.in + 10, to: -10 }, { at: catA.in + 6, to: 0 }]}
              glow={window(s.t, s.at(5), s.at(6), 14)} />
            <Balance t={s.t} cx={R} pivot={PIVOT} appear={rise(s.t, 20, s.at(1))} slots={[2, 1]}
              left={[cat1, cat2, m1, m2]} right={[dog]}
              tips={[{ at: dog.in + 6, to: 12 }, { at: cat1.in + 6, to: 5 }, { at: cat2.in + 6, to: 0 }]}
              count={{ side: "left", start: s.at(6) + 6, gap: (s.speech(6) * 0.3) / 8 }} />
            <Note x={R - 150} y={PIVOT + 200} size={32} bg="#F3E9DF" color={C.mud} appear={heavier}>which is heavier?</Note>
            <Note x={R - 140} y={PIVOT + 200} size={32} appear={window(s.t, s.at(4), s.at(5), 12)}>1 dog = 2 cats</Note>
            <Note x={L - 90} y={PIVOT + 200} size={30} appear={window(s.t, s.at(5), s.at(6) + 20)}>1 cat = 4 mice</Note>
            <Question s={s} text="How many mice weigh as much as a dog?" appear={rise(s.t, 18, s.at(2))}
              answer="8" answerAt={s.at(6) + s.speech(6) * 0.72} wrong="2" wrongAt={s.at(4) + s.speech(4) * 0.62} />
          </>
        );
      },
    },

    // Your turn.
    {
      beats: [
        { say: "Your turn. Three ducks weigh as much as one goose. A goose weighs half as much as a dog. How many ducks weigh as much as a dog? Pause the video if you'd like more time.", hold: 7 },
        { say: "Did you get six? The dog is the heavy one, so it balances two geese." },
        { say: "Swap each goose for three ducks. Three and three make six!", sfx: "chime", sfxAt: 2.8 },
      ],
      render: s => {
        const b1 = s.at(1), b2 = s.at(2);
        const ducksA = { kind: "duck", n: 3, r: 30, slot: 0, in: b1 + 4 };
        const gooseA = { kind: "goose", n: 1, r: 48, slot: 0, in: b1 + 14 };
        const dog = { kind: "dog", n: 1, r: 56, slot: 0, in: b1 + s.speech(1) * 0.35 };
        const swap1 = b2 + s.speech(2) * 0.3, swap2 = b2 + s.speech(2) * 0.5;
        const g1 = { kind: "goose", n: 1, r: 42, slot: 0, in: b1 + s.speech(1) * 0.7, out: swap1 };
        const g2 = { kind: "goose", n: 1, r: 42, slot: 1, in: b1 + s.speech(1) * 0.8, out: swap2 };
        const d1 = { kind: "duck", n: 3, r: 26, slot: 0, in: swap1 + 8 };
        const d2 = { kind: "duck", n: 3, r: 26, slot: 1, in: swap2 + 8 };
        const thinking = window(s.t, s.at(0) + s.speech(0) * 0.85, b1);
        return (
          <>
            <Words x={L - 380} w={760} y={180} size={38} align="center" appear={rise(s.t, 18, 10)}>Three ducks weigh as much as one goose.</Words>
            <Words x={R - 380} w={760} y={180} size={38} align="center" appear={rise(s.t, 18, s.at(0) + s.speech(0) * 0.25)}>A goose weighs half as much as a dog.</Words>
            <Balance t={s.t} cx={L} pivot={PIVOT} appear={rise(s.t, 20, 14)}
              left={[ducksA]} right={[gooseA]} tips={[{ at: ducksA.in + 6, to: -10 }, { at: gooseA.in + 6, to: 0 }]} />
            <Balance t={s.t} cx={R} pivot={PIVOT} appear={rise(s.t, 20, s.at(0) + s.speech(0) * 0.3)} slots={[2, 1]}
              left={[g1, g2, d1, d2]} right={[dog]}
              tips={[{ at: dog.in + 6, to: 12 }, { at: g1.in + 6, to: 5 }, { at: g2.in + 6, to: 0 }]}
              count={{ side: "left", start: b2 + s.speech(2) * 0.62, gap: 5 }} />
            <Question s={s} text="Your turn: how many ducks weigh as much as a dog?" appear={rise(s.t, 18, s.at(0) + s.speech(0) * 0.55)}
              answer="6" answerAt={b2 + s.speech(2) * 0.85} hideMark={thinking} />
            <div style={{ opacity: thinking }}>
              <Countdown x={1608} y={782} t={s.t} start={s.at(0) + s.speech(0)} seconds={7} size={104} />
            </div>
          </>
        );
      },
    },

    // Recap.
    {
      beats: [
        { say: "So, to solve any balancing puzzle." },
        { say: "One. Draw each fact as a balance." },
        { say: "Two. Work out which is heavier. Half as much means the other one is twice as heavy." },
        { say: "Three. Swap until everything is the same animal." },
        { say: "Four. Count them up." },
      ],
      render: s => (
        <>
          <Words x={260} w={1400} y={170} size={46} italic color={C.soft} align="center" appear={rise(s.t, 18, 4)}>To solve a balancing puzzle</Words>
          <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={500} y={290} steps={[
            "Draw each fact as a balance.",
            "Work out which is heavier.",
            "Swap until it's all one animal.",
            "Count them up.",
          ]} />
        </>
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Perfectly balanced. Nothing gets past you.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <TitleCard t={s.t} title="Balanced" strap="Nothing gets past you." emblem="scales" />,
    },
  ],
};
