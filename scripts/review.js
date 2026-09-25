// Writes a readable Markdown copy of a chapter's questions for a parent to check.
// Usage: node scripts/review.js 4   (writes content/review/chapter-04.md)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { wordCount } from "../shared/text.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const num = process.argv[2];
if (!num) throw new Error("Usage: node scripts/review.js <chapter number>");
const pad = String(num).padStart(2, "0");
const ch = JSON.parse(fs.readFileSync(path.join(root, `content/chapter-${pad}.json`), "utf8"));

const out = [`# Chapter ${num} questions`, ""];
for (const night of ch.nights.filter(n => !n.done)) {
  const first = night.paras[0].replace(/_/g, "").slice(0, 60);
  const last = night.paras.at(-1).replace(/_/g, "").slice(-60);
  out.push(`## ${night.id}: ${night.title}`, "",
    `${wordCount(night.paras)} words, ${night.paras.length} paragraphs. Starts "${first}..." Ends "...${last}"`, "");
  night.questions.forEach((q, i) => {
    out.push(`**Q${i + 1}** (${q.type}, para ${q.para}) ${q.q}`, "");
    for (const o of q.options) out.push(`- ${o.correct ? "✅" : `❌ _${o.flaw}_`} ${o.text}  \n  ${o.why}`);
    out.push("");
  });
  out.push("**Prediction hints**", "", ...night.hints.map((h, i) => `${i + 1}. ${h}`), "");
}
fs.mkdirSync(path.join(root, "content/review"), { recursive: true });
const file = path.join(root, `content/review/chapter-${pad}.md`);
fs.writeFileSync(file, out.join("\n"));
console.log(`Wrote ${path.relative(root, file)}`);
