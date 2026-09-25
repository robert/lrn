// Mega Reader Challenge. Routes: #/reader, #/reader/night/<id>, #/reader/results
import { useEffect, useState } from "react";
import { get } from "../../api.js";
import { go } from "../../App.jsx";
import { BackHome, ErrorBox, Loading } from "../../components.jsx";
import { record, nextNight, nightsLeftInChapter, allNights } from "./logic.js";
import Night from "./Night.jsx";
import Results from "./Results.jsx";
import "./reader.css";

export default function ReaderApp({ sub }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const path = sub.join("/");

  // Reload whenever the screen changes, so streaks and progress are fresh.
  useEffect(() => { get("/api/reader").then(setData, setError); }, [path]);

  if (error) return <div className="page"><ErrorBox error={error} /></div>;
  if (!data) return <Loading />;

  if (sub[0] === "results") return <Results data={data} />;
  if (sub[0] === "night") {
    const night = allNights(data.chapters).find(n => n.id === sub[1]);
    if (!night || !night.questions?.length) return <div className="page"><ErrorBox error={`No night called ${sub[1]}`} /></div>;
    return <Night key={night.id} night={night} data={data} />;
  }
  return <ReaderHome data={data} />;
}

function ReaderHome({ data }) {
  const next = nextNight(data.chapters, data.progress);
  const rec = record(data.progress);
  const ready = next && next.questions?.length > 0;
  const left = next ? nightsLeftInChapter(data.chapters, data.progress, next.chapter) : 0;

  return (
    <div className="page stack reader">
      <BackHome />
      <h1 className="big-title center reader-title">MEGA READER CHALLENGE</h1>

      <div className="reader-tiles">
        <div className="card reader-tile">
          <div className="reader-tile-label">YOUR STREAK</div>
          <div className="reader-tile-big">🔥 {data.streak}</div>
          <div className="soft">{data.streak === 1 ? "night" : "nights"} in a row</div>
        </div>
        <div className="card reader-tile">
          <div className="reader-tile-label">YOUR RECORD</div>
          <div className="reader-tile-big">🏅</div>
          <div className="reader-tile-rank">{rec.title}</div>
        </div>
      </div>

      {next ? (
        <p className="center reader-chapter">
          Chapter {next.chapter}: {left} {left === 1 ? "night" : "nights"} to finish the chapter
        </p>
      ) : (
        <p className="center reader-chapter">You've finished the whole book! A true Mega Reader.</p>
      )}

      {next && (ready ? (
        <button className="btn wide" onClick={() => go(`reader/night/${next.id}`)}>Start tonight's challenge</button>
      ) : (
        <div className="card center soft">Tonight's story is on its way. Check back soon!</div>
      ))}

      <div className="center"><button className="reader-results-link" onClick={() => go("reader/results")}>results</button></div>
    </div>
  );
}
