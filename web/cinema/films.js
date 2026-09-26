// The play-along films (videos/src/play/*.jsx) and their narration timings
// (written by videos/scripts/voice.js).
import { buildTimeline } from "../../videos/src/lib/timeline.js";

const scripts = import.meta.glob("../../videos/src/play/*.jsx", { eager: true, import: "default" });
const durations = import.meta.glob("../../videos/src/generated/durations/*.json", { eager: true, import: "default" });

export const PLAY_FILMS = Object.values(scripts).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));

export function filmById(id) {
  const film = PLAY_FILMS.find(f => f.id === id);
  if (!film) throw new Error(`No play-along film called ${id}`);
  return film;
}

const cache = new Map();
export function timelineFor(film) {
  if (!cache.has(film.id)) {
    const d = durations[`../../videos/src/generated/durations/${film.id}.json`];
    if (!d) throw new Error(`${film.id} hasn't been voiced yet: run node scripts/voice.js ${film.id} in videos/`);
    cache.set(film.id, buildTimeline(film, d));
  }
  return cache.get(film.id);
}

export const sceneIndex = (film, id) => {
  const i = film.scenes.findIndex(s => s.id === id);
  if (i < 0) throw new Error(`${film.id} has no scene "${id}"`);
  return i;
};
