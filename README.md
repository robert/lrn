# Mega Games

Four learning games for 8+ exam prep, behind one home screen.

## Running it

```sh
npm install
cp .env.example .env    # then put your Anthropic API key in .env
npm run dev
```

The terminal prints two addresses: one for this computer and one for an iPad or phone on the same wifi. Voice input works best in Chrome.

Parent settings live at `/#/parent` (rewards list, pictures, streak resets, reader results). The home screen doesn't link to them.

Everything he does is saved in `data/*.json` on this computer. Delete `data/` to start again from the pre-seeded 11 reader nights.

## The games

| Game | Code | Saved in |
|---|---|---|
| Mega Reader Challenge | `web/games/reader`, `server/routes/reader.js` | `data/progress.json` |
| Imagination Engine | `web/games/imagination`, `server/routes/imagination.js` | `data/imagination.json` |
| Story Builder | `web/games/story`, `server/routes/story.js`, slots in `shared/storyPlan.js` | `data/story.json` |
| Are you the kid that nothing gets past? | `web/games/spotter`, `server/routes/spotter.js` | `data/spotter.json` |

Daily ticks, streaks and the Mega Streak week come from `data/daily.json` (`server/daily.js`).

## Imagination Engine pictures

Drop any image into `pictures/` and it's used straight away. Opening sentences go in `pictures/openers.txt`, one per line.

## Mega Reader content

- `content/plan.json`: which paragraphs of each chapter make each night.
- `content/questions/chapter-XX.json`: the hand-written titles, questions and hints.
- `node scripts/make-content.js [chapter]`: combines the book text and questions into `content/chapter-XX.json`, which the app reads.
- `node scripts/validate.js [chapter]`: checks every question-writing rule and fails loudly if one is broken.
- `node scripts/review.js <chapter>`: writes a readable copy to `content/review/` for checking.
- `node scripts/split-chapters.js`: proposes night boundaries from word counts.
