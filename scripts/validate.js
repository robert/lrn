// Checks every written night in content/chapter-XX.json against the
// question-writing rules. Exits with an error if anything is broken.
// Usage: node scripts/validate.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { locate, quoteIn, wordCount } from "../shared/text.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "content");

const ENDING = "Where does tonight's bit of the story end, and how is ";
const TYPES = ["quoted", "search", "across", "character", "ending"];
const WRONG_FLAWS = ["literal", "evidence"];
const SHORT_FLAWS = ["fragment", "short"];

const errors = [];
const unwritten = [];

// Authored text must not contain dashes; story quotes in *asterisks* may.
const authored = s => s.replace(/\*[^*]*\*/g, "");
const hasDash = s => /[—–]/.test(authored(s));
const words = s => s.trim().split(/\s+/).length;

function checkNight(night) {
  const err = msg => errors.push(`${night.id}: ${msg}`);
  const n = night.paras.length;

  const wc = wordCount(night.paras);
  if (wc < 1000 || wc > 1600) err(`passage is ${wc} words (want 1,000 to 1,600)`);

  if (!night.questions.length) { unwritten.push(night.id); return; }

  if (!night.title) err("missing title");
  else if (hasDash(night.title)) err("dash in title");

  if (night.questions.length !== 10) err(`has ${night.questions.length} questions, not 10`);

  let quoted = 0, unquoted = 0, character = 0, fragments = 0;
  night.questions.forEach((q, qi) => {
    const qerr = msg => err(`Q${qi + 1}: ${msg}`);
    if (!TYPES.includes(q.type)) qerr(`unknown type "${q.type}"`);
    if (!Number.isInteger(q.para) || q.para < 1 || q.para > n) qerr(`para ${q.para} out of range 1..${n}`);
    if (hasDash(q.q)) qerr("dash in question");
    if (/paragraph/i.test(q.q)) qerr("question mentions a paragraph number");

    const quote = quoteIn(q.q);
    if (quote) {
      quoted++;
      if (q.type !== "quoted") qerr(`type ${q.type} must not quote with *asterisks*`);
      if (q.para >= 1 && q.para <= n && !locate(night.paras[q.para - 1], quote)) qerr(`quote not found in para ${q.para}: "${quote}"`);
    } else {
      if (q.type === "quoted") qerr("quoted question has no *quote*");
      if (q.type === "search" || q.type === "across") unquoted++;
    }
    if (q.type === "character") character++;

    const isLast = qi === night.questions.length - 1;
    if (isLast !== (q.type === "ending")) qerr("the ending question must be last, and only last");
    if (q.type === "ending" && !q.q.startsWith(ENDING)) qerr(`ending question must start "${ENDING}"`);

    const opts = q.options || [];
    if (opts.length !== 4) qerr(`${opts.length} options, not 4`);
    const correct = opts.filter(o => o.correct);
    if (correct.length !== 1) { qerr(`${correct.length} correct options, not 1`); return; }

    for (const o of opts) {
      if (hasDash(o.text) || hasDash(o.why)) qerr(`dash in option "${o.text}"`);
      if (o.correct) {
        if (o.flaw) qerr("correct option has a flaw");
        if (!o.why.startsWith("Clue: ")) qerr(`correct why must start "Clue: "`);
      } else if (WRONG_FLAWS.includes(o.flaw)) {
        if (!o.why.startsWith("Clue check: ")) qerr(`why for "${o.text}" must start "Clue check: "`);
      } else if (SHORT_FLAWS.includes(o.flaw)) {
        if (!/full sentence/.test(o.why)) qerr(`why for short "${o.text}" must ask for a full sentence`);
        if (o.flaw === "short" && !o.why.includes("Clue check: ")) qerr(`why for short "${o.text}" must include a Clue check`);
        if (words(o.text) < 2 || words(o.text) > 4) qerr(`short option "${o.text}" should be 2 to 4 words`);
      } else qerr(`option "${o.text}" has unknown flaw "${o.flaw}"`);
    }

    const shorts = opts.filter(o => SHORT_FLAWS.includes(o.flaw));
    if (q.type === "character") {
      if (shorts.length) qerr("character options must all be full sentences");
    } else {
      if (shorts.length !== 1) qerr(`${shorts.length} short options, not 1`);
      if (shorts[0]?.flaw === "fragment") fragments++;
    }

    const full = opts.filter(o => !SHORT_FLAWS.includes(o.flaw));
    const lens = full.map(o => o.text.length);
    const longestOther = Math.max(...opts.filter(o => !o.correct).map(o => o.text.length));
    if (correct[0].text.length >= longestOther) qerr(`correct answer is the longest (${correct[0].text.length} chars)`);
    if (Math.max(...lens) - Math.min(...lens) > 25) qerr(`full sentences vary by ${Math.max(...lens) - Math.min(...lens)} chars (max 25): ${lens.join(", ")}`);
  });

  if (quoted > 4) err(`${quoted} quoted questions (max 4)`);
  if (unquoted < 3) err(`${unquoted} search/across questions (min 3)`);
  if (character !== 1) err(`${character} character questions (want 1)`);
  if (fragments < 3 || fragments > 6) err(`${fragments} of 9 short options are right-idea fragments (want roughly half: 3 to 6)`);

  if (night.hints.length !== 4) err(`${night.hints.length} hints, not 4`);
  night.hints.forEach((h, i) => {
    if (!/\b(so|but|until)\b/i.test(h)) err(`hint ${i + 1} has no "so", "but" or "until": ${h}`);
    if (hasDash(h)) err(`dash in hint ${i + 1}`);
  });
}

const files = fs.readdirSync(contentDir).filter(f => /^chapter-\d+\.json$/.test(f)).sort();
for (const f of files) {
  const ch = JSON.parse(fs.readFileSync(path.join(contentDir, f), "utf8"));
  for (const night of ch.nights) if (!night.done) checkNight(night);
}

if (unwritten.length) console.log(`Questions still to write: ${unwritten.join(", ")}`);
if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log("All written nights pass.");
