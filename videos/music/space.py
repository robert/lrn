"""Space score and sound effects for "Mission to the Missing Square".

A slow ambient drone (detuned pads on a suspended chord cycle) with a soft
triangle arpeggio twinkling on top, plus console beeps, a scanner sweep, a
confirm chime and a warp whoosh. Run: tts/.venv/bin/python music/space.py
"""
import numpy as np
from synth import RATE, rng, hz, pad, triangle, place, reverb, lowpass, save, t_

BPM = 84
BEAT = 60 / BPM
BARS = 16

# Dsus2, Bbmaj7, Fadd9, Csus4: two bars each, round twice.
CHORDS = [
    ["D3", "A3", "E4", "A4"],
    ["Bb2", "F3", "A3", "D4"],
    ["F2", "C3", "G3", "A3"],
    ["C3", "G3", "F4", "C4"],
]
ARP = [0, 2, 1, 3, 2, 1, 3, 2]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 4)
    for bar in range(0, BARS, 2):
        chord = CHORDS[(bar // 2) % 4]
        t0 = bar * 4 * BEAT
        place(buf, pad([hz(n) for n in chord], 8 * BEAT + 1.5, 0.5), t0)
        # A low sub drone an octave below the root.
        root = hz(chord[0]) / 2
        t = t_(8 * BEAT + 1.5)
        sub = 0.25 * np.sin(2 * np.pi * root * t) * np.minimum(1, t / 1.5) * np.minimum(1, (t[-1] - t) / 1.5 + 0.001)
        place(buf, sub, t0)
        # Twinkling arpeggio: eighth notes, an octave up, soft.
        for i in range(16):
            n = chord[ARP[i % 8]]
            f = hz(n) * 2
            vel = 0.08 + 0.04 * (i % 4 == 0)
            place(buf, triangle(f, BEAT * 0.45, vel) * np.exp(-np.arange(int(BEAT * 0.45 * RATE)) / (0.15 * RATE)), t0 + i * BEAT / 2)
    return buf


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    # Wrap the tail round so the loop is seamless, then add a big hall.
    tail = score(seconds)[int(seconds * RATE):]
    one[: len(tail)] += tail[: len(one)]
    two = reverb(np.concatenate([one, one]), mix=0.45, size=0.14)
    save(lowpass(two[len(one):], 2), "music/space.wav", peak=0.7, stereo_width=0.7)

    # Console beep: two quick sine blips.
    t = t_(0.22)
    beep = np.sin(2 * np.pi * 1320 * t) * (t < 0.08) * np.exp(-t * 20) + np.sin(2 * np.pi * 1760 * t) * (t > 0.1) * np.exp(-(t - 0.1) * 25)
    save(beep, "sfx/space-beep.wav", peak=0.35)

    # Scanner sweep: a rising filtered tone with shimmer.
    t = t_(1.4)
    f = 300 + 1500 * (t / t[-1]) ** 1.5
    ph = 2 * np.pi * np.cumsum(f) / RATE
    sweep = np.sin(ph) * np.sin(np.pi * t / t[-1]) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * t))
    save(reverb(sweep, mix=0.3, size=0.05), "sfx/space-scan.wav", peak=0.3)

    # Confirm chime: a bright major triad sparkle.
    t = t_(1.6)
    conf = sum(np.sin(2 * np.pi * hz(n) * t) * np.exp(-t * (3 + i)) for i, n in enumerate(["A5", "C#6", "E6", "A6"]))
    save(reverb(conf, mix=0.35, size=0.07), "sfx/space-confirm.wav", peak=0.4)

    # Error buzz: low and soft, for the trap.
    t = t_(0.5)
    err = np.sign(np.sin(2 * np.pi * 110 * t)) * np.exp(-t * 6) * 0.5
    save(lowpass(err, 20), "sfx/space-nope.wav", peak=0.3)

    # Warp: a long rising roar of noise and pitch, ending in a boom.
    t = t_(4.0)
    noise = lowpass(rng.standard_normal(len(t)), 6)
    rise = (t / t[-1]) ** 2
    f = 60 + 900 * rise
    tone = np.sin(2 * np.pi * np.cumsum(f) / RATE)
    warp = (noise * 0.6 + tone * 0.5) * rise * (t < 3.3) + np.sin(2 * np.pi * 45 * t) * np.exp(-(t - 3.3).clip(0) * 3) * (t >= 3.3) * 1.2
    save(reverb(warp, mix=0.3, size=0.1), "sfx/space-warp.wav", peak=0.8)

    # Hologram flicker on: crackle and a rising blip.
    t = t_(0.6)
    holo = rng.standard_normal(len(t)) * np.exp(-t * 12) * 0.3 + np.sin(2 * np.pi * (600 + 1200 * t) * t) * np.exp(-t * 5) * 0.5
    save(holo, "sfx/space-holo.wav", peak=0.35)


if __name__ == "__main__":
    main()
