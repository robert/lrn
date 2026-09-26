"""The Mega News theme: a punchy six-second opening sting with a ticking
pulse, timpani and brass. Run: tts/.venv/bin/python music/news.py
"""
import numpy as np
from synth import RATE, rng, hz, square, place, reverb, lowpass, save, t_


def brass(f, dur, vel=0.3):
    return lowpass(square(f, dur, vel, 0.3) + square(f * 1.005, dur, vel * 0.8, 0.45), 4)


def timp(f, vel=0.8):
    t = t_(1.2)
    return vel * np.sin(2 * np.pi * f * t) * np.exp(-t * 3) + 0.2 * lowpass(rng.standard_normal(len(t)), 5) * np.exp(-t * 20)


def main():
    buf = np.zeros(int(6.5 * RATE))
    for i in range(16):  # the newsroom tick
        tt = t_(0.03)
        place(buf, np.sin(2 * np.pi * 2000 * tt) * np.exp(-tt * 150) * 0.3, i * 0.25)
    for at, n in [(0, "C4"), (1.0, "C4"), (2.0, "F4"), (2.5, "G4"), (3.0, "C5")]:
        for m in (1, 1.25, 1.5):
            place(buf, brass(hz(n) * m, 0.5 if at < 3 else 2.2, 0.12), at)
    for at in (0, 1.0, 2.0, 3.0):
        place(buf, timp(hz("C2")), at)
    save(reverb(buf, mix=0.25, size=0.06), "sfx/news-theme.wav", peak=0.7, stereo_width=0.4)


if __name__ == "__main__":
    main()
