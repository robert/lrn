// Builds content/chapter-XX.json from the book text, content/plan.json and
// the hand-written questions in content/questions/chapter-XX.json.
// Usage: node scripts/make-content.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadChapters } from "./split-chapters.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = f => JSON.parse(fs.readFileSync(f, "utf8"));
const pad = n => String(n).padStart(2, "0");

const book = loadChapters();
const plan = readJson(path.join(root, "content/plan.json"));

for (const chPlan of plan.chapters) {
  const ch = book[chPlan.num - 1];
  const qFile = path.join(root, `content/questions/chapter-${pad(chPlan.num)}.json`);
  const authored = fs.existsSync(qFile) ? readJson(qFile) : {};

  const nights = chPlan.nights.map(n => {
    if (n.done) return { id: n.id, done: true };
    const cut = new Set(n.cut || []);
    const paras = [];
    for (let i = n.from; i <= n.to; i++) if (!cut.has(i)) paras.push(ch.paras[i - 1]);
    const a = authored[n.id] || {};
    return { id: n.id, title: a.title || null, paras, questions: a.questions || [], hints: a.hints || [] };
  });

  const out = { chapter: chPlan.num, nights };
  fs.writeFileSync(path.join(root, `content/chapter-${pad(chPlan.num)}.json`), JSON.stringify(out, null, 2) + "\n");
  const written = nights.filter(n => n.questions?.length).length;
  console.log(`chapter-${pad(chPlan.num)}.json: ${nights.length} nights, ${written} with questions`);
}
