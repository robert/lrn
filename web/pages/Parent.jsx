// Parent settings: not linked from the home screen. Visit #/parent.
import { useEffect, useState } from "react";
import { get, post } from "../api.js";
import { go } from "../App.jsx";
import { ErrorBox, Loading } from "../components.jsx";
import Icon from "../icons.jsx";

const STREAKS = [
  ["reader", "Mega Reader"], ["imagination", "Imagination Engine"], ["story", "Story Builder"],
  ["spotter", "Nothing Gets Past"], ["mega", "Mega Streak"],
];

export default function Parent() {
  const [settings, setSettings] = useState(null);
  const [rewardsText, setRewardsText] = useState("");
  const [pictures, setPictures] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const loadPictures = () => get("/api/pictures").then(p => setPictures(p.pictures), setError);
  useEffect(() => {
    get("/api/settings").then(s => { setSettings(s); setRewardsText(s.rewards.join("\n")); }, setError);
    loadPictures();
  }, []);

  async function run(fn, done) {
    setError(null);
    try { await fn(); setMessage(done); } catch (e) { setError(e); }
  }

  const saveRewards = () => run(async () => {
    setSettings(await post("/api/settings/rewards", { rewards: rewardsText.split("\n") }));
  }, "Rewards saved.");

  const reset = (which, label) => {
    if (!confirm(`Reset the ${label} streak to zero?`)) return;
    run(async () => setSettings(await post("/api/settings/reset", { which })), `${label} streak reset.`);
  };

  const upload = files => run(async () => {
    for (const file of files) {
      const dataUrl = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result);
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
      await post("/api/pictures", { name: file.name, dataUrl });
    }
    await loadPictures();
  }, "Pictures added.");

  if (!settings) return error ? <div className="page"><ErrorBox error={error} /></div> : <Loading />;

  return (
    <div style={{ "--vol": "var(--cloth)" }}>
      <header className="volume-band cloth">
        <div className="volume-band-inner">
          <button className="home-link" onClick={() => go("")}><Icon name="back" />Home</button>
          <Icon name="keys" className="emblem" strokeWidth={1.3} />
          <h1 className="big-title">For grown-ups</h1>
          <p className="lead">Rewards, pictures, streaks and reports.</p>
        </div>
      </header>
    <div className="page stack">
      <ErrorBox error={error} />
      {message && <div className="sheet small" role="status">{message}</div>}

      <section className="sheet stack">
        <h2 className="title">Weekly rewards</h2>
        <p className="soft">One per line. He picks one after a full week of Mega days.</p>
        <textarea value={rewardsText} onChange={e => setRewardsText(e.target.value)} rows={8}
          style={{ width: "100%", padding: 14, borderRadius: 10, border: "1px solid var(--rule)", background: "white", lineHeight: 1.6 }} />
        <button className="btn" onClick={saveRewards}>Save rewards</button>
        {Object.keys(settings.claimedWeeks).length > 0 && (
          <div className="soft">
            Claimed: {Object.entries(settings.claimedWeeks).map(([w, c]) => `week of ${w}: ${c.reward}`).join("; ")}
          </div>
        )}
      </section>

      <section className="sheet stack">
        <h2 className="title">Imagination Engine pictures</h2>
        <p className="soft">
          Pictures live in the <code>pictures/</code> folder. Add more here or drop files straight into that folder.
          Opening sentences go in <code>pictures/openers.txt</code>, one per line.
        </p>
        <input type="file" accept="image/*" multiple onChange={e => upload([...e.target.files])} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
          {pictures.map(p => (
            <figure key={p.id} style={{ margin: 0 }}>
              <img src={p.url} alt={p.label} style={{ width: "100%", borderRadius: 6, background: "var(--ground)", boxShadow: "0 0 0 1px var(--rule-soft)" }} />
              <figcaption className="soft" style={{ fontSize: 14 }}>{p.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="sheet stack">
        <h2 className="title">Reset a streak</h2>
        <div className="row">
          {STREAKS.map(([which, label]) => (
            <button key={which} className="btn small secondary" onClick={() => reset(which, label)}>{label}</button>
          ))}
        </div>
      </section>

      <section className="sheet stack">
        <h2 className="title">Reports</h2>
        <button className="btn secondary" onClick={() => go("reader/results")}>Mega Reader results</button>
      </section>
    </div>
    </div>
  );
}
