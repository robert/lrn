"""Railway score and sound effects for "The Sequence Express".

A jaunty chugging tune in G major at a trotting 2/4: an oom-pah bass,
brushed chuffs on every eighth like a steam engine, and a whistled folk
melody on a soft triangle wave. Plus a steam whistle, a single chuff and a
coupling clank. Run: tts/.venv/bin/python music/train.py
"""
import numpy as np
from synth import RATE, rng, hz, bass, brush, triangle, epiano, place, reverb, lowpass, save, t_

BPM = 112
BEAT = 60 / BPM
BARS = 16

# Bars of (bass root, fifth, chord for the piano).
HARM = [
    ("G2", "D3", ["B3", "D4", "G4"]), ("G2", "D3", ["B3", "D4", "G4"]),
    ("C3", "G2", ["C4", "E4", "G4"]), ("D3", "A2", ["C4", "D4", "F#4"]),
    ("G2", "D3", ["B3", "D4", "G4"]), ("E2", "B2", ["B3", "E4", "G4"]),
    ("A2", "E2", ["C4", "E4", "A4"]), ("D3", "A2", ["C4", "D4", "F#4"]),
]
# The melody, in eighth notes (None is a rest). Two phrases, 8 bars each.
TUNE = [
    "D5", "B4", "G4", "B4", "D5", "E5", "D5", None,
    "C5", "E5", "G5", "E5", "D5", "C5", "B4", "A4",
    "G4", "B4", "D5", "G5", "F#5", "E5", "D5", None,
    "E5", "C5", "A4", "C5", "B4", "A4", "G4", None,
]


def whistle_note(f, dur, vel=0.18):
    t = t_(dur)
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t * 4)
    ph = 2 * np.pi * np.cumsum(f * vib) / RATE
    breath = lowpass(rng.standard_normal(len(t)), 3) * 0.04
    e = np.minimum(1, t / 0.03) * np.minimum(1, (t[-1] - t) / 0.05 + 0.0001)
    return vel * (np.sin(ph) + 0.15 * np.sin(2 * ph) + breath) * e


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for bar in range(BARS):
        t0 = bar * 2 * BEAT
        root, fifth, chord = HARM[bar % 8]
        place(buf, bass(hz(root), BEAT * 0.8, 0.6), t0)
        place(buf, bass(hz(fifth), BEAT * 0.8, 0.45), t0 + BEAT)
        for off in (0.5, 1.5):
            for i, n in enumerate(chord):
                place(buf, epiano(hz(n), BEAT * 0.35, 0.07), t0 + off * BEAT + i * 0.006)
        # Chuff chuff: a brushed shuffle on every eighth, accent on the beat.
        for e in range(4):
            place(buf, brush(0.14, 0.11 if e % 2 == 0 else 0.06), t0 + e * BEAT / 2)
        # Whistled tune.
        for e in range(4):
            n = TUNE[(bar * 4 + e) % len(TUNE)]
            if n:
                place(buf, whistle_note(hz(n), BEAT * 0.48), t0 + e * BEAT / 2)
    return buf


def main():
    seconds = BARS * 2 * BEAT
    full = score(seconds)
    one = full[: int(seconds * RATE)].copy()
    tail = full[int(seconds * RATE):]
    one[: len(tail)] += tail[: len(one)]
    two = reverb(np.concatenate([one, one]), mix=0.18, size=0.06)
    save(two[len(one):], "music/train.wav", peak=0.7, stereo_width=0.4)

    # Steam whistle: two pipes a sixth apart, breathy, bending up at the start.
    t = t_(1.8)
    bend = 1 - 0.04 * np.exp(-t * 8)
    tone = np.zeros(len(t))
    for f in (hz("A5"), hz("F#5"), hz("C#6")):
        tone += np.sin(2 * np.pi * np.cumsum(f * bend) / RATE)
    air = lowpass(rng.standard_normal(len(t)), 2) * 0.35
    e = np.minimum(1, t / 0.05) * np.minimum(1, (t[-1] - t) / 0.4)
    save(reverb((tone / 3 + air) * e, mix=0.35, size=0.09), "sfx/train-whistle.wav", peak=0.55)

    # One chuff: a burst of low steam.
    t = t_(0.35)
    chuff = lowpass(rng.standard_normal(len(t)), 12) * np.exp(-t * 11)
    save(chuff, "sfx/train-chuff.wav", peak=0.5)

    # Coupling clank: metal on metal, inharmonic partials.
    t = t_(0.9)
    clank = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, d in [(410, 9), (1230, 14), (2210, 20), (3370, 28)])
    clank += rng.standard_normal(len(t)) * np.exp(-t * 60) * 0.8
    save(reverb(clank, mix=0.2, size=0.04), "sfx/train-clank.wav", peak=0.6)

    # Station bell: a single bright ding.
    t = t_(1.5)
    ding = (np.sin(2 * np.pi * 1568 * t) + 0.5 * np.sin(2 * np.pi * 3950 * t)) * np.exp(-t * 3.5)
    save(ding, "sfx/train-ding.wav", peak=0.35)


if __name__ == "__main__":
    main()
