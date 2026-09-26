"""Bouncy pizzicato and ukulele tune for "The Great Balance Bake-Off".

Plucked strings and a strummed ukulele in F major, light and cheerful,
plus kitchen sounds: a timer ding, a whisk, a clock tick and a springy
scale settling. Run: tts/.venv/bin/python music/bakeoff.py
"""
import numpy as np
from synth import RATE, rng, hz, place, reverb, lowpass, save, t_, env

BPM = 116
BEAT = 60 / BPM


def pizz(f, vel=0.4):
    t = t_(0.6)
    tone = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-8 * t)
    return vel * tone * np.exp(-9 * t) * env(len(t), 0.002, 0.02, 1, 0.02)


def uke(notes, vel=0.25, down=True):
    """A quick strum: each string a bright triangle-ish pluck, slightly staggered."""
    out = np.zeros(int(0.8 * RATE))
    order = notes if down else notes[::-1]
    for i, n in enumerate(order):
        t = t_(0.7)
        f = hz(n)
        wave = 2 * np.abs(2 * ((t * f) % 1) - 1) - 1
        place(out, vel * wave * np.exp(-6 * t), i * 0.012)
    return lowpass(out, 3)


CHORDS = [["F3", "A3", "C4", "F4"], ["D3", "F3", "A3", "D4"], ["Bb2", "D3", "F3", "Bb3"], ["C3", "E3", "G3", "C4"]]
BASS = ["F2", "D2", "Bb1", "C2"]
TUNE = ["C5", "A4", "F4", "A4", "Bb4", "A4", "G4", "F4", "A4", "F4", "D4", "F4", "G4", "E4", "C4", "E4"]


def score(seconds, bars):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for bar in range(bars):
        t0 = bar * 4 * BEAT
        ci = bar % 4
        place(buf, pizz(hz(BASS[ci]), 0.6), t0)
        place(buf, pizz(hz(BASS[ci]) * 1.5, 0.4), t0 + 2 * BEAT)
        # Uke: down, down-up, up-down-up pattern.
        for at, down in ((0, True), (1, True), (1.5, False), (2.5, False), (3, True), (3.5, False)):
            place(buf, uke(CHORDS[ci], 0.12, down), t0 + at * BEAT)
        # Pizzicato tune, one note a beat, every other phrase an octave up.
        if bar % 8 >= 4 or bar >= 8:
            for b in range(4):
                n = TUNE[(bar % 4) * 4 + b]
                f = hz(n) * (2 if bar % 16 >= 12 else 1)
                place(buf, pizz(f, 0.35), t0 + b * BEAT)
    return buf


def main():
    bars = 16
    seconds = bars * 4 * BEAT
    one = score(seconds, bars)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.15, size=0.05)
    save(two[len(one):], "music/bakeoff.wav", peak=0.65, stereo_width=0.4)

    t = t_(1.6)
    ding = (np.sin(2 * np.pi * 1568 * t) + 0.5 * np.sin(2 * np.pi * 3136 * t) + 0.25 * np.sin(2 * np.pi * 4700 * t)) * np.exp(-3 * t)
    save(ding, "sfx/bakeoff-ding.wav", peak=0.45)

    n = int(1.2 * RATE)
    whisk = np.zeros(n)
    for k in range(9):
        place(whisk, lowpass(rng.standard_normal(int(0.1 * RATE)), 2) * np.hanning(int(0.1 * RATE)), k * 0.13)
    save(whisk, "sfx/bakeoff-whisk.wav", peak=0.4)

    t = t_(0.12)
    tick = rng.standard_normal(len(t)) * np.exp(-t * 120) + np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 200)
    save(tick, "sfx/bakeoff-tick.wav", peak=0.45)

    # A brass scale settling: a boing that wobbles down.
    t = t_(1.0)
    f = 220 + 80 * np.exp(-4 * t) * np.cos(2 * np.pi * 6 * t)
    boing = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-4 * t)
    clank = np.sin(2 * np.pi * 1300 * t) * np.exp(-t * 30) * 0.4
    save(boing + clank, "sfx/bakeoff-scale.wav", peak=0.5)

    # A little fanfare for "a perfect bake!".
    fan = np.zeros(int(1.6 * RATE))
    for i, n in enumerate(["C5", "E5", "G5", "C6"]):
        place(fan, pizz(hz(n), 0.5), i * 0.11)
    place(fan, uke(["C4", "E4", "G4", "C5"], 0.4), 0.44)
    save(fan, "sfx/bakeoff-fanfare.wav", peak=0.6)


if __name__ == "__main__":
    main()
