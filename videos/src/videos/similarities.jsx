// Most alike: find the figure that shares what the two on the left share.
// All figures here are drawn fresh for this video.
import React from "react";
import { C, SERIF } from "../lib/theme.js";
import { rise, window } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";
import { Plate, Ring, Strike, Seal, Words, Note, TitleCard, Countdown, Steps, Emblem } from "../lib/ui.jsx";

// ---------- Layout shared by the worked examples ----------
// The alike pair on the left with what they share written underneath;
// a hairline divider; the four lettered answers on the right.
const P = 210; // plate size
const PAIR = { xs: [150, 396], y: 210 };
const SHARE = { x: 150, y: 516, w: 490 };
const DIVIDER_X = 680;
const OPT = { y: 210, size: 206, gap: 34 };
const optX = i => 750 + i * (OPT.size + OPT.gap);

// A figure made of several shapes, all inked on together.
function Figure({ shapes, draw }) {
  return shapes.map((sh, i) => <Shape key={i} {...sh} draw={draw} />);
}

// The two figures that are alike, with a gilt bracket joining them.
function Pair({ s, ex, start = 0 }) {
  const bracket = rise(s.t, 20, start + 26);
  const left = PAIR.xs[0] + 20, right = PAIR.xs[1] + P - 20, y = PAIR.y + P + 22;
  return (
    <>
      {ex.pair.map((shapes, i) => (
        <Plate key={i} x={PAIR.xs[i]} y={PAIR.y} w={P} h={P} appear={rise(s.t, 18, start + i * 12)}>
          <Figure shapes={shapes} draw={rise(s.t, 36, start + i * 12 + 4)} />
        </Plate>
      ))}
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
        <path d={`M ${left} ${y - 12} L ${left} ${y} L ${right} ${y} L ${right} ${y - 12}`} fill="none" stroke={C.gilt}
          strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - bracket} />
      </svg>
      <div style={{ position: "absolute", left, width: right - left, top: y + 4, textAlign: "center", fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: C.giltDark, opacity: bracket }}>
        alike
      </div>
      <div style={{ position: "absolute", left: DIVIDER_X, top: PAIR.y - 10, width: 1.5, height: 560, background: C.ruleSoft, opacity: rise(s.t, 20, start + 20) }} />
    </>
  );
}

// What the two figures share, written in as it is worked out.
function ShareCard({ s, rows, appearAt }) {
  const a = rise(s.t, 18, appearAt);
  return (
    <div style={{
      position: "absolute", left: SHARE.x, top: SHARE.y, width: SHARE.w, padding: "20px 28px 12px",
      background: C.white, borderRadius: 10, opacity: a,
      boxShadow: `0 0 0 1.5px ${C.ruleSoft}, 0 18px 40px -26px rgba(27,42,36,0.5)`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: C.soft, marginBottom: 6 }}>
        <Emblem name="twins" size={34} /> They share
      </div>
      {rows.map((r, i) => {
        const k = rise(s.t, 16, r.at);
        return (
          <div key={i} style={{ display: "flex", gap: 14, alignItems: "baseline", minHeight: 46, opacity: k, transform: `translateX(${(1 - k) * 14}px)` }}>
            <span style={{ fontFamily: SERIF, fontSize: 30, color: C.gilt }}>✓</span>
            <span style={{ fontFamily: SERIF, fontSize: 32, color: C.ink, lineHeight: 1.2 }}>{r.text}</span>
          </div>
        );
      })}
    </div>
  );
}

// The four answers, each on its own plate with a letter underneath.
function Options({ s, ex, appearAt, sealAt, strikes = {}, rings = {} }) {
  return ex.options.map((shapes, i) => {
    const x = optX(i);
    const a = rise(s.t, 16, appearAt + i * 6);
    const struck = strikes[i] !== undefined ? rise(s.t, 14, strikes[i]) : 0;
    const ring = rings[i] ? rise(s.t, 22, rings[i][0]) * (1 - rise(s.t, 8, rings[i][1])) : 0;
    return (
      <div key={i}>
        <Plate x={x} y={OPT.y} w={OPT.size} h={OPT.size} appear={a} dim={struck} label={"abcd"[i]}
          glow={i === ex.correct && s.t >= sealAt ? 1 : 0}>
          <Figure shapes={shapes} draw={rise(s.t, 30, appearAt + i * 6 + 4)} />
        </Plate>
        <Ring x={x + OPT.size / 2} y={OPT.y + OPT.size / 2} w={OPT.size + 12} h={OPT.size + 12} progress={ring} />
        <Strike x={x} y={OPT.y} w={OPT.size} h={OPT.size} progress={struck} />
        {i === ex.correct && <Seal x={x + OPT.size - 8} y={OPT.y + 8} size={70} t={s.t} start={sealAt} />}
      </div>
    );
  });
}

// ---------- The puzzles ----------
const three = (kind, fill = "black", r = 14) => [
  { kind, r, fill, x: -28, y: -20 },
  { kind, r, fill, x: 28, y: -16 },
  { kind, r, fill, x: 0, y: 30 },
];

// Example 1: a big shape with three small black shapes inside.
const EX1 = {
  pair: [
    [{ kind: "square", r: 84 }, ...three("circle")],
    [{ kind: "hexagon", r: 84 }, ...three("triangle", "black", 16)],
  ],
  options: [
    [{ kind: "circle", r: 80 }, ...three("square", "black", 15)],
    [{ kind: "square", r: 76 }, { kind: "circle", r: 14, fill: "black", x: -24, y: -8 }, { kind: "circle", r: 14, fill: "black", x: 24, y: 14 }],
    [{ kind: "pentagon", r: 80 }, ...three("circle", "white", 14).map(c => ({ ...c, y: c.y + 6 }))],
    three("circle", "black", 18).map(c => ({ ...c, x: c.x * 1.3, y: c.y * 1.3 })),
  ],
  correct: 0,
};

// Example 2: two shapes of the same kind, overlapping.
const EX2 = {
  pair: [
    [{ kind: "circle", r: 50, x: -28 }, { kind: "circle", r: 50, x: 28 }],
    [{ kind: "pentagon", r: 52, x: -26, y: -8 }, { kind: "pentagon", r: 52, x: 26, y: 10 }],
  ],
  options: [
    [{ kind: "circle", r: 46, x: -28 }, { kind: "square", r: 50, x: 28, y: 8 }],
    [{ kind: "triangle", r: 54, x: -24, y: 6 }, { kind: "triangle", r: 54, x: 24, y: -8 }],
    [{ kind: "circle", r: 36, x: -48 }, { kind: "circle", r: 36, x: 48 }],
    [{ kind: "pentagon", r: 70 }],
  ],
  correct: 1,
};

// Your turn: both have a dotted line.
const TRY = {
  pair: [
    [{ kind: "square", r: 66, line: "dotted" }],
    [{ kind: "heart", r: 70, fill: "grey", line: "dotted" }],
  ],
  options: [
    [{ kind: "square", r: 66 }],
    [{ kind: "triangle", r: 68, line: "dotted" }],
    [{ kind: "circle", r: 62, line: "double" }],
    [{ kind: "heart", r: 68, fill: "grey" }],
  ],
  correct: 1,
};

const pairCentre = i => ({ x: PAIR.xs[i] + P / 2, y: PAIR.y + P / 2 });
const NOTE_Y = OPT.y + OPT.size + 76;

// ---------- The video ----------
export default {
  id: "similarities",
  order: 5,
  title: "Most Alike",
  cloth: "spotter",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Most Alike. Two figures have something in common. You need to find another figure that has the same thing.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <TitleCard t={s.t} kicker="Picture puzzles" title="Most Alike" strap="Find the figure that has the same thing in common." emblem="twins" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "In a most alike question, the two figures on the left are similar to each other in some way." },
        { say: "You need to find the figure on the right that is most like the two on the left." },
        { say: "To do that, you need to work out exactly what makes them alike." },
      ],
      render: s => (
        <>
          <Pair s={s} ex={EX1} />
          <Options s={s} ex={EX1} appearAt={s.at(1) + s.speech(1) * 0.3} sealAt={99999} />
          <Words x={SHARE.x} y={SHARE.y + 30} w={SHARE.w + 40} size={42} italic color={C.soft} appear={rise(s.t, 20, s.at(2) + s.speech(2) * 0.4)}>
            What makes them alike?
          </Words>
          <Words x={760} y={NOTE_Y} w={900} size={46} align="center" appear={rise(s.t, 20, s.at(1) + s.speech(1) * 0.7)}>
            Which one is most like them?
          </Words>
        </>
      ),
    },

    // The secret.
    {
      beats: [
        { say: "First, say what the two figures have in common." },
        { say: "Then look at what is different between them. You can ignore those things." },
        { say: "Now find the answer that has the same thing in common. Be careful, because some answers look similar but do not share it." },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="twins" size={84} />
          </div>
          <Words x={210} w={1500} y={350} size={70} align="center" appear={rise(s.t, 20, s.at(0) + 6)}>
            Say what they have in common.
          </Words>
          <Words x={210} w={1500} y={462} size={70} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>
            Ignore what is different.
          </Words>
          <Words x={210} w={1500} y={600} size={50} italic color={C.mud} align="center" appear={rise(s.t, 20, s.at(2) + s.speech(2) * 0.5)}>
            Some answers only look similar.
          </Words>
        </>
      ),
    },

    // Worked example 1.
    {
      beats: [
        { say: "Let's try one. Here are the two figures on the left." },
        { say: "Each one has a big shape on the outside. Inside it, there are three small shapes, and they are all black." },
        { say: "The big shapes are different from each other, and so are the small ones. So the kinds of shape do not matter." },
        { say: "Now check each answer. Answer b has only two small circles. Answer c has three, but they are white. Answer d has no big shape around them." },
        { say: "Answer a has a big shape with three small black shapes inside. It is the one most like the two on the left.", sfx: "chime", sfxAt: 0.6 },
      ],
      render: s => (
        <>
          <Pair s={s} ex={EX1} />
          <Ring {...pairCentre(0)} w={P + 12} h={P + 12} progress={rise(s.t, 24, s.at(0) + 20) * (1 - rise(s.t, 8, s.at(2)))} />
          <Ring {...pairCentre(1)} w={P + 12} h={P + 12} progress={rise(s.t, 24, s.at(0) + 32) * (1 - rise(s.t, 8, s.at(2)))} />
          <ShareCard s={s} appearAt={s.at(1)} rows={[
            { text: "a big shape outside", at: s.at(1) + s.speech(1) * 0.22 },
            { text: "three small shapes inside", at: s.at(1) + s.speech(1) * 0.55 },
            { text: "the small ones are black", at: s.at(1) + s.speech(1) * 0.9 },
          ]} />
          <Note x={SHARE.x} y={SHARE.y + 232} size={30} bg="#F3E9DF" color={C.mud}
            appear={rise(s.t, 16, s.at(2) + s.speech(2) * 0.7)}>the shapes don't matter</Note>
          <Options s={s} ex={EX1} appearAt={s.at(3)} sealAt={s.at(4) + 18}
            strikes={{ 1: s.at(3) + s.speech(3) * 0.38, 2: s.at(3) + s.speech(3) * 0.66, 3: s.at(3) + s.speech(3) * 0.92 }} />
        </>
      ),
    },

    // Worked example 2: the lookalike trap.
    {
      beats: [
        { say: "This one has a trap. Here are two more figures." },
        { say: "Each one is two shapes of the same kind, and they overlap." },
        { say: "Answer c might look right at first, because it has two circles, just like the first figure. But the circles do not overlap, so it does not follow the rule." },
        { say: "Answer a overlaps, but its two shapes are different kinds. Answer d is only one shape." },
        { say: "Answer b has two triangles of the same kind, and they overlap. So b is the answer.", sfx: "chime", sfxAt: 3.2 },
        { say: "So look for the answer that has the same thing in common, even if it does not look like the others." },
      ],
      render: s => (
        <>
          <Pair s={s} ex={EX2} />
          <ShareCard s={s} appearAt={s.at(1)} rows={[
            { text: "two shapes", at: s.at(1) + s.speech(1) * 0.25 },
            { text: "the same kind", at: s.at(1) + s.speech(1) * 0.55 },
            { text: "overlapping", at: s.at(1) + s.speech(1) * 0.88 },
          ]} />
          <Options s={s} ex={EX2} appearAt={s.at(2) - 10} sealAt={s.at(4) + s.speech(4) * 0.76}
            rings={{ 2: [s.at(2) + s.speech(2) * 0.15, s.at(2) + s.speech(2) * 0.75] }}
            strikes={{ 2: s.at(2) + s.speech(2) * 0.8, 0: s.at(3) + s.speech(3) * 0.4, 3: s.at(3) + s.speech(3) * 0.85 }} />
          <Note x={optX(2) - 60} y={NOTE_Y} size={30} bg="#F3E9DF" color={C.mud}
            appear={window(s.t, s.at(2) + s.speech(2) * 0.6, s.at(4), 12)}>looks alike, but no overlap</Note>
          <Words x={760} y={NOTE_Y + 10} w={900} size={46} italic align="center" color={C.soft}
            appear={rise(s.t, 20, s.at(5) + 8)}>Match what they have in common.</Words>
        </>
      ),
    },

    // Your turn.
    {
      beats: [
        { say: "Now it's your turn. Find the figure most like the two on the left. Pause the video if you would like more time.", hold: 6 },
        { say: "Here is the answer. Both figures on the left have a dotted line. Their shapes and colours are different, so those do not matter. Only answer b has a dotted line, so the answer is b.", sfx: "chime", sfxAt: 9.9 },
      ],
      render: s => (
        <>
          <Pair s={s} ex={TRY} />
          <Options s={s} ex={TRY} appearAt={30} sealAt={s.at(1) + s.speech(1) * 0.92}
            strikes={{ 0: s.at(1) + s.speech(1) * 0.7, 2: s.at(1) + s.speech(1) * 0.74, 3: s.at(1) + s.speech(1) * 0.78 }} />
          <Words x={SHARE.x} y={SHARE.y + 20} w={SHARE.w} size={46} italic color={C.soft} align="center" appear={window(s.t, 10, s.at(1))}>Your turn</Words>
          <div style={{ opacity: window(s.t, s.at(0) + s.speech(0), s.at(1)) }}>
            <Countdown x={SHARE.x + SHARE.w / 2} y={SHARE.y + 170} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={160} />
          </div>
          <ShareCard s={s} appearAt={s.at(1) + s.speech(1) * 0.15} rows={[
            { text: "a dotted line", at: s.at(1) + s.speech(1) * 0.22 },
          ]} />
        </>
      ),
    },

    // Recap.
    {
      beats: [
        { say: "Here is how to find the figure that is most alike." },
        { say: "First, say what the two figures share." },
        { say: "Next, look at what is different, and ignore it." },
        { say: "Then find the answer that shares the same thing." },
        { say: "Last, be careful with answers that only look similar." },
      ],
      render: s => (
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={400} y={250} steps={[
          "Say what the two figures share.",
          "Look at what is different, and ignore it.",
          "Find the answer that shares the same thing.",
          "Watch out for answers that only look similar.",
        ]} />
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Now you can find the figure that is most alike. Well done.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <TitleCard t={s.t} title="Well done" strap="Match what the figures have in common." emblem="eye" />,
    },
  ],
};
