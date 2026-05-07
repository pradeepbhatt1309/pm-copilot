import Anthropic from "@anthropic-ai/sdk";
import { store } from "../storage.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const RISK_SYSTEM = `You are a risk assessment specialist for BFSI AI delivery programmes. Identify, categorise and prioritise all risks in the input. Be conservative — when in doubt, flag it.

Return valid JSON only:
{
  "overallRiskLevel": "High",
  "risks": [{"description": "string", "category": "Timeline", "severity": "🔴 High", "likelihood": "High", "impact": "string", "mitigation": "string", "owner": "string", "escalationNeeded": true}],
  "escalationEmail": {"subject": "string", "body": "string", "urgency": "string"},
  "immediateActions": ["string"]
}

category must be one of: Timeline, Resource, Technical, Stakeholder, Compliance
severity must be one of: 🔴 High, 🟡 Medium, 🟢 Low`;

export async function runRiskAgent(input: string): Promise<Record<string, unknown>> {
  if (store.isCircuitOpen()) {
    return {
      overallRiskLevel: "High",
      risks: [{ description: "AI system unavailable — manual risk review required", category: "Technical", severity: "🟡 Medium", likelihood: "High", impact: "Delayed risk assessment", mitigation: "Perform manual review", owner: "PM", escalationNeeded: false }],
      escalationEmail: { subject: "Risk Review Required", body: "AI risk assessment is temporarily unavailable. Please perform a manual review.", urgency: "medium" },
      immediateActions: ["Conduct manual risk review"],
    };
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const delay = attempt > 0 ? Math.pow(2, attempt - 1) * 1000 : 0;
      if (delay > 0) await new Promise(r => setTimeout(r, delay));

      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        system: RISK_SYSTEM,
        messages: [{ role: "user", content: `Identify and assess all risks in this input:\n\n${input}` }],
        tool_choice: { type: "any" } as Anthropic.ToolChoiceAny,
        tools: [
          {
            name: "return_risk_assessment",
            description: "Return structured risk assessment",
            input_schema: {
              type: "object" as const,
              properties: {
                overallRiskLevel: { type: "string", enum: ["High", "Medium", "Low"] },
                risks: { type: "array", items: { type: "object" } },
                escalationEmail: { type: "object" },
                immediateActions: { type: "array", items: { type: "string" } },
              },
              required: ["overallRiskLevel", "risks", "escalationEmail", "immediateActions"],
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
      // continue
    }
  }

  return {
    overallRiskLevel: "Medium",
    risks: [{ description: "Risk agent unavailable — manual review needed", category: "Technical", severity: "🟡 Medium", likelihood: "High", impact: "Unknown", mitigation: "Manual review", owner: "PM", escalationNeeded: false }],
    escalationEmail: { subject: "Manual Risk Review Required", body: "Please conduct a manual risk review.", urgency: "medium" },
    immediateActions: ["Manual risk review required"],
  };
}
