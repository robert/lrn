// A play-along film: it runs scene by scene in a live Player. When a scene
// ends in a choice, the film waits for him to tap the answer on the picture.
// A right tap carries the story on; a slip plays a short scene explaining it,
// then comes back to the same choice.
import { useEffect, useRef, useState } from "react";
import { Player } from "@remotion/player";
import { go } from "../App.jsx";
import Icon from "../icons.jsx";
import Segment from "./Segment.jsx";
import { filmById, timelineFor, sceneIndex } from "./films.js";
import "./playalong.css";

export default function PlayAlong({ sub }) {
  const film = filmById(sub[0]);
  const timeline = timelineFor(film);
  // A deep link like #/play/p3-dragon/riddle2/choose opens straight onto a scene.
  const [started, setStarted] = useState(Boolean(sub[1]));
  // What's on screen: a scene, and whether we're waiting for a tap.
  const [at, setAt] = useState({ scene: sub[1] ?? film.scenes[0].id, choosing: sub[2] === "choose", nonce: 0 });
  const [slipped, setSlipped] = useState([]);
  const [width, setWidth] = useState(960);
  const boxRef = useRef(null);
  const playerRef = useRef(null);
  const musicRef = useRef(null);

  const index = sceneIndex(film, at.scene);
  const scene = timeline.scenes[index];

  // Scale the hotspots with the player.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [started]);

  // When a scene ends: wait for a choice, follow `next`, or finish.
  useEffect(() => {
    const p = playerRef.current;
    if (!p || at.choosing) return;
    const onEnded = () => {
      const def = film.scenes[index];
      if (def.choice) setAt(a => ({ ...a, choosing: true }));
      else if (def.returnTo) setAt(a => ({ scene: def.returnTo, choosing: true, nonce: a.nonce + 1 }));
      else if (def.next) setAt(a => ({ scene: def.next, choosing: false, nonce: a.nonce + 1 }));
      else setAt(a => ({ ...a, done: true }));
    };
    p.addEventListener("ended", onEnded);
    return () => p.removeEventListener("ended", onEnded);
  }, [at, index, film]);

  // Duck the music while the story waits for him.
  useEffect(() => { if (musicRef.current) musicRef.current.volume = at.choosing ? 0.08 : film.musicVolume ?? 0.18; }, [at.choosing, film]);

  function begin() {
    setStarted(true);
    if (film.music) {
      const m = new Audio(`/video-assets/${film.music}`);
      m.loop = true;
      m.volume = film.musicVolume ?? 0.18;
      m.play();
      musicRef.current = m;
    }
  }
  useEffect(() => () => musicRef.current?.pause(), []);

  function tap(option) {
    const choice = film.scenes[index].choice;
    if (option.correct) {
      setAt(a => ({ scene: choice.next, choosing: false, nonce: a.nonce + 1 }));
    } else {
      setSlipped(s => [...s, `${at.scene}:${option.id}`]);
      setAt(a => ({ scene: option.slip, choosing: false, nonce: a.nonce + 1 }));
    }
  }

  const scale = width / 1920;
  const choice = at.choosing ? film.scenes[index].choice : null;

  return (
    <div className="playalong">
      <button className="home-link playalong-back" onClick={() => { musicRef.current?.pause(); go("watch"); }}>
        <Icon name="back" />Film library
      </button>
      <div className="playalong-stage" ref={boxRef}>
        {!started ? (
          <button className="playalong-poster" onClick={begin} style={{ backgroundImage: film.poster ? `url(${film.poster})` : undefined }}>
            <span className="playalong-kicker">A play-along film</span>
            <span className="playalong-title">{film.title}</span>
            <span className="playalong-hint">{film.strap}</span>
            <span className="btn gold playalong-begin"><Icon name="play" />Begin</span>
          </button>
        ) : (
          <>
            <Player
              key={`${at.scene}-${at.nonce}`}
              ref={playerRef}
              component={Segment}
              inputProps={{ filmId: film.id, sceneIndex: index }}
              durationInFrames={scene.length}
              compositionWidth={1920}
              compositionHeight={1080}
              fps={30}
              autoPlay={!at.choosing}
              initialFrame={at.choosing ? scene.length - 1 : 0}
              numberOfSharedAudioTags={24}
              style={{ position: "absolute", left: 0, top: 0, width, height: (width * 9) / 16 }}
              acknowledgeRemotionLicense
            />
            {choice && (
              <div className="playalong-choices" style={{ transform: `scale(${scale})` }}>
                {choice.options.map(o => {
                  const tried = slipped.includes(`${at.scene}:${o.id}`);
                  return (
                    <button key={o.id} className={`playalong-hotspot ${tried ? "tried" : ""}`} disabled={tried}
                      style={{ left: o.x, top: o.y, width: o.w, height: o.h }}
                      aria-label={o.label ?? o.id} onClick={() => tap(o)} />
                  );
                })}
              </div>
            )}
            {choice && <div className="playalong-prompt pop"><Icon name="sparkle" size={20} />{choice.prompt}</div>}
            {at.done && (
              <div className="playalong-end pop">
                <button className="btn gold" onClick={() => { setSlipped([]); setAt({ scene: film.scenes[0].id, choosing: false, nonce: at.nonce + 1 }); }}>
                  <Icon name="refresh" />Play again
                </button>
                <button className="btn secondary" onClick={() => { musicRef.current?.pause(); go("watch"); }}>Back to the films</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
