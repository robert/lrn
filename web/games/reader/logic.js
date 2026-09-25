// Pure helpers for the Mega Reader Challenge: ladder, record, next night, shuffling.

export const RUNGS = [
  "Sharp Reader", "Word Cracker", "Clue Finder", "Secret Spotter", "Mind Reader",
  "Story Detective", "Clue Master", "Legend Reader", "Mega Reader",
];

// Which rung (1 to 9) he reaches after answering `done` of the 10 questions.
export const rungFor = done => Math.max(1, Math.round(done * 0.9));

export const PRAISE = [
  "Brilliant!", "Spot on!", "Sharp reading!", "You cracked it!", "Superb detective work!",
  "Nothing gets past you!", "Mega!", "Clever thinking!", "That's the one!", "Top reading!",
];

// Messages for answering several questions in a row right first time.
export const RUN_MESSAGES = {
  2: "Two in a row, first time!",
  3: "Three in a row! You're on fire!",
  4: "Four in a row! Unstoppable!",
  6: "Six in a row! Legendary!",
  9: "Nine in a row! Mega!",
  10: "All ten first time! A perfect night!",
};

export const FLAW_NAMES = {
  literal: "That one took the words too literally.",
  evidence: "The story doesn't say that.",
  fragment: "Right idea, but not a full sentence.",
  short: "Too short, and not quite right.",
};

export const NUDGES = [
  "Mega Readers always find it in the end.",
  "The clue is hiding in there. You can find it!",
  "Detectives check the evidence. Have another look!",
  "So close. Have another go!",
];

// YOUR RECORD: based on the share of questions right first time.
export function record(progress) {
  let first = 0, total = 0;
  for (const n of Object.values(progress.nights)) { first += n.firstTry; total += n.total; }
  const pct = total ? first / total : 0;
  const title = pct >= 0.8 ? "Mega Reader" : pct >= 0.6 ? "Secret Spotter" : "Clue Finder";
  return { title, pct };
}

// Every night in reading order, each tagged with its chapter number.
export const allNights = chapters => chapters.flatMap(ch => ch.nights.map(n => ({ ...n, chapter: ch.chapter })));

const isComplete = (night, progress) => night.done || Boolean(progress.nights[night.id]);

// The next night he hasn't finished, or null when the book is done.
export function nextNight(chapters, progress) {
  return allNights(chapters).find(n => !isComplete(n, progress)) ?? null;
}

// How many nights are still to play in a chapter.
export function nightsLeftInChapter(chapters, progress, chapterNum) {
  const ch = chapters.find(c => c.chapter === chapterNum);
  return ch.nights.filter(n => !isComplete(n, progress)).length;
}

// Shuffle the options the same way every time for a given question, so the
// correct answer isn't always in the same place.
export function shuffledOptions(options, seedText) {
  // Hash the seed text, then use it to drive a small random number generator (mulberry32).
  let h = 1779033703 ^ seedText.length;
  for (const ch of seedText) {
    h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let state = h >>> 0;
  const rand = () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = options.map((o, i) => ({ ...o, key: i }));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Always positive: he is always a Mega Reader.
export function finishTitle(firstTry) {
  if (firstTry >= 9) return "Legendary Mega Reader!";
  if (firstTry >= 6) return "Super Mega Reader!";
  return "Mega Reader!";
}

export const stripStars = s => s.replace(/\*/g, "");
