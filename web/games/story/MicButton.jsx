// A big tap-to-talk button. While it's on, each phrase he says is passed to
// onPhrase. Hidden if the browser can't do speech (he types instead).
import { useSpeech } from "../../lib/useSpeech.js";

export default function MicButton({ onPhrase }) {
  const speech = useSpeech(onPhrase);
  if (!speech.supported) return null;
  return (
    <div className="stack">
      <button type="button" className={`btn story-mic ${speech.listening ? "on" : ""}`}
        onClick={() => (speech.listening ? speech.stop() : speech.start())}>
        {speech.listening ? "⏹ Stop" : "🎤 Say it"}
      </button>
      {speech.interim && <div className="soft story-interim">{speech.interim}</div>}
      {speech.error && <div className="error">{speech.error}</div>}
    </div>
  );
}
