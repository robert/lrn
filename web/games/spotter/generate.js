// Puzzle generators for Mode 1: Spot the Change, Codes and Odd One Out.
// Every generator takes rng (a function returning 0..1) so tests can repeat it.
import {
  KINDS, PLAIN_KINDS, CHIRAL_KINDS, ROOMY_KINDS, STRAIGHT_KINDS, CURVED_KINDS, SIZES, SHADINGS, LINES, MAX_COUNT,
  pick, shuffle, chance, clone, isValid, diff, byId, pairOf, layout, angleGap, relabel, signature,
} from "./figure.js";

const ROTATIONS = [0, 45, 90, 135, 180, 225, 270, 315];
const DRAWABLE = [...PLAIN_KINDS, ...CHIRAL_KINDS];

// ---------- random figures ----------

export function randomElement(rng, id, cell, opts = {}) {
  const kind = opts.kind ?? pick(rng, DRAWABLE);
  const size = opts.size ?? pick(rng, SIZES);
  const count = opts.count ?? (size !== "large" && chance(rng, 0.25) ? 2 + Math.floor(rng() * (MAX_COUNT[size] - 1)) : 1);
  return {
    id, kind, size, count: Math.min(count, MAX_COUNT[size]),
    shading: opts.shading ?? pick(rng, SHADINGS),
    rotation: opts.rotation ?? (KINDS[kind].sym === 0 ? 0 : pick(rng, ROTATIONS)),
    flipped: opts.flipped ?? (KINDS[kind].chiral && chance(rng, 0.5)),
    cell, line: opts.line ?? pick(rng, LINES), inside: null, pointsAt: null,
  };
}

// A random valid figure with n shapes. With relations on, it may include a
// pair (touching or overlapping), a shape inside a big one, and an arrow.
export function randomFigure(rng, n, relations = false) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const ids = "PQRSTUV".split("");
    const next = () => ids.shift();
    const free = shuffle(rng, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
    const takeCell = c => free.splice(free.indexOf(c), 1)[0];
    const elements = [], pairs = [];
    let left = n;

    if (relations && left >= 2 && chance(rng, 0.45)) {
      const row = Math.floor(rng() * 3), col = Math.floor(rng() * 2);
      const a = randomElement(rng, next(), takeCell(row * 3 + col), { count: 1, size: pick(rng, ["small", "medium"]), kind: pick(rng, DRAWABLE) });
      const b = randomElement(rng, next(), takeCell(row * 3 + col + 1), { count: 1, size: pick(rng, ["small", "medium"]), kind: pick(rng, DRAWABLE) });
      elements.push(a, b);
      pairs.push({ a: a.id, b: b.id, rel: pick(rng, ["apart", "touching", "overA", "overB"]) });
      left -= 2;
    }
    if (relations && left >= 2 && chance(rng, 0.45)) {
      const cell = free.shift();
      const big = randomElement(rng, next(), cell, { kind: pick(rng, ROOMY_KINDS), size: "large", count: 1, flipped: false });
      const small = randomElement(rng, next(), cell, { kind: pick(rng, DRAWABLE.filter(k => k !== "cross")), size: "small", count: 1 });
      small.inside = big.id;
      elements.push(big, small);
      left -= 2;
    }
    if (relations && left >= 1 && elements.length + left >= 2 && chance(rng, 0.45)) {
      const arrow = randomElement(rng, next(), free.shift(), { kind: "arrow", count: 1, size: "medium", flipped: false });
      elements.push(arrow);
      left -= 1;
    }
    for (let i = 0; i < left; i++) elements.push(randomElement(rng, next(), free.shift()));

    const arrow = elements.find(e => e.kind === "arrow");
    if (arrow) {
      const targets = elements.filter(e => e !== arrow && !e.inside && !pairOf({ pairs }, e.id) && e.kind !== "arrow");
      if (targets.length && chance(rng, 0.7)) arrow.pointsAt = pick(rng, targets).id;
      else arrow.rotation = pick(rng, ROTATIONS);
    }
    const fig = { elements, pairs };
    if (isValid(fig)) return fig;
  }
  throw new Error(`Could not make a figure with ${n} shapes`);
}

// ---------- changes ----------

const isFree = (fig, el) => !el.inside && !pairOf(fig, el.id) && !fig.elements.some(o => o.inside === el.id || o.pointsAt === el.id);
const emptyCells = fig => [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(c => !fig.elements.some(e => e.cell === c));

// One entry per attribute: which elements it can change, and how.
// Each apply() changes the figure in place; the result is checked afterwards.
export const CHANGES = {
  shape: {
    can: (fig, el) => el.kind !== "arrow",
    apply(rng, fig, el) {
      const holdsSomething = fig.elements.some(o => o.inside === el.id);
      const pool = holdsSomething ? ROOMY_KINDS : KINDS[el.kind].chiral ? PLAIN_KINDS : DRAWABLE;
      el.kind = pick(rng, pool.filter(k => k !== el.kind));
      el.flipped = false;
      if (KINDS[el.kind].sym === 0) el.rotation = 0;
    },
  },
  count: {
    can: (fig, el) => isFree(fig, el) && el.kind !== "arrow" && MAX_COUNT[el.size] > 1,
    apply(rng, fig, el) {
      el.count = pick(rng, [1, 2, 3].filter(c => c !== el.count && c <= MAX_COUNT[el.size]));
    },
  },
  size: {
    can: (fig, el) => !el.inside && !fig.elements.some(o => o.inside === el.id) && el.kind !== "arrow",
    apply(rng, fig, el) {
      const pool = SIZES.filter(s => s !== el.size && el.count <= MAX_COUNT[s] && !(pairOf(fig, el.id) && s === "large"));
      el.size = pick(rng, pool);
    },
  },
  shading: {
    can: () => true,
    apply(rng, fig, el) { el.shading = pick(rng, SHADINGS.filter(s => s !== el.shading)); },
  },
  rotation: {
    can: (fig, el) => el.kind !== "arrow" && KINDS[el.kind].sym !== 0,
    apply(rng, fig, el) {
      const sym = KINDS[el.kind].sym;
      const pool = ROTATIONS.filter(r => {
        const d = (((r - el.rotation) % sym) + sym) % sym;
        return Math.min(d, sym - d) > 3;
      });
      el.rotation = pick(rng, pool);
    },
  },
  flipped: {
    can: (fig, el) => KINDS[el.kind].chiral,
    apply(rng, fig, el) { el.flipped = !el.flipped; },
  },
  position: {
    can: (fig, el) => isFree(fig, el) && el.kind !== "arrow" && emptyCells(fig).length > 0,
    apply(rng, fig, el) { el.cell = pick(rng, emptyCells(fig)); },
  },
  layer: {
    can: (fig, el) => pairOf(fig, el.id)?.rel.startsWith("over"),
    apply(rng, fig, el) {
      const p = pairOf(fig, el.id);
      p.rel = p.rel === "overA" ? "overB" : "overA";
    },
  },
  line: {
    can: () => true,
    apply(rng, fig, el) { el.line = pick(rng, LINES.filter(l => l !== el.line)); },
  },
  touching: {
    can: (fig, el) => ["apart", "touching"].includes(pairOf(fig, el.id)?.rel),
    apply(rng, fig, el) {
      const p = pairOf(fig, el.id);
      p.rel = p.rel === "apart" ? "touching" : "apart";
    },
  },
  pointing: {
    can: (fig, el) => el.kind === "arrow",
    apply(rng, fig, el) {
      const targets = fig.elements.filter(e => e !== el && !e.inside && !pairOf(fig, e.id) && e.kind !== "arrow" && e.id !== el.pointsAt);
      const options = [...targets.map(t => t.id), ...(el.pointsAt ? [null] : [])];
      const choice = pick(rng, options);
      if (choice === undefined) throw new Error("no new target");
      const before = layout(fig)[el.id].rot;
      el.pointsAt = choice;
      // Pointing at nothing: turn to face a new, empty direction.
      if (!choice) el.rotation = pick(rng, ROTATIONS.filter(r => angleGap(r, before) > 40));
    },
  },
  inside: {
    can: (fig, el) => (el.inside && emptyCells(fig).length > 0) || (isFree(fig, el) && el.size === "small" && el.count === 1 && el.kind !== "arrow" && emptyContainers(fig, el).length > 0),
    apply(rng, fig, el) {
      if (el.inside) {
        el.inside = null;
        el.cell = pick(rng, emptyCells(fig));
      } else {
        const box = pick(rng, emptyContainers(fig, el));
        el.inside = box.id;
        el.cell = box.cell;
      }
    },
  },
};

function emptyContainers(fig, el) {
  return fig.elements.filter(c => c !== el && c.size === "large" && c.count === 1 && ROOMY_KINDS.includes(c.kind)
    && !pairOf(fig, c.id) && !fig.elements.some(o => o.inside === c.id) && c.kind !== "arrow");
}

// Apply one random change of the given attribute. Returns the new figure,
// or null if that change isn't possible (or would look wrong) here.
export function tryChange(rng, fig, key, onlyId = null) {
  const candidates = fig.elements.filter(el => (!onlyId || el.id === onlyId) && CHANGES[key].can(fig, el));
  if (!candidates.length) return null;
  const next = clone(fig);
  const el = byId(next, pick(rng, candidates).id);
  try { CHANGES[key].apply(rng, next, el); } catch { return null; }
  return isValid(next) ? next : null;
}

// Simple, friendly notes when one change brings another along with it.
export function linkedNotes(changes, fig1) {
  const notes = [];
  for (const [id, keys] of Object.entries(changes)) {
    const el = byId(fig1, id);
    if (keys.includes("inside") && keys.includes("position")) notes.push(`Shape ${id} moved ${el.inside ? "out of" : "into"} another shape, so its position changed too.`);
    if (keys.includes("pointing") && keys.includes("rotation")) notes.push(`Arrow ${id} turned to point somewhere new, so it rotated too.`);
  }
  const layered = Object.entries(changes).filter(([, k]) => k.includes("layer")).map(([id]) => id);
  if (layered.length === 2) notes.push(`When Shape ${layered[0]} and Shape ${layered[1]} swap places at the front, they both change: one goes in front, one goes behind.`);
  const touched = Object.entries(changes).filter(([, k]) => k.includes("touching")).map(([id]) => id);
  if (touched.length === 2) notes.push(`Touching always takes two: Shape ${touched[0]} and Shape ${touched[1]} both changed.`);
  return notes;
}

// ---------- Spot the Change ----------

// Difficulty grows with the number of Spot the Change rounds completed.
export function spotLevel(done, rng = Math.random) {
  if (done < 8) return { shapes: 1, changes: [1, 1], relations: false };
  if (done < 20) return { shapes: 1, changes: [1, 2], relations: false };
  if (done < 40) return { shapes: 2, changes: [1, 2], relations: true };
  if (done < 70) return { shapes: pick(rng, [2, 3]), changes: [2, 3], relations: true };
  return { shapes: 3, changes: [2, 4], relations: true };
}

const CHANGE_KEYS = Object.keys(CHANGES);

export function spotChange(rng, level) {
  for (let attempt = 0; attempt < 300; attempt++) {
    const fig1 = relabel(randomFigure(rng, level.shapes, level.relations));
    const want = level.changes[0] + Math.floor(rng() * (level.changes[1] - level.changes[0] + 1));
    let fig2 = fig1;
    const used = new Set();
    // Prefer relation changes when the figure has relations, so they get practised.
    const keys = shuffle(rng, CHANGE_KEYS);
    for (const key of keys) {
      if (used.size >= want) break;
      const next = tryChange(rng, fig2, key);
      if (!next) continue;
      const d = diff(fig2, next);
      // Each step must change something new.
      if (Object.values(d).flat().length === 0) continue;
      fig2 = next;
      used.add(key);
    }
    const changes = diff(fig1, fig2);
    const total = Object.values(changes).flat().length;
    if (used.size < want || total === 0) continue;
    return { fig1, fig2, changes, notes: linkedNotes(changes, fig1) };
  }
  throw new Error("Could not make a Spot the Change puzzle");
}

// ---------- Codes ----------

// Which attributes can be coded, and how to pick 2 or 3 values for each.
const CODE_ATTRS = {
  shape: rng => shuffle(rng, PLAIN_KINDS).slice(0, 3),
  count: () => [1, 2, 3],
  size: () => ["small", "medium", "large"],
  shading: rng => shuffle(rng, SHADINGS).slice(0, 3),
  rotation: rng => shuffle(rng, [0, 90, 180, 270]).slice(0, 3),
  line: () => LINES,
};
const CLASHES = [["shape", "rotation"], ["count", "size"]];

function codedElement(base, attrs, values) {
  const el = { ...base };
  attrs.forEach((key, i) => {
    const v = values[i];
    if (key === "shape") el.kind = v;
    else if (key === "count") el.count = v;
    else el[key] = v;
  });
  return el;
}

// Returns { attrs: [key1, key2], figures: [{fig, code}], test: fig, options: [code], answer }.
export function codes(rng) {
  for (let attempt = 0; attempt < 200; attempt++) {
    const [k1, k2] = shuffle(rng, Object.keys(CODE_ATTRS)).slice(0, 2);
    if (CLASHES.some(c => c.includes(k1) && c.includes(k2))) continue;
    const n1 = pick(rng, [2, 3]), n2 = pick(rng, [2, 3]);
    const v1 = CODE_ATTRS[k1](rng).slice(0, n1), v2 = CODE_ATTRS[k2](rng).slice(0, n2);
    const L1 = shuffle(rng, ["A", "B", "C"]).slice(0, n1), L2 = shuffle(rng, ["X", "Y", "Z"]).slice(0, n2);
    const usesRotation = k1 === "rotation" || k2 === "rotation";
    const base = {
      id: "A", kind: usesRotation ? pick(rng, ["arrow", "flag", "heart"]) : pick(rng, PLAIN_KINDS),
      count: 1, size: k1 === "count" || k2 === "count" ? "small" : "medium",
      shading: pick(rng, SHADINGS), rotation: 0, flipped: false, cell: 4, line: "solid", inside: null, pointsAt: null,
    };
    // Coded figures: cover every value of both letters, three or four figures.
    const combos = [];
    const all = v1.flatMap((_, i) => v2.map((_, j) => [i, j]));
    for (const [i, j] of shuffle(rng, all)) {
      const coversNew = !combos.some(c => c[0] === i) || !combos.some(c => c[1] === j);
      if (coversNew) combos.push([i, j]);
    }
    const extra = shuffle(rng, all.filter(c => !combos.some(d => d[0] === c[0] && d[1] === c[1])));
    while (combos.length < 3 && extra.length) combos.push(extra.shift());
    if (combos.length > 4 || !extra.length) continue;
    if (combos.length === 3 && extra.length > 1 && chance(rng, 0.5)) combos.push(extra.shift());
    const testCombo = extra.shift();
    const makeFig = ([i, j]) => ({ elements: [codedElement(base, [k1, k2], [v1[i], v2[j]])], pairs: [] });
    const figures = shuffle(rng, combos).map(c => ({ fig: makeFig(c), code: L1[c[0]] + L2[c[1]] }));
    if (!figures.every(f => isValid(f.fig))) continue;
    const test = makeFig(testCombo);
    if (!isValid(test)) continue;
    const answer = L1[testCombo[0]] + L2[testCombo[1]];
    const wrong = new Set();
    for (const a of L1) for (const b of L2) if (a + b !== answer) wrong.add(a + b);
    const options = shuffle(rng, [answer, ...shuffle(rng, [...wrong]).slice(0, 3)]);
    if (options.length < 3) continue;
    return { attrs: [k1, k2], figures, test, options, answer };
  }
  throw new Error("Could not make a Codes puzzle");
}

// ---------- Odd One Out ----------

// Nuisance: something that varies across all five figures so the odd one
// isn't obvious, but where no single figure stands out on its own.
function nuisance(rng, els, avoid) {
  const choices = ["rotation", "size", "shading"].filter(k => !avoid.includes(k));
  if (!choices.length) return null;
  const key = pick(rng, choices);
  if (key === "rotation") {
    const sym = KINDS[els[0].kind].sym;
    if (sym === 0 || els.some(e => e.kind !== els[0].kind)) return nuisance(rng, els, [...avoid, "rotation"]);
    // Five turns that all look different.
    const pool = shuffle(rng, ROTATIONS);
    const picked = [];
    for (const r of pool) {
      if (picked.every(p => { const d = (((r - p) % sym) + sym) % sym; return Math.min(d, sym - d) > 3; })) picked.push(r);
      if (picked.length === 5) break;
    }
    if (picked.length < 5) return nuisance(rng, els, [...avoid, "rotation"]);
    els.forEach((e, i) => { e.rotation = picked[i]; });
  } else {
    // Two values split 2 and 3, so neither stands out.
    const values = key === "size" ? shuffle(rng, ["small", "medium"]) : shuffle(rng, SHADINGS).slice(0, 2);
    const split = shuffle(rng, [0, 0, 1, 1, 1]);
    els.forEach((e, i) => { e[key] = values[split[i]]; });
  }
  return key;
}

const one = el => ({ elements: [el], pairs: [] });

// Returns { figures: [fig x5], odd: index, answers: [attribute keys], explain }.
export function oddOneOut(rng) {
  const variants = ["mirror", "mirror", "mirror", "count", "sides", "curved", "shading", "line", "smallPosition", "inside", "size"];
  for (let attempt = 0; attempt < 200; attempt++) {
    const variant = pick(rng, variants);
    const odd = Math.floor(rng() * 5);
    let figures, answers, explain;
    // Five copies of one shape; the nuisance and the odd change are added after.
    const base = opts => {
      const el = randomElement(rng, "A", 4, { count: 1, size: "medium", rotation: pick(rng, [0, 45, 90, 180]), ...opts });
      return Array.from({ length: 5 }, () => ({ ...el }));
    };

    if (variant === "mirror") {
      const kind = pick(rng, CHIRAL_KINDS);
      const els = base({ kind, flipped: false, shading: pick(rng, SHADINGS), line: pick(rng, LINES) });
      nuisance(rng, els, ["size", "shading"]);
      els[odd].flipped = true;
      figures = els.map(one);
      answers = ["flipped"];
      explain = "Four are the same shape just turned round. The odd one is a mirror image: you can't turn it to match.";
    } else if (variant === "count") {
      const kind = pick(rng, PLAIN_KINDS);
      const n = pick(rng, [1, 2, 3]);
      const els = base({ kind, size: "small", count: n, shading: pick(rng, SHADINGS), line: pick(rng, LINES) });
      nuisance(rng, els, ["size"]);
      els[odd].count = pick(rng, [1, 2, 3].filter(c => c !== n));
      figures = els.map(one);
      answers = ["count"];
      explain = "The odd one has a different number of shapes.";
    } else if (variant === "sides") {
      const [kind, other] = shuffle(rng, ["triangle", "square", "pentagon", "hexagon"]);
      const els = base({ kind, shading: pick(rng, SHADINGS), line: pick(rng, LINES) });
      nuisance(rng, els, ["rotation"]);
      els[odd].kind = other;
      els[odd].rotation = 0;
      figures = els.map(one);
      answers = ["shape"];
      explain = "Count the sides! The odd one has a different number.";
    } else if (variant === "curved") {
      const kinds = shuffle(rng, STRAIGHT_KINDS).slice(0, 4);
      const els = base({ shading: pick(rng, SHADINGS), line: pick(rng, LINES), rotation: 0 });
      let k = 0;
      els.forEach((e, i) => { e.kind = i === odd ? pick(rng, CURVED_KINDS) : kinds[k++]; });
      nuisance(rng, els, ["rotation"]);
      figures = els.map(one);
      answers = ["shape"];
      explain = "Four have only straight lines. The odd one has curved lines.";
    } else if (variant === "shading" || variant === "line" || variant === "size") {
      const kind = pick(rng, PLAIN_KINDS.filter(k => KINDS[k].sym !== 0));
      const els = base({ kind, shading: pick(rng, SHADINGS), line: pick(rng, LINES) });
      nuisance(rng, els, [variant, variant === "size" ? "rotation" : "size"].filter(Boolean));
      const pool = { shading: SHADINGS, line: LINES, size: SIZES }[variant];
      const usual = els[(odd + 1) % 5][variant];
      if (variant === "size" && els.some(e => e.size !== usual)) continue;
      els[odd][variant] = pick(rng, pool.filter(v => v !== usual));
      figures = els.map(one);
      answers = [variant];
      explain = { shading: "The odd one is shaded differently.", line: "The odd one has a different line style.", size: "The odd one is a different size." }[variant];
    } else if (variant === "smallPosition") {
      const big = randomElement(rng, "A", 4, { size: "large", count: 1, kind: pick(rng, PLAIN_KINDS), line: "solid" });
      const smallKind = pick(rng, PLAIN_KINDS);
      const corner = pick(rng, [0, 2, 6, 8]);
      const otherCorner = pick(rng, [0, 2, 6, 8].filter(c => c !== corner));
      const bigs = Array.from({ length: 5 }, () => ({ ...big }));
      nuisance(rng, bigs, ["size"]);
      figures = bigs.map((b, i) => ({
        elements: [b, { ...randomElement(rng, "B", i === odd ? otherCorner : corner, { kind: smallKind, size: "small", count: 1, shading: "black", line: "solid", rotation: 0, flipped: false }) }],
        pairs: [],
      }));
      answers = ["position"];
      explain = "Look where the little shape is. In the odd one it's in a different corner.";
    } else {
      const bigKind = pick(rng, ROOMY_KINDS);
      const smallKind = pick(rng, PLAIN_KINDS.filter(k => k !== "cross"));
      const outCell = pick(rng, [0, 2, 6, 8]);
      const big = randomElement(rng, "A", 4, { kind: bigKind, size: "large", count: 1, line: "solid", flipped: false });
      const bigs = Array.from({ length: 5 }, () => ({ ...big }));
      nuisance(rng, bigs, ["size"]);
      figures = bigs.map((b, i) => {
        const s = randomElement(rng, "B", i === odd ? outCell : 4, { kind: smallKind, size: "small", count: 1, shading: "black", line: "solid", rotation: 0, flipped: false });
        if (i !== odd) s.inside = "A";
        return { elements: [b, s], pairs: [] };
      });
      answers = ["inside", "position"];
      explain = "In four of them the little shape is inside the big one. In the odd one it's outside.";
    }
    if (!figures.every(isValid)) continue;
    // The odd one must really look different from all the others.
    const sigs = figures.map(signature);
    if (sigs.some((s, i) => i !== odd && s === sigs[odd])) continue;
    return { figures, odd, answers, explain, variant };
  }
  throw new Error("Could not make an Odd One Out puzzle");
}
