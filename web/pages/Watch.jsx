// The film library: one short film for every kind of question.
import { useState } from "react";
import { go } from "../App.jsx";
import { ErrorBox, Loading } from "../components.jsx";
import { useFilms, FilmPlayer } from "../Film.jsx";
import { PLAY_FILMS } from "../cinema/films.js";
import Icon from "../icons.jsx";
import "./watch.css";

export default function Watch() {
  const { films, error } = useFilms();
  const [playing, setPlaying] = useState(null);
  const groups = films ? [...new Set(films.map(f => f.group))] : [];

  return (
    <div style={{ "--vol": "var(--cloth)" }}>
      <header className="volume-band cloth">
        <div className="volume-band-inner">
          <button className="home-link" onClick={() => go("")}><Icon name="back" />Home</button>
          <Icon name="play" className="emblem" strokeWidth={1.3} />
          <h1 className="big-title">The film library</h1>
          <p className="lead">A short film for every kind of question. Watch one, then go and crack it.</p>
        </div>
      </header>
      <div className="page stack">
        <ErrorBox error={error} />
        {!films && !error && <Loading />}
        {PLAY_FILMS.length > 0 && (
          <section className="watch-group play">
            <h2 className="watch-group-title">Play along</h2>
            <div className="watch-list">
              {PLAY_FILMS.map(f => (
                <button key={f.id} className="watch-film" onClick={() => go(`play/${f.id}`)}>
                  <span className="watch-play"><Icon name="sparkle" size={34} strokeWidth={1.3} /></span>
                  <span className="watch-text">
                    <span className="watch-genre">{f.genre ? `${f.genre}, you tap the answers` : "You tap the answers"}</span>
                    <span className="watch-title">{f.title}</span>
                    <span className="watch-blurb">{f.strap}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
        {groups.map(g => (
          <section key={g} className={`watch-group ${g === "The cinema" ? "cinema" : ""}`}>
            <h2 className="watch-group-title">{g}</h2>
            <div className="watch-list">
              {films.filter(f => f.group === g).map(f => (
                <button key={f.id} className="watch-film" disabled={!f.ready} onClick={() => setPlaying(f)}>
                  <span className="watch-play"><Icon name="play" size={34} strokeWidth={1.3} /></span>
                  <span className="watch-text">
                    {f.genre && <span className="watch-genre">{f.genre}</span>}
                    <span className="watch-title">{f.title}</span>
                    <span className="watch-blurb">{f.ready ? f.blurb : "Being made"}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      {playing && <FilmPlayer film={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
