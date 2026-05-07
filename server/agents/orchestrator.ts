import Anthropic from "@anthropic-ai/sdk";
import { store } from "../storage.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ORCHESTRATOR_SYSTEM = `You are the PM Copilot orchestration coordinator for a Senior PM in BFSI Wealth & Asset Management.
Analyse the input and determine:
1. What type of content is this?
2. Which agents should process it?
3. Are multiple agents needed?

Input types:
- EMAIL: contains From/Subject or email-style content
- MEETING_NOTES: contains attendees, discussions, actions
- PROJECT_UPDATE: contains project status, RAG, milestones
- RISK: contains blockers, delays, concerns
- STAKEHOLDER_QUERY: asks about a specific person
- MIXED: contains multiple types

Return valid JSON only:
{
  "inputType": ["string"],
  "agentsToCall": ["string"],
  "confidence": 0.95,
  "context": "string",
  "urgency": "high"
}

agentsToCall values: "EmailAgent", "MeetingAgent", "ReportAgent", "RiskAgent", "StakeholderAgent"`;

export interface OrchestratorResult {
  inputType: string[];
  agentsToCall: string[];
  confidence: number;
  context: string;
  urgency: "high" | "medium" | "low";
}

export async function runOrchestrator(input: string): Promise<OrchestratorResult> {
  if (store.isCircuitOpen()) {
    return {
      inputType: ["UNKNOWN"],
      agentsToCall: ["EmailAgent"],
      confidence: 0.5,
      context: "Circuit breaker open — simplified routing",
      urgency: "low",
    };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const delay = attempt > 0 ? Math.pow(2, attempt - 1) * 1000 : 0;
      if (delay > 0) await new Promise(r => setTimeout(r, delay));

      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        system: ORCHESTRATOR_SYSTEM,
        messages: [{ role: "user", content: `Analyse this input and return routing JSON:\n\n${input}` }],
      });

      const text = response.content[0].type === "text" ? response.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON in response");

      const result = JSON.parse(jsonMatch[0]) as OrchestratorResult;
      store.recordSuccess();
      return result;
    } catch (err) {
      lastError = err as Error;
      store.recordFailure();
    }
  }

  throw lastError || new Error("Orchestrator failed after 3 attempts");
}
