// Spot the Change: compare two figures using the twelve things that can change.
// All figures here are drawn fresh for this video.
import React from "react";
import { C, SERIF, SANS } from "../lib/theme.js";
import { rise, pop, window, lerp } from "../lib/anim.js";
import { Shape } from "../lib/shapes.jsx";
import { Plate, Ring, Seal, Words, Note, TitleCard, Countdown, Steps, Emblem } from "../lib/ui.jsx";

// The twelve things that can change, always in this order (shared/attributes.js).
const TWELVE = [
  "Shape", "How many", "Size", "Shading", "Rotation", "Flipped",
  "Position on screen", "In front or behind", "Line style", "Touching", "Pointing at", "Inside or outside",
];

// ---------- Layout ----------
// Two figures on the left, the twelve-item ledger on the right.
const PS = 330; // plate size
const PLATES = [{ x: 150, y: 250 }, { x: 560, y: 250 }];
const LEDGER = { x: 1030, y: 206, w: 740, row: 48 };

// Two plates, first and second, with their figures inked on.
function Pair({ s, first, second, start = 0, labels = ["First", "Second"], glow = [0, 0], extra = [null, null] }) {
  return PLATES.map((p, i) => {
    const a = rise(s.t, 20, start + i * 12);
    const draw = rise(s.t, 36, start + i * 12 + 6);
    const figure = i ? second : first;
    return (
      <Plate key={i} x={p.x} y={p.y} w={PS} h={PS} appear={a} label={labels[i]} glow={glow[i]}>
        {figure.map((sh, j) => <Shape key={j} {...sh} draw={draw} />)}
        {extra[i]}
      </Plate>
    );
  });
}

// The ledger: every one of the twelve with Same and Different beside it.
// marks[i] = { at: frame, value: "same" | "diff" } fills row i in at that frame.
function Ledger({ s, heading, headingAt, marks = [], appearAt = 0, rowsAt = [], dimUnmarked = false }) {
  const a = rise(s.t, 18, appearAt);
  const marked = marks.filter(m => m && s.t >= m.at).length;
  const sweeping = marks.length > 0 && marked < 12 && marks.some(m => m && s.t >= m.at - 30);
  return (
    <div style={{ position: "absolute", left: LEDGER.x, top: LEDGER.y - 70, width: LEDGER.w, opacity: a }}>
      <div style={{
        height: 56, fontFamily: SERIF, fontSize: 38, color: C.ink,
        opacity: headingAt === undefined ? 1 : rise(s.t, 16, headingAt),
      }}>{heading}</div>
      <div style={{
        marginTop: 14, background: C.white, borderRadius: 10, padding: "4px 0",
        boxShadow: `0 0 0 1.5px ${C.ruleSoft}, 0 18px 40px -26px rgba(27,42,36,0.5)`,
      }}>
        {TWELVE.map((label, i) => {
          const m = marks[i];
          const k = m ? pop(s.t, m.at) : 0;
          const shownRow = rowsAt[i] === undefined ? 1 : rise(s.t, 12, rowsAt[i]);
          const current = sweeping && i === marked;
          const diff = m?.value === "diff" && k > 0;
          return (
            <div key={i} style={{
              position: "relative", height: LEDGER.row, display: "flex", alignItems: "center",
              padding: "0 22px", opacity: shownRow * (dimUnmarked && !m ? 0.45 : 1),
              background: diff ? C.highlight : current ? "#EEF3EF" : "transparent",
              borderTop: i ? `1px solid ${C.ruleSoft}` : "none",
            }}>
              <span style={{ fontFamily: SERIF, fontSize: 21, color: C.gilt, width: 34 }}>{i + 1}</span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, color: C.ink, flex: 1 }}>{label}</span>
              <Pill on={m?.value === "same" ? k : 0} kind="same">Same</Pill>
              <Pill on={m?.value === "diff" ? k : 0} kind="diff">Different</Pill>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Pill({ on, kind, children }) {
  const diff = kind === "diff";
  const fill = diff ? `linear-gradient(180deg, ${C.giltLight}, ${C.gilt})` : "#DCE7E1";
  return (
    <span style={{
      marginLeft: 10, width: diff ? 138 : 104, height: 36, borderRadius: 99,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: SANS, fontWeight: 800, fontSize: 20,
      color: on > 0 ? (diff ? C.clothDeep : C.ink) : C.faint,
      background: on > 0 ? fill : "transparent",
      boxShadow: on > 0 ? "none" : `inset 0 0 0 1.5px ${C.ruleSoft}`,
      transform: `scale(${on > 0 ? lerp(1.25, 1, on) : 1})`,
    }}>{children}</span>
  );
}

// Spread n marks evenly between two frames.
const spread = (from, to, n) => Array.from({ length: n }, (_, i) => from + ((to - from) * i) / Math.max(1, n - 1));
const same = at => ({ at, value: "same" });
const diff = at => ({ at, value: "diff" });

// ---------- The figures ----------
// Example 1: one shape, two changes (shading and position).
const EX1_A = [{ kind: "triangle", r: 42, fill: "black", x: -78, y: -78 }];
const EX1_B = [{ kind: "triangle", r: 42, fill: "striped", x: 78, y: 78 }];

// Example 2: a flag, mirrored. The classic trap.
const FLAG = { kind: "flag", r: 96, fill: "grey" };

// Your turn: two shapes; the heart moves inside the square.
const TRY_A = [{ kind: "square", r: 78, fill: "white", x: -42 }, { kind: "heart", r: 30, fill: "grey", x: 104 }];
const TRY_B = [{ kind: "square", r: 78, fill: "white", x: -42 }, { kind: "heart", r: 30, fill: "grey", x: -42 }];

// A turning ghost of the first flag, drawn in gilt over the second plate.
function Ghost({ rot, flipX = 1, opacity = 1, color = C.gilt }) {
  return (
    <g opacity={opacity} transform={`rotate(${rot}) scale(${flipX} 1)`}>
      <Shape kind="flag" r={96} fill="none" ink={color} />
    </g>
  );
}

const plateCentre = i => ({ x: PLATES[i].x + PS / 2, y: PLATES[i].y + PS / 2 });

// ---------- The video ----------
export default {
  id: "spot-the-change",
  order: 1,
  title: "Spot the Change",
  cloth: "spotter",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Spot the Change. There are twelve things that can change between two pictures. If you check them all, you will find every change.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <TitleCard t={s.t} kicker="Picture puzzles" title="Spot the Change" strap="Check all twelve things that can change." emblem="lens" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "In a spot the change question, you get two figures, one after the other." },
        { say: "Something has changed between them. It might be one thing, or more than one." },
        { say: "You need to find every change and say exactly what it is." },
      ],
      render: s => (
        <>
          <Pair s={s} first={EX1_A} second={EX1_B} glow={[0, window(s.t, s.at(1) + 10, s.length)]} />
          <Words x={1040} y={330} w={700} size={60} appear={rise(s.t, 20, s.at(1) + 20)}>What changed?</Words>
          <Words x={1040} y={430} w={700} size={46} italic color={C.soft} appear={rise(s.t, 20, s.at(2) + 20)}>
            Find every change.<br />Name each one exactly.
          </Words>
        </>
      ),
    },

    // The secret: only twelve things can change.
    {
      beats: [
        { say: "There are only twelve things that can change. We always check them in the same order." },
        {
          say: "Shape. How many. Size. Shading. Rotation. Flipped. Position on screen. In front or behind. Line style. Touching. Pointing at. Inside or outside.",
          voice: "Shape. How many. Size. Shading. Rotation. Flipped. Position on screen. In front, or behind. Line style. Touching. Pointing at. Inside, or outside.",
        },
        { say: "Check every one, from the top of the list to the bottom, so that you do not miss a change." },
      ],
      render: s => {
        // Each row appears as its name is spoken (timed by letters).
        const text = TWELVE.join(". ") + ".";
        let pos = 0;
        const rowsAt = TWELVE.map(w => {
          const at = s.at(1) + (pos / text.length) * s.speech(1);
          pos += w.length + 2;
          return at;
        });
        return (
          <>
            <div style={{ position: "absolute", left: 250, top: 300, width: 600, textAlign: "center", opacity: rise(s.t, 18, 6) }}>
              <div style={{ display: "flex", justifyContent: "center" }}><Emblem name="lens" size={96} /></div>
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 150, color: C.ink, lineHeight: 1 }}>12</div>
              <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 46, color: C.soft }}>things can change</div>
            </div>
            <Words x={250} y={660} w={600} size={40} italic color={C.giltDark} align="center" appear={rise(s.t, 18, s.at(2) + 10)}>
              Check them from top to bottom.
            </Words>
            <Ledger s={s} heading="The twelve" rowsAt={rowsAt} appearAt={10} />
          </>
        );
      },
    },

    // Worked example 1: one shape, two changes.
    {
      beats: [
        { say: "Let's try one. There's only one shape here, so we call it Shape A. We describe it by how it looks in the first figure. It is a small black triangle." },
        { say: "Now go down the list. The shape is still a triangle, so shape is the same. There is still only one, so how many is the same. It is still small, so size is the same." },
        { say: "Next is shading. It was black, and now it is striped, so the shading is different.", sfx: "tick", sfxAt: 3.0 },
        { say: "It has not been turned or flipped, so rotation and flipped are both the same." },
        { say: "Next is position on screen. It has moved from the top corner to the bottom corner, so its position is different.", sfx: "tick", sfxAt: 5.0 },
        { say: "In front or behind is the same, because there is only one shape. The line is still solid, so line style is the same. Touching, pointing at and inside or outside all need two shapes, so they are the same too." },
        { say: "So two things have changed, the shading and the position.", sfx: "chime", sfxAt: 0.2 },
      ],
      render: s => {
        const b1 = s.at(1), sp1 = s.speech(1);
        const marks = [
          same(b1 + sp1 * 0.43), same(b1 + sp1 * 0.73), same(b1 + sp1 * 0.97),
          diff(s.at(2) + s.speech(2) * 0.8),
          same(s.at(3) + s.speech(3) * 0.6), same(s.at(3) + s.speech(3) * 0.95),
          diff(s.at(4) + s.speech(4) * 0.9),
          same(s.at(5) + s.speech(5) * 0.15), same(s.at(5) + s.speech(5) * 0.56),
          ...spread(s.at(5) + s.speech(5) * 0.85, s.at(5) + s.speech(5), 3).map(same),
        ];
        const shadeRing = rise(s.t, 22, s.at(2) + 10) * (1 - rise(s.t, 8, s.at(3)));
        const posRing = rise(s.t, 22, s.at(4) + 20) * (1 - rise(s.t, 8, s.at(5)));
        const summary = rise(s.t, 18, s.at(6) + 10);
        return (
          <>
            <Pair s={s} first={EX1_A} second={EX1_B} glow={[0, summary]} />
            <Ring x={PLATES[1].x + PS / 2 + 78} y={PLATES[1].y + PS / 2 + 78} w={120} h={120} progress={shadeRing} />
            <Ring x={PLATES[0].x + PS / 2 - 78} y={PLATES[0].y + PS / 2 - 78} w={120} h={120} progress={posRing} />
            <Ring x={PLATES[1].x + PS / 2 + 78} y={PLATES[1].y + PS / 2 + 78} w={120} h={120} progress={posRing} />
            <Ledger s={s} heading="Shape A: small black triangle" headingAt={s.at(0) + s.speech(0) * 0.7} marks={marks} appearAt={s.at(0) + 20} />
            <Note x={PLATES[0].x + 60} y={PLATES[0].y + PS + 70} appear={summary}>Changed: shading, position</Note>
            <Seal x={PLATES[1].x + PS - 8} y={PLATES[1].y + 8} size={78} t={s.t} start={s.at(6) + 12} />
          </>
        );
      },
    },

    // Worked example 2: flipped, not rotated.
    {
      beats: [
        { say: "This next one catches out lots of people. Shape A is a grey flag. In the second figure, the flag points the other way." },
        { say: "Many people think it has been rotated. To check, watch the first flag turn all the way round." },
        { say: "It never matches. However you turn it, it cannot point that way." },
        { say: "That is because it has been flipped, like a reflection in a mirror." },
        { say: "So rotation is the same, and flipped is different. You cannot make a mirror image just by turning a shape.", sfx: "chime", sfxAt: 2.2 },
      ],
      render: s => {
        // The ghost turns a full circle during beat 1 and into beat 2.
        const turnStart = s.at(1) + s.speech(1) * 0.6;
        const turnEnd = s.at(2) + s.speech(2) * 0.5;
        const turn = rise(s.t, Math.max(1, turnEnd - turnStart), turnStart);
        const ghostOn = window(s.t, turnStart - 8, s.at(3) + 6, 8);
        // Then a mirror line, and the ghost flips across it to match.
        const mirror = rise(s.t, 18, s.at(3) + 8);
        const flipK = rise(s.t, 28, s.at(3) + s.speech(3) * 0.55);
        const flipOn = window(s.t, s.at(3) + 4, s.at(4) + s.speech(4) * 0.4, 10);
        const nope = window(s.t, s.at(2) + 6, s.at(3) + 6);
        const marks = [
          ...spread(s.at(4), s.at(4) + 10, 4).map(same),
          same(s.at(4) + s.speech(4) * 0.2), diff(s.at(4) + s.speech(4) * 0.4),
          ...spread(s.at(4) + s.speech(4) * 0.5, s.at(4) + s.speech(4) * 0.75, 6).map(same),
        ];
        const ghosts = [
          <g key="turn">
            <Ghost rot={turn * 360} opacity={ghostOn * 0.9} color={C.gilt} />
            <Ghost rot={0} flipX={Math.cos(Math.PI * flipK)} opacity={flipOn * 0.95} color={C.giltDark} />
            {mirror > 0 && (
              <line x1={0} y1={-140 * mirror} x2={0} y2={140 * mirror} stroke={C.gilt} strokeWidth={3}
                strokeDasharray="10 9" opacity={flipOn} />
            )}
          </g>,
        ];
        return (
          <>
            <Pair s={s} first={[FLAG]} second={[{ ...FLAG, flip: true }]} extra={[null, ghosts]} />
            <Note x={PLATES[1].x + 40} y={PLATES[1].y - 72} size={32} bg="#F3E9DF" color={C.mud} appear={nope}>no turn matches</Note>
            <Note x={PLATES[1].x + 60} y={PLATES[1].y - 72} size={32} appear={window(s.t, s.at(3) + 30, s.length)}>a mirror image</Note>
            <Ledger s={s} heading="Shape A: large grey flag" marks={marks} appearAt={10} dimUnmarked />
            <Seal x={PLATES[1].x + PS - 8} y={PLATES[1].y + 8} size={78} t={s.t} start={s.at(4) + s.speech(4) * 0.4} />
          </>
        );
      },
    },

    // Your turn.
    {
      beats: [
        { say: "Now it's your turn. There are two shapes this time. Shape A is a large white square, and Shape B is a small grey heart. What changed for the heart? Pause the video if you would like more time.", hold: 6 },
        { say: "Here is the answer. The heart has moved, so its position on screen is different. It is now inside the square, so inside or outside is different too.", sfx: "chime", sfxAt: 0.4 },
        { say: "The square did not change at all. So there are two changes, and both are to the heart." },
      ],
      render: s => {
        const marks = [
          ...spread(s.at(1), s.at(1) + 16, 6).map(same),
          diff(s.at(1) + s.speech(1) * 0.3),
          ...spread(s.at(1) + s.speech(1) * 0.36, s.at(1) + s.speech(1) * 0.5, 4).map(same),
          diff(s.at(1) + s.speech(1) * 0.9),
        ];
        const ringB = rise(s.t, 22, s.at(1) + 16);
        return (
          <>
            <Pair s={s} first={TRY_A} second={TRY_B} />
            <Ring x={PLATES[0].x + PS / 2 + 104} y={PLATES[0].y + PS / 2} w={90} h={90} progress={ringB} />
            <Ring x={PLATES[1].x + PS / 2 - 42} y={PLATES[1].y + PS / 2} w={90} h={90} progress={ringB} />
            <div style={{ opacity: window(s.t, 10, s.at(1)) }}>
              <Words x={LEDGER.x} y={260} w={LEDGER.w} size={46} italic color={C.soft} align="center">Your turn</Words>
              <Words x={LEDGER.x} y={340} w={LEDGER.w} size={40} align="center" color={C.ink}>What changed for Shape B, the heart?</Words>
              <Countdown x={LEDGER.x + LEDGER.w / 2} y={560} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={170} />
            </div>
            <div style={{ opacity: rise(s.t, 16, s.at(1)) }}>
              <Ledger s={s} heading="Shape B: small grey heart" marks={marks} appearAt={s.at(1)} />
            </div>
            <Seal x={PLATES[1].x + PS - 8} y={PLATES[1].y + 8} size={78} t={s.t} start={s.at(1) + s.speech(1) * 0.92} />
          </>
        );
      },
    },

    // Remember the twelve: three lines of four, said like a chant.
    {
      beats: [
        { say: "To help you remember all twelve, say them in three lines of four." },
        { say: "Shape, how many, size, shading.", voice: "Shape. How many. Size. Shading." },
        { say: "Rotation, flipped, position, in front or behind.", voice: "Rotation. Flipped. Position. In front, or behind." },
        { say: "Line style, touching, pointing at, inside or outside.", voice: "Line style. Touching. Pointing at. Inside, or outside." },
        { say: "Say the three lines a few times each day, and soon you will know them by heart." },
      ],
      render: s => {
        const lines = [TWELVE.slice(0, 4), TWELVE.slice(4, 8), TWELVE.slice(8, 12)];
        return (
          <>
            <Words x={260} y={170} w={1400} size={46} italic color={C.soft} align="center" appear={rise(s.t, 18, 6)}>Three lines of four</Words>
            {lines.map((line, li) => (
              <div key={li} style={{ position: "absolute", left: 160, width: 1600, top: 300 + li * 130, display: "flex", justifyContent: "center", gap: 14 }}>
                {line.map((w, wi) => {
                  const at = s.at(li + 1) + (s.speech(li + 1) * wi) / 4;
                  const k = rise(s.t, 14, at);
                  const hot = window(s.t, at, at + s.speech(li + 1) / 4 + 6, 6);
                  return (
                    <span key={wi} style={{
                      fontFamily: SERIF, fontSize: 52, color: C.ink, opacity: k, whiteSpace: "nowrap",
                      padding: "6px 18px 10px", borderRadius: 12,
                      background: hot > 0.05 ? `rgba(255,241,184,${hot})` : "transparent",
                      transform: `translateY(${(1 - k) * 14}px)`,
                    }}>
                      {w}{wi < 3 ? "," : ""}
                    </span>
                  );
                })}
              </div>
            ))}
            <Words x={260} y={720} w={1400} size={40} italic color={C.giltDark} align="center" appear={rise(s.t, 18, s.at(4) + 10)}>
              Say them every day.
            </Words>
          </>
        );
      },
    },

    // Recap.
    {
      beats: [
        { say: "Here is how to spot every change." },
        { say: "First, name each shape by how it looks in the first figure." },
        { say: "Next, go through all twelve, from top to bottom." },
        { say: "Then say same or different for each one." },
        { say: "Last, if something points the other way, check whether it was turned or flipped." },
      ],
      render: s => (
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={380} y={280} steps={[
          "Name each shape by how it looks first.",
          "Check all twelve, top to bottom.",
          "Say same or different for each one.",
          "Check if it was turned or flipped.",
        ]} />
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Check all twelve things every time, and you will find every change. Well done.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <TitleCard t={s.t} title="Well done" strap="Check all twelve things every time." emblem="eye" />,
    },
  ],
};
