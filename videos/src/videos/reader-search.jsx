// Find the evidence: questions with no quote, where he hunts for the clue.
import React from "react";
import { C } from "../lib/theme.js";
import { rise, window } from "../lib/anim.js";
import { Words, Note, Countdown, Steps, Emblem } from "../lib/ui.jsx";
import { StoryPage, AskCard, Choices, ClueWords, LongTitleCard } from "../lib/readerpage.jsx";

// Book page on the left, question and answers on the right.
const PAGE = { x: 130, y: 150, w: 920 };
const Q = { x: 1110, y: 150, w: 680 };
const ANS_Y = 350;

// ---------- Passages (public-domain text) ----------
const P2 = "There was the noise of a bolt shot back, and the door opened a few inches, enough to show a long snout and a pair of sleepy blinking eyes.";
const P6 = "The two animals tumbled over each other in their eagerness to get inside, and heard the door shut behind them with great joy and relief.";
const P7 = "The Badger, who wore a long dressing-gown, and whose slippers were indeed very down at heel, carried a flat candlestick in his paw and had probably been on his way to bed when their summons sounded.";
const P11 = "He sat in his arm-chair at the head of the table, and nodded gravely at intervals as the animals told their story; and he did not seem surprised or shocked at anything, and he never said, “I told you so,” or, “Just what I always said.” The Mole began to feel very friendly towards him.";
const P12 = "“He’s been asleep two or three times since supper,” said the Mole, laughing. He himself was feeling quite wakeful and even lively, though he didn’t know why. The reason was, of course, that he being naturally an underground animal by birth and breeding, the situation of Badger’s house exactly suited him and made him feel at home.";

const BED_Q = "How do we know the Badger was just about to go to bed when they rang?";

// ---------- The video ----------
export default {
  id: "reader-search",
  order: 11,
  title: "Find the Evidence",
  cloth: "reader",
  scenes: [
    {
      bg: "cloth",
      beats: [{ say: "Find the evidence. Some questions don't tell you where to look. You find the clue yourself, like a detective.", sfx: "chime", sfxAt: 0.3 }],
      render: s => <LongTitleCard t={s.t} kicker="Mega Reader" title="Find the evidence" strap="Every answer leaves a clue." emblem="lens" size={150} />,
    },

    // What the question asks.
    {
      beats: [
        { say: "Some questions don't quote any words at all. They just ask about something that happens, like this." },
        { say: "There's no paragraph number, and no words to tap. You have to find the evidence yourself." },
        { say: "But here's the good news. The right answer always names the clue that proves it. Find the clue, and you'll recognise the answer." },
      ],
      render: s => (
        <>
          <AskCard x={460} w={1000} y={210} size={50} appear={rise(s.t, 18, 4)} text={BED_Q} />
          <Note x={560} y={470} size={38} appear={window(s.t, s.at(1) + s.speech(1) * 0.15, s.at(2) + 6)}>no quote</Note>
          <Note x={820} y={470} size={38} appear={window(s.t, s.at(1) + s.speech(1) * 0.3, s.at(2) + 6)}>no paragraph number</Note>
          <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center", opacity: rise(s.t, 18, s.at(2) + 6) }}>
            <Emblem name="lens" size={96} />
          </div>
          <Words x={260} w={1400} y={570} size={54} italic align="center" color={C.soft} appear={rise(s.t, 20, s.at(2) + s.speech(2) * 0.55)}>
            The right answer names the clue.
          </Words>
        </>
      ),
    },

    // The secret.
    {
      beats: [
        { say: "Here's the secret. Turn the question into clue words to hunt for." },
        { say: "Then scan the story, one paragraph at a time, until you find them." },
        { say: "And choose the answer that names the clue you found. If it isn't in the story, it isn't the answer." },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="lens" size={84} />
          </div>
          <Words x={160} w={1600} y={340} size={70} align="center" appear={rise(s.t, 20, s.at(0) + s.speech(0) * 0.35)}>Turn the question into clue words.</Words>
          <Words x={160} w={1600} y={450} size={70} align="center" appear={rise(s.t, 20, s.at(1) + 6)}>Scan paragraph by paragraph.</Words>
          <Words x={160} w={1600} y={560} size={70} align="center" appear={rise(s.t, 20, s.at(2) + 6)}>Pick the answer that names the clue.</Words>
        </>
      ),
    },

    // Example 1.
    {
      beats: [
        { say: "Let's try one. How do we know the Badger was just about to go to bed when they rang?" },
        { say: "First, turn it into clue words. What goes with bedtime? Night clothes. A candle. Sleepy eyes." },
        { say: "Now scan. Paragraph two: a pair of sleepy blinking eyes. That's a clue!" },
        { say: "Paragraph six? Nothing about bed. Keep going. Paragraph seven: a long dressing-gown, slippers, and a flat candlestick. He was on his way to bed!" },
        { say: "Answer a names those clues: the dressing-gown, the slippers and the candle. That's the one.", sfx: "chime", sfxAt: 0.5 },
        { say: "And watch out for d. He yawns sounds just right for a sleepy badger. But search the page. Nobody yawns! If it isn't in the story, it isn't the answer." },
      ],
      render: s => {
        const scan2 = window(s.t, s.at(2), s.at(3) + 10);
        const scan6 = window(s.t, s.at(3), s.at(3) + s.speech(3) * 0.3);
        const scan7 = rise(s.t, 12, s.at(3) + s.speech(3) * 0.3);
        return (
          <>
            <ClueWords x={PAGE.x + 20} y={300} t={s.t} appear={1 - rise(s.t, 12, s.at(2))}
              starts={[0.3, 0.52, 0.74].map(k => s.at(1) + s.speech(1) * k)}
              words={["night clothes", "a candle", "sleepy eyes"]} />
            <StoryPage x={PAGE.x} y={PAGE.y} w={PAGE.w} t={s.t} appear={rise(s.t, 20, s.at(2))} size={34}
              paras={[
                { n: 2, text: P2, focus: scan2, marks: [{ text: "sleepy blinking eyes", at: s.at(2) + s.speech(2) * 0.5 }] },
                { n: 6, text: P6, focus: scan6, dim: rise(s.t, 14, s.at(3) + s.speech(3) * 0.3) },
                {
                  n: 7, text: P7, focus: scan7, marks: [
                    { text: "a long dressing-gown", at: s.at(3) + s.speech(3) * 0.45 },
                    { text: "slippers", at: s.at(3) + s.speech(3) * 0.58 },
                    { text: "a flat candlestick", at: s.at(3) + s.speech(3) * 0.68 },
                    { text: "on his way to bed", kind: "underline", at: s.at(3) + s.speech(3) * 0.86 },
                  ],
                },
              ]} />
            <Note x={Q.x + 170} y={800} size={34} bg="#F3E9DF" color={C.mud}
              appear={rise(s.t, 16, s.at(5) + s.speech(5) * 0.5)}>nobody yawns: not in the story</Note>
            <AskCard {...Q} appear={rise(s.t, 18, 4)} text={BED_Q} />
            <Choices size={31} x={Q.x} y={ANS_Y} w={Q.w} t={s.t} appearAt={s.at(0) + 30} correct={0}
              sealAt={s.at(4) + s.speech(4) * 0.85}
              strikes={{ 3: s.at(5) + s.speech(5) * 0.6 }}
              options={[
                "He is in a dressing-gown and slippers, and carries a candle.",
                "He tells them he is fast asleep, so come back tomorrow.",
                "His bed is right by the front door, and it's still warm.",
                "he yawns",
              ]} />
          </>
        );
      },
    },

    // Example 2: the answers that sound right but aren't in the story.
    {
      beats: [
        { say: "Here's a trickier one. Find the moment the Mole starts to really like the Badger. What makes him feel that way?" },
        { say: "Clue words: like, friendly. Scan until you find them. Here! The Mole began to feel very friendly towards him." },
        { say: "Now read what comes just before. Badger never said, I told you so. He didn't tell them off at all." },
        { say: "Watch out for answer a. Telling them off, then giving them cake, sounds just like a grown-up. But look for cake in the story. There isn't any!" },
        { say: "And b is sneaky. There is an arm-chair in the story, but it's Badger's own seat, not the Mole's." },
        { say: "The answer is c. Badger listened, and never once said, I told you so.", sfx: "chime", sfxAt: 0.4 },
      ],
      render: s => (
        <>
          <ClueWords x={PAGE.x + 20} y={660} t={s.t} label="Clue words" words={["like", "friendly"]}
            starts={[s.at(1) + s.speech(1) * 0.1, s.at(1) + s.speech(1) * 0.2]} />
          <StoryPage x={PAGE.x} y={PAGE.y} w={PAGE.w} t={s.t} appear={rise(s.t, 20, s.at(1) - 6)} size={35}
            paras={[{
              n: 11, ellipsisBefore: true, text: P11, focus: rise(s.t, 12, s.at(1) + s.speech(1) * 0.4), marks: [
                { text: "He sat in his arm-chair", kind: "underline", at: s.at(4) + s.speech(4) * 0.4 },
                { text: "he never said, “I told you so,”", kind: "underline", at: s.at(2) + s.speech(2) * 0.4 },
                { text: "The Mole began to feel very friendly towards him.", at: s.at(1) + s.speech(1) * 0.55 },
              ],
            }]} />
          <Note x={PAGE.x + 40} y={760} size={36} bg="#F3E9DF" color={C.mud}
            appear={rise(s.t, 16, s.at(3) + s.speech(3) * 0.7)}>no cake anywhere</Note>
          <AskCard {...Q} appear={rise(s.t, 18, 4)} text="Find the moment the Mole starts to really like the Badger. What makes him feel that way?" />
          <Choices size={31} x={Q.x} y={ANS_Y + 44} w={Q.w} t={s.t} appearAt={s.at(0) + 30} correct={2}
            sealAt={s.at(5) + s.speech(5) * 0.3}
            strikes={{ 0: s.at(3) + s.speech(3) * 0.82, 1: s.at(4) + s.speech(4) * 0.75 }}
            options={[
              "Badger tells them off for going out, then gives them cake.",
              "Badger lets the Mole sit in his big arm-chair at the table.",
              "Badger listens, and never once says I told you so.",
              "he is kind",
            ]} />
        </>
      ),
    },

    // Your turn.
    {
      beats: [
        { say: "Your turn. Why is the Mole wide awake, when the Rat keeps dropping off? Find the evidence. Pause the video if you'd like more time.", hold: 6 },
        { say: "Did you find it? He's an underground animal, so Badger's house made him feel at home. The answer is c. And strong coffee? It's not in the story!", sfx: "chime", sfxAt: 5.0 },
      ],
      render: s => (
        <>
          <StoryPage x={PAGE.x} y={PAGE.y} w={PAGE.w} t={s.t} appear={rise(s.t, 20, 10)} size={36}
            paras={[{
              n: 12, text: P12, marks: [
                { text: "quite wakeful and even lively", at: s.at(1) + s.speech(1) * 0.08 },
                { text: "an underground animal", kind: "underline", at: s.at(1) + s.speech(1) * 0.2 },
                { text: "made him feel at home", at: s.at(1) + s.speech(1) * 0.35 },
              ],
            }]} />
          <div style={{ opacity: window(s.t, s.at(0) + s.speech(0), s.at(1)) }}>
            <Countdown x={PAGE.x + PAGE.w / 2} y={745} t={s.t} start={s.at(0) + s.speech(0)} seconds={6} size={150} />
          </div>
          <AskCard {...Q} appear={rise(s.t, 18, 4)} text="Why is the Mole wide awake when the Rat keeps dropping off?" />
          <Choices size={31} x={Q.x} y={ANS_Y} w={Q.w} t={s.t} appearAt={30} correct={2}
            sealAt={s.at(1) + s.speech(1) * 0.55}
            strikes={{ 0: s.at(1) + s.speech(1) * 0.85 }}
            options={[
              "He drank strong coffee at supper, so he feels jumpy.",
              "He is still scared of the Wild Wood, so he keeps watch.",
              "He lives underground, so Badger's house feels like home.",
              "too scared",
            ]} />
        </>
      ),
    },

    // Recap.
    {
      beats: [
        { say: "So, whenever a question makes you hunt." },
        { say: "One. Turn the question into clue words." },
        { say: "Two. Scan the story, paragraph by paragraph." },
        { say: "Three. Find the evidence." },
        { say: "Four. Pick the answer that names your clue. If it isn't in the story, it isn't the answer." },
      ],
      render: s => (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center", opacity: rise(s.t, 18) }}>
            <Emblem name="lens" size={72} />
          </div>
          <Steps t={s.t} starts={[s.at(1), s.at(2), s.at(3), s.at(4)]} x={440} y={300} steps={[
            "Turn the question into clue words.",
            "Scan paragraph by paragraph.",
            "Find the evidence.",
            "Pick the answer that names the clue.",
          ]} />
        </>
      ),
    },

    {
      bg: "cloth",
      beats: [{ say: "Evidence found. Nothing gets past a Mega Reader.", sfx: "chime", sfxAt: 0.2 }],
      tail: 1.2,
      render: s => <LongTitleCard t={s.t} title="Evidence found" strap="Nothing gets past a Mega Reader." emblem="lens" size={160} />,
    },
  ],
};
