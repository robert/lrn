// The film library: one short film for every kind of question.
import { useState } from "react";
import { go } from "../App.jsx";
import { ErrorBox, Loading } from "../components.jsx";
import { useFilms, FilmPlayer } from "../Film.jsx";
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
        {groups.map(g => (
          <section key={g} className="watch-group">
            <h2 className="watch-group-title">{g}</h2>
            <div className="watch-list">
              {films.filter(f => f.group === g).map(f => (
                <button key={f.id} className="watch-film" disabled={!f.ready} onClick={() => setPlaying(f)}>
                  <span className="watch-play"><Icon name="play" size={34} strokeWidth={1.3} /></span>
                  <span className="watch-text">
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
