"""Score and effects for "Match of the Day: Most Alike", a football highlights show.

A punchy, bright studio theme: four-on-the-floor drums, driving bass and
brassy stabs, 124 bpm. Plus a title sting, a referee's whistle, crowd
ambience, a crowd cheer and a graphics swoosh.
Run: tts/.venv/bin/python music/sports.py
"""
import numpy as np
from synth import RATE, rng, hz, place, reverb, lowpass, save, t_, env

BPM = 124
BEAT = 60 / BPM
BARS = 16

PROG = [["D3", "F#3", "A3"], ["B2", "D3", "F#3"], ["G2", "B2", "D3"], ["A2", "C#3", "E3"]]


def kick(vel=0.9):
    t = t_(0.35)
    f = 50 + 110 * np.exp(-t * 30)
    return vel * np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-t * 9)


def snare(vel=0.5):
    t = t_(0.25)
    noise = rng.standard_normal(len(t))
    return vel * (0.7 * noise * np.exp(-t * 22) + 0.5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30))


def hat(vel=0.15):
    t = t_(0.06)
    n = rng.standard_normal(len(t))
    return vel * (n - lowpass(n, 3)) * np.exp(-t * 70)


def brass(freqs, dur, vel=0.3):
    """Brassy stab: bright saws with a quick swell and a filter-ish soften."""
    t = t_(dur)
    out = np.zeros(len(t))
    for f in freqs:
        for det in (-0.003, 0.003):
            out += 2 * ((t * f * (1 + det)) % 1) - 1
    out = lowpass(out, 5) / (2 * len(freqs))
    return vel * out * env(len(t), 0.015, 0.08, 0.6, 0.08)


def sbass(f, dur, vel=0.5):
    t = t_(dur)
    wave = 2 * ((t * f) % 1) - 1
    return vel * lowpass(np.tanh(2 * wave), 12) * env(len(t), 0.004, 0.06, 0.7, 0.04)


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        chord = PROG[bar % 4]
        for b in range(4):
            place(buf, kick(0.8), t0 + b * BEAT)
            if b in (1, 3):
                place(buf, snare(0.35), t0 + b * BEAT)
            place(buf, hat(0.08), t0 + (b + 0.5) * BEAT)
        # Driving eighth-note bass on the root.
        root = hz(chord[0]) / 2
        for e in range(8):
            place(buf, sbass(root * (2 if e % 4 == 3 else 1), BEAT / 2 * 0.9, 0.35), t0 + e * BEAT / 2)
        # Brass stabs: a syncopated hit pattern.
        for hit in (0, 1.5, 2.5):
            place(buf, brass([hz(n) * 2 for n in chord], BEAT * 0.45, 0.28), t0 + hit * BEAT)
        if bar % 4 == 3:
            for i, n in enumerate(["A4", "B4", "C#5", "D5"]):
                place(buf, brass([hz(n)], BEAT * 0.4, 0.22), t0 + (2 + i * 0.5) * BEAT)
    return buf


def crowd(seconds, level=1.0):
    n = int(seconds * RATE)
    base = lowpass(rng.standard_normal(n), 40)
    murmur = lowpass(rng.standard_normal(n), 8) * 0.4
    swell = 0.7 + 0.3 * np.sin(np.linspace(0, 5 * np.pi, n) + 1)
    return level * (base + murmur) * swell


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.18, size=0.05)
    save(two[len(one):], "music/sports.wav", peak=0.7, stereo_width=0.5)

    # Title sting: a rising brass fanfare over a drum fill, ending on a big chord.
    buf = np.zeros(int(3.2 * RATE))
    for i, n in enumerate(["D4", "F#4", "A4", "D5"]):
        place(buf, brass([hz(n), hz(n) / 2], 0.22, 0.4), i * 0.16)
        place(buf, snare(0.3), i * 0.16)
    place(buf, brass([hz("D4"), hz("F#4"), hz("A4"), hz("D5")], 1.8, 0.55), 0.68)
    place(buf, kick(1.0), 0.68)
    place(buf, crowd(2.5, 0.3) * np.linspace(1, 0, int(2.5 * RATE)), 0.68)
    save(reverb(buf, mix=0.25, size=0.06), "sfx/sports-sting.wav", peak=0.8)

    # Referee's whistle: a pea whistle trill.
    t = t_(0.9)
    trill = 1 + 0.03 * np.sign(np.sin(2 * np.pi * 28 * t))
    whistle = np.sin(2 * np.pi * np.cumsum(2900 * trill) / RATE) * env(len(t), 0.02, 0.05, 0.9, 0.12)
    whistle += 0.1 * rng.standard_normal(len(t)) * env(len(t), 0.02, 0.05, 0.9, 0.12)
    save(whistle, "sfx/sports-whistle.wav", peak=0.45)

    # Crowd ambience loop, 16 s.
    amb = crowd(16.6)
    fade = int(0.6 * RATE)
    amb[:fade] = amb[:fade] * np.linspace(0, 1, fade) + amb[-fade:] * np.linspace(1, 0, fade)
    save(amb[:-fade], "sfx/sports-crowd.wav", peak=0.4, stereo_width=0.8)

    # A big cheer: the crowd rising and roaring, then settling.
    n = int(3.5 * RATE)
    shape = np.concatenate([np.linspace(0.1, 1, int(0.5 * RATE)), np.linspace(1, 0, n - int(0.5 * RATE)) ** 1.5])
    cheer = crowd(3.5, 1.0) * shape + 0.3 * lowpass(rng.standard_normal(n), 2) * shape
    save(cheer, "sfx/sports-cheer.wav", peak=0.7, stereo_width=0.8)

    # Graphics swoosh: a fast filtered noise sweep.
    t = t_(0.45)
    sw = rng.standard_normal(len(t))
    k = np.linspace(20, 2, len(t)).astype(int)
    out = np.array([sw[max(0, i - kk):i + 1].mean() for i, kk in enumerate(k)])
    save(out * np.sin(np.pi * t / 0.45) ** 2, "sfx/sports-swoosh.wav", peak=0.5)


if __name__ == "__main__":
    main()
