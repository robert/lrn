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
- [x] 2 arcade: rendered 2:29
- [x] 3 chalk: rendered 2:29
- [x] 4 space: rendered 2:34
- [x] 5 nature: rendered
- [x] 6 theatre: rendered (agent finishing bakeoff, heist)
- [x] 7 bakeoff
- [x] 8 heist
- [x] 9 sports
- [x] 10 train: rendered 2:34
- [x] Films wired into the app (a "Cinema" shelf in the film library; each film appears when its mp4 exists)
- [x] theatre, bakeoff, heist: all rendered

# Series 3: play-along films (live in the app)

Series 3 films aren't MP4s. They run live inside the app with Remotion's Player and stop at each riddle for him to tap the answer on the picture itself. A right tap carries the story on; a slip plays a short scene from a character explaining why, then returns to the same choice.

- **Engine:** `web/cinema/` (`PlayAlong.jsx` for flow and hotspots, `Segment.jsx` for one scene, `films.js` for the registry). Films live in `videos/src/play/*.jsx` and are voiced with the same `node scripts/voice.js <id>`. Deep link: `#/play/<id>/<sceneId>/choose`.
- **Scene flow fields:** `id`, `next` (the next scene), `choice: { prompt, next, options: [{ id, x, y, w, h, correct, slip }] }` with hotspots in 1920x1080 space, and `returnTo` (go back to that scene's choice).

## Films

- [x] 1 `p3-dragon`: The Dragon's Three Riddles. A pop-up book with paper layers that stand up off the page. Riddles: odd one out on the banners, stepping-stone sequence, magic analogy.
- [x] 2 `p3-comic`: Captain Sharp-Eye and the Switcheroo. A comic book, two taps a round: spot the changed shape, then name which of the twelve things changed. Voiced and reviewed.
- [ ] More ideas: a claymation "Shape Kitchen", a comic book "Captain Nothing-Gets-Past" with panels he taps, a marionette "Twelve Things" song-and-dance, a detective "choose your suspect" with branching endings.

# Series 4: shadow theatre of the story itself

Series 4 films bring the reading and the films together. Each one is a silhouette film of a passage he has already read, in the style of the old cut-paper shadow films. The storyteller reads the real text while he reads the words along in the captions, and the film pauses for inference questions he answers by tapping. They're play-along films, so they run in the same engine in `videos/src/play/`.

- [x] 1 `p4-shadow`: Into the Wild Wood. Voiced and reviewed.
- [ ] Next: The Door in the Snow (once he has read it), The Open Road and the caravan, Toad and the motor-car.

# Series 5: music videos

A song he can chant, cut as a music video. The words are Kokoro phrases fitted to the beat and mixed over a synthesised track in `music/<song>.py`, which also writes a timing file that drives the animation. Scripts with their own `Component` and `frames` are registered directly in Root; voice.js skips them.

- [ ] 1 `s5-twelve`: The Twelve Things. Bauhaus kinetic typography with primary colour fields cut on the bar. Verse, chorus, a call-and-response verse where each thing is echoed by a second voice, and a strip of twelve tiles that light up in order. Rendered.

# Series 6: real 3D

These films are rendered in three.js through `@remotion/three`, with lighting, shadows and a camera that moves through the scene. They use 3D where it genuinely teaches something 2D can't.

- [ ] 1 `s6-pancake`: The Pancake Flip. Paper flags on a wooden kitchen table. Spinning on the table never matches, but turning over like a pancake does, and a standing mirror shows the reflection is the flipped one. The rule: spun is rotated, turned over is flipped. Score: plucked ukulele (Karplus-Strong). Rendered, 1:40.

# Series 7: claymation, and Series 8: playable retro RPG

- [x] `s7-clay`: The Clay Workshop. Stop-motion on twos, thumbprinted clay, squash and stretch; Professor Hoot the owl and Wiggle the worm. Sequences and grids. Rendered, 2:13.
- [x] `p8-quest`: Shape Quest. A Game Boy style RPG play-along: Odd Ogre, Code Goblin and the Mirror Wraith boss, beaten with answers from the battle menu. Reviewed.

# Series 9: radio plays

Listening comprehension through inference. The story is carried by voices and sound design, with an art-deco wireless on screen.

- [ ] `p9-radio`: The Midnight Muffin. A night-train mystery with five characters, including a parrot. Three inference questions that each need two clues held together. Voiced and reviewed.

# Series 10: bedtime

- [x] `s10-stars`: Goodnight, Twelve Things. The twelve things in the night sky, much of it real astronomy: moon phases, the Plough wheeling round the Pole Star, the pointers, an occultation, a halo, a reflection in a lake. Whispered narration, music-box lullaby. Rendered, 2:12.
