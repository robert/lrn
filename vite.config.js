import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The play-along films live in videos/ and import react and remotion from
// there; dedupe makes sure the whole app shares one copy of each.
export default defineConfig({
  plugins: [react()],
  resolve: { dedupe: ["react", "react-dom", "remotion", "@remotion/player", "@remotion/google-fonts"] },
});
