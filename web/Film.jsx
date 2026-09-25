// Explainer films: a hook for the catalogue, a pop-up player, and a button
// that opens a film without leaving the current screen.
import { useEffect, useState } from "react";
import { get } from "./api.js";
import Icon from "./icons.jsx";
import "./film.css";

let cache = null;
export function useFilms() {
  const [films, setFilms] = useState(cache);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (cache) return;
    get("/api/videos").then(f => { cache = f; setFilms(f); }, setError);
  }, []);
  return { films, error };
}

export function FilmPlayer({ film, onClose }) {
  useEffect(() => {
    const onKey = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="overlay film-overlay" onClick={onClose}>
      <div className="film-frame" onClick={e => e.stopPropagation()}>
        <video src={`/videos/${film.id}.mp4`} controls autoPlay playsInline className="film-video" />
        <div className="film-caption">
          <span className="film-caption-title">{film.title}</span>
          <button className="btn small secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// "Watch the film" for one film id; shows nothing until that film exists.
export function FilmButton({ id, label = "Watch the film first" }) {
  const { films } = useFilms();
  const [open, setOpen] = useState(false);
  const film = films?.find(f => f.id === id && f.ready);
  if (!film) return null;
  return (
    <>
      <button className="btn wide secondary film-button" onClick={() => setOpen(true)}>
        <Icon name="play" />{label}
      </button>
      {open && <FilmPlayer film={film} onClose={() => setOpen(false)} />}
    </>
  );
}
