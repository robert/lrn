"""Score and effects for the 3D film "The Pancake Flip".

A bouncy kitchen tune: plucked ukulele strings (Karplus-Strong), a walking
bass and brushed snare. Plus a pancake flip (whoosh and soft landing) and a
paper slide. Run: tts/.venv/bin/python music/pancake.py
"""
import numpy as np
from synth import RATE, rng, hz, bass, brush, place, reverb, lowpass, save, t_

BPM = 116
BEAT = 60 / BPM
BARS = 16


def pluck(f, dur=0.9, vel=0.3, bright=0.5):
    """Karplus-Strong string: a burst of noise in a decaying delay line."""
    n = int(dur * RATE)
    period = max(2, int(RATE / f))
    buf = rng.uniform(-1, 1, period) * vel
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.996 * (bright * buf[i % period] + (1 - bright) * buf[(i + 1) % period])
    return out


CHORDS = [["C4", "E4", "G4", "C5"], ["A3", "C4", "E4", "A4"], ["F3", "A3", "C4", "F4"], ["G3", "B3", "D4", "G4"]]
STRUM = [0, 1, 1.5, 2.5, 3]  # a skippy strum pattern per bar
TUNE = ["E5", "G5", "A5", "G5", "E5", "D5", "C5", "D5"]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        chord = CHORDS[bar % 4]
        for s in STRUM:
            for k, n in enumerate(chord):
                place(buf, pluck(hz(n), 0.8, 0.12), t0 + s * BEAT + k * 0.012)
        for b in range(4):
            place(buf, bass(hz(chord[0]) / 2, BEAT * 0.8, 0.35), t0 + b * BEAT)
            if b in (1, 3):
                place(buf, brush(0.18, 0.06), t0 + b * BEAT)
        if bar % 4 in (1, 3):
            for k, n in enumerate(TUNE):
                place(buf, pluck(hz(n), 0.6, 0.16, 0.3), t0 + k * BEAT / 2)
    return buf


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.2, size=0.05)
    save(two[len(one):], "music/pancake.wav", peak=0.6, stereo_width=0.4)

    t = t_(1.1)  # the flip: an airy whoosh up, then a soft pat on landing
    whoosh = lowpass(rng.standard_normal(len(t)), 4) * np.sin(np.pi * np.minimum(1, t / 0.7)) ** 2 * (t < 0.7)
    land = np.zeros(len(t))
    i = int(0.78 * RATE)
    tt = t[: len(t) - i]
    land[i:] = (np.sin(2 * np.pi * 110 * tt) * np.exp(-tt * 30) + 0.4 * lowpass(rng.standard_normal(len(tt)), 3) * np.exp(-tt * 40))
    save(whoosh * 0.6 + land, "sfx/pancake-flip.wav", peak=0.6)

    t = t_(0.9)  # paper sliding on wood
    slide = lowpass(rng.standard_normal(len(t)), 2) * np.sin(np.pi * t / 0.9) * (0.6 + 0.4 * np.sin(2 * np.pi * 9 * t))
    save(slide, "sfx/pancake-slide.wav", peak=0.35)


if __name__ == "__main__":
    main()
