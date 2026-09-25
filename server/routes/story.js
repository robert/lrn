// Story Builder: hands out his own ideas to plan, saves finished plans and
// the "name every slot from memory" recall attempts.
import express from "express";
import crypto from "node:crypto";
import { load, update } from "../store.js";
import { today } from "../dates.js";
import { markDone } from "../daily.js";
import { PLAN_SLOTS, slotsNamedIn } from "../../shared/storyPlan.js";
import { loadImagination } from "./imagination.js";

const router = express.Router();
const PLANS_PER_DAY = 3;
const RECALL_AFTER_PLANS = 5;

const makeDefault = () => ({ plans: [], recalls: [] });
const loadStory = () => load("story", makeDefault);
const newId = () => crypto.randomUUID().slice(0, 8);

// Used only until he has saved some ideas in the Imagination Engine.
const STARTER_IDEAS = [
  { situation: "A school trip to the zoo", problem: "The class hamster escapes into the penguin enclosure", solution: "A boy uses his packed-lunch cheese to tempt it back out" },
  { situation: "A football match in the rain", problem: "The ball bursts just before the last penalty", solution: "The referee's dog brings a new ball from the car park" },
  { situation: "A train journey to Granny's house", problem: "The train stops in the middle of nowhere", solution: "Everyone helps the driver clear a fallen tree off the line" },
];

// His ideas that have a problem and a solution, ones not yet planned first.
function candidateIdeas(story) {
  const planned = new Set(story.plans.map(p => p.pairId));
  const pairs = loadImagination().pairs.filter(p => p.problem.trim() && p.solution.trim());
  const fresh = pairs.filter(p => !planned.has(p.id));
  const used = pairs.filter(p => planned.has(p.id));
  return [...shuffle(fresh), ...shuffle(used)];
}

const shuffle = list => list.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

router.get("/", (req, res) => {
  const story = loadStory();
  const d = today();
  const ideas = candidateIdeas(story);
  res.json({
    today: d,
    plansToday: story.plans.filter(p => p.date === d).length,
    plansPerDay: PLANS_PER_DAY,
    recallDue: story.plans.length >= RECALL_AFTER_PLANS && !story.recalls.some(r => r.date === d),
    // The next idea to plan: one of his own, or a starter if he has none yet.
    idea: ideas[0] ?? { ...STARTER_IDEAS[story.plans.length % STARTER_IDEAS.length], starter: true },
  });
});

router.post("/plan", (req, res) => {
  const { pairId, idea, slots } = req.body;
  if (!idea || !slots) throw new Error("A plan needs the idea and its slots");
  const missing = PLAN_SLOTS.filter(s => !slots[s.id]?.trim()).map(s => s.label);
  if (missing.length) throw new Error(`Plan is missing: ${missing.join(", ")}`);
  const d = today();
  const story = update("story", makeDefault, s => {
    s.plans.push({ id: newId(), date: d, pairId: pairId ?? null, idea, slots });
  });
  const plansToday = story.plans.filter(p => p.date === d).length;
  if (plansToday >= PLANS_PER_DAY) markDone("story");
  res.json({ plansToday });
});

// He names slots from memory; the server decides which he got.
router.post("/recall", (req, res) => {
  const { answers } = req.body;
  if (!Array.isArray(answers)) throw new Error("answers must be a list");
  const named = new Set(answers.flatMap(slotsNamedIn));
  const remembered = PLAN_SLOTS.filter(s => named.has(s.id)).map(s => s.id);
  const missed = PLAN_SLOTS.filter(s => !named.has(s.id)).map(s => s.id);
  update("story", makeDefault, s => { s.recalls.push({ id: newId(), date: today(), answers, remembered, missed }); });
  res.json({ remembered, missed });
});

export default router;
