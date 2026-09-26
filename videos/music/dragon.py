"""Score and sound effects for the pop-up book film "The Dragon's Three Riddles".

A music-box waltz in D major over a soft pad, plus page turns, a friendly
roar, a fanfare, a splash, magic sparkles and a drawbridge.
Run: tts/.venv/bin/python music/dragon.py
"""
import numpy as np
from synth import RATE, rng, hz, pad, triangle, place, reverb, lowpass, save, t_

BPM = 96
BEAT = 60 / BPM
BARS = 16


def musicbox(f, dur=1.4, vel=0.3):
    """A plucked comb: bright partials that ring and fade."""
    t = t_(dur)
    tone = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-6 * t) + 0.25 * np.sin(2 * np.pi * 4.2 * f * t) * np.exp(-12 * t)
    return vel * tone * np.exp(-3 * t) * np.minimum(1, t * 400)


# D, A, Bm, G ... a simple storybook progression, two bars each.
CHORDS = [["D3", "A3", "D4", "F#4"], ["A2", "E3", "A3", "C#4"], ["B2", "F#3", "B3", "D4"], ["G2", "D3", "G3", "B3"]]
MELODY = [  # (beat, note) across 16 bars of 3/4
    (0, "F#5"), (1, "E5"), (2, "D5"), (3, "A5"), (5, "F#5"),
    (6, "E5"), (7, "C#5"), (8, "E5"), (9, "A4"),
    (12, "B4"), (13, "D5"), (14, "F#5"), (15, "B5"), (17, "A5"),
    (18, "G5"), (19, "F#5"), (20, "E5"), (21, "D5"), (22, "E5"),
    (24, "F#5"), (25, "A5"), (26, "D6"), (27, "C#6"), (29, "A5"),
    (30, "B5"), (31, "A5"), (32, "E5"), (33, "C#5"),
    (36, "D5"), (37, "F#5"), (38, "B5"), (39, "A5"), (40, "F#5"), (41, "D5"),
    (42, "E5"), (43, "G5"), (44, "F#5"), (45, "D5"),
]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 3)
    for bar in range(BARS):
        t0 = bar * 3 * BEAT
        chord = CHORDS[(bar // 2) % 4]
        if bar % 2 == 0:
            place(buf, pad([hz(n) for n in chord], 6 * BEAT, 0.5), t0)
        # Waltz bass: root on 1, chord on 2 and 3.
        place(buf, triangle(hz(chord[0]), BEAT * 0.9, 0.18), t0)
        for b in (1, 2):
            for n in chord[1:3]:
                place(buf, musicbox(hz(n), 0.8, 0.06), t0 + b * BEAT)
    for beat, n in MELODY:
        place(buf, musicbox(hz(n), 1.6, 0.22), beat * BEAT)
        place(buf, musicbox(hz(n), 1.6, 0.22), (beat + 48) * BEAT)  # second time round
    return buf


def main():
    seconds = BARS * 3 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.35, size=0.1)
    save(lowpass(two[len(one):], 2), "music/dragon.wav", peak=0.6, stereo_width=0.5)

    # Page turn: a rising papery swish.
    t = t_(0.6)
    swish = lowpass(rng.standard_normal(len(t)), 6) * np.sin(np.pi * t / 0.6) ** 2
    save(swish, "sfx/page.wav", peak=0.45)

    # A friendly roar: a low growl that wobbles up, not scary.
    t = t_(1.4)
    f = 90 + 40 * np.sin(np.pi * t / 1.4)
    growl = np.sin(2 * np.pi * np.cumsum(f) / RATE) * (1 + 0.5 * np.sin(2 * np.pi * 28 * t))
    growl = np.tanh(2 * growl) * np.sin(np.pi * t / 1.4) + 0.3 * lowpass(rng.standard_normal(len(t)), 20) * np.sin(np.pi * t / 1.4)
    save(growl, "sfx/roar.wav", peak=0.6)

    # Fanfare: three bright rising notes and a held chord.
    buf = np.zeros(int(2.4 * RATE))
    for i, n in enumerate(["D5", "F#5", "A5"]):
        place(buf, musicbox(hz(n), 0.6, 0.5), i * 0.14)
    for n in ["D5", "F#5", "A5", "D6"]:
        place(buf, musicbox(hz(n), 2.0, 0.4), 0.45)
    save(reverb(buf, mix=0.3), "sfx/fanfare.wav", peak=0.6)

    # Splash: a burst of filtered noise with a drip after.
    t = t_(0.9)
    splash = lowpass(rng.standard_normal(len(t)), 5) * np.exp(-t * 6) + 0.3 * np.sin(2 * np.pi * (900 - 500 * t) * t) * np.exp(-((t - 0.5) ** 2) * 200)
    save(splash, "sfx/splash.wav", peak=0.5)

    # Magic: a shimmering glissando of little bells.
    buf = np.zeros(int(1.6 * RATE))
    for i in range(14):
        place(buf, musicbox(hz("D5") * 2 ** (i / 7), 0.7, 0.2), i * 0.05)
    save(reverb(buf, mix=0.4), "sfx/magic.wav", peak=0.5)

    # Drawbridge: a creaking chain and a thud.
    t = t_(2.2)
    creak = np.sin(2 * np.pi * (180 + 60 * np.sin(2 * np.pi * 3 * t)) * t) * (rng.random(len(t)) > 0.6) * 0.4 * np.minimum(1, t * 3)
    thud = np.zeros(len(t))
    i = int(1.9 * RATE)
    thud[i:] = np.sin(2 * np.pi * 70 * t[: len(t) - i]) * np.exp(-t[: len(t) - i] * 20)
    save(lowpass(creak, 3) + thud, "sfx/drawbridge.wav", peak=0.6)


if __name__ == "__main__":
    main()
