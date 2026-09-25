"""Film noir score and sound effects for "The Case of the Odd One Out".

A slow, smoky minor-key jazz loop: walking upright bass, brushed snare,
ride cymbal and electric-piano chords. Plus rain, typewriter, rubber stamp
and spotlight sounds. Run: tts/.venv/bin/python music/noir.py
"""
import numpy as np
from synth import RATE, rng, hz, epiano, bass, brush, ride, place, reverb, lowpass, save, t_

BPM = 72
BEAT = 60 / BPM
BARS = 16

# Cm9, Fm9, Abmaj7, G7(b9): four bars each, then round again.
CHORDS = [
    ["C3", "Eb3", "G3", "Bb3", "D4"],
    ["F2", "Ab3", "C4", "Eb4", "G4"],
    ["Ab2", "C3", "Eb3", "G3", "C4"],
    ["G2", "B2", "F3", "Ab3", "D4"],
]
WALK = [
    ["C2", "Eb2", "G2", "Bb2"], ["C2", "D2", "Eb2", "E2"],
    ["F2", "Ab2", "C3", "Eb3"], ["F2", "G2", "Ab2", "A2"],
    ["Ab1", "C2", "Eb2", "G2"], ["Ab1", "Bb1", "B1", "C2"],
    ["G1", "B1", "D2", "F2"], ["G1", "Ab1", "A1", "B1"],
]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        chord = CHORDS[(bar // 2) % 4]
        # Piano: a lazy comp on beat 1 and the "and" of 2, slightly rolled.
        for hit, length in ((0, 1.6), (1.5, 2.2)):
            if bar % 2 == 1 and hit == 0:
                continue
            for i, n in enumerate(chord[1:]):
                place(buf, epiano(hz(n), length * BEAT, 0.16), t0 + hit * BEAT + i * 0.018)
        # Bass: a walking line, one note a beat, with a little swing in the velocity.
        for i, n in enumerate(WALK[bar % 8]):
            place(buf, bass(hz(n), BEAT * 0.95, 0.55 if i % 2 == 0 else 0.45), t0 + i * BEAT)
        # Drums: ride on every beat plus the swung skip note, brushes on 2 and 4.
        for b in range(4):
            place(buf, lowpass(ride(0.03 if b % 2 == 0 else 0.02), 4), t0 + b * BEAT)
            place(buf, lowpass(ride(0.014), 4), t0 + (b + 2 / 3) * BEAT)
            if b in (1, 3):
                place(buf, brush(0.22, 0.09), t0 + b * BEAT)
    return buf


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.3, size=0.09)
    save(lowpass(two[len(one):], 3), "music/noir.wav", peak=0.7, stereo_width=0.5)

    # Rain on a window: soft noise bed with scattered droplets. Loopable.
    n = int(20 * RATE)
    bed = lowpass(rng.standard_normal(n), 30) * 0.5
    drops = np.zeros(n)
    for _ in range(1800):
        i = rng.integers(0, n - 800)
        drops[i:i + 800] += rng.standard_normal(800) * np.exp(-np.arange(800) / 60) * rng.uniform(0.05, 0.3)
    rain = bed + lowpass(drops, 4)
    fade = int(0.5 * RATE)  # crossfade the ends so it loops
    rain[:fade] = rain[:fade] * np.linspace(0, 1, fade) + rain[-fade:] * np.linspace(1, 0, fade)
    save(rain[:-fade], "sfx/rain.wav", peak=0.5, stereo_width=0.6)

    # Typewriter key: a click and a short clack.
    t = t_(0.09)
    key = rng.standard_normal(len(t)) * np.exp(-t * 90) + 0.6 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 160)
    save(key, "sfx/type.wav", peak=0.5)

    # Carriage return bell.
    t = t_(1.2)
    bell = (np.sin(2 * np.pi * 2093 * t) + 0.4 * np.sin(2 * np.pi * 5230 * t)) * np.exp(-t * 4)
    save(bell, "sfx/bell.wav", peak=0.35)

    # Rubber stamp: a low thud and a papery slap.
    t = t_(0.35)
    stamp = np.sin(2 * np.pi * 90 * t) * np.exp(-t * 25) + 0.5 * lowpass(rng.standard_normal(len(t)), 3) * np.exp(-t * 40)
    save(stamp, "sfx/stamp.wav", peak=0.8)

    # Spotlight switching on: a heavy clunk with a hum after.
    t = t_(1.0)
    clunk = np.sin(2 * np.pi * 70 * t) * np.exp(-t * 18) + 0.4 * rng.standard_normal(len(t)) * np.exp(-t * 60)
    hum = 0.08 * np.sin(2 * np.pi * 100 * t) * np.minimum(1, t * 8) * np.exp(-t * 2)
    save(clunk + hum, "sfx/spotlight.wav", peak=0.7)


if __name__ == "__main__":
    main()
