// Mode 2: the six exam question formats. Each generator returns a
// multiple-choice question: { format, ..., options, answer (index), explain }.
import { KINDS, PLAIN_KINDS, CHIRAL_KINDS, SHADINGS, LINES, pick, shuffle, chance, isValid, signature } from "./figure.js";
import { randomElement, codes, oddOneOut } from "./generate.js";

export const FORMATS = [
  {
    key: "analogies", name: "Analogies",
    intro: ["The first picture changes into the second.", "Do exactly the same change to the third picture."],
  },
  {
    key: "odd", name: "Odd one out",
    intro: ["Four pictures follow the same rule. One doesn't.", "Find the one that breaks the rule."],
  },
  {
    key: "similar", name: "Similarities",
    intro: ["The two pictures on the left share something.", "Find the option that shares it too."],
  },
  {
    key: "codes", name: "Codes",
    intro: ["Each letter stands for something about the picture.", "Work out what each letter means, then find the code for the new picture."],
  },
  {
    key: "sequences", name: "Sequences",
    intro: ["The pictures change step by step along the row.", "What comes next?"],
  },
  {
    key: "grids", name: "Grids",
    intro: ["Each row and each column follows a pattern.", "Work out what fills the gap."],
  },
];
export const FORMAT_KEYS = FORMATS.map(f => f.key);
export const formatName = key => FORMATS.find(f => f.key === key).name;

const one = el => ({ elements: [{ ...el, id: "A", cell: 4, inside: null, pointsAt: null }], pairs: [] });
const sig = el => signature(one(el));
const allDifferent = els => new Set(els.map(sig)).size === els.length;

// Choose options: the right one plus up to three different-looking wrong ones.
function options(rng, right, wrongs) {
  if (!isValid(one(right))) return null;
  const seen = new Set([sig(right)]);
  const chosen = [];
  for (const w of shuffle(rng, wrongs)) {
    const s = sig(w);
    if (seen.has(s) || !isValid(one(w))) continue;
    seen.add(s);
    chosen.push(w);
    if (chosen.length === 3) break;
  }
  if (chosen.length < 3) return null;
  const all = shuffle(rng, [right, ...chosen]);
  return { options: all.map(one), answer: all.indexOf(right) };
}

// ---------- changes used by analogies and grids ----------

// Each maker looks at the starting shape and returns a change that can be
// applied to other shapes, a wrong version of it, and words for it.
const MAKERS = {
  turn(rng, el) {
    if (KINDS[el.kind].sym !== 360) return null;
    const step = pick(rng, [90, 180, 45]);
    return {
      key: "rotation",
      apply: e => ({ ...e, rotation: (e.rotation + step) % 360 }),
      wrong: e => ({ ...e, rotation: (e.rotation + 360 - (step === 180 ? 90 : step)) % 360 }),
      words: step === 180 ? "turns upside down" : step === 90 ? "turns a quarter turn clockwise" : "turns an eighth of a turn clockwise",
    };
  },
  shade(rng, el) {
    const to = pick(rng, SHADINGS.filter(s => s !== el.shading));
    const other = pick(rng, SHADINGS.filter(s => s !== el.shading && s !== to));
    return {
      key: "shading",
      apply: e => ({ ...e, shading: e.shading === el.shading ? to : e.shading }),
      wrong: e => ({ ...e, shading: other }),
      words: `changes from ${el.shading} to ${to}`,
    };
  },
  line(rng, el) {
    const to = pick(rng, LINES.filter(l => l !== el.line));
    const other = LINES.find(l => l !== el.line && l !== to);
    return {
      key: "line",
      apply: e => ({ ...e, line: e.line === el.line ? to : e.line }),
      wrong: e => ({ ...e, line: other }),
      words: `changes from a ${el.line} line to a ${to} line`,
    };
  },
  grow(rng, el) {
    if (el.count !== 1) return null;
    const to = el.size === "large" ? "small" : "large";
    return {
      key: "size",
      apply: e => ({ ...e, size: e.size === el.size ? to : e.size }),
      wrong: e => ({ ...e, size: "medium" }),
      words: to === "large" ? "gets bigger" : "gets smaller",
    };
  },
  flip(rng, el) {
    if (!KINDS[el.kind].chiral) return null;
    return {
      key: "flipped",
      apply: e => ({ ...e, flipped: !e.flipped }),
      wrong: e => ({ ...e, rotation: (e.rotation + 180) % 360 }),
      words: "flips over like a mirror image",
    };
  },
  more(rng, el) {
    if (el.size !== "small" || el.count > 2) return null;
    return {
      key: "count",
      apply: e => ({ ...e, count: e.count + 1 }),
      wrong: e => ({ ...e, count: e.count === 1 ? 3 : 1 }),
      words: "gets one more shape",
    };
  },
};

// ---------- the six generators ----------

function analogy(rng) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const makerKeys = shuffle(rng, Object.keys(MAKERS)).slice(0, pick(rng, [1, 1, 2]));
    const needsChiral = makerKeys.includes("flip");
    const small = makerKeys.includes("more");
    const kind = needsChiral ? pick(rng, CHIRAL_KINDS) : makerKeys.includes("turn") ? pick(rng, ["arrow", "heart", ...CHIRAL_KINDS]) : pick(rng, PLAIN_KINDS);
    const a = randomElement(rng, "A", 4, { kind, count: 1, size: small ? "small" : pick(rng, ["small", "large"]), flipped: false });
    const changes = makerKeys.map(k => MAKERS[k](rng, a));
    if (changes.some(c => !c)) continue;
    const applyAll = e => changes.reduce((x, c) => c.apply(x), e);
    const b = applyAll(a);
    // C keeps what the change looks at, but differs in something else.
    const keep = new Set(changes.map(c => c.key));
    let c = { ...a };
    if (!keep.has("shading")) c.shading = pick(rng, SHADINGS.filter(s => s !== a.shading));
    else if (!keep.has("line")) c.line = pick(rng, LINES.filter(l => l !== a.line));
    if (!keep.has("rotation") && !keep.has("flipped") && KINDS[kind].sym !== 360) c.kind = pick(rng, PLAIN_KINDS.filter(k => k !== kind));
    const d = applyAll(c);
    const wrongs = [c, b, ...changes.map(x => x.apply(c)).filter(() => changes.length > 1), ...changes.map(x => x.wrong(changes.length > 1 ? changes.filter(y => y !== x).reduce((e, y) => y.apply(e), c) : c))];
    if (!allDifferent([a, b]) || !allDifferent([c, d])) continue;
    const opts = options(rng, d, wrongs);
    if (!opts) continue;
    const words = changes.map(x => x.words).join(" and ");
    return { format: "analogies", a: one(a), b: one(b), c: one(c), ...opts, explain: `The first shape ${words}. So the third shape ${words} too.` };
  }
  throw new Error("Could not make an analogy");
}

function odd(rng) {
  const q = oddOneOut(rng);
  return { format: "odd", options: q.figures, answer: q.odd, explain: q.explain };
}

function similar(rng) {
  const keys = ["shading", "line", "shape", "count"];
  for (let attempt = 0; attempt < 200; attempt++) {
    const key = pick(rng, keys);
    const size = key === "count" ? "small" : null;
    const make = over => randomElement(rng, "A", 4, { count: 1, flipped: false, kind: pick(rng, PLAIN_KINDS), size: size ?? pick(rng, ["small", "medium", "large"]), ...over });
    const shared = { shading: pick(rng, SHADINGS), line: pick(rng, LINES), shape: pick(rng, PLAIN_KINDS), count: pick(rng, [2, 3]) }[key];
    const set = (e, v) => (key === "shape" ? { ...e, kind: v, rotation: 0 } : { ...e, [key]: v });
    const ex1 = set(make(), shared), ex2 = set(make(), shared);
    // The examples must differ in everything else, so only one thing is shared.
    const others = ["kind", "shading", "line", "size"].filter(k => k !== (key === "shape" ? "kind" : key) && !(key === "count" && k === "size"));
    if (others.some(k => ex1[k] === ex2[k])) continue;
    const pool = { shading: SHADINGS, line: LINES, shape: PLAIN_KINDS, count: [1, 2, 3] }[key].filter(v => v !== shared);
    const right = set(make(), shared);
    const wrongs = Array.from({ length: 8 }, () => set(make(), pick(rng, pool)));
    const opts = options(rng, right, wrongs);
    if (!opts || !allDifferent([ex1, ex2, right])) continue;
    const words = {
      shading: () => `are both ${shared}`, line: () => `both have ${shared} lines`,
      shape: () => `are both ${KINDS[shared].name}s`, count: () => `both have ${shared} shapes`,
    }[key]();
    return { format: "similar", examples: [one(ex1), one(ex2)], ...opts, explain: `The two pictures ${words}. Only one option does too.` };
  }
  throw new Error("Could not make a similarities question");
}

function codesQuestion(rng) {
  const q = codes(rng);
  return { format: "codes", figures: q.figures, test: q.test, options: q.options, answer: q.options.indexOf(q.answer), attrs: q.attrs,
    explain: `The first letter shows the ${attrWords(q.attrs[0])} and the second letter shows the ${attrWords(q.attrs[1])}.` };
}
const attrWords = key => ({ shape: "shape", count: "number of shapes", size: "size", shading: "shading", rotation: "way it's turned", line: "line style" }[key]);

const BORDER = [0, 1, 2, 5, 8, 7, 6, 3]; // clockwise round the edge

function sequence(rng) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const kind = pick(rng, ["walk", "turn", "turnShade", "walkShade"]);
    const frames = [];
    let explain;
    if (kind === "turn" || kind === "turnShade") {
      const k = pick(rng, ["arrow", "heart", ...CHIRAL_KINDS]);
      const step = pick(rng, [45, 90]);
      const shades = shuffle(rng, SHADINGS).slice(0, 3);
      const start = randomElement(rng, "A", 4, { kind: k, size: "medium", count: 1, flipped: false, rotation: pick(rng, [0, 90, 180, 270]) });
      const at = i => ({ ...start, rotation: (start.rotation + i * step) % 360, shading: kind === "turnShade" ? shades[i % 3] : start.shading });
      for (let i = 0; i <= 4; i++) frames.push(at(i));
      const wrongs = [at(3), at(5), { ...at(4), rotation: (at(4).rotation + 180) % 360 }, ...(kind === "turnShade" ? [{ ...at(4), shading: shades[(4 + 1) % 3] }, { ...at(4), shading: shades[3 % 3] }] : [{ ...at(4), flipped: KINDS[k].chiral }])];
      explain = kind === "turn"
        ? `Each step the shape turns ${step === 90 ? "a quarter turn" : "an eighth of a turn"} clockwise.`
        : `Each step the shape turns ${step === 90 ? "a quarter turn" : "an eighth of a turn"}, and the shading goes ${shades.join(", ")}, then round again.`;
      const opts = options(rng, frames[4], wrongs);
      if (!opts) continue;
      return { format: "sequences", frames: frames.slice(0, 4).map(one), ...opts, explain };
    }
    // A small shape walks clockwise round the edge of the box.
    const step = pick(rng, [1, 2]);
    const start = Math.floor(rng() * 8);
    const shades = shuffle(rng, SHADINGS).slice(0, 2);
    const el = randomElement(rng, "A", 0, { kind: pick(rng, PLAIN_KINDS), size: "small", count: 1, flipped: false });
    const at = i => ({ ...el, cell: BORDER[(start + i * step) % 8], shading: kind === "walkShade" ? shades[i % 2] : el.shading });
    const place = e => ({ elements: [{ ...e, id: "A" }], pairs: [] });
    for (let i = 0; i <= 4; i++) frames.push(at(i));
    const right = frames[4];
    const wrongCells = shuffle(rng, BORDER.filter(c => c !== right.cell)).slice(0, 3);
    const wrongs = wrongCells.map(c => ({ ...right, cell: c }));
    if (kind === "walkShade") wrongs[0] = { ...right, shading: shades[1 - (4 % 2)] };
    const all = shuffle(rng, [right, ...wrongs]);
    if (new Set(all.map(e => signature(place(e)))).size !== 4) continue;
    explain = `The little shape moves ${step === 1 ? "one space" : "two spaces"} clockwise round the edge each time${kind === "walkShade" ? ", and its shading swaps each step" : ""}.`;
    return { format: "sequences", frames: frames.slice(0, 4).map(place), options: all.map(place), answer: all.indexOf(right), explain };
  }
  throw new Error("Could not make a sequence");
}

function grid(rng) {
  for (let attempt = 0; attempt < 200; attempt++) {
    if (chance(rng, 0.5)) {
      // 3 x 3: every row is one shape, every column one shading.
      const kinds = shuffle(rng, PLAIN_KINDS).slice(0, 3);
      const shades = shuffle(rng, SHADINGS).slice(0, 3);
      const line = pick(rng, LINES);
      const cellEl = (r, c) => ({ id: "A", kind: kinds[r], count: 1, size: "medium", shading: shades[c], rotation: 0, flipped: false, cell: 4, line, inside: null, pointsAt: null });
      const gap = Math.floor(rng() * 9);
      const [gr, gc] = [Math.floor(gap / 3), gap % 3];
      const right = cellEl(gr, gc);
      const wrongs = [cellEl(gr, (gc + 1) % 3), cellEl((gr + 1) % 3, gc), cellEl((gr + 2) % 3, (gc + 2) % 3), { ...right, line: LINES.find(l => l !== line) }];
      const opts = options(rng, right, wrongs);
      if (!opts) continue;
      const cells = Array.from({ length: 9 }, (_, i) => (i === gap ? null : one(cellEl(Math.floor(i / 3), i % 3))));
      return { format: "grids", size: 3, cells, ...opts, explain: "Every shape in a row is the same shape, and every shape in a column has the same shading." };
    }
    // 2 x 2: going across makes one change, going down makes another.
    const [k1, k2] = shuffle(rng, ["turn", "shade", "line", "grow"]).slice(0, 2);
    const kind = [k1, k2].includes("turn") ? pick(rng, ["arrow", "heart", ...CHIRAL_KINDS]) : pick(rng, PLAIN_KINDS);
    const base = randomElement(rng, "A", 4, { kind, count: 1, size: "small", flipped: false });
    const across = MAKERS[k1](rng, base), down = MAKERS[k2](rng, base);
    if (!across || !down) continue;
    const cellsEl = [base, across.apply(base), down.apply(base), down.apply(across.apply(base))];
    if (!allDifferent(cellsEl)) continue;
    const gap = Math.floor(rng() * 4);
    const right = cellsEl[gap];
    const wrongs = [...cellsEl.filter((_, i) => i !== gap), across.wrong(right), down.wrong(right)];
    const opts = options(rng, right, wrongs);
    if (!opts) continue;
    const cells = cellsEl.map((e, i) => (i === gap ? null : one(e)));
    return { format: "grids", size: 2, cells, ...opts, explain: `Going across, the shape ${across.words}. Going down, it ${down.words}.` };
  }
  throw new Error("Could not make a grid");
}

export const GENERATORS = { analogies: analogy, odd, similar, codes: codesQuestion, sequences: sequence, grids: grid };

export const makeQuestion = (rng, format) => GENERATORS[format](rng);
