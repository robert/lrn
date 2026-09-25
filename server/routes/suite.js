// Home screen state, weekly rewards, parent settings and the pictures folder.
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "../store.js";
import { today } from "../dates.js";
import { GAMES, isDone, gameStreak, megaWeek } from "../daily.js";
import { getSettings, updateSettings } from "../settings.js";
import { readerStreak } from "./reader.js";
import { FILMS } from "../../shared/videos.js";

const router = express.Router();
const PICTURES = path.join(ROOT, "pictures");
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;

router.get("/home", (req, res) => {
  const settings = getSettings();
  const week = megaWeek();
  const games = Object.fromEntries(GAMES.map(g => [g, {
    done: isDone(g),
    streak: g === "reader" ? readerStreak() : gameStreak(g),
  }]));
  res.json({
    today: today(),
    games,
    week,
    rewardDue: week.complete && !settings.claimedWeeks[week.weekStart],
    rewards: settings.rewards,
  });
});

router.post("/reward", (req, res) => {
  const { weekStart, reward } = req.body;
  if (!weekStart || !reward) throw new Error("weekStart and reward are required");
  updateSettings(s => { s.claimedWeeks[weekStart] = { reward, date: today() }; });
  res.json({ ok: true });
});

router.get("/settings", (req, res) => res.json(getSettings()));

router.post("/settings/rewards", (req, res) => {
  const rewards = req.body.rewards;
  if (!Array.isArray(rewards) || !rewards.every(r => typeof r === "string")) throw new Error("rewards must be a list of strings");
  updateSettings(s => { s.rewards = rewards.map(r => r.trim()).filter(Boolean); });
  res.json(getSettings());
});

// Reset one streak (a game name or "mega") so it starts counting from today.
router.post("/settings/reset", (req, res) => {
  const { which } = req.body;
  if (![...GAMES, "mega"].includes(which)) throw new Error(`Unknown streak ${which}`);
  updateSettings(s => { s.resets[which] = today(); });
  res.json(getSettings());
});

router.get("/pictures", (req, res) => {
  const pictures = fs.readdirSync(PICTURES).filter(f => IMAGE_EXT.test(f)).sort()
    .map(f => ({ id: f, url: `/pictures/${encodeURIComponent(f)}`, label: path.parse(f).name.replace(/[-_]/g, " ") }));
  const openersFile = path.join(PICTURES, "openers.txt");
  const openers = fs.existsSync(openersFile)
    ? fs.readFileSync(openersFile, "utf8").split("\n").map(l => l.trim()).filter(Boolean)
    : [];
  res.json({ pictures, openers });
});

router.post("/pictures", (req, res) => {
  const { name, dataUrl } = req.body;
  const m = /^data:image\/[\w+.-]+;base64,(.+)$/.exec(dataUrl ?? "");
  if (!m) throw new Error("Expected an image data URL");
  const safe = path.basename(name ?? "").replace(/[^\w.\- ]/g, "_");
  if (!IMAGE_EXT.test(safe)) throw new Error("Picture must be png, jpg, gif, webp or svg");
  fs.writeFileSync(path.join(PICTURES, safe), Buffer.from(m[1], "base64"));
  res.json({ ok: true, id: safe });
});

// The explainer films, with whether each one has been rendered yet.
router.get("/videos", (req, res) => {
  res.json(FILMS.map(f => ({ ...f, ready: fs.existsSync(path.join(ROOT, "public-videos", `${f.id}.mp4`)) })));
});

export default router;
