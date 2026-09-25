# Explainer videos

Short animated films, one per question type. They have a warm British narrator, subtitles and the same cloth-bound library look as the games (see `../DESIGN.md`). They're built with [Remotion](https://remotion.dev) (React to MP4). The voice is [Kokoro](https://github.com/thewh1teagle/kokoro-onnx), a neural text-to-speech model that runs offline on this Mac.

```sh
npm install                        # once
node scripts/voice.js codes        # speak the narration (quick to re-run: unchanged lines are skipped)
node scripts/stills.js codes       # one PNG per beat in out/stills/, for reviewing
node scripts/render.js codes       # voice + render out/codes.mp4 and copy it to ../public-videos/
npx remotion studio src/index.jsx  # live preview in the browser
```

Voice setup, once: `cd tts && uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python kokoro-onnx soundfile`. Then download `kokoro-v1.0.onnx` and `voices-v1.0.bin` into `tts/models/` (see `speak.py`). The default voice is `bf_emma` at speed 0.92. Try another with `VOICE=bm_george node scripts/voice.js codes`.

## How a video is written

Each video is one file, `src/videos/<id>.jsx`. It's picked up automatically. `src/videos/codes.jsx` is the model to copy.

```js
export default {
  id: "codes", order: 4, title: "Codes", cloth: "spotter",
  scenes: [
    {
      bg: "cloth",                        // title and closing cards sit on cloth; others on paper
      beats: [
        { say: "Words spoken and shown as subtitles.", sfx: "chime", sfxAt: 0.3 },
        { say: "L, D.", voice: "L. D." },  // optional: different text for the voice only
        { say: "Your turn.", hold: 6 },     // hold: extra seconds of quiet after the line
      ],
      render: s => <>...</>,
    },
  ],
};
```

Each scene's `render(s)` is called every frame with:
- `s.t`: the frame within the scene (30 frames per second).
- `s.at(i)`: the frame where beat `i` starts, so `rise(s.t, 20, s.at(2) + 10)` fades in 10 frames after line 3 starts.
- `s.speech(i)`: how long beat `i`'s words last, so `s.at(2) + s.speech(2) * 0.7` lands about when the 70% mark of line 3 is spoken. Use this to make things happen as the words are said.
- `s.beat`: the current beat. `s.length`: the scene's length.

Everything must be a pure function of `s.t`: no state, no timers, no random numbers without a fixed seed.

## Building blocks

- `lib/anim.js`: `rise(t, dur, start)` for eased 0 to 1, `pop(t, start)` for a springy 0 to 1, `window(t, start, end)` for on then off.
- `lib/shapes.jsx`: `<Shape kind fill line rot flip r draw inside />` draws in ink. Kinds: circle, square, rectangle, triangle, rtriangle, diamond, pentagon, hexagon, octagon, star (with `points`), heart, arrow (points right; `rot` -90 points up), cross, flag and lshape (chiral: `flip` makes a true mirror image), pie, quarter, semicircle, crescent, house, and the 3D cylinder and cube. Fill: white, grey, black, striped, none. Line: solid, dotted, dashed, double. `draw` 0 to 1 inks it on.
- `lib/ui.jsx`:
  - Layout and text: `Plate` (paper mount for a figure, with a letter label), `Words` (serif text), `Note` (highlighter note), `Code` (bold letters), `Arrow`.
  - Marking: `Ring` (gilt hand-drawn circle), `Strike` (soft line through a wrong option), `Seal` (gilt tick stamped on the answer).
  - Whole scenes: `TitleCard`, `Countdown` (for "your turn"), `Steps` (numbered recap).
  - Icons: `Emblem` (gilt line icons: eye, book, key, lens, scales, swap, grid, sequence, twins, odd, arrow, quote, bridge, mask).
- Sound effects: `chime` (the right answer), `tick`, `swish`.

Add new building blocks to `lib/` only if several videos will use them. Otherwise keep them in the video's own file.

## The recipe for each video (2 to 3 minutes)

1. **Title card** on cloth: kicker, title in gilt foil, one-line strap, chime.
2. **What the question asks**: in two or three short sentences, with the layout of a question building on screen.
3. **The secret**: the one rule that cracks this type, said plainly and shown large.
4. **Worked example 1**, straightforward, step by step. Each spoken step must have something happening on screen at the moment it is said: a ring, a glow, a key row writing in, an option struck out.
5. **Worked example 2**, with the classic trap for this type (a mirror image, a red herring, the right letters in the wrong order), named clearly.
6. **Your turn**: a fresh question, "pause the video if you'd like more time", a 6-second countdown, then the reveal with a chime and the reason.
7. **Recap**: three or four numbered steps.
8. **Closing card** on cloth, celebrating him.

## Rules

- **Draw every figure fresh.** Never copy a figure from an exam paper, and never show any printed paper, name or licence text.
- **Voice:** warm, clear, British, for a bright 7 or 8 year old. Short sentences, one idea per line, no jargon. He is "the kid nothing gets past". Mistakes are traps to spot, never failures.
- **Timing:** every beat's visuals change while it is being spoken. Nothing on screen should be unexplained, and nothing said should be missing from the screen.
- **Layout:** the paper page runs from about x 64 to 1856 and y 56 to 1024. The running head is at the top. Subtitles take the bottom ~190px, so keep content between y ≈ 140 and y ≈ 820. Centre compositions, and don't leave big empty areas.
- **Look:** ink on paper, gilt for emphasis, highlight yellow for notes, mud (warm brown) for traps. No emoji, no bright colours, no clutter.
- **Check your work:** run `node scripts/stills.js <id>`, tile the PNGs and look at every beat. Fix overlaps, clipping, empty areas and anything off-beat, then render.

## Series 2: the cinema films

Series 2 films are full-bleed short films in different genres. `SERIES2.md` has the line-up and status. `src/videos/s2-noir.jsx` is the model. Extra script fields:

```js
export default {
  id: "s2-noir", order: 101, series: 2, title: "...",
  frame: "none",                      // no paper page or cloth: the film draws its own world
  push: 0.03,                         // slow push-in per scene (0 to switch off)
  cast: { sharp: { name: "SHARP", voice: "bm_george", speed: 0.86 }, penny: { name: "PENNY", voice: "bf_isabella", speed: 1 } },
  music: { src: "music/noir.wav", volume: 0.32, duck: 0.4 },  // looped bed, dips under speech
  Overlay,                            // ({ frame, scene }) drawn over everything (grain, letterbox)
  Backdrop,                           // ({ frame, scene }) drawn under the scenes
  Subtitles,                          // ({ words, spoken, opacity, who, actor, frame }) your own caption style
  scenes: [{ beats: [{ who: "sharp", say: "...", sfxs: [{ sfx: "rain", at: 0, volume: 0.4 }] }], render: s => ... }],
};
```

- **Voices** (Kokoro, British unless noted). Female: `bf_emma`, `bf_isabella`, `bf_alice`, `bf_lily`. Male: `bm_george`, `bm_fable`, `bm_lewis`, `bm_daniel`. American, for a robot or arcade announcer: `am_michael`, `am_adam`, `af_nicole`, `af_sky`. Use `speed` for character.
- **Music and sound effects** are composed in code: `music/synth.py` holds the instruments (epiano, bass, brush, ride, square, triangle, pad, reverb, `place`, `save`), and `music/noir.py` is an example score. Write `music/<film>.py`, run it with `tts/.venv/bin/python music/<film>.py`, and it writes `public/music/<film>.wav` and any `public/sfx/*.wav`. Name effects uniquely so films don't clash, e.g. `arcade-coin.wav`.
- **Randomness:** use a seeded hash of the frame (see `hash` in the noir film), never `Math.random`.
- **Fonts:** `@remotion/google-fonts/<Name>`, for example SpecialElite, Limelight, PressStart2P, VT323, Silkscreen, Caveat, CaveatBrush, PermanentMarker, Orbitron, Bangers, Chewy, Fredoka, Cinzel, IMFellEnglish, BebasNeue, Pacifico, Creepster.
