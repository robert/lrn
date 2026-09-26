// Grids: a grid with one missing square. Which answer completes it?
// All figures here are drawn fresh for this video.
import React from "react";
import { C, SERIF } from "../lib/theme.js";
import { rise, window } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";
import { Plate, Ring, Strike, Seal, Words, Note, TitleCard, Countdown, Steps, Emblem } from "../lib/ui.jsx";

// ---------- Figures (each is draw => SVG, centred on 0,0) ----------
const arrow = rot => draw => <Shape kind="arrow" r={62} rot={rot} draw={draw} />;
const shape = (kind, fill) => draw => <Shape kind={kind} r={kind === "triangle" ? 46 : 42} fill={fill} draw={draw} />;
const squares = (n, fill) => draw => (n === 1
  ? [<Shape key={0} kind="square" r={30} fill={fill} draw={draw} />]
  : [-38, 38].slice(0, n).map((x, i) => <Shape key={i} kind="square" x={x} r={30} fill={fill} draw={draw} />));
const plain = draw => <Shape kind="circle" r={48} fill="grey" draw={draw} />;

// ---------- The grid board ----------
// Drawn like the exam: one white board with ink lines between the squares.
// `cells` is a list of rows; null marks the gap.
function Board({ s, x, y, cell, cells, start = 0, answer, answerAt = Infinity, rows = [], cols = [], scale = 1 }) {
  const n = cells.length;
  const size = n * cell;
  const a = rise(s.t, 18, start);
  const centre = (r, c) => [c * cell + cell / 2, r * cell + cell / 2];
  return (
    <div style={{ position: "absolute", left: x, top: y + (1 - a) * 20, width: size, height: size, opacity: a }}>
      <div style={{ position: "absolute", inset: 0, background: C.white, borderRadius: 4, boxShadow: "0 18px 40px -24px rgba(27,42,36,0.5)" }} />
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* highlighted rows and columns sit behind the figures */}
        {rows.map((k, r) => k > 0 && <rect key={`r${r}`} x={0} y={r * cell} width={size * Math.min(1, k * 1.2)} height={cell} fill={C.highlight} opacity={0.9} />)}
        {cols.map((k, c) => k > 0 && <rect key={`c${c}`} x={c * cell} y={0} width={cell} height={size * Math.min(1, k * 1.2)} fill={C.highlight} opacity={0.9} />)}
        {cells.flatMap((row, r) => row.map((f, c) => {
          const [cx, cy] = centre(r, c);
          if (f === null) {
            const filled = answer && s.t >= answerAt;
            return (
              <g key={`${r}${c}`} transform={`translate(${cx} ${cy})`}>
                {filled
                  ? <g transform={`scale(${scale})`}>{answer(rise(s.t, 30, answerAt))}</g>
                  : <text y={cell * 0.16} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={cell * 0.42} fill={C.faint}>?</text>}
                {filled && <rect x={-cell / 2 + 6} y={-cell / 2 + 6} width={cell - 12} height={cell - 12} fill="none" stroke={C.gilt} strokeWidth={4} rx={4} opacity={rise(s.t, 12, answerAt)} />}
              </g>
            );
          }
          return <g key={`${r}${c}`} transform={`translate(${cx} ${cy}) scale(${scale})`}>{f(rise(s.t, 34, start + 6 + (r * n + c) * 6))}</g>;
        }))}
        {Array.from({ length: n - 1 }, (_, i) => (
          <g key={i}>
            <line x1={(i + 1) * cell} y1={0} x2={(i + 1) * cell} y2={size} stroke={C.ink} strokeWidth={2.5} />
            <line x1={0} y1={(i + 1) * cell} x2={size} y2={(i + 1) * cell} stroke={C.ink} strokeWidth={2.5} />
          </g>
        ))}
        <rect x={0} y={0} width={size} height={size} fill="none" stroke={C.ink} strokeWidth={3.5} />
      </svg>
    </div>
  );
}

// The four answers, lettered a to d, in a row to the right of the grid.
function Options({ s, x, y, size = 150, gap = 36, options, appearAt, correct, sealAt = Infinity, strikes = {}, scale = 0.75 }) {
  return options.map((f, i) => {
    const ox = x + i * (size + gap);
    const struck = strikes[i] !== undefined ? rise(s.t, 14, strikes[i]) : 0;
    return (
      <div key={i}>
        <Plate x={ox} y={y} w={size} h={size} label={"abcd"[i]} appear={rise(s.t, 16, appearAt + i * 6)}
          dim={struck} glow={i === correct && s.t >= sealAt ? 1 : 0}>
          <g transform={`scale(${scale})`}>{f(rise(s.t, 30, appearAt + i * 6 + 4))}</g>
        </Plate>
        <Strike x={ox} y={y} w={size} h={size} progress={struck} />
        {i === correct && <Seal x={ox + size - 8} y={y + 8} size={62} t={s.t} start={sealAt} />}
      </div>
    );
  });
}

// A short label beside a row or column of the grid.
function Side({ x, y, children, appear, color = C.giltDark, size = 36 }) {
  return (
    <div style={{
      position: "absolute", left: x, top: y + (1 - appear) * 8, opacity: appear,
      fontFamily: SERIF, fontStyle: "italic", fontSize: size, color, whiteSpace: "nowrap",
    }}>{children}</div>
  );
}

// ---------- The puzzles ----------
const B1 = { x: 270, y: 190, cell: 232 }; // 2x2 board
const O1 = { x: 1070, y: 360 };
const EX1 = {
  cells: [[arrow(-90), arrow(0)], [arrow(180), null]],
  answer: arrow(-90),
  options: [arrow(0), arrow(-90), arrow(90), arrow(180)],
  correct: 1,
};

const B2 = { x: 250, y: 160, cell: 196 }; // 3x3 board
const O2 = { x: 1070, y: 380 };
const g = shape;
const EX2 = {
  cells: [
    [g("circle", "grey"), g("triangle", "grey"), g("circle", "grey")],
    [g("triangle", "black"), g("circle", "black"), g("triangle", "black")],
    [g("circle", "white"), g("triangle", "white"), null],
  ],
  answer: g("circle", "white"),
  options: [g("circle", "black"), g("triangle", "white"), g("circle", "white"), g("circle", "grey")],
  correct: 2,
};

const TRY = {
  cells: [[squares(1, "black"), squares(2, "black")], [squares(1, "white"), null]],
  answer: squares(2, "white"),
  options: [squares(2, "black"), squares(1, "white"), draw => [-58, 0, 58].map((x, i) => <Shape key={i} kind="square" x={x} r={24} fill="white" draw={draw} />), squares(2, "white")],
  correct: 3,
};

const cellCentre = (b, r, c) => ({ x: b.x + c * b.cell + b.cell / 2, y: b.y + r * b.cell + b.cell / 2 });

// ---------- The video ----------
export default {
  id: "grids",
  order: 7,
  title: "Grids",
  cloth: "spotter",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Grids. One square in the grid is missing, and you need to work out what belongs there.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <TitleCard t={s.t} kicker="Picture puzzles" title="Grids" strap="Find the missing square." emblem="grid" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "In a grids question, you see a grid of squares, with one square missing." },
        { say: "Beside it are some answers. You need to choose the one that fits the gap." },
      ],
      render: s => (
        <>
          <Board s={s} {...B1} cells={[[plain, plain], [plain, null]]} scale={0.9} />
          <Options s={s} {...O1} options={[plain, plain, plain, plain]} appearAt={s.at(1) + 6} correct={-1} scale={0.7} />
          <Words x={O1.x} w={706} y={O1.y - 110} size={52} align="center" appear={rise(s.t, 18, s.at(1) + s.speech(1) * 0.55)}>
            Which one fits the gap?
          </Words>
        </>
      ),
    },

    // The secret.
    {
      beats: [
        { say: "The pattern in a grid works in two directions." },
        { say: "Read across the rows, and then read down the columns. You should also check from corner to corner." },
        { say: "Find the rule, and make sure your answer fits it both ways." },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="grid" size={84} />
          </div>
          <Words x={210} w={1500} y={360} size={74} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>
            Read across, then read down.
          </Words>
          <Words x={210} w={1500} y={470} size={52} italic color={C.soft} align="center" appear={rise(s.t, 20, s.at(1) + s.speech(1) * 0.6)}>
            Check from corner to corner too.
          </Words>
          <Words x={210} w={1500} y={590} size={74} align="center" appear={rise(s.t, 20, s.at(2) + s.speech(2) * 0.45)}>
            The answer fits both ways.
          </Words>
        </>
      ),
    },

    // Worked example 1: a 2 by 2 grid of turning arrows.
    {
      beats: [
        { say: "Let's try one. Which arrow fills the gap?" },
        { say: "Read across the top row. The arrow points up, and then it points right." },
        { say: "So going across, it turns a quarter turn, clockwise." },
        { say: "The bottom row starts with an arrow pointing left. A quarter turn clockwise from left is up." },
        { say: "Now check down the columns. On the left, up turns into left. That is a quarter turn the other way." },
        { say: "So on the right, the arrow pointing right turns the other way too, into up." },
        { say: "Reading across and reading down both give an arrow pointing up. That's answer b.", sfx: "chime", sfxAt: 4.0 },
      ],
      render: s => {
        const row0 = window(s.t, s.at(1) + 10, s.at(3), 12);
        const row1 = window(s.t, s.at(3) + 10, s.at(4), 12);
        const col0 = window(s.t, s.at(4) + 10, s.at(5), 12);
        const col1 = window(s.t, s.at(5) + 10, s.at(6) + 20, 12);
        const right = B1.x + 2 * B1.cell + 26;
        return (
          <>
            <Board s={s} {...B1} cells={EX1.cells} answer={EX1.answer} answerAt={s.at(3) + s.speech(3) * 0.85}
              rows={[row0, row1]} cols={[col0, col1]} />
            <Side x={right} y={B1.y + B1.cell / 2 - 26} appear={window(s.t, s.at(2) + s.speech(2) * 0.3, s.at(3) + 6)}>¼ turn clockwise</Side>
            <Side x={right} y={B1.y + 1.5 * B1.cell - 26} appear={window(s.t, s.at(3) + s.speech(3) * 0.6, s.at(4) + 6)}>left becomes up</Side>
            <Side x={B1.x} y={B1.y + 2 * B1.cell + 18} appear={window(s.t, s.at(4) + s.speech(4) * 0.6, s.at(5) + 6)}>¼ turn back</Side>
            <Side x={B1.x + B1.cell} y={B1.y + 2 * B1.cell + 18} appear={window(s.t, s.at(5) + s.speech(5) * 0.6, s.length)}>right becomes up</Side>
            <Options s={s} {...O1} options={EX1.options} appearAt={s.at(0) + 24} correct={EX1.correct} sealAt={s.at(6) + s.speech(6) * 0.85} />
          </>
        );
      },
    },

    // Worked example 2: a 3 by 3 grid with two rules and a trap.
    {
      beats: [
        { say: "Here is a bigger one. It has three rows and three columns, and the last square is missing." },
        { say: "Read across each row. The top row is all grey. The middle row is all black." },
        { say: "The bottom row is white, so the missing square must be white." },
        { say: "Now look from corner to corner. Circles and triangles take turns, like the squares on a chessboard." },
        { say: "The missing square is at the end of the circles' diagonal, so it needs a circle." },
        { say: "So the answer is a white circle. That's answer c.", sfx: "chime", sfxAt: 2.2 },
        { say: "Be careful with answer a. It has the right shape but the wrong shading, so it follows only one of the two rules." },
      ],
      render: s => {
        const r0 = window(s.t, s.at(1) + s.speech(1) * 0.2, s.at(3), 12);
        const r1 = window(s.t, s.at(1) + s.speech(1) * 0.6, s.at(3), 12);
        const r2 = window(s.t, s.at(2) + 6, s.at(3), 12);
        const right = B2.x + 3 * B2.cell + 24;
        const diag = [[0, 0], [1, 1], [2, 2]];
        return (
          <>
            <Board s={s} {...B2} cells={EX2.cells} answer={EX2.answer} answerAt={s.at(5) + 8}
              rows={[r0, r1, r2]} />
            {["grey", "black", "white"].map((w, r) => (
              <Side key={w} x={right} y={B2.y + r * B2.cell + B2.cell / 2 - 26}
                appear={rise(s.t, 12, [s.at(1) + s.speech(1) * 0.3, s.at(1) + s.speech(1) * 0.75, s.at(2) + s.speech(2) * 0.25][r])}>{w}</Side>
            ))}
            {diag.map(([r, c], i) => (
              <Ring key={i} {...cellCentre(B2, r, c)} w={B2.cell - 20} h={B2.cell - 20}
                progress={rise(s.t, 18, (i < 2 ? s.at(3) + s.speech(3) * (0.35 + i * 0.12) : s.at(4) + s.speech(4) * 0.4)) * (1 - rise(s.t, 8, s.at(6)))} />
            ))}
            <Options s={s} {...O2} options={EX2.options} appearAt={s.at(0) + 30} correct={EX2.correct}
              sealAt={s.at(5) + s.speech(5) * 0.72} strikes={{ 0: s.at(6) + s.speech(6) * 0.2 }} />
            <Note x={O2.x - 10} y={O2.y + 230} size={32} bg="#F3E9DF" color={C.mud}
              appear={rise(s.t, 16, s.at(6) + s.speech(6) * 0.35)}>right shape, wrong shading</Note>
          </>
        );
      },
    },

    // Your turn.
    {
      beats: [
        { say: "Now it's your turn. Which answer completes the grid? Pause the video if you would like more time.", hold: 6 },
        { say: "Here is the answer. Across each row, one square becomes two. Down each column, black becomes white." },
        { say: "So the gap needs two white squares. That's answer d.", sfx: "chime", sfxAt: 2.0 },
      ],
      render: s => {
        const right = B1.x + 2 * B1.cell + 26;
        return (
          <>
            <Board s={s} {...B1} cells={TRY.cells} answer={TRY.answer} answerAt={s.at(2) + 10} />
            <Side x={right} y={B1.y + B1.cell / 2 - 26} appear={rise(s.t, 12, s.at(1) + s.speech(1) * 0.3)}>one becomes two</Side>
            <Side x={B1.x + 20} y={B1.y + 2 * B1.cell + 18} appear={rise(s.t, 12, s.at(1) + s.speech(1) * 0.75)}>black becomes white</Side>
            <Options s={s} {...O1} options={TRY.options} appearAt={30} correct={TRY.correct} sealAt={s.at(2) + s.speech(2) * 0.7} />
            <div style={{ opacity: window(s.t, s.at(0) + s.speech(0), s.at(1)) }}>
              <Countdown x={O1.x + 353} y={O1.y + 330} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={150} />
            </div>
            <Words x={O1.x} y={O1.y - 100} w={706} size={42} italic color={C.soft} align="center" appear={window(s.t, 10, s.at(1))}>Your turn</Words>
          </>
        );
      },
    },

    // Recap.
    {
      beats: [
        { say: "Here is what to do for any grid." },
        { say: "First, read across every row." },
        { say: "Next, read down every column." },
        { say: "Then check from corner to corner." },
        { say: "Last, choose the answer that fits both ways." },
      ],
      render: s => (
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={440} y={250} steps={[
          "Read across every row.",
          "Read down every column.",
          "Check from corner to corner.",
          "Choose the answer that fits both ways.",
        ]} />
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Now you know how to find the missing square in a grid. Well done.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <TitleCard t={s.t} title="Well done" strap="Read across, then read down." emblem="eye" />,
    },
  ],
};
