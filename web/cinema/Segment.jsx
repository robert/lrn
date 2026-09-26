// One scene of a play-along film, as a Remotion composition that the
// in-app Player runs live: the scene's pictures, voices, sound and subtitles.
import { AbsoluteFill, Audio, Sequence, useCurrentFrame } from "remotion";
import { subtitleChunks } from "../../videos/src/lib/timeline.js";
import { rise } from "../../videos/src/lib/anim.js";
import { filmById, timelineFor } from "./films.js";

const ASSETS = "/video-assets";

export default function Segment({ filmId, sceneIndex }) {
  const film = filmById(filmId);
  const scene = timelineFor(film).scenes[sceneIndex];
  const t = useCurrentFrame();
  const beatStarts = scene.beats.map(b => b.start - scene.start);
  let beat = 0;
  beatStarts.forEach((st, i) => { if (t >= st) beat = i; });
  const s = { t, beat, at: i => beatStarts[i], speech: i => scene.beats[i].speech, length: scene.length };

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {film.Backdrop && <film.Backdrop frame={t} scene={scene} />}
      <AbsoluteFill>{scene.render(s)}</AbsoluteFill>
      {scene.beats.map((b, i) => (
        <Sequence key={b.id} from={beatStarts[i]} durationInFrames={b.length} layout="none">
          <Audio src={`${ASSETS}/audio/${film.id}/${b.id}.wav`} />
          {(b.sfxs ?? []).map((x, j) => (
            <Sequence key={j} from={Math.round(x.at * 30)} layout="none">
              <Audio src={`${ASSETS}/sfx/${x.sfx}.wav`} volume={x.volume ?? 1} />
            </Sequence>
          ))}
        </Sequence>
      ))}
      {film.Overlay && <film.Overlay frame={t} scene={scene} />}
      <Caption film={film} scene={scene} t={t} beatStarts={beatStarts} />
    </AbsoluteFill>
  );
}

// The film's own subtitle style, fed the words and how many are spoken.
function Caption({ film, scene, t, beatStarts }) {
  const i = beatStarts.findLastIndex(st => t >= st);
  const b = scene.beats[i];
  if (!b || !film.Subtitles) return null;
  const local = t - beatStarts[i];
  const chunks = subtitleChunks(b.say, b.speech);
  const chunk = chunks.find(c => local >= c.start && local < c.start + c.length) ?? chunks.at(-1);
  const into = local - chunk.start;
  const letters = chunk.words.join(" ").length;
  let spoken = 0, seen = 0;
  chunk.words.forEach(w => { if (into >= (seen / letters) * chunk.length) spoken++; seen += w.length + 1; });
  const opacity = rise(local, 8, 0) * (1 - rise(local, 10, b.length - 10));
  return <film.Subtitles words={chunk.words} spoken={spoken} opacity={opacity} who={b.who} actor={film.cast?.[b.who]} frame={t} />;
}
