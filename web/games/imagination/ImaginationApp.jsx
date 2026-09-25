// Imagination Engine: look at a picture, say problems and solutions out loud,
// and find out just how imaginative you are.
import { useEffect, useState } from "react";
import { get, post } from "../../api.js";
import { BackHome, ErrorBox, Loading } from "../../components.jsx";
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

  if (error) return <div className="page"><BackHome /><ErrorBox error={error} /></div>;
  if (!state || !library) return <Loading />;
  if (playing) return <Round mode={playing} library={library} onFinish={finished} onQuit={() => setPlaying(null)} />;
  if (round) return <Results round={round} setRound={setRound} onBack={() => setRound(null)} />;

  return (
    <div className="page stack">
      <BackHome />
      <header className="center">
        <div className="big-title imag-title">IMAGINATION ENGINE</div>
        <p className="imag-tagline">You already know you're imaginative. Time to prove <em>how</em> imaginative.</p>
      </header>

      <div className="card imag-how">
        Look at the picture and say it out loud:
        <div className="imag-say">"The problem is… The solution is…"</div>
      </div>

      <div className="imag-modes">
        {Object.entries(MODES).map(([mode, m]) => (
          <button key={mode} className="imag-mode" onClick={() => setPlaying(mode)}>
            {state.done[mode] && <div className="tile-tick pop">✓</div>}
            <div className="imag-mode-icon">{m.icon}</div>
            <div className="imag-mode-name">{m.name}</div>
            <div className="imag-mode-blurb">{m.blurb}</div>
          </button>
        ))}
      </div>

      {state.done.depth && state.done.breadth && (
        <div className="card center pop"><b>Both done today! Your imagination engine is running hot. 🔥</b></div>
      )}
      {state.pairCount > 0 && (
        <p className="center soft"><b>Your idea bank is growing. Story Builder can use every one of them!</b></p>
      )}
    </div>
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
    <div className="page stack">
      <button className="back" onClick={onBack}>‹ Imagination Engine</button>
      <ErrorBox error={error} />

      {round.status === "pending" ? (
        <div className="card stack center">
          <div className="title">Every word is saved! 💾</div>
          <p>We couldn't count your ideas just yet.</p>
          <div className="error">{round.error}</div>
          <button className="btn" disabled={retrying} onClick={retry}>{retrying ? "Counting…" : "Try again"}</button>
        </div>
      ) : (
        <>
          <div className="card center pop">
            {count > 0 ? (
              <>
                <div className="imag-count">{count}</div>
                <div className="title">{count === 1 ? "brilliant idea!" : "brilliant ideas!"}</div>
              </>
            ) : (
              <div className="title">Warm-up done! Next time, say "The problem is… the solution is…" out loud.</div>
            )}
          </div>
          {round.praise && <div className="card imag-praise">⭐ {round.praise}</div>}
          {round.pairs.map((pair, i) => {
            const prompt = promptFor(pair.promptId);
            return (
              <div key={pair.id} className="card imag-pair">
                <div className="imag-pair-num">{i + 1}</div>
                <div className="stack imag-pair-body">
                  {round.mode === "breadth" && prompt && <PromptThumb prompt={prompt} />}
                  {pair.situation && <div className="soft">{pair.situation}</div>}
                  <div><b className="imag-label problem">Problem</b> {pair.problem}</div>
                  {pair.solution && <div><b className="imag-label solution">Solution</b> {pair.solution}</div>}
                </div>
              </div>
            );
          })}
        </>
      )}
      <button className="btn wide" onClick={onBack}>Back to the Imagination Engine</button>
    </div>
  );
}

function PromptThumb({ prompt }) {
  if (prompt.type === "opener") return <div className="imag-thumb-text">"{prompt.text}"</div>;
  return <img className="imag-thumb" src={prompt.url} alt={prompt.label} />;
}
