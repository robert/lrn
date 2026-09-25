// Splits the Gutenberg text into chapters and paragraphs, then proposes
// night boundaries of roughly 1,100 to 1,500 words at paragraph breaks.
// Usage: node scripts/split-chapters.js [firstChapter]
const fs = require("fs");
const path = require("path");

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const SKIP = new Set(["VII"]);
// Aim for 1,100 to 1,500; the validator allows 1,000 to 1,600 when paragraphs force it.
const MIN = 1000, MAX = 1600, TARGET = 1300;

function loadChapters() {
  const raw = fs.readFileSync(path.join(__dirname, "../source/wind-in-the-willows.txt"), "utf8");
  const body = raw.split("*** END OF THE PROJECT GUTENBERG")[0];
  const lines = body.split(/\r?\n/);
  const starts = [];
  lines.forEach((l, i) => { if (ROMAN.includes(l.replace(/\.$/, "")) && l.endsWith(".")) starts.push(i); });
  if (starts.length !== 12) throw new Error(`Expected 12 chapter headings, found ${starts.length}`);
  return starts.map((s, n) => {
    const end = n + 1 < starts.length ? starts[n + 1] : lines.length;
    const title = lines[s + 1].trim();
    const rawParas = lines.slice(s + 2, end).join("\n").split(/\n[ \t]*\n/).filter(p => p.trim());
    const paras = rawParas.map(p => p.replace(/\s*\n\s*/g, " ").trim());
    // Indented paragraphs are verse stanzas: never start a night on one.
    const verse = rawParas.map(p => /(^|\n)[ \t]+\S/.test(p));
    return { num: n + 1, roman: ROMAN[n], title, paras, verse };
  });
}

const words = p => p.split(/\s+/).filter(Boolean).length;

// Dynamic programme: choose breaks so every night is within MIN..MAX and
// total squared distance from TARGET is smallest.
function split(paras, verse) {
  const w = paras.map(words);
  const n = w.length;
  const best = Array(n + 1).fill(Infinity), prev = Array(n + 1).fill(-1);
  best[0] = 0;
  for (let j = 1; j <= n; j++) {
    let sum = 0;
    for (let i = j - 1; i >= 0; i--) {
      sum += w[i];
      if (sum > MAX) break;
      if (sum < MIN && !(i === 0 && j === n)) continue;
      if (verse[i] || (j < n && verse[j])) continue;
      const cost = best[i] + (sum - TARGET) ** 2;
      if (cost < best[j]) { best[j] = cost; prev[j] = i; }
    }
  }
  if (best[n] === Infinity) throw new Error("No valid split");
  const nights = [];
  for (let j = n; j > 0; j = prev[j]) nights.unshift([prev[j], j]);
  return nights.map(([a, b]) => ({ from: a, to: b, words: w.slice(a, b).reduce((x, y) => x + y, 0) }));
}

module.exports = { loadChapters, split, words, SKIP };

if (require.main === module) {
  const first = Number(process.argv[2] || 4);
  let total = 0;
  for (const ch of loadChapters()) {
    if (ch.num < first || SKIP.has(ch.roman)) continue;
    const nights = split(ch.paras, ch.verse);
    total += nights.length;
    console.log(`\nChapter ${ch.roman} ${ch.title}: ${ch.paras.length} paras, ${ch.paras.map(words).reduce((a, b) => a + b)} words, ${nights.length} nights`);
    nights.forEach((nt, k) => {
      console.log(`  night ${k + 1}: paras ${nt.from + 1}-${nt.to}, ${nt.words} words`);
      console.log(`     starts: ${ch.paras[nt.from].slice(0, 70)}`);
      console.log(`     ends:   ...${ch.paras[nt.to - 1].slice(-90)}`);
    });
  }
  console.log(`\nTotal nights: ${total}`);
}
