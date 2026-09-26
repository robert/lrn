"""Score and stingers for "Nothing Gets Past: The Big Quiz" (TV quiz show).

A bright, bouncy studio loop (brassy square stabs, a driving bass, drum
fills) plus the show's sounds: sting, drumroll, buzzer, correct ding,
applause, whoosh, phone ring and a ticking clock.
Run: tts/.venv/bin/python music/quiz.py
"""
import numpy as np
from synth import RATE, rng, hz, square, bass, place, reverb, lowpass, save, t_

BPM = 124
BEAT = 60 / BPM
BARS = 16


def brass(f, dur, vel=0.25):
    return lowpass(square(f, dur, vel, 0.3) + square(f * 1.005, dur, vel * 0.8, 0.42), 4)


def kick(v=0.8):
    t = t_(0.3)
    return v * np.sin(2 * np.pi * (48 + 100 * np.exp(-t * 30)) * t) * np.exp(-t * 11)


def snare(v=0.35):
    t = t_(0.18)
    return v * (lowpass(rng.standard_normal(len(t)), 2) * np.exp(-t * 20) + 0.4 * np.sin(2 * np.pi * 200 * t) * np.exp(-t * 30))


def hat(v=0.07):
    t = t_(0.05)
    n = rng.standard_normal(len(t))
    return v * (n - lowpass(n, 3)) * np.exp(-t * 80)


CHORDS = [["F3", "A3", "C4"], ["D3", "F3", "A3"], ["Bb2", "D3", "F3"], ["C3", "E3", "G3"]]


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 2)
    for bar in range(BARS):
        t0 = bar * 4 * BEAT
        chord = CHORDS[bar % 4]
        for k in range(8):
            at = t0 + k * BEAT / 2
            if k in (0, 4):
                place(buf, kick(), at)
            if k in (2, 6):
                place(buf, snare(), at)
            place(buf, hat(), at)
            place(buf, bass(hz(chord[0]) / 2, BEAT * 0.45, 0.35), at)
        for beat in (0, 1.5, 3):  # brassy chord stabs
            for n in chord:
                place(buf, brass(hz(n) * 2, 0.3 * BEAT, 0.06), t0 + beat * BEAT)
        if bar % 4 == 3:  # a drum fill into the next phrase
            for k in range(4):
                place(buf, snare(0.3), t0 + 3 * BEAT + k * BEAT / 4)
    return buf


def main():
    seconds = BARS * 4 * BEAT
    one = score(seconds)[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.18, size=0.05)
    save(two[len(one):], "music/quiz.wav", peak=0.55, stereo_width=0.4)

    buf = np.zeros(int(1.6 * RATE))  # the show sting: a rising brass fanfare
    for i, n in enumerate(["C4", "E4", "G4", "C5"]):
        place(buf, brass(hz(n), 0.18, 0.35), i * 0.12)
    for n in ["C5", "E5", "G5"]:
        place(buf, brass(hz(n), 0.9, 0.3), 0.5)
    place(buf, kick(1.0), 0.5)
    save(reverb(buf, mix=0.2), "sfx/quiz-sting.wav", peak=0.6)

    n = int(3.0 * RATE)  # drumroll: fast snare hits, crescendo, then a crash
    buf = np.zeros(n)
    for k in range(int(2.6 / 0.05)):
        place(buf, snare(0.1 + 0.3 * k / 52), k * 0.05)
    t = t_(0.5)
    place(buf, rng.standard_normal(len(t)) * np.exp(-t * 6) * 0.6, 2.6)
    save(buf, "sfx/quiz-drumroll.wav", peak=0.6)

    t = t_(0.5)  # buzzer: a gentle, friendly honk
    save(lowpass(square(150, 0.5, 0.5, 0.5) + square(155, 0.5, 0.4, 0.5), 6), "sfx/quiz-buzzer.wav", peak=0.4)

    t = t_(1.4)  # correct: a bright two-note ding
    ding = np.zeros(len(t))
    for i, f in enumerate([1318.5, 1975.5]):
        tt = t[: len(t) - int(i * 0.12 * RATE)]
        ding[int(i * 0.12 * RATE):] += (np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 4)
    save(ding, "sfx/quiz-ding.wav", peak=0.5)

    n = int(3.0 * RATE)  # applause: many small claps swelling and fading
    buf = np.zeros(n)
    for _ in range(900):
        at = rng.uniform(0, 2.8)
        tt = t_(0.02)
        place(buf, lowpass(rng.standard_normal(len(tt)), 2) * np.exp(-tt * 150) * np.sin(np.pi * min(at, 2.8) / 2.8), at)
    save(buf, "sfx/quiz-applause.wav", peak=0.45, stereo_width=0.8)

    t = t_(0.6)
    save(lowpass(rng.standard_normal(len(t)), 3) * np.sin(np.pi * t / 0.6) ** 2, "sfx/quiz-whoosh.wav", peak=0.4)

    buf = np.zeros(int(2.0 * RATE))  # a phone ringing twice
    for start in (0, 1.0):
        tt = t_(0.6)
        place(buf, (np.sin(2 * np.pi * 440 * tt) + np.sin(2 * np.pi * 480 * tt)) * (np.sin(2 * np.pi * 20 * tt) > 0), start)
    save(buf, "sfx/quiz-phone.wav", peak=0.3)

    buf = np.zeros(int(8.0 * RATE))  # ticking think-music clock
    for k in range(16):
        tt = t_(0.05)
        place(buf, np.sin(2 * np.pi * (1600 if k % 2 else 1200) * tt) * np.exp(-tt * 90), k * 0.5)
    save(buf, "sfx/quiz-tick.wav", peak=0.35)


if __name__ == "__main__":
    main()
