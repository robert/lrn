// The only place the server talks to Claude. It runs the Claude Code CLI
// (`claude -p`) on this computer, so it uses your Claude login and needs no
// API key.
import { execFile } from "node:child_process";

export const MODEL = "opus";

// Ask Claude for JSON matching `schema`. Throws if it can't produce it.
export function askForJson({ system, prompt, schema }) {
  const args = [
    "-p",
    "--output-format", "json",
    "--json-schema", JSON.stringify(schema),
    "--system-prompt", system,
    "--model", MODEL,
    // A plain question and answer: no tools, plugins, settings or saved session.
    "--tools", "",
    "--strict-mcp-config",
    "--setting-sources", "",
    "--disable-slash-commands",
    "--no-session-persistence",
  ];
  return new Promise((resolve, reject) => {
    const child = execFile("claude", args, { timeout: 300000, maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`claude -p failed: ${stderr.trim() || err.message}`));
      const out = JSON.parse(stdout);
      if (out.is_error) return reject(new Error(`Claude returned an error: ${out.result}`));
      if (!out.structured_output) return reject(new Error("Claude's answer didn't match the schema"));
      resolve(out.structured_output);
    });
    child.stdin.end(prompt);
  });
}
