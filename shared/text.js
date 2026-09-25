// Text helpers shared by the browser app and the build scripts.
// Passage paragraphs keep the book's _underscore_ italics. Everything that
// matches or highlights text works on the "plain" form with the underscores
// removed, so character positions line up with what is drawn on screen.

// Split a paragraph into characters, remembering which ones are italic.
export function parseItalics(para) {
  const chars = [];
  let italic = false;
  for (const ch of para) {
    if (ch === "_") { italic = !italic; continue; }
    chars.push({ ch, italic });
  }
  return chars;
}

export const plainText = para => parseItalics(para).map(c => c.ch).join("");

// Same length in, same length out: only swaps look-alike characters.
function fold(s) {
  return s.toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s/g, " ");
}

// Find a quote inside a paragraph. "..." inside the quote skips words.
// Returns [start, end] in the plain paragraph, or null if it isn't there.
export function locate(para, quote) {
  const hay = fold(plainText(para));
  const pieces = fold(quote).replace(/_/g, "").split(/\.\.\.|…/).map(p => p.trim()).filter(Boolean);
  if (!pieces.length) return null;
  for (let from = hay.indexOf(pieces[0]); from !== -1; from = hay.indexOf(pieces[0], from + 1)) {
    let pos = from + pieces[0].length;
    let ok = true;
    for (const piece of pieces.slice(1)) {
      const at = hay.indexOf(piece, pos);
      if (at === -1) { ok = false; break; }
      pos = at + piece.length;
    }
    if (ok) return [from, pos];
  }
  return null;
}

// The phrase wrapped in *asterisks* in a question, if any.
export function quoteIn(question) {
  const m = question.match(/\*([^*]+)\*/);
  return m ? m[1] : null;
}

export const wordCount = paras => paras.map(p => plainText(p).split(/\s+/).filter(Boolean).length)
  .reduce((a, b) => a + b, 0);
