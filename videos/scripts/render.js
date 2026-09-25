// Voices and renders videos to out/<id>.mp4, then copies them into the app.
// Usage: node scripts/render.js codes [more ids]   (all if none given)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP_VIDEOS = path.join(ROOT, "..", "public-videos");
const ids = process.argv.slice(2).length ? process.argv.slice(2)
  : fs.readdirSync(path.join(ROOT, "src/videos")).filter(f => f.endsWith(".jsx")).map(f => f.replace(/\.jsx$/, ""));

execFileSync("node", [path.join(ROOT, "scripts/voice.js"), ...ids], { stdio: "inherit", cwd: ROOT });
fs.mkdirSync(APP_VIDEOS, { recursive: true });
for (const id of ids) {
  const out = path.join(ROOT, "out", `${id}.mp4`);
  execFileSync("npx", ["remotion", "render", "src/index.jsx", id, out, "--crf=20", "--concurrency=4", "--timeout=240000"], { stdio: "inherit", cwd: ROOT });
  fs.copyFileSync(out, path.join(APP_VIDEOS, `${id}.mp4`));
  console.log(`Copied to public-videos/${id}.mp4`);
}
