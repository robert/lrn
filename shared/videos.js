// The explainer films (made in videos/, rendered to public-videos/<id>.mp4).
export const FILMS = [
  { id: "spot-the-change", title: "Spot the Change", group: "Shapes and patterns", blurb: "The twelve things that can change, and how to catch every one." },
  { id: "analogies", title: "Analogies", group: "Shapes and patterns", blurb: "Say the change as a rule, then do exactly the same again." },
  { id: "odd-one-out", title: "Odd One Out", group: "Shapes and patterns", blurb: "Find what four share, and name why the fifth doesn't." },
  { id: "codes", title: "Codes", group: "Shapes and patterns", blurb: "Every letter is a secret message. Crack them all." },
  { id: "similarities", title: "Most Alike", group: "Shapes and patterns", blurb: "What do the two really share? Ignore the lookalikes." },
  { id: "sequences", title: "Sequences", group: "Shapes and patterns", blurb: "Follow one change at a time along the row." },
  { id: "grids", title: "Grids", group: "Shapes and patterns", blurb: "Read across, read down, then fill the gap." },
  { id: "swapped-words", title: "Swapped Words", group: "Words and logic", blurb: "Two words are in each other's places. Swap them back." },
  { id: "weights", title: "Balancing Puzzles", group: "Words and logic", blurb: "Turn everything into the same animal, one balance at a time." },
  { id: "reader-quoted", title: "What Do the Words Mean?", group: "Mega Reader questions", blurb: "What do the words mean here, not word by word?" },
  { id: "reader-search", title: "Find the Evidence", group: "Mega Reader questions", blurb: "Hunt down the clue yourself." },
  { id: "reader-across", title: "Two Places at Once", group: "Mega Reader questions", blurb: "Hold two parts of the story together." },
  { id: "reader-character", title: "Word and Proof", group: "Mega Reader questions", blurb: "Check the proof first, then the word." },
  // Series 2: the cinema. Each is a short film in a different genre.
  { id: "s2-noir", title: "The Case of the Odd One Out", group: "The cinema", genre: "Film noir", blurb: "Inspector Sharp and a line-up of five suspects." },
  { id: "s2-arcade", title: "Code Breaker 3000", group: "The cinema", genre: "Arcade game", blurb: "Insert coin. Crack the code. Beat the high score." },
  { id: "s2-chalk", title: "Professor Chalk's Magic Changes", group: "The cinema", genre: "Blackboard lecture", blurb: "Analogies, sketched live in chalk." },
  { id: "s2-space", title: "Mission to the Missing Square", group: "The cinema", genre: "Space adventure", blurb: "Complete the star map to jump home." },
  { id: "s2-nature", title: "Planet Shapes", group: "The cinema", genre: "Nature documentary", blurb: "Watching shapes change in the wild." },
  { id: "s2-theatre", title: "The Great Word Swap", group: "The cinema", genre: "Puppet theatre", blurb: "Two words have swapped costumes." },
  { id: "s2-bakeoff", title: "The Great Balance Bake-Off", group: "The cinema", genre: "Cooking show", blurb: "Weigh it up, one scale at a time." },
  { id: "s2-heist", title: "The Evidence Heist", group: "The cinema", genre: "Heist", blurb: "Steal the clue from the story itself." },
  { id: "s2-sports", title: "Match of the Day: Most Alike", group: "The cinema", genre: "Football highlights", blurb: "Action replays of what two figures really share." },
  { id: "s2-train", title: "The Sequence Express", group: "The cinema", genre: "Steam railway", blurb: "Couple on the missing carriage." },
  // Series 6: real 3D.
  { id: "s6-pancake", title: "The Pancake Flip", group: "The cinema", genre: "3D film", blurb: "Spinning never matches. Turning over does." },
  // Series 5: songs.
  { id: "s5-twelve", title: "The Twelve Things", group: "Songs", genre: "Music video", blurb: "Sing the twelve things in order until they stick." },
];

// Which film goes with each question type in "nothing gets past you".
export const FILM_FOR_FORMAT = {
  analogies: "analogies", odd: "odd-one-out", similar: "similarities",
  codes: "codes", sequences: "sequences", grids: "grids",
};
