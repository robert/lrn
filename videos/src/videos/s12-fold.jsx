// Series 12, film 1: "The Paper Fold". Origami, in real 3D.
// A sheet of washi paper on a slate table. Ink a shape on one half, fold
// along the crease, press, unfold: the ink prints its mirror image. That is
// what "flipped" means. Turning the paper flat never makes the reflection,
// and a symmetrical shape folds exactly onto itself.
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { rise, pop, lerp } from "../lib/anim.js";

const { fontFamily: SERIF } = loadFraunces("normal", { weights: ["400", "600"], subsets: ["latin"] });
loadFraunces("italic", { weights: ["400"], subsets: ["latin"] });

const INK = "#1D1B26";
const VERMILION = "#C0392B";
const GOLD = "#E4B94F";
const W = 2.2; // width of each half of the sheet
const H = 3.0; // height of the sheet

// ---------- Paper ----------

// Washi: a warm base with long pale fibres and faint speckles, drawn once.
function useWashi(tint, fibre, seed) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 1024;
    const g = c.getContext("2d");
    let r = seed;
    const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    g.fillStyle = tint;
    g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 1600; i++) {
      g.strokeStyle = `rgba(${fibre},${0.22 + rnd() * 0.45})`;
      g.lineWidth = 0.4 + rnd() * 1.3;
      const x = rnd() * 1024, y = rnd() * 1024;
      g.beginPath();
      g.moveTo(x, y);
      g.bezierCurveTo(x + rnd() * 80 - 40, y + rnd() * 80 - 40, x + rnd() * 120 - 60, y + rnd() * 120 - 60, x + rnd() * 160 - 80, y + rnd() * 160 - 80);
      g.stroke();
    }
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = `rgba(120,95,70,${rnd() * 0.12})`;
      g.fillRect(rnd() * 1024, rnd() * 1024, 1 + rnd() * 2, 1 + rnd() * 2);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [tint, fibre, seed]);
}

// One half of the sheet: cream washi on the front, a pale rose on the back.
function Half({ x, front, back }) {
  return (
    <group position={[x, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh receiveShadow castShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={front} roughness={0.95} side={THREE.FrontSide} emissive="#3A2C18" emissiveIntensity={0.25} />
      </mesh>
      <mesh>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={back} roughness={0.95} side={THREE.BackSide} />
      </mesh>
    </group>
  );
}

// ---------- Ink shapes (in the paper's own flat 2D coordinates, y up) ----------

const poly = pts => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
const SHAPES = {
  flag: () => poly([[-0.45, -0.9], [-0.25, -0.9], [-0.25, 0.1], [0.75, 0.45], [-0.25, 0.8], [-0.25, 0.9], [-0.45, 0.9]]),
  lshape: () => poly([[-0.45, 0.8], [-0.15, 0.8], [-0.15, -0.35], [0.55, -0.35], [0.55, -0.65], [-0.45, -0.65]]),
  triangle: () => poly([[0, 0.55], [0.55, -0.45], [-0.55, -0.45]]),
  circle: () => { const s = new THREE.Shape(); s.absarc(0, 0, 0.45, 0, Math.PI * 2, false); return s; },
  // The right half of a heart whose middle runs along x = 0.
  heartRight: () => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.95);
    s.bezierCurveTo(0.7, -0.35, 1.25, 0.35, 0.72, 0.82);
    s.bezierCurveTo(0.42, 1.07, 0.1, 0.95, 0, 0.62);
    s.lineTo(0, -0.95);
    return s;
  },
};

// An inked shape lying on the paper at paper position (px, pz), facing up.
// mirror flips it left to right (for the printed copy).
function Ink({ kind, px = 0, pz = 0, size = 1, colour = INK, opacity = 1, lift = 0.0015, mirror = false, rot = 0 }) {
  const geo = useMemo(() => new THREE.ShapeGeometry(SHAPES[kind](), 48), [kind]);
  if (opacity <= 0.001) return null;
  return (
    <group position={[px, lift, pz]} rotation={[-Math.PI / 2, 0, (rot * Math.PI) / 180]} scale={[mirror ? -size : size, size, 1]}>
      <mesh geometry={geo}>
        <meshBasicMaterial color={colour} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

// The whole sheet. fold: 0 flat, 1 right half folded over onto the left.
// right: shapes painted on the right half. left: shapes on the left half.
function Sheet({ fold = 0, right = [], left = [], crease = 0 }) {
  const front = useWashi("#F1E3C8", "255,252,244", 7);
  const back = useWashi("#E9C9C4", "255,240,240", 13);
  return (
    <group>
      <Half x={-W / 2} front={front} back={back} />
      {left.map((s, i) => <Ink key={i} {...s} />)}
      {/* The right half turns about the crease, which runs along z at x = 0. */}
      <group rotation={[0, 0, fold * Math.PI * 0.998]}>
        <group position={[0, -0.004, 0]}>
          <Half x={W / 2} front={front} back={back} />
          {right.map((s, i) => <Ink key={i} {...s} lift={0.0012} />)}
          {/* Washi is thin: once folded over, the ink shows faintly through the back. */}
          {fold > 0.02 && right.map((s, i) => <Ink key={`b${i}`} {...s} lift={-0.0024} opacity={(s.opacity ?? 1) * 0.42 * Math.min(1, fold * 1.3)} />)}
        </group>
      </group>
      {crease > 0 && (
        <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.012, H]} />
          <meshBasicMaterial color="#B9A98F" transparent opacity={0.8 * crease} />
        </mesh>
      )}
    </group>
  );
}

// A gold outline ring on the paper to point something out.
function Ring({ px, pz, r = 0.75, opacity = 1 }) {
  if (opacity <= 0.01) return null;
  return (
    <mesh position={[px, 0.004, pz]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[r, r + 0.035, 64]} />
      <meshBasicMaterial color={GOLD} transparent opacity={opacity} />
    </mesh>
  );
}

function Camera({ pos, look = [0, 0, 0] }) {
  const { camera } = useThree();
  camera.position.set(...pos);
  camera.lookAt(...look);
  return null;
}

// Slate table, soft window light from one side.
function Stage({ camera, look, children }) {
  return (
    <ThreeCanvas width={1920} height={1080} shadows camera={{ fov: 32, position: camera }} style={{ position: "absolute", inset: 0 }}>
      <Camera pos={camera} look={look} />
      <color attach="background" args={["#15171B"]} />
      <fog attach="fog" args={["#15171B", 8, 16]} />
      <ambientLight intensity={1.05} />
      <hemisphereLight args={["#FFF4E2", "#2C3036", 0.6]} />
      <directionalLight position={[-3, 6, 3]} intensity={2.3} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.0004} />
      <pointLight position={[4, 3, -2]} intensity={6} color="#FFE2C0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#2C3036" roughness={0.9} />
      </mesh>
      {children}
    </ThreeCanvas>
  );
}

// ---------- 2D overlays ----------

function Title({ t, text, sub, at = 0, top = 110 }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: rise(t, 30, at) }}>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 112, color: "#F5EEDF", letterSpacing: 1, textShadow: "0 0 24px rgba(10,10,14,0.95), 0 4px 30px rgba(0,0,0,0.8)" }}>{text}</div>
      {sub && <div style={{ display: "inline-block", fontFamily: SERIF, fontStyle: "italic", fontSize: 44, color: GOLD, marginTop: 10, padding: "4px 22px 8px", background: "rgba(14,14,18,0.72)", borderRadius: 6 }}>{sub}</div>}
    </div>
  );
}

function Label({ t, at, x, y, text, colour = "#F5EEDF", out }) {
  const k = pop(t, at) * (out !== undefined ? 1 - rise(t, 12, out) : 1);
  if (k <= 0.001) return null;
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, 0) scale(${lerp(0.8, 1, Math.min(1, k))})`, opacity: Math.min(1, k * 2), fontFamily: SERIF, fontStyle: "italic", fontSize: 50, color: colour, textShadow: "0 3px 14px rgba(0,0,0,0.8)", whiteSpace: "nowrap" }}>{text}</div>;
}

// A hanko-style seal stamped at the end.
function Seal({ t, at, x, y }) {
  const k = pop(t, at);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x - 90, top: y - 90, width: 180, height: 180, borderRadius: 16, border: `7px solid ${VERMILION}`, background: "rgba(245,238,223,0.08)", color: VERMILION, fontFamily: SERIF, fontWeight: 600, fontSize: 34, lineHeight: 1.05, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", transform: `scale(${lerp(1.6, 1, Math.min(1, k))}) rotate(-6deg)`, opacity: Math.min(1, k * 1.5) }}>
      nothing<br />gets<br />past
    </div>
  );
}

// A calm countdown: a thin ring that empties.
function Countdown({ t, at, seconds = 6, x = 1680, y = 190 }) {
  if (t < at) return null;
  const k = Math.min(1, (t - at) / (seconds * 30));
  const left = Math.ceil(seconds * (1 - k));
  return (
    <div style={{ position: "absolute", left: x - 70, top: y - 70, width: 140, height: 140, opacity: 1 - rise(t, 10, at + seconds * 30) }}>
      <svg width="140" height="140"><circle cx="70" cy="70" r="60" fill="rgba(0,0,0,0.35)" stroke="rgba(245,238,223,0.25)" strokeWidth="6" />
        <circle cx="70" cy="70" r="60" fill="none" stroke={GOLD} strokeWidth="6" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={k} transform="rotate(-90 70 70)" /></svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontSize: 60, color: "#F5EEDF" }}>{left > 0 ? left : ""}</div>
    </div>
  );
}

function Subtitles({ words, spoken, opacity }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 52, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ maxWidth: 1500, padding: "12px 34px 14px", background: "rgba(12,13,16,0.72)", borderRadius: 6, borderBottom: `2px solid ${VERMILION}`, fontFamily: SERIF, fontSize: 44, lineHeight: 1.28, color: "#F5EEDF", textAlign: "center" }}>
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.38 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// ---------- Timing helpers ----------

// Fold over, hold pressed, and unfold, starting at frame `at`.
function foldCycle(t, at, hold = 30) {
  return rise(t, 36, at) - rise(t, 36, at + 36 + hold);
}
// 0 until the ink has been pressed (the fold is flat), then 1.
const printed = (t, at) => rise(t, 8, at + 34);

// The flag sits in the middle of the right half.
const FX = W / 2;

// ---------- The film ----------
export default {
  id: "s12-fold",
  order: 1101,
  series: 12,
  title: "The Paper Fold",
  frame: "none",
  push: 0,
  cast: { teller: { name: "", voice: "bf_isabella", speed: 0.9 } },
  music: { src: "music/fold.wav", volume: 0.28, duck: 0.45 },
  Subtitles,
  scenes: [
    // Title: the camera settles over a blank sheet.
    {
      beats: [
        { who: "teller", say: "A sheet of paper. A little ink. And one careful fold. That's all we need to understand a mirror image." },
      ],
      render: s => {
        const k = rise(s.t, s.length - 10, 0);
        return (
          <AbsoluteFill>
            <Stage camera={[lerp(-3.5, 0, k), lerp(3.2, 5.6, k), lerp(5.5, 3.6, k)]} look={[0, 0, 0.1]}>
              <Sheet />
            </Stage>
            <Title t={s.t} text="The Paper Fold" sub="what a mirror image really is" at={14} />
          </AbsoluteFill>
        );
      },
    },

    // The flag: paint, fold, press, unfold. A reflection has been printed.
    {
      beats: [
        { who: "teller", say: "On the right half, we paint a flag, still wet with ink." },
        { who: "teller", say: "Now fold the paper along the middle, right over... and press it flat.", sfxs: [{ sfx: "fold-fold", at: 1.2 }, { sfx: "fold-press", at: 2.6 }, { sfx: "fold-crease", at: 2.7, volume: 0.6 }] },
        { who: "teller", say: "Carefully unfold it... and look.", sfxs: [{ sfx: "fold-unfold", at: 0.1 }] },
        { who: "teller", say: "The wet ink has printed a second flag. But this one points the other way. It's a mirror image. That's what flipped means.", sfxs: [{ sfx: "fold-bell", at: 0.4, volume: 0.6 }] },
      ],
      render: s => {
        const paint = rise(s.t, 40, s.at(0) + 10);
        const foldStart = s.at(1) + 30;
        const fold = rise(s.t, 40, foldStart) - rise(s.t, 44, s.at(2) + 6);
        const print = rise(s.t, 8, foldStart + 40);
        const lowCam = s.t >= s.at(1) && s.t < s.at(3);
        return (
          <AbsoluteFill>
            <Stage camera={lowCam ? [2.2, 3.4, 4.6] : [0, 5.4, 3.4]} look={[0, 0.2, 0.1]}>
              <Sheet fold={fold} crease={print}
                right={[{ kind: "flag", px: FX, size: 1.05, opacity: paint }]}
                left={[{ kind: "flag", px: -FX, size: 1.05, mirror: true, opacity: print, colour: "#2A2733" }]} />
            </Stage>
            <Label t={s.t} at={s.at(3) + s.speech(3) * 0.3} x={560} y={180} text="the print" colour={GOLD} />
            <Label t={s.t} at={s.at(3) + s.speech(3) * 0.3} x={1360} y={180} text="the flag" />
          </AbsoluteFill>
        );
      },
    },

    // Turning can't do it: spin a copy of the flag flat, and it never matches.
    {
      beats: [
        { who: "teller", say: "Could we make that printed flag just by turning, flat on the table, without folding?" },
        { who: "teller", say: "Here's a paper flag. Turn it, and turn it, all the way round. It never fits the print.", sfxs: [{ sfx: "fold-unfold", at: 1.5, volume: 0.5 }] },
        { who: "teller", say: "Turning only spins a shape round. To get its mirror image, you have to flip it. Just like folding the paper over." },
      ],
      render: s => {
        const spin = rise(s.t, s.at(2) - s.at(1) - 10, s.at(1) + 10) * 360;
        const card = rise(s.t, 20, s.at(1));
        return (
          <AbsoluteFill>
            <Stage camera={[-FX, 5.2, 2.6]} look={[-FX, 0, 0]}>
              <Sheet crease={1}
                right={[{ kind: "flag", px: FX, size: 1.05 }]}
                left={[{ kind: "flag", px: -FX, size: 1.05, mirror: true, colour: "#2A2733" }]} />
              {/* A cut-out copy of the original flag, turning above the print. */}
              <group position={[-FX, 0.18 * card, 0]} rotation={[0, (-spin * Math.PI) / 180, 0]}>
                <Ink kind="flag" size={1.05} colour={VERMILION} opacity={0.72 * card} lift={0} />
              </group>
              <Ring px={-FX} pz={0} r={1.25} opacity={0.6 * rise(s.t, 20, s.at(1) + s.speech(1) * 0.7)} />
            </Stage>
            <Label t={s.t} at={s.at(1) + s.speech(1) * 0.75} x={960} y={170} text="never fits" colour="#F0A08A" out={s.at(2) + 20} />
          </AbsoluteFill>
        );
      },
    },

    // The heart: painted across the crease, it folds exactly onto itself.
    {
      beats: [
        { who: "teller", say: "A fresh sheet. This time we paint a heart, right across the middle of the fold." },
        { who: "teller", say: "Fold it over... and look how it lands. Every part of the heart lands exactly on itself.", sfxs: [{ sfx: "fold-fold", at: 0.8 }, { sfx: "fold-press", at: 2.2 }] },
        { who: "teller", say: "That's called being symmetrical. So if you flip a heart, it looks exactly the same.", sfxs: [{ sfx: "fold-bell", at: 1.0, volume: 0.5 }] },
        { who: "teller", say: "Flipping only shows up on shapes that aren't symmetrical. Shapes like flags, and L shapes. Those are the ones the exam uses.", sfxs: [{ sfx: "fold-unfold", at: 0.3, volume: 0.6 }] },
      ],
      render: s => {
        const paint = rise(s.t, 40, s.at(0) + 20);
        const fold = rise(s.t, 40, s.at(1) + 20) - rise(s.t, 44, s.at(3));
        return (
          <AbsoluteFill>
            <Stage camera={s.t < s.at(3) ? [1.6, 3.6, 4.4] : [0, 5.4, 3.3]} look={[0, 0.2, 0.1]}>
              <Sheet fold={fold} crease={rise(s.t, 10, s.at(1) + 60)}
                right={[{ kind: "heartRight", px: 0, size: 1.1, colour: VERMILION, opacity: paint }]}
                left={[{ kind: "heartRight", px: 0, size: 1.1, mirror: true, colour: VERMILION, opacity: paint }]} />
              <Ring px={-0.45} pz={0} r={1.05} opacity={rise(s.t, 20, s.at(2)) * (1 - rise(s.t, 12, s.at(3)))} />
            </Stage>
            <Label t={s.t} at={s.at(1) + s.speech(1) * 0.6} x={960} y={170} text="it lands on itself" colour={GOLD} out={s.at(3)} />
            <Label t={s.t} at={s.at(3) + s.speech(3) * 0.45} x={960} y={170} text="symmetrical shapes don't change" />
          </AbsoluteFill>
        );
      },
    },

    // Your turn: which would look different if it were flipped?
    {
      beats: [
        { who: "teller", say: "Your turn. Here are three shapes: an L, a circle, and a triangle. Which one would look different if it were flipped? Pause if you need more time.", hold: 6,
          sfxs: Array.from({ length: 6 }, (_, i) => ({ sfx: "tick", at: 9.3 + i, volume: 0.6 })) },
        { who: "teller", say: "Let's fold and see.", sfxs: [{ sfx: "fold-fold", at: 0.6 }, { sfx: "fold-press", at: 2.0 }, { sfx: "fold-unfold", at: 3.2 }] },
        { who: "teller", say: "The circle and the triangle print exactly the same. They're symmetrical. But the L has turned the other way round. The L is the one that changes when it's flipped.", sfxs: [{ sfx: "fold-bell", at: 5.0, volume: 0.6 }] },
      ],
      render: s => {
        const f = foldCycle(s.t, s.at(1) + 10, 24);
        const print = rise(s.t, 8, s.at(1) + 44);
        const right = [
          { kind: "lshape", px: FX, pz: -0.95, size: 0.62 },
          { kind: "circle", px: FX, pz: 0, size: 0.72 },
          { kind: "triangle", px: FX, pz: 0.95, size: 0.72 },
        ];
        const left = right.map(r => ({ ...r, px: -r.px, mirror: true, opacity: print, colour: "#2A2733" }));
        return (
          <AbsoluteFill>
            <Stage camera={s.t >= s.at(1) && s.t < s.at(2) ? [2.2, 3.6, 4.8] : [0, 6.0, 2.9]} look={[0, 0.15, 0]}>
              <Sheet fold={f} crease={print} right={right} left={left} />
              <Ring px={-FX} pz={-0.95} r={0.5} opacity={rise(s.t, 20, s.at(2) + s.speech(2) * 0.6)} />
              <Ring px={FX} pz={-0.95} r={0.5} opacity={rise(s.t, 20, s.at(2) + s.speech(2) * 0.6)} />
            </Stage>
            <Countdown t={s.t} at={s.at(0) + s.speech(0)} seconds={6} />
            <Label t={s.t} at={s.at(2) + s.speech(2) * 0.65} x={960} y={150} text="the L changes" colour={GOLD} />
          </AbsoluteFill>
        );
      },
    },

    // Recap and close.
    {
      beats: [
        { who: "teller", say: "So remember. A flip is a fold. Fold along a line, and you get the mirror image." },
        { who: "teller", say: "Turning can never make a mirror image. And symmetrical shapes land on themselves, so flipping them changes nothing." },
        { who: "teller", say: "Watch for flags, and L shapes, and arrows with a bend. When they face the other way, they've been flipped. And nothing gets past you.", sfxs: [{ sfx: "fold-bell", at: 6.0, volume: 0.6 }] },
      ],
      tail: 1.6,
      render: s => {
        const orbit = s.t / 200;
        return (
          <AbsoluteFill>
            <Stage camera={[Math.sin(orbit) * 1.2, 5.6, 3.6 + Math.cos(orbit) * 0.3]} look={[0, 0, 0.1]}>
              <Sheet crease={1}
                right={[{ kind: "flag", px: FX, size: 1.05 }]}
                left={[{ kind: "flag", px: -FX, size: 1.05, mirror: true, colour: "#2A2733" }]} />
            </Stage>
            <Title t={s.t} text="A flip is a fold" sub="turning never makes a mirror image" at={10} top={80} />
            <Seal t={s.t} at={s.at(2) + s.speech(2) * 0.85} x={1620} y={800} />
          </AbsoluteFill>
        );
      },
    },
  ],
};
