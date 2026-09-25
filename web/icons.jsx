// Hand-drawn line icons for the whole suite, in place of emoji.
// All are 24x24, drawn with the current text colour, so they turn gilt on
// cloth and ink on paper. Use: <Icon name="book" /> or <Icon name="flame" size={20} />
const PATHS = {
  // Open book: two pages with a spine.
  book: <>
    <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
    <path d="M12 6.5v13" />
  </>,
  // Lightbulb with a spark of rays.
  bulb: <>
    <path d="M9 17.5h6M10 20.5h4" />
    <path d="M12 3.5a5.5 5.5 0 0 0-3.2 10c.6.5 1 1.2 1 2V16h4.4v-.5c0-.8.4-1.5 1-2A5.5 5.5 0 0 0 12 3.5Z" />
    <path d="M12 1v1M4.2 4.2l.7.7M19.8 4.2l-.7.7M1.5 10.5h1M21.5 10.5h1" />
  </>,
  // Quill pen writing a line: planning stories.
  quill: <>
    <path d="M20 3c-6 1-10.5 5-12.5 11l-1 3.5 3.5-1C16 14.5 19 10 20 3Z" />
    <path d="M6.5 17.5 4 20" />
    <path d="M9.5 13.5c2.5-1 5-3.5 6.5-6.5" />
    <path d="M13 21h7" />
  </>,
  // An eye with a bright pupil: the sharp-eyed game.
  eye: <>
    <path d="M1.8 12S5.5 5.5 12 5.5 22.2 12 22.2 12 18.5 18.5 12 18.5 1.8 12 1.8 12Z" />
    <circle cx="12" cy="12" r="3.4" />
    <circle cx="13.2" cy="10.8" r="0.9" fill="currentColor" stroke="none" />
  </>,
  flame: <>
    <path d="M12 21.5c-4 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-8.3.4 1.7 1.3 2.8 2.4 3.4.2-3 1.6-5.5 3.5-7.4.2 3.2 3.5 5.8 3.5 11.2 0 4.1-2.7 7.3-6.5 7.3Z" />
    <path d="M12 21.5c-1.7 0-2.8-1.2-2.8-2.8 0-1.8 1.4-2.7 2-4.2 1 .9 3.6 2.3 3.6 4.4 0 1.6-1.2 2.6-2.8 2.6Z" />
  </>,
  star: <path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8Z" />,
  check: <path d="m4.5 12.5 4.8 4.8L19.5 7" />,
  mic: <>
    <rect x="8.5" y="2.5" width="7" height="12" rx="3.5" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" />
  </>,
  back: <path d="M15 5l-7 7 7 7" />,
  next: <path d="M9 5l7 7-7 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  // Four-point sparkle.
  sparkle: <path d="M12 2.5c.6 4.4 2.6 6.9 7 7.5-4.4.6-6.4 3.1-7 7.5-.6-4.4-2.6-6.9-7-7.5 4.4-.6 6.4-3.1 7-7.5Z" />,
  // Medal on a ribbon, for the reader's record.
  medal: <>
    <path d="M8 2.5 10.5 9M16 2.5 13.5 9" />
    <circle cx="12" cy="15" r="5.5" />
    <path d="m12 12.3.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3.9-1.8Z" />
  </>,
  // Laurel wreath: celebration screens.
  laurel: <>
    <path d="M8 20c-3.5-2-5.5-5.5-5-10M16 20c3.5-2 5.5-5.5 5-10" />
    <path d="M4.5 15.5c1.5.2 2.8-.4 3.3-1.7-1.5-.3-2.8.3-3.3 1.7ZM3.3 11.5c1.4.5 2.8.1 3.5-1.1-1.4-.5-2.8 0-3.5 1.1ZM3.5 7.5c1.2.8 2.6.7 3.6-.3-1.2-.8-2.7-.6-3.6.3Z" />
    <path d="M19.5 15.5c-1.5.2-2.8-.4-3.3-1.7 1.5-.3 2.8.3 3.3 1.7ZM20.7 11.5c-1.4.5-2.8.1-3.5-1.1 1.4-.5 2.8 0 3.5 1.1ZM20.5 7.5c-1.2.8-2.6.7-3.6-.3 1.2-.8 2.7-.6 3.6.3Z" />
  </>,
  // Stopwatch for timed rounds.
  timer: <>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 13.5V9.5M9.5 2.5h5M12 2.5V6M18.5 6.5l1.3-1.3" />
  </>,
  // Keyboard, for typing instead of speaking.
  keys: <>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <path d="M6 10h.01M9.3 10h.01M12.6 10h.01M16 10h.01M6 13.5h.01M18 13.5h.01M8.5 14.5h7" strokeWidth="2.2" />
  </>,
  refresh: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4.5V11h-6.5" />,
  // A trophy cup for the weekly reward.
  trophy: <>
    <path d="M7.5 3.5h9v5a4.5 4.5 0 0 1-9 0v-5Z" />
    <path d="M7.5 5.5H4.5c0 3 1.3 4.5 3.5 4.8M16.5 5.5h3c0 3-1.3 4.5-3.5 4.8M12 13v4M8.5 20.5h7M9.5 17h5v3.5h-5z" />
  </>,
  // A lightning bolt for fast rounds.
  bolt: <path d="M13.5 2.5 5 13.5h6l-1 8 8.5-11h-6l1-8Z" />,
  // Magnifying glass for close looking.
  lens: <>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m15.5 15.5 5.5 5.5" />
  </>,
  // A rounded square: stop listening.
  stop: <rect x="6" y="6" width="12" height="12" rx="2.5" />,
  // A play triangle in a circle, for films.
  play: <>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M10 8.3v7.4l6-3.7-6-3.7Z" />
  </>,
};

export default function Icon({ name, size = 24, strokeWidth = 1.6, className, title }) {
  const path = PATHS[name];
  if (!path) throw new Error(`No icon called "${name}"`);
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden={title ? undefined : true} role={title ? "img" : undefined}>
      {title && <title>{title}</title>}
      {path}
    </svg>
  );
}
