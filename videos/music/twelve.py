""""The Twelve Things": a chant-along song for the music video s5-twelve.

Each lyric phrase is spoken by Kokoro, fitted to an exact number of beats,
and laid on a beat grid over a synthesised track (kick, snare, hats, bass,
a bright synth hook). Writes public/music/twelve.wav and
src/generated/twelve-timing.json (every phrase with its start, end and which
of the twelve things it names), which drives the animation.

Run: tts/.venv/bin/python music/twelve.py
"""
import json
from pathlib import Path
import numpy as np
from kokoro_onnx import Kokoro
from synth import RATE, rng, hz, square, bass, place, reverb, lowpass, save, t_

HERE = Path(__file__).parent
ROOT = HERE.parent
BPM = 100
BEAT = 60 / BPM
LEAD = ("bm_lewis", 1.0)
ECHO = ("bf_lily", 1.1)

kokoro = Kokoro(str(ROOT / "tts/models/kokoro-v1.0.onnx"), str(ROOT / "tts/models/voices-v1.0.bin"))


def speak(text, voice, speed, fit_beats=None):
    """Speak a phrase; if fit_beats is given, adjust speed so it fits."""
    samples, rate = kokoro.create(text, voice=voice, speed=speed, lang="en-gb")
    if fit_beats:
        want = fit_beats * BEAT * 0.92
        have = len(samples) / rate
        if have > want:
            samples, rate = kokoro.create(text, voice=voice, speed=min(1.6, speed * have / want), lang="en-gb")
    if rate != RATE:
        samples = np.interp(np.arange(0, len(samples), rate / RATE), np.arange(len(samples)), samples)
    # Trim leading silence so the words land on the beat.
    start = np.argmax(np.abs(samples) > 0.02)
    return samples[max(0, start - 200):]


# (bar, beat-in-bar, beats allowed, text, voice, thing index or None, kind)
LYRICS = []
bar = 0


def line(beat, beats, text, who=LEAD, thing=None, kind="verse"):
    LYRICS.append((bar, beat, beats, text, who, thing, kind))


# Intro: two bars of groove, then the call.
bar = 2
line(0, 4, "Ready? Twelve things.", kind="intro")
bar = 3
line(0, 2, "Let's go!", kind="intro")

VERSE = [
    [(0, "One, shape.", 0), (2, "Two, how many.", 1)],
    [(0, "Three, size.", 2), (2, "Four, shading.", 3)],
    [(0, "Five, rotation.", 4), (2, "Six, flipped!", 5)],
    [(0, "Seven, position on the screen.", 6)],
    [(0, "Eight, in front or behind.", 7), (2, "Nine, line style.", 8)],
    [(0, "Ten, touching.", 9), (2, "Eleven, pointing at.", 10)],
    [(0, "Twelve, inside or outside!", 11)],
]
ECHOES = ["Shape!", "How many!", "Size!", "Shading!", "Rotation!", "Flipped!", "Position!", "Front or behind!", "Line style!", "Touching!", "Pointing at!", "Inside, outside!"]
CHORUS = [
    (0, 4, "Twelve things can change, and I check every one."),
    (0, 4, "Nothing gets past me. Sharp eyes. Job done!"),
]


def verse(start_bar, echo):
    """Verse one: two things a bar. Verse two: one thing a bar, with an echo."""
    global bar
    if not echo:
        for i, items in enumerate(VERSE):
            bar = start_bar + i
            for beat, text, thing in items:
                line(beat, 4 if len(items) == 1 else 2, text, thing=thing)
        return start_bar + len(VERSE)
    things = [item for items in VERSE for item in items]
    for i, (_, text, thing) in enumerate(things):
        bar = start_bar + i
        line(0, 2, text, thing=thing)
        line(2, 2, ECHOES[thing], who=ECHO, thing=thing, kind="echo")
    return start_bar + len(things)


def chorus(start_bar):
    global bar
    for i, (beat, beats, text) in enumerate(CHORUS):
        bar = start_bar + i
        line(beat, beats, text, kind="chorus")
    return start_bar + len(CHORUS)


b = 4
b = verse(b, echo=False)
b = chorus(b)
bar = b
line(0, 4, "Now you say it back!", kind="intro")
b += 1
b = verse(b, echo=True)
b = chorus(b)
b = chorus(b)
bar = b
line(0, 4, "Twelve things. Nothing gets past you.", kind="outro")
TOTAL_BARS = b + 2


def kick(v=0.9):
    t = t_(0.35)
    return v * np.sin(2 * np.pi * (48 + 110 * np.exp(-t * 28)) * t) * np.exp(-t * 9)


def snare(v=0.45):
    t = t_(0.22)
    return v * (lowpass(rng.standard_normal(len(t)), 2) * np.exp(-t * 18) + 0.5 * np.sin(2 * np.pi * 185 * t) * np.exp(-t * 25))


def hat(v=0.12):
    t = t_(0.06)
    n = rng.standard_normal(len(t))
    return v * (n - lowpass(n, 3)) * np.exp(-t * 70)


def clap(v=0.3):
    t = t_(0.2)
    n = rng.standard_normal(len(t))
    env = np.exp(-t * 30) + 0.6 * np.exp(-((t - 0.012) * 300) ** 2) + 0.6 * np.exp(-((t - 0.024) * 300) ** 2)
    return v * lowpass(n, 2) * env


HOOK = ["C5", "E5", "G5", "E5", "A5", "G5", "E5", "D5"]
BASSLINE = ["C2", "C2", "A1", "A1", "F1", "F1", "G1", "G1"]


def track():
    n = int((TOTAL_BARS * 4 * BEAT + 3) * RATE)
    buf = np.zeros(n)
    for bar_i in range(TOTAL_BARS):
        t0 = bar_i * 4 * BEAT
        for k in range(8):  # eighth notes
            at = t0 + k * BEAT / 2
            if k in (0, 3, 5):
                place(buf, kick(), at)
            if k in (2, 6):
                place(buf, snare(), at)
                place(buf, clap(0.18), at)
            place(buf, hat(0.1 if k % 2 else 0.06), at)
            place(buf, bass(hz(BASSLINE[(bar_i * 2 + k // 4) % 8]), BEAT * 0.45, 0.4), at)
        if bar_i >= 4 and bar_i % 2 == 0:  # the hook, every other bar once the vocals start
            for k, note in enumerate(HOOK):
                place(buf, lowpass(square(hz(note), BEAT * 0.4, 0.07, 0.25), 3), t0 + k * BEAT / 2)
    return buf


def main():
    music = track()
    vocals = np.zeros_like(music)
    timing = []
    for bar_i, beat, beats, text, (voice, speed), thing, kind in LYRICS:
        start = (bar_i * 4 + beat) * BEAT
        s = speak(text, voice, speed, fit_beats=max(beats, 1))
        place(vocals, s * (0.9 if voice == LEAD[0] else 0.8), start)
        timing.append({"start": round(start, 3), "end": round(start + len(s) / RATE, 3), "text": text, "thing": thing, "kind": kind, "who": "lead" if voice == LEAD[0] else "echo"})
        print(f"{start:6.2f}s {text}")
    mix = lowpass(music, 2) * 0.55 + reverb(vocals, mix=0.12, size=0.04)
    save(mix, "music/twelve.wav", peak=0.85, stereo_width=0.3)
    out = {"bpm": BPM, "seconds": round(len(mix) / RATE, 3), "bars": TOTAL_BARS, "lines": timing}
    (ROOT / "src/generated/twelve-timing.json").write_text(json.dumps(out, indent=2))
    print(f"{out['seconds']}s, {len(timing)} lines")


if __name__ == "__main__":
    main()
