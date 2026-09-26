"""Score and sound effects for "Professor Chalk's Magic Changes".

A light-footed waltz: plucked pizzicato strings (Karplus-Strong) with a
music-box melody on top. Plus chalk scratches, a chalk tap, an eraser wipe,
a music-box ding for right answers and a wooden bonk for traps.
Run: tts/.venv/bin/python music/chalk.py
"""
import numpy as np
from synth import RATE, rng, hz, place, reverb, lowpass, save, t_

BPM = 100
BEAT = 60 / BPM
BARS = 16


def pluck(f, dur, vel=0.5, bright=0.5):
    """Karplus-Strong plucked string: a noise burst through a delay loop."""
    n = int(dur * RATE)
    period = max(2, int(RATE / f))
    buf = rng.uniform(-1, 1, period) * vel
    # Soften the initial burst for a rounder pizzicato.
    buf = lowpass(buf, 2 if bright > 0.5 else 4)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % period]
        nxt = buf[(i + 1) % period]
        buf[i % period] = 0.996 * 0.5 * (buf[i % period] + nxt)
    return out * np.exp(-np.arange(n) / (0.5 * RATE))


def musicbox(f, dur, vel=0.3):
    t = t_(dur)
    tone = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 9) + 0.25 * np.sin(2 * np.pi * 6.8 * f * t) * np.exp(-t * 14)
    return vel * tone * np.exp(-t * 3.2) * np.minimum(1, t * 800)


# G, Em, C, D: an oom-pah-pah waltz.
CHORDS = [("G2", ["B3", "D4", "G4"]), ("E2", ["G3", "B3", "E4"]), ("C3", ["E3", "G3", "C4"]), ("D3", ["F#3", "A3", "D4"])]
MELODY = [
    "D5", "G5", "B5", "A5", "G5", "E5", "G5", None, "E5", "D5", "B4", "D5",
    "E5", "G5", "C6", "B5", "A5", "G5", "F#5", "A5", "D6", "C6", "B5", "A5",
]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 3)
    mel_i = 0
    for bar in range(BARS):
        t0 = bar * 3 * BEAT
        root, chord = CHORDS[bar % 4]
        place(buf, pluck(hz(root), 1.2, 0.6), t0)  # oom
        for b in (1, 2):                            # pah pah
            for i, n in enumerate(chord):
                place(buf, pluck(hz(n), 0.6, 0.22, bright=0.8), t0 + b * BEAT + i * 0.008)
        # Music box sings on the second half of the loop, sparser at first.
        if bar >= 4:
            for b in range(3):
                n = MELODY[mel_i % len(MELODY)]
                mel_i += 1
                if n and (bar >= 8 or b == 0):
                    place(buf, musicbox(hz(n), 1.4, 0.16), t0 + b * BEAT)
    return buf


def main():
    seconds = BARS * 3 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.28, size=0.07)
    save(two[len(one):], "music/chalk.wav", peak=0.6, stereo_width=0.45)

    # Chalk scratch: gritty, band-limited noise with a jittery grip.
    t = t_(0.9)
    grit = rng.standard_normal(len(t))
    grit = grit - lowpass(grit, 6)
    stutter = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 31 * t + 3 * np.sin(2 * np.pi * 3 * t)))
    save(grit * stutter * np.minimum(1, t * 30) * np.minimum(1, (0.9 - t) * 10), "sfx/chalk-scratch.wav", peak=0.3)
    # A quick chalk tap (a dot or a full stop).
    t = t_(0.08)
    save(rng.standard_normal(len(t)) * np.exp(-t * 90) + 0.5 * np.sin(2 * np.pi * 900 * t) * np.exp(-t * 120), "sfx/chalk-tap.wav", peak=0.4)
    # Eraser wipe: soft felt swish back and forth.
    t = t_(1.3)
    felt = lowpass(rng.standard_normal(len(t)), 12)
    save(felt * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 2.2 * t))) * np.minimum(1, t * 8) * np.minimum(1, (1.3 - t) * 6), "sfx/chalk-eraser.wav", peak=0.35)
    # Right answer: a music-box flourish.
    ding = np.zeros(int(1.8 * RATE))
    for i, n in enumerate(["G5", "B5", "D6", "G6"]):
        place(ding, musicbox(hz(n), 1.4, 0.4), i * 0.09)
    save(ding, "sfx/chalk-ding.wav", peak=0.45)
    # Trap: a hollow wooden bonk.
    t = t_(0.45)
    bonk = np.sin(2 * np.pi * (220 - 80 * t) * t) * np.exp(-t * 12) + 0.3 * np.sin(2 * np.pi * 440 * t) * np.exp(-t * 30)
    save(bonk, "sfx/chalk-bonk.wav", peak=0.5)


if __name__ == "__main__":
    main()
