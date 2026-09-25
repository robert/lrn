// Swapped words: two words in a sentence have changed places. Find them.
// Every sentence here is written fresh for this video.
import React from "react";
import * as Remotion from "remotion";
import { C, SERIF } from "../lib/theme.js";
import { rise, window, lerp } from "../lib/anim.js";
import { Seal, Words, Note as NoteBox, TitleCard, Countdown, Steps, Emblem, mix } from "../lib/ui.jsx";

// ---------- Sentences as word tiles ----------

// Words and punctuation as separate tokens; punctuation hugs the word before.
const tokens = sentence => sentence.match(/[\w']+|[.,!?]/g).map(text => ({ text, tight: /^[.,!?]$/.test(text) }));

// Remotion adds a font face to the page only once it has finished loading,
// so wait until the face is really there before measuring anything.
function fontLoaded(family, weight) {
  const has = () => [...document.fonts].some(f => f.family.replace(/["']/g, "") === family && String(f.weight) === weight && f.status === "loaded");
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const poll = () => {
      if (has()) return resolve();
      if (Date.now() - started > 20000) return reject(new Error(`Font ${family} ${weight} never loaded`));
      setTimeout(poll, 30);
    };
    poll();
  });
}

// Measure the words exactly as drawn: a hidden copy of the sentence is laid
// out in the page once the font has loaded, and the frame waits for it.
function useWidths(toks, size) {
  const ref = React.useRef(null);
  const [widths, setWidths] = React.useState(null);
  const [handle] = React.useState(() => Remotion.delayRender("Measuring the words"));
  React.useLayoutEffect(() => {
    let live = true;
    fontLoaded(SERIF, "500").then(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))).then(() => {
      if (!live || !ref.current) return;
      const spans = [...ref.current.querySelectorAll("[data-t]")];
      setWidths({
        words: spans.map(el => el.offsetWidth),
        space: ref.current.querySelector("[data-space]").offsetWidth,
      });
      Remotion.continueRender(handle);
    });
    return () => { live = false; };
  }, []);
  const probe = (
    <div ref={ref} style={{ position: "absolute", left: 0, top: 0, visibility: "hidden", whiteSpace: "pre", fontFamily: SERIF, fontWeight: 500, fontSize: size, lineHeight: 1, fontOpticalSizing: "none" }}>
      {toks.map((tok, i) => <span key={i} data-t={i}>{tok.text}</span>)}
      <span data-space="1"> </span>
    </div>
  );
  return { widths, probe };
}

// Where each token sits (left edge and width) when laid out in `order`.
function layout(toks, order, m, scale = 1) {
  let x = 0;
  const pos = {};
  order.forEach((ti, k) => {
    if (k > 0 && !toks[ti].tight) x += m.space * scale;
    const w = m.words[ti] * scale;
    pos[ti] = { x, w };
    x += w;
  });
  return { pos, width: x };
}

const identity = toks => toks.map((_, i) => i);
const swapped = (order, a, b) => order.map(i => (i === a ? b : i === b ? a : i));

// Which order the sentence is in at time t, and how far through a move it is.
function stage(t, base, moves) {
  let from = base, to = base, k = 1;
  for (const m of moves) {
    if (t < m.at) break;
    from = to;
    to = m.order;
    k = rise(t, m.dur ?? 30, m.at);
  }
  return { from, to, k };
}

// A sentence as word tiles. Swapped words lift and arc past each other.
// tint: {token: 0..1} warms a word to mud with a wavy line (the silly part).
// under: {token: 0..1} draws the gilt answer underline.
// sweep: 0..1 a gilt reading line travelling under the sentence.
function Sentence({ sentence, t, cx = 960, cy = 440, size = 76, base, moves = [], tint = {}, under = {}, sweep = 0, appear = 1, dim = 0, notes = [] }) {
  const toks = tokens(sentence);
  const { widths, probe } = useWidths(toks, size);
  if (!widths) return probe;
  // Shrink to fit the page if the sentence is too long.
  const full = layout(toks, identity(toks), widths).width;
  const f = Math.min(1, 1560 / full);
  const sz = size * f;
  const b = base ?? identity(toks);
  const { from, to, k } = stage(t, b, moves);
  const A = layout(toks, from, widths, f), B = layout(toks, to, widths, f);
  const left = cx - lerp(A.width, B.width, k) / 2;
  const width = lerp(A.width, B.width, k);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: appear * (1 - dim * 0.6) }}>
      {toks.map((tok, i) => {
        const xa = cx - A.width / 2 + A.pos[i].x;
        const xb = cx - B.width / 2 + B.pos[i].x;
        const moving = from.indexOf(i) !== to.indexOf(i);
        const dir = Math.sign(xb - xa);
        const lift = moving ? -dir * Math.sin(Math.PI * k) * sz * 1.05 : 0;
        const x = lerp(xa, xb, k);
        const y = cy + lift;
        const w = B.pos[i].w;
        const tn = tint[i] ?? 0;
        const u = under[i] ?? 0;
        return (
          <div key={i}>
            <div data-word={i} style={{
              position: "absolute", left: x, top: y - sz * 0.72, whiteSpace: "nowrap",
              fontFamily: SERIF, fontWeight: 500, fontSize: sz, lineHeight: 1, fontOpticalSizing: "none",
              color: tn > 0 ? mix(C.ink, C.mud, tn) : C.ink,
              transform: moving ? `scale(${1 + 0.06 * Math.sin(Math.PI * k)})` : undefined,
            }}>{tok.text}</div>
            {tn > 0 && (
              <svg style={{ position: "absolute", left: x, top: y + sz * 0.2, overflow: "visible", opacity: tn }} width={w} height={14}>
                <path d={wave(w)} fill="none" stroke={C.mud} strokeWidth={3} strokeLinecap="round" />
              </svg>
            )}
            {u > 0 && (
              <div style={{
                position: "absolute", left: x - 4, top: y + sz * 0.22, height: 6, borderRadius: 3,
                width: (w + 8) * Math.min(1, u), background: `linear-gradient(90deg, ${C.giltDark}, ${C.gilt}, ${C.giltLight})`,
              }} />
            )}
          </div>
        );
      })}
      {notes.map((n, j) => {
        const i = n.token;
        const x = lerp(cx - A.width / 2 + A.pos[i].x, cx - B.width / 2 + B.pos[i].x, k) + B.pos[i].w / 2;
        return (
          <div key={`n${j}`} style={{ position: "absolute", left: x, top: cy - sz * 0.72 - 84, transform: "translateX(-50%)" }}>
            <NoteBox x={0} y={0} size={34} appear={n.appear} bg={n.mud ? "#F3E9DF" : C.highlight} color={n.mud ? C.mud : C.ink}>{n.text}</NoteBox>
          </div>
        );
      })}
      {sweep > 0 && sweep < 1.02 && (
        <div style={{
          position: "absolute", left: left - 6, top: cy + sz * 0.46, height: 3, borderRadius: 2,
          width: (width + 12) * Math.min(1, sweep), background: C.gilt, opacity: 0.55 * (1 - rise(sweep * 100, 10, 90)),
        }} />
      )}
    </div>
  );
}

// A gentle wavy line, like a teacher's "this doesn't sound right".
function wave(w) {
  const n = Math.max(3, Math.round(w / 18));
  let d = "M 0 6";
  for (let i = 0; i < n; i++) {
    const x1 = (w * (i + 0.5)) / n, x2 = (w * (i + 1)) / n;
    d += ` Q ${x1} ${i % 2 ? 12 : 0} ${x2} 6`;
  }
  return d;
}

// Reading along: the gilt line runs under the sentence while it is read aloud.
const reading = (s, beat, from = 0.25, to = 0.95) =>
  rise(s.t, Math.max(1, s.speech(beat) * (to - from)), s.at(beat) + s.speech(beat) * from);

// ---------- The sentences ----------
const CAT = "The cat sat on the mat.";
const CARROT = "The carrot ate a crunchy rabbit.";
const SONG = "The children sang the teacher while their song clapped.";
const TOM = "Tom is London and he was born in seven.";
const BABY = "The baby began to bottle, so Dad warmed her cry.";

// ---------- The video ----------
export default {
  id: "swapped-words",
  order: 8,
  title: "Swapped Words",
  cloth: "cover",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Swapped words. Two words have sneaked into each other's places, and you're going to catch them.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <TitleCard t={s.t} kicker="Nothing gets past you" title="Swapped Words" strap="Two words are in the wrong place." emblem="swap" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "In these questions, two words in a sentence have swapped places.", sfx: "swish", sfxAt: 2.1 },
        { say: "So the sentence sounds silly. The mat sat on the cat!" },
        { say: "Your job is to spot the two swapped words, and underline them." },
      ],
      render: s => {
        const swap = [{ at: s.at(0) + s.speech(0) * 0.62, dur: 34, order: swapped(identity(tokens(CAT)), 1, 5) }];
        const silly = window(s.t, s.at(1) + s.speech(1) * 0.5, s.at(2) + 8);
        return (
          <>
            <Words x={260} w={1400} y={220} size={40} italic color={C.soft} align="center" appear={rise(s.t, 18, 6)}>
              Two words have swapped places.
            </Words>
            <Sentence sentence={CAT} t={s.t} cy={470} size={96} moves={swap} appear={rise(s.t, 18, 10)}
              tint={{ 1: silly, 5: silly }}
              under={{ 5: rise(s.t, 18, s.at(2) + s.speech(2) * 0.55), 1: rise(s.t, 18, s.at(2) + s.speech(2) * 0.7) }} />
            <Words x={260} w={1400} y={640} size={40} italic color={C.soft} align="center" appear={rise(s.t, 18, s.at(2) + s.speech(2) * 0.8)}>
              Underline the two words.
            </Words>
          </>
        );
      },
    },

    // The secret.
    {
      beats: [
        { say: "Here's the secret. First, read the sentence out loud, and listen for the silly part." },
        { say: "Then find the word that's in the wrong place, and the word it should swap with." },
        { say: "Swap them over, then read it again to check it makes sense. Never skip the check!" },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="swap" size={84} />
          </div>
          <Words x={210} w={1500} y={350} size={70} align="center" appear={rise(s.t, 20, s.at(0) + 6)}>
            Read it out loud.
          </Words>
          <Words x={210} w={1500} y={460} size={70} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>
            Find the wrong word, and its partner.
          </Words>
          <Words x={210} w={1500} y={600} size={54} italic color={C.giltDark} align="center" appear={rise(s.t, 20, s.at(2) + 6)}>
            Swap them, then read it again.
          </Words>
        </>
      ),
    },

    // Worked example 1: two nouns swapped.
    {
      beats: [
        { say: "Here's one. The carrot ate a crunchy rabbit." },
        { say: "Can a carrot eat anything? No! That's the silly part." },
        { say: "Carrots get eaten, and rabbits do the eating. So carrot and rabbit are the swapped pair." },
        { say: "Swap them over.", sfx: "swish", sfxAt: 0.3 },
        { say: "Now read it again. The rabbit ate a crunchy carrot. That makes perfect sense.", sfx: "chime", sfxAt: 4.2 },
        { say: "So on the paper, you'd underline carrot and rabbit." },
      ],
      render: s => {
        const moves = [{ at: s.at(3) + 8, dur: 36, order: swapped(identity(tokens(CARROT)), 1, 5) }];
        const silly = window(s.t, s.at(1) + s.speech(1) * 0.1, s.at(3) + 8);
        const u1 = rise(s.t, 18, s.at(2) + s.speech(2) * 0.62);
        const u5 = rise(s.t, 18, s.at(2) + s.speech(2) * 0.76);
        return (
          <>
            <Sentence sentence={CARROT} t={s.t} cy={460} size={96} moves={moves} appear={rise(s.t, 18, 6)}
              tint={{ 1: silly }} notes={[{ token: 1, text: "silly!", appear: silly, mud: true }]} under={{ 1: u1 * (1 - rise(s.t, 10, s.at(3))), 5: u5 * (1 - rise(s.t, 10, s.at(3))) }}
              sweep={s.beat === 4 ? reading(s, 4, 0.3, 0.85) : s.beat === 0 ? reading(s, 0, 0.2, 0.95) : 0} />
            <Seal x={1770} y={440} size={84} t={s.t} start={s.at(4) + s.speech(4) * 0.72} />
            {/* The answer, as it would be marked on the paper. */}
            <div style={{ opacity: rise(s.t, 18, s.at(5)) }}>
              <Words x={260} w={1400} y={608} size={34} italic color={C.soft} align="center">On the paper:</Words>
              <Sentence sentence={CARROT} t={s.t} cy={720} size={56}
                under={{ 1: rise(s.t, 18, s.at(5) + s.speech(5) * 0.55), 5: rise(s.t, 18, s.at(5) + s.speech(5) * 0.8) }} />
            </div>
          </>
        );
      },
    },

    // Worked example 2: the trap of the first silly-looking swap.
    {
      beats: [
        { say: "Here's a trickier one. The children sang the teacher while their song clapped." },
        { say: "The first silly bit is, sang the teacher. You can't sing a teacher! So you might want to swap teacher with children." },
        { say: "Let's try it, and read it again. The teacher sang the children while their song clapped.", sfx: "swish", sfxAt: 1.2 },
        { say: "Hmm. A song still can't clap! So that swap was wrong. That's the trap." },
        { say: "Put them back. What did the children really sing? Their song! And who clapped? The teacher.", sfx: "swish", sfxAt: 0.2 },
        { say: "So swap teacher and song. The children sang the song while their teacher clapped. Perfect.", sfx: "chime", sfxAt: 5.4 },
        { say: "That's why you always read it again. The check catches the trap." },
      ],
      render: s => {
        const base = identity(tokens(SONG));
        const trap = swapped(base, 1, 4);
        const right = swapped(base, 4, 7);
        const moves = [
          { at: s.at(2) + s.speech(2) * 0.18, dur: 36, order: trap },
          { at: s.at(4) + 6, dur: 32, order: base },
          { at: s.at(5) + s.speech(5) * 0.12, dur: 36, order: right },
        ];
        const teacherSilly = window(s.t, s.at(1) + s.speech(1) * 0.12, s.at(2) + s.speech(2) * 0.18);
        const childrenMaybe = window(s.t, s.at(1) + s.speech(1) * 0.78, s.at(2) + s.speech(2) * 0.18);
        const stillSilly = window(s.t, s.at(3) + s.speech(3) * 0.1, s.at(4) + 8);
        const answer = window(s.t, s.at(4) + s.speech(4) * 0.55, s.at(5) + s.speech(5) * 0.14);
        const sealAt = s.at(5) + s.speech(5) * 0.86;
        return (
          <>
            <Sentence sentence={SONG} t={s.t} cy={450} size={78} moves={moves} appear={rise(s.t, 18, 6)}
              tint={{ 4: teacherSilly, 1: childrenMaybe * 0.6, 7: stillSilly, 8: stillSilly }}
              under={{ 4: answer, 7: answer }}
              notes={[{ token: 4, text: "sing a teacher?", appear: teacherSilly, mud: true }, { token: 7, text: "a song can't clap!", appear: stillSilly, mud: true }]}
              sweep={s.beat === 0 ? reading(s, 0, 0.25, 0.97) : s.beat === 2 ? reading(s, 2, 0.4, 0.97) : s.beat === 5 ? reading(s, 5, 0.35, 0.8) : 0} />
            <Words x={260} w={1400} y={600} size={46} italic color={C.mud} align="center" appear={window(s.t, s.at(3) + s.speech(3) * 0.55, s.at(4) + 6)}>
              Still silly, so that was the wrong swap.
            </Words>
            <Words x={260} w={1400} y={650} size={46} italic color={C.giltDark} align="center" appear={rise(s.t, 18, s.at(6))}>
              Reading it again catches the trap.
            </Words>
            <Seal x={960} y={575} size={84} t={s.t} start={sealAt} />
          </>
        );
      },
    },

    // Your turn: two quick ones.
    {
      beats: [
        { say: "Your turn! Two quick ones. Find the two swapped words in each sentence. Pause the video if you'd like more time.", hold: 7 },
        { say: "The first one: London and seven. Tom is seven, and he was born in London. A number and a place!", sfx: "chime", sfxAt: 1.6 },
        { say: "The second one: bottle and cry. The baby began to cry, so Dad warmed her bottle.", sfx: "chime", sfxAt: 1.6 },
      ],
      render: s => {
        const tom = [{ at: s.at(1) + s.speech(1) * 0.3, dur: 36, order: swapped(identity(tokens(TOM)), 2, 8) }];
        const baby = [{ at: s.at(2) + s.speech(2) * 0.3, dur: 36, order: swapped(identity(tokens(BABY)), 4, 10) }];
        const cd = window(s.t, s.at(0) + s.speech(0) * 0.6, s.at(1));
        return (
          <>
            <Words x={260} w={1400} y={160} size={44} italic color={C.soft} align="center" appear={rise(s.t, 16, 8)}>Your turn</Words>
            <Sentence sentence={TOM} t={s.t} cy={340} size={70} moves={tom} appear={rise(s.t, 18, 14)}
              under={{ 2: rise(s.t, 16, s.at(1) + 4), 8: rise(s.t, 16, s.at(1) + 12) }} />
            <Sentence sentence={BABY} t={s.t} cy={520} size={70} moves={baby} appear={rise(s.t, 18, 24)}
              under={{ 4: rise(s.t, 16, s.at(2) + 4), 10: rise(s.t, 16, s.at(2) + 12) }} />
            <div style={{ opacity: cd }}>
              <Countdown x={960} y={700} t={s.t} start={s.at(0) + s.speech(0)} seconds={7} size={130} />
            </div>
            <Seal x={140} y={318} size={70} t={s.t} start={s.at(1) + s.speech(1) * 0.55} />
            <Seal x={140} y={498} size={70} t={s.t} start={s.at(2) + s.speech(2) * 0.55} />
          </>
        );
      },
    },

    // Recap.
    {
      beats: [
        { say: "So, to fix any swapped sentence." },
        { say: "One. Read it out loud." },
        { say: "Two. Find the silly part, and the word that's in the wrong place." },
        { say: "Three. Swap it with its partner." },
        { say: "Four. Read it again to check it makes sense." },
      ],
      render: s => (
        <>
        <Words x={260} w={1400} y={170} size={46} italic color={C.soft} align="center" appear={rise(s.t, 18, 4)}>To fix a swapped sentence</Words>
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={560} y={290} steps={[
          "Read it out loud.",
          "Find the silly part.",
          "Swap the two words.",
          "Read it again to check.",
        ]} />
        </>
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Swapped back and sorted. Nothing gets past you.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <TitleCard t={s.t} title="Sorted" strap="Nothing gets past you." emblem="swap" />,
    },
  ],
};
