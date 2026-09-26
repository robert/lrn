"""Chiptune score and effects for the play-along RPG "Shape Quest".

A bouncy Game Boy style adventure loop: a square-wave lead, a thinner square
harmony, a triangle bass and noise drums. Plus select, hit, hurt, appear,
victory and level-up sounds (quest-*.wav).
Run: tts/.venv/bin/python music/quest.py
"""
import numpy as np
from synth import RATE, rng, hz, square, triangle, place, lowpass, save, t_

BPM = 140
BEAT = 60 / BPM
STEP = BEAT / 2  # eighth notes

# Eight bars of melody (eighth notes, "-" holds, "." rests), in C major.
LEAD = (
    "E5 - G5 - C6 - B5 A5 | G5 - E5 - C5 - D5 E5 | F5 - A5 - F5 E5 D5 - | E5 - - - . . G4 . |"
    "E5 - G5 - C6 - D6 E6 | D6 - C6 - A5 - G5 A5 | G5 E5 C5 E5 D5 - B4 - | C5 - - - . . . . |"
)
BASS = ["C3", "A2", "F2", "G2", "C3", "A2", "G2", "C3"]
CHORD = [["E4", "G4"], ["E4", "A4"], ["F4", "A4"], ["D4", "G4"], ["E4", "G4"], ["F4", "A4"], ["D4", "G4"], ["E4", "G4"]]


def noise(dur, vel, bright=True):
    t = t_(dur)
    n = rng.standard_normal(len(t))
    if not bright:
        n = lowpass(n, 6)
    return vel * n * np.exp(-t * (60 if bright else 25))


def score():
    steps = [s for s in LEAD.replace("|", " ").split() if s]
    total = len(steps) * STEP
    buf = np.zeros(int(total * RATE) + RATE)
    # Lead: hold notes across "-".
    i = 0
    while i < len(steps):
        s = steps[i]
        if s in "-.":
            i += 1
            continue
        length = 1
        while i + length < len(steps) and steps[i + length] == "-":
            length += 1
        place(buf, square(hz(s), length * STEP * 0.95, 0.16, 0.25), i * STEP)
        i += length
    bars = len(steps) // 8
    for b in range(bars):
        t0 = b * 8 * STEP
        # Bass: root on the beat, octave on the off-beat.
        for k in range(4):
            f = hz(BASS[b % 8])
            place(buf, triangle(f, BEAT * 0.45, 0.28), t0 + k * BEAT)
            place(buf, triangle(f * 2, BEAT * 0.3, 0.16), t0 + k * BEAT + STEP)
        # Harmony stabs on 2 and 4.
        for k in (1, 3):
            for n in CHORD[b % 8]:
                place(buf, square(hz(n), STEP * 0.8, 0.05, 0.125), t0 + k * BEAT)
        # Drums: kick-ish thump on 1 and 3, snare noise on 2 and 4, hats on eighths.
        for k in range(8):
            place(buf, noise(0.03, 0.05), t0 + k * STEP)
        for k in (0, 2):
            place(buf, triangle(55, 0.12, 0.5) * np.exp(-np.arange(int(0.12 * RATE)) / RATE * 30), t0 + k * BEAT)
        for k in (1, 3):
            place(buf, noise(0.12, 0.16, bright=False), t0 + k * BEAT)
    return buf[: int(total * RATE)]


def sweep(f0, f1, dur, vel=0.3, duty=0.5):
    t = t_(dur)
    f = np.linspace(f0, f1, len(t))
    wave = np.where((np.cumsum(f) / RATE) % 1 < duty, 1.0, -1.0)
    return vel * wave * np.minimum(1, (dur - t) * 30)


def notes(seq, step=0.07, vel=0.25):
    buf = np.zeros(int((len(seq) * step + 0.4) * RATE))
    for i, n in enumerate(seq):
        place(buf, square(hz(n), step * 0.9, vel, 0.25), i * step)
    return buf


def main():
    save(score(), "music/quest.wav", peak=0.55)
    save(notes(["C6", "G6"], 0.05, 0.3), "sfx/quest-select.wav", peak=0.35)
    hit = np.zeros(int(0.5 * RATE))
    place(hit, noise(0.25, 0.6, bright=False), 0)
    place(hit, sweep(900, 120, 0.35, 0.3), 0.02)
    save(hit, "sfx/quest-hit.wav", peak=0.6)
    save(sweep(300, 90, 0.45, 0.35, 0.3), "sfx/quest-hurt.wav", peak=0.5)
    save(notes(["C5", "E5", "G5", "C6", "E6", "G6", "C7"], 0.045, 0.2), "sfx/quest-appear.wav", peak=0.4)
    save(notes(["G5", "G5", "G5", "E5", "-", "C6", "C6"][:1] + ["C5", "E5", "G5", "C6", "G5", "C6"], 0.12, 0.25), "sfx/quest-victory.wav", peak=0.45)
    save(notes(["C5", "D5", "E5", "G5", "C6", "E6", "G6", "C7", "G6", "C7"], 0.06, 0.22), "sfx/quest-levelup.wav", peak=0.45)


if __name__ == "__main__":
    main()
