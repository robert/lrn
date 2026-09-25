// A big tap-to-talk button. While it's on, each phrase he says is passed to
// onPhrase. Hidden if the browser can't do speech (he types instead).
import { useSpeech } from "../../lib/useSpeech.js";
import Icon from "../../icons.jsx";

export default function MicButton({ onPhrase }) {
  const speech = useSpeech(onPhrase);
  if (!speech.supported) return null;
  return (
    <div className="story-mic-wrap">
      <button type="button" className={`btn story-mic ${speech.listening ? "on" : ""}`}
        onClick={() => (speech.listening ? speech.stop() : speech.start())}>
        {speech.listening
          ? <><span className="story-mic-pulse" aria-hidden="true" /><Icon name="stop" />Stop listening</>
          : <><Icon name="mic" />Say it</>}
      </button>
      {speech.interim && <p className="story-interim">{speech.interim}</p>}
      {speech.error && <div className="error">{speech.error}</div>}
    </div>
  );
}
