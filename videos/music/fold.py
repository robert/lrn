"""Score and effects for the origami film "The Paper Fold".

A calm koto-like piece: plucked strings (Karplus-Strong) on a Japanese
pentatonic scale over a soft, low drone. Plus the sounds of paper:
a fold, a crisp crease, a gentle press and an unfold.
Run: tts/.venv/bin/python music/fold.py
"""
import numpy as np
from synth import RATE, rng, hz, pad, place, reverb, lowpass, save, t_

BPM = 72
BEAT = 60 / BPM
BARS = 16


def pluck(f, dur=1.8, vel=0.3, bright=0.35):
    """A koto-ish string: Karplus-Strong with a slow, clean decay."""
    n = int(dur * RATE)
    period = max(2, int(RATE / f))
    buf = rng.uniform(-1, 1, period) * vel
    out = np.zeros(n)
    for i in range(n):
        j = i % period
        out[i] = buf[j]
        buf[j] = 0.997 * (bright * buf[j] + (1 - bright) * buf[(j + 1) % period])
    return out


# Hirajoshi-flavoured scale on D: D, E, F, A, Bb.
SCALE = ["D4", "E4", "F4", "A4", "Bb4", "D5", "E5", "F5", "A5"]
PHRASE = [  # (beat, scale step), a slow falling-and-rising figure over 4 bars
    (0, 7), (1, 6), (1.5, 5), (3, 3),
    (4, 4), (5, 3), (6, 2), (7.5, 0),
    (8, 5), (9, 6), (9.5, 7), (11, 8),
    (12, 7), (13, 5), (14, 3), (14.5, 4),
]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 3)
    for bar in range(0, BARS, 2):
        place(buf, pad([hz("D2"), hz("A2"), hz("D3")], 8 * BEAT + 1, 0.22), bar * 4 * BEAT)
    for rep in range(BARS // 4):
        t0 = rep * 16 * BEAT
        for beat, step in PHRASE:
            place(buf, pluck(hz(SCALE[step]), 2.0, 0.22), t0 + beat * BEAT)
        # A low open string now and then, like a bass koto.
        place(buf, pluck(hz("D3"), 2.5, 0.18, 0.5), t0)
        place(buf, pluck(hz("A2"), 2.5, 0.15, 0.5), t0 + 8 * BEAT)
    return buf


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.4, size=0.1)
    save(lowpass(two[len(one):], 2), "music/fold.wav", peak=0.55, stereo_width=0.5)

    # A fold: paper swishing up and over.
    t = t_(0.9)
    swish = lowpass(rng.standard_normal(len(t)), 5) * np.sin(np.pi * t / 0.9) ** 2
    save(swish, "sfx/fold-fold.wav", peak=0.4)

    # A crisp crease: a short papery crackle.
    t = t_(0.35)
    crackle = rng.standard_normal(len(t)) * (rng.random(len(t)) > 0.7) * np.exp(-t * 12)
    save(lowpass(crackle, 2), "sfx/fold-crease.wav", peak=0.45)

    # A gentle press: a soft, low pat.
    t = t_(0.4)
    press = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 25) + 0.3 * lowpass(rng.standard_normal(len(t)), 6) * np.exp(-t * 30)
    save(press, "sfx/fold-press.wav", peak=0.5)

    # Unfold: a softer, longer rustle.
    t = t_(1.2)
    rustle = lowpass(rng.standard_normal(len(t)), 4) * np.sin(np.pi * t / 1.2) * (0.5 + 0.5 * np.sin(2 * np.pi * 5 * t) ** 2)
    save(rustle, "sfx/fold-unfold.wav", peak=0.35)

    # A single bright pluck for the answer reveal.
    save(reverb(pluck(hz("A5"), 2.5, 0.5, 0.25) + pluck(hz("D6"), 2.5, 0.3, 0.25), mix=0.4), "sfx/fold-bell.wav", peak=0.45)


if __name__ == "__main__":
    main()
