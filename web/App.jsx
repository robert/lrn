// A tiny hash router: #/reader, #/spotter and so on. No library needed.
import { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Parent from "./pages/Parent.jsx";
import Watch from "./pages/Watch.jsx";
import PlayAlong from "./cinema/PlayAlong.jsx";
import News from "./cinema/News.jsx";
import ReaderApp from "./games/reader/ReaderApp.jsx";
import ImaginationApp from "./games/imagination/ImaginationApp.jsx";
import StoryApp from "./games/story/StoryApp.jsx";
import SpotterApp from "./games/spotter/SpotterApp.jsx";

const ROUTES = {
  "": Home,
  reader: ReaderApp,
  imagination: ImaginationApp,
  story: StoryApp,
  spotter: SpotterApp,
  parent: Parent,
  watch: Watch,
  play: PlayAlong,
  news: News,
};

const currentPath = () => window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);

export function go(path) {
  window.location.hash = `#/${path}`;
  window.scrollTo(0, 0);
}

export default function App() {
  const [parts, setParts] = useState(currentPath);
  useEffect(() => {
    const onHash = () => setParts(currentPath());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const Page = ROUTES[parts[0] ?? ""] ?? Home;
  // sub is the rest of the path, e.g. #/reader/results gives ["results"].
  return <Page key={parts[0] ?? ""} sub={parts.slice(1)} />;
}
