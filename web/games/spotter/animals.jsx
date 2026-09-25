// The animal ladder: one rung for every day the challenge is completed.
// Portraits are simple inline SVG; silhouettes show the ones still to earn.

export const ANIMALS = [
  {
    key: "mole", name: "Mole",
    fact: "Moles live underground, so their eyes are tiny and mostly just tell light from dark.",
    why: "You've started looking closely. Every eagle starts somewhere!",
  },
  {
    key: "rabbit", name: "Rabbit",
    fact: "A rabbit's eyes sit high on the sides of its head, so it can see almost all the way around without turning.",
    why: "You're starting to notice things all over the picture.",
  },
  {
    key: "cat", name: "Cat",
    fact: "Cats can see in light about six times dimmer than people need.",
    why: "You're spotting things that other people miss in the shadows.",
  },
  {
    key: "horse", name: "Horse",
    fact: "Horses have the biggest eyes of any animal that lives on land, and can see nearly all the way around them.",
    why: "Your eyes are getting bigger and sharper every day.",
  },
  {
    key: "owl", name: "Owl",
    fact: "An owl's eyes are so big they can't move, so it turns its whole head instead: up to about 270 degrees!",
    why: "You're turning shapes round in your head like an owl turns its neck.",
  },
  {
    key: "hawk", name: "Hawk",
    fact: "Hawks see several times more sharply than people, and can spot a mouse from high up in the sky.",
    why: "Tiny changes can't hide from you any more.",
  },
  {
    key: "eagle", name: "Eagle",
    fact: "An eagle can spot a rabbit from about three kilometres away: that's nearly two miles!",
    why: "Nothing gets past an eagle, and nothing gets past you.",
  },
];

const GREY = "#B9C6BF";

export function Portrait({ animal, silhouette = false, size = 64 }) {
  // c() swaps every colour for grey when the animal is still to be earned.
  const c = colour => (silhouette ? GREY : colour);
  const eye = silhouette ? GREY : "#1B2A24";
  const Drawing = DRAWINGS[animal];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-label={silhouette ? "still to earn" : animal}>
      <Drawing c={c} eye={eye} />
    </svg>
  );
}

const Whiskers = ({ c, y }) => (
  <g stroke={c("#5F6F68")} strokeWidth="1.5" strokeLinecap="round">
    <line x1="42" y1={y} x2="18" y2={y - 4} /><line x1="42" y1={y + 3} x2="18" y2={y + 5} />
    <line x1="58" y1={y} x2="82" y2={y - 4} /><line x1="58" y1={y + 3} x2="82" y2={y + 5} />
  </g>
);

const DRAWINGS = {
  mole: ({ c, eye }) => (
    <g>
      <ellipse cx="28" cy="90" rx="10" ry="6" fill={c("#F2B8C0")} />
      <ellipse cx="72" cy="90" rx="10" ry="6" fill={c("#F2B8C0")} />
      <circle cx="50" cy="58" r="34" fill={c("#5A4332")} />
      <ellipse cx="50" cy="72" rx="11" ry="8" fill={c("#F2A7B5")} />
      <circle cx="40" cy="52" r="2.2" fill={eye} />
      <circle cx="60" cy="52" r="2.2" fill={eye} />
    </g>
  ),
  rabbit: ({ c, eye }) => (
    <g>
      <ellipse cx="37" cy="26" rx="9" ry="24" fill={c("#C9B79E")} />
      <ellipse cx="63" cy="26" rx="9" ry="24" fill={c("#C9B79E")} />
      <ellipse cx="37" cy="28" rx="4" ry="16" fill={c("#F2B8C0")} />
      <ellipse cx="63" cy="28" rx="4" ry="16" fill={c("#F2B8C0")} />
      <circle cx="50" cy="64" r="29" fill={c("#D8C7AE")} />
      <circle cx="39" cy="58" r="4" fill={eye} />
      <circle cx="61" cy="58" r="4" fill={eye} />
      <path d="M46 69 L54 69 L50 74 Z" fill={c("#E88A9A")} />
      <Whiskers c={c} y={72} />
    </g>
  ),
  cat: ({ c, eye }) => (
    <g>
      <path d="M24 44 L28 12 L48 32 Z" fill={c("#E39B4B")} />
      <path d="M76 44 L72 12 L52 32 Z" fill={c("#E39B4B")} />
      <circle cx="50" cy="58" r="31" fill={c("#E9A55C")} />
      <ellipse cx="38" cy="54" rx="6" ry="7" fill={c("#8FC66B")} />
      <ellipse cx="62" cy="54" rx="6" ry="7" fill={c("#8FC66B")} />
      <ellipse cx="38" cy="54" rx="1.8" ry="6" fill={eye} />
      <ellipse cx="62" cy="54" rx="1.8" ry="6" fill={eye} />
      <path d="M46 66 L54 66 L50 71 Z" fill={c("#D9677A")} />
      <Whiskers c={c} y={70} />
    </g>
  ),
  horse: ({ c, eye }) => (
    <g>
      <path d="M36 22 L40 6 L46 22 Z" fill={c("#7A4B24")} />
      <path d="M64 22 L60 6 L54 22 Z" fill={c("#7A4B24")} />
      <ellipse cx="50" cy="54" rx="23" ry="36" fill={c("#8B5A2B")} />
      <path d="M44 16 Q50 8 56 16 L54 40 Q50 34 46 40 Z" fill={c("#3E2A17")} />
      <ellipse cx="50" cy="80" rx="17" ry="13" fill={c("#B07C4F")} />
      <circle cx="34" cy="46" r="3.5" fill={eye} />
      <circle cx="66" cy="46" r="3.5" fill={eye} />
      <ellipse cx="44" cy="82" rx="2.5" ry="3.5" fill={eye} />
      <ellipse cx="56" cy="82" rx="2.5" ry="3.5" fill={eye} />
    </g>
  ),
  owl: ({ c, eye }) => (
    <g>
      <path d="M22 30 L26 8 L40 24 Z" fill={c("#6E5238")} />
      <path d="M78 30 L74 8 L60 24 Z" fill={c("#6E5238")} />
      <ellipse cx="50" cy="58" rx="33" ry="37" fill={c("#8C6A4A")} />
      <circle cx="36" cy="48" r="14" fill={c("#FFFFFF")} />
      <circle cx="64" cy="48" r="14" fill={c("#FFFFFF")} />
      <circle cx="36" cy="48" r="9" fill={c("#F2C230")} />
      <circle cx="64" cy="48" r="9" fill={c("#F2C230")} />
      <circle cx="36" cy="48" r="5" fill={eye} />
      <circle cx="64" cy="48" r="5" fill={eye} />
      <path d="M45 60 L55 60 L50 72 Z" fill={c("#E08A2E")} />
    </g>
  ),
  hawk: ({ c, eye }) => (
    <g>
      <ellipse cx="46" cy="96" rx="36" ry="20" fill={c("#5E3E22")} />
      <circle cx="46" cy="54" r="31" fill={c("#7A5230")} />
      <ellipse cx="50" cy="66" rx="18" ry="14" fill={c("#E3CFAE")} />
      <path d="M60 42 Q72 38 80 44" stroke={c("#3E2A17")} strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="64" cy="50" r="7" fill={c("#F2C230")} />
      <circle cx="65" cy="50" r="4" fill={eye} />
      <path d="M72 56 Q90 56 92 66 Q84 62 74 66 Z" fill={c("#9AA3A0")} />
    </g>
  ),
  eagle: ({ c, eye }) => (
    <g>
      <ellipse cx="46" cy="98" rx="38" ry="20" fill={c("#4A2F1A")} />
      <circle cx="46" cy="54" r="31" fill={c("#FFFFFF")} stroke={c("#C5D3CC")} strokeWidth="2" />
      <path d="M58 42 Q70 36 80 44" stroke={c("#8A7A60")} strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="64" cy="50" r="7" fill={c("#F2C230")} />
      <circle cx="65" cy="50" r="4" fill={eye} />
      <path d="M70 56 Q94 54 94 70 Q86 64 72 68 Z" fill={c("#F2B233")} />
    </g>
  ),
};

// A portrait in an oval cameo frame with a gilt keyline, like a locket.
// Unearned animals show as a grey silhouette on sage.
export function Cameo({ animal, earned = true, current = false, width = 64 }) {
  return (
    <span className={`cameo ${earned ? "earned" : "unearned"} ${current ? "current" : ""}`} style={{ width, height: width * 1.25 }}>
      <Portrait animal={animal} silhouette={!earned} size={width * 0.86} />
    </span>
  );
}
