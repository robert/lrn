// Sequences: a row of squares that change step by step. What comes next?
// All figures here are drawn fresh for this video.
import React from "react";
import { C, SERIF, SANS } from "../lib/theme.js";
import { rise, window } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";
import { Plate, Ring, Strike, Seal, Words, TitleCard, Countdown, Steps, Emblem } from "../lib/ui.jsx";

// ---------- Layout ----------
// The row of four figures and the empty fifth across the top,
// the four answers in a row underneath.
const RP = 196; // row plate size
const GAP = 36;
const ROW = { x: (1920 - (5 * RP + 4 * GAP)) / 2, y: 226 };
const rowX = i => ROW.x + i * (RP + GAP);
const OP = 150; // option plate size
const OGAP = 46;
const OPTS = { x: (1920 - (4 * OP + 3 * OGAP)) / 2, y: 600 };
const optX = i => OPTS.x + i * (OP + OGAP);
const UNDER = ROW.y + RP + 14; // first line of notes under the row

// Dots laid out like the spots on a dice.
const DOTS = {
  1: [[0, 0]],
  2: [[-32, 0], [32, 0]],
  3: [[-36, 26], [36, 26], [0, -34]],
  4: [[-32, -32], [32, -32], [-32, 32], [32, 32]],
  5: [[-38, -38], [38, -38], [0, 0], [-38, 38], [38, 38]],
  6: [[-36, -44], [36, -44], [-36, 0], [36, 0], [-36, 44], [36, 44]],
};
const dots = (n, fill) => draw => DOTS[n].map(([x, y], i) => <Shape key={i} kind="circle" x={x} y={y} r={17} fill={fill} draw={draw} />);
const arrow = rot => draw => <Shape kind="arrow" r={66} rot={rot} draw={draw} />;
const starOf = (points, fill) => draw => <Shape kind="star" points={points} inner={0.55} r={70} fill={fill} draw={draw} />;
const circle = r => draw => <Shape kind="circle" r={r} fill="grey" draw={draw} />;

// ---------- Pieces ----------
// The row: four figures inking on one after another, then the empty square.
function Row({ s, figs, start = 0, answer, answerAt = Infinity, glowQ = 0 }) {
  return (
    <>
      {figs.map((f, i) => (
        <Plate key={i} x={rowX(i)} y={ROW.y} w={RP} h={RP} appear={rise(s.t, 18, start + i * 10)}>
          {f(rise(s.t, 34, start + i * 10 + 4))}
        </Plate>
      ))}
      <Plate x={rowX(4)} y={ROW.y} w={RP} h={RP} appear={rise(s.t, 18, start + 44)}
        glow={Math.max(glowQ, s.t >= answerAt ? 0.8 : 0)}>
        {s.t < answerAt && (
          <text x={0} y={30} textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontSize={96} fill={C.faint}>?</text>
        )}
        {answer && s.t >= answerAt && answer(rise(s.t, 30, answerAt))}
      </Plate>
    </>
  );
}

// A small gilt arc between two plates, showing one step along the row.
function StepArc({ from, progress }) {
  if (progress <= 0) return null;
  const x1 = rowX(from) + RP * 0.7, x2 = rowX(from + 1) + RP * 0.3, y = ROW.y - 6;
  const mid = (x1 + x2) / 2;
  const d = `M ${x1} ${y} Q ${mid} ${y - 58} ${x2} ${y}`;
  const k = Math.min(1, progress);
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      <path d={d} fill="none" stroke={C.gilt} strokeWidth={4} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      {k > 0.95 && <path d={`M ${x2 - 16} ${y - 12} L ${x2} ${y} L ${x2 - 2} ${y - 18}`} fill="none" stroke={C.gilt} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

// The four answers, lettered a to d.
function Options({ s, options, appearAt, correct, sealAt = Infinity, strikes = {} }) {
  return options.map((f, i) => {
    const struck = strikes[i] !== undefined ? rise(s.t, 14, strikes[i]) : 0;
    return (
      <div key={i}>
        <Plate x={optX(i)} y={OPTS.y} w={OP} h={OP} label={"abcd"[i]} appear={rise(s.t, 16, appearAt + i * 6)}
          dim={struck} glow={i === correct && s.t >= sealAt ? 1 : 0}>
          <g transform="scale(0.72)">{f(rise(s.t, 30, appearAt + i * 6 + 4))}</g>
        </Plate>
        <Strike x={optX(i)} y={OPTS.y} w={OP} h={OP} progress={struck} />
        {i === correct && <Seal x={optX(i) + OP - 8} y={OPTS.y + 8} size={62} t={s.t} start={sealAt} />}
      </div>
    );
  });
}

// A word or number written under a plate in the row (line 0 or 1).
function Under({ i, line = 0, children, appear, gilt = false, size = 40 }) {
  return (
    <div style={{
      position: "absolute", left: rowX(i), width: RP, top: UNDER + line * 50 + (1 - appear) * 10, opacity: appear,
      textAlign: "center", fontFamily: gilt ? SANS : SERIF, fontWeight: gilt ? 800 : 500,
      fontStyle: gilt ? "normal" : "italic", fontSize: size, color: gilt ? C.giltDark : C.soft,
    }}>{children}</div>
  );
}

// A note centred under the gap between plate `after` and the next.
function GapNote({ after, children, appear }) {
  const cx = rowX(after) + RP + GAP / 2;
  return (
    <div style={{
      position: "absolute", left: cx - 90, width: 180, top: UNDER + 4 + (1 - appear) * 10, opacity: appear,
      textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 34, color: C.giltDark,
    }}>{children}</div>
  );
}

const plateCentre = i => ({ x: rowX(i) + RP / 2, y: ROW.y + RP / 2 });

// ---------- The puzzles ----------
const EX1 = {
  figs: [arrow(-90), arrow(-45), arrow(0), arrow(45)],
  answer: arrow(90),
  options: [arrow(45), arrow(90), arrow(-135), arrow(135)],
  correct: 1,
};
const EX2 = {
  figs: [dots(1, "black"), dots(2, "white"), dots(3, "black"), dots(4, "white")],
  answer: dots(5, "black"),
  options: [dots(5, "white"), dots(4, "black"), dots(5, "black"), dots(6, "white")],
  correct: 2,
};
const TRY = {
  figs: [starOf(4, "grey"), starOf(5, "white"), starOf(6, "grey"), starOf(7, "white")],
  answer: starOf(8, "grey"),
  options: [starOf(8, "white"), starOf(7, "grey"), starOf(9, "grey"), starOf(8, "grey")],
  correct: 3,
};

// ---------- The video ----------
export default {
  id: "sequences",
  order: 6,
  title: "Sequences",
  cloth: "spotter",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Sequences. In these questions, the pictures change step by step along a row, and you work out what comes next.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <TitleCard t={s.t} kicker="Picture puzzles" title="Sequences" strap="What comes next?" emblem="sequence" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "In a sequences question, you see a row of squares." },
        { say: "Each square changes a little from the one before it." },
        { say: "You need to work out what belongs in the empty square at the end." },
      ],
      render: s => (
        <>
          <Row s={s} figs={[circle(30), circle(42), circle(54), circle(66)]} glowQ={window(s.t, s.at(2) + 10, s.length)} />
          {[0, 1, 2, 3].map(i => <StepArc key={i} from={i} progress={rise(s.t, 16, s.at(1) + s.speech(1) * 0.35 + i * 10)} />)}
          <Words x={260} w={1400} y={520} size={64} align="center" appear={rise(s.t, 20, s.at(2) + s.speech(2) * 0.5)}>
            What comes next?
          </Words>
        </>
      ),
    },

    // The secret.
    {
      beats: [
        { say: "It is hard to follow everything at once." },
        { say: "So follow one thing at a time, all the way along the row. For example, look for something that turns, something that grows, or something that swaps back and forth." },
        { say: "Then follow the next thing. The right answer must fit every one of these changes." },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="sequence" size={84} />
          </div>
          <Words x={210} w={1500} y={360} size={74} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>
            Follow one thing at a time.
          </Words>
          <Words x={210} w={1500} y={470} size={52} italic color={C.soft} align="center" appear={rise(s.t, 20, s.at(1) + s.speech(1) * 0.4)}>
            Does it turn, grow or swap?
          </Words>
          <Words x={210} w={1500} y={590} size={74} align="center" appear={rise(s.t, 20, s.at(2) + s.speech(2) * 0.4)}>
            The answer must fit every change.
          </Words>
        </>
      ),
    },

    // Worked example 1: one steady turn.
    {
      beats: [
        { say: "Let's try one. Here's a row of arrows. Which arrow comes next?" },
        { say: "Follow just the arrow's point. It starts pointing straight up." },
        { say: "Next it points up and to the right. Then it points right, and then down and to the right." },
        { say: "So each time, it turns an eighth of a turn, clockwise." },
        { say: "After one more eighth of a turn, it will point straight down." },
        { say: "Straight down is answer b.", sfx: "chime", sfxAt: 0.5 },
        { say: "Be careful with answer a. It is the same as the last arrow, with no turn at all. But the arrow keeps turning each time, so it cannot be a." },
      ],
      render: s => {
        const fade = 1 - rise(s.t, 10, s.at(3));
        return (
          <>
            <Row s={s} figs={EX1.figs} answer={EX1.answer} answerAt={s.at(4) + s.speech(4) * 0.6} />
            <Ring {...plateCentre(0)} w={RP + 14} h={RP + 14} progress={rise(s.t, 22, s.at(1) + s.speech(1) * 0.5) * fade} />
            {[1, 2, 3].map((i, j) => (
              <Ring key={i} {...plateCentre(i)} w={RP + 14} h={RP + 14}
                progress={rise(s.t, 22, s.at(2) + s.speech(2) * [0.1, 0.42, 0.7][j]) * fade} />
            ))}
            {[0, 1, 2].map(i => <StepArc key={i} from={i} progress={rise(s.t, 16, s.at(3) + s.speech(3) * 0.3 + i * 12)} />)}
            <StepArc from={3} progress={rise(s.t, 16, s.at(4) + s.speech(4) * 0.3)} />
            {[0, 1, 2].map(i => (
              <GapNote key={i} after={i} appear={rise(s.t, 14, s.at(3) + s.speech(3) * 0.45 + i * 8)}>⅛ turn</GapNote>
            ))}
            <GapNote after={3} appear={rise(s.t, 14, s.at(4) + s.speech(4) * 0.4)}>⅛ turn</GapNote>
            <Options s={s} options={EX1.options} appearAt={s.at(0) + 40} correct={EX1.correct}
              sealAt={s.at(5) + 10} strikes={{ 0: s.at(6) + s.speech(6) * 0.25 }} />
          </>
        );
      },
    },

    // Worked example 2: two changes at once.
    {
      beats: [
        { say: "This one is harder. Two things change at the same time." },
        { say: "First, follow the number of dots. There is one, then two, then three, then four." },
        { say: "So the next square needs five dots." },
        { say: "Now follow the colour. It goes black, white, black, white." },
        { say: "So the next square needs to be black." },
        { say: "So the answer has five dots and is black. That's answer c.", sfx: "chime", sfxAt: 3.0 },
        { say: "Answers a and b each get one of these things right and the other wrong. The answer must get both right." },
      ],
      render: s => {
        const count = [0.52, 0.64, 0.77, 0.92];
        const colour = [0.5, 0.64, 0.77, 0.9];
        return (
          <>
            <Row s={s} figs={EX2.figs} answer={EX2.answer} answerAt={s.at(5) + s.speech(5) * 0.3} />
            {[0, 1, 2, 3].map(i => (
              <Under key={`n${i}`} i={i} gilt size={44} appear={rise(s.t, 12, s.at(1) + s.speech(1) * count[i])}>{i + 1}</Under>
            ))}
            <Under i={4} gilt size={44} appear={rise(s.t, 12, s.at(2) + s.speech(2) * 0.6)}>5</Under>
            {["black", "white", "black", "white"].map((w, i) => (
              <Under key={`c${i}`} i={i} line={1} size={36} appear={rise(s.t, 12, s.at(3) + s.speech(3) * colour[i])}>{w}</Under>
            ))}
            <Under i={4} line={1} size={36} appear={rise(s.t, 12, s.at(4) + s.speech(4) * 0.7)}>black</Under>
            <Options s={s} options={EX2.options} appearAt={s.at(0) + 40} correct={EX2.correct}
              sealAt={s.at(5) + s.speech(5) * 0.75}
              strikes={{ 0: s.at(6) + s.speech(6) * 0.2, 1: s.at(6) + s.speech(6) * 0.3 }} />
          </>
        );
      },
    },

    // Your turn.
    {
      beats: [
        { say: "Now it's your turn. Which star comes next? Pause the video if you would like more time.", hold: 6 },
        { say: "Here is the answer. Each star has one more point than the one before, so the next one has eight points. The colour goes grey, white, grey, white, so next comes grey." },
        { say: "So the answer has eight points and is grey. That's answer d.", sfx: "chime", sfxAt: 2.6 },
      ],
      render: s => (
        <>
          <Row s={s} figs={TRY.figs} answer={TRY.answer} answerAt={s.at(2) + 10} />
          {[4, 5, 6, 7].map((n, i) => (
            <Under key={`n${i}`} i={i} gilt size={40} appear={rise(s.t, 12, s.at(1) + s.speech(1) * (0.1 + i * 0.06))}>{n}</Under>
          ))}
          <Under i={4} gilt size={40} appear={rise(s.t, 12, s.at(1) + s.speech(1) * 0.52)}>8</Under>
          {["grey", "white", "grey", "white"].map((w, i) => (
            <Under key={`c${i}`} i={i} line={1} size={36} appear={rise(s.t, 12, s.at(1) + s.speech(1) * (0.7 + i * 0.04))}>{w}</Under>
          ))}
          <Under i={4} line={1} size={36} appear={rise(s.t, 12, s.at(1) + s.speech(1) * 0.94)}>grey</Under>
          <Options s={s} options={TRY.options} appearAt={40} correct={TRY.correct} sealAt={s.at(2) + s.speech(2) * 0.72} />
          <div style={{ opacity: window(s.t, s.at(0) + s.speech(0), s.at(1)) }}>
            <Countdown x={1620} y={OPTS.y + OP / 2} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={150} />
          </div>
          <Words x={1480} y={OPTS.y - 70} w={280} size={42} italic color={C.soft} align="center" appear={window(s.t, 10, s.at(1))}>Your turn</Words>
        </>
      ),
    },

    // Recap.
    {
      beats: [
        { say: "Here is what to do for any sequence." },
        { say: "First, pick one thing and follow it along the row." },
        { say: "Next, work out what will happen to it in the empty square." },
        { say: "Then do the same for every other thing that changes." },
        { say: "Last, choose the answer that gets them all right." },
      ],
      render: s => (
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={400} y={250} steps={[
          "Pick one thing and follow it along.",
          "Say what happens to it next.",
          "Do the same for every other change.",
          "Choose the answer that gets them all.",
        ]} />
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Now you know how to work out what comes next. Well done.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <TitleCard t={s.t} title="Well done" strap="Follow one change at a time." emblem="eye" />,
    },
  ],
};
