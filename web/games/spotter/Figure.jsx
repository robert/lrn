// Draws a figure as SVG from its attributes (see figure.js).
import { useId } from "react";
import { BOX, layout, pairOf } from "./figure.js";

// Refined ink on paper: crisp 2px lines at any size, fine hatching for
// striped, a soft sage-grey, and the paper plate keylined like a book plate.
const FILLS = { white: "#FFFFFF", grey: "#B4C2BA", black: "#1B2A24" };
const INK = "#1B2A24";
const PAPER = "#FFFFFF";
const KEYLINE = "#CFDBD4";
const LINE = 2; // screen pixels, whatever size the figure is drawn

// Drawing order: big shapes that hold others first, then overlapping pairs
// back to front, then everything else, then shapes sitting inside others.
function drawOrder(fig) {
  const z = el => {
    if (el.inside) return 3;
    if (fig.elements.some(o => o.inside === el.id)) return 0;
    const p = pairOf(fig, el.id);
    if (p?.rel.startsWith("over")) {
      const front = p.rel === "overA" ? p.a : p.b;
      return el.id === front ? 2 : 1;
    }
    return 1;
  };
  return [...fig.elements].sort((a, b) => z(a) - z(b));
}

const toPoints = pts => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

// The same outline pulled in towards its centre by `by` units.
function inset(pts, cx, cy, r, by) {
  const k = Math.max(0.35, (r - by) / r);
  return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
}

const crisp = { vectorEffect: "non-scaling-stroke", strokeLinejoin: "round", strokeLinecap: "round" };

function Shape({ el, copy, r, stripes }) {
  const fill = el.shading === "striped" ? `url(#${stripes})` : FILLS[el.shading];
  const pts = toPoints(copy.pts);
  if (el.line === "dotted") {
    // The dots ride on a thin band of paper, so a dotted edge still reads
    // clearly around a black or grey shape.
    return (
      <g>
        <polygon points={pts} fill={fill} stroke={PAPER} strokeWidth={5} {...crisp} />
        <polygon points={pts} fill="none" stroke={INK} strokeWidth={3.6} strokeDasharray="0 6.5" {...crisp} />
      </g>
    );
  }
  return (
    <g>
      <polygon points={pts} fill={fill} stroke={INK} strokeWidth={LINE} {...crisp} />
      {el.line === "double" && (
        <polygon points={toPoints(inset(copy.pts, copy.cx, copy.cy, r, 5.5))} fill="none"
          stroke={el.shading === "black" ? PAPER : INK} strokeWidth={1.6} {...crisp} />
      )}
    </g>
  );
}

// fig: the figure. highlight: ids to glow. tags: show letters A, B, C.
// Every figure in one question is cropped to the same square: just big
// enough to hold everything drawn in any of them, with room for the letter
// tags. Positions still compare exactly (the crop is shared), but a lone
// shape is shown large and clear instead of lost in an empty box.
// Pass all of a question's figures here and give the result to each Figure.
const PAD = 34;          // room around the shapes (tags sit just outside them)
const MIN_VIEW = 140;    // never zoom in further than this

export function zoomFor(figs) {
  let x0 = BOX, y0 = BOX, x1 = 0, y1 = 0;
  for (const fig of figs) {
    const L = layout(fig);
    for (const el of fig.elements) {
      for (const c of L[el.id].copies) {
        for (const [x, y] of c.pts) {
          x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
        }
      }
    }
  }
  const size = Math.min(BOX, Math.max(MIN_VIEW, x1 - x0 + 2 * PAD, y1 - y0 + 2 * PAD));
  const clamp = v => Math.max(0, Math.min(BOX - size, v));
  return { x: clamp((x0 + x1) / 2 - size / 2), y: clamp((y0 + y1) / 2 - size / 2), size };
}

export default function Figure({ fig, zoom = zoomFor([fig]), highlight = [], tags = false, className = "", label }) {
  const stripes = `stripes${useId().replace(/:/g, "")}`;
  const L = layout(fig);
  const { x: vx, y: vy, size: vs } = zoom;
  return (
    <svg viewBox={`${vx} ${vy} ${vs} ${vs}`} className={`figure ${className}`} role="img" aria-label={label ?? "figure"}>
      <defs>
        <pattern id={stripes} patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)">
          <rect width="7" height="7" fill={PAPER} />
          <line x1="0" y1="0" x2="0" y2="7" stroke={INK} strokeWidth="2.2" />
        </pattern>
      </defs>
      <rect x={vx + 1} y={vy + 1} width={vs - 2} height={vs - 2} rx={vs * 0.045} fill={PAPER} stroke={KEYLINE} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {highlight.map(id => {
        const l = L[id];
        const xs = l.copies.map(c => c.cx);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const rx = (Math.max(...xs) - Math.min(...xs)) / 2 + l.r + 9;
        return <ellipse key={`h${id}`} cx={cx} cy={l.cy} rx={rx} ry={l.r + 9} className="glow" vectorEffect="non-scaling-stroke" />;
      })}
      {drawOrder(fig).map(el => (
        <g key={el.id}>
          {L[el.id].copies.map((copy, i) => <Shape key={i} el={el} copy={copy} r={L[el.id].r} stripes={stripes} />)}
        </g>
      ))}
      {tags && fig.elements.map(el => {
        const l = L[el.id];
        // Put the letter above the shape, or below if it would fall off the top.
        const top = l.cy - l.r - 16 > 8;
        // A shape inside another gets its letter just outside the big shape;
        // the two shapes of a pair get theirs nudged apart so they don't collide.
        const pair = pairOf(fig, el.id);
        const nudge = el.inside ? (l.cx > 200 ? -50 : 50) : pair ? (pair.a === el.id ? -12 : 12) : 0;
        const x = Math.min(BOX - 14, Math.max(14, l.cx + nudge));
        const y = el.inside ? l.cy : top ? l.cy - l.r - 14 : l.cy + l.r + 14;
        return (
          <g key={`t${el.id}`} className="tag">
            <circle cx={x} cy={y} r="11.5" fill={INK} />
            <text x={x} y={y + 5} textAnchor="middle" fill={PAPER} fontSize="14" fontWeight="800" fontFamily="Nunito, sans-serif">{el.id}</text>
          </g>
        );
      })}
    </svg>
  );
}
