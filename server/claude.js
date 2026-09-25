// The only place the server talks to the Anthropic API. The key comes from
// ANTHROPIC_API_KEY in .env and never leaves the server.
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-opus-5";

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set. Add it to .env and restart.");
  client ??= new Anthropic();
  return client;
}

// Ask Claude for JSON matching `schema`. Throws if it can't produce it.
export async function askForJson({ system, prompt, schema }) {
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: [{ role: "user", content: prompt }],
    output_config: { format: { type: "json_schema", schema } },
  });
  if (response.stop_reason === "refusal") throw new Error(`Claude declined: ${response.stop_details?.explanation ?? "no reason given"}`);
  if (response.stop_reason === "max_tokens") throw new Error("Claude's answer was cut off");
  const text = response.content.filter(b => b.type === "text").map(b => b.text).join("");
  return JSON.parse(text);
}
