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

  return (
    <AbsoluteFill style={{ background: cloth, fontFamily: SANS }}>
      <ClothTexture />
      <PaperStage visible={!onCloth} title={script.title} />

      {timeline.scenes.map(s => (
        <Sequence key={s.index} from={s.start} durationInFrames={s.length} layout="none">
          <SceneFrame scene={s} />
        </Sequence>
      ))}

      {timeline.scenes.flatMap(s => s.beats).map(b => (
        <Sequence key={b.id} from={b.start} durationInFrames={b.length} layout="none">
          {timeline.voiced && <Audio src={staticFile(`audio/${script.id}/${b.id}.wav`)} />}
          {b.sfx && (
            <Sequence from={Math.round((b.sfxAt ?? 0) * 30)} layout="none">
              <Audio src={staticFile(`sfx/${b.sfx}.wav`)} />
            </Sequence>
          )}
        </Sequence>
      ))}

      <Subtitles timeline={timeline} onCloth={onCloth} />
    </AbsoluteFill>
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
function SceneFrame({ scene }) {
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
  const push = 1 + 0.018 * (t / Math.max(1, scene.length));
  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${push})`, transformOrigin: "50% 45%" }}>
      {scene.render(s)}
    </AbsoluteFill>
  );
}

// Subtitles: the current phrase, with words turning to full ink as they are
// spoken (timed by letters, which tracks the voice closely enough).
function Subtitles({ timeline, onCloth }) {
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
