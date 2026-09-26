// Renders one still near the end of every beat, for reviewing a video
// without watching it. Usage: node scripts/stills.js codes [outDir]
// Writes <outDir>/<id>-s<scene>b<beat>.png (default outDir: out/stills).
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { buildTimeline } from "../src/lib/timeline.js";
import { loadScript } from "./load-script.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const [id, outDir = path.join(ROOT, "out/stills")] = process.argv.slice(2);
if (!id) throw new Error("Usage: node scripts/stills.js <video id> [outDir]");
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src/index.jsx") });
const composition = await selectComposition({ serveUrl, id, timeoutInMilliseconds: 240000 });
const script = await loadScript(id);
if (!script.scenes) {
  // A music video: a still every three seconds.
  for (let frame = 45, n = 0; frame < composition.durationInFrames; frame += 90, n++) {
    const output = path.join(outDir, `${id}-${String(n).padStart(3, "0")}.png`);
    await renderStill({ composition, serveUrl, output, frame, scale: 0.5, timeoutInMilliseconds: 240000 });
    console.log(output);
  }
  process.exit(0);
}
const durations = JSON.parse(fs.readFileSync(path.join(ROOT, "src/generated/durations", `${id}.json`), "utf8"));
const { scenes } = buildTimeline(script, durations);
for (const scene of scenes) {
  for (const b of scene.beats) {
    const frame = Math.min(composition.durationInFrames - 1, b.start + Math.round(b.length * 0.85));
    const output = path.join(outDir, `${id}-${b.id}.png`);
    await renderStill({ composition, serveUrl, output, frame, scale: 0.5, timeoutInMilliseconds: 240000 });
    console.log(output);
  }
}
