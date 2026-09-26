// Turns a video script plus narration lengths into frame timings.
//
// A script is { id, title, cloth, scenes: [{ beats: [{ say, voice?, hold?, sfx?, sfxAt? }], render, bg? }] }.
// Each beat lasts as long as its narration, plus a small breath, plus any `hold`.
import { FPS, sec } from "./timelineConst.js";

export const beatId = (si, bi) => `s${si}b${bi}`;

export const BREATH = 1.2; // seconds of quiet after each line, time to think
const SCENE_LEAD = 0.35; // seconds before the first line of a scene

// `durations` is this video's { beatId: seconds } from scripts/voice.js.
export function buildTimeline(script, durations = {}) {
  const known = durations;
  let frame = 0;
  let voiced = true;
  const scenes = script.scenes.map((scene, si) => {
    const start = frame;
    frame += sec(SCENE_LEAD);
    const beats = scene.beats.map((beat, bi) => {
      const id = beatId(si, bi);
      let seconds = known[id];
      if (seconds === undefined) {
        // Not voiced yet: estimate so the studio preview still works.
        voiced = false;
        seconds = (beat.voice ?? beat.say).split(/\s+/).length / 2.6;
      }
      const b = {
        ...beat, id, start: frame,
        speech: sec(seconds),
        length: sec(seconds + BREATH + (beat.hold ?? 0)),
      };
      frame += b.length;
      return b;
    });
    frame += sec(scene.tail ?? 0.3);
    return { ...scene, index: si, start, length: frame - start, beats };
  });
  return { scenes, total: frame, voiced };
}

// Split a line into subtitle chunks of at most ~11 words, breaking at
// sentence ends and commas first, each timed by its share of the letters.
export function subtitleChunks(text, speechFrames) {
  const sentences = text.match(/[^.!?]+[.!?]*["”’]?\s*/g) ?? [text];
  const chunks = [];
  for (const s of sentences) {
    const words = s.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 12) { chunks.push(words); continue; }
    // Long sentence: break at a comma near the middle, or evenly.
    const parts = Math.ceil(words.length / 11);
    const size = Math.ceil(words.length / parts);
    for (let i = 0; i < words.length; i += size) chunks.push(words.slice(i, i + size));
  }
  const letters = chunks.map(c => c.join(" ").length);
  const total = letters.reduce((a, b) => a + b, 0);
  let at = 0;
  return chunks.map((words, i) => {
    const length = Math.round((letters[i] / total) * speechFrames);
    const chunk = { words, start: at, length };
    at += length;
    return chunk;
  });
}
