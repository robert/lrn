// Odd One Out: find what four figures share, then name why the fifth doesn't belong.
// All figures here are drawn fresh for this video.
import React from "react";
import { C, SERIF, SANS } from "../lib/theme.js";
import { rise, pop, window } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";
import { Plate, Ring, Seal, Words, Note, TitleCard, Countdown, Steps, Emblem } from "../lib/ui.jsx";

// The twelve things that can change, always in this order (shared/attributes.js).
const TWELVE = [
  "Shape", "How many", "Size", "Shading", "Rotation", "Flipped",
  "Position on screen", "In front or behind", "Line style", "Touching", "Pointing at", "Inside or outside",
];

// ---------- Layout ----------
// Five plates in a row, lettered a to e, with the twelve as chips beneath.
const W5 = 250, GAP = 40;
const ROW = { x: (1920 - (5 * W5 + 4 * GAP)) / 2, y: 215 };
const NOTE_Y = ROW.y + W5 + 64; // notes sit between the letters and the chips
const plateX = i => ROW.x + i * (W5 + GAP);
const centre = i => ({ x: plateX(i) + W5 / 2, y: ROW.y + W5 / 2 });
const CHIPS = { x: ROW.x, y: 650, w: 225, gap: 12, h: 50 };

function Row({ s, figures, start = 0, dim = [], extra = [] }) {
  return figures.map((f, i) => {
    const a = rise(s.t, 18, start + i * 8);
    const draw = rise(s.t, 34, start + i * 8 + 5);
    return (
      <Plate key={i} x={plateX(i)} y={ROW.y} w={W5} h={W5} appear={a} dim={dim[i] ?? 0} label={"abcde"[i]}>
        <Shape {...f} draw={draw} />
        {extra[i]}
      </Plate>
    );
  });
}

// The twelve things as small chips. `lit` names the reason (gilt);
// `ruled` names ones ruled out (warm brown, then fading back).
function Chips({ s, appearAt = 0, lit = {}, ruled = {} }) {
  const a = rise(s.t, 18, appearAt);
  return (
    <div style={{ position: "absolute", left: CHIPS.x, top: CHIPS.y, opacity: a }}>
      {TWELVE.map((label, i) => {
        const col = i % 6, row = Math.floor(i / 6);
        const g = lit[label] !== undefined ? pop(s.t, lit[label]) : 0;
        const r = ruled[label] ? window(s.t, ruled[label][0], ruled[label][1], 8) : 0;
        return (
          <div key={label} style={{
            position: "absolute", left: col * (CHIPS.w + CHIPS.gap), top: row * (CHIPS.h + CHIPS.gap),
            width: CHIPS.w, height: CHIPS.h, borderRadius: 99,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SANS, fontWeight: 700, fontSize: 23,
            color: g > 0 ? C.clothDeep : r > 0.3 ? C.mud : C.soft,
            background: g > 0 ? `linear-gradient(180deg, ${C.giltLight}, ${C.gilt})` : r > 0 ? `rgba(243,233,223,${r})` : C.white,
            boxShadow: g > 0 ? "0 6px 16px -8px rgba(139,106,39,0.8)" : `inset 0 0 0 1.5px ${C.ruleSoft}`,
            transform: `scale(${g > 0 ? 1 + 0.12 * (1 - g) : 1})`,
            textDecoration: r > 0.5 ? "line-through" : "none",
          }}>{label}</div>
        );
      })}
    </div>
  );
}

// ---------- The puzzles ----------
// Example 1: every shape differs, but only one isn't striped.
const EX1 = [
  { kind: "circle", r: 70, fill: "striped" },
  { kind: "triangle", r: 72, fill: "striped" },
  { kind: "square", r: 72, fill: "black" },
  { kind: "star", r: 80, fill: "striped" },
  { kind: "heart", r: 74, fill: "striped" },
];

// Example 2: four turned L shapes and one flipped. Sizes are a red herring.
const EX2 = [
  { kind: "lshape", r: 82, fill: "white", rot: 0 },
  { kind: "lshape", r: 58, fill: "white", rot: 90 },
  { kind: "lshape", r: 82, fill: "white", rot: 180 },
  { kind: "lshape", r: 58, fill: "white", rot: 90, flip: true },
  { kind: "lshape", r: 58, fill: "white", rot: 270 },
];

// Your turn: count the sides. Shading changes everywhere, so it can't be shading.
const TRY = [
  { kind: "square", r: 74, fill: "grey" },
  { kind: "diamond", r: 84, fill: "white" },
  { kind: "pentagon", r: 80, fill: "black" },
  { kind: "rectangle", r: 86, fill: "striped" },
  { kind: "square", r: 74, fill: "white", rot: 20 },
];

// ---------- The video ----------
export default {
  id: "odd-one-out",
  order: 3,
  title: "Odd One Out",
  cloth: "spotter",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Odd One Out. Four of the figures belong together and one does not. You need to find that one and say why.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <TitleCard t={s.t} kicker="Picture puzzles" title="Odd One Out" strap="Find the one that does not belong, and say why." emblem="odd" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "In an odd one out question, you see five figures in a row." },
        { say: "Four of them belong together, and one of them does not." },
        { say: "You need to find the odd one out and say why. The reason is just as important as the answer." },
      ],
      render: s => {
        const grouped = rise(s.t, 20, s.at(1) + s.speech(1) * 0.3);
        const odd = rise(s.t, 20, s.at(1) + s.speech(1) * 0.75);
        return (
          <>
            <Row s={s} figures={EX1} dim={[0, 0, 0, 0, 0].map((_, i) => (i === 2 ? 0 : 0))} />
            {[0, 1, 3, 4].map(i => <Ring key={i} {...centre(i)} w={W5 - 30} h={W5 - 30} progress={grouped * (1 - rise(s.t, 10, s.at(2)))} color={C.rule} width={4} />)}
            <Ring {...centre(2)} w={W5 - 20} h={W5 - 20} progress={odd * (1 - rise(s.t, 10, s.at(2)))} />
            <Words x={260} y={620} w={1400} size={60} align="center" appear={rise(s.t, 20, s.at(2) + 10)}>Which one, and why?</Words>
            <Words x={260} y={710} w={1400} size={42} italic color={C.soft} align="center" appear={rise(s.t, 20, s.at(2) + s.speech(2) * 0.55)}>
              The reason matters as much as the answer.
            </Words>
          </>
        );
      },
    },

    // The secret.
    {
      beats: [
        { say: "Start by finding something that four of them have in common." },
        { say: "Then check that the fifth one does not follow that rule." },
        { say: "Last, give the reason, using the twelve things that can change." },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="odd" size={84} />
          </div>
          <Words x={210} w={1500} y={280} size={72} align="center" appear={rise(s.t, 20, s.at(0) + s.speech(0) * 0.3)}>
            Find what four have in common.
          </Words>
          <Words x={210} w={1500} y={390} size={72} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>
            Check the fifth is different.
          </Words>
          <Chips s={s} appearAt={s.at(2) + 6} />
        </>
      ),
    },

    // Worked example 1: shading.
    {
      beats: [
        { say: "Here is one. There is a circle, a triangle, a square, a star and a heart." },
        { say: "Every one is a different shape, so shape cannot be the reason. It does not pick out just one." },
        { say: "Look inside the shapes to see what four of them share. Four of them are striped." },
        { say: "But c is solid black, so it does not follow the rule." },
        { say: "So c is the odd one out, and the reason is shading.", sfx: "chime", sfxAt: 0.8 },
      ],
      render: s => {
        const four = rise(s.t, 22, s.at(2) + s.speech(2) * 0.6);
        const fade = rise(s.t, 12, s.at(3) + 4);
        return (
          <>
            <Row s={s} figures={EX1} dim={[0, 1, 3, 4].reduce((d, i) => { d[i] = fade * 0.45; return d; }, [])} />
            {[0, 1, 3, 4].map(i => <Ring key={i} {...centre(i)} w={W5 - 30} h={W5 - 30} progress={four * (1 - fade)} width={4} />)}
            <Ring {...centre(2)} w={W5 - 16} h={W5 - 16} progress={rise(s.t, 24, s.at(3) + s.speech(3) * 0.4)} />
            <Note x={ROW.x + 520} y={NOTE_Y} size={32} bg="#F3E9DF" color={C.mud} appear={window(s.t, s.at(1) + s.speech(1) * 0.4, s.at(2) + 6)}>all different shapes</Note>
            <Note x={ROW.x + 560} y={NOTE_Y} size={32} appear={window(s.t, s.at(2) + s.speech(2) * 0.7, s.length)}>four are striped</Note>
            <Chips s={s} appearAt={s.at(1)}
              ruled={{ Shape: [s.at(1) + s.speech(1) * 0.3, s.at(2) + 10] }}
              lit={{ Shading: s.at(4) + s.speech(4) * 0.75 }} />
            <Seal x={plateX(2) + W5 - 6} y={ROW.y + 6} size={78} t={s.t} start={s.at(4) + s.speech(4) * 0.25} />
          </>
        );
      },
    },

    // Worked example 2: the mirror trap, with size as a red herring.
    {
      beats: [
        { say: "This one is harder. There are five L shapes, turned different ways. Some are big and some are small." },
        { say: "Two are big and three are small. That does not pick out just one, so size is not the reason." },
        { say: "Let's turn the first one. After a quarter turn, it matches b. After another quarter turn, it matches c. After one more, it matches e." },
        { say: "But d never matches, however you turn it. That is because it has been flipped, so it is a mirror image." },
        { say: "So d is the odd one out, because it is flipped. All of them are turned, so rotation is not the reason here.", sfx: "chime", sfxAt: 1.6 },
      ],
      render: s => {
        // The ghost of a turns in quarter steps, landing as each match is named.
        const b2 = s.at(2), sp = s.speech(2);
        const stops = [b2 + sp * 0.2, b2 + sp * 0.52, b2 + sp * 0.85];
        const angle = stops.reduce((a, at) => a + 90 * rise(s.t, 16, at - 16), 0);
        const ghostOn = window(s.t, b2 + 4, s.at(3) + s.speech(3) * 0.4, 8);
        const matched = [1, 2, 4];
        // Over d, a ghost that keeps turning and never fits.
        const wobble = rise(s.t, Math.max(1, s.speech(3) * 0.5), s.at(3)) * 360;
        const dGhost = window(s.t, s.at(3), s.at(3) + s.speech(3) * 0.6, 8);
        const sizeNote = window(s.t, s.at(1) + s.speech(1) * 0.05, s.at(2) + 6);
        return (
          <>
            <Row s={s} figures={EX2} extra={[
              <g key="g" opacity={ghostOn} transform={`rotate(${angle})`}><Shape kind="lshape" r={82} fill="none" ink={C.gilt} /></g>,
              null, null,
              <g key="d" opacity={dGhost * 0.9} transform={`rotate(${90 + wobble})`}><Shape kind="lshape" r={58} fill="none" ink={C.mud} /></g>,
              null,
            ]} />
            {matched.map((i, k) => (
              <Seal key={i} x={plateX(i) + W5 - 8} y={ROW.y + 8} size={54} t={s.t} start={stops[k] + 4} />
            ))}
            <Ring {...centre(3)} w={W5 - 16} h={W5 - 16} progress={rise(s.t, 24, s.at(3) + s.speech(3) * 0.55)} />
            <Note x={ROW.x + 470} y={NOTE_Y} size={32} bg="#F3E9DF" color={C.mud} appear={sizeNote}>two big, three small</Note>
            <Note x={plateX(3) - 20} y={NOTE_Y} size={32} appear={window(s.t, s.at(3) + s.speech(3) * 0.75, s.length)}>a mirror image</Note>
            <Chips s={s} appearAt={s.at(1)}
              ruled={{ Size: [s.at(1) + s.speech(1) * 0.55, s.at(2) + 10], Rotation: [s.at(4) + s.speech(4) * 0.55, s.length] }}
              lit={{ Flipped: s.at(4) + s.speech(4) * 0.3 }} />
          </>
        );
      },
    },

    // Your turn.
    {
      beats: [
        { say: "Now it's your turn. Which is the odd one out, and why? Pause the video if you would like more time.", hold: 6 },
        { say: "The answer is c. Count the sides. Every other shape has four sides, but c has five. The shading is different on lots of them, so the reason is not shading.", sfx: "chime", sfxAt: 0.7 },
        { say: "So the reason is shape, because c has a different number of sides." },
      ],
      render: s => {
        const counted = s.at(1) + s.speech(1) * 0.28;
        return (
          <>
            <Row s={s} figures={TRY} />
            <div style={{ opacity: window(s.t, 10, s.at(1)) }}>
              <Words x={260} y={600} w={1400} size={50} italic color={C.soft} align="center">Your turn</Words>
              <Countdown x={960} y={742} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={130} />
            </div>
            {TRY.map((_, i) => (
              <div key={i} style={{
                position: "absolute", left: plateX(i), width: W5, top: ROW.y + W5 + 58, textAlign: "center",
                fontFamily: SERIF, fontSize: 38, color: i === 2 ? C.giltDark : C.ink,
                opacity: rise(s.t, 12, counted + i * 8),
              }}>{i === 2 ? "5 sides" : "4 sides"}</div>
            ))}
            <Ring {...centre(2)} w={W5 - 16} h={W5 - 16} progress={rise(s.t, 24, s.at(1) + 6)} />
            <Seal x={plateX(2) + W5 - 6} y={ROW.y + 6} size={78} t={s.t} start={s.at(1) + 10} />
            <div style={{ opacity: rise(s.t, 16, s.at(1) + s.speech(1) * 0.6) }}>
              <Chips s={s} appearAt={s.at(1) + s.speech(1) * 0.6}
                ruled={{ Shading: [s.at(1) + s.speech(1) * 0.7, s.at(2) + 10] }}
                lit={{ Shape: s.at(2) + s.speech(2) * 0.3 }} />
            </div>
          </>
        );
      },
    },

    // Recap.
    {
      beats: [
        { say: "Here is how to find the odd one out." },
        { say: "First, find what four of them share." },
        { say: "Next, check that the fifth one does not follow the rule." },
        { say: "Then give the reason, using the twelve things that can change." },
        { say: "Last, watch out for mirror images. A turned shape can still belong with the others, but a flipped one may be the odd one out." },
      ],
      render: s => (
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={380} y={280} steps={[
          "Find what four of them share.",
          "Check the fifth does not follow it.",
          "Name the reason from the twelve.",
          "Watch for mirror images.",
        ]} />
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Now you can find the odd one out and say why. Well done.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <TitleCard t={s.t} title="Well done" strap="Find the odd one out, and say why." emblem="eye" />,
    },
  ],
};
