// Parent settings: the rewards list, streak resets and claimed weekly rewards.
import { load, update } from "./store.js";

const DEFAULT_REWARDS = [
  "A new book",
  "A cool stapler",
  "An ice cream sundae",
  "A Franco Manca pizza night",
  "Two small treats of your choice",
  "Anything you want (within reason)",
];

const makeDefault = () => ({
  rewards: DEFAULT_REWARDS,
  // Date (YYYY-MM-DD) from which each streak starts counting again.
  resets: { reader: null, imagination: null, story: null, spotter: null, mega: null },
  // weekStart -> { reward, date }
  claimedWeeks: {},
});

export const getSettings = () => load("settings", makeDefault);
export const updateSettings = fn => update("settings", makeDefault, fn);
