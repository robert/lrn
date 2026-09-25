// Word and proof: "Which word best describes this character, and what is
// your proof?" Passages are short excerpts of public-domain text.
import React from "react";
import { C, SERIF } from "../lib/theme.js";
import { rise, window } from "../lib/anim.js";
import { Words, Note, Countdown, Steps, Emblem } from "../lib/ui.jsx";
import { BookPage, QuestionCard, AnswerCards, BookTitle } from "../lib/bookpage.jsx";

const PAGE = { x: 110, y: 146, w: 900, h: 684 };
const Q = { x: 1070, y: 146, w: 740 };
const OPT_Y = 336;

const sweep = (s, at) => rise(s.t, 22, at);
const bad = (text, at) => ({ text, tone: "trap", at });
const good = (text, at) => ({ text, tone: "good", at });

// ---------- Example 1: how the Badger treats them ----------
const EX1 = [
  { n: 8, top: 34, text: "One of these the Badger flung open, and at once they found themselves in all the glow and warmth of a large fire-lit kitchen." },
  { n: 10, top: 204, text: "Then he fetched them dressing-gowns and slippers, and himself bathed the Mole’s shin with warm water and mended the cut with sticking-plaster till the whole thing was just as good as new." },
  { n: 11, top: 450, text: "When at last they were thoroughly toasted, the Badger summoned them to the table, where he had been busy laying a repast." },
];

// ---------- Example 2: the Otter ----------
const EX2 = [
  { n: 1, top: 34, text: "“I knew that when people were in any fix they mostly went to Badger, so I came straight off here, through the Wild Wood and the snow!”" },
  { n: 2, top: 234, text: "“Weren’t you at all—er—nervous?” asked the Mole, some of yesterday’s terror coming back to him at the mention of the Wild Wood." },
  { n: 3, top: 434, text: "“Nervous?” The Otter showed a gleaming set of strong white teeth as he laughed. “I’d give ’em nerves if any of them tried anything on with me.”" },
];

// ---------- Your turn: the Rat ----------
const TRY = [
  { n: 8, top: 34, text: "“Let’s have a look at the leg. Yes,” he went on, going down on his knees to look, “you’ve cut your shin, sure enough. Wait till I get at my handkerchief, and I’ll tie it up for you.”" },
  { n: 27, top: 262, text: "The Rat attacked a snow-bank beside them with ardour, probing with his cudgel everywhere and then digging with fury…" },
  { n: 33, top: 432, text: "While the Rat attacked the door with his stick, the Mole sprang up at the bell-pull, clutched it and swung there, both feet well off the ground." },
];

// One big answer card split into its word and its proof.
function SplitCard({ s }) {
  const a = rise(s.t, 20, 6);
  const kWord = rise(s.t, 18, s.at(1) + s.speech(1) * 0.2);
  const kProof = rise(s.t, 18, s.at(1) + s.speech(1) * 0.6);
  const both = rise(s.t, 22, s.at(2) + s.speech(2) * 0.3);
  const y = 380;
  return (
    <>
      <div style={{
        position: "absolute", left: 300, top: y + (1 - a) * 18, width: 1320, height: 190, opacity: a,
        background: C.white, borderRadius: 12, display: "flex", alignItems: "center",
        boxShadow: `0 0 0 ${1.5 + both * 1.5}px ${both > 0 ? C.gilt : C.rule}, 0 22px 50px -30px rgba(27,42,36,0.55)`,
      }}>
        <div style={{ width: 380, textAlign: "center", fontFamily: SERIF, fontWeight: 600, fontSize: 76, color: C.giltDark }}>Caring</div>
        <div style={{ width: 2, alignSelf: "stretch", margin: "28px 0", background: C.gilt, opacity: 0.4 }} />
        <div style={{ flex: 1, padding: "0 50px", fontFamily: SERIF, fontSize: 44, lineHeight: 1.3, color: C.ink }}>
          he bathes the Mole’s cut shin and fetches them dry clothes.
        </div>
      </div>
      <Note x={300 + 190 - 70} y={y - 74} size={38} appear={kWord}>the word</Note>
      <Note x={300 + 380 + 330} y={y - 74} size={38} appear={kProof}>the proof</Note>
      <Words x={300} w={1320} y={y + 240} size={44} italic color={C.soft} align="center" appear={both}>
        The proof must be in the story. The word must fit the proof.
      </Words>
    </>
  );
}

// ---------- The video ----------
export default {
  id: "reader-character",
  order: 13,
  title: "Word and Proof",
  cloth: "reader",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Word and proof. Describing a character is easy for a Mega Reader, as long as you can prove it.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <BookTitle t={s.t} kicker="Mega Reader" title="Word and Proof" strap="Every word needs its proof." emblem="mask" size={170} />,
    },

    // What the question asks.
    {
      beats: [
        { say: "Some questions ask you to describe a character in one word, and to prove it." },
        { say: "So every answer comes in two halves. A word, like caring or bold. And a proof: something the character really does in the story." },
        { say: "Only one answer has a proof that's really in the story, and a word that really fits it." },
      ],
      render: s => <SplitCard s={s} />,
    },

    // The secret.
    {
      beats: [
        { say: "Here's the secret. Check the proof first. Is it really in the story? Go and find it." },
        { say: "If the proof isn't there, cross that answer out, however good the word sounds." },
        { say: "Then check the word. Does it really fit what the character did?" },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="lens" size={84} />
          </div>
          <Words x={210} w={1500} y={350} size={72} align="center" appear={rise(s.t, 20, s.at(0) + s.speech(0) * 0.25)}>Check the proof first.</Words>
          <Words x={210} w={1500} y={460} size={72} align="center" appear={rise(s.t, 20, s.at(0) + s.speech(0) * 0.6)}>Is it really in the story?</Words>
          <Words x={210} w={1500} y={600} size={50} italic color={C.mud} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>Not there? Cross it out.</Words>
          <Words x={210} w={1500} y={690} size={50} italic color={C.soft} align="center" appear={rise(s.t, 20, s.at(2) + 6)}>Then: does the word fit?</Words>
        </>
      ),
    },

    // Worked example 1.
    {
      beats: [
        { say: "Let's try one. Which word best describes how the Badger treats the Rat and the Mole, and what is your proof?" },
        { say: "Proof first. Answer a says he makes them wash the plates before supper. But look. The Badger lays the supper for them himself. That's not in the story." },
        { say: "Answer b says he makes them sleep in the cold hall. But he takes them straight into a warm, fire-lit kitchen." },
        { say: "Answer c says he eats all the supper himself. That's not in the story either." },
        { say: "Answer d says he bathes the Mole's cut shin and fetches them dry clothes. There it is, in the story!" },
        { say: "Now check the word. Someone who bathes your cut and brings you dry clothes is caring. The word fits the proof. The answer is d!", sfx: "chime", sfxAt: 6.2 },
      ],
      render: s => (
        <>
          <BookPage {...PAGE} appear={rise(s.t, 20, s.at(0) + 20)} paras={EX1}
            marks={[
              { n: 11, phrase: "busy laying a repast", kind: "soft", k: sweep(s, s.at(1) + s.speech(1) * 0.55) },
              { n: 8, phrase: "all the glow and warmth of a large fire-lit kitchen", kind: "soft", k: sweep(s, s.at(2) + s.speech(2) * 0.55) },
              { n: 10, phrase: "fetched them dressing-gowns and slippers", k: sweep(s, s.at(4) + s.speech(4) * 0.55) },
              { n: 10, phrase: "bathed the Mole’s shin with warm water", k: sweep(s, s.at(4) + s.speech(4) * 0.3) },
            ]} />
          <QuestionCard {...Q} appear={rise(s.t, 18, 6)}>
            Which word best describes how the Badger treats the Rat and the Mole, and what is your proof?
          </QuestionCard>
          <AnswerCards t={s.t} x={Q.x} y={OPT_Y} w={Q.w} appearAt={s.at(0) + 30} height={108} gap={22}
            options={[
              { word: "Strict", text: "he makes them wash all the plates before they can have supper." },
              { word: "Mean", text: "he makes them sleep in the cold hall because they woke him." },
              { word: "Greedy", text: "he eats all the supper and only gives them the scraps." },
              { word: "Caring", text: "he bathes the Mole’s cut shin and fetches them dry clothes." },
            ]}
            tags={{
              0: bad("not in the story", s.at(1) + s.speech(1) * 0.8),
              1: bad("not in the story", s.at(2) + s.speech(2) * 0.7),
              2: bad("not in the story", s.at(3) + s.speech(3) * 0.6),
              3: good("in the story", s.at(4) + s.speech(4) * 0.85),
            }}
            strikes={{ 0: s.at(1) + s.speech(1) * 0.9, 1: s.at(2) + s.speech(2) * 0.85, 2: s.at(3) + s.speech(3) * 0.75 }}
            seal={{ index: 3, at: s.at(5) + s.speech(5) * 0.9 }} />
        </>
      ),
    },

    // Worked example 2: true proof, wrong word.
    {
      beats: [
        { say: "Here's a trickier one, about the Otter. Which word best describes him, and what is your proof?" },
        { say: "Proof first. Answer b says he won't set off until the snow melts. But he came straight here, through the Wild Wood and the snow! Out it goes." },
        { say: "Answer d says he won't eat the ham the hedgehogs cook. That's not in the story at all." },
        { say: "Now look closely. Answers a and c have exactly the same proof, and it's true. He came through the Wild Wood on his own, and he laughed when the Mole asked if he was nervous." },
        { say: "So now the word decides it. Would a shy animal march through the Wild Wood and laugh about being nervous? No way! That's the trap: true proof, wrong word." },
        { say: "The answer is c. Bold.", sfx: "chime", sfxAt: 0.4 },
      ],
      render: s => (
        <>
          <BookPage {...PAGE} appear={rise(s.t, 20, s.at(0) + 20)} paras={EX2}
            marks={[
              { n: 1, phrase: "through the Wild Wood and the snow!", k: sweep(s, s.at(1) + s.speech(1) * 0.55) },
              { n: 2, phrase: "nervous?", kind: "underline", k: sweep(s, s.at(3) + s.speech(3) * 0.8) },
              { n: 3, phrase: "as he laughed", k: sweep(s, s.at(3) + s.speech(3) * 0.75) },
              { n: 3, phrase: "“I’d give ’em nerves", kind: "both", k: sweep(s, s.at(4) + s.speech(4) * 0.45) },
            ]} />
          <QuestionCard {...Q} appear={rise(s.t, 18, 6)}>
            Which word best describes the Otter, and what is your proof?
          </QuestionCard>
          <AnswerCards t={s.t} x={Q.x} y={300} w={Q.w} appearAt={s.at(0) + 30} height={108} gap={22}
            options={[
              { word: "Shy", text: "he came through the Wild Wood alone and laughed at being nervous." },
              { word: "Lazy", text: "he won’t set off to find his friends until the snow melts." },
              { word: "Bold", text: "he came through the Wild Wood alone and laughed at being nervous." },
              { word: "Rude", text: "he won’t eat a single bite of the ham the hedgehogs cook." },
            ]}
            tags={{
              1: bad("not in the story", s.at(1) + s.speech(1) * 0.8),
              3: bad("not in the story", s.at(2) + s.speech(2) * 0.7),
              0: s.t < s.at(4) + s.speech(4) * 0.8 ? good("in the story", s.at(3) + s.speech(3) * 0.3) : bad("true proof, wrong word", s.at(4) + s.speech(4) * 0.8),
              2: good("in the story", s.at(3) + s.speech(3) * 0.35),
            }}
            strikes={{ 1: s.at(1) + s.speech(1) * 0.9, 3: s.at(2) + s.speech(2) * 0.8, 0: s.at(4) + s.speech(4) * 0.85 }}
            seal={{ index: 2, at: s.at(5) + s.speech(5) * 0.35 }} />
          <Note x={Q.x + 380} y={300 + 4 * 130 - 4} size={36} appear={rise(s.t, 18, s.at(4) + s.speech(4) * 0.55)}>shy? No way. Bold!</Note>
        </>
      ),
    },

    // Your turn.
    {
      beats: [
        { say: "Your turn. Which word best describes the Rat, and what is your proof? Check every proof first. Pause the video if you'd like more time.", hold: 6 },
        { say: "The proof in c is really there. He goes down on his knees and ties up the cut. And that's kind. The answer is c.", sfx: "chime", sfxAt: 5.4 },
        { say: "Did b catch you? The proof is true, but banging on a door with a stick isn't timid at all!" },
      ],
      render: s => (
        <>
          <BookPage {...PAGE} appear={rise(s.t, 20, 8)} paras={TRY}
            marks={[
              { n: 8, phrase: "going down on his knees to look", k: sweep(s, s.at(1) + s.speech(1) * 0.3) },
              { n: 8, phrase: "I’ll tie it up for you", k: sweep(s, s.at(1) + s.speech(1) * 0.45) },
              { n: 33, phrase: "the Rat attacked the door with his stick", kind: "soft", k: sweep(s, s.at(2) + s.speech(2) * 0.4) },
            ]} />
          <div style={{ opacity: window(s.t, s.at(0) + s.speech(0), s.at(1)) }}>
            <Countdown x={PAGE.x + PAGE.w / 2} y={PAGE.y + 628} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={104} />
          </div>
          <QuestionCard {...Q} appear={rise(s.t, 18, 6)}>
            Which word best describes the Rat, and what is your proof?
          </QuestionCard>
          <AnswerCards t={s.t} x={Q.x} y={300} w={Q.w} appearAt={28} height={108} gap={22}
            options={[
              { word: "Lazy", text: "he sits on a log and lets the Mole do all of the digging." },
              { word: "Timid", text: "he bangs on the door with his stick while the Mole rings." },
              { word: "Kind", text: "he kneels down and ties up the Mole’s cut with his handkerchief." },
              { word: "Careless", text: "he never even looks at the Mole’s hurt leg." },
            ]}
            tags={{ 1: bad("true proof, wrong word", s.at(2) + s.speech(2) * 0.3) }}
            seal={{ index: 2, at: s.at(1) + s.speech(1) * 0.85 }} />
        </>
      ),
    },

    // Recap.
    {
      beats: [
        { say: "So, when a question asks for a word and a proof." },
        { say: "One. Split each answer into its word and its proof." },
        { say: "Two. Check the proof first. Is it really in the story?" },
        { say: "Three. Then check that the word fits the proof." },
        { say: "Four. Only one answer passes both checks." },
      ],
      render: s => (
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={400} y={250} steps={[
          "Split each answer: word and proof.",
          "Check the proof is in the story.",
          "Check the word fits the proof.",
          "Only one answer passes both.",
        ]} />
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Every word, backed up with proof. Nothing gets past a Mega Reader.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <BookTitle t={s.t} title="Proved It" strap="Every word, backed by proof." emblem="book" size={170} />,
    },
  ],
};
