#!/usr/bin/env node
// Run: node test-api-key.mjs
// Verifies ANTHROPIC_API_KEY is set and makes a real API call.

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env manually (dotenv may not be installed yet)
try {
  const lines = readFileSync(resolve(import.meta.dirname, ".env"), "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch {
  // No .env file — rely on process.env
}

const key = process.env.ANTHROPIC_API_KEY;

console.log("=== PM Copilot — API Key Check ===\n");

if (!key) {
  console.error("FAIL: ANTHROPIC_API_KEY is not set.");
  console.error("\nFix:");
  console.error("  cp .env.example .env");
  console.error("  # then edit .env and paste your key after ANTHROPIC_API_KEY=");
  process.exit(1);
}

console.log(`Key found: ${key.slice(0, 10)}...${key.slice(-4)}`);
console.log("Making test API call to claude-haiku-4-5-20251001...\n");

let Anthropic;
try {
  ({ default: Anthropic } = await import("@anthropic-ai/sdk"));
} catch {
  console.error("FAIL: @anthropic-ai/sdk not found.");
  console.error("\nFix: npm install");
  process.exit(1);
}

try {
  const client = new Anthropic({ apiKey: key });
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 16,
    messages: [{ role: "user", content: "Reply with only: OK" }],
  });
  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  console.log(`API response: "${text.trim()}"`);
  console.log("\nOK: API key is valid. You can start the app with: npm run dev");
} catch (err) {
  console.error(`FAIL: ${err.message}`);
  if (err.message.includes("401") || err.message.includes("authentication")) {
    console.error("\nThe API key was rejected. Get a valid key at: https://console.anthropic.com/");
  } else if (err.message.includes("Could not resolve")) {
    console.error("\nThe key value is empty or malformed. Check your .env file.");
  }
  process.exit(1);
}
