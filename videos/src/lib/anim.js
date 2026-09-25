// Animation helpers. Everything is a pure function of frames, so any frame
// can be rendered on its own.
import { interpolate, spring, Easing } from "remotion";
import { FPS } from "./theme.js";

const ease = Easing.bezier(0.2, 0.7, 0.2, 1);

// 0 before `start` frames, rising to 1 over `dur` frames, eased.
export function rise(t, dur = 18, start = 0) {
  return interpolate(t, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
}

// A gentle springy 0 to 1 for things that pop into place.
export function pop(t, start = 0) {
  if (t < start) return 0;
  return spring({ frame: t - start, fps: FPS, config: { damping: 14, stiffness: 140, mass: 0.7 } });
}

// 1 while t is inside [start, end), fading in and out at the edges.
export function window(t, start, end, fade = 10) {
  return Math.min(rise(t, fade, start), 1 - rise(t, fade, end - fade));
}

export const sec = s => Math.round(s * FPS);
export const lerp = (a, b, k) => a + (b - a) * k;
