"""Score and effects for the illuminated manuscript film "The Riddle Book of
Brother Snail".

Plainchant in a stone scriptorium: a sung drone on D and A, a slow modal
melody in D Dorian for a soft wordless voice, and a psaltery plucking the
chords (the Karplus-Strong string from pancake.py), all in a long, cool
reverb. Plus the small sounds of the scriptorium: a quill scratching, a
vellum page turning, a chapel handbell, a bright chime for a right answer and
a rabbit's herald trumpet. Run: tts/.venv/bin/python music/manuscript.py
"""
import numpy as np
from synth import RATE, rng, hz, place, reverb, lowpass, save, t_
from pancake import pluck

BPM = 64
BEAT = 60 / BPM
BEATS = 64  # one loop

# The chant: (note, beats). None is a rest. D Dorian: D E F G A B C.
CHANT = [
    ("D4", 1), ("F4", 1), ("G4", 1), ("A4", 2), ("A4", 1), ("G4", 1), ("A4", 1), ("C5", 1), ("B4", 1), ("A4", 2), (None, 3),
    ("A4", 1), ("C5", 1), ("D5", 2), ("C5", 1), ("A4", 1), ("B4", 1), ("G4", 1), ("A4", 3), (None, 3),
    ("F4", 1), ("G4", 1), ("A4", 1), ("G4", 1), ("F4", 1), ("E4", 1), ("D4", 3), (None, 3),
    ("E4", 1), ("F4", 1), ("G4", 2), ("A4", 1), ("G4", 1), ("F4", 1), ("E4", 1), ("D4", 4), (None, 4),
]
# One chord per four beats, for the psaltery. G major gives the Dorian colour (B natural).
CHORDS = [
    ["D3", "A3", "D4", "F4"], ["D3", "A3", "D4", "F4"], ["G2", "D3", "G3", "B3"], ["C3", "G3", "C4", "E4"],
    ["D3", "A3", "D4", "F4"], ["A2", "E3", "A3", "C4"], ["G2", "D3", "G3", "B3"], ["D3", "A3", "D4", "F4"],
    ["F3", "C4", "F4", "A4"], ["C3", "G3", "C4", "E4"], ["D3", "A3", "D4", "F4"], ["G2", "D3", "G3", "B3"],
    ["A2", "E3", "A3", "C4"], ["G2", "D3", "G3", "B3"], ["C3", "G3", "C4", "E4"], ["D3", "A3", "D4", "F4"],
]


def vox(f, dur, vel=0.12, vib=0.004, attack=0.12, release=0.3):
    """A soft wordless voice: harmonics shaped by two vowel formants ('oh')."""
    t = t_(dur)
    wobble = 1 + vib * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t * 1.5)
    phase = 2 * np.pi * f * np.cumsum(wobble) / RATE
    tone = np.zeros(len(t))
    for h in range(1, 12):
        fh = h * f
        if fh > 5000:
            break
        amp = 0.9 * np.exp(-((fh - 450) / 300) ** 2) + 0.35 * np.exp(-((fh - 850) / 350) ** 2) + 0.25 / h
        tone += amp * np.sin(h * phase)
    breath = lowpass(rng.standard_normal(len(t)), 10) * 0.03
    env = np.minimum(1, t / attack) * np.minimum(1, np.maximum(0, dur - t) / release)
    return vel * (tone + breath) * env


def drone(seconds):
    """Sung drone on D2 and A2 that breathes slowly (its swell divides the loop)."""
    t = t_(seconds)
    out = np.zeros(len(t))
    for note, vel, rate in [("D2", 0.16, 2), ("A2", 0.10, 3), ("D3", 0.05, 4)]:
        f = round(hz(note) * seconds) / seconds  # whole cycles per loop, so the seam is silent
        swell = 0.75 + 0.25 * np.sin(2 * np.pi * rate * t / seconds)
        phase = 2 * np.pi * f * t
        tone = np.zeros(len(t))
        for h in range(1, 10):
            amp = 0.8 * np.exp(-((h * f - 400) / 260) ** 2) + 0.4 / h
            tone += amp * np.sin(h * phase + h * 0.7)
        out += vel * tone * swell
    return out


def score(seconds):
    buf = np.zeros(int(seconds * RATE) + RATE * 4)
    buf[: int(seconds * RATE)] += drone(seconds)
    # The chant, sung once per loop.
    at = 2
    for note, beats in CHANT:
        if note:
            place(buf, vox(hz(note), beats * BEAT * 1.02, 0.13), at * BEAT)
        at += beats
    # The psaltery: a slow rolling arpeggio, one note a beat, doubled an octave up now and then.
    for bar, chord in enumerate(CHORDS):
        for k in range(4):
            n = chord[[0, 2, 1, 3][k]]
            place(buf, pluck(hz(n), 2.2, 0.16, 0.5), (bar * 4 + k) * BEAT)
            if k == 3 and bar % 2:
                place(buf, pluck(hz(n) * 2, 1.6, 0.08, 0.45), (bar * 4 + k + 0.5) * BEAT)
    return buf


def bell(f, dur, vel=0.5, partials=((0.5, 0.5, 1.2), (1, 1, 2.0), (1.19, 0.5, 2.6), (1.56, 0.4, 3.3), (2.0, 0.45, 3.0), (2.51, 0.25, 4.5), (3.01, 0.18, 5.5))):
    """A struck bell: inharmonic partials, each with its own decay."""
    t = t_(dur)
    out = np.zeros(len(t))
    for ratio, amp, decay in partials:
        out += amp * np.sin(2 * np.pi * f * ratio * t) * np.exp(-decay * t)
    strike = lowpass(rng.standard_normal(len(t)), 2) * np.exp(-t * 90) * 0.3
    tail = np.minimum(1, np.maximum(0, dur - t) / 0.6)  # no click when the sample ends
    return vel * (out + strike) * tail


def trumpet(f, dur, vel=0.5):
    """A little herald trumpet: brassy harmonics that open up as it blows."""
    t = t_(dur)
    bright = np.minimum(1, t / 0.06)
    phase = 2 * np.pi * f * np.cumsum(1 + 0.006 * np.sin(2 * np.pi * 6 * t)) / RATE
    tone = sum((1 / h) * bright ** (h * 0.5) * np.sin(h * phase) for h in range(1, 14))
    env = np.minimum(1, t / 0.02) * np.minimum(1, np.maximum(0, dur - t) / 0.05)
    return vel * np.tanh(1.5 * tone) * env


def main():
    seconds = BEATS * BEAT
    one = score(seconds)
    # Fold the overhang back to the start so the loop is seamless, then reverb twice round.
    n = int(seconds * RATE)
    loop = one[:n].copy()
    loop[: len(one) - n] += one[n:]
    two = reverb(np.concatenate([loop, loop]), mix=0.38, size=0.11)
    save(two[n:], "music/manuscript.wav", peak=0.55, stereo_width=0.6)

    # A quill scratching: bright noise in quick strokes.
    t = t_(0.9)
    noise = rng.standard_normal(len(t))
    hiss = noise - lowpass(noise, 5)
    strokes = (0.5 + 0.5 * np.sin(2 * np.pi * 7.5 * t + np.sin(2 * np.pi * 1.3 * t))) ** 3
    grit = 1 + 0.8 * (rng.random(len(t)) > 0.985)
    scratch = hiss * strokes * grit * np.minimum(1, t / 0.05) * np.minimum(1, (0.9 - t) / 0.15)
    save(scratch, "sfx/manuscript-scratch.wav", peak=0.35)

    # A vellum page turning: a rustling swell, a few crackles, then a soft flap as it lands.
    t = t_(1.3)
    rustle = lowpass(rng.standard_normal(len(t)), 3) * np.sin(np.pi * np.minimum(1, t / 1.0)) ** 2
    crackle = (rng.random(len(t)) > 0.997) * rng.standard_normal(len(t)) * 2.5 * np.sin(np.pi * np.minimum(1, t / 1.0))
    flap = np.zeros(len(t))
    i = int(0.95 * RATE)
    tt = t[: len(t) - i]
    flap[i:] = lowpass(rng.standard_normal(len(tt)), 12) * np.exp(-tt * 25) * 2.2 + np.sin(2 * np.pi * 90 * tt) * np.exp(-tt * 30) * 0.6
    save(reverb(rustle * 0.7 + lowpass(crackle, 2) + flap, mix=0.2, size=0.05), "sfx/manuscript-turn.wav", peak=0.5)

    # The chapel handbell, and a brighter pair of chimes for a right answer.
    save(reverb(bell(hz("A5"), 3.5, 0.6), mix=0.35, size=0.1), "sfx/manuscript-bell.wav", peak=0.5)
    ding = np.zeros(int(2.8 * RATE))
    place(ding, bell(hz("D6"), 2.4, 0.5), 0)
    place(ding, bell(hz("A6"), 2.2, 0.45), 0.16)
    save(reverb(ding, mix=0.3, size=0.08), "sfx/manuscript-chime.wav", peak=0.45)

    # Tansy's trumpet: toot toot.
    toot = np.zeros(int(1.0 * RATE))
    place(toot, trumpet(hz("G4"), 0.2, 0.5), 0)
    place(toot, trumpet(hz("C5"), 0.42, 0.55), 0.26)
    save(reverb(toot, mix=0.25, size=0.06), "sfx/manuscript-toot.wav", peak=0.45)


if __name__ == "__main__":
    main()
