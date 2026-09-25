// Narration lengths for every video, one JSON file each in
// src/generated/durations/ (written by scripts/voice.js).
const files = import.meta.webpackContext("../generated/durations", { recursive: false, regExp: /\.json$/ });
export default Object.fromEntries(files.keys().map(k => [k.replace(/^\.\/|\.json$/g, ""), files(k)]));
