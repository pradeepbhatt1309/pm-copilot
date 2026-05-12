import Anthropic from "@anthropic-ai/sdk";
import { store } from "../storage.js";

const STAKEHOLDER_SYSTEM = `You are generating a stakeholder brief for a Senior PM before an interaction. Use only information from the knowledge base provided. Never fabricate details.

Return valid JSON only:
{
  "name": "string",
  "organisation": "string",
  "role": "string",
  "projects": ["string"],
  "currentConcerns": ["string"],
  "communicationStyle": "string",
  "lastInteraction": "string",
  "talkingPoints": ["string"],
  "thingsToAvoid": ["string"],
  "openActions": ["string"]
}`;

export async function runStakeholderAgent(input: string, name?: string): Promise<Record<string, unknown>> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const stakeholders = store.getAllStakeholders();
  const projects = store.getAllProjects();

  let knownProfile = null;
  if (name) {
    knownProfile = store.findStakeholderByName(name);
  } else {
    for (const s of stakeholders) {
      if (input.toLowerCase().includes(s.name.toLowerCase())) {
        knownProfile = s;
        break;
      }
    }
  }

  const kbContext = knownProfile
    ? `Stakeholder Profile:\n${JSON.stringify(knownProfile, null, 2)}\n\nRelated Projects:\n${JSON.stringify(projects.filter(p => knownProfile!.projects.includes(p.name)), null, 2)}`
    : `Available Stakeholders:\n${stakeholders.map(s => `${s.name} - ${s.role} at ${s.organisation}`).join("\n")}\n\nAvailable Projects:\n${projects.map(p => `${p.name} (${p.status})`).join("\n")}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const delay = attempt > 0 ? Math.pow(2, attempt - 1) * 1000 : 0;
      if (delay > 0) await new Promise(r => setTimeout(r, delay));

      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        system: STAKEHOLDER_SYSTEM,
        messages: [{ role: "user", content: `Knowledge Base:\n${kbContext}\n\nRequest: ${input}` }],
        tool_choice: { type: "any" } as Anthropic.ToolChoiceAny,
        tools: [
          {
            name: "return_stakeholder_brief",
            description: "Return stakeholder brief",
            input_schema: {
              type: "object" as const,
              properties: {
                name: { type: "string" },
                organisation: { type: "string" },
                role: { type: "string" },
                projects: { type: "array", items: { type: "string" } },
                currentConcerns: { type: "array", items: { type: "string" } },
                communicationStyle: { type: "string" },
                lastInteraction: { type: "string" },
                talkingPoints: { type: "array", items: { type: "string" } },
                thingsToAvoid: { type: "array", items: { type: "string" } },
                openActions: { type: "array", items: { type: "string" } },
              },
              required: ["name", "organisation", "role", "projects", "currentConcerns", "communicationStyle", "lastInteraction", "talkingPoints", "thingsToAvoid", "openActions"],
            },
          },
        ],
      });

      const toolUse = response.content.find(c => c.type === "tool_use");
      if (toolUse && toolUse.type === "tool_use") return toolUse.input as Record<string, unknown>;

      const textContent = response.content.find(c => c.type === "text");
      if (textContent && textContent.type === "text") {
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      }

      throw new Error("No valid output from StakeholderAgent");
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw lastError || new Error("StakeholderAgent failed after 3 attempts");
}
