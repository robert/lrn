// "Are you the kid that nothing gets past?": the animal ladder and progress.
// Stored in data/spotter.json.
import express from "express";
import { load, update } from "../store.js";
import { today } from "../dates.js";
import { markDone, isDone } from "../daily.js";

const router = express.Router();
const RUNGS = 7; // mole, rabbit, cat, horse, owl, hawk, eagle
const FORMATS = ["analogies", "odd", "similar", "codes", "sequences", "grids"];

const makeDefault = () => ({
  introSeen: false,
  level: 1,
  rungs: 0,            // animals earned in the current level (0 to 7)
  daysCompleted: 0,    // all levels together
  dayDates: [],
  spotDone: 0,         // Spot the Change rounds finished, sets the difficulty
  metFormats: [],      // question types he has been introduced to, in order
  history: {},         // date -> { caught, missed }
});
const loadState = () => load("spotter", makeDefault);
const change = fn => update("spotter", makeDefault, fn);

function view(state) {
  return { ...state, today: today(), doneToday: isDone("spotter"), flashcards: state.daysCompleted >= 7 };
}

router.get("/", (req, res) => res.json(view(loadState())));

router.post("/intro", (req, res) => {
  res.json(view(change(s => { s.introSeen = true; })));
});

router.post("/format", (req, res) => {
  const { format } = req.body;
  if (!FORMATS.includes(format)) throw new Error(`Unknown question type ${format}`);
  res.json(view(change(s => { if (!s.metFormats.includes(format)) s.metFormats.push(format); })));
});

// Free practice still counts towards Spot the Change difficulty.
router.post("/practice", (req, res) => {
  const spot = Number(req.body.spot ?? 0);
  if (!Number.isInteger(spot) || spot < 0) throw new Error("spot must be a whole number");
  res.json(view(change(s => { s.spotDone += spot; })));
});

// The daily challenge is finished: climb one rung, whatever the score.
router.post("/day", (req, res) => {
  const { spot, caught, missed } = req.body;
  if (![spot, caught, missed].every(n => Number.isInteger(n) && n >= 0)) throw new Error("spot, caught and missed must be whole numbers");
  const date = today();
  let promotion = null;
  const state = change(s => {
    s.spotDone += spot;
    s.history[date] = { caught, missed };
    if (s.dayDates.includes(date)) return; // a second go on the same day doesn't climb
    s.dayDates.push(date);
    s.daysCompleted += 1;
    if (s.rungs === RUNGS) { s.level += 1; s.rungs = 0; }
    s.rungs += 1;
    promotion = { animal: s.rungs - 1, level: s.level, levelComplete: s.rungs === RUNGS };
  });
  markDone("spotter");
  res.json({ ...view(state), promotion });
});

export default router;
