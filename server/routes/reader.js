// Mega Reader Challenge: serves the chapter content and saves nights played.
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { ROOT, load, update } from "../store.js";
import { today, addDays } from "../dates.js";
import { markDone } from "../daily.js";
import { getSettings } from "../settings.js";

const router = express.Router();

// progress.json on first run: the 11 nights played in the prototype.
const SEEDED = ["ch1n1", "ch1n2", "ch1n3", "ch1n4", "ch1n5", "ch1n6", "ch2n1", "ch2n2", "ch2n3", "ch3n1", "ch3n2"];
// Each seeded night also counts as a reader day in the daily record.
function seedProgress() {
  const nights = Object.fromEntries(SEEDED.map((id, i) => [id, {
    date: addDays("2026-09-15", i), score: 20, firstTry: 7, total: 10, results: [], seeded: true,
  }]));
  for (const n of Object.values(nights)) markDone("reader", n.date);
  return { nights };
}
const loadProgress = () => load("progress", seedProgress);

function loadChapters() {
  const dir = path.join(ROOT, "content");
  return fs.readdirSync(dir).filter(f => /^chapter-\d+\.json$/.test(f)).sort()
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")));
}

// Nights completed on consecutive calendar days. Two nights in one evening
// count as two; a day with no night breaks the streak.
export function readerStreak() {
  const perDay = {};
  for (const n of Object.values(loadProgress().nights)) perDay[n.date] = (perDay[n.date] ?? 0) + 1;
  const reset = getSettings().resets.reader;
  let day = today();
  if (!perDay[day]) day = addDays(day, -1);
  let streak = 0;
  while (perDay[day] && (!reset || day >= reset)) {
    streak += perDay[day];
    day = addDays(day, -1);
  }
  return streak;
}

router.get("/", (req, res) => {
  res.json({ chapters: loadChapters(), progress: loadProgress(), streak: readerStreak(), today: today() });
});

router.post("/night", (req, res) => {
  const { id, score, firstTry, total, results, ideas } = req.body;
  if (!id || typeof score !== "number" || typeof firstTry !== "number" || !Array.isArray(results)) {
    throw new Error("Night result needs id, score, firstTry and results");
  }
  update("progress", seedProgress, p => {
    p.nights[id] = { date: today(), score, firstTry, total, results, ideas };
  });
  markDone("reader");
  res.json({ streak: readerStreak() });
});

export default router;
