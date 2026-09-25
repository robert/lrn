// Two places at once: reading questions that need two parts of the story
// held together. Passages are short excerpts of public-domain text.
import React from "react";
import { C, SERIF } from "../lib/theme.js";
import { rise, window } from "../lib/anim.js";
import { Words, Note, Countdown, Steps, Emblem } from "../lib/ui.jsx";
import { BookPage, QuestionCard, AnswerCards, BookTitle } from "../lib/bookpage.jsx";

// Book page on the left, question and answers on the right.
const PAGE = { x: 110, y: 146, w: 900, h: 684 };
const Q = { x: 1070, y: 146, w: 740 };
const OPT_Y = 384;

// Frames for a mark that sweeps in when a phrase is said.
const sweep = (s, at) => rise(s.t, 22, at);

// ---------- Example 1: the door-scraper ----------
const EX1 = [
  { n: 10, top: 34, text: "“It’s a very clean cut,” said the Rat, examining it again attentively. “That was never done by a branch or a stump. Looks as if it was made by a sharp edge of something in metal.”" },
  { n: 11, top: 262, text: "“Well, never mind what done it,” said the Mole, forgetting his grammar in his pain. “It hurts just the same, whatever done it.”" },
  { gap: true, top: 420 },
  { n: 17, top: 470, text: "“Well,” he said at last, slowly, “I SEE it right enough. Familiar object, I call it. A door-scraper! Well, what of it?”" },
];

// ---------- Example 2: the slippers ----------
const EX2 = [
  { n: 1, top: 34, text: "At last they heard the sound of slow shuffling footsteps approaching the door from the inside. It seemed, as the Mole remarked to the Rat, like some one walking in carpet slippers that were too large for him and down at heel." },
  { gap: true, top: 324 },
  { n: 7, top: 374, text: "The Badger, who wore a long dressing-gown, and whose slippers were indeed very down at heel, carried a flat candlestick in his paw and had probably been on his way to bed." },
];

// ---------- Your turn: when will the Badger act? ----------
const TRY = [
  { n: 6, top: 34, text: "The Badger went through a bit of hard thinking. “Now look here!” he said at last, rather severely; “of course you know I can’t do anything now?”" },
  { gap: true, top: 262 },
  { n: 8, top: 312, text: "“Very well then!” continued the Badger. “But, when once the year has really turned, and the nights are shorter, and halfway through them one rouses and feels fidgety and wanting to be up and doing by sunrise, if not before—you know!”" },
];

// A sketch of a page: grey lines with two lit places and a thread between.
function PlanPage({ s }) {
  const lines = 11;
  const one = 2, two = 8;
  const k1 = rise(s.t, 22, s.at(1) + s.speech(1) * 0.3);
  const k2 = rise(s.t, 22, s.at(1) + s.speech(1) * 0.7);
  const th = rise(s.t, 30, s.at(2) + s.speech(2) * 0.35);
  const x = 560, y = 170, w = 800;
  return (
    <div style={{ position: "absolute", left: x, top: y + (1 - rise(s.t, 20)) * 20, width: w, height: 600, opacity: rise(s.t, 20), background: C.white, borderRadius: 6, boxShadow: `0 0 0 1.5px ${C.ruleSoft}, 0 22px 50px -30px rgba(27,42,36,0.55)` }}>
      {Array.from({ length: lines }, (_, i) => {
        const lit = i === one ? k1 : i === two ? k2 : 0;
        const width = [88, 94, 70, 90, 84, 92, 60, 86, 76, 90, 66][i];
        return (
          <div key={i} style={{ position: "absolute", left: 90, top: 50 + i * 48, width: `${width * 0.82}%`, height: 16, borderRadius: 8, background: C.ruleSoft }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: 8, background: C.highlight, width: `${lit * 100}%`, opacity: 0.95 }} />
          </div>
        );
      })}
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
        <path d={`M 64 ${58 + one * 48} C 18 ${58 + one * 48}, 18 ${58 + two * 48}, 64 ${58 + two * 48}`} fill="none" stroke={C.gilt} strokeWidth={4} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - th} />
        <circle cx={64} cy={58 + one * 48} r={7} fill={C.gilt} opacity={k1} />
        <circle cx={64} cy={58 + two * 48} r={7} fill={C.gilt} opacity={th >= 0.98 ? 1 : 0} />
      </svg>
      <Note x={-250} y={36 + one * 48} size={34} appear={k1}>place one</Note>
      <Note x={-250} y={36 + two * 48} size={34} appear={k2}>place two</Note>
      <Note x={-310} y={36 + 5 * 48} size={34} bg="transparent" color={C.giltDark} appear={th}>what joins them?</Note>
    </div>
  );
}

// ---------- The video ----------
export default {
  id: "reader-across",
  order: 12,
  title: "Two Places at Once",
  cloth: "reader",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Two places at once. Some of the best clues come in pairs, and Mega Readers can hold both in their head.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <BookTitle t={s.t} kicker="Mega Reader" title="Two Places at Once" strap="The best clues come in pairs." emblem="bridge" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "Some reading questions can't be answered from just one spot in the story." },
        { say: "They need two places at once. Something near the start, and something later on." },
        { say: "And the answer is hiding in between. What joins the two places together?" },
      ],
      render: s => <PlanPage s={s} />,
    },

    // The secret.
    {
      beats: [
        { say: "Here's the secret. First, find place one. The question usually tells you where it is." },
        { say: "Then hunt for place two, a little later in the story." },
        { say: "Last, ask what joins them. Maybe something has changed. Maybe one explains the other. Or maybe the second place proves the first one right." },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="bridge" size={84} />
          </div>
          <Words x={210} w={1500} y={350} size={72} align="center" appear={rise(s.t, 20, s.at(0) + s.speech(0) * 0.3)}>Find place one.</Words>
          <Words x={210} w={1500} y={460} size={72} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>Hunt for place two.</Words>
          <Words x={210} w={1500} y={570} size={72} align="center" appear={rise(s.t, 20, s.at(2) + 6)}>Ask what joins them.</Words>
          <Words x={210} w={1500} y={690} size={44} italic color={C.soft} align="center" appear={rise(s.t, 20, s.at(2) + s.speech(2) * 0.4)}>
            A change, a reason, or a proof.
          </Words>
        </>
      ),
    },

    // Worked example 1.
    {
      beats: [
        { say: "Let's try one. The Mole says, never mind what done it. What does the Rat dig up a little later that proves the Mole should have minded?" },
        { say: "Place one. The Mole has cut his leg in the snow, and he says, never mind what done it. He doesn't care." },
        { say: "But the Rat does care. He says the cut looks as if it was made by a sharp edge of something in metal." },
        { say: "Now hunt for place two, a few paragraphs later. The Rat digs in the snow, and finds a door-scraper!" },
        { say: "So what joins them? A door-scraper is a sharp piece of metal. That's what cut the Mole's leg. And door-scrapers sit outside front doors." },
        { say: "So the answer is a. A door-scraper, which means someone's front door is close by.", sfx: "chime", sfxAt: 0.5 },
        { say: "And the others? The story never mentions a knife, the Rat says it was never a branch, and d isn't even a full sentence." },
      ],
      render: s => (
        <>
          <BookPage {...PAGE} appear={rise(s.t, 20, s.at(1) - 10)} paras={EX1}
            marks={[
              { n: 11, phrase: "never mind what done it", k: sweep(s, s.at(1) + s.speech(1) * 0.35) },
              { n: 10, phrase: "made by a sharp edge of something in metal", kind: "both", k: sweep(s, s.at(2) + s.speech(2) * 0.45) },
              { n: 17, phrase: "A door-scraper!", k: sweep(s, s.at(3) + s.speech(3) * 0.75) },
            ]}
            thread={{ from: 11, to: 17, k: rise(s.t, 36, s.at(3) + s.speech(3) * 0.25) }} />
          <Note x={PAGE.x + 360} y={PAGE.y + 612} size={34} appear={rise(s.t, 18, s.at(4) + s.speech(4) * 0.3)}>sharp metal: the scraper cut him!</Note>
          <QuestionCard {...Q} appear={rise(s.t, 18, 6)}>
            The Mole says <i style={{ color: C.mud }}>“never mind what done it”</i>. What does the Rat dig up a little later that proves the Mole should have minded?
          </QuestionCard>
          <AnswerCards t={s.t} x={Q.x} y={OPT_Y} w={Q.w} appearAt={s.at(0) + 30}
            options={[
              { text: "A door-scraper, which means someone’s front door must be close by." },
              { text: "A sharp branch, which proves the Mole just tripped on a stump." },
              { text: "An old lost knife, so there must be robbers hiding in the wood." },
              { text: "a door-mat" },
            ]}
            seal={{ index: 0, at: s.at(5) + s.speech(5) * 0.25 }}
            strikes={{ 2: s.at(6) + s.speech(6) * 0.25, 1: s.at(6) + s.speech(6) * 0.55, 3: s.at(6) + s.speech(6) * 0.85 }} />
        </>
      ),
    },

    // Worked example 2: the one-place trap.
    {
      beats: [
        { say: "Here's a trickier one. At the door, the Mole guesses what the footsteps sound like. What do we find out a little later that proves he was right?" },
        { say: "Place one is right at the start. The Mole says it's like someone walking in carpet slippers that are too big, and down at heel." },
        { say: "Now hunt for place two. Here it is. The Badger's slippers were indeed very down at heel." },
        { say: "Look at that little word, indeed. It means, yes, really. The Mole's guess was right!" },
        { say: "So the answer is b. The Badger's slippers really are worn down at the heel.", sfx: "chime", sfxAt: 0.5 },
        { say: "Now watch out for a. It's true, the footsteps did shuffle. But it only uses place one. It doesn't prove anything. An across answer needs both places." },
        { say: "And c? The Badger carries a candlestick, not a lantern. And d isn't a full sentence." },
      ],
      render: s => (
        <>
          <BookPage {...PAGE} appear={rise(s.t, 20, s.at(1) - 10)} paras={EX2}
            marks={[
              { n: 1, phrase: "slow shuffling footsteps", kind: "soft", k: sweep(s, s.at(5) + s.speech(5) * 0.2) },
              { n: 1, phrase: "carpet slippers that were too large for him and down at heel", k: sweep(s, s.at(1) + s.speech(1) * 0.45) },
              { n: 7, phrase: "slippers were", k: sweep(s, s.at(2) + s.speech(2) * 0.55) },
              { n: 7, phrase: "indeed", kind: "both", k: sweep(s, s.at(3) + s.speech(3) * 0.2) },
              { n: 7, phrase: "very down at heel", k: sweep(s, s.at(2) + s.speech(2) * 0.72) },
              { n: 7, phrase: "a flat candlestick", kind: "underline", k: sweep(s, s.at(6) + s.speech(6) * 0.3) },
            ]}
            thread={{ from: 1, to: 7, k: rise(s.t, 36, s.at(2) + s.speech(2) * 0.2) }} />
          <Note x={PAGE.x + 430} y={PAGE.y + 560} size={34} appear={rise(s.t, 18, s.at(3) + s.speech(3) * 0.45)}>indeed: yes, really!</Note>
          <QuestionCard {...Q} appear={rise(s.t, 18, 6)}>
            At the door, the Mole guesses what the footsteps sound like. What do we find out a little later that proves he was right?
          </QuestionCard>
          <AnswerCards t={s.t} x={Q.x} y={OPT_Y} w={Q.w} appearAt={s.at(0) + 30}
            options={[
              { text: "He hears slow, shuffling footsteps coming up to the door." },
              { text: "The Badger’s slippers really are old and worn down at the heel." },
              { text: "The Badger is dragging a heavy lantern along the floor." },
              { text: "floppy slippers" },
            ]}
            seal={{ index: 1, at: s.at(4) + s.speech(4) * 0.3 }}
            tags={{ 0: { text: "only one place", tone: "trap", at: s.at(5) + s.speech(5) * 0.45 } }}
            strikes={{ 0: s.at(5) + s.speech(5) * 0.75, 2: s.at(6) + s.speech(6) * 0.3, 3: s.at(6) + s.speech(6) * 0.8 }} />
        </>
      ),
    },

    // Your turn.
    {
      beats: [
        { say: "Your turn. The Badger says he can't do anything about Toad right now. What does he say a little later that tells us when he will? Pause the video if you'd like more time.", hold: 6 },
        { say: "Place one: I can't do anything now. Place two: when the year has really turned, and the nights are shorter, and he feels fidgety. That's spring! The answer is c.", sfx: "chime", sfxAt: 9.2 },
      ],
      render: s => (
        <>
          <BookPage {...PAGE} appear={rise(s.t, 20, 8)} paras={TRY}
            marks={[
              { n: 6, phrase: "I can’t do anything now?", k: sweep(s, s.at(1) + s.speech(1) * 0.08) },
              { n: 8, phrase: "when once the year has really turned, and the nights are shorter", k: sweep(s, s.at(1) + s.speech(1) * 0.3) },
              { n: 8, phrase: "feels fidgety", kind: "both", k: sweep(s, s.at(1) + s.speech(1) * 0.52) },
            ]}
            thread={{ from: 6, to: 8, k: rise(s.t, 36, s.at(1) + s.speech(1) * 0.2) }} />
          <div style={{ opacity: window(s.t, s.at(0) + s.speech(0), s.at(1)) }}>
            <Countdown x={PAGE.x + PAGE.w / 2} y={PAGE.y + 590} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={150} />
          </div>
          <Note x={PAGE.x + 360} y={PAGE.y + 600} size={34} appear={rise(s.t, 18, s.at(1) + s.speech(1) * 0.7)}>that's spring!</Note>
          <QuestionCard {...Q} appear={rise(s.t, 18, 6)}>
            The Badger says he can’t do anything about Toad right now. What does he say a little later that tells us when he will?
          </QuestionCard>
          <AnswerCards t={s.t} x={Q.x} y={OPT_Y} w={Q.w} appearAt={28}
            options={[
              { text: "When Toad has crashed one more car and learned his lesson." },
              { text: "When the snow stops tomorrow and they can walk to Toad Hall." },
              { text: "When spring comes and he wakes up fidgety, wanting to be up early." },
              { text: "in the spring" },
            ]}
            seal={{ index: 2, at: s.at(1) + s.speech(1) * 0.93 }} />
        </>
      ),
    },

    // Recap.
    {
      beats: [
        { say: "So, when a question needs two places at once." },
        { say: "One. Find place one. The question points you there." },
        { say: "Two. Hunt for place two, later in the story." },
        { say: "Three. Ask what joins them: a change, a reason, or a proof." },
        { say: "Four. Choose the answer that uses both places, not just one." },
      ],
      render: s => (
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={400} y={250} steps={[
          "Find place one.",
          "Hunt for place two, later on.",
          "Ask what joins them.",
          "Choose the answer that uses both.",
        ]} />
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Two places, one clue, and nothing gets past you. That's a Mega Reader.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <BookTitle t={s.t} title="Joined Up" strap="Two places, one clue." emblem="book" size={170} />,
    },
  ],
};
