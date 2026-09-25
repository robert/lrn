// The same cloth-bound library look as the games (see ../../DESIGN.md).
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";

export const { fontFamily: SERIF } = loadFraunces("normal", { weights: ["400", "500", "600"], subsets: ["latin"] });
loadFraunces("italic", { weights: ["400", "500"], subsets: ["latin"] });
export const { fontFamily: SANS } = loadNunito("normal", { weights: ["600", "700", "800"], subsets: ["latin"] });

export const C = {
  cloth: "#1E3B30",
  clothDeep: "#142820",
  gilt: "#C9A24B",
  giltLight: "#EDD48F",
  giltDark: "#8B6A27",
  ground: "#DCE7E1",
  paper: "#FAFBF8",
  white: "#FFFFFF",
  rule: "#C5D3CC",
  ruleSoft: "#E4ECE7",
  ink: "#1B2A24",
  soft: "#5F6F68",
  faint: "#93A29B",
  green: "#1F7A4D",
  red: "#C8102E",
  mud: "#7A5C3E",
  highlight: "#FFF1B8",
  grey: "#B4C2BA",
};

// One cloth per kind of video.
export const CLOTHS = {
  reader: "#1F5A40",
  imagination: "#3B3461",
  story: "#6D3A2B",
  spotter: "#1E3E5C",
  cover: "#1E3B30",
};

export const W = 1920;
export const H = 1080;
export const FPS = 30;
