// The figure model. A figure is a 300 x 300 box split into a 3 x 3 grid of
// cells. Each element (a "shape" to him) has explicit attributes, so the
// answer to every question can be worked out exactly by comparing them.
//
// element = { id, kind, count, size, shading, rotation, flipped, cell, line,
//             inside (id of the big shape it sits in, or null),
//             pointsAt (arrows only: id of the shape it points at, or null) }
// figure  = { elements: [...], pairs: [{ a, b, rel }] }
//   a pair is two shapes side by side in the same row (a on the left):
//   rel is "apart", "touching", "overA" (overlapping, a in front) or "overB".

export const BOX = 300;
export const CELL = 100;
export const SIZES = ["small", "medium", "large"];
export const SIZE_R = { small: 20, medium: 27, large: 38 };
export const SHADINGS = ["white", "grey", "black", "striped"];
export const LINES = ["solid", "dotted", "double"];

// sym: the smallest turn (degrees) that makes the shape look the same.
// 0 means any turn looks the same (a circle). chiral: its mirror image can't
// be made by turning it, so "Flipped" can really be seen.
export const KINDS = {
  triangle: { name: "triangle", sym: 120 },
  square: { name: "square", sym: 90 },
  pentagon: { name: "pentagon", sym: 72 },
  hexagon: { name: "hexagon", sym: 60 },
  circle: { name: "circle", sym: 0, curved: true },
  star: { name: "star", sym: 72 },
  heart: { name: "heart", sym: 360, curved: true },
  arrow: { name: "arrow", sym: 360 },
  cross: { name: "cross", sym: 90 },
  flag: { name: "flag", sym: 360, chiral: true },
  lshape: { name: "L shape", sym: 360, chiral: true },
};
export const KIND_KEYS = Object.keys(KINDS);
export const CHIRAL_KINDS = KIND_KEYS.filter(k => KINDS[k].chiral);
export const PLAIN_KINDS = KIND_KEYS.filter(k => k !== "arrow" && !KINDS[k].chiral);
export const STRAIGHT_KINDS = ["triangle", "square", "pentagon", "hexagon", "star", "cross"];
export const CURVED_KINDS = ["circle", "heart"];
// Big shapes that have room for a small shape inside them.
export const ROOMY_KINDS = ["circle", "square", "pentagon", "hexagon"];
// How many copies each size can have and still fit in its cell.
export const MAX_COUNT = { small: 3, medium: 2, large: 1 };

// ---------- randomness ----------

// A seedable random number generator, so tests can repeat a puzzle.
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = (rng, list) => list[Math.floor(rng() * list.length)];
export function shuffle(rng, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export const chance = (rng, p) => rng() < p;
export const clone = fig => structuredClone(fig);

// ---------- shape outlines (unit size, centred on 0,0) ----------

function regular(n, turn = -90) {
  return Array.from({ length: n }, (_, i) => {
    const a = ((turn + (i * 360) / n) * Math.PI) / 180;
    return [Math.cos(a), Math.sin(a)];
  });
}

function heart() {
  const pts = [];
  for (let i = 0; i < 60; i++) {
    const t = (i / 60) * 2 * Math.PI;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    pts.push([x / 17, (y + 2.5) / 17]);
  }
  return pts;
}

const OUTLINES = {
  triangle: regular(3).map(([x, y]) => [x * 1.05, y * 1.05 + 0.2]),
  square: regular(4, -45).map(([x, y]) => [x * 1.05, y * 1.05]),
  pentagon: regular(5),
  hexagon: regular(6),
  circle: regular(48),
  star: regular(10).map(([x, y], i) => (i % 2 ? [x * 0.45, y * 0.45] : [x, y])),
  heart: heart(),
  // Points right when rotation is 0.
  arrow: [[-1, -0.28], [0.15, -0.28], [0.15, -0.65], [1, 0], [0.15, 0.65], [0.15, 0.28], [-1, 0.28]],
  cross: [[-0.33, -1], [0.33, -1], [0.33, -0.33], [1, -0.33], [1, 0.33], [0.33, 0.33], [0.33, 1], [-0.33, 1], [-0.33, 0.33], [-1, 0.33], [-1, -0.33], [-0.33, -0.33]],
  // A pole with a pennant at the top right: no mirror line at all.
  flag: [[-0.55, 1], [-0.55, -1], [0.75, -0.55], [-0.3, -0.1], [-0.3, 1]],
  // An L with a long upright and a short foot: no mirror line at all.
  lshape: [[-0.55, -1], [-0.1, -1], [-0.1, 0.55], [0.75, 0.55], [0.75, 1], [-0.55, 1]],
};

// The outline of one copy of an element, placed in the box.
export function place(el, cx, cy, r, rot) {
  const a = (rot * Math.PI) / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  return OUTLINES[el.kind].map(([x0, y]) => {
    const x = el.flipped ? -x0 : x0;
    return [cx + r * (x * cos - y * sin), cy + r * (x * sin + y * cos)];
  });
}

// ---------- geometry ----------

export const cellCentre = cell => [CELL / 2 + CELL * (cell % 3), CELL / 2 + CELL * Math.floor(cell / 3)];

function segmentsCross([p1, p2], [p3, p4]) {
  const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d1 = d(p3, p4, p1), d2 = d(p3, p4, p2), d3 = d(p1, p2, p3), d4 = d(p1, p2, p4);
  return d1 * d2 < 0 && d3 * d4 < 0;
}

export function pointInPolygon([x, y], poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

const box = poly => {
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
};

export function polygonsMeet(P, Q) {
  const [a0, a1, a2, a3] = box(P), [b0, b1, b2, b3] = box(Q);
  if (a2 < b0 || b2 < a0 || a3 < b1 || b3 < a1) return false;
  if (pointInPolygon(P[0], Q) || pointInPolygon(Q[0], P)) return true;
  for (let i = 0; i < P.length; i++) {
    const e = [P[i], P[(i + 1) % P.length]];
    for (let j = 0; j < Q.length; j++) if (segmentsCross(e, [Q[j], Q[(j + 1) % Q.length]])) return true;
  }
  return false;
}

const angleTo = (from, to) => (Math.atan2(to.cy - from.cy, to.cx - from.cx) * 180) / Math.PI;
export const angleGap = (a, b) => {
  const d = (((a - b) % 360) + 360) % 360;
  return Math.min(d, 360 - d);
};

// Where the copies of an element sit, relative to its centre.
// Three sit in a little triangle so they fit inside one cell.
function copyOffsets(count, r) {
  const gap = 2 * r + 4;
  if (count === 1) return [[0, 0]];
  if (count === 2) return [[-gap / 2, 0], [gap / 2, 0]];
  if (count === 3) return [[-gap / 2, gap * 0.45], [gap / 2, gap * 0.45], [0, -gap * 0.45]];
  return [[-gap / 2, -gap / 2], [gap / 2, -gap / 2], [-gap / 2, gap / 2], [gap / 2, gap / 2]];
}

export const byId = (fig, id) => fig.elements.find(e => e.id === id);
export const pairOf = (fig, id) => (fig.pairs ?? []).find(p => p.a === id || p.b === id);

// How far to slide a pair together (total) for its relation.
function pairSlide(a, b, La, Lb, rel) {
  const meet = s => polygonsMeet(place(a, La.cx + s / 2, La.cy, La.r, a.rotation), place(b, Lb.cx - s / 2, Lb.cy, Lb.r, b.rotation));
  let lo = 0, hi = CELL;
  for (let i = 0; i < 22; i++) {
    const mid = (lo + hi) / 2;
    if (meet(mid)) hi = mid; else lo = mid;
  }
  if (rel === "apart") return Math.max(0, hi - 18);
  if (rel === "touching") return hi + 0.6;
  return hi + Math.min(La.r, Lb.r) * 0.5;
}

// Work out exactly where everything is drawn.
// Returns { [id]: { cx, cy, r, rot, copies: [{ cx, cy, pts }] } }.
export function layout(fig) {
  const out = {};
  for (const el of fig.elements) {
    const [cx, cy] = cellCentre(el.cell);
    out[el.id] = { cx, cy, r: SIZE_R[el.size], rot: el.rotation };
  }
  for (const p of fig.pairs ?? []) {
    const a = byId(fig, p.a), b = byId(fig, p.b);
    const s = pairSlide(a, b, out[a.id], out[b.id], p.rel);
    out[a.id].cx += s / 2;
    out[b.id].cx -= s / 2;
  }
  for (const el of fig.elements) {
    if (el.kind === "arrow" && el.pointsAt) out[el.id].rot = angleTo(out[el.id], out[el.pointsAt]);
  }
  for (const el of fig.elements) {
    const L = out[el.id];
    L.copies = copyOffsets(el.count, L.r).map(([dx, dy]) => ({
      cx: L.cx + dx, cy: L.cy + dy, pts: place(el, L.cx + dx, L.cy + dy, L.r, L.rot),
    }));
  }
  return out;
}

// ---------- validity ----------

// True if the figure can be drawn cleanly and means exactly what it says.
export function isValid(fig) {
  const els = fig.elements;
  const cells = els.filter(e => !e.inside).map(e => e.cell);
  if (new Set(cells).size !== cells.length) return false;
  for (const el of els) {
    if (el.count > MAX_COUNT[el.size]) return false;
    if (el.flipped && !KINDS[el.kind].chiral) return false;
    if (el.inside) {
      const c = byId(fig, el.inside);
      if (!c || c.cell !== el.cell || c.size !== "large" || c.count !== 1 || !ROOMY_KINDS.includes(c.kind)) return false;
      if (el.size !== "small" || el.count !== 1 || el.kind === "arrow" || pairOf(fig, el.id) || pairOf(fig, c.id)) return false;
      if (els.some(o => o !== el && o.inside === c.id)) return false;
    }
  }
  const inPairs = new Set();
  for (const p of fig.pairs ?? []) {
    const a = byId(fig, p.a), b = byId(fig, p.b);
    if (!a || !b || b.cell !== a.cell + 1 || a.cell % 3 === 2) return false;
    if (inPairs.has(a.id) || inPairs.has(b.id)) return false;
    inPairs.add(a.id); inPairs.add(b.id);
    for (const e of [a, b]) if (e.count !== 1 || e.kind === "arrow" || e.size === "large" || e.inside || els.some(o => o.inside === e.id)) return false;
  }
  const L = layout(fig);
  // Everything stays inside the box.
  for (const el of els) for (const c of L[el.id].copies) for (const [x, y] of c.pts) if (x < 4 || y < 4 || x > BOX - 4 || y > BOX - 4) return false;
  // A shape inside another must fit inside it.
  for (const el of els.filter(e => e.inside)) {
    const outer = L[el.inside].copies[0].pts;
    if (!L[el.id].copies[0].pts.every(p => pointInPolygon(p, outer))) return false;
    const [cx, cy] = [L[el.id].cx, L[el.id].cy];
    if (!outer.every(([x, y]) => Math.hypot(x - cx, y - cy) > SIZE_R.small + 3)) return false;
  }
  // Shapes only touch when a pair or "inside" says so.
  for (let i = 0; i < els.length; i++) {
    for (let j = i + 1; j < els.length; j++) {
      const a = els[i], b = els[j];
      if (a.inside === b.id || b.inside === a.id) continue;
      const p = pairOf(fig, a.id);
      if (p && (p.a === b.id || p.b === b.id)) continue;
      for (const ca of L[a.id].copies) for (const cb of L[b.id].copies) if (polygonsMeet(ca.pts, cb.pts)) return false;
    }
  }
  // Arrows: point clearly at their target (nothing else in the way), or clearly at nothing.
  for (const el of els.filter(e => e.kind === "arrow")) {
    if (el.inside || els.some(o => o.inside === el.id) || el.count !== 1) return false;
    const me = L[el.id];
    const others = els.filter(o => o !== el && !o.inside);
    if (el.pointsAt) {
      const t = byId(fig, el.pointsAt);
      if (!t || t === el || t.inside || pairOf(fig, t.id) || t.kind === "arrow") return false;
      const dist = Math.hypot(L[t.id].cx - me.cx, L[t.id].cy - me.cy);
      for (const o of others) {
        if (o === t) continue;
        const d = Math.hypot(L[o.id].cx - me.cx, L[o.id].cy - me.cy);
        if (angleGap(angleTo(me, L[o.id]), me.rot) < 30 && d < dist + 40) return false;
      }
    } else {
      for (const o of others) if (angleGap(angleTo(me, L[o.id]), me.rot) < 35) return false;
    }
  }
  return true;
}

// ---------- reading a figure ----------

// Every attribute's value for one element, as used when comparing figures.
export function valuesOf(fig, L, el) {
  const pair = pairOf(fig, el.id);
  let layer = null, touching = false;
  if (pair?.rel === "touching") touching = true;
  if (pair?.rel.startsWith("over")) layer = (pair.rel === "overA") === (pair.a === el.id) ? "front" : "behind";
  return {
    shape: el.kind, count: el.count, size: el.size, shading: el.shading, rotation: L[el.id].rot,
    flipped: el.flipped, position: el.cell, layer, line: el.line, touching,
    pointing: el.kind === "arrow" ? el.pointsAt ?? "nothing" : null, inside: el.inside ?? null,
  };
}

function rotationDiffers(kind, r1, r2) {
  const sym = KINDS[kind].sym;
  if (sym === 0) return false;
  const d = (((r1 - r2) % sym) + sym) % sym;
  return Math.min(d, sym - d) > 3;
}

// Which attributes differ for each element: { A: ["shading", ...], ... }.
// Rotation and Flipped are only compared when the shape itself stays the same.
export function diff(f1, f2) {
  const L1 = layout(f1), L2 = layout(f2);
  const out = {};
  for (const e1 of f1.elements) {
    const e2 = byId(f2, e1.id);
    const v1 = valuesOf(f1, L1, e1), v2 = valuesOf(f2, L2, e2);
    const changed = [];
    for (const key of Object.keys(v1)) {
      if (key === "rotation") {
        if (v1.shape === v2.shape && rotationDiffers(e1.kind, v1.rotation, v2.rotation)) changed.push(key);
      } else if (key === "flipped") {
        if (v1.shape === v2.shape && KINDS[e1.kind].chiral && v1.flipped !== v2.flipped) changed.push(key);
      } else if (v1[key] !== v2[key]) changed.push(key);
    }
    out[e1.id] = changed;
  }
  return out;
}

// A compact fingerprint used to make sure multiple-choice options all look different.
export function signature(fig) {
  const L = layout(fig);
  return JSON.stringify(fig.elements.map(el => {
    const v = valuesOf(fig, L, el);
    const sym = KINDS[el.kind].sym;
    v.rotation = sym === 0 ? 0 : Math.round(((v.rotation % sym) + sym) % sym);
    if (!KINDS[el.kind].chiral) v.flipped = false;
    return v;
  }).sort((a, b) => a.position - b.position || (a.inside ? 1 : -1)));
}

const NUMBER_WORDS = ["", "", "two", "three", "four"];
function plural(name) {
  return name.endsWith("s") ? `${name}es` : `${name}s`;
}

// "small black triangle", "two large white hexagons".
export function describe(el) {
  const name = KINDS[el.kind].name;
  const words = [NUMBER_WORDS[el.count], el.size, el.shading, el.count > 1 ? plural(name) : name];
  return words.filter(Boolean).join(" ");
}

// Letters A, B, C in reading order (top left first; big shapes before what's inside them).
export function relabel(fig) {
  const order = [...fig.elements].sort((a, b) => a.cell - b.cell || (a.inside ? 1 : 0) - (b.inside ? 1 : 0));
  const map = Object.fromEntries(order.map((e, i) => [e.id, "ABCDEFG"[i]]));
  return {
    elements: order.map(e => ({ ...e, id: map[e.id], inside: e.inside ? map[e.inside] : null, pointsAt: e.pointsAt ? map[e.pointsAt] : null })),
    pairs: (fig.pairs ?? []).map(p => ({ ...p, a: map[p.a], b: map[p.b] })),
  };
}
