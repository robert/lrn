// Series 7, film 1: "The Clay Workshop". Stop-motion claymation in 3D.
// Professor Hoot (a clay owl) and Wiggle (a clay worm) teach sequences and
// grids with plasticine tiles: follow one change at a time, and in a grid the
// answer must fit across AND down. Everything moves "on twos": poses are held
// for a few frames with a little hand-placed jitter, like real stop-motion.
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { loadFont as loadChewy } from "@remotion/google-fonts/Chewy";
import { rise, pop, lerp } from "../lib/anim.js";

const { fontFamily: CHEWY } = loadChewy("normal", { weights: ["400"], subsets: ["latin"] });

const COL = {
  red: "#D9483B", blue: "#3F7CC9", yellow: "#F2C230", green: "#6DB35A", cream: "#F3E6CC",
  owl: "#8A5A3B", belly: "#E0C08F", beak: "#E8912F", worm: "#7FC15E", tile: "#E9D8B8", tray: "#A77B55",
};
const hash = n => { const x = Math.sin(n * 91.345 + 12.9898) * 43758.5453; return x - Math.floor(x); };

// ---------- Stop-motion time ----------

// Stop-motion runs "on twos and threes": hold each pose for 2.5 frames.
const STEP = 2.5;
const held = t => Math.floor(t / STEP) * STEP;
// No hand-placed wobble: the parent found it distracting, so everything holds still.
const jig = () => 0;

// ---------- Clay materials ----------

// A fingerprinted clay texture, drawn once on a canvas and used as a bump map.
function useClayTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = "#808080";
    g.fillRect(0, 0, 256, 256);
    // Speckle.
    for (let i = 0; i < 4000; i++) {
      g.fillStyle = `rgba(${hash(i) > 0.5 ? 255 : 0},${hash(i) > 0.5 ? 255 : 0},${hash(i) > 0.5 ? 255 : 0},0.08)`;
      g.fillRect(hash(i + 1) * 256, hash(i + 2) * 256, 2, 2);
    }
    // Fingerprint whorls: wobbly concentric ellipses.
    for (let w = 0; w < 5; w++) {
      const cx = hash(w + 10) * 256, cy = hash(w + 20) * 256;
      for (let r = 4; r < 60; r += 4) {
        g.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.15) {
          const rr = r * (1 + 0.08 * Math.sin(a * 3 + w));
          const x = cx + Math.cos(a) * rr * 1.3, y = cy + Math.sin(a) * rr;
          a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
        }
        g.strokeStyle = "rgba(40,40,40,0.25)";
        g.lineWidth = 1.2;
        g.stroke();
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);
}

function Clay({ colour, ...props }) {
  const tex = useClayTexture();
  return <meshStandardMaterial color={colour} roughness={0.93} metalness={0} bumpMap={tex} bumpScale={0.9} {...props} />;
}

// ---------- Clay pieces ----------

// Landing with squash and stretch: falls from above, squashes, settles.
function landing(t, at) {
  const k = held(t) - at;
  if (k < -12) return { y: 3, sy: 1, visible: false };
  if (k < 0) {
    const f = (k + 12) / 12;
    return { y: 3 * (1 - f * f), sy: 1.15, visible: true };
  }
  const sy = 1 - 0.32 * Math.exp(-k / 5) * Math.cos(k / 2.4);
  return { y: 0, sy, visible: true };
}

// One clay piece: a ball, a cube or a cone, in a colour and size.
function Piece({ kind, colour, size = 0.34, x = 0, y = 0, z = 0, t, at = -999, seed = 0 }) {
  const box = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 4, 0.18), []);
  const l = landing(t, at);
  if (!l.visible) return null;
  const sx = 1 / Math.sqrt(l.sy);
  const base = kind === "cube" ? size * 0.9 : size;
  return (
    <group position={[x + jig(t, seed), y + l.y + base * l.sy, z + jig(t, seed + 1)]} rotation={[jig(t, seed + 2, 0.05), jig(t, seed + 3, 0.1), 0]} scale={[sx, l.sy, sx]}>
      {kind === "ball" && <mesh castShadow receiveShadow><sphereGeometry args={[size, 32, 24]} /><Clay colour={colour} /></mesh>}
      {kind === "cube" && <mesh castShadow receiveShadow geometry={box} scale={size * 1.75}><Clay colour={colour} /></mesh>}
      {kind === "cone" && <mesh castShadow receiveShadow position={[0, size * 0.1, 0]}><coneGeometry args={[size * 1.05, size * 2.2, 32]} /><Clay colour={colour} /></mesh>}
    </group>
  );
}

// A flat clay tile for a sequence or grid square.
function Tile({ x, z, t, at = -999, glow = 0, seed = 0, w = 1.25 }) {
  const box = useMemo(() => new RoundedBoxGeometry(w, 0.22, w, 4, 0.08), [w]);
  const l = landing(t, at);
  if (!l.visible) return null;
  return (
    <group position={[x + jig(t, seed, 0.008), l.y + 0.11, z]} scale={[1, l.sy, 1]}>
      <mesh geometry={box} castShadow receiveShadow><Clay colour={glow > 0 ? mixHex(COL.tile, "#FFE27A", glow) : COL.tile} /></mesh>
    </group>
  );
}

// Several balls on one tile, arranged neatly (for counting).
function Balls({ n, colour, x, z, t, at, size = 0.17, seed = 0 }) {
  const spots = [[[0, 0]], [[-0.25, 0], [0.25, 0]], [[-0.3, 0.2], [0.3, 0.2], [0, -0.25]], [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]],
    [[-0.3, -0.3], [0.3, -0.3], [0, 0], [-0.3, 0.3], [0.3, 0.3]]][n - 1];
  return spots.map(([dx, dz], i) => <Piece key={i} kind="ball" colour={colour} size={size} x={x + dx} y={0.22} z={z + dz} t={t} at={at + i * 3} seed={seed + i * 5} />);
}

function mixHex(a, b, k) {
  const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * k).toString(16).padStart(2, "0")).join("");
}

// ---------- The cast ----------

// Professor Hoot: a clay owl in a mortarboard. Blinks; beak opens when talking.
function Owl({ x, z, t, talking, wave = 0 }) {
  const blink = Math.floor(held(t) / 55) % 4 === 0 && held(t) % 55 < 5 ? 0.12 : 1;
  const jaw = talking ? 0.25 + 0.25 * Math.abs(Math.sin(held(t) / 3)) : 0;
  const bob = Math.sin(held(t) / 14) * 0.03;
  return (
    <group position={[x + jig(t, 90), bob, z]} rotation={[0, 0.35 + jig(t, 91, 0.06), 0]}>
      <mesh castShadow position={[0, 0.85, 0]} scale={[1, 1.15, 0.95]}><sphereGeometry args={[0.72, 32, 24]} /><Clay colour={COL.owl} /></mesh>
      <mesh position={[0, 0.72, 0.42]} scale={[1, 1.1, 0.6]}><sphereGeometry args={[0.5, 32, 24]} /><Clay colour={COL.belly} /></mesh>
      {[-1, 1].map(sx => (
        <group key={sx}>
          {/* Eyes, with blinking lids. */}
          <mesh position={[sx * 0.26, 1.22, 0.55]} scale={[1, blink, 1]}><sphereGeometry args={[0.22, 24, 16]} /><Clay colour="#FFFDF4" /></mesh>
          <mesh position={[sx * 0.24, 1.22, 0.74]} scale={[1, blink, 1]}><sphereGeometry args={[0.1, 16, 12]} /><Clay colour="#1A1410" /></mesh>
          {/* Ear tufts. */}
          <mesh castShadow position={[sx * 0.42, 1.62, 0]} rotation={[0, 0, -sx * 0.4]}><coneGeometry args={[0.13, 0.35, 16]} /><Clay colour={COL.owl} /></mesh>
          {/* Wings, one waving. */}
          <mesh castShadow position={[sx * 0.72, 0.8, 0]} rotation={[0, 0, sx * (0.3 + (sx > 0 ? wave : 0))]} scale={[0.35, 0.85, 0.55]}><sphereGeometry args={[0.6, 24, 16]} /><Clay colour={mixHex(COL.owl, "#000000", 0.15)} /></mesh>
        </group>
      ))}
      {/* Beak: upper fixed, lower opens as he talks. */}
      <mesh position={[0, 1.02, 0.72]} rotation={[Math.PI / 2 + 0.3, 0, 0]}><coneGeometry args={[0.1, 0.24, 16]} /><Clay colour={COL.beak} /></mesh>
      <mesh position={[0, 0.94, 0.7]} rotation={[Math.PI / 2 - 0.2 - jaw, 0, 0]}><coneGeometry args={[0.08, 0.16, 16]} /><Clay colour={mixHex(COL.beak, "#000000", 0.2)} /></mesh>
      {/* Mortarboard. */}
      <mesh castShadow position={[0, 1.78, 0]}><boxGeometry args={[0.9, 0.06, 0.9]} /><Clay colour="#2A2A30" /></mesh>
      <mesh position={[0, 1.7, 0]}><cylinderGeometry args={[0.28, 0.3, 0.16, 20]} /><Clay colour="#2A2A30" /></mesh>
      <mesh position={[0.35, 1.62, 0.35]}><sphereGeometry args={[0.05, 12, 8]} /><Clay colour={COL.yellow} /></mesh>
      {/* Feet. */}
      {[-1, 1].map(sx => <mesh key={`f${sx}`} position={[sx * 0.25, 0.06, 0.35]} scale={[1, 0.4, 1.3]}><sphereGeometry args={[0.13, 12, 8]} /><Clay colour={COL.beak} /></mesh>)}
    </group>
  );
}

// Wiggle: a clay worm in a curve of balls, with a head that talks.
function Worm({ x, z, t, talking, excited = false }) {
  const tq = held(t);
  const segs = Array.from({ length: 6 }, (_, i) => {
    const a = i * 0.55;
    const up = Math.max(0, Math.sin(tq / 6 - i * 0.8)) * (excited ? 0.18 : 0.06);
    return [Math.cos(a) * -0.28 * i, 0.22 + up, Math.sin(a) * 0.12 * i];
  });
  const mouth = talking ? 0.4 + 0.6 * Math.abs(Math.sin(tq / 2.6)) : 0.15;
  const blink = Math.floor(tq / 47) % 5 === 0 && tq % 47 < 5 ? 0.12 : 1;
  const head = [0.28, 0.62 + (excited ? Math.abs(Math.sin(tq / 4)) * 0.12 : 0), 0.05];
  return (
    <group position={[x + jig(t, 70), 0, z]} rotation={[0, -0.5 + jig(t, 71, 0.08), 0]}>
      {segs.map((p, i) => (
        <mesh key={i} castShadow position={p}><sphereGeometry args={[0.26 - i * 0.02, 24, 16]} /><Clay colour={i % 2 ? COL.worm : mixHex(COL.worm, "#FFFFFF", 0.12)} /></mesh>
      ))}
      <group position={head}>
        <mesh castShadow><sphereGeometry args={[0.34, 28, 20]} /><Clay colour={COL.worm} /></mesh>
        {[-1, 1].map(sx => (
          <group key={sx}>
            <mesh position={[sx * 0.13, 0.12, 0.27]} scale={[1, blink, 1]}><sphereGeometry args={[0.1, 16, 12]} /><Clay colour="#FFFDF4" /></mesh>
            <mesh position={[sx * 0.12, 0.12, 0.36]} scale={[1, blink, 1]}><sphereGeometry args={[0.05, 12, 8]} /><Clay colour="#1A1410" /></mesh>
            <mesh position={[sx * 0.22, -0.04, 0.24]} scale={[1, 0.6, 0.5]}><sphereGeometry args={[0.06, 12, 8]} /><Clay colour="#F29AA0" /></mesh>
          </group>
        ))}
        <mesh position={[0, -0.12, 0.3]} scale={[1.3, mouth, 0.5]}><sphereGeometry args={[0.08, 16, 12]} /><Clay colour="#5A1E22" /></mesh>
        {/* A little bow on top. */}
        <mesh position={[0.08, 0.34, 0]} rotation={[0, 0, 0.4]} scale={[1, 0.5, 0.5]}><sphereGeometry args={[0.1, 12, 8]} /><Clay colour={COL.red} /></mesh>
      </group>
    </group>
  );
}

// ---------- The set ----------

function Camera({ pos, look }) {
  const { camera } = useThree();
  camera.position.set(...pos);
  camera.lookAt(...look);
  return null;
}

// Felt backdrop, card table, warm studio lamps with a flicker.
function Stage({ t, cam = [0, 5.4, 8.6], look = [0, 0.5, 0], children }) {
  const flicker = 1;
  const felt = useClayTexture();
  return (
    <ThreeCanvas width={1920} height={1080} shadows camera={{ fov: 34, position: cam }} style={{ position: "absolute", inset: 0 }}>
      <Camera pos={[cam[0] + jig(t, 500, 0.02), cam[1], cam[2]]} look={look} />
      <color attach="background" args={["#2E4A3F"]} />
      <ambientLight intensity={0.5 * flicker} />
      <directionalLight position={[4, 8, 5]} intensity={1.7 * flicker} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-radius={6} />
      <pointLight position={[-5, 3, 3]} intensity={10 * flicker} color="#FFC98A" />
      <pointLight position={[5, 2, -3]} intensity={4} color="#9FC8FF" />
      {/* Card table and felt wall. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 20]} /><meshStandardMaterial color="#D9C29B" roughness={1} bumpMap={felt} bumpScale={0.4} /></mesh>
      <mesh position={[0, 5, -4.5]} receiveShadow><planeGeometry args={[30, 12]} /><meshStandardMaterial color="#3E6B5A" roughness={1} bumpMap={felt} bumpScale={1.5} /></mesh>
      {children}
    </ThreeCanvas>
  );
}

// ---------- 2D overlay ----------

// Project a 3D point to screen coordinates for the given camera, for labels.
function toScreen(p, cam = [0, 5.4, 8.6], look = [0, 0.5, 0]) {
  const c = new THREE.PerspectiveCamera(34, 1920 / 1080, 0.1, 100);
  c.position.set(...cam);
  c.lookAt(...look);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...p).project(c);
  return [(v.x + 1) * 960, (1 - v.y) * 540];
}

function Chip({ t, at, x, y, text, colour = "#FFF6E0", bg = "rgba(60,35,20,0.85)", size = 44, rot = -2 }) {
  const k = pop(held(t), at);
  if (k <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${lerp(0.6, 1, Math.min(1, k))})`,
      background: bg, color: colour, fontFamily: CHEWY, fontSize: size, padding: "4px 20px 8px", borderRadius: 16, whiteSpace: "nowrap",
      boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
    }}>{text}</div>
  );
}

function Title({ t, text, sub }) {
  const k = pop(held(t), 6);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center", transform: `scale(${lerp(0.7, 1, Math.min(1, k))}) rotate(${jig(t, 1, 3)}deg)`, opacity: Math.min(1, k * 2) }}>
      <div style={{ fontFamily: CHEWY, fontSize: 150, color: COL.yellow, WebkitTextStroke: "5px #5A3A1E", textShadow: "0 10px 0 #5A3A1E" }}>{text}</div>
      {sub && <div style={{ fontFamily: CHEWY, fontSize: 52, color: "#FFF6E0", marginTop: 6, textShadow: "0 4px 10px rgba(0,0,0,0.5)" }}>{sub}</div>}
    </div>
  );
}

// Subtitles on a scrap of card, with who's talking.
function Subtitles({ words, spoken, opacity, actor }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ maxWidth: 1500, padding: "10px 32px 14px", background: "#FFF6E0", borderRadius: 10, transform: "rotate(-0.6deg)", boxShadow: "0 8px 0 rgba(90,58,30,0.5)", fontFamily: CHEWY, fontSize: 46, lineHeight: 1.2, color: "#3A2614", textAlign: "center" }}>
        {actor && <span style={{ color: actor.colour, marginRight: 14 }}>{actor.name}:</span>}
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.35 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// Who is talking right now in this scene?
const talking = (s, scene, who) => {
  const b = scene.beats[s.beat];
  return b?.who === who && s.t - s.at(s.beat) < s.speech(s.beat);
};

// ---------- The puzzles ----------

// Cameras for the row scene.
const RCAM = [0, 6.8, 8.4], RLOOK = [0, 0.2, 0.4];

// Row: balls count up 1, 2, 3, 4 while the colour swaps red, blue.
const ROW_X = [-3.2, -1.7, -0.2, 1.3, 2.8];
const ROW = [[1, COL.red], [2, COL.blue], [3, COL.red], [4, COL.blue]];
const ROW_OPTS = [{ n: 5, c: COL.blue, label: "a" }, { n: 5, c: COL.red, label: "b", correct: true }, { n: 4, c: COL.red, label: "c" }];
const ROW_OPT_X = [-1.6, 0.4, 2.4];

// Grid: each row one colour (red, yellow, blue), each column one shape
// (ball, cube, cone). The bottom right square is missing: a blue cone.
const GX = [-2.2, -0.85, 0.5];
const GZ = [-1.25, 0.1, 1.45];
const G_COLOURS = [COL.red, COL.yellow, COL.blue];
const G_SHAPES = ["ball", "cube", "cone"];
const G_OPTS = [{ kind: "cube", c: COL.blue, label: "a", why: "row" }, { kind: "cone", c: COL.blue, label: "b", correct: true }, { kind: "cone", c: COL.red, label: "c", why: "col" }];
const OPT_X = 2.6;

// Your turn: across, one, two, three balls; down, small, medium, large.
// The bottom middle is missing: two large balls.
const Y_SIZES = [0.12, 0.17, 0.23];
const Y_OPTS = [{ n: 2, size: 0.12, label: "a" }, { n: 3, size: 0.23, label: "b" }, { n: 2, size: 0.23, label: "c", correct: true }];

const scenes = [];
const cast = {
  hoot: { name: "Hoot", voice: "bm_daniel", speed: 0.92, colour: "#8A5A3B" },
  wiggle: { name: "Wiggle", voice: "bf_lily", speed: 1.05, colour: "#3F8A2E" },
};

// Scene 1: title.
scenes.push({
  beats: [
    { who: "hoot", say: "Welcome, welcome, to the Clay Workshop! I'm Professor Hoot.", sfxs: [{ sfx: "clay-plop", at: 0.3 }, { sfx: "clay-plop", at: 0.7 }, { sfx: "clay-plop", at: 1.1 }] },
    { who: "wiggle", say: "And I'm Wiggle! Today we're learning about sequences and grids!", sfxs: [{ sfx: "clay-squelch", at: 0.2 }] },
  ],
  render(s) {
    const sc = this;
    return (
      <AbsoluteFill>
        <Stage t={s.t} cam={[0, 4.4, 8.2]} look={[0, 0.9, 0]}>
          <Owl x={-2.1} z={0.4} t={s.t} talking={talking(s, sc, "hoot")} wave={Math.max(0, Math.sin(held(s.t) / 6)) * 0.6 * (s.beat === 0 ? 1 : 0)} />
          <Worm x={2.1} z={0.8} t={s.t} talking={talking(s, sc, "wiggle")} excited={s.beat === 1} />
          <Piece kind="ball" colour={COL.red} x={-0.6} z={1.4} t={s.t} at={10} seed={1} />
          <Piece kind="cube" colour={COL.yellow} x={0.1} z={1.7} t={s.t} at={22} seed={2} />
          <Piece kind="cone" colour={COL.blue} x={0.8} z={1.4} t={s.t} at={34} seed={3} />
        </Stage>
        <Title t={s.t} text="The Clay Workshop" sub="sequences and grids" />
      </AbsoluteFill>
    );
  },
});

// Scene 2: what the questions ask.
scenes.push({
  beats: [
    { who: "hoot", say: "In a sequence, the tiles change step by step along a row. You work out which tile comes next." },
    { who: "wiggle", say: "And in a grid, one square is missing. You work out what fills the gap!" },
  ],
  render(s) {
    const sc = this;
    const grid = s.t >= s.at(1);
    return (
      <AbsoluteFill>
        <Stage t={s.t}>
          {!grid && ROW.map(([n, c], i) => <group key={i}><Tile x={ROW_X[i]} z={0} t={s.t} at={6 + i * 8} seed={i} /><Balls n={n} colour={c} x={ROW_X[i]} z={0} t={s.t} at={14 + i * 8} seed={i * 11} /></group>)}
          {!grid && <Tile x={ROW_X[4]} z={0} t={s.t} at={40} seed={9} glow={0.5 + 0.5 * Math.sin(held(s.t) / 5)} />}
          {grid && GZ.map((z, r) => GX.map((x, c) => (
            <group key={`${r}${c}`}>
              <Tile x={x} z={z} t={s.t} at={s.at(1) + (r * 3 + c) * 3} seed={r * 3 + c} glow={r === 2 && c === 2 ? 0.5 + 0.5 * Math.sin(held(s.t) / 5) : 0} />
              {!(r === 2 && c === 2) && <Piece kind={G_SHAPES[c]} colour={G_COLOURS[r]} size={0.3} x={x} y={0.22} z={z} t={s.t} at={s.at(1) + 10 + (r * 3 + c) * 3} seed={r * 7 + c} />}
            </group>
          )))}
          <Owl x={-4.6} z={1.3} t={s.t} talking={talking(s, sc, "hoot")} />
          <Worm x={4.5} z={1.5} t={s.t} talking={talking(s, sc, "wiggle")} />
        </Stage>
        {!grid && <Chip t={s.t} at={50} {...pos(toScreen([ROW_X[4], 0.9, 0]))} text="what comes next?" />}
        {grid && <Chip t={s.t} at={s.at(1) + 40} {...pos(toScreen([GX[2], 0.9, GZ[2]]))} text="what goes here?" />}
      </AbsoluteFill>
    );
  },
});

// Scene 3: the secret.
scenes.push({
  beats: [
    { who: "hoot", say: "Here is my advice. Don't try to look at everything at once." },
    { who: "hoot", say: "Follow just one change at a time. When you have done that, put the changes together." },
    { who: "wiggle", say: "So I follow one change at a time, and then I put them together.", sfxs: [{ sfx: "clay-pop", at: 0.2 }] },
  ],
  render(s) {
    const sc = this;
    return (
      <AbsoluteFill>
        <Stage t={s.t} cam={[0, 3.6, 7]} look={[0, 1, 0]}>
          <Owl x={-1.5} z={0.2} t={s.t} talking={talking(s, sc, "hoot")} wave={s.beat === 1 ? 0.4 : 0} />
          <Worm x={1.6} z={0.6} t={s.t} talking={talking(s, sc, "wiggle")} excited={s.beat === 2} />
        </Stage>
        <Chip t={s.t} at={s.at(1) + s.speech(1) * 0.15} x={960} y={170} text="1. one change at a time" size={64} rot={-2} />
        <Chip t={s.t} at={s.at(1) + s.speech(1) * 0.65} x={960} y={290} text="2. then put them together" size={64} rot={1.5} />
      </AbsoluteFill>
    );
  },
});

// Scene 4: worked example on the row.
scenes.push({
  beats: [
    { who: "hoot", say: "This is a row of clay tiles. First, let's follow just the number of balls." },
    { who: "wiggle", say: "One, two, three, four! It goes up by one each time. So next there'll be five." },
    { who: "hoot", say: "Splendid. Now forget the counting, and follow just the colour." },
    { who: "wiggle", say: "Red, blue, red, blue... so next comes red!" },
    { who: "hoot", say: "Put them together, and you get five red balls. That's answer b.", sfxs: [{ sfx: "clay-plop", at: 4.2 }, { sfx: "chime", at: 4.6, volume: 0.6 }] },
    { who: "hoot", say: "Watch out for answer a. It has five balls, but they're blue. It only follows one of the changes." },
  ],
  render(s) {
    const sc = this;
    const counting = s.beat >= 1 && s.beat < 2;
    const colouring = s.beat === 3;
    const optsIn = s.at(4) + 4;
    const winAt = s.at(4) + s.speech(4) * 0.7;
    return (
      <AbsoluteFill>
        <Stage t={s.t} cam={RCAM} look={RLOOK}>
          {ROW.map(([n, c], i) => (
            <group key={i}>
              <Tile x={ROW_X[i]} z={-0.6} t={s.t} at={-40} seed={i} glow={(counting || colouring) ? 0.35 : 0} />
              <Balls n={n} colour={c} x={ROW_X[i]} z={-0.6} t={s.t} at={-40} seed={i * 11} />
            </group>
          ))}
          <Tile x={ROW_X[4]} z={-0.6} t={s.t} at={-40} seed={9} glow={held(s.t) >= winAt ? 0.8 : 0} />
          {held(s.t) >= winAt && <Balls n={5} colour={COL.red} x={ROW_X[4]} z={-0.6} t={s.t} at={winAt} seed={99} />}
          {ROW_OPTS.map((o, i) => (held(s.t) < winAt || !o.correct) && (
            <group key={i}>
              <Tile x={ROW_OPT_X[i]} z={1.6} t={s.t} at={optsIn + i * 5} seed={20 + i} />
              <Balls n={o.n} colour={o.c} x={ROW_OPT_X[i]} z={1.6} t={s.t} at={optsIn + 6 + i * 5} seed={40 + i * 9} />
            </group>
          ))}
          <Owl x={-4.4} z={0.2} t={s.t} talking={talking(s, sc, "hoot")} />
          <Worm x={4.3} z={0.4} t={s.t} talking={talking(s, sc, "wiggle")} excited={s.beat === 3} />
        </Stage>
        {s.beat >= 1 && ROW.map(([n], i) => <Chip key={i} t={s.t} at={s.at(1) + i * 8} {...pos(toScreen([ROW_X[i], 1.1, -0.6], RCAM, RLOOK))} text={`${n}`} size={52} />)}
        {s.beat >= 1 && <Chip t={s.t} at={s.at(1) + s.speech(1) * 0.8} {...pos(toScreen([ROW_X[4], 1.1, -0.6], RCAM, RLOOK))} text="5" size={52} bg="rgba(200,60,40,0.9)" />}
        {s.beat >= 3 && ["red", "blue", "red", "blue"].map((c, i) => <Chip key={c + i} t={s.t} at={s.at(3) + i * 7} {...pos(toScreen([ROW_X[i], 0.2, 0.25], RCAM, RLOOK))} text={c} size={40} bg={i % 2 ? "rgba(63,124,201,0.95)" : "rgba(217,72,59,0.95)"} />)}
        {s.beat >= 3 && <Chip t={s.t} at={s.at(3) + s.speech(3) * 0.8} {...pos(toScreen([ROW_X[4], 0.2, 0.25], RCAM, RLOOK))} text="red!" size={40} bg="rgba(217,72,59,0.95)" />}
        {ROW_OPTS.map((o, i) => (held(s.t) < winAt || !o.correct) && <Chip key={o.label} t={s.t} at={optsIn + 10 + i * 5} {...pos(toScreen([ROW_OPT_X[i], 0.2, 2.5], RCAM, RLOOK))} text={o.label} size={40} rot={0} />)}
        {s.beat >= 5 && <Chip t={s.t} at={s.at(5) + s.speech(5) * 0.3} {...pos(toScreen([ROW_OPT_X[0] - 1.3, 0.2, 1.6], RCAM, RLOOK))} text="only one change!" colour="#FFE3D6" bg="rgba(150,50,30,0.92)" />}
      </AbsoluteFill>
    );
  },
});

// Scene 5: worked example on the grid, with the one-direction trap.
const GCAM = [0.3, 7.4, 7.6], GLOOK = [0.1, 0, 0.2];
scenes.push({
  beats: [
    { who: "hoot", say: "Now a grid. Read across the rows first. Each row is all one colour." },
    { who: "wiggle", say: "Red, then yellow, then blue. So the bottom row is all blue!" },
    { who: "hoot", say: "Now read down the columns. Each column is all one shape. Ball, cube, cone." },
    { who: "wiggle", say: "Ooh! Ooh! I know! It's the blue cube!", sfxs: [{ sfx: "clay-squelch", at: 1.2 }] },
    { who: "hoot", say: "Not so fast, Wiggle! The blue cube fits the row. But look down the last column. It's all cones." },
    { who: "hoot", say: "The blue cube is only right in one direction. The answer has to fit both ways." },
    { who: "wiggle", say: "Blue for the row, and a cone for the column. The blue cone!", sfxs: [{ sfx: "clay-plop", at: 2.6 }, { sfx: "chime", at: 3.0, volume: 0.6 }] },
  ],
  render(s) {
    const sc = this;
    const rowGlow = r => (s.beat >= 0 && s.beat <= 1 ? (r === (s.beat === 1 ? 2 : Math.floor(held(s.t - s.at(0)) / 20) % 3) ? 0.7 : 0) : 0);
    const colGlow = c => (s.beat === 2 ? (c === Math.floor(held(s.t - s.at(2)) / 22) % 3 ? 0.7 : 0) : s.beat >= 4 && s.beat <= 5 ? (c === 2 ? 0.7 : 0) : 0);
    const cubeUp = s.beat >= 3 && s.beat < 6;
    const winAt = s.at(6) + s.speech(6) * 0.72;
    const placed = held(s.t) >= winAt;
    return (
      <AbsoluteFill>
        <Stage t={s.t} cam={GCAM} look={GLOOK}>
          {GZ.map((z, r) => GX.map((x, c) => {
            const gap = r === 2 && c === 2;
            return (
              <group key={`${r}${c}`}>
                <Tile x={x} z={z} t={s.t} at={-40} seed={r * 3 + c} glow={Math.max(rowGlow(r), colGlow(c), gap && placed ? 0.9 : 0)} />
                {!gap && <Piece kind={G_SHAPES[c]} colour={G_COLOURS[r]} size={0.32} x={x} y={0.22} z={z} t={s.t} at={-40} seed={r * 7 + c} />}
                {gap && cubeUp && <Piece kind="cube" colour={COL.blue} size={0.32} x={x} y={0.22} z={z} t={s.t} at={s.at(3) + 12} seed={77} />}
                {gap && placed && <Piece kind="cone" colour={COL.blue} size={0.32} x={x} y={0.22} z={z} t={s.t} at={winAt} seed={78} />}
              </group>
            );
          }))}
          {G_OPTS.map((o, i) => !(o.correct && placed) && !(o.label === "a" && cubeUp) && (
            <group key={i}>
              <Tile x={OPT_X + 0.9} z={GZ[i]} t={s.t} at={-40} seed={30 + i} />
              <Piece kind={o.kind} colour={o.c} size={0.3} x={OPT_X + 0.9} y={0.22} z={GZ[i]} t={s.t} at={-40} seed={60 + i} />
            </group>
          ))}
          <Owl x={-4.6} z={-1.6} t={s.t} talking={talking(s, sc, "hoot")} wave={s.beat === 4 ? 0.5 : 0} />
          <Worm x={-3.4} z={2.4} t={s.t} talking={talking(s, sc, "wiggle")} excited={s.beat === 3 || s.beat === 6} />
        </Stage>
        {s.beat <= 1 && ["red", "yellow", "blue"].map((c, r) => <Chip key={c} t={s.t} at={s.at(0) + r * 20} {...pos(toScreen([GX[0] - 1.1, 0.3, GZ[r]], GCAM, GLOOK))} text={c} size={38} bg={["rgba(217,72,59,0.95)", "rgba(200,150,20,0.95)", "rgba(63,124,201,0.95)"][r]} />)}
        {s.beat >= 2 && s.beat <= 5 && ["ball", "cube", "cone"].map((k, c) => <Chip key={k} t={s.t} at={s.at(2) + c * 22} {...pos(toScreen([GX[c], 0.3, GZ[0] - 1.05], GCAM, GLOOK))} text={k} size={38} />)}
        {s.beat >= 4 && s.beat <= 5 && <Chip t={s.t} at={s.at(4) + s.speech(4) * 0.4} {...pos(toScreen([GX[2], 1.3, GZ[2]], GCAM, GLOOK))} text="right one way only!" colour="#FFE3D6" bg="rgba(150,50,30,0.92)" />}
        {G_OPTS.map((o, i) => !(o.correct && placed) && !(o.label === "a" && cubeUp) && <Chip key={o.label} t={s.t} at={-40} {...pos(toScreen([OPT_X + 1.9, 0.2, GZ[i]], GCAM, GLOOK))} text={o.label} size={40} rot={0} />)}
        {placed && <Chip t={s.t} at={winAt + 10} x={960} y={120} text="fits across AND down!" size={60} bg="rgba(40,110,60,0.92)" />}
      </AbsoluteFill>
    );
  },
});

// Scene 6: your turn.
const YCAM = [0.3, 7.4, 7.6], YLOOK = [0.1, 0, 0.2];
scenes.push({
  beats: [
    { who: "hoot", say: "Your turn! Across the rows, then down the columns. Which tile fits both ways? Pause if you need more time.", hold: 6,
      sfxs: Array.from({ length: 6 }, (_, i) => ({ sfx: "tick", at: 8.4 + i, volume: 0.8 })) },
    { who: "wiggle", say: "It's c! Two balls, because it's the middle column. And large, because it's the bottom row!", sfxs: [{ sfx: "clay-plop", at: 2.4 }, { sfx: "chime", at: 2.8, volume: 0.6 }] },
    { who: "hoot", say: "Answer a fits the column but not the row. Answer b fits the row but not the column. Only c fits both." },
  ],
  render(s) {
    const sc = this;
    const reveal = s.beat >= 1;
    const winAt = s.at(1) + s.speech(1) * 0.3;
    const placed = held(s.t) >= winAt;
    const left = Math.max(0, 6 - Math.floor((s.t - s.at(0) - s.speech(0)) / 30));
    return (
      <AbsoluteFill>
        <Stage t={s.t} cam={YCAM} look={YLOOK}>
          {GZ.map((z, r) => GX.map((x, c) => {
            const gap = r === 2 && c === 1;
            return (
              <group key={`${r}${c}`}>
                <Tile x={x} z={z} t={s.t} at={4 + (r * 3 + c) * 3} seed={r * 3 + c} glow={gap ? (placed ? 0.9 : 0.4 + 0.4 * Math.sin(held(s.t) / 5)) : 0} />
                {!gap && <Balls n={c + 1} colour={COL.green} size={Y_SIZES[r]} x={x} z={z} t={s.t} at={10 + (r * 3 + c) * 3} seed={r * 13 + c * 5} />}
                {gap && placed && <Balls n={2} colour={COL.green} size={Y_SIZES[2]} x={x} z={z} t={s.t} at={winAt} seed={200} />}
              </group>
            );
          }))}
          {Y_OPTS.map((o, i) => !(o.correct && placed) && (
            <group key={i}>
              <Tile x={OPT_X + 0.9} z={GZ[i]} t={s.t} at={40 + i * 5} seed={30 + i} />
              <Balls n={o.n} colour={COL.green} size={o.size} x={OPT_X + 0.9} z={GZ[i]} t={s.t} at={46 + i * 5} seed={300 + i * 7} />
            </group>
          ))}
          <Owl x={-4.6} z={-1.6} t={s.t} talking={talking(s, sc, "hoot")} />
          <Worm x={-3.4} z={2.4} t={s.t} talking={talking(s, sc, "wiggle")} excited={reveal} />
        </Stage>
        {Y_OPTS.map((o, i) => !(o.correct && placed) && <Chip key={o.label} t={s.t} at={50 + i * 5} {...pos(toScreen([OPT_X + 1.9, 0.2, GZ[i]], YCAM, YLOOK))} text={o.label} size={40} rot={0} />)}
        {!reveal && s.t > s.at(0) + s.speech(0) && (
          <Chip t={s.t} at={s.at(0) + s.speech(0)} x={960} y={110} text={left > 0 ? `${left}` : "time!"} size={90} bg="rgba(60,35,20,0.9)" rot={0} />
        )}
        {!reveal && s.t <= s.at(0) + s.speech(0) && <Chip t={s.t} at={20} x={960} y={110} text="your turn!" size={64} bg="rgba(200,60,40,0.92)" />}
        {placed && <Chip t={s.t} at={winAt + 10} x={960} y={110} text="fits both ways!" size={60} bg="rgba(40,110,60,0.92)" />}
      </AbsoluteFill>
    );
  },
});

// Scene 7: recap.
scenes.push({
  beats: [
    { who: "hoot", say: "So, class, here is what to do. First, follow one change at a time." },
    { who: "hoot", say: "Second, put the changes together." },
    { who: "hoot", say: "Third, in a grid, check across and down. The answer must fit both ways." },
  ],
  render(s) {
    const sc = this;
    return (
      <AbsoluteFill>
        <Stage t={s.t} cam={[0, 3.6, 7]} look={[0, 1, 0]}>
          <Owl x={-2.8} z={0.4} t={s.t} talking={talking(s, sc, "hoot")} wave={0.3} />
          <Worm x={3} z={0.8} t={s.t} talking={false} />
        </Stage>
        <Chip t={s.t} at={s.at(0) + 10} x={1060} y={200} text="1. one change at a time" size={60} rot={-2} />
        <Chip t={s.t} at={s.at(1) + 10} x={1060} y={320} text="2. put them together" size={60} rot={1.5} />
        <Chip t={s.t} at={s.at(2) + 10} x={1060} y={440} text="3. grids: across AND down" size={60} rot={-1} />
      </AbsoluteFill>
    );
  },
});

// Scene 8: close.
scenes.push({
  beats: [
    { who: "wiggle", say: "Now we can solve sequences and grids!", sfxs: [{ sfx: "clay-pop", at: 0.1 }] },
    { who: "hoot", say: "Class dismissed!", sfxs: [{ sfx: "clay-plop", at: 0.3 }, { sfx: "chime", at: 0.8, volume: 0.6 }] },
  ],
  tail: 1.5,
  render(s) {
    const sc = this;
    return (
      <AbsoluteFill>
        <Stage t={s.t} cam={[0, 4.2, 8]} look={[0, 1, 0]}>
          <Owl x={-1.6} z={0.4} t={s.t} talking={talking(s, sc, "hoot")} wave={Math.max(0, Math.sin(held(s.t) / 5)) * 0.8} />
          <Worm x={1.7} z={0.8} t={s.t} talking={talking(s, sc, "wiggle")} excited />
          {[COL.red, COL.yellow, COL.blue, COL.green].map((c, i) => <Piece key={i} kind={["ball", "cube", "cone", "ball"][i]} colour={c} x={-1.5 + i} z={2} size={0.3} t={s.t} at={10 + i * 6} seed={400 + i} />)}
        </Stage>
        <Title t={s.t} text="Class dismissed!" sub="one change at a time" />
      </AbsoluteFill>
    );
  },
});

// Label positions come back as [x, y]; Chip wants {x, y}.
function pos([x, y]) {
  return { x, y };
}

export default {
  id: "s7-clay",
  order: 601,
  series: 7,
  title: "The Clay Workshop",
  frame: "none",
  push: 0,
  cast,
  music: { src: "music/clay.wav", volume: 0.24, duck: 0.4 },
  Subtitles,
  scenes: scenes.map(sc => ({ ...sc, render: s => sc.render.call(sc, s) })),
};
