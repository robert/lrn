// Mega Reader Challenge. Routes: #/reader, #/reader/night/<id>, #/reader/results
import { useEffect, useState } from "react";
import { get } from "../../api.js";
import { go } from "../../App.jsx";
import { ErrorBox, Loading, Volume, VolumeHeader } from "../../components.jsx";
import Icon from "../../icons.jsx";
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

  let screen;
  if (sub[0] === "results") screen = <Results data={data} />;
  else if (sub[0] === "night") {
    const night = allNights(data.chapters).find(n => n.id === sub[1]);
    screen = !night || !night.questions?.length
      ? <div className="page"><ErrorBox error={`No night called ${sub[1]}`} /></div>
      : <Night key={night.id} night={night} data={data} />;
  } else screen = <ReaderHome data={data} />;
  return <Volume game="reader">{screen}</Volume>;
}

function ReaderHome({ data }) {
  const next = nextNight(data.chapters, data.progress);
  const rec = record(data.progress);
  const ready = next && next.questions?.length > 0;
  const left = next ? nightsLeftInChapter(data.chapters, data.progress, next.chapter) : 0;

  return (
    <div className="reader">
      <VolumeHeader game="reader" lead="Read closely. Nothing slips past a Mega Reader." />
      <div className="page stack">
        <div className="reader-tiles">
          <section className="sheet reader-tile">
            <h2 className="reader-tile-label">Your streak</h2>
            <div className="reader-tile-figure">
              <Icon name="flame" size={34} strokeWidth={1.3} className="reader-tile-icon" />
              <span className="reader-tile-num">{data.streak}</span>
            </div>
            <div className="reader-tile-caption">{data.streak === 1 ? "night" : "nights"} in a row</div>
          </section>
          <section className="sheet reader-tile">
            <h2 className="reader-tile-label">Your record</h2>
            <div className="reader-tile-figure">
              <Icon name="medal" size={54} strokeWidth={1.1} className="reader-tile-icon" />
            </div>
            <div className="reader-tile-rank">{rec.title}</div>
          </section>
        </div>

        <p className="reader-chapter">
          {next
            ? <>Chapter {next.chapter}: {left} {left === 1 ? "night" : "nights"} to finish the chapter</>
            : "You've finished the whole book! A true Mega Reader."}
        </p>

        {next && (ready ? (
          <button className="btn wide reader-start" onClick={() => go(`reader/night/${next.id}`)}>
            <Icon name="book" strokeWidth={1.6} />Start tonight's challenge
          </button>
        ) : (
          <div className="sheet center soft">Tonight's story is on its way. Check back soon!</div>
        ))}

        <div className="center"><button className="reader-results-link" onClick={() => go("reader/results")}>results</button></div>
      </div>
    </div>
  );
}
