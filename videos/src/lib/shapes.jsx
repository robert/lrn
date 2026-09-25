// Ink-drawn shapes for the puzzles, generated from explicit attributes.
// <Shape kind="triangle" x={0} y={0} r={60} fill="black" line="solid" rot={0} flip={false} draw={1} />
// `draw` runs 0 to 1: the outline is inked on first, then the fill settles in.
import React from "react";
import { useId } from "react";
import { C } from "./theme.js";

const TAU = Math.PI * 2;
const STROKE = 3.2;

// Regular polygon with n corners, first corner pointing up.
function polygon(n, r, turn = 0) {
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + turn + (i * TAU) / n;
    return [r * Math.cos(a), r * Math.sin(a)];
  });
}
function star(points, r, inner = 0.45) {
  return Array.from({ length: points * 2 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const k = i % 2 ? r * inner : r;
    return [k * Math.cos(a), k * Math.sin(a)];
  });
}
const toPath = pts => "M" + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(" L") + " Z";
const scale = (pts, sx, sy = sx) => pts.map(([x, y]) => [x * sx, y * sy]);

// Each kind returns one or more closed paths (the first is the silhouette).
const KINDS = {
  circle: r => [`M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`],
  square: r => [toPath(scale([[-1, -1], [1, -1], [1, 1], [-1, 1]], r * 0.86))],
  rectangle: r => [toPath([[-r, -r * 0.62], [r, -r * 0.62], [r, r * 0.62], [-r, r * 0.62]])],
  triangle: r => [toPath(polygon(3, r * 1.08).map(([x, y]) => [x, y + r * 0.2]))],
  rtriangle: r => [toPath(scale([[-0.85, -0.95], [0.9, 0.85], [-0.85, 0.85]], r))],
  diamond: r => [toPath([[0, -r], [r * 0.75, 0], [0, r], [-r * 0.75, 0]])],
  pentagon: r => [toPath(polygon(5, r))],
  hexagon: r => [toPath(polygon(6, r, Math.PI / 6))],
  octagon: r => [toPath(polygon(8, r, Math.PI / 8))],
  star: (r, o) => [toPath(star(o.points ?? 5, r, o.inner ?? 0.45))],
  heart: r => [
    `M 0 ${r * 0.9} C ${-r * 1.25} ${r * 0.05} ${-r * 0.95} ${-r * 1.05} 0 ${-r * 0.42} ` +
    `C ${r * 0.95} ${-r * 1.05} ${r * 1.25} ${r * 0.05} 0 ${r * 0.9} Z`,
  ],
  // A block arrow pointing right.
  arrow: r => [toPath(scale([[-1, -0.28], [0.2, -0.28], [0.2, -0.62], [1, 0], [0.2, 0.62], [0.2, 0.28], [-1, 0.28]], r))],
  cross: r => [toPath(scale([[-0.3, -1], [0.3, -1], [0.3, -0.3], [1, -0.3], [1, 0.3], [0.3, 0.3], [0.3, 1], [-0.3, 1], [-0.3, 0.3], [-1, 0.3], [-1, -0.3], [-0.3, -0.3]], r * 0.9))],
  // Chiral shapes: their mirror image is never just a rotation.
  flag: r => [toPath(scale([[-0.55, -0.95], [0.75, -0.55], [-0.35, -0.15], [-0.35, 0.95], [-0.55, 0.95]], r))],
  lshape: r => [toPath(scale([[-0.6, -0.95], [-0.2, -0.95], [-0.2, 0.45], [0.85, 0.45], [0.85, 0.9], [-0.6, 0.9]], r))],
  // A circle with one quarter missing, like a pie with a slice gone.
  pie: r => [`M 0 0 L 0 ${-r} A ${r} ${r} 0 1 0 ${r} 0 Z`],
  quarter: r => [`M ${-r * 0.5} ${r * 0.5} L ${-r * 0.5} ${-r * 0.8} A ${r * 1.3} ${r * 1.3} 0 0 1 ${r * 0.8} ${r * 0.5} Z`],
  semicircle: r => [`M ${-r * 0.35} ${-r} A ${r} ${r} 0 0 1 ${-r * 0.35} ${r} Z`],
  crescent: r => [`M ${r * 0.2} ${-r} A ${r} ${r} 0 1 0 ${r * 0.2} ${r} A ${r * 0.72} ${r * 0.72} 0 1 1 ${r * 0.2} ${-r} Z`],
  // A little house: square body, triangle roof (roof is drawn as a second part).
  house: r => [
    toPath([[-r * 0.7, -r * 0.1], [r * 0.7, -r * 0.1], [r * 0.7, r], [-r * 0.7, r]]),
    toPath([[-r * 0.8, -r * 0.1], [0, -r], [r * 0.8, -r * 0.1]]),
  ],
};

export const SHAPE_KINDS = Object.keys(KINDS);

// Outline pieces for a 3D cylinder and cube, drawn as flat line art.
const SOLIDS = {
  cylinder: r => ({
    body: `M ${-r * 0.75} ${-r * 0.7} L ${-r * 0.75} ${r * 0.7} A ${r * 0.75} ${r * 0.28} 0 0 0 ${r * 0.75} ${r * 0.7} L ${r * 0.75} ${-r * 0.7}`,
    top: `M ${-r * 0.75} ${-r * 0.7} A ${r * 0.75} ${r * 0.28} 0 1 0 ${r * 0.75} ${-r * 0.7} A ${r * 0.75} ${r * 0.28} 0 1 0 ${-r * 0.75} ${-r * 0.7} Z`,
    face: [0, r * 0.05],
  }),
  cube: r => ({
    body: toPath([[-r * 0.85, -r * 0.5], [r * 0.5, -r * 0.5], [r * 0.5, r * 0.85], [-r * 0.85, r * 0.85]]),
    top: `M ${-r * 0.85} ${-r * 0.5} L ${-r * 0.5} ${-r * 0.85} L ${r * 0.85} ${-r * 0.85} L ${r * 0.85} ${r * 0.5} L ${r * 0.5} ${r * 0.85} M ${r * 0.5} ${-r * 0.5} L ${r * 0.85} ${-r * 0.85}`,
    face: [-r * 0.17, r * 0.17],
  }),
};

const FILL = { white: C.white, grey: C.grey, black: C.ink, none: "none" };

function strokeStyle(line, draw) {
  if (line === "dotted") return { strokeDasharray: "0.1 10", strokeLinecap: "round", strokeWidth: STROKE * 1.3, opacity: Math.min(1, draw * 1.6) };
  if (line === "dashed") return { strokeDasharray: "12 8", opacity: Math.min(1, draw * 1.6) };
  // Solid lines are inked on along their length.
  return { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - Math.min(1, draw * 1.4) };
}

export function Shape({
  kind, x = 0, y = 0, r = 60, fill = "white", line = "solid", rot = 0, flip = false,
  draw = 1, points, inner, inside, insideFill = "black", opacity = 1, ink = C.ink,
}) {
  const hatch = useId().replace(/:/g, "");
  const fillOpacity = Math.max(0, Math.min(1, (draw - 0.45) / 0.4));
  const fillPaint = fill === "striped" ? `url(#${hatch})` : FILL[fill];
  const transform = `translate(${x} ${y}) rotate(${rot}) scale(${flip ? -1 : 1} 1)`;

  if (SOLIDS[kind]) {
    const s = SOLIDS[kind](r);
    const stroke = { stroke: ink, strokeWidth: STROKE, fill: "none", strokeLinejoin: "round", ...strokeStyle(line, draw) };
    return (
      <g transform={transform} opacity={opacity}>
        <path d={s.body} fill={C.white} opacity={fillOpacity} />
        <path d={s.top} fill={C.white} opacity={fillOpacity} />
        <path d={s.body} {...stroke} />
        <path d={s.top} {...stroke} />
        {inside && <Shape kind={inside} x={s.face[0]} y={s.face[1]} r={r * 0.22} fill={insideFill} draw={draw} />}
      </g>
    );
  }

  const parts = KINDS[kind]?.(r, { points, inner });
  if (!parts) throw new Error(`Unknown shape kind "${kind}"`);
  const common = { stroke: ink, strokeWidth: STROKE, strokeLinejoin: "round" };
  return (
    <g transform={transform} opacity={opacity}>
      <defs>
        <pattern id={hatch} patternUnits="userSpaceOnUse" width="11" height="11" patternTransform="rotate(45)">
          <rect width="11" height="11" fill={C.white} />
          <line x1="0" y1="0" x2="0" y2="11" stroke={ink} strokeWidth="2.2" />
        </pattern>
      </defs>
      {parts.map((d, i) => (
        <path key={`f${i}`} d={d} fill={fillPaint} opacity={fillOpacity} stroke="none" />
      ))}
      {parts.map((d, i) => (
        <path key={`s${i}`} d={d} fill="none" {...common} {...strokeStyle(line, draw)} />
      ))}
      {line === "double" && parts.map((d, i) => (
        <path key={`d${i}`} d={d} fill="none" {...common} strokeWidth={STROKE * 0.8}
          transform="scale(0.8)" {...strokeStyle("solid", draw)} />
      ))}
      {inside && <Shape kind={inside} r={r * 0.3} fill={insideFill} draw={draw} />}
    </g>
  );
}
