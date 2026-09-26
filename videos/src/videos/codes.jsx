// Codes: work out what each letter means, then code a new figure.
// All figures here are drawn fresh for this video.
import React from "react";
import { C, SERIF, SANS } from "../lib/theme.js";
import { rise, pop, window } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";
import { Plate, Ring, Strike, Seal, Words, Note, Code, TitleCard, Countdown, Steps, Emblem, Arrow } from "../lib/ui.jsx";

// ---------- Layout shared by the worked examples ----------
// Three coded figures down the left, the new figure in the middle,
// the key top right and the four answers bottom right.
const P = 188; // plate size
const COL = { x: 170, ys: [178, 400, 622] };
const CODE_X = COL.x + P + 34;
const TEST = { x: 720, y: 360, size: 240 };
const KEY = { x: 1150, y: 172, w: 600 };
const OPTS = { x: 1150, y: 596, w: 135, gap: 20 };

function CodedColumn({ s, figures, glowLetters = {}, drawStart = 0 }) {
  return figures.map((f, i) => {
    const a = rise(s.t, 20, drawStart + i * 14);
    const draw = rise(s.t, 36, drawStart + i * 14 + 4);
    return (
      <div key={i}>
        <Plate x={COL.x} y={COL.ys[i]} w={P} h={P} appear={a}>
          <Shape {...f.shape} draw={draw} />
        </Plate>
        <div style={{ position: "absolute", left: CODE_X, top: COL.ys[i] + P / 2 - 40, opacity: rise(s.t, 16, drawStart + i * 14 + 20), display: "flex", gap: 4 }}>
          {f.code.split("").map((ch, j) => {
            const g = glowLetters[`${i}${j}`] ?? 0;
            return (
              <span key={j} style={{
                fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: 4,
                color: g > 0 ? mixInk(g) : C.ink,
                textShadow: g > 0 ? `0 0 ${22 * g}px rgba(201,162,75,${0.85 * g})` : "none",
              }}>{ch}</span>
            );
          })}
        </div>
      </div>
    );
  });
}
const mixInk = g => (g > 0.5 ? C.giltDark : C.ink);

// The code-breaker's key: rows like "K  means  triangle" that write themselves in.
function Key({ s, rows }) {
  const a = rise(s.t, 18, rows[0]?.at ?? 0);
  return (
    <div style={{
      position: "absolute", left: KEY.x, top: KEY.y, width: KEY.w, padding: "26px 34px 18px",
      background: C.white, borderRadius: 10, opacity: a,
      boxShadow: `0 0 0 1.5px ${C.ruleSoft}, 0 18px 40px -26px rgba(27,42,36,0.5)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: SERIF, fontStyle: "italic", fontSize: 34, color: C.soft, marginBottom: 12 }}>
        <Emblem name="key" size={40} color={C.gilt} /> The key
      </div>
      {rows.map((r, i) => {
        const k = rise(s.t, 16, r.at);
        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 22, height: 64, opacity: k, transform: `translateX(${(1 - k) * 14}px)` }}>
            <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, color: C.giltDark, width: 44 }}>{r.letter}</span>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 32, color: C.soft }}>means</span>
            <span style={{ fontFamily: SERIF, fontSize: 44, color: C.ink }}>{r.meaning}</span>
          </div>
        );
      })}
    </div>
  );
}

// The four answer choices, lettered a to d.
function Options({ s, options, appearAt, correct, sealAt, strikes = {} }) {
  return options.map((o, i) => {
    const x = OPTS.x + i * (OPTS.w + OPTS.gap);
    const a = rise(s.t, 16, appearAt + i * 5);
    const struck = strikes[i] !== undefined ? rise(s.t, 14, strikes[i]) : 0;
    const win = i === correct && s.t >= sealAt;
    return (
      <div key={i}>
        <div style={{
          position: "absolute", left: x, top: OPTS.y, width: OPTS.w, height: 110, borderRadius: 10,
          background: C.white, opacity: a * (1 - struck * 0.55),
          boxShadow: `0 0 0 ${win ? 3 : 1.5}px ${win ? C.gilt : C.rule}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: SANS, fontWeight: 800, fontSize: 52, letterSpacing: 4, color: C.ink,
        }}>{o}</div>
        <div style={{ position: "absolute", left: x, width: OPTS.w, top: OPTS.y + 122, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 36, color: C.soft, opacity: a }}>
          {"abcd"[i]}
        </div>
        <Strike x={x} y={OPTS.y} w={OPTS.w} h={110} progress={struck} />
        {i === correct && <Seal x={x + OPTS.w - 6} y={OPTS.y + 4} size={64} t={s.t} start={sealAt} />}
      </div>
    );
  });
}

// The new, uncoded figure, with its code building underneath.
function TestFigure({ s, shape, appearAt, built = "", buildAt = [] }) {
  const a = rise(s.t, 18, appearAt);
  return (
    <>
      <Plate x={TEST.x} y={TEST.y} w={TEST.size} h={TEST.size} appear={a} glow={buildAt.length && s.t > buildAt[0] ? 0.6 : 0}>
        <Shape {...shape} draw={rise(s.t, 36, appearAt + 4)} />
      </Plate>
      <div style={{ position: "absolute", left: TEST.x, width: TEST.size, top: TEST.y + TEST.size + 18, textAlign: "center", display: "flex", justifyContent: "center", gap: 8, opacity: a }}>
        {[0, 1].map(j => {
          const k = buildAt[j] !== undefined ? pop(s.t, buildAt[j]) : 0;
          return (
            <span key={j} style={{
              width: 64, height: 78, borderBottom: `3px solid ${C.rule}`,
              fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.giltDark,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ opacity: k, transform: `scale(${0.6 + 0.4 * k})` }}>{k > 0 ? built[j] : ""}</span>
            </span>
          );
        })}
      </div>
    </>
  );
}

// ---------- The puzzles ----------
const EX1 = {
  figures: [
    { shape: { kind: "triangle", r: 60, fill: "black" }, code: "KF" },
    { shape: { kind: "triangle", r: 60, fill: "white" }, code: "KD" },
    { shape: { kind: "square", r: 60, fill: "black" }, code: "LF" },
  ],
  test: { kind: "square", r: 72, fill: "white" },
  options: ["KD", "LF", "LD", "DL"],
  correct: 2,
};

const EX2 = {
  figures: [
    { shape: { kind: "arrow", r: 66, rot: -90, fill: "white" }, code: "PS" },
    { shape: { kind: "arrow", r: 40, rot: 90, fill: "white" }, code: "QS" },
    { shape: { kind: "arrow", r: 42, rot: -90, fill: "white", line: "dotted" }, code: "PT" },
  ],
  test: { kind: "arrow", r: 80, rot: 90, fill: "white", line: "dotted" },
  options: ["PT", "QT", "QS", "TQ"],
  correct: 1,
};

const TRY = {
  figures: [
    { shape: { kind: "hexagon", r: 58, fill: "grey" }, code: "GX" },
    { shape: { kind: "hexagon", r: 58, fill: "grey", line: "double" }, code: "GY" },
    { shape: { kind: "heart", r: 58, fill: "grey" }, code: "HX" },
  ],
  test: { kind: "heart", r: 74, fill: "grey", line: "double" },
  options: ["HX", "GY", "YH", "HY"],
  correct: 3,
};

// Where the code letters sit, for drawing rings round them.
const letterAt = (row, col) => ({ x: CODE_X + 22 + col * 44, y: COL.ys[row] + P / 2 - 2 });
const plateAt = row => ({ x: COL.x + P / 2, y: COL.ys[row] + P / 2 });

// ---------- The video ----------
export default {
  id: "codes",
  order: 4,
  title: "Codes",
  cloth: "spotter",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Codes. In these questions, each letter tells you one thing about a picture. Let's learn how to work out what the letters mean.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <TitleCard t={s.t} kicker="Picture puzzles" title="Codes" strap="Each letter tells you something about the picture." emblem="key" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "In a codes question, each figure has a code made of letters." },
        { say: "Each letter stands for one thing about the figure, such as its shape, its colour or which way it points." },
        { say: "You need to work out what each letter means. Then you write the code for a new figure that does not have one yet." },
      ],
      render: s => (
        <>
          <CodedColumn s={s} figures={EX1.figures} />
          <div style={{ opacity: window(s.t, s.at(1), s.at(2) + 12) }}>
            {["shape", "colour"].map((w, j) => (
              <Note key={w} x={j ? CODE_X + 110 : CODE_X - 40} y={j ? COL.ys[0] + P / 2 - 26 : COL.ys[0] - 56} appear={rise(s.t, 14, s.at(1) + 20 + j * 24)} size={30}>{j ? "F: colour" : "K: shape"}</Note>
            ))}
          </div>
          <TestFigure s={s} shape={EX1.test} appearAt={s.at(2) + 16} />
          <Words x={TEST.x - 60} w={TEST.size + 120} y={TEST.y - 76} size={42} italic color={C.soft} align="center" appear={rise(s.t, 16, s.at(2) + 40)}>No code yet</Words>
          <Words x={1150} y={380} w={600} size={54} appear={rise(s.t, 20, s.at(2) + 60)}>
            Work out each letter.<br />Then write the new code.
          </Words>
        </>
      ),
    },

    // The golden rule.
    {
      beats: [
        { say: "Start by finding two figures that have the same letter." },
        { say: "Then look at what is the same about those two pictures. The thing they share is what the letter means." },
        { say: "Be careful, though. Some things change between the pictures but are not part of the code at all, so you can ignore them." },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 250, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="key" size={84} />
          </div>
          <Words x={210} w={1500} y={380} size={74} align="center" appear={rise(s.t, 20, s.at(0) + 6)}>
            Two figures share a letter.
          </Words>
          <Words x={210} w={1500} y={494} size={74} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>
            What they share is what it means.
          </Words>
          <Words x={210} w={1500} y={640} size={50} italic color={C.mud} align="center" appear={rise(s.t, 20, s.at(2) + 6)}>
            Some changes are not part of the code.
          </Words>
        </>
      ),
    },

    // Worked example 1.
    {
      beats: [
        { say: "Let's try one. Here are three figures, each with a two letter code." },
        { say: "Start with the first letters. Two figures share the letter K." },
        { say: "Both of those pictures are triangles, so K means triangle." },
        { say: "The other first letter is L, and that figure is a square. So L means square." },
        { say: "Now the second letters. The first and third figures both end in F, and they're both black. So F means black." },
        { say: "That leaves D, which is on the white triangle. So D means white." },
        { say: "Now the new figure. It's a square, so its first letter is L. It's white, so its second letter is D." },
        { say: "L, D. That's answer c.", sfx: "chime", sfxAt: 0.2 },
        { say: "Be careful with answer d. D, L has the right letters, but they are in the wrong order. The shape letter always comes first." },
      ],
      render: s => {
        const glow = {};
        glow["00"] = window(s.t, s.at(1) + 10, s.at(3));
        glow["10"] = glow["00"];
        glow["21"] = window(s.t, s.at(4) + 10, s.at(5));
        glow["01"] = glow["21"];
        const keyRows = [
          { letter: "K", meaning: "triangle", at: s.at(2) + s.speech(2) * 0.65 },
          { letter: "L", meaning: "square", at: s.at(3) + s.speech(3) * 0.7 },
          { letter: "F", meaning: "black", at: s.at(4) + s.speech(4) * 0.8 },
          { letter: "D", meaning: "white", at: s.at(5) + s.speech(5) * 0.72 },
        ];
        return (
          <>
            <CodedColumn s={s} figures={EX1.figures} glowLetters={glow} />
            <Ring {...letterAt(0, 0)} w={70} h={82} progress={rise(s.t, 20, s.at(1) + 20) * (1 - rise(s.t, 8, s.at(3)))} />
            <Ring {...letterAt(1, 0)} w={70} h={82} progress={rise(s.t, 20, s.at(1) + 30) * (1 - rise(s.t, 8, s.at(3)))} />
            <Ring {...plateAt(0)} w={P + 10} h={P + 10} progress={rise(s.t, 24, s.at(2) + 30) * (1 - rise(s.t, 8, s.at(3)))} />
            <Ring {...plateAt(1)} w={P + 10} h={P + 10} progress={rise(s.t, 24, s.at(2) + 40) * (1 - rise(s.t, 8, s.at(3)))} />
            <Ring {...plateAt(0)} w={P + 10} h={P + 10} progress={rise(s.t, 24, s.at(4) + 40) * (1 - rise(s.t, 8, s.at(5)))} />
            <Ring {...plateAt(2)} w={P + 10} h={P + 10} progress={rise(s.t, 24, s.at(4) + 50) * (1 - rise(s.t, 8, s.at(5)))} />
            <Key s={s} rows={keyRows} />
            <TestFigure s={s} shape={EX1.test} appearAt={s.at(6)} built="LD"
              buildAt={[s.at(6) + s.speech(6) * 0.4, s.at(6) + s.speech(6) * 0.85]} />
            <Options s={s} options={EX1.options} appearAt={s.at(6) + 10} correct={EX1.correct}
              sealAt={s.at(7) + 10} strikes={{ 3: s.at(8) + s.speech(8) * 0.3 }} />
            <Note x={OPTS.x + 3 * (OPTS.w + OPTS.gap) - 250} y={OPTS.y + 190} size={32} bg="#F3E9DF" color={C.mud}
              appear={rise(s.t, 16, s.at(8) + s.speech(8) * 0.55)}>shape letter comes first</Note>
          </>
        );
      },
    },

    // Worked example 2: a trap, because size is not in the code.
    {
      beats: [
        { say: "This one is harder. The arrows point different ways, they have different lines and they are different sizes." },
        { say: "Figures one and three both start with P, and both arrows point up. Their sizes are different, so P cannot mean a size. P means pointing up." },
        { say: "So Q, on the other arrow, means pointing down." },
        { say: "Now the second letters. S is on both solid arrows, and T is on the dotted one. So S means solid and T means dotted." },
        { say: "The new arrow points down, so it starts with Q. It's dotted, so it ends with T. The code is Q, T. That's answer b.", sfx: "chime", sfxAt: 5.6 },
        { say: "The size of the new arrow does not matter, because size is not part of the code." },
      ],
      render: s => {
        const glow = {};
        glow["00"] = window(s.t, s.at(1) + 10, s.at(2));
        glow["20"] = glow["00"];
        glow["01"] = window(s.t, s.at(3) + 8, s.at(4));
        glow["11"] = glow["01"];
        const keyRows = [
          { letter: "P", meaning: "points up", at: s.at(1) + s.speech(1) * 0.86 },
          { letter: "Q", meaning: "points down", at: s.at(2) + s.speech(2) * 0.6 },
          { letter: "S", meaning: "solid line", at: s.at(3) + s.speech(3) * 0.71 },
          { letter: "T", meaning: "dotted line", at: s.at(3) + s.speech(3) * 0.87 },
        ];
        const sizeNote = window(s.t, s.at(1) + s.speech(1) * 0.47, s.at(2) + 10);
        return (
          <>
            <CodedColumn s={s} figures={EX2.figures} glowLetters={glow} />
            <Ring {...plateAt(0)} w={P + 10} h={P + 10} progress={rise(s.t, 24, s.at(1) + 30) * (1 - rise(s.t, 8, s.at(2)))} />
            <Ring {...plateAt(2)} w={P + 10} h={P + 10} progress={rise(s.t, 24, s.at(1) + 40) * (1 - rise(s.t, 8, s.at(2)))} />
            <Note x={COL.x + P + 150} y={COL.ys[1] + 30} size={32} bg="#F3E9DF" color={C.mud} appear={sizeNote}>different sizes, so not size</Note>
            <Key s={s} rows={keyRows} />
            <TestFigure s={s} shape={EX2.test} appearAt={s.at(4) - 6} built="QT"
              buildAt={[s.at(4) + s.speech(4) * 0.28, s.at(4) + s.speech(4) * 0.57]} />
            <Options s={s} options={EX2.options} appearAt={s.at(4)} correct={EX2.correct} sealAt={s.at(4) + s.speech(4) * 0.9} />
            <Note x={TEST.x - 20} y={TEST.y - 84} size={32} appear={rise(s.t, 16, s.at(5) + 20)}>size isn't in the code</Note>
          </>
        );
      },
    },

    // Your turn.
    {
      beats: [
        { say: "Now it's your turn. Work out the code for the new figure. Pause the video if you would like more time.", hold: 6 },
        { say: "Here is the answer. H means heart, and Y means a double line. So the code is H, Y, which is answer d.", sfx: "chime", sfxAt: 4.9 },
      ],
      render: s => (
        <>
          <CodedColumn s={s} figures={TRY.figures} />
          <TestFigure s={s} shape={TRY.test} appearAt={20} built="HY"
            buildAt={[s.at(1) + s.speech(1) * 0.2, s.at(1) + s.speech(1) * 0.4]} />
          <Options s={s} options={TRY.options} appearAt={30} correct={TRY.correct} sealAt={s.at(1) + s.speech(1) * 0.8} />
          <div style={{ opacity: window(s.t, s.at(0) + s.speech(0), s.at(1)) }}>
            <Countdown x={KEY.x + 300} y={330} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={170} />
          </div>
          <Words x={KEY.x} y={170} w={620} size={46} italic color={C.soft} align="center" appear={window(s.t, 10, s.at(1))}>Your turn</Words>
        </>
      ),
    },

    // Recap.
    {
      beats: [
        { say: "Here is how to work out any code." },
        { say: "First, find two figures that share a letter." },
        { say: "Next, look at what is the same about them. That is what the letter means." },
        { say: "Then build the new code, one letter at a time." },
        { say: "Last, check that the letters are in the right order." },
      ],
      render: s => (
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={420} y={260} steps={[
          "Find two figures that share a letter.",
          "Look at what is the same about them.",
          "Build the new code, letter by letter.",
          "Check the order of the letters.",
        ]} />
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Now you know how to work out a code. Well done.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <TitleCard t={s.t} title="Well done" strap="Now you can work out any code." emblem="eye" />,
    },
  ],
};
