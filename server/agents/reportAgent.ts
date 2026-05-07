import Anthropic from "@anthropic-ai/sdk";
import { store } from "../storage.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const REPORT_SYSTEM = `You are generating a leadership summary for a Senior PM to share with C-suite leadership. Write in business language — no technical jargon. Use RAG indicators.

Return valid JSON only:
{
  "weekOf": "string",
  "executiveSummary": "string",
  "portfolioHealth": "On Track",
  "projects": [{"name": "string", "rag": "🟢 Green", "thisWeek": "string", "nextMilestone": "string", "risk": "string"}],
  "keyAchievements": ["string"],
  "risksForLeadership": ["string"],
  "decisionsNeeded": ["string"],
  "nextWeekOutlook": "string"
}`;

export async function runReportAgent(input: string): Promise<Record<string, unknown>> {
  if (store.isCircuitOpen()) {
    return {
      weekOf: new Date().toISOString().split("T")[0],
      executiveSummary: "Report generation unavailable. Please review manually.",
      portfolioHealth: "At Risk",
      projects: [],
      keyAchievements: [],
      risksForLeadership: ["AI system temporarily unavailable"],
      decisionsNeeded: ["Manual report compilation required"],
      nextWeekOutlook: "N/A",
    };
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const delay = attempt > 0 ? Math.pow(2, attempt - 1) * 1000 : 0;
      if (delay > 0) await new Promise(r => setTimeout(r, delay));

      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        system: REPORT_SYSTEM,
        messages: [{ role: "user", content: `Generate leadership summary from this project update:\n\n${input}` }],
        tool_choice: { type: "any" } as Anthropic.ToolChoiceAny,
        tools: [
          {
            name: "return_report",
            description: "Return the leadership report as structured JSON",
            input_schema: {
              type: "object" as const,
              properties: {
                weekOf: { type: "string" },
                executiveSummary: { type: "string" },
                portfolioHealth: { type: "string", enum: ["On Track", "At Risk", "Delayed"] },
                projects: { type: "array", items: { type: "object" } },
                keyAchievements: { type: "array", items: { type: "string" } },
                risksForLeadership: { type: "array", items: { type: "string" } },
                decisionsNeeded: { type: "array", items: { type: "string" } },
                nextWeekOutlook: { type: "string" },
              },
              required: ["weekOf", "executiveSummary", "portfolioHealth", "projects", "keyAchievements", "risksForLeadership", "decisionsNeeded", "nextWeekOutlook"],
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

      throw new Error("No valid output");
    } catch (err) {
      // continue retrying
    }
  }

  return {
    weekOf: new Date().toISOString().split("T")[0],
    executiveSummary: "Unable to generate report. Please review input manually.",
    portfolioHealth: "At Risk",
    projects: [],
    keyAchievements: [],
    risksForLeadership: ["Report agent unavailable"],
    decisionsNeeded: [],
    nextWeekOutlook: "N/A",
  };
}
