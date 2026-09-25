// Analogies: the first figure changes into the second; change the third the same way.
// All figures here are drawn fresh for this video.
import React from "react";
import { C, SERIF, SANS } from "../lib/theme.js";
import { rise, window, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";
import { Plate, Ring, Strike, Seal, Words, Note, TitleCard, Countdown, Steps, Emblem, Arrow } from "../lib/ui.jsx";

// ---------- Layout shared by the worked examples ----------
// Top row:  A → B  :  C → ?      with the rule card on the right.
// Bottom row: the four lettered answers, centred.
const P = 196; // plate size
const ROW_Y = 176;
const XS = { a: 150, b: 440, c: 790, q: 1080 }; // plate lefts for A, B, C and the question mark
const RULE = { x: 1360, y: 168, w: 420 };
const OPT = { y: 526, size: 176, gap: 56 };
const optX = i => (1920 - (4 * OPT.size + 3 * OPT.gap)) / 2 + i * (OPT.size + OPT.gap);

// One changes-into arrow between two plates in the top row.
function ChangeArrow({ from, to, progress }) {
  const y = ROW_Y + P / 2;
  return <Arrow x1={from + P + 22} y1={y} x2={to - 22} y2={y} progress={progress} color={C.soft} width={4} />;
}

// The ":" between the pair and the second half, set like a ratio sign.
function Colon({ appear }) {
  const x = (XS.b + P + XS.c) / 2;
  return (
    <div style={{ position: "absolute", left: x - 8, top: ROW_Y + P / 2 - 26, opacity: appear }}>
      {[0, 36].map(dy => <div key={dy} style={{ width: 14, height: 14, borderRadius: 7, background: C.gilt, marginBottom: 22 }} />)}
    </div>
  );
}

// The whole top row. `answer` draws inside the "?" plate once solved.
function Row({ s, ex, start = 0, answer, qGlow = 0 }) {
  const a = i => rise(s.t, 18, start + i * 12);
  const d = i => rise(s.t, 36, start + i * 12 + 4);
  return (
    <>
      <Plate x={XS.a} y={ROW_Y} w={P} h={P} appear={a(0)}><Shape {...ex.a} draw={d(0)} /></Plate>
      <ChangeArrow from={XS.a} to={XS.b} progress={rise(s.t, 16, start + 14)} />
      <Plate x={XS.b} y={ROW_Y} w={P} h={P} appear={a(1)}><Shape {...ex.b} draw={d(1)} /></Plate>
      <Colon appear={rise(s.t, 14, start + 30)} />
      <Plate x={XS.c} y={ROW_Y} w={P} h={P} appear={a(3)}><Shape {...ex.c} draw={d(3)} /></Plate>
      <ChangeArrow from={XS.c} to={XS.q} progress={rise(s.t, 16, start + 50)} />
      <Plate x={XS.q} y={ROW_Y} w={P} h={P} appear={a(4)} glow={qGlow}>
        {answer ?? (
          <text x={0} y={22} textAnchor="middle" fontFamily={SERIF} fontSize={92} fill={C.faint}>?</text>
        )}
      </Plate>
    </>
  );
}

// The rule, written in words like a note in the margin.
function RuleCard({ s, rows, appearAt }) {
  const a = rise(s.t, 18, appearAt);
  return (
    <div style={{
      position: "absolute", left: RULE.x, top: RULE.y, width: RULE.w, padding: "24px 30px 16px",
      background: C.white, borderRadius: 10, opacity: a,
      boxShadow: `0 0 0 1.5px ${C.ruleSoft}, 0 18px 40px -26px rgba(27,42,36,0.5)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 32, color: C.soft, marginBottom: 10 }}>
        <Emblem name="arrow" size={36} /> The rule
      </div>
      {rows.map((r, i) => {
        const k = rise(s.t, 16, r.at);
        return (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline", minHeight: 58, opacity: k, transform: `translateX(${(1 - k) * 14}px)` }}>
            <span style={{ fontFamily: SERIF, fontSize: 34, color: C.gilt }}>{i + 1}</span>
            <span style={{ fontFamily: SERIF, fontSize: 38, color: C.ink, lineHeight: 1.2 }}>{r.text}</span>
          </div>
        );
      })}
    </div>
  );
}

// The four answers, each on its own plate with a letter underneath.
function Options({ s, options, appearAt, correct, sealAt, strikes = {} }) {
  return options.map((o, i) => {
    const x = optX(i);
    const a = rise(s.t, 16, appearAt + i * 6);
    const struck = strikes[i] !== undefined ? rise(s.t, 14, strikes[i]) : 0;
    return (
      <div key={i}>
        <Plate x={x} y={OPT.y} w={OPT.size} h={OPT.size} appear={a} dim={struck} label={"abcd"[i]}
          glow={i === correct && s.t >= sealAt ? 1 : 0}>
          <Shape {...o} draw={rise(s.t, 30, appearAt + i * 6 + 4)} />
        </Plate>
        <Strike x={x} y={OPT.y} w={OPT.size} h={OPT.size} progress={struck} />
        {i === correct && <Seal x={x + OPT.size - 8} y={OPT.y + 8} size={70} t={s.t} start={sealAt} />}
      </div>
    );
  });
}

// ---------- The puzzles ----------
// Example 1: one change, a quarter turn clockwise.
const EX1 = {
  a: { kind: "flag", r: 62 },
  b: { kind: "flag", r: 62, rot: 90 },
  c: { kind: "arrow", r: 66, rot: -90, fill: "grey" },
  options: [
    { kind: "arrow", r: 58, rot: 180, fill: "grey" },
    { kind: "arrow", r: 58, rot: 0, fill: "grey" },
    { kind: "arrow", r: 58, rot: 90, fill: "grey" },
    { kind: "arrow", r: 58, rot: -90, fill: "black" },
  ],
  correct: 1,
};

// Example 2: two changes at once, upside down and striped.
const EX2 = {
  a: { kind: "triangle", r: 64 },
  b: { kind: "triangle", r: 64, rot: 180, fill: "striped" },
  c: { kind: "pentagon", r: 64 },
  options: [
    { kind: "pentagon", r: 56, fill: "striped" },
    { kind: "pentagon", r: 56, rot: 180 },
    { kind: "pentagon", r: 56, rot: 180, fill: "striped" },
    { kind: "triangle", r: 56, rot: 180, fill: "striped" },
  ],
  correct: 2,
};

// Your turn: it grows, and its line becomes double.
const TRY = {
  a: { kind: "hexagon", r: 40 },
  b: { kind: "hexagon", r: 70, line: "double" },
  c: { kind: "heart", r: 40 },
  options: [
    { kind: "heart", r: 36, line: "double" },
    { kind: "hexagon", r: 64, line: "double" },
    { kind: "heart", r: 64 },
    { kind: "heart", r: 64, line: "double" },
  ],
  correct: 3,
};

const plateCentre = key => ({ x: XS[key] + P / 2, y: ROW_Y + P / 2 });

// ---------- The video ----------
export default {
  id: "analogies",
  order: 2,
  title: "Analogies",
  cloth: "spotter",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Analogies. One change, copied perfectly. Let's learn how.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <TitleCard t={s.t} kicker="Nothing gets past you" title="Analogies" strap="Spot the change. Copy it exactly." emblem="arrow" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "In an analogy question, the first figure changes to become the second." },
        { say: "Then comes a third figure. Your job is to change it in exactly the same way." },
        { say: "So first, work out the change. Then do it again." },
      ],
      render: s => (
        <>
          <Row s={s} ex={EX1} />
          <Note x={XS.a + P - 40} y={ROW_Y + P + 34} appear={rise(s.t, 16, s.at(0) + s.speech(0) * 0.6)} size={32}>changes into</Note>
          <Note x={XS.c + P - 60} y={ROW_Y + P + 34} appear={rise(s.t, 16, s.at(1) + s.speech(1) * 0.6)} size={32}>the same change</Note>
          <Ring {...plateCentre("q")} w={P + 12} h={P + 12} progress={rise(s.t, 24, s.at(1) + s.speech(1) * 0.7)} />
          <Words x={260} w={1400} y={560} size={60} align="center" appear={rise(s.t, 20, s.at(2) + 8)}>
            Work out the change. Then do it again.
          </Words>
        </>
      ),
    },

    // The secret.
    {
      beats: [
        { say: "Here's the secret. Say the change out loud, as a rule." },
        { say: "Something like: it turns a quarter turn, and it goes black." },
        { say: "Then apply the whole rule to the third figure. Every part of it." },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="arrow" size={84} />
          </div>
          <Words x={210} w={1500} y={350} size={74} align="center" appear={rise(s.t, 20, s.at(0) + 6)}>
            Say the change as a rule.
          </Words>
          <Words x={210} w={1500} y={462} size={52} italic color={C.soft} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>
            “It turns a quarter turn, and it goes black.”
          </Words>
          <Words x={210} w={1500} y={590} size={74} align="center" appear={rise(s.t, 20, s.at(2) + 6)}>
            Apply the whole rule.
          </Words>
        </>
      ),
    },

    // Worked example 1: one change.
    {
      beats: [
        { say: "Let's try one. Here's a flag, and here's what it changes into." },
        { say: "What happened? It's the same flag, the same colour, the same size. But it has turned a quarter turn, clockwise, like the hand of a clock." },
        { say: "So that's our rule. Now apply it to the arrow. It points up. A quarter turn clockwise, and now it points to the right." },
        { say: "That's answer b.", sfx: "chime", sfxAt: 0.2 },
        { say: "Answer a turned the wrong way. Answer c turned too far. And answer d didn't turn at all. It just changed colour." },
      ],
      render: s => {
        const turn = rise(s.t, 34, s.at(2) + s.speech(2) * 0.55);
        const solved = s.t >= s.at(2) + s.speech(2) * 0.45;
        const spin = rise(s.t, 30, s.at(1) + s.speech(1) * 0.55);
        return (
          <>
            <Row s={s} ex={EX1} qGlow={solved ? 0.6 : 0}
              answer={solved ? <Shape {...EX1.c} rot={lerp(-90, 0, turn)} /> : undefined} />
            {/* A curved gilt arrow shows the quarter turn between A and B. */}
            <TurnMark x={(XS.a + P + XS.b) / 2} y={ROW_Y - 30} progress={spin * (1 - rise(s.t, 10, s.at(2)))} />
            <Ring {...plateCentre("a")} w={P + 12} h={P + 12} progress={rise(s.t, 24, s.at(1) + 10) * (1 - rise(s.t, 8, s.at(2)))} />
            <Ring {...plateCentre("b")} w={P + 12} h={P + 12} progress={rise(s.t, 24, s.at(1) + 22) * (1 - rise(s.t, 8, s.at(2)))} />
            <Ring {...plateCentre("c")} w={P + 12} h={P + 12} progress={rise(s.t, 24, s.at(2) + s.speech(2) * 0.3) * (1 - rise(s.t, 8, s.at(3)))} />
            <RuleCard s={s} appearAt={s.at(1) + s.speech(1) * 0.55} rows={[
              { text: "turns a quarter turn, clockwise", at: s.at(1) + s.speech(1) * 0.62 },
            ]} />
            <Options s={s} options={EX1.options} appearAt={s.at(2) + s.speech(2) * 0.2} correct={EX1.correct}
              sealAt={s.at(3) + 6}
              strikes={{ 0: s.at(4) + s.speech(4) * 0.15, 2: s.at(4) + s.speech(4) * 0.38, 3: s.at(4) + s.speech(4) * 0.62 }} />
          </>
        );
      },
    },

    // Worked example 2: two changes, and the traps that copy only one.
    {
      beats: [
        { say: "Here's a trickier one. Watch the triangle carefully." },
        { say: "Two things have changed. It has turned upside down. And it has become striped." },
        { say: "So the rule has two parts. The pentagon must turn upside down, and it must become striped." },
        { say: "Answer a is striped, but it hasn't turned. That's only half the rule." },
        { say: "Answer b has turned, but it isn't striped. Half the rule again." },
        { say: "And answer d has changed into a triangle. The shape should stay a pentagon." },
        { say: "So the answer is c. Both changes, and nothing else.", sfx: "chime", sfxAt: 1.3 },
      ],
      render: s => {
        const turn = rise(s.t, 34, s.at(2) + s.speech(2) * 0.4);
        const solved = s.t >= s.at(2) + s.speech(2) * 0.3;
        const striped = s.t >= s.at(2) + s.speech(2) * 0.8;
        return (
          <>
            <Row s={s} ex={EX2} qGlow={solved ? 0.6 : 0}
              answer={solved ? <Shape {...EX2.c} rot={lerp(0, 180, turn)} fill={striped ? "striped" : "white"} /> : undefined} />
            <Ring {...plateCentre("a")} w={P + 12} h={P + 12} progress={rise(s.t, 24, s.at(0) + 14) * (1 - rise(s.t, 8, s.at(2)))} />
            <Ring {...plateCentre("b")} w={P + 12} h={P + 12} progress={rise(s.t, 24, s.at(1) + 10) * (1 - rise(s.t, 8, s.at(2)))} />
            <RuleCard s={s} appearAt={s.at(1) + s.speech(1) * 0.3} rows={[
              { text: "turns upside down", at: s.at(1) + s.speech(1) * 0.45 },
              { text: "becomes striped", at: s.at(1) + s.speech(1) * 0.85 },
            ]} />
            <Options s={s} options={EX2.options} appearAt={s.at(2) + s.speech(2) * 0.9} correct={EX2.correct}
              sealAt={s.at(6) + s.speech(6) * 0.35}
              strikes={{ 0: s.at(3) + s.speech(3) * 0.55, 1: s.at(4) + s.speech(4) * 0.5, 3: s.at(5) + s.speech(5) * 0.4 }} />
            <Note x={optX(0) - 30} y={OPT.y + OPT.size + 70} size={30} bg="#F3E9DF" color={C.mud}
              appear={window(s.t, s.at(3) + s.speech(3) * 0.6, s.at(4), 12)}>only half the rule</Note>
            <Note x={optX(1) + 10} y={OPT.y + OPT.size + 70} size={30} bg="#F3E9DF" color={C.mud}
              appear={window(s.t, s.at(4) + s.speech(4) * 0.4, s.at(5), 12)}>half again</Note>
            <Note x={optX(3) - 50} y={OPT.y + OPT.size + 70} size={30} bg="#F3E9DF" color={C.mud}
              appear={window(s.t, s.at(5) + s.speech(5) * 0.6, s.at(6) + s.speech(6), 12)}>wrong shape</Note>
          </>
        );
      },
    },

    // Your turn.
    {
      beats: [
        { say: "Your turn. Work out the rule, then find the answer. Pause the video if you'd like more time.", hold: 6 },
        { say: "Did you get it? The hexagon grew bigger, and its line became double. So the heart must grow bigger, with a double line. That's d.", sfx: "chime", sfxAt: 7.4 },
      ],
      render: s => {
        const solved = s.t >= s.at(1) + s.speech(1) * 0.6;
        return (
          <>
            <Row s={s} ex={TRY} qGlow={solved ? 0.6 : 0}
              answer={solved ? <Shape {...TRY.options[3]} draw={rise(s.t, 30, s.at(1) + s.speech(1) * 0.6)} /> : undefined} />
            <Options s={s} options={TRY.options} appearAt={30} correct={TRY.correct} sealAt={s.at(1) + s.speech(1) * 0.9} />
            <Words x={RULE.x} y={RULE.y + 10} w={RULE.w} size={46} italic color={C.soft} align="center" appear={window(s.t, 10, s.at(1))}>Your turn</Words>
            <div style={{ opacity: window(s.t, s.at(0) + s.speech(0), s.at(1)) }}>
              <Countdown x={RULE.x + RULE.w / 2} y={RULE.y + 200} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={170} />
            </div>
            <RuleCard s={s} appearAt={s.at(1) + s.speech(1) * 0.1} rows={[
              { text: "grows bigger", at: s.at(1) + s.speech(1) * 0.2 },
              { text: "line becomes double", at: s.at(1) + s.speech(1) * 0.38 },
            ]} />
          </>
        );
      },
    },

    // Recap.
    {
      beats: [
        { say: "So, for every analogy." },
        { say: "One. Look at what changed from the first figure to the second." },
        { say: "Two. Say the change as a rule." },
        { say: "Three. Apply the whole rule to the third figure." },
        { say: "Four. Check that nothing else has changed." },
      ],
      render: s => (
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={400} y={250} steps={[
          "Look at what changed.",
          "Say the change as a rule.",
          "Apply the whole rule to the third figure.",
          "Check that nothing else has changed.",
        ]} />
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Every change, copied perfectly. Nothing gets past you.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <TitleCard t={s.t} title="Copied" strap="Nothing gets past you." emblem="eye" />,
    },
  ],
};

// A small curved gilt arrow, showing a clockwise quarter turn.
function TurnMark({ x, y, progress }) {
  if (progress <= 0) return null;
  const r = 46;
  const k = Math.min(1, progress);
  return (
    <svg style={{ position: "absolute", left: x - r - 20, top: y - r - 20, overflow: "visible" }} width={2 * r + 40} height={2 * r + 40}
      viewBox={`${-r - 20} ${-r - 20} ${2 * r + 40} ${2 * r + 40}`}>
      <path d={`M ${-r} 0 A ${r} ${r} 0 0 1 0 ${-r}`} fill="none" stroke={C.gilt} strokeWidth={5} strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      {k > 0.95 && <path d={`M -14 ${-r - 12} L 0 ${-r} L -14 ${-r + 12}`} fill="none" stroke={C.gilt} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}
