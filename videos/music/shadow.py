"""Score and effects for the shadow-theatre film "Into the Wild Wood".

A slow, uneasy piece: a low bowed drone, a harp-like figure in D minor, and
a heartbeat that quickens. Plus a soft chime, thin whistles and pattering feet.
Run: tts/.venv/bin/python music/shadow.py
"""
import numpy as np
from synth import RATE, rng, hz, pad, place, reverb, lowpass, save, t_

BPM = 60
BEAT = 60 / BPM
BARS = 12


def cello(f, dur, vel=0.25):
    """A bowed tone: a few harmonics with slow vibrato and swell."""
    t = t_(dur)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5 * t)
    tone = sum(np.sin(2 * np.pi * f * k * np.cumsum(vib) / RATE) / k ** 1.3 for k in range(1, 7))
    return vel * tone * np.sin(np.pi * t / dur) ** 0.8


def harp(f, dur=2.0, vel=0.2):
    t = t_(dur)
    return vel * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-2.5 * t) * np.minimum(1, t * 500)


ROOTS = ["D2", "Bb1", "G1", "A1"]
ARP = [["D4", "F4", "A4", "D5"], ["Bb3", "D4", "F4", "A4"], ["G3", "Bb3", "D4", "G4"], ["A3", "C#4", "E4", "A4"]]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 4)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        i = (bar // 1) % 4
        place(buf, cello(hz(ROOTS[i]), 4 * BEAT + 0.5, 0.2), t0)
        place(buf, pad([hz(ROOTS[i]) * 2, hz(ROOTS[i]) * 3], 4 * BEAT, 0.25), t0)
        for j, n in enumerate(ARP[i] + ARP[i][::-1][1:3]):
            place(buf, harp(hz(n), 2.2, 0.12), t0 + j * (4 * BEAT / 6))
    return buf


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.4, size=0.12)
    save(lowpass(two[len(one):], 3), "music/shadow.wav", peak=0.55, stereo_width=0.5)

    save(reverb(harp(hz("A5"), 2.5, 0.5) + harp(hz("D6"), 2.5, 0.3), mix=0.4), "sfx/shadow-chime.wav", peak=0.4)

    # Thin whistles calling from far away, left and right.
    buf = np.zeros(int(3.0 * RATE))
    for k, start in enumerate([0.0, 0.7, 1.3, 2.0]):
        t = t_(0.5)
        f = 1800 + 300 * np.sin(2 * np.pi * 2 * t) + k * 120
        place(buf, 0.3 * np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.sin(np.pi * t / 0.5), start)
    save(reverb(buf, mix=0.5, size=0.15), "sfx/shadow-whistle.wav", peak=0.35, stereo_width=0.8)

    # Pattering: soft little feet, many of them, getting closer.
    n = int(4.0 * RATE)
    buf = np.zeros(n)
    for i in range(160):
        at = rng.uniform(0, 3.9)
        t = t_(0.03)
        tap = lowpass(rng.standard_normal(len(t)), 8) * np.exp(-t * 200) * (0.2 + 0.8 * at / 4)
        place(buf, tap, at)
    save(buf, "sfx/shadow-patter.wav", peak=0.5, stereo_width=0.7)


if __name__ == "__main__":
    main()
