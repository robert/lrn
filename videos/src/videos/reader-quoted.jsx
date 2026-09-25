// What do the words mean? Questions that quote a few words from the story.
import React from "react";
import { C } from "../lib/theme.js";
import { rise, window } from "../lib/anim.js";
import { Words, Note, Countdown, Steps, Emblem } from "../lib/ui.jsx";
import { StoryPage, AskCard, Choices, LongTitleCard } from "../lib/readerpage.jsx";

// Book page on the left, question and answers on the right.
const PAGE = { x: 130, y: 150, w: 920 };
const Q = { x: 1110, y: 150, w: 680 };
const ANS_Y = 350;

// ---------- Passages (public-domain text) ----------
const P4 = "“Oh, Badger,” cried the Rat, “let us in, please. It’s me, Rat, and my friend Mole, and we’ve lost our way in the snow.”";
const P5 = "“What, Ratty, my dear little man!” exclaimed the Badger, in quite a different voice. “Come along in, both of you, at once. Why, you must be perished. Well I never! Lost in the snow! And in the Wild Wood, too, and at this time of night! But come in with you.”";
const P10 = "In the embracing light and warmth, warm and dry at last, with weary legs propped up in front of them, it seemed to the storm-driven animals, now in safe anchorage, that the cold and trackless Wild Wood just left outside was miles and miles away.";
const P13 = "“Oh, from bad to worse,” said the Rat gravely, while the Mole, cocked up on a settle and basking in the firelight, his heels higher than his head, tried to look properly mournful.";

// ---------- The video ----------
export default {
  id: "reader-quoted",
  order: 10,
  title: "What Do the Words Mean?",
  cloth: "reader",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "What do the words mean? These questions are all about the storyteller's words, and Mega Readers are brilliant at them.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <LongTitleCard t={s.t} kicker="Mega Reader" title="What do the words mean?" strap="Every word is there for a reason." emblem="quote" />,
    },

    // What the question asks.
    {
      beats: [
        { say: "Some questions quote a few words from the story, in italics, like this." },
        { say: "They ask what the words mean, or how a character really feels, or why the storyteller put it that way." },
        { say: "The words are always there in the story, waiting for you. Find them, and you're halfway there." },
      ],
      render: s => (
        <>
          <AskCard x={620} w={680} y={200} size={44} appear={rise(s.t, 18, 4)}
            text="The Badger says *Why, you must be perished.* What does he mean?" />
          <div style={{ opacity: window(s.t, s.at(1), s.at(2) + 8) }}>
            {["what it means", "how they feel", "why it's put that way"].map((w, j) => (
              <Note key={w} x={420 + j * 380} y={470} size={34} appear={rise(s.t, 14, s.at(1) + s.speech(1) * (0.2 + j * 0.28))}>{w}</Note>
            ))}
          </div>
          <StoryPage x={400} y={420} w={1120} t={s.t} appear={rise(s.t, 20, s.at(2) + 4)} size={34}
            paras={[{ n: 5, text: P5, marks: [{ text: "Why, you must be perished.", at: s.at(2) + s.speech(2) * 0.3 }] }]} />
        </>
      ),
    },

    // The secret.
    {
      beats: [
        { say: "Here's the secret. First, find the words in the story." },
        { say: "Then read the whole sentence around them, not just the words on their own." },
        { say: "And ask: what do they mean here, in this story? Not word by word, but what's really going on." },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="quote" size={84} />
          </div>
          <Words x={210} w={1500} y={340} size={72} align="center" appear={rise(s.t, 20, s.at(0) + s.speech(0) * 0.4)}>Find the words.</Words>
          <Words x={210} w={1500} y={450} size={72} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>Read the whole sentence.</Words>
          <Words x={210} w={1500} y={560} size={72} align="center" appear={rise(s.t, 20, s.at(2) + 6)}>Ask what they mean here.</Words>
        </>
      ),
    },

    // Example 1: an old-fashioned word.
    {
      beats: [
        { say: "Let's try one. The Badger says: why, you must be perished. What does he mean?" },
        { say: "First, find the words. Here they are, in paragraph five." },
        { say: "Now read the sentences around them. Lost in the snow! And at this time of night!" },
        { say: "Perished is an old fashioned word. Here, it means frozen and worn out, after a long night in the snow." },
        { say: "Could they really be ghosts, or eaten up? No! He's asking them in. So a and c are out." },
        { say: "The answer is b. They must be terribly cold and tired.", sfx: "chime", sfxAt: 0.4 },
      ],
      render: s => (
        <>
          <StoryPage x={PAGE.x} y={PAGE.y} w={PAGE.w} t={s.t} appear={rise(s.t, 20, s.at(1))}
            paras={[
              { n: 4, text: P4, dim: rise(s.t, 16, s.at(1) + 20) },
              {
                n: 5, text: P5, focus: rise(s.t, 12, s.at(1) + 20), marks: [
                  { text: "Why, you must be perished.", at: s.at(1) + s.speech(1) * 0.5 },
                  { text: "Lost in the snow!", kind: "underline", at: s.at(2) + s.speech(2) * 0.45 },
                  { text: "at this time of night!", kind: "underline", at: s.at(2) + s.speech(2) * 0.75 },
                  { text: "But come in with you.", kind: "underline", at: s.at(4) + s.speech(4) * 0.62 },
                ],
              },
            ]} />
          <Note x={PAGE.x + 380} y={660} size={36} appear={rise(s.t, 16, s.at(3) + s.speech(3) * 0.4)}>perished: frozen and worn out</Note>
          <AskCard {...Q} appear={rise(s.t, 18, 4)} text="The Badger says *Why, you must be perished.* What does he mean?" />
          <Choices x={Q.x} y={ANS_Y} w={Q.w} t={s.t} appearAt={s.at(0) + 30} correct={1}
            sealAt={s.at(5) + s.speech(5) * 0.3}
            strikes={{ 0: s.at(4) + s.speech(4) * 0.8, 2: s.at(4) + s.speech(4) * 0.88 }}
            options={[
              "He thinks they have died in the snow and are ghosts.",
              "He means they must be terribly cold and worn out.",
              "He thinks animals in the wood have eaten them up.",
              "he is angry",
            ]} />
        </>
      ),
    },

    // Example 2: the word-by-word trap, and the fragment trap.
    {
      beats: [
        { say: "Here's a trickier one. By the fire, they are now in safe anchorage. What does that tell us?" },
        { say: "Find the words, then read the whole sentence. Warm and dry at last. Storm-driven animals. The Wild Wood feels miles and miles away." },
        { say: "An anchorage is where boats shelter from a storm. But there's no real boat here. The storyteller is saying they're like a boat, safe out of the storm." },
        { say: "So watch out for a and b. They read the words one by one, as if there's a real boat, or real anchors. That's the word by word trap." },
        { say: "And c? Safe at last is the right idea. But it's only three words, not a full sentence. Mega Readers choose the full sentence." },
        { say: "The answer is d. They feel safe and still, like a boat tied up out of a storm.", sfx: "chime", sfxAt: 0.4 },
      ],
      render: s => (
        <>
          <StoryPage x={PAGE.x} y={PAGE.y} w={PAGE.w} t={s.t} appear={rise(s.t, 20, s.at(1) - 10)} size={34}
            paras={[{
              n: 10, ellipsisBefore: true, text: P10, focus: rise(s.t, 12, s.at(1)), marks: [
                { text: "now in safe anchorage", at: s.at(1) + 6 },
                { text: "warm and dry at last", kind: "underline", at: s.at(1) + s.speech(1) * 0.3 },
                { text: "storm-driven animals", kind: "underline", at: s.at(1) + s.speech(1) * 0.5 },
                { text: "miles and miles away", kind: "underline", at: s.at(1) + s.speech(1) * 0.82 },
              ],
            }]} />
          <Note x={PAGE.x + 150} y={640} size={36} appear={rise(s.t, 16, s.at(2) + s.speech(2) * 0.72)}>like a boat, safe out of the storm</Note>
          <Note x={PAGE.x + 150} y={720} size={34} bg="#F3E9DF" color={C.mud} appear={rise(s.t, 16, s.at(3) + s.speech(3) * 0.75)}>the word-by-word trap</Note>
          <AskCard {...Q} appear={rise(s.t, 18, 4)} text="By the fire they are *now in safe anchorage*. What does that tell us?" />
          <Choices x={Q.x} y={ANS_Y} w={Q.w} t={s.t} appearAt={s.at(0) + 30} correct={3}
            sealAt={s.at(5) + s.speech(5) * 0.3}
            strikes={{ 0: s.at(3) + s.speech(3) * 0.2, 1: s.at(3) + s.speech(3) * 0.28 }}
            dims={{ 2: s.at(4) + s.speech(4) * 0.55 }}
            options={[
              "They have climbed into a real boat in Badger's house.",
              "Badger's kitchen has heavy iron anchors on the ceiling.",
              "safe at last",
              "They feel safe and still, like a boat out of a storm.",
            ]} />
          <Note x={Q.x + 250} y={ANS_Y + 2 * 120 + 12} size={28} bg="#F3E9DF" color={C.mud}
            appear={window(s.t, s.at(4) + s.speech(4) * 0.62, s.at(5) + 4)}>right idea, not a full sentence</Note>
        </>
      ),
    },

    // Your turn.
    {
      beats: [
        { say: "Your turn. The Mole tried to look properly mournful. Does he really feel sad? Pause the video if you'd like more time.", hold: 6 },
        { say: "Did you spot it? He's basking in the firelight, with his heels higher than his head. That's a cosy, happy Mole, only putting on a sad face. The answer is b.", sfx: "chime", sfxAt: 8.6 },
      ],
      render: s => (
        <>
          <StoryPage x={PAGE.x} y={PAGE.y} w={PAGE.w} t={s.t} appear={rise(s.t, 20, 10)} size={36}
            paras={[{
              n: 1, text: P13, marks: [
                { text: "tried to look properly mournful", at: 40 },
                { text: "basking in the firelight", kind: "underline", at: s.at(1) + s.speech(1) * 0.15 },
                { text: "his heels higher than his head", kind: "underline", at: s.at(1) + s.speech(1) * 0.3 },
              ],
            }]} />
          <div style={{ opacity: window(s.t, s.at(0) + s.speech(0), s.at(1)) }}>
            <Countdown x={PAGE.x + PAGE.w / 2} y={660} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={170} />
          </div>
          <AskCard {...Q} appear={rise(s.t, 18, 4)} text="The Mole *tried to look properly mournful*. Does he really feel sad about Toad?" />
          <Choices x={Q.x} y={ANS_Y + 40} w={Q.w} t={s.t} appearAt={30} correct={1}
            sealAt={s.at(1) + s.speech(1) * 0.92}
            options={[
              "Yes, he is so upset about Toad that he can't stop crying.",
              "No, he is cosy and happy, and only putting on a sad face.",
              "Yes, his feet are up so high that it hurts his back.",
              "only pretending",
            ]} />
        </>
      ),
    },

    // Recap.
    {
      beats: [
        { say: "So, whenever a question quotes the story." },
        { say: "One. Find the words in the story." },
        { say: "Two. Read the whole sentence around them." },
        { say: "Three. Ask what they mean here, not word by word." },
        { say: "Four. Choose the full sentence, not the little fragment." },
      ],
      render: s => (
        <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={420} y={260} steps={[
          "Find the words in the story.",
          "Read the whole sentence around them.",
          "Ask what they mean here.",
          "Choose the full sentence.",
        ]} />
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Words cracked. You really are a Mega Reader.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <LongTitleCard t={s.t} title="Mega Reader" strap="No word gets past you." emblem="book" size={170} />,
    },
  ],
};
