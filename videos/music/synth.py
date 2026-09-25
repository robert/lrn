"""A tiny synthesiser for film scores and sound effects (numpy only).

Instruments are functions that return mono float arrays at RATE. A score is
built by adding notes into a buffer with `place`. `loopable` renders two
passes and keeps the second, so reverb tails wrap round and loops are seamless.
"""
import numpy as np
import soundfile as sf
from pathlib import Path

RATE = 44100
OUT = Path(__file__).parent.parent / "public"
rng = np.random.default_rng(7)


def hz(note):
    """'C4' / 'F#2' / 'Bb3' -> frequency."""
    names = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    n = names[note[0]]
    rest = note[1:]
    if rest.startswith("#"):
        n += 1; rest = rest[1:]
    elif rest.startswith("b"):
        n -= 1; rest = rest[1:]
    return 440.0 * 2 ** ((n + 12 * (int(rest) + 1) - 69) / 12)


def t_(seconds):
    return np.arange(int(seconds * RATE)) / RATE


def env(n, attack=0.005, decay=0.1, sustain=0.6, release=0.2, total=None):
    """ADSR envelope of n samples (release happens at the end)."""
    a, d, r = int(attack * RATE), int(decay * RATE), int(release * RATE)
    s = max(0, n - a - d - r)
    e = np.concatenate([
        np.linspace(0, 1, max(a, 1)),
        np.linspace(1, sustain, max(d, 1)),
        np.full(s, sustain),
        np.linspace(sustain, 0, max(r, 1)),
    ])
    return np.pad(e, (0, max(0, n - len(e))))[:n]


def pluck_decay(n, k=4.0):
    return np.exp(-k * np.arange(n) / RATE)


# ---------- Instruments ----------

def epiano(f, dur, vel=0.5):
    """Soft electric piano: sine with bell partials and a gentle tremolo."""
    t = t_(dur)
    tone = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-3 * t) + 0.12 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-6 * t)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t)
    return vel * tone * trem * env(len(t), 0.004, 0.4, 0.45, 0.35)


def bass(f, dur, vel=0.7):
    """Upright bass pluck: sine plus a little saturation and thump."""
    t = t_(dur)
    tone = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    tone = np.tanh(1.6 * tone) * pluck_decay(len(t), 3.2)
    thump = np.sin(2 * np.pi * 60 * t) * np.exp(-40 * t) * 0.4
    return vel * (tone + thump) * env(len(t), 0.002, 0.05, 1, 0.06)


def brush(dur=0.18, vel=0.25):
    """Brushed snare: shaped noise."""
    n = int(dur * RATE)
    noise = rng.standard_normal(n)
    noise = np.convolve(noise, np.ones(6) / 6, mode="same")  # soften
    return vel * noise * np.linspace(0, 1, n) ** 0.3 * np.exp(-np.arange(n) / (0.07 * RATE))


def ride(vel=0.12):
    n = int(0.6 * RATE)
    noise = rng.standard_normal(n)
    hi = noise - np.convolve(noise, np.ones(3) / 3, mode="same")
    return vel * hi * np.exp(-np.arange(n) / (0.18 * RATE))


def square(f, dur, vel=0.3, duty=0.5):
    t = t_(dur)
    wave = np.where((t * f) % 1 < duty, 1.0, -1.0)
    return vel * wave * env(len(t), 0.002, 0.05, 0.7, 0.03)


def triangle(f, dur, vel=0.4):
    t = t_(dur)
    wave = 2 * np.abs(2 * ((t * f) % 1) - 1) - 1
    return vel * wave * env(len(t), 0.002, 0.05, 0.9, 0.03)


def pad(freqs, dur, vel=0.2):
    """Slow warm pad: detuned saws softened."""
    t = t_(dur)
    out = np.zeros(len(t))
    for f in freqs:
        for det in (-0.004, 0, 0.004):
            ph = (t * f * (1 + det)) % 1
            out += 2 * ph - 1
    out = np.convolve(out, np.ones(24) / 24, mode="same")
    return vel * out / (3 * len(freqs)) * env(len(t), 1.2, 0.5, 0.9, 1.5)


# ---------- Mixing ----------

def place(buf, sound, at):
    i = int(at * RATE)
    j = min(len(buf), i + len(sound))
    if i < len(buf):
        buf[i:j] += sound[: j - i]


def reverb(x, mix=0.25, size=0.08):
    """Cheap plate: a few feedback comb filters in parallel."""
    out = np.zeros_like(x)
    for d, g in [(size, 0.6), (size * 1.37, 0.55), (size * 1.71, 0.5), (size * 2.13, 0.45)]:
        k = int(d * RATE)
        y = x.copy()
        for _ in range(6):
            y = np.concatenate([np.zeros(k), y[:-k]]) * g + x
        out += y
    return (1 - mix) * x + mix * out / 4


def lowpass(x, k=8):
    return np.convolve(x, np.ones(k) / k, mode="same")


def loopable(render, seconds, **fx):
    """Render twice back to back, apply effects, keep the second pass."""
    one = render(seconds)
    two = np.concatenate([one, one])
    if fx.get("reverb"):
        two = reverb(two, **fx["reverb"])
    return two[len(one):]


def save(x, name, peak=0.8, stereo_width=0.0):
    x = x / (np.max(np.abs(x)) + 1e-9) * peak
    if stereo_width:
        d = int(0.012 * RATE)
        right = np.concatenate([x[-d:], x[:-d]])
        x = np.stack([x, (1 - stereo_width) * x + stereo_width * right], axis=1)
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(path, x, RATE)
    print(f"wrote {path.relative_to(OUT.parent)} ({len(x) / RATE:.1f}s)")
