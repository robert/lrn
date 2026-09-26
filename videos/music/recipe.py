"""Score and effects for the watercolour film "The Story Recipe".

A gentle picture-book tune: plucked guitar arpeggios (borrowing the
Karplus-Strong pluck from pancake.py) under a soft breathy flute. Plus a
wave crashing on the beach. Run: tts/.venv/bin/python music/recipe.py
"""
import numpy as np
from synth import RATE, rng, hz, place, reverb, lowpass, save, t_
from pancake import pluck

BPM = 84
BEAT = 60 / BPM
CHORDS = [["G2", "D3", "G3", "B3"], ["E2", "B2", "E3", "G3"], ["C3", "G3", "C4", "E4"], ["D3", "A3", "D4", "F#4"]]
FLUTE = ["B4", "D5", "E5", "D5", "B4", "A4", "G4", "A4", "B4", "G4", "E4", "G4", "A4", "B4", "A4", "D4"]


def flute(f, dur, vel=0.12):
    t = t_(dur)
    vib = 1 + 0.005 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t * 3)
    tone = np.sin(2 * np.pi * f * np.cumsum(vib) / RATE) + 0.15 * np.sin(2 * np.pi * 2 * f * t)
    breath = lowpass(rng.standard_normal(len(t)), 6) * 0.08
    env = np.minimum(1, t * 8) * np.minimum(1, (dur - t) * 6)
    return vel * (tone + breath) * env


def main():
    bars = 16
    seconds = bars * 4 * BEAT
    buf = np.zeros(int(seconds * RATE) + RATE * 3)
    for bar in range(bars):
        chord = CHORDS[bar % 4]
        for k in range(8):  # rolling eighth-note arpeggio
            place(buf, pluck(hz(chord[k % 4]), 1.2, 0.1, 0.45), (bar * 4 + k / 2) * BEAT)
        if bar >= 4:
            for k in range(4):
                place(buf, flute(hz(FLUTE[(bar * 4 + k) % 16]), BEAT * 0.95), (bar * 4 + k) * BEAT)
    one = buf[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.3, size=0.08)
    save(two[len(one):], "music/recipe.wav", peak=0.55, stereo_width=0.5)

    t = t_(3.0)  # a wave: a swell of noise that breaks and fizzes out
    swell = lowpass(rng.standard_normal(len(t)), 20) * np.minimum(1, t / 1.2) ** 2 * np.exp(-np.maximum(0, t - 1.3) * 1.6)
    fizz = lowpass(rng.standard_normal(len(t)), 2) * np.exp(-np.maximum(0, t - 1.3) * 2) * (t > 1.2) * 0.3
    save(swell + fizz, "sfx/recipe-wave.wav", peak=0.6, stereo_width=0.7)


if __name__ == "__main__":
    main()
