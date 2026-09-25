"""Score and ambience for "Planet Shapes", a hushed wildlife documentary.

A slow, warm string-like pad moving through D major with a sparse celesta
melody, over a bed of distant birdsong. Plus effects: a dawn-meadow ambience
loop, a camera shutter, a pencil tick and a soft rustle.
Run: tts/.venv/bin/python music/nature.py
"""
import numpy as np
from synth import RATE, rng, hz, pad, epiano, place, reverb, lowpass, save, t_

BPM = 60
BEAT = 60 / BPM
BARS = 16

# Dmaj9, Bm9, Gmaj7(#11), Asus4 -> A: two bars each.
CHORDS = [
    ["D3", "A3", "E4", "F#4", "C#5"],
    ["B2", "F#3", "D4", "A4", "C#5"],
    ["G2", "D3", "B3", "F#4", "C#5"],
    ["A2", "E3", "D4", "E4", "A4"],
]
# A sparse celesta line, one note at a time, placed by beat within the loop.
MELODY = [
    (0, "F#5", 3), (4, "E5", 2), (6, "A5", 2), (8, "F#5", 4), (14, "D5", 2),
    (16, "E5", 3), (20, "C#5", 2), (22, "D5", 2), (24, "B4", 6),
    (32, "F#5", 3), (36, "A5", 2), (38, "B5", 2), (40, "A5", 4), (46, "F#5", 2),
    (48, "E5", 3), (52, "D5", 2), (54, "E5", 2), (56, "A4", 6),
]


def celesta(f, dur, vel=0.25):
    t = t_(dur)
    tone = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 4.01 * f * t) * np.exp(-8 * t)
    return vel * tone * np.exp(-2.2 * t) * np.minimum(1, t * 300)


def chirp(f0=3200, f1=4600, dur=0.09, vel=0.2):
    """One bird note: a quick frequency sweep with a soft envelope."""
    t = t_(dur)
    f = np.linspace(f0, f1, len(t))
    phase = 2 * np.pi * np.cumsum(f) / RATE
    e = np.sin(np.pi * np.linspace(0, 1, len(t))) ** 2
    return vel * np.sin(phase) * e


def birdsong(seconds, density=1.0, vel=0.12):
    """Distant birds: little phrases of chirps scattered through time."""
    buf = np.zeros(int(seconds * RATE) + RATE)
    n_phrases = int(seconds * 0.9 * density)
    for _ in range(n_phrases):
        at = rng.uniform(0, seconds - 1)
        base = rng.uniform(2400, 4200)
        notes = rng.integers(2, 6)
        v = vel * rng.uniform(0.3, 1.0)
        for k in range(notes):
            up = rng.choice([-1, 1])
            place(buf, chirp(base, base + up * rng.uniform(300, 1400), rng.uniform(0.05, 0.13), v), at + k * rng.uniform(0.09, 0.16))
    return buf[: int(seconds * RATE)]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 4)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        if bar % 2 == 0:
            chord = CHORDS[(bar // 2) % 4]
            place(buf, pad([hz(n) for n in chord], 8 * BEAT + 1.5, 0.5), t0)
            place(buf, pad([hz(chord[0]) / 2], 8 * BEAT + 1.5, 0.35), t0)
    for beat, note, length in MELODY:
        place(buf, celesta(hz(note), length * BEAT + 1.0, 0.22), beat * BEAT)
    return buf


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)
    # Wrap the long pad tails round so the loop is seamless.
    n = int(seconds * RATE)
    tail = one[n:]
    one = one[:n].copy()
    one[: len(tail)] += tail
    two = reverb(np.concatenate([one, one]), mix=0.4, size=0.11)
    music = two[n:] + 0.6 * birdsong(seconds, 0.35, 0.05)
    save(lowpass(music, 3), "music/nature.wav", peak=0.7, stereo_width=0.7)

    # Dawn meadow: soft breeze plus nearer birds. Loopable 20 s.
    n = int(20 * RATE)
    breeze = lowpass(rng.standard_normal(n), 60) * (0.6 + 0.4 * np.sin(np.linspace(0, 6 * np.pi, n)))
    amb = breeze * 0.5 + birdsong(20, 1.2, 0.18)
    fade = int(0.6 * RATE)
    amb[:fade] = amb[:fade] * np.linspace(0, 1, fade) + amb[-fade:] * np.linspace(1, 0, fade)
    save(amb[:-fade], "sfx/nature-meadow.wav", peak=0.45, stereo_width=0.8)

    # Camera shutter: two quick mechanical clicks.
    t = t_(0.25)
    click = lambda at: np.where(t >= at, rng.standard_normal(len(t)) * np.exp(-(t - at) * 120), 0)
    shutter = click(0.0) + 0.8 * click(0.09) + 0.3 * np.sin(2 * np.pi * 900 * t) * np.exp(-t * 60)
    save(shutter, "sfx/nature-shutter.wav", peak=0.55)

    # Pencil tick on paper.
    t = t_(0.18)
    pencil = lowpass(rng.standard_normal(len(t)), 2) * np.exp(-t * 30) * (1 + 0.5 * np.sin(2 * np.pi * 40 * t))
    save(pencil, "sfx/nature-pencil.wav", peak=0.35)

    # Rustle in the grass.
    t = t_(0.9)
    rustle = lowpass(rng.standard_normal(len(t)), 5) * np.sin(np.pi * t / 0.9) ** 2 * (1 + 0.6 * np.sin(2 * np.pi * 11 * t))
    save(rustle, "sfx/nature-rustle.wav", peak=0.4)


if __name__ == "__main__":
    main()
