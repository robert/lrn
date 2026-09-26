"""Station ambience and sound effects for "Departures: Name That Question".

A soft ticking pulse over a low pad and a murmuring concourse, plus the
split-flap clatter, the station chime and a guard's whistle.
Run: tts/.venv/bin/python music/departures.py
"""
import numpy as np
from synth import RATE, rng, hz, pad, place, reverb, lowpass, save, t_

BPM = 100
BEAT = 60 / BPM
BARS = 16
CHORDS = [["D3", "A3", "F#4"], ["B2", "F#3", "D4"], ["G2", "D3", "B3"], ["A2", "E3", "C#4"]]


def tick(v=0.12):
    t = t_(0.04)
    n = rng.standard_normal(len(t))
    return v * (n - lowpass(n, 3)) * np.exp(-t * 90)


def bell(f, dur=1.6, vel=0.4):
    t = t_(dur)
    tone = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-4 * t) + 0.25 * np.sin(2 * np.pi * f * 3.9 * t) * np.exp(-8 * t)
    return vel * tone * np.exp(-2.2 * t) * np.minimum(1, t * 300)


def main():
    seconds = BARS * 4 * BEAT
    n = int(seconds * RATE)
    buf = np.zeros(n + RATE * 3)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        chord = CHORDS[bar % 4]
        place(buf, pad([hz(x) for x in chord], 4 * BEAT + 0.8, 0.28), t0)
        for k in range(8):
            place(buf, tick(0.1 if k % 2 == 0 else 0.05), t0 + k * BEAT / 2)
        # A soft low pulse on each beat, like a distant engine.
        for b in range(4):
            tt = t_(0.35)
            place(buf, 0.18 * np.sin(2 * np.pi * hz(chord[0]) / 2 * tt) * np.exp(-tt * 8), t0 + b * BEAT)
    # The concourse: a murmur of far-off voices and footsteps.
    murmur = lowpass(rng.standard_normal(len(buf)), 40) * 0.25 * (1 + 0.3 * np.sin(np.arange(len(buf)) / RATE * 0.7))
    buf += murmur
    one = buf[:n]
    two = reverb(np.concatenate([one, one]), mix=0.35, size=0.12)
    save(two[n:], "music/departures.wav", peak=0.5, stereo_width=0.6)

    # Split-flap clatter: a burst of tiny clicks that thins out.
    buf = np.zeros(int(0.9 * RATE))
    for i in range(70):
        at = rng.uniform(0, 0.75) ** 1.5
        tt = t_(0.012)
        click = lowpass(rng.standard_normal(len(tt)), 2) * np.exp(-tt * 400) + 0.4 * np.sin(2 * np.pi * rng.uniform(1800, 3200) * tt) * np.exp(-tt * 500)
        place(buf, click * rng.uniform(0.4, 1.0), at)
    save(buf, "sfx/departures-flap.wav", peak=0.55, stereo_width=0.5)

    # The station chime: a gentle three-note ding-dong-ding.
    buf = np.zeros(int(2.6 * RATE))
    for i, note in enumerate(["G5", "E5", "C5"]):
        place(buf, bell(hz(note), 1.8, 0.4), i * 0.42)
    save(reverb(buf, mix=0.4, size=0.1), "sfx/departures-chime.wav", peak=0.45)

    # The station clock: a wooden tock for each second of the countdown.
    t = t_(0.18)
    tock = (np.sin(2 * np.pi * 1150 * t) * np.exp(-t * 60) + 0.6 * np.sin(2 * np.pi * 620 * t) * np.exp(-t * 40)
            + 0.3 * lowpass(rng.standard_normal(len(t)), 2) * np.exp(-t * 200))
    save(tock, "sfx/departures-tick.wav", peak=0.5)

    # A train pulling in: a low rumble that slows, then a hiss of brakes.
    dur = 1.8
    t = t_(dur)
    rumble = lowpass(rng.standard_normal(len(t)), 120) * (1 - t / dur) ** 1.5
    clacks = np.zeros(len(t))
    for at in [0.0, 0.22, 0.5, 0.86, 1.3]:
        tt = t_(0.08)
        place(clacks, 0.6 * np.sin(2 * np.pi * 90 * tt) * np.exp(-tt * 50), at)
    hiss = (rng.standard_normal(len(t)) - lowpass(rng.standard_normal(len(t)), 6)) * np.clip((t - 1.2) * 4, 0, 1) * np.exp(-np.clip(t - 1.35, 0, None) * 5)
    save(1.2 * rumble + clacks + 0.25 * hiss, "sfx/departures-arrive.wav", peak=0.4, stereo_width=0.5)

    # A guard's whistle: a bright trill.
    t = t_(1.1)
    f = 2600 + 120 * np.sign(np.sin(2 * np.pi * 28 * t))
    whistle = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.minimum(1, t * 20) * np.minimum(1, (1.1 - t) * 8)
    save(whistle + 0.15 * lowpass(rng.standard_normal(len(t)), 2) * np.minimum(1, t * 20), "sfx/departures-whistle.wav", peak=0.3)


if __name__ == "__main__":
    main()
