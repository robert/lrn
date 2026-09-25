// One process serves everything: the JSON API, the pictures folder, and the
// React app (through Vite's dev middleware). Run with: npm run dev
import express from "express";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { createServer as createVite } from "vite";
import { ROOT } from "./store.js";
import suite from "./routes/suite.js";
import reader from "./routes/reader.js";
import imagination from "./routes/imagination.js";
import story from "./routes/story.js";
import spotter from "./routes/spotter.js";

const PORT = Number(process.env.PORT || 5173);
const app = express();
app.use(express.json({ limit: "25mb" }));

app.use("/api", suite);
app.use("/api/reader", reader);
app.use("/api/imagination", imagination);
app.use("/api/story", story);
app.use("/api/spotter", spotter);
app.use("/pictures", express.static(path.join(ROOT, "pictures")));
app.use("/videos", express.static(path.join(ROOT, "public-videos")));

// Any error in an API route comes back as JSON with the message, loudly.
app.use("/api", (err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Vite's live-reload socket shares our port, so quick restarts never clash.
const server = http.createServer(app);
const vite = await createVite({ root: ROOT, server: { middlewareMode: true, hmr: { server } }, appType: "spa" });
app.use(vite.middlewares);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n  Mega games are running!\n\n  On this computer:  http://localhost:${PORT}`);
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs ?? []) {
      if (a.family === "IPv4" && !a.internal) console.log(`  On the iPad/phone: http://${a.address}:${PORT}`);
    }
  }
  console.log(`  Parent settings:   http://localhost:${PORT}/#/parent\n`);
  if (!process.env.ANTHROPIC_API_KEY) console.log("  (No ANTHROPIC_API_KEY in .env yet: Imagination Engine results need it.)\n");
});
