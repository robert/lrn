// Imagination Engine: saves each round's spoken ideas and asks Claude to split
// them into situation / problem / solution pairs, with a line of praise.
import express from "express";
import crypto from "node:crypto";
import { load, update } from "../store.js";
import { today } from "../dates.js";
import { markDone } from "../daily.js";
import { askForJson } from "../claude.js";

const router = express.Router();
const MODES = ["depth", "breadth"];

const makeDefault = () => ({ rounds: [], pairs: [] });
export const loadImagination = () => load("imagination", makeDefault);
const newId = () => crypto.randomUUID().slice(0, 8);

const SYSTEM = `You help run a speaking game for a bright, imaginative eight-year-old boy preparing for a school entrance exam.
He looks at a picture (or reads an opening sentence) and says story ideas out loud: a problem that could happen, and how it gets solved.
You receive the speech-recognition transcript of what he said. Your job:
1. Split it into separate ideas. Each idea is a situation (what is going on), a problem (what goes wrong) and a solution (how it gets fixed).
2. Keep HIS words. Only tidy obvious speech-recognition junk (repeated words, "um", misheard filler). Do not improve, extend or invent ideas.
   If he gives a problem but no solution, keep the idea and leave solution as an empty string. The situation can come from the picture if he didn't say one.
   Skip things that are not story ideas at all (e.g. "is it on?").
3. Write one or two short sentences of warm, specific praise that he can read himself, naming one idea you particularly liked. Never mention anything being wrong, missing or short.`;

const SCHEMA = promptIds => ({
  type: "object",
  additionalProperties: false,
  required: ["pairs", "praise"],
  properties: {
    pairs: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["promptId", "situation", "problem", "solution"],
        properties: {
          promptId: { type: "string", enum: promptIds },
          situation: { type: "string" },
          problem: { type: "string" },
          solution: { type: "string" },
        },
      },
    },
    praise: { type: "string" },
  },
});

// Describe each prompt and the words he said while it was on screen.
function transcriptText(round) {
  return round.prompts.map(p => {
    const said = round.segments.filter(s => s.promptId === p.id).map(s => s.text).join(" ");
    const shown = p.type === "opener" ? `Opening sentence: "${p.text}"` : `Picture: ${p.label}`;
    return `[promptId: ${p.id}] ${shown}\nWhat he said: ${said || "(nothing)"}`;
  }).join("\n\n");
}

async function analyse(roundId) {
  const round = loadImagination().rounds.find(r => r.id === roundId);
  if (!round) throw new Error(`No round ${roundId}`);

  let result;
  if (!round.segments.length) {
    // Nothing was said, so there is nothing to ask Claude about.
    result = { pairs: [], praise: "" };
  } else {
    try {
      result = await askForJson({
        system: SYSTEM,
        prompt: `Mode: ${round.mode === "depth" ? "one picture, as many ideas as possible" : "lots of pictures, one idea each"}\n\n${transcriptText(round)}`,
        schema: SCHEMA(round.prompts.map(p => p.id)),
      });
    } catch (err) {
      update("imagination", makeDefault, data => {
        const r = data.rounds.find(x => x.id === roundId);
        r.status = "pending";
        r.error = err.message;
      });
      throw err;
    }
  }

  return update("imagination", makeDefault, data => {
    const r = data.rounds.find(x => x.id === roundId);
    data.pairs = data.pairs.filter(p => p.roundId !== roundId); // a retry replaces old pairs
    const pairs = result.pairs.map(p => ({ id: newId(), date: r.date, roundId, ...p }));
    data.pairs.push(...pairs);
    r.status = "done";
    r.error = null;
    r.praise = result.praise;
    r.pairIds = pairs.map(p => p.id);
  });
}

// A round as the results screen needs it: with its pairs filled in.
function roundView(data, roundId) {
  const round = data.rounds.find(r => r.id === roundId);
  if (!round) throw new Error(`No round ${roundId}`);
  const pairs = (round.pairIds ?? []).map(id => data.pairs.find(p => p.id === id)).filter(Boolean);
  return { ...round, pairs };
}

// A round only counts towards today's challenge if he actually said something.
function todayDone(data) {
  const d = today();
  return Object.fromEntries(MODES.map(m => [m, data.rounds.some(r => r.date === d && r.mode === m && r.segments.length > 0)]));
}

router.get("/", (req, res) => {
  const data = loadImagination();
  res.json({ today: today(), done: todayDone(data), pairCount: data.pairs.length });
});

router.get("/pairs", (req, res) => res.json(loadImagination().pairs));

router.get("/round/:id", (req, res) => res.json(roundView(loadImagination(), req.params.id)));

// Save the raw round first, mark the daily challenge, then analyse.
// If analysis fails the round stays saved as pending, with the error.
router.post("/round", async (req, res) => {
  const { mode, prompts, segments } = req.body;
  if (!MODES.includes(mode)) throw new Error(`mode must be depth or breadth`);
  if (!Array.isArray(prompts) || !prompts.length || !Array.isArray(segments)) throw new Error("A round needs prompts and segments");
  const round = { id: newId(), date: today(), mode, prompts, segments, status: "pending", error: null, praise: null, pairIds: [] };
  const data = update("imagination", makeDefault, d => { d.rounds.push(round); });
  if (MODES.every(m => todayDone(data)[m])) markDone("imagination");

  try {
    res.json(roundView(await analyse(round.id), round.id));
  } catch (err) {
    console.error("Imagination analysis failed:", err.message);
    res.json(roundView(loadImagination(), round.id));
  }
});

router.post("/round/:id/retry", async (req, res) => {
  try {
    res.json(roundView(await analyse(req.params.id), req.params.id));
  } catch (err) {
    console.error("Imagination analysis failed:", err.message);
    res.json(roundView(loadImagination(), req.params.id));
  }
});

export default router;
