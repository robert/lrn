// Plays one video script: the cloth frame, each scene in turn, the narration,
// sound effects and the subtitles.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { C, CLOTHS, SERIF, SANS } from "./theme.js";
import { rise } from "./anim.js";
import { subtitleChunks } from "./timeline.js";

// Where scene content may draw, in stage coordinates (the paper page).
export const STAGE = { x: 64, y: 56, w: 1920 - 128, h: 1080 - 112 };
export const CONTENT = { top: 120, bottom: 1080 - 112 - 190 }; // below the running head, above subtitles

export function Video({ script, timeline }) {
  const frame = useCurrentFrame();
  const cloth = CLOTHS[script.cloth ?? "spotter"];
  const scene = timeline.scenes.find(s => frame >= s.start && frame < s.start + s.length) ?? timeline.scenes.at(-1);
  const onCloth = scene.bg === "cloth";
  // Series 2 films build their own world: frame "none" drops the book frame,
  // and a script may bring a Backdrop (behind), an Overlay (on top, e.g. film
  // grain) and its own Subtitles renderer.
  const fullBleed = script.frame === "none";
  const beats = timeline.scenes.flatMap(s => s.beats);

  return (
    <AbsoluteFill style={{ background: fullBleed ? "#000" : cloth, fontFamily: SANS }}>
      {!fullBleed && <ClothTexture />}
      {!fullBleed && <PaperStage visible={!onCloth} title={script.title} />}
      {script.Backdrop && <script.Backdrop frame={frame} scene={scene} />}

      {timeline.scenes.map(s => (
        <Sequence key={s.index} from={s.start} durationInFrames={s.length} layout="none">
          <SceneFrame scene={s} push={script.push ?? 0.018} />
        </Sequence>
      ))}

      {beats.map(b => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.length} layout="none">
          {timeline.voiced && <Audio src={staticFile(`audio/${script.id}/${b.id}.wav`)} />}
          {[...(b.sfx ? [{ sfx: b.sfx, at: b.sfxAt ?? 0, volume: b.sfxVolume }] : []), ...(b.sfxs ?? [])].map((x, i) => (
            <Sequence key={i} from={Math.round(x.at * 30)} layout="none">
              <Audio src={staticFile(`sfx/${x.sfx}.wav`)} volume={x.volume ?? 1} />
            </Sequence>
          ))}
        </Sequence>
      ))}

      {script.music && <Music music={script.music} beats={beats} total={timeline.total} />}
      {script.Overlay && <script.Overlay frame={frame} scene={scene} />}

      <Subtitles timeline={timeline} onCloth={onCloth || fullBleed} script={script} />
    </AbsoluteFill>
  );
}

// A looping music bed that dips under speech and fades at both ends.
// music: { src: "music/noir.wav", volume: 0.3, duck: 0.35 }
function Music({ music, beats, total }) {
  const speaking = new Uint8Array(total);
  for (const b of beats) for (let f = b.start; f < Math.min(total, b.start + b.speech + 6); f++) speaking[f] = 1;
  // Smooth the ducking so it breathes rather than jumps.
  const level = new Float32Array(total);
  let v = 1;
  for (let f = 0; f < total; f++) {
    const target = speaking[f] ? (music.duck ?? 0.35) : 1;
    v += (target - v) * (target < v ? 0.25 : 0.05);
    level[f] = v;
  }
  return (
    <Audio src={staticFile(music.src)} loop volume={f => {
      const fade = Math.min(1, f / 30, (total - f) / 45);
      return Math.max(0, (music.volume ?? 0.3) * level[Math.max(0, Math.min(total - 1, Math.floor(f)))] * fade);
    }} />
  );
}

// Woven book cloth, as in the app.
function ClothTexture() {
  return (
    <AbsoluteFill style={{
      backgroundImage: [
        "repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 4px)",
        "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 4px)",
        "radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,0.10), transparent 60%)",
      ].join(","),
    }} />
  );
}

// The paper page, with a double gilt keyline stamped around it and a
// running head in italic like a book.
function PaperStage({ visible, title }) {
  return (
    <div style={{
      position: "absolute", left: STAGE.x, top: STAGE.y, width: STAGE.w, height: STAGE.h,
      opacity: visible ? 1 : 0,
    }}>
      <div style={{
        position: "absolute", inset: -14, borderRadius: 6,
        border: `1.5px solid ${C.gilt}`, opacity: 0.7,
      }} />
      <div style={{
        position: "absolute", inset: -20, borderRadius: 8,
        border: `1px solid ${C.gilt}`, opacity: 0.35,
      }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: 4,
        background: `radial-gradient(130% 110% at 50% 40%, ${C.paper} 60%, #EEF3EF 100%)`,
        boxShadow: "0 24px 60px -30px rgba(0,0,0,0.6)",
      }} />
      <div style={{
        position: "absolute", top: 30, left: 0, right: 0, textAlign: "center",
        fontFamily: SERIF, fontStyle: "italic", fontSize: 30, color: C.soft,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 18,
      }}>
        <Diamond /> {title} <Diamond />
      </div>
    </div>
  );
}

const Diamond = () => (
  <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 0 12 6 6 12 0 6Z" fill={C.gilt} /></svg>
);

// Each scene fades in and out, and gets helpers for timing its beats.
function SceneFrame({ scene, push: pushAmount }) {
  const t = useCurrentFrame(); // frames since the scene started
  const opacity = Math.min(rise(t, 12), 1 - rise(t, 10, scene.length - 10));
  const beatStarts = scene.beats.map(b => b.start - scene.start);
  let beat = 0;
  beatStarts.forEach((s, i) => { if (t >= s) beat = i; });
  const s = {
    t,
    beat,
    // The scene frame at which beat i starts: rise(s.t, 20, s.at(2) + 10)
    // fades something in 10 frames after the third line begins.
    at: i => beatStarts[i],
    // Length of beat i's spoken words, in frames.
    speech: i => scene.beats[i].speech,
    length: scene.length,
  };
  // A very slow push-in keeps every frame alive without drawing attention.
  const push = 1 + (scene.push ?? pushAmount) * (t / Math.max(1, scene.length));
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${push})`, transformOrigin: "50% 45%" }}>
      {scene.render(s)}
    </AbsoluteFill>
  );
}

// Subtitles: the current phrase, with words turning to full ink as they are
// spoken (timed by letters, which tracks the voice closely enough).
function Subtitles({ timeline, onCloth, script }) {
  const frame = useCurrentFrame();
  const beat = timeline.scenes.flatMap(s => s.beats).find(b => frame >= b.start && frame < b.start + b.length);
  if (!beat) return null;
  const local = frame - beat.start;
  const chunks = subtitleChunks(beat.say, beat.speech);
  const chunk = chunks.find(c => local >= c.start && local < c.start + c.length) ?? chunks.at(-1);
  const into = local - chunk.start;
  const shown = rise(local, 8, 0) * (1 - rise(local, 10, beat.length - 10));
  const letters = chunk.words.join(" ").length;
  let count = 0;

  if (script.Subtitles) {
    // Hand the film's own renderer the words, how many are spoken, and who's talking.
    let spoken = 0, seen = 0;
    chunk.words.forEach(w => { if (into >= (seen / letters) * chunk.length) spoken++; seen += w.length + 1; });
    return <script.Subtitles words={chunk.words} spoken={spoken} opacity={shown} who={beat.who} actor={script.cast?.[beat.who]} frame={frame} />;
  }
  if (script.subtitles === "none") return null;
  const ink = onCloth ? C.paper : C.ink;
  const ahead = onCloth ? "rgba(250,251,248,0.45)" : C.faint;
  return (
    <div style={{
      position: "absolute", left: 200, right: 200, bottom: onCloth ? 80 : 104,
      textAlign: "center", opacity: shown,
      fontFamily: SANS, fontWeight: 700, fontSize: 46, lineHeight: 1.3, letterSpacing: 0.2,
    }}>
      {chunk.words.map((w, i) => {
        const at = (count / letters) * chunk.length;
        count += w.length + 1;
        const lit = into >= at;
        return (
          <span key={i} style={{ color: lit ? ink : ahead, transition: "none" }}>
            {w}{i < chunk.words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
}
