// Draws a figure as SVG from its attributes (see figure.js).
import { useId } from "react";
import { BOX, layout, pairOf } from "./figure.js";

const FILLS = { white: "#FFFFFF", grey: "#A7B3AD", black: "#1B2A24" };
const INK = "#1B2A24";

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

// The inner outline of a double line: the same shape, a few pixels smaller.
function shrink(pts, cx, cy, r) {
  const k = Math.max(0.35, (r - 5) / r);
  return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
}

function Shape({ el, copy, r, stripes }) {
  const fill = el.shading === "striped" ? `url(#${stripes})` : FILLS[el.shading];
  const stroke = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" };
  if (el.line === "dotted") Object.assign(stroke, { strokeDasharray: "0.5 5", strokeWidth: 4 });
  return (
    <g>
      <polygon points={toPoints(copy.pts)} fill={fill} {...stroke} />
      {el.line === "double" && (
        <polygon points={toPoints(shrink(copy.pts, copy.cx, copy.cy, r))} fill="none" stroke={el.shading === "black" ? "#FFFFFF" : INK} strokeWidth={2} strokeLinejoin="round" />
      )}
    </g>
  );
}

// fig: the figure. highlight: ids to glow. tags: show letters A, B, C.
// Figures with everything in the middle cell are shown zoomed in, so single
// shapes are big and clear. Every figure in one question must zoom the same
// way, so pass all of them here and give the result to each Figure.
export const zoomFor = figs => figs.every(f => f.elements.every(e => e.cell === 4));

export default function Figure({ fig, zoom = zoomFor([fig]), highlight = [], tags = false, className = "", label }) {
  const stripes = `stripes${useId().replace(/:/g, "")}`;
  const L = layout(fig);
  const [vx, vs] = zoom ? [55, 190] : [0, BOX];
  return (
    <svg viewBox={`${vx} ${vx} ${vs} ${vs}`} className={`figure ${className}`} role="img" aria-label={label ?? "figure"}>
      <defs>
        <pattern id={stripes} patternUnits="userSpaceOnUse" width="9" height="9" patternTransform="rotate(45)">
          <rect width="9" height="9" fill="#FFFFFF" />
          <line x1="0" y1="0" x2="0" y2="9" stroke={INK} strokeWidth="4" />
        </pattern>
      </defs>
      <rect x={vx + 1.5} y={vx + 1.5} width={vs - 3} height={vs - 3} rx="14" fill="#FFFFFF" stroke="#C5D3CC" strokeWidth="3" />
      {highlight.map(id => {
        const l = L[id];
        const xs = l.copies.map(c => c.cx);
        const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
        const rx = (Math.max(...xs) - Math.min(...xs)) / 2 + l.r + 12;
        return <ellipse key={`h${id}`} cx={cx} cy={l.cy} rx={rx} ry={l.r + 12} className="glow" />;
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
            <circle cx={x} cy={y} r="11" fill={INK} />
            <text x={x} y={y + 5} textAnchor="middle" fill="#FFFFFF" fontSize="15" fontWeight="900" fontFamily="Nunito, sans-serif">{el.id}</text>
          </g>
        );
      })}
    </svg>
  );
}
