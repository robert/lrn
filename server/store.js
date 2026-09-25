// Tiny JSON-file storage. Each "file" lives in data/<name>.json.
// Writes go to a temp file first so a crash never leaves half a file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data");
fs.mkdirSync(DATA, { recursive: true });

export function load(name, makeDefault) {
  const file = path.join(DATA, `${name}.json`);
  if (!fs.existsSync(file)) {
    const initial = makeDefault();
    save(name, initial);
    return initial;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function save(name, value) {
  const file = path.join(DATA, `${name}.json`);
  fs.writeFileSync(file + ".tmp", JSON.stringify(value, null, 2) + "\n");
  fs.renameSync(file + ".tmp", file);
}

// Load, change, save in one go. fn may mutate the value or return a new one.
export function update(name, makeDefault, fn) {
  const value = load(name, makeDefault);
  const result = fn(value);
  const next = result === undefined ? value : result;
  save(name, next);
  return next;
}
