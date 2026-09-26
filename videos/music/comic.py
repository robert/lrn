"""Score and effects for "Captain Sharp-Eye and the Switcheroo" (comic book).

A bouncy superhero loop: brassy square-wave stabs, a driving bass, snare and
kick. Plus swish, sneaky pizzicato, whoosh, ding and a big KAPOW.
Run: tts/.venv/bin/python music/comic.py
"""
import numpy as np
from synth import RATE, rng, hz, square, triangle, bass, place, reverb, lowpass, save, t_

BPM = 132
BEAT = 60 / BPM
BARS = 16


def brass(f, dur, vel=0.3):
    """Two detuned squares with a soft attack, like a brass section."""
    a = square(f, dur, vel, 0.3) + square(f * 1.006, dur, vel * 0.8, 0.45)
    return lowpass(a, 5)


def kick(vel=0.9):
    t = t_(0.3)
    return vel * np.sin(2 * np.pi * (50 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 12)


def snare(vel=0.4):
    t = t_(0.2)
    return vel * (rng.standard_normal(len(t)) * np.exp(-t * 22) + 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30))


RIFF = [(0, "C4", 0.5), (0.75, "C4", 0.25), (1.5, "Eb4", 0.5), (2.5, "F4", 0.5), (3.25, "G4", 0.75)]
CHORDS = [["C3", "G3", "C4"], ["Ab2", "Eb3", "Ab3"], ["Bb2", "F3", "Bb3"], ["G2", "D3", "G3"]]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        chord = CHORDS[bar % 4]
        for b in range(4):
            place(buf, kick(0.7), t0 + b * BEAT)
            if b in (1, 3):
                place(buf, snare(0.35), t0 + b * BEAT)
            for half in (0, 0.5):
                place(buf, bass(hz(chord[0]) / 2 * 2, BEAT * 0.45, 0.45), t0 + (b + half) * BEAT)
        if bar % 2 == 0:
            shift = 0 if bar % 4 == 0 else -2
            for beat, n, d in RIFF:
                f = hz(n) * 2 ** (shift / 12)
                place(buf, brass(f, d * BEAT, 0.22), t0 + beat * BEAT)
        else:
            for beat in (0, 1.5, 3):
                for n in chord:
                    place(buf, brass(hz(n) * 2, 0.35 * BEAT, 0.08), t0 + beat * BEAT)
    return buf


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.18, size=0.05)
    save(two[len(one):], "music/comic.wav", peak=0.6, stereo_width=0.4)

    t = t_(0.45)
    save(lowpass(rng.standard_normal(len(t)), 4) * np.sin(np.pi * t / 0.45) ** 2, "sfx/comic-swish.wav", peak=0.45)

    buf = np.zeros(int(1.6 * RATE))  # tiptoe pizzicato: sneaky steps
    for i, n in enumerate(["C3", "Eb3", "G3", "F#3", "G3", "Eb3", "C3", "B2"]):
        place(buf, triangle(hz(n), 0.12, 0.5) * np.exp(-np.arange(int(0.12 * RATE)) / RATE * 25), i * 0.19)
    save(buf, "sfx/comic-sneak.wav", peak=0.5)

    t = t_(0.8)
    whoosh = lowpass(rng.standard_normal(len(t)), 3) * np.sin(np.pi * t / 0.8) ** 3
    save(whoosh, "sfx/comic-whoosh.wav", peak=0.5)

    t = t_(1.2)
    ding = (np.sin(2 * np.pi * 1568 * t) + 0.5 * np.sin(2 * np.pi * 2349 * t)) * np.exp(-t * 4)
    save(ding, "sfx/comic-ding.wav", peak=0.4)

    t = t_(1.0)  # KAPOW: a punch, a crash and a brass hit
    punch = kick(1.0)
    crash = rng.standard_normal(len(t)) * np.exp(-t * 5) * 0.5
    hit = brass(hz("C5"), 0.6, 0.4)
    k = np.zeros(len(t)); k[: len(punch)] += punch; k += crash; k[: len(hit)] += hit
    save(k, "sfx/comic-kapow.wav", peak=0.7)


if __name__ == "__main__":
    main()
