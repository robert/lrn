"""Music-hall piano waltz and stage sounds for "The Great Word Swap".

An oom-pah-pah waltz on a slightly out-of-tune upright piano, with a
cheeky melody on top. Plus applause, a curtain whoosh and a slide whistle.
Run: tts/.venv/bin/python music/theatre.py
"""
import numpy as np
from synth import RATE, rng, hz, place, reverb, lowpass, save, t_, env

BPM = 150
BEAT = 60 / BPM


def upright(f, dur, vel=0.4):
    """A honky-tonk upright: two slightly detuned strings with bright partials."""
    t = t_(dur)
    tone = sum(np.sin(2 * np.pi * f * (1 + d) * t) for d in (-0.0035, 0.0035))
    tone += 0.45 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-5 * t) + 0.2 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-9 * t)
    return vel * tone * np.exp(-2.6 * t) * env(len(t), 0.002, 0.05, 1, 0.08)


# C major waltz: I, V7, I, IV, I, V7, I, V7 (one chord per bar).
CHORDS = [("C3", ["E3", "G3", "C4"]), ("G2", ["F3", "G3", "B3"]), ("C3", ["E3", "G3", "C4"]), ("F2", ["F3", "A3", "C4"]),
          ("C3", ["E3", "G3", "C4"]), ("G2", ["F3", "G3", "B3"]), ("A2", ["E3", "A3", "C4"]), ("G2", ["D3", "G3", "B3"])]
MELODY = [  # (bar, beat, note, beats)
    (0, 0, "E5", 1), (0, 1, "G5", 1), (0, 2, "E5", 1), (1, 0, "D5", 2), (1, 2, "B4", 1),
    (2, 0, "C5", 1), (2, 1, "E5", 1), (2, 2, "G5", 1), (3, 0, "A5", 2), (3, 2, "F5", 1),
    (4, 0, "E5", 1), (4, 1, "C5", 1), (4, 2, "E5", 1), (5, 0, "D5", 1), (5, 1, "F5", 1), (5, 2, "B4", 1),
    (6, 0, "C5", 1), (6, 1, "E5", 1), (6, 2, "A5", 1), (7, 0, "G5", 2), (7, 2, "D5", 1),
]


def score(seconds, bars):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for rep in range(bars // 8):
        for bar, (root, chord) in enumerate(CHORDS):
            t0 = (rep * 8 + bar) * 3 * BEAT
            place(buf, upright(hz(root), BEAT * 1.2, 0.55), t0)
            for b in (1, 2):
                for n in chord:
                    place(buf, upright(hz(n), BEAT * 0.7, 0.18), t0 + b * BEAT)
        for bar, beat, note, beats in MELODY:
            t0 = (rep * 8 + bar) * 3 * BEAT + beat * BEAT
            vel = 0.32 if rep % 2 == 0 else 0.28
            place(buf, upright(hz(note), beats * BEAT * 1.1, vel), t0)
    return buf


def main():
    bars = 32
    seconds = bars * 3 * BEAT
    one = score(seconds, bars)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.22, size=0.07)
    save(two[len(one):], "music/theatre.wav", peak=0.7, stereo_width=0.4)

    # Applause: hundreds of short claps that swell and fade.
    n = int(4 * RATE)
    clap = np.zeros(n)
    for _ in range(900):
        i = rng.integers(0, n - 2000)
        swell = np.sin(np.pi * i / n) ** 0.6
        burst = rng.standard_normal(600) * np.exp(-np.arange(600) / 90)
        clap[i:i + 600] += burst * swell * rng.uniform(0.2, 1)
    save(lowpass(clap, 2), "sfx/theatre-applause.wav", peak=0.6, stereo_width=0.7)

    # Curtain: a velvety whoosh.
    t = t_(1.6)
    noise = lowpass(rng.standard_normal(len(t)), 40)
    save(noise * np.sin(np.pi * t / 1.6) ** 1.5, "sfx/theatre-curtain.wav", peak=0.5, stereo_width=0.5)

    # Slide whistle: a comic swoop up then down.
    t = t_(0.9)
    f = 700 + 900 * np.sin(np.pi * t / 0.9)
    phase = 2 * np.pi * np.cumsum(f) / RATE
    save(np.sin(phase) * env(len(t), 0.03, 0.1, 0.9, 0.15), "sfx/theatre-slide.wav", peak=0.4)

    # Scurry: quick tiptoe footsteps.
    t = t_(0.8)
    steps = np.zeros(len(t))
    for k in range(10):
        place(steps, np.sin(2 * np.pi * 300 * t_(0.04)) * np.exp(-t_(0.04) * 90), k * 0.075)
    save(steps, "sfx/theatre-scurry.wav", peak=0.5)

    # A bright "ta-da" chord.
    t = t_(1.4)
    tada = sum(upright(hz(n), 1.4, 0.4) for n in ("C4", "E4", "G4", "C5"))
    save(tada, "sfx/theatre-tada.wav", peak=0.6)


if __name__ == "__main__":
    main()
