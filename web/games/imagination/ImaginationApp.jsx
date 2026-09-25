// Imagination Engine: look at a picture, say problems and solutions out loud,
// and find out just how imaginative you are.
import { useEffect, useState } from "react";
import { get, post } from "../../api.js";
import { ErrorBox, Loading, Seal, Volume, VolumeHeader } from "../../components.jsx";
import Icon from "../../icons.jsx";
import Round from "./Round.jsx";
import { MODES } from "./modes.js";
import "./imagination.css";

export default function ImaginationApp() {
  const [state, setState] = useState(null);
  const [library, setLibrary] = useState(null);
  const [playing, setPlaying] = useState(null); // "depth" | "breadth" | null
  const [round, setRound] = useState(null); // the finished round, for results
  const [error, setError] = useState(null);

  const load = () => get("/api/imagination").then(setState, setError);
  useEffect(() => {
    load();
    get("/api/pictures").then(setLibrary, setError);
  }, []);

  function finished(r) {
    setPlaying(null);
    setRound(r);
    load();
  }

  if (error) return <Volume game="imagination"><VolumeHeader game="imagination" compact /><div className="page"><ErrorBox error={error} /></div></Volume>;
  if (!state || !library) return <Loading />;
  if (playing) return <Round mode={playing} library={library} onFinish={finished} onQuit={() => setPlaying(null)} />;
  if (round) return <Results round={round} setRound={setRound} onBack={() => setRound(null)} />;

  const bothDone = state.done.depth && state.done.breadth;
  return (
    <Volume game="imagination">
      <VolumeHeader game="imagination" lead="You already know you're imaginative. Time to prove how imaginative." />
      <div className="page stack">
        <section className="sheet imag-formula">
          <p className="imag-formula-lead">Look at the picture and say it out loud</p>
          <p className="imag-formula-words">The problem is… <span>the solution is…</span></p>
        </section>

        <div className="imag-modes">
          {Object.entries(MODES).map(([mode, m]) => (
            <button key={mode} className="imag-mode sheet" onClick={() => setPlaying(mode)}>
              {state.done[mode] && <span className="imag-mode-seal pop"><Seal size={40} /></span>}
              <span className="imag-mode-icon cloth"><Icon name={m.icon} size={30} strokeWidth={1.4} /></span>
              <span className="imag-mode-name">{m.name}</span>
              <span className="imag-mode-blurb">{m.blurb}</span>
              <span className="imag-mode-length"><Icon name="timer" size={16} />{m.length}</span>
            </button>
          ))}
        </div>

        {bothDone ? (
          <p className="imag-note pop"><Icon name="sparkle" size={18} strokeWidth={1.3} />Both rounds done today. Your imagination is running hot.</p>
        ) : state.pairCount > 0 ? (
          <p className="imag-note"><Icon name="quill" size={18} strokeWidth={1.4} />Every idea you find is saved for Story Builder.</p>
        ) : null}
      </div>
    </Volume>
  );
}

function Results({ round, setRound, onBack }) {
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState(null);

  async function retry() {
    setRetrying(true);
    setError(null);
    try { setRound(await post(`/api/imagination/round/${round.id}/retry`)); } catch (e) { setError(e); }
    setRetrying(false);
  }

  const promptFor = id => round.prompts.find(p => p.id === id);
  const count = round.pairs.length;

  return (
    <Volume game="imagination">
      <VolumeHeader game="imagination" title={MODES[round.mode]?.name ?? "Your ideas"} compact to="imagination" backLabel="Imagination Engine" />
      <div className="page stack">
        <ErrorBox error={error} />

        {round.status === "pending" ? (
          <section className="sheet stack center">
            <Icon name="quill" size={40} strokeWidth={1.3} className="imag-result-icon" />
            <h2 className="display">Every word is saved</h2>
            <p className="lead soft">The engine couldn't sort your ideas just yet. Nothing is lost.</p>
            <div className="error" style={{ textAlign: "left" }}>{round.error}</div>
            <button className="btn" disabled={retrying} onClick={retry}>
              <Icon name="refresh" />{retrying ? "Sorting your ideas…" : "Try again"}
            </button>
          </section>
        ) : (
          <>
            <section className="imag-tally center pop">
              {count > 0 ? (
                <>
                  <div className="imag-tally-wreath">
                    <Icon name="laurel" size={190} strokeWidth={0.7} className="imag-tally-laurel" />
                    <div className="imag-tally-number">{count}</div>
                  </div>
                  <div className="imag-tally-words">{count === 1 ? "brilliant idea" : "brilliant ideas"}</div>
                </>
              ) : (
                <>
                  <Icon name="laurel" size={96} strokeWidth={0.9} className="imag-result-icon" />
                  <div className="imag-tally-words">Warm-up done. Next time, say “The problem is… the solution is…” out loud.</div>
                </>
              )}
            </section>

            {round.praise && (
              <blockquote className="imag-praise">
                <p>{round.praise}</p>
              </blockquote>
            )}

            {count > 0 && (
              <ol className="imag-ideas sheet">
                {round.pairs.map((pair, i) => {
                  const prompt = promptFor(pair.promptId);
                  return (
                    <li key={pair.id} className="imag-idea">
                      <span className="imag-idea-num">{i + 1}</span>
                      <div className="imag-idea-body">
                        {round.mode === "breadth" && prompt && <PromptThumb prompt={prompt} />}
                        {pair.situation && <p className="imag-idea-situation">{pair.situation}</p>}
                        <div className="imag-idea-pair">
                          <p><span className="imag-idea-label">Problem</span>{pair.problem}</p>
                          {pair.solution && <p><span className="imag-idea-label">Solution</span>{pair.solution}</p>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </>
        )}
        <button className="btn wide" onClick={onBack}>Back to the Imagination Engine</button>
      </div>
    </Volume>
  );
}

function PromptThumb({ prompt }) {
  if (prompt.type === "opener") return <p className="imag-thumb-text">“{prompt.text}”</p>;
  return (
    <figure className="imag-thumb">
      <img src={prompt.url} alt={prompt.label} />
      <figcaption>{prompt.label.charAt(0).toUpperCase() + prompt.label.slice(1)}</figcaption>
    </figure>
  );
}

