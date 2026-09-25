"""Chiptune score and arcade sound effects for "Code Breaker 3000".

An upbeat 8-bit loop: square-wave lead, pulse arpeggios, triangle bass and
noise drums. Plus coin, blip, level-up, power-up, wrong and key sounds.
Run: tts/.venv/bin/python music/arcade.py
"""
import numpy as np
from synth import RATE, rng, hz, square, triangle, place, save, t_

BPM = 138
BEAT = 60 / BPM
S = BEAT / 4  # a sixteenth
BARS = 16

# I - vi - IV - V in C, twice with a lift to F for bars 9-12.
PROG = [["C", "E", "G"], ["A", "C", "E"], ["F", "A", "C"], ["G", "B", "D"]]
ROOTS = ["C2", "A1", "F1", "G1"]
# A sunny lead melody, one entry per eighth note (None = rest).
LEAD = [
    "E5", None, "G5", "E5", "C5", None, "D5", "E5",
    "A4", None, "C5", "E5", "A5", "G5", "E5", None,
    "F5", None, "A5", "F5", "C5", None, "D5", "F5",
    "G5", "F5", "E5", "D5", "B4", None, "D5", None,
]
LEAD_B = [
    "C6", None, "B5", "G5", "E5", None, "G5", "C6",
    "A5", None, "G5", "E5", "C5", None, "E5", "A5",
    "F5", "A5", "C6", "A5", "F5", None, "A5", "C6",
    "B5", None, "G5", None, "D6", "C6", "B5", "G5",
]


def noise_hit(dur, vel, bright=True):
    n = int(dur * RATE)
    x = rng.standard_normal(n)
    # Crude 8-bit noise: hold each value for a few samples.
    hold = 3 if bright else 12
    x = np.repeat(x[::hold], hold)[:n]
    return vel * np.sign(x) * np.exp(-np.arange(n) / (dur * RATE / 4))


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        ci = bar % 4
        chord = PROG[ci]
        octave = 4 if bar < 8 else 5
        # Arpeggio on a thin pulse, every sixteenth.
        for i in range(16):
            n = chord[i % 3] + str(octave)
            place(buf, square(hz(n), S * 0.9, 0.06, duty=0.125), t0 + i * S)
        # Triangle bass: root on the beat, octave bounce on the offbeat.
        root = ROOTS[ci]
        up = root[:-1] + str(int(root[-1]) + 1)
        for b in range(4):
            place(buf, triangle(hz(root), BEAT * 0.45, 0.32), t0 + b * BEAT)
            place(buf, triangle(hz(up), BEAT * 0.4, 0.24), t0 + b * BEAT + BEAT / 2)
        # Drums: kick-ish low noise on 1 and 3, snare on 2 and 4, hats on eighths.
        for b in range(4):
            if b % 2 == 0:
                kick = triangle(hz("C2"), 0.12, 0.5) * np.exp(-np.arange(int(0.12 * RATE)) / 900)
                place(buf, kick, t0 + b * BEAT)
            else:
                place(buf, noise_hit(0.14, 0.16, bright=False), t0 + b * BEAT)
            place(buf, noise_hit(0.04, 0.05), t0 + b * BEAT + BEAT / 2)
        # Lead: melody A for the first half, melody B for the second half.
        mel = LEAD if bar < 8 else LEAD_B
        half = (bar % 4) * 8
        for i in range(8):
            n = mel[half + i]
            if n:
                place(buf, square(hz(n), BEAT / 2 * 0.85, 0.11, duty=0.5), t0 + i * BEAT / 2)
    return buf


def main():
    seconds = BARS * 4 * BEAT
    loop = score(seconds)[: int(seconds * RATE)]
    save(loop, "music/arcade.wav", peak=0.65, stereo_width=0.35)

    # Coin: the classic two-note ding.
    save(np.concatenate([square(hz("B5"), 0.07, 0.4), square(hz("E6"), 0.35, 0.4) * np.exp(-t_(0.35) * 6)]), "sfx/arcade-coin.wav", peak=0.5)
    # Blip: a short high chirp.
    save(square(hz("A6"), 0.05, 0.3, duty=0.25), "sfx/arcade-blip.wav", peak=0.35)
    # Key press for typing initials.
    save(square(hz("E6"), 0.03, 0.3, duty=0.125), "sfx/arcade-key.wav", peak=0.3)
    # Level up: a rising arpeggio.
    notes = ["C5", "E5", "G5", "C6", "E6", "G6", "C7"]
    save(np.concatenate([square(hz(n), 0.07, 0.3) for n in notes] + [square(hz("C7"), 0.3, 0.3) * np.exp(-t_(0.3) * 5)]), "sfx/arcade-levelup.wav", peak=0.45)
    # Power up: a pitch sweep with vibrato.
    t = t_(0.7)
    f = 300 + 1500 * t / 0.7
    phase = np.cumsum(f * (1 + 0.03 * np.sin(2 * np.pi * 18 * t))) / RATE
    save(np.where(phase % 1 < 0.5, 1.0, -1.0) * np.exp(-t * 1.5) * 0.3, "sfx/arcade-powerup.wav", peak=0.4)
    # Wrong / trap: a descending wah.
    save(np.concatenate([square(hz(n), 0.13, 0.3) for n in ["E4", "D#4", "D4"]] + [square(hz("C#4"), 0.4, 0.3) * np.exp(-t_(0.4) * 3)]), "sfx/arcade-wrong.wav", peak=0.4)
    # Big win jingle.
    win = ["C5", "E5", "G5", "C6", None, "G5", "C6"]
    parts = [square(hz(n), 0.1, 0.3) if n else np.zeros(int(0.1 * RATE)) for n in win]
    save(np.concatenate(parts + [square(hz("E6"), 0.6, 0.3) * np.exp(-t_(0.6) * 3)]), "sfx/arcade-win.wav", peak=0.45)


if __name__ == "__main__":
    main()
