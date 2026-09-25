// Every video script in this folder, in the order given by each one's `order`.
const files = import.meta.webpackContext("./", { recursive: false, regExp: /\.jsx$/ });
export const VIDEOS = files.keys().map(k => files(k).default).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
