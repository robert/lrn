// Records which games' daily challenges are done on each date, and works out
// per-game streaks and the Mega Streak week.
import { load, update } from "./store.js";
import { today, dayStreak, weekStart, weekDates } from "./dates.js";
import { getSettings } from "./settings.js";

export const GAMES = ["reader", "imagination", "story", "spotter"];

const loadDaily = () => load("daily", () => ({}));

export function markDone(game, date = today()) {
  if (!GAMES.includes(game)) throw new Error(`Unknown game ${game}`);
  update("daily", () => ({}), daily => {
    daily[date] = { ...daily[date], [game]: true };
  });
}

export function isDone(game, date = today()) {
  return Boolean(loadDaily()[date]?.[game]);
}

export function gameStreak(game) {
  const daily = loadDaily();
  return dayStreak(d => Boolean(daily[d]?.[game]), getSettings().resets[game]);
}

// A Mega day is one where all four games were completed.
export function megaWeek() {
  const daily = loadDaily();
  const reset = getSettings().resets.mega;
  const start = weekStart(today());
  const days = weekDates(start).map(date => ({
    date,
    lit: GAMES.every(g => daily[date]?.[g]) && (!reset || date >= reset),
    isToday: date === today(),
  }));
  return { weekStart: start, days, complete: days.every(d => d.lit) };
}
