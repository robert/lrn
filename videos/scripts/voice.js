// Voices the narration for one or more videos with the Kokoro neural voice.
// Usage: node scripts/voice.js codes [odd-one-out ...]   (all videos if none given)
//
// Each script is loaded with its drawing code swapped for empty stand-ins,
// so only the words are read. Audio goes to public/audio/<id>/ and the line
// lengths to src/generated/durations/<id>.json.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { loadScript, narration, ROOT } from "./load-script.js";

const VOICE = process.env.VOICE ?? "bf_emma";
const SPEED = process.env.SPEED ?? "0.92";

const ids = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(path.join(ROOT, "src/videos")).filter(f => f.endsWith(".jsx")).map(f => f.replace(/\.jsx$/, ""));


for (const id of ids) {
  const lines = narration(await loadScript(id));
  const dir = path.join(ROOT, "public/audio", id);
  const linesFile = path.join(ROOT, "node_modules/.cache/voice", `${id}.lines.json`);
  fs.writeFileSync(linesFile, JSON.stringify(lines));
  execFileSync(path.join(ROOT, "tts/.venv/bin/python"), [path.join(ROOT, "tts/speak.py"), linesFile, dir, VOICE, SPEED], { stdio: "inherit" });
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "durations.json"), "utf8"));
  const seconds = Object.fromEntries(lines.map(l => [l.id, manifest[l.id].seconds]));
  fs.writeFileSync(path.join(ROOT, "src/generated/durations", `${id}.json`), JSON.stringify(seconds, null, 2) + "\n");
  console.log(`${id}: ${lines.length} lines, ${Object.values(seconds).reduce((a, b) => a + b, 0).toFixed(1)}s of speech`);
}
