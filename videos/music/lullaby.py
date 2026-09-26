"""A music-box lullaby for "Goodnight, Twelve Things".

Slow 3/4, an original tune on a music box over a very soft pad.
Run: tts/.venv/bin/python music/lullaby.py
"""
import numpy as np
from synth import RATE, hz, pad, place, reverb, lowpass, save, t_

BPM = 66
BEAT = 60 / BPM


def musicbox(f, dur=2.4, vel=0.3):
    t = t_(dur)
    tone = np.sin(2 * np.pi * f * t) + 0.45 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-5 * t) + 0.2 * np.sin(2 * np.pi * 4.1 * f * t) * np.exp(-10 * t)
    return vel * tone * np.exp(-1.6 * t) * np.minimum(1, t * 400)


TUNE = [  # (beat, note), 16 bars of 3/4
    (0, "E5"), (1, "G5"), (2, "E5"), (3, "D5"), (5, "C5"),
    (6, "D5"), (7, "E5"), (8, "G5"), (9, "E5"),
    (12, "A5"), (13, "G5"), (14, "E5"), (15, "D5"), (17, "E5"),
    (18, "C5"), (21, "G4"),
    (24, "E5"), (25, "G5"), (26, "C6"), (27, "B5"), (29, "G5"),
    (30, "A5"), (31, "G5"), (32, "E5"), (33, "D5"),
    (36, "E5"), (37, "D5"), (38, "C5"), (39, "D5"), (41, "E5"),
    (42, "C5"),
]
CHORDS = [["C3", "G3", "E4"], ["G2", "D3", "B3"], ["A2", "E3", "C4"], ["F2", "C3", "A3"]]


def main():
    bars = 16
    seconds = bars * 3 * BEAT
    buf = np.zeros(int(seconds * RATE) + RATE * 4)
    for bar in range(bars):
        chord = CHORDS[bar % 4]
        place(buf, pad([hz(n) for n in chord], 3 * BEAT + 1, 0.35), bar * 3 * BEAT)
        place(buf, musicbox(hz(chord[0]) * 2, 2.0, 0.08), bar * 3 * BEAT)
    for beat, n in TUNE:
        place(buf, musicbox(hz(n), 2.6, 0.2), beat * BEAT)
    one = buf[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.45, size=0.12)
    save(lowpass(two[len(one):], 3), "music/lullaby.wav", peak=0.5, stereo_width=0.6)


if __name__ == "__main__":
    main()
