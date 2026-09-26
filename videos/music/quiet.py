"""Score and sound effects for the wordless film "Doors" (s14-quiet).

A gentle ambient piece that evolves across the whole film (not a loop):
marimba arpeggios in a pentatonic scale, a soft pad and a quiet ticking
pulse. Each room gets its own chord colour; the rooftop ending opens out.
Plus the film's few sounds: a soft bounce thud, a click, a door slide and
a chime. Run: tts/.venv/bin/python music/quiet.py
"""
import numpy as np
from synth import RATE, rng, hz, pad, place, reverb, lowpass, save, t_

SECONDS = 146
BPM = 80
BEAT = 60 / BPM


def marimba(f, dur=1.4, vel=0.25):
    """A wooden bar: fundamental plus the bar's bright 4th partial, fast decay."""
    t = t_(dur)
    tone = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2) + 0.35 * np.sin(2 * np.pi * f * 3.93 * t) * np.exp(-t * 14)
    return vel * tone * np.minimum(1, t * 800)


def tick(vel=0.05):
    t = t_(0.04)
    return vel * lowpass(rng.standard_normal(len(t)), 2) * np.exp(-t * 160)


# (start second, chord) for each part of the film: title, four rooms, rooftop.
SECTIONS = [
    (0, ["D3", "A3", "D4", "E4", "A4"]),
    (8, ["D3", "A3", "D4", "F#4", "A4"]),
    (38, ["B2", "F#3", "B3", "D4", "F#4"]),
    (68, ["G2", "D3", "G3", "B3", "D4"]),
    (98, ["E3", "B3", "E4", "G4", "B4"]),
    (128, ["D3", "A3", "D4", "F#4", "A4", "C#5"]),
]


def main():
    buf = np.zeros(int((SECONDS + 4) * RATE))
    n_beats = int(SECONDS / BEAT)
    for b in range(n_beats):
        at = b * BEAT
        chord = [c for s, c in SECTIONS if s <= at][-1]
        section = [s for s, c in SECTIONS if s <= at][-1]
        # Pad: one long chord per four bars.
        if b % 16 == 0:
            place(buf, pad([hz(n) for n in chord[:3]], 16 * BEAT + 2, 0.22), at)
        # Soft ticking pulse, a clock thinking.
        if at > 6:
            place(buf, tick(0.04 if b % 4 else 0.06), at)
        # Marimba: a slow arpeggio that grows busier through the film.
        density = 1 if section < 38 else 2
        for k in range(density):
            note = chord[(b * 2 + k * 3 + (b // 8)) % len(chord)]
            vel = 0.14 if k == 0 else 0.08
            place(buf, marimba(hz(note) * 2, 1.4, vel), at + k * BEAT / 2)
    # The ending opens out with a slow high melody.
    for i, n in enumerate(["A5", "F#5", "E5", "D5", "E5", "F#5", "A5", "D6"]):
        place(buf, marimba(hz(n), 2.4, 0.16), 128 + i * 2 * BEAT)
    # Fade in and out.
    n = len(buf)
    env = np.minimum(1, np.arange(n) / (2 * RATE)) * np.minimum(1, (n - np.arange(n)) / (6 * RATE))
    mix = reverb(buf * env, mix=0.35, size=0.1)
    save(lowpass(mix, 2), "music/quiet.wav", peak=0.55, stereo_width=0.5)

    t = t_(0.35)  # a soft bounce thud
    save(np.sin(2 * np.pi * (140 - 60 * t) * t) * np.exp(-t * 18) + 0.2 * lowpass(rng.standard_normal(len(t)), 6) * np.exp(-t * 30), "sfx/quiet-thud.wav", peak=0.6)
    t = t_(0.2)  # a click: a piece seating into its slot
    save(np.sin(2 * np.pi * 1400 * t) * np.exp(-t * 90) + 0.5 * np.sin(2 * np.pi * 700 * t) * np.exp(-t * 60), "sfx/quiet-click.wav", peak=0.5)
    t = t_(1.3)  # a stone door sliding aside
    slide = lowpass(rng.standard_normal(len(t)), 30) * np.sin(np.pi * t / 1.3) + 0.3 * np.sin(2 * np.pi * 55 * t) * np.sin(np.pi * t / 1.3)
    save(slide, "sfx/quiet-slide.wav", peak=0.5)
    buf = np.zeros(int(2.4 * RATE))  # a chime: two bars rung together
    for f, d in [(hz("D6"), 0), (hz("A6"), 0.08), (hz("F#6"), 0.16)]:
        place(buf, marimba(f, 2.2, 0.3), d)
    save(reverb(buf, mix=0.4), "sfx/quiet-chime.wav", peak=0.45)


if __name__ == "__main__":
    main()
