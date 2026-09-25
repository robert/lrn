# Design: the cloth-bound library

He is a proud, bright reader. The suite looks like a shelf of fine cloth-bound books stamped in gold foil. Home is the cover. Each game is a volume in its own cloth. Inside a game you are on paper.

## Tokens (all in `web/styles.css`)

| Role | Token | Hex |
|---|---|---|
| Home cover cloth | `--cloth` | #1E3B30 |
| Gilt foil | `--gilt`, `--gilt-light`, `--gilt-dark` | #C9A24B, #EDD48F, #8B6A27 |
| Page ground (sage) | `--ground` | #DCE7E1 |
| Paper | `--paper` | #FAFBF8 |
| Ink, soft ink, faint ink | `--ink`, `--soft`, `--faint` | #1B2A24, #5F6F68, #93A29B |
| Rules | `--rule`, `--rule-soft` | #C5D3CC, #E4ECE7 |
| Reader cloth | `--vol-reader` | #1F5A40 |
| Imagination cloth | `--vol-imagination` | #3B3461 |
| Story cloth | `--vol-story` | #6D3A2B |
| Spotter cloth | `--vol-spotter` | #1E3E5C |
| Reader extras (from the prototype) | `--green`, `--red`, `--mud`, `--highlight` | #1F7A4D, #C8102E, #7A5C3E, #FFF1B8 |

`--vol` is the current volume's cloth. `<Volume game="...">` sets it, and `.btn` uses it, so buttons pick up their game's colour automatically.

## Type

- **Fraunces** (`var(--story)`): titles, the story text, questions, praise, anything that should feel like a book. Weights 400 to 600. Italic for gentle asides and leads.
- **Nunito** (`var(--ui)`): buttons, small labels, counts, instructions. Weights 600 to 800.
- Scale: 15 / 18 / 21 / 24 / 31 / 34 to 46 px (`--t-small`, `--t-body`, `--t-lead`, `--t-h3`, `--t-h2`, `--t-h1`).
- Sentence case everywhere. **No all-caps labels, no letter-spaced eyebrows** above headings.

## Structure of a game screen

```
┌──────────── cloth band (VolumeHeader) ────────────┐
│ ‹ Home            [gilt line emblem]               │
│              Title in Fraunces, paper white        │
│          one italic lead line, if it helps         │
╘═════════════ double gilt rule ═════════════════════╛
   sage ground
   ┌──────── paper sheet ────────┐
   │ content                      │
   └──────────────────────────────┘
   [ big cloth-coloured button ]
```

- Use `<Volume game>` around the screen and `<VolumeHeader game title lead>` at the top. Mid-activity screens can use `compact` to keep the band slim.
- Content sits on `.sheet` (paper, 10px radius, soft lift). Don't nest sheets inside sheets. Use hairline `--rule-soft` dividers inside a sheet instead.
- Buttons: `.btn` (cloth colour), `.btn.secondary` (paper with a hairline), `.btn.gold` (only for the one big celebratory action), `.btn.quiet`. They must stay at least 56px tall for fingers.
- Progress is `<ProgressBar>`: a gilt bar, never a number to hit.
- "Done today" is a gilt seal (`<Seal>` or `.seal`), never a green tick emoji.

## Icons

Use **no emoji anywhere**. Use `<Icon name>` from `web/icons.jsx`: book, bulb, quill, eye, flame, star, check, mic, back, next, plus, minus, sparkle, medal, laurel, timer, keys, refresh, trophy, bolt, lens. Add new ones to that file in the same style: a 24px grid, 1.6 stroke, round caps, no fills. The spotter's animal portraits are illustrations and can stay.

## Motion

- One orchestrated moment per screen at most: the home crest's foil shimmer, or a celebration.
- Motion that answers an action is welcome: a correct answer, a seal stamping on, a rung lighting.
- No fade-and-slide on every block.
- `prefers-reduced-motion` switches it all off, which `styles.css` already handles.

## Celebration

He is always brilliant. Celebration screens use the laurel or trophy icon, a Fraunces display line, and a gilt seal or gilt progress. They should feel like a prize ribbon in a fine book, not a cartoon.

## Colour for feedback

- Correct: `--green` text or a hairline, with a gilt accent.
- "One that slipped past": warm, not red. Use `--mud`, or `--soft` with a highlight.
- Keep `--red` for real errors only.
