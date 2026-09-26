"""Score and sound effects for the radio play "The Midnight Muffin".

A 1930s dance-band foxtrot (stride piano, brushed snare, walking bass), and
the sounds that carry the story: static, a station chime, a train's
clickety-clack, a whistle, a teacup clink, a sliding door, a ticket punch
and a gasp. Run: tts/.venv/bin/python music/radio.py
"""
import numpy as np
from synth import RATE, rng, hz, epiano, bass, brush, place, reverb, lowpass, save, t_

BPM = 126
BEAT = 60 / BPM
BARS = 16
CHORDS = [["C3", "E3", "G3", "B3"], ["A2", "C3", "E3", "G3"], ["D3", "F3", "A3", "C4"], ["G2", "B2", "D3", "F3"]]
MELODY = ["E5", "G5", "A5", "G5", "E5", "C5", "D5", "E5", "D5", "C5", "A4", "C5", "D5", "B4", "G4", "B4"]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        chord = CHORDS[bar % 4]
        for b in range(4):
            place(buf, bass(hz(chord[b % 4]) / 2, BEAT * 0.8, 0.35), t0 + b * BEAT)   # walking bass
            if b % 2:  # stride: chord stabs on 2 and 4
                for n in chord[1:]:
                    place(buf, epiano(hz(n) * 2, BEAT * 0.5, 0.07), t0 + b * BEAT)
                place(buf, brush(0.2, 0.06), t0 + b * BEAT)
        for k in range(4):  # a sweet little melody, one note a beat
            place(buf, epiano(hz(MELODY[(bar * 4 + k) % 16]), BEAT * 0.9, 0.1), t0 + k * BEAT)
    return buf


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.25, size=0.06)
    # A touch of old-wireless tone: gentle band-limiting.
    save(lowpass(two[len(one):], 6), "music/radio.wav", peak=0.5)

    t = t_(1.2)
    save(lowpass(rng.standard_normal(len(t)), 2) * np.sin(np.pi * t / 1.2) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t)), "sfx/radio-static.wav", peak=0.35)

    buf = np.zeros(int(2.4 * RATE))  # the station chime: three bell notes
    for i, n in enumerate(["G5", "E6", "C6"]):
        tt = t_(1.4)
        place(buf, (np.sin(2 * np.pi * hz(n) * tt) + 0.4 * np.sin(2 * np.pi * hz(n) * 2.76 * tt)) * np.exp(-tt * 3), i * 0.35)
    save(reverb(buf, mix=0.35), "sfx/radio-chime.wav", peak=0.4)

    n = int(8 * RATE)  # the train: a steady clickety-clack over a low rumble
    train = lowpass(rng.standard_normal(n), 60) * 0.5
    for k in range(int(8 / 0.42)):
        for off in (0, 0.11):
            tt = t_(0.08)
            place(train, np.sin(2 * np.pi * 180 * tt) * np.exp(-tt * 60) + 0.5 * lowpass(rng.standard_normal(len(tt)), 3) * np.exp(-tt * 50), k * 0.42 + off)
    save(train, "sfx/radio-train.wav", peak=0.45)

    t = t_(2.0)  # a distant whistle: two soft chords of sines
    whistle = sum(np.sin(2 * np.pi * f * t) for f in (440, 554, 659)) * np.minimum(1, t * 6) * np.exp(-np.maximum(0, t - 1.4) * 5)
    save(reverb(whistle, mix=0.4), "sfx/radio-whistle.wav", peak=0.3)

    t = t_(0.8)
    save((np.sin(2 * np.pi * 2600 * t) + 0.6 * np.sin(2 * np.pi * 3900 * t)) * np.exp(-t * 12), "sfx/radio-clink.wav", peak=0.3)

    t = t_(0.9)  # a sliding door and a latch
    slide = lowpass(rng.standard_normal(len(t)), 4) * np.sin(np.pi * np.minimum(1, t / 0.7)) * (t < 0.7)
    latch = np.zeros(len(t)); i = int(0.72 * RATE); tt = t[: len(t) - i]
    latch[i:] = np.sin(2 * np.pi * 900 * tt) * np.exp(-tt * 80)
    save(slide * 0.6 + latch, "sfx/radio-door.wav", peak=0.45)

    t = t_(0.15)
    save(rng.standard_normal(len(t)) * np.exp(-t * 90) + np.sin(2 * np.pi * 1500 * t) * np.exp(-t * 120), "sfx/radio-clip.wav", peak=0.4)

    t = t_(0.6)  # a quick breathy gasp
    save(lowpass(rng.standard_normal(len(t)), 8) * np.sin(np.pi * t / 0.6) ** 0.5 * np.exp(-t * 2), "sfx/radio-gasp.wav", peak=0.3)


if __name__ == "__main__":
    main()
