// Registers one composition per video script. Only the id is passed as a
// prop (props get serialised), and the script is looked up inside.
import React from "react";
import { Composition } from "remotion";
import { VIDEOS } from "./videos/index.js";
import { buildTimeline } from "./lib/timeline.js";
import DURATIONS from "./lib/durations.js";
import { Video } from "./lib/Video.jsx";
import { FPS, W, H } from "./lib/theme.js";

function VideoById({ id }) {
  const script = VIDEOS.find(v => v.id === id);
  return <Video script={script} timeline={buildTimeline(script, DURATIONS[id])} />;
}

// Films with their own Component (music videos) set their own length.
export function Root() {
  return VIDEOS.map(script => script.Component ? (
    <Composition key={script.id} id={script.id} component={script.Component}
      durationInFrames={script.frames} fps={FPS} width={W} height={H} />
  ) : (
    <Composition key={script.id} id={script.id} component={VideoById}
      durationInFrames={buildTimeline(script, DURATIONS[script.id]).total} fps={FPS} width={W} height={H}
      defaultProps={{ id: script.id }} />
  ));
}
