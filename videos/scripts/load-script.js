// Loads a video script in Node with its drawing code swapped for empty
// stand-ins, so the narration and timings can be read without a browser.
import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// esbuild plugin: every relative import becomes a module of do-nothing exports.
const stubs = {
  name: "stubs",
  setup(b) {
    b.onResolve({ filter: /^\./ }, args => args.kind === "entry-point" ? null : { path: path.resolve(args.resolveDir, args.path), namespace: "stub" });
    b.onResolve({ filter: /^[^.]/ }, args => args.kind === "entry-point" ? null : { path: args.path, namespace: "stub" });
    b.onLoad({ filter: /.*/, namespace: "stub" }, args => {
      const src = fs.existsSync(args.path) ? fs.readFileSync(args.path, "utf8") : "";
      const names = new Set([...src.matchAll(/export\s+(?:const|function|let|class)\s+(\w+)/g)].map(m => m[1]));
      for (const m of src.matchAll(/export\s+(?:const|let)\s+\{([^}]+)\}/g)) m[1].split(",").forEach(n => names.add(n.split(":").pop().trim()));
      // Bare packages (remotion, react): stub whatever the script imports.
      // One self-returning stand-in: any property, call or destructure works.
      const any = "__any";
      const known = ["ThreeCanvas", "useThree", "useFrame", "Audio", "Video", "OffthreadVideo", "Loop", "Series", "Freeze", "random", "useVideoConfig", "delayRender", "continueRender", "loadFont", "jsx", "jsxs", "jsxDEV", "AbsoluteFill", "interpolate", "spring", "Easing", "Sequence", "useCurrentFrame", "staticFile", "Img", "useId", "Fragment"];
      known.forEach(n => names.add(n));
      const header = "const __any = new Proxy(function(){}, { get: (t, k) => k === Symbol.toPrimitive ? () => \"\" : __any, apply: () => __any });\n";
      return { contents: header + [...names].map(n => `export const ${n} = ${any};`).join("\n") + `\nexport default ${any};`, loader: "js" };
    });
  },
};

// Films live in src/videos/ (rendered to mp4) or src/play/ (played live in the app).
export function scriptPath(id) {
  for (const dir of ["videos", "play"]) {
    const p = path.join(ROOT, "src", dir, `${id}.jsx`);
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`No film called ${id} in src/videos or src/play`);
}

export async function loadScript(id) {
  const outfile = path.join(ROOT, "node_modules/.cache/voice", `${id}.mjs`);
  await build({
    entryPoints: [scriptPath(id)], bundle: true, format: "esm", platform: "node",
    outfile, jsx: "automatic", jsxImportSource: "stubreact", plugins: [stubs], logLevel: "error",
  });
  const script = (await import(pathToFileURL(outfile).href + `?t=${Date.now()}`)).default;
  if (script.id !== id) throw new Error(`${id}.jsx has id "${script.id}"`);
  return script;
}


// Each beat's words, and (for films with a cast) whose voice says them.
export const narration = script =>
  script.scenes.flatMap((scene, si) => scene.beats.map((beat, bi) => {
    const actor = beat.who ? script.cast?.[beat.who] : null;
    if (beat.who && !actor) throw new Error(`${script.id}: no cast member "${beat.who}"`);
    return { id: `s${si}b${bi}`, text: beat.voice ?? beat.say, voice: actor?.voice, speed: actor?.speed };
  }));
