// The Story Builder plan: one slot per line, always shown in this order.
// Edit this list to change the plan. The tutor's full planning checklist may
// add more slots; just add them here in the right place.
//   id:      stored in saved plans (don't change it once plans exist)
//   label:   the name he learns and recalls
//   prompt:  the short question shown while he fills the slot in
//   aliases: words that count as naming this slot in the recall stage
export const PLAN_SLOTS = [
  { id: "who", label: "Who", prompt: "Who is in your story?", aliases: ["who", "character", "characters", "people"] },
  { id: "what", label: "What", prompt: "What are they doing?", aliases: ["what"] },
  { id: "when", label: "When", prompt: "When does it happen?", aliases: ["when", "time"] },
  { id: "where", label: "Where", prompt: "Where does it happen?", aliases: ["where", "place", "setting"] },
  { id: "problem", label: "Problem", prompt: "What goes wrong?", aliases: ["problem", "problems", "trouble"] },
  { id: "solution", label: "Solution", prompt: "How does it get fixed?", aliases: ["solution", "solutions", "fix", "solve"] },
  { id: "ending", label: "Ending", prompt: "How does it end, and how do they feel?", aliases: ["ending", "end", "finish"] },
];

// Which slots does this bit of speech or typing name? Matches loosely, so
// "Who" or "who what when where" both work. Returns slot ids in plan order.
export function slotsNamedIn(text) {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, " ").split(/\s+/).filter(Boolean);
  return PLAN_SLOTS.filter(s => s.aliases.some(a => words.includes(a))).map(s => s.id);
}
