# Series 2: "Nothing Gets Past" Cinema

Series 1 is a consistent library of calm, bookish tutorials. Series 2 does the opposite: every film is a different genre. Each has characters, dialogue in several voices, music composed in code and sound design. The teaching is exactly as solid, but it's wrapped in a story he'd want to rewatch.

## What's different from series 1

- **Casts, not a narrator:** each film has two or three characters, each voiced by a different Kokoro voice (`cast` plus `who` on each beat).
- **Full-bleed worlds:** no shared paper frame (`frame: "none"`). Each film builds its own world: noir streets, an arcade cabinet, a chalkboard, a starship bridge.
- **Its own subtitle style:** typewriter captions for noir, pixel captions for the arcade, chalk for the blackboard.
- **An original score:** each film has music synthesised in Python (`videos/music/*.py`, numpy only), such as noir jazz, chiptune or a space drone. It ducks under the dialogue automatically.
- **Sound design:** rain, typewriter clacks, arcade blips, chalk scratches.
- **A story shape:** a cold open, a problem or case, two challenges with rising stakes, the trap as the plot twist, "your turn" as the climax, and a payoff.

## The line-up

| # | id | Film | Genre and style | Teaches |
|---|----|------|-----------------|---------|
| 1 | `s2-noir` | The Case of the Odd One Out | Film noir: black and white, rain, film grain, police line-up, spotlights, a typewriter case file | Odd one out (the mirror trap) |
| 2 | `s2-arcade` | Code Breaker 3000 | 8-bit arcade: pixel font, CRT scanlines, chiptune, levels, high score | Codes |
| 3 | `s2-chalk` | Professor Chalk's Magic Changes | Blackboard lecture: chalk drawings sketched live, dust, a wry professor | Analogies |
| 4 | `s2-space` | Mission to the Missing Square | Starship bridge: star fields, a holographic grid, a ship's computer voice | Grids |
| 5 | `s2-nature` | Planet Shapes | Nature documentary: a whispering naturalist watches shapes "in the wild" change | Spot the Change, the 12 things |
| 6 | `s2-theatre` | The Great Word Swap | Puppet theatre: curtains, footlights, words as actors who have swapped costumes | Swapped words |
| 7 | `s2-bakeoff` | The Great Balance Bake-Off | Cooking show: kitchen scales, ingredients, two presenters | Balancing puzzles |
| 8 | `s2-heist` | The Evidence Heist | Museum heist and treasure map: torchlight on a manuscript, laser beams around the clue | Mega Reader: find the evidence |
| 9 | `s2-sports` | Match of the Day: Most Alike | Sports commentary: two excited commentators, replays and telestrator drawings | Similarities |
| 10 | `s2-train` | The Sequence Express | Steam train journey: each carriage is the next step, and the last carriage is missing | Sequences |

## Status

(Updated each iteration.)

- [x] Engine: multi-voice cast, `frame: "none"`, custom subtitles, music with ducking, extra sound effects
- [x] Music generator (`music/synth.py`)
- [x] 1 noir: rendered, 2:21 (`public-videos/s2-noir.mp4`)
- [ ] 2 arcade (agent working, with chalk)
- [ ] 3 chalk (agent working)
- [ ] 4 space (agent working, with train)
- [ ] 5 nature (agent working, with sports)
- [ ] 6 theatre
- [ ] 7 bakeoff
- [ ] 8 heist
- [ ] 9 sports (agent working)
- [ ] 10 train (agent working)
- [x] Films wired into the app (a "Cinema" shelf in the film library; each film appears when its mp4 exists)
- [ ] Still to assign once agents free up: theatre (swapped words), bakeoff (balancing), heist (find the evidence)
