// The Mega News: a personalised bulletin written from his real progress,
// voiced on this computer with the same Kokoro voice as the films.
// GET /api/news -> { date, lines: [{ id, kind, text, seconds, figure? }], ticker }
import express from "express";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ROOT, load } from "../store.js";
import { today } from "../dates.js";
import { GAMES, isDone, gameStreak, megaWeek } from "../daily.js";
import { readerStreak } from "./reader.js";

const run = promisify(execFile);
const router = express.Router();
const AUDIO = path.join(ROOT, "videos/public/audio/news");
const PYTHON = path.join(ROOT, "videos/tts/.venv/bin/python");
const SPEAK = path.join(ROOT, "videos/tts/speak.py");
const ANIMALS = ["mole", "rabbit", "cat", "horse", "owl", "hawk", "eagle"];
const NAMES = { reader: "the Mega Reader Challenge", imagination: "the Imagination Engine", story: "Story Builder", spotter: "Nothing Gets Past" };

// A puzzle of the day, chosen by date so it changes each day.
const PUZZLES = [
  { q: "Which is the odd one out? A triangle, a square, a pentagon, and a circle.", a: "The answer is the circle, because it's the only one with no straight sides." },
  { q: "If K means black and L means white, what's the code for a white shape?", a: "The answer is L, because L means white." },
  { q: "An arrow points up, then right, then down. Where does it point next?", a: "The answer is left, because the arrow turns a quarter of the way round, clockwise, each time." },
  { q: "Two words have swapped places in this sentence. The soup drank the girl. Which two words are they?", a: "The answer is soup and girl. It should say, the girl drank the soup." },
  { q: "Two cats weigh the same as one dog. How many cats weigh the same as three dogs?", a: "The answer is six cats, because each dog weighs the same as two cats." },
  { q: "A flag is turned upside down. Is it flipped, or rotated?", a: "The answer is rotated, because it has only been turned round. Flipped would mean a mirror image." },
];

function dayNumber(date) {
  return Math.floor(new Date(`${date}T12:00:00`).getTime() / 86400000);
}

// Write the bulletin from the data: headline first, then the other stories.
function writeScript() {
  const date = today();
  const weekday = new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long" });
  const nightStreak = readerStreak();
  const week = megaWeek();
  const lit = week.days.filter(d => d.lit).length;
  const done = GAMES.filter(g => isDone(g));
  const spotter = load("spotter", () => ({ rungs: 0, level: 1 }));
  const imagination = load("imagination", () => ({ pairs: [] }));
  const puzzle = PUZZLES[dayNumber(date) % PUZZLES.length];

  const lines = [
    { kind: "open", text: `Good evening, and welcome to the Mega News, on ${weekday}. Here are tonight's headlines.` },
    nightStreak > 0
      ? { kind: "headline", figure: nightStreak, text: `Breaking news. Our reporter has now read for ${nightStreak} ${nightStreak === 1 ? "night" : "nights in a row"}. Experts say this is extremely mega.` }
      : { kind: "headline", figure: 0, text: "Breaking news. A brand new reading streak is about to begin. Our reporters are standing by." },
    done.length === GAMES.length
      ? { kind: "story", figure: 4, text: "In other news, all four games have been completed today. That lights another seal in this week's Mega Streak." }
      : done.length > 0
        ? { kind: "story", figure: done.length, text: `Today, ${done.map(g => NAMES[g]).join(" and ")} ${done.length === 1 ? "has" : "have"} already been done. ${GAMES.length - done.length === 1 ? "Just one more game" : `${GAMES.length - done.length} more games`} to light today's seal.` }
        : { kind: "story", figure: 0, text: "None of today's four games has been played yet. Which one will be first?" },
    { kind: "story", figure: lit, text: lit > 0 ? `This week's Mega Streak stands at ${lit} ${lit === 1 ? "seal" : "seals"}. Seven seals win a reward.` : "This week's Mega Streak is waiting for its first seal. Seven seals win a reward." },
    { kind: "story", figure: imagination.pairs.length, text: imagination.pairs.length > 0 ? `Over at the Imagination Engine, ${imagination.pairs.length} story ideas are safely stored.` : "The Imagination Engine is ready for its first story ideas." },
    { kind: "weather", figure: ANIMALS[Math.min(6, spotter.rungs ?? 0)], text: `And now the weather. Tomorrow will be clear, so it will be easy to see things. Our spotter is currently a ${ANIMALS[Math.min(6, spotter.rungs ?? 0)]}, and we expect even sharper eyes soon.` },
    { kind: "puzzle", text: `Time for the puzzle of the day. ${puzzle.q}` },
    { kind: "answer", text: puzzle.a },
    { kind: "close", text: "That's all from the Mega News. Remember that nothing gets past you. Goodnight." },
  ];
  const ticker = [
    `READING STREAK: ${nightStreak}`,
    `MEGA SEALS THIS WEEK: ${lit} OF 7`,
    ...GAMES.map(g => `${NAMES[g].toUpperCase()}: ${isDone(g) ? "DONE TODAY" : "WAITING"} (${g === "reader" ? nightStreak : gameStreak(g)} DAY STREAK)`),
    `SPOTTER: ${ANIMALS[Math.min(6, spotter.rungs ?? 0)].toUpperCase()}`,
  ];
  return { date, lines, ticker };
}

// Voice any lines we haven't spoken before (cached by their words).
async function voice(lines) {
  fs.mkdirSync(AUDIO, { recursive: true });
  const withIds = lines.map(l => ({ ...l, id: crypto.createHash("sha1").update(l.text).digest("hex").slice(0, 12) }));
  const missing = withIds.filter(l => !fs.existsSync(path.join(AUDIO, `${l.id}.wav`)));
  if (missing.length) {
    const file = path.join(AUDIO, "lines.json");
    fs.writeFileSync(file, JSON.stringify(missing.map(l => ({ id: l.id, text: l.text }))));
    await run(PYTHON, [SPEAK, file, AUDIO, "bm_daniel", "0.95"], { timeout: 300000 });
  }
  const manifest = JSON.parse(fs.readFileSync(path.join(AUDIO, "durations.json"), "utf8"));
  return withIds.map(l => {
    if (!manifest[l.id]) throw new Error(`No voice for line ${l.id}`);
    return { ...l, seconds: manifest[l.id].seconds };
  });
}

router.get("/", async (req, res, next) => {
  try {
    const { date, lines, ticker } = writeScript();
    res.json({ date, ticker, lines: await voice(lines) });
  } catch (err) { next(err); }
});

export default router;
