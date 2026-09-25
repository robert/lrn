// Continuous voice input with the browser's Web Speech API (best in Chrome).
// While listening, every finished phrase is passed to onPhrase(text, timeMs).
// The browser stops listening by itself every so often, so we restart it.
import { useEffect, useRef, useState } from "react";

const Recognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
export const speechSupported = Boolean(Recognition);

export function useSpeech(onPhrase) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const wantRef = useRef(false);
  const onPhraseRef = useRef(onPhrase);
  onPhraseRef.current = onPhrase;

  useEffect(() => () => { wantRef.current = false; recRef.current?.abort(); }, []);

  function start() {
    if (!Recognition) return;
    setError(null);
    wantRef.current = true;
    const rec = new Recognition();
    rec.lang = "en-GB";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = e => {
      let partial = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          const text = r[0].transcript.trim();
          if (text) onPhraseRef.current(text, Date.now());
        } else partial += r[0].transcript;
      }
      setInterim(partial);
    };
    rec.onerror = e => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantRef.current = false;
        setError("The microphone is switched off. Ask a grown-up to allow it.");
      }
    };
    rec.onend = () => {
      setInterim("");
      if (wantRef.current) rec.start();
      else setListening(false);
    };
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  function stop() {
    wantRef.current = false;
    recRef.current?.stop();
    setListening(false);
  }

  return { supported: speechSupported, listening, interim, error, start, stop };
}
