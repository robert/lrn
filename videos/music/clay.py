"""Score and effects for the claymation film "The Clay Workshop".

A quirky workshop tune: a woody bassoon line, a clarinet melody on top and
plucked pizzicato strings, bouncing along at a toddling tempo. Plus clay
sound effects: plop, squelch and pop.
Run: tts/.venv/bin/python music/clay.py
"""
import numpy as np
from synth import RATE, rng, hz, brush, place, reverb, lowpass, save, t_

BPM = 104
BEAT = 60 / BPM
BARS = 16


def bassoon(f, dur, vel=0.3):
    """A reedy low tone: a rich saw, softened, with a gentle swell."""
    t = t_(dur)
    vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t)
    ph = np.cumsum(f * vib) / RATE
    saw = 2 * (ph % 1) - 1
    tone = lowpass(saw, 10)
    env = np.minimum(1, t / 0.04) * np.exp(-t * 1.2) * np.minimum(1, (dur - t) / 0.05)
    return vel * tone * env


def clarinet(f, dur, vel=0.2):
    """Odd harmonics only, like a clarinet, with a breathy attack."""
    t = t_(dur)
    vib = 1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(1, t / 0.3)
    ph = 2 * np.pi * np.cumsum(f * vib) / RATE
    tone = np.sin(ph) + 0.4 * np.sin(3 * ph) + 0.2 * np.sin(5 * ph) + 0.08 * np.sin(7 * ph)
    breath = lowpass(rng.standard_normal(len(t)), 4) * 0.05 * np.exp(-t * 20)
    env = np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.06)
    return vel * (tone + breath) * env


def pizz(f, vel=0.25):
    t = t_(0.5)
    return vel * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 11) * np.minimum(1, t * 800)


ROOTS = ["G2", "E2", "C2", "D2"]
CHORDS = [["G3", "B3", "D4"], ["E3", "G3", "B3"], ["C3", "E3", "G3"], ["D3", "F#3", "A3"]]
# A cheeky tune: (beat, note, length in beats), two bars long, played in bars 2-3, 6-7...
TUNE = [(0, "D5", 0.5), (0.5, "B4", 0.5), (1, "G4", 1), (2, "A4", 0.5), (2.5, "B4", 0.5), (3, "C5", 1),
        (4, "B4", 0.5), (4.5, "G4", 0.5), (5, "E4", 1), (6, "F#4", 0.5), (6.5, "G4", 0.5), (7, "A4", 1)]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        i = bar % 4
        # Bassoon: an oom-pah bounce, root then fifth.
        place(buf, bassoon(hz(ROOTS[i]), BEAT * 0.8, 0.35), t0)
        place(buf, bassoon(hz(ROOTS[i]) * 1.5, BEAT * 0.6, 0.25), t0 + 2 * BEAT)
        # Pizzicato chords on the off-beats.
        for b in (1, 3):
            for k, n in enumerate(CHORDS[i]):
                place(buf, pizz(hz(n), 0.12), t0 + b * BEAT + k * 0.01)
        place(buf, brush(0.14, 0.04), t0 + 1 * BEAT)
        place(buf, brush(0.14, 0.04), t0 + 3 * BEAT)
        if bar % 4 == 2:
            for beat, n, d in TUNE:
                place(buf, clarinet(hz(n), d * BEAT * 0.95, 0.16), t0 + beat * BEAT)
    return buf


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.22, size=0.06)
    save(two[len(one):], "music/clay.wav", peak=0.6, stereo_width=0.4)

    # Plop: a soft, wet thud as clay lands.
    t = t_(0.35)
    f = 160 * np.exp(-t * 9) + 60
    plop = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-t * 14) + 0.25 * lowpass(rng.standard_normal(len(t)), 6) * np.exp(-t * 30)
    save(plop, "sfx/clay-plop.wav", peak=0.7)

    # Squelch: a squishy wobble of filtered noise.
    t = t_(0.5)
    wob = np.sin(2 * np.pi * 14 * t)
    squelch = lowpass(rng.standard_normal(len(t)), 5) * (0.5 + 0.5 * wob) * np.sin(np.pi * t / 0.5) + 0.3 * np.sin(2 * np.pi * (220 + 120 * wob) * t) * np.exp(-t * 6)
    save(squelch, "sfx/clay-squelch.wav", peak=0.55)

    # Pop: a bright upward blip, for things appearing.
    t = t_(0.18)
    pop = np.sin(2 * np.pi * np.cumsum(500 + 2500 * t) / RATE) * np.exp(-t * 25)
    save(pop, "sfx/clay-pop.wav", peak=0.45)


if __name__ == "__main__":
    main()
