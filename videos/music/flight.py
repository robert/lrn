"""Score and effects for "Cleared for Take-off: Exam Day" (cockpit film).

A calm, soaring loop: warm pads and a gentle rising arpeggio in D major.
Plus cockpit sounds: engine hum, a take-off spool-up, the seatbelt
"bing-bong", a radio squelch, a checklist tick and a soft touchdown.
Run: tts/.venv/bin/python music/flight.py
"""
import numpy as np
from synth import RATE, rng, hz, pad, triangle, place, reverb, lowpass, save, t_

BPM = 88
BEAT = 60 / BPM
CHORDS = [["D3", "A3", "F#4"], ["B2", "F#3", "D4"], ["G2", "D3", "B3"], ["A2", "E3", "C#4"]]


def bell(f, dur=1.6, vel=0.2):
    t = t_(dur)
    return vel * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2.01 * f * t) * np.exp(-4 * t)) * np.exp(-2.2 * t) * np.minimum(1, t * 300)


def main():
    bars = 16
    seconds = bars * 4 * BEAT
    buf = np.zeros(int(seconds * RATE) + RATE * 3)
    for bar in range(bars):
        chord = CHORDS[(bar // 2) % 4]
        t0 = bar * 4 * BEAT
        if bar % 2 == 0:
            place(buf, pad([hz(n) for n in chord] + [hz(chord[0]) * 2], 8 * BEAT + 1, 0.45), t0)
        place(buf, triangle(hz(chord[0]) / 2, 4 * BEAT * 0.95, 0.12), t0)
        # A gentle climbing arpeggio, an octave up on the second bar of each pair.
        up = 2 if bar % 2 else 1
        for k in range(8):
            n = chord[k % 3]
            place(buf, bell(hz(n) * 2 * up, 1.4, 0.07 + 0.01 * (k % 4)), t0 + k * BEAT / 2)
    one = buf[: int(seconds * RATE)]
    two = reverb(np.concatenate([one, one]), mix=0.4, size=0.1)
    save(lowpass(two[len(one):], 3), "music/flight.wav", peak=0.55, stereo_width=0.6)

    # Engine hum: a low steady drone with a little turbine whine. Loopable.
    n = int(10 * RATE)
    t = np.arange(n) / RATE
    hum = 0.6 * lowpass(rng.standard_normal(n), 80) + 0.25 * np.sin(2 * np.pi * 55 * t) + 0.05 * np.sin(2 * np.pi * 1760 * t)
    fade = int(0.5 * RATE)
    hum[:fade] = hum[:fade] * np.linspace(0, 1, fade) + hum[-fade:] * np.linspace(1, 0, fade)
    save(hum[:-fade], "sfx/flight-hum.wav", peak=0.35)

    # Take-off: the engines spool up, rising in pitch and loudness.
    t = t_(6.0)
    f = 60 + 90 * (t / 6) ** 1.5
    whine = np.sin(2 * np.pi * np.cumsum(f * 20) / RATE) * 0.08
    roar = lowpass(rng.standard_normal(len(t)), 20) * (0.3 + 0.7 * t / 6)
    spool = (roar + whine + 0.3 * np.sin(2 * np.pi * np.cumsum(f) / RATE)) * np.minimum(1, t) * np.minimum(1, (6 - t) * 1.5)
    save(spool, "sfx/flight-spool.wav", peak=0.55)

    # Seatbelt sign: a soft two-tone bing-bong.
    buf = np.zeros(int(1.8 * RATE))
    place(buf, bell(hz("A5"), 1.4, 0.5), 0)
    place(buf, bell(hz("F#5"), 1.4, 0.5), 0.45)
    save(buf, "sfx/flight-chime.wav", peak=0.4)

    # Radio squelch: a crackle burst before the tower speaks.
    t = t_(0.35)
    sq = rng.standard_normal(len(t)) * (0.5 + 0.5 * (rng.random(len(t)) > 0.7)) * np.exp(-t * 8)
    save(lowpass(sq, 2), "sfx/flight-squelch.wav", peak=0.3)

    # Checklist tick: a crisp little click-pen.
    t = t_(0.08)
    save(np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 120) + 0.4 * rng.standard_normal(len(t)) * np.exp(-t * 200), "sfx/flight-tick.wav", peak=0.4)

    # Touchdown: a soft double thump and tyre chirp.
    t = t_(1.0)
    td = np.zeros(len(t))
    for at in (0.0, 0.18):
        i = int(at * RATE)
        tt = t[: len(t) - i]
        td[i:] += np.sin(2 * np.pi * 70 * tt) * np.exp(-tt * 14) + 0.2 * lowpass(rng.standard_normal(len(tt)), 3) * np.exp(-tt * 30)
    save(td, "sfx/flight-touchdown.wav", peak=0.55)


if __name__ == "__main__":
    main()
