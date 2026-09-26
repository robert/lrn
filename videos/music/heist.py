"""Cool spy groove and gadget sounds for "The Evidence Heist".

A minor-key caper: a creeping chromatic bass figure, muted guitar stabs,
a vibraphone shimmer and tight brushed drums. Plus laser zaps, safe
clicks, an alarm and a vault clunk. Run: tts/.venv/bin/python music/heist.py
"""
import numpy as np
from synth import RATE, rng, hz, place, reverb, lowpass, save, t_, env, bass, brush, ride, epiano

BPM = 104
BEAT = 60 / BPM


def muted(f, vel=0.3):
    """Palm-muted guitar: a short, dark square pluck."""
    t = t_(0.25)
    wave = np.where((t * f) % 1 < 0.5, 1.0, -1.0)
    return vel * lowpass(wave * np.exp(-22 * t), 10)


def vibes(f, dur, vel=0.25):
    t = t_(dur)
    tone = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-6 * t)
    return vel * tone * (1 + 0.25 * np.sin(2 * np.pi * 6 * t)) * np.exp(-1.6 * t)


# The creeping spy figure: E, F, F#, F (in eighths), over E minor.
FIGURE = ["E2", "E2", "F2", "F2", "F#2", "F#2", "F2", "F2"]


def score(seconds, bars):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for bar in range(bars):
        t0 = bar * 4 * BEAT
        shift = 5 if bar % 8 in (4, 5) else 0  # up a fourth for two bars
        for i, n in enumerate(FIGURE):
            f = hz(n) * 2 ** (shift / 12)
            place(buf, bass(f, BEAT * 0.45, 0.5), t0 + i * BEAT / 2)
        for i in (1, 3):  # guitar stabs on the off-beats
            for n in ("E3", "G3", "B3"):
                place(buf, muted(hz(n) * 2 ** (shift / 12), 0.12), t0 + (i + 0.5) * BEAT)
        for b in range(4):
            place(buf, lowpass(ride(0.02), 4), t0 + b * BEAT)
            place(buf, lowpass(ride(0.012), 4), t0 + (b + 0.5) * BEAT)
            if b in (1, 3):
                place(buf, brush(0.18, 0.08), t0 + b * BEAT)
        if bar % 4 == 3:  # vibraphone shimmer at the end of each phrase
            for i, n in enumerate(("B4", "D5", "F#5", "A5")):
                place(buf, vibes(hz(n), 1.6, 0.14), t0 + 2 * BEAT + i * 0.09)
        if bar % 8 == 7:
            place(buf, epiano(hz("E4"), 2.5, 0.12), t0)
    return buf


def main():
    bars = 16
    seconds = bars * 4 * BEAT
    one = score(seconds, bars)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.2, size=0.08)
    save(two[len(one):], "music/heist.wav", peak=0.68, stereo_width=0.5)

    t = t_(0.45)
    f = 2400 * np.exp(-6 * t) + 300
    zap = np.sin(2 * np.pi * np.cumsum(f) / RATE) * np.exp(-5 * t)
    save(zap, "sfx/heist-laser.wav", peak=0.4)

    t = t_(0.06)
    click = rng.standard_normal(len(t)) * np.exp(-t * 200) + np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 300)
    save(click, "sfx/heist-click.wav", peak=0.45)

    t = t_(1.6)
    alarm = np.sin(2 * np.pi * np.where((t * 4) % 1 < 0.5, 880, 660) * t) * 0.8
    save(alarm * env(len(t), 0.02, 0.1, 1, 0.2), "sfx/heist-alarm.wav", peak=0.35)

    t = t_(1.2)
    clunk = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 6) + 0.5 * lowpass(rng.standard_normal(len(t)), 6) * np.exp(-t * 20)
    creak = 0.2 * np.sin(2 * np.pi * np.cumsum(180 + 40 * np.sin(2 * np.pi * 3 * t)) / RATE) * np.minimum(1, t * 3) * np.exp(-t * 2)
    save(clunk + creak, "sfx/heist-vault.wav", peak=0.7)

    # Torch switch.
    t = t_(0.15)
    sw = rng.standard_normal(len(t)) * np.exp(-t * 80)
    save(sw, "sfx/heist-torch.wav", peak=0.4)


if __name__ == "__main__":
    main()
