// Series 6, film 1: "The Pancake Flip". Real 3D (three.js via @remotion/three).
// Paper cut-out flags lie on a wooden table. A flag can slide and spin on the
// table forever and never match its twin; pick it up and turn it over like a
// pancake, and it fits. That is what "flipped" means.
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";
import { rise, pop, lerp } from "../lib/anim.js";

const { fontFamily: ROUND } = loadFredoka("normal", { weights: ["500", "600"], subsets: ["latin"] });
const INK = "#1B2A24";
const GOLD = "#E8B64C";

// ---------- 3D pieces ----------

// The flag outline (a pole with a pennant), in table units.
const FLAG = [[-0.45, -0.9], [-0.25, -0.9], [-0.25, 0.1], [0.75, 0.45], [-0.25, 0.8], [-0.25, 0.9], [-0.45, 0.9]];

function useFlagGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape(FLAG.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: false });
    g.translate(0, 0, -0.02);
    return g;
  }, []);
}

// An ink outline around the flag, drawn on both faces.
function useOutline() {
  return useMemo(() => {
    const pts = [...FLAG, FLAG[0]].map(([x, y]) => new THREE.Vector3(x, y, 0));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
}

// A paper flag lying on the table. spin: turn on the table (degrees).
// flip: 0..1 turning over like a pancake. lift: height above the table.
function PaperFlag({ x = 0, z = 0, spin = 0, flip = 0, lift = 0, colour = "#FBF7EE", flipped = false }) {
  const geo = useFlagGeometry();
  const outline = useOutline();
  return (
    <group position={[x, 0.03 + lift, z]} rotation={[0, (-spin * Math.PI) / 180, 0]}>
      {/* Turning over happens about the flag's own long axis. */}
      <group rotation={[0, 0, flip * Math.PI]}>
        <group rotation={[-Math.PI / 2, 0, 0]} scale={[flipped ? -1 : 1, 1, 1]}>
          <mesh geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial color={colour} roughness={0.85} side={THREE.DoubleSide} />
          </mesh>
          <line geometry={outline} position={[0, 0, 0.022]}><lineBasicMaterial color={INK} linewidth={2} /></line>
          <line geometry={outline} position={[0, 0, -0.022]}><lineBasicMaterial color={INK} linewidth={2} /></line>
        </group>
      </group>
    </group>
  );
}

// A dashed gold outline on the table showing where a flag must fit.
function Ghost({ x = 0, z = 0, spin = 0, flipped = false, opacity = 1 }) {
  const geo = useMemo(() => {
    const pts = [...FLAG, FLAG[0]].map(([px, py]) => new THREE.Vector3(px, py, 0));
    const g = new THREE.BufferGeometry().setFromPoints(pts);
    return g;
  }, []);
  const line = useMemo(() => {
    const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: GOLD, dashSize: 0.08, gapSize: 0.06, transparent: true }));
    l.computeLineDistances();
    return l;
  }, [geo]);
  line.material.opacity = opacity;
  return (
    <group position={[x, 0.012, z]} rotation={[0, (-spin * Math.PI) / 180, 0]}>
      <group rotation={[-Math.PI / 2, 0, 0]} scale={[flipped ? -1 : 1, 1, 1]}>
        <primitive object={line} />
      </group>
    </group>
  );
}

// The wooden table, with planks.
function Table() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#B98B5E" roughness={0.7} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[0, 0.002, -7 + i * 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[30, 0.02]} />
          <meshBasicMaterial color="#8E6440" />
        </mesh>
      ))}
    </group>
  );
}

// A standing mirror at x = mx: silvered glass on a thin frame.
function Mirror({ mx = 0, rise: r = 1 }) {
  return (
    <group position={[mx, lerp(-1.3, 0, r), 0]}>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.04, 1.3, 2.6]} />
        <meshStandardMaterial color="#D9E4E8" metalness={0.9} roughness={0.08} transparent opacity={0.45} />
      </mesh>
      <mesh position={[0, 0.65, 1.32]}><boxGeometry args={[0.08, 1.34, 0.06]} /><meshStandardMaterial color="#6B4A2E" /></mesh>
      <mesh position={[0, 0.65, -1.32]}><boxGeometry args={[0.08, 1.34, 0.06]} /><meshStandardMaterial color="#6B4A2E" /></mesh>
      <mesh position={[0, 1.32, 0]}><boxGeometry args={[0.08, 0.06, 2.7]} /><meshStandardMaterial color="#6B4A2E" /></mesh>
    </group>
  );
}

// Moves the camera each frame: a slow drift around the table.
function Camera({ pos, look = [0, 0, 0] }) {
  const { camera } = useThree();
  camera.position.set(...pos);
  camera.lookAt(...look);
  return null;
}

// The 3D stage used by every scene.
function Stage({ camera, look, children }) {
  return (
    <ThreeCanvas width={1920} height={1080} shadows camera={{ fov: 34, position: camera }} style={{ position: "absolute", inset: 0 }}>
      <Camera pos={camera} look={look} />
      <color attach="background" args={["#2A211B"]} />
      <fog attach="fog" args={["#2A211B", 9, 20]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 7, 4]} intensity={1.6} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
      <pointLight position={[-4, 3, -2]} intensity={8} color="#FFD9A0" />
      <Table />
      {children}
    </ThreeCanvas>
  );
}

// ---------- 2D overlay: titles and captions ----------

function Title({ t, text, sub, at = 0 }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", opacity: rise(t, 24, at) }}>
      <div style={{ fontFamily: ROUND, fontWeight: 600, fontSize: 120, color: "#FFF4DD", textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>{text}</div>
      {sub && <div style={{ fontFamily: ROUND, fontWeight: 500, fontSize: 44, color: GOLD, marginTop: 8 }}>{sub}</div>}
    </div>
  );
}

function Label({ t, at, x, y, text, colour = "#FFF4DD" }) {
  const k = pop(t, at);
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, 0) scale(${lerp(0.7, 1, Math.min(1, k))})`, opacity: Math.min(1, k * 2), fontFamily: ROUND, fontWeight: 600, fontSize: 46, color: colour, textShadow: "0 3px 12px rgba(0,0,0,0.7)", whiteSpace: "nowrap" }}>{text}</div>;
}

function Subtitles({ words, spoken, opacity }) {
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 50, display: "flex", justifyContent: "center", opacity }}>
      <div style={{ maxWidth: 1500, padding: "12px 34px 14px", background: "rgba(20,14,10,0.7)", borderRadius: 18, fontFamily: ROUND, fontWeight: 500, fontSize: 44, lineHeight: 1.25, color: "#FFF4DD", textAlign: "center" }}>
        {words.map((w, i) => <span key={i} style={{ opacity: i < spoken ? 1 : 0.4 }}>{w}{i < words.length - 1 ? " " : ""}</span>)}
      </div>
    </div>
  );
}

// ---------- The film ----------
const L = -2.2, R = 2.2; // the two flags' places on the table

export default {
  id: "s6-pancake",
  order: 501,
  series: 6,
  title: "The Pancake Flip",
  frame: "none",
  push: 0,
  cast: { cook: { name: "", voice: "bf_alice", speed: 0.95 } },
  music: { src: "music/pancake.wav", volume: 0.22, duck: 0.4 },
  Subtitles,
  scenes: [
    {
      beats: [
        { who: "cook", say: "Welcome to the kitchen table. Today we're making the most important move in the whole exam. The pancake flip!", sfxs: [{ sfx: "pancake-flip", at: 5.4 }] },
      ],
      render: s => {
        const orbit = s.t / 90;
        const hop = Math.max(0, Math.sin(Math.min(1, Math.max(0, (s.t - s.at(0) - s.speech(0) * 0.85) / 30)) * Math.PI));
        return (
          <AbsoluteFill>
            <Stage camera={[Math.sin(orbit) * 7, 4.5, Math.cos(orbit) * 7]}>
              <PaperFlag x={0} z={0} lift={hop * 1.4} flip={hop > 0 ? rise(s.t, 30, s.at(0) + s.speech(0) * 0.85) : 0} />
            </Stage>
            <Title t={s.t} text="The Pancake Flip" sub="turned or flipped?" at={10} />
          </AbsoluteFill>
        );
      },
    },
    {
      beats: [
        { who: "cook", say: "Here are two paper flags. They look like twins. But are they really the same?" },
        { who: "cook", say: "On a page, a shape can only do two things. It can slide, and it can spin. Like this.", sfxs: [{ sfx: "pancake-slide", at: 2.6, volume: 0.6 }] },
      ],
      render: s => {
        const spin = rise(s.t, 60, s.at(1) + 40) * 90;
        const slide = rise(s.t, 40, s.at(1) + 10);
        return (
          <AbsoluteFill>
            <Stage camera={[0, 7.5, 5.5]}>
              <PaperFlag x={L} z={0} />
              <PaperFlag x={lerp(R, R + 0.4, slide)} z={lerp(0, -0.3, slide)} spin={spin} flipped />
            </Stage>
            <Label t={s.t} at={20} x={560} y={260} text="one" />
            <Label t={s.t} at={30} x={1360} y={260} text="two" />
          </AbsoluteFill>
        );
      },
    },
    {
      beats: [
        { who: "cook", say: "Let's try to make flag two fit exactly on top of flag one. Slide it over... and spin." },
        { who: "cook", say: "Spin it a bit more. A bit more. All the way round!", sfxs: [{ sfx: "pancake-slide", at: 0.2, volume: 0.5 }] },
        { who: "cook", say: "However much it spins, it never fits. Its flag always points the wrong way." },
      ],
      render: s => {
        const move = rise(s.t, 50, s.at(0) + 30);
        const spin = rise(s.t, s.at(2) - s.at(1), s.at(1)) * 360;
        return (
          <AbsoluteFill>
            <Stage camera={[0, 7.5, 5.2]} look={[-1, 0, 0]}>
              <Ghost x={L} z={0} opacity={0.9} />
              <PaperFlag x={lerp(R, L, move)} z={0} lift={0.02} spin={spin} flipped />
            </Stage>
            <Label t={s.t} at={s.at(2) + 20} x={960} y={200} text="never fits!" colour="#FF9E7A" />
          </AbsoluteFill>
        );
      },
    },
    {
      beats: [
        { who: "cook", say: "But what if we pick it up... and turn it over. Like a pancake!", sfxs: [{ sfx: "pancake-flip", at: 2.6 }] },
        { who: "cook", say: "Now it fits perfectly.", sfxs: [{ sfx: "chime", at: 0.4, volume: 0.6 }] },
        { who: "cook", say: "Flag two wasn't turned. It was flipped. Turned over, like a pancake. And that makes a mirror image." },
      ],
      render: s => {
        const up = rise(s.t, 25, s.at(0) + s.speech(0) * 0.55);
        const over = rise(s.t, 30, s.at(0) + s.speech(0) * 0.7);
        const down = rise(s.t, 20, s.at(0) + s.speech(0) * 0.7 + 30);
        const lift = up * (1 - down) * 1.5;
        return (
          <AbsoluteFill>
            <Stage camera={[3.5, 5, 5.5]} look={[L, 0.3, 0]}>
              <Ghost x={L} z={0} opacity={1 - down * 0.8} />
              <PaperFlag x={L} z={0} lift={0.02 + lift} flip={over} flipped />
            </Stage>
            <Label t={s.t} at={s.at(1)} x={960} y={180} text="a perfect fit!" colour={GOLD} />
          </AbsoluteFill>
        );
      },
    },
    {
      beats: [
        { who: "cook", say: "Here's another way to see it. Stand a mirror next to flag one." },
        { who: "cook", say: "Look at the flag in the mirror. It points the other way. Just like flag two. A mirror image is a flipped shape." },
      ],
      render: s => {
        const m = rise(s.t, 40, s.at(0) + 20);
        return (
          <AbsoluteFill>
            <Stage camera={[-0.6, 3.4, 6.5]} look={[-0.7, 0.4, 0]}>
              <PaperFlag x={-2.3} z={0} />
              <Mirror mx={-1.1} rise={m} />
              {/* The reflection: flag one mirrored in the glass. */}
              <group visible={m > 0.9}><PaperFlag x={0.1} z={0} flipped colour="#E9EEF0" /></group>
              <PaperFlag x={2.6} z={0} flipped />
            </Stage>
            <Label t={s.t} at={s.at(1) + 20} x={1010} y={250} text="in the mirror" colour="#CFE6F0" />
            <Label t={s.t} at={s.at(1) + 50} x={1560} y={250} text="flag two" />
          </AbsoluteFill>
        );
      },
    },
    {
      beats: [
        { who: "cook", say: "In the exam, you can't pick shapes up. They stay flat on the page." },
        { who: "cook", say: "So here's the rule. If a shape can be spun to match, it's only rotated. If it only matches after turning over, it's been flipped." },
      ],
      render: s => (
        <AbsoluteFill>
          <Stage camera={[0, 8, 4.5]}>
            <PaperFlag x={-3} z={0.4} />
            <PaperFlag x={0} z={0.4} spin={90} />
            <PaperFlag x={3} z={0.4} flipped spin={30} />
          </Stage>
          <Label t={s.t} at={s.at(1) + s.speech(1) * 0.3} x={620} y={180} text="spin to match: rotated" />
          <Label t={s.t} at={s.at(1) + s.speech(1) * 0.75} x={1380} y={180} text="turn over: flipped" colour={GOLD} />
        </AbsoluteFill>
      ),
    },
    {
      beats: [
        { who: "cook", say: "Your turn, chef! One of these three flags has been flipped. The other two are only spun. Which one is flipped? Pause if you need more time.", hold: 6,
          sfxs: Array.from({ length: 6 }, (_, i) => ({ sfx: "tick", at: 8.6 + i, volume: 0.8 })) },
        { who: "cook", say: "The middle one! Watch. The others spin into place... but the middle one has to be flipped over.", sfxs: [{ sfx: "pancake-flip", at: 4.6 }, { sfx: "chime", at: 6.2, volume: 0.6 }] },
      ],
      render: s => {
        const reveal = s.t >= s.at(1);
        const spinBack = rise(s.t, 50, s.at(1) + 30);
        const over = rise(s.t, 30, s.at(1) + s.speech(1) * 0.6);
        return (
          <AbsoluteFill>
            <Stage camera={[0, 8, 4.8]}>
              <Ghost x={-3} z={0.2} opacity={reveal ? 1 : 0} />
              <Ghost x={0} z={0.2} opacity={reveal ? 1 : 0} />
              <Ghost x={3} z={0.2} opacity={reveal ? 1 : 0} />
              <PaperFlag x={-3} z={0.2} spin={lerp(130, 0, reveal ? spinBack : 0)} />
              <PaperFlag x={0} z={0.2} spin={lerp(60, 0, reveal ? spinBack : 0)} flipped flip={reveal ? over : 0} lift={reveal ? Math.sin(over * Math.PI) * 1.2 : 0} />
              <PaperFlag x={3} z={0.2} spin={lerp(250, 360, reveal ? spinBack : 0)} />
            </Stage>
            {!reveal && <Label t={s.t} at={20} x={960} y={160} text="which one is flipped?" colour={GOLD} />}
          </AbsoluteFill>
        );
      },
    },
    {
      beats: [
        { who: "cook", say: "Spun is rotated. Turned over is flipped. Nothing gets past you, chef!", sfxs: [{ sfx: "pancake-flip", at: 3.4 }, { sfx: "chime", at: 4.6, volume: 0.7 }] },
      ],
      tail: 1.5,
      render: s => {
        const hop = rise(s.t, 36, s.at(0) + s.speech(0) * 0.6);
        return (
          <AbsoluteFill>
            <Stage camera={[Math.sin(s.t / 80) * 6, 4.5, Math.cos(s.t / 80) * 6]}>
              <PaperFlag x={0} z={0} flip={hop * 2} lift={Math.sin(hop * Math.PI) * 2} />
            </Stage>
            <Title t={s.t} text="Nothing gets past you" sub="spun is rotated, turned over is flipped" at={20} />
          </AbsoluteFill>
        );
      },
    },
  ],
};
