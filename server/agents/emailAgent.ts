import Anthropic from "@anthropic-ai/sdk";

const EMAIL_SYSTEM = `You are drafting professional emails for a Senior Project Manager in BFSI Wealth & Asset Management. Write in a professional, concise, senior-appropriate tone.

Return valid JSON only:
{
  "priority": "high",
  "priorityReason": "string",
  "suggestedResponseTime": "string",
  "draftReply": {
    "subject": "string",
    "body": "string",
    "tone": "string"
  },
  "actionItems": [{"task": "string", "owner": "string", "dueDate": "string", "priority": "string"}],
  "risks": [{"description": "string", "severity": "string", "suggestedAction": "string"}],
  "keyPoints": ["string"]
}`;

export async function runEmailAgent(input: string, context?: string): Promise<Record<string, unknown>> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const delay = attempt > 0 ? Math.pow(2, attempt - 1) * 1000 : 0;
      if (delay > 0) await new Promise(r => setTimeout(r, delay));

      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        system: EMAIL_SYSTEM,
        messages: [{ role: "user", content: `${context ? `Context: ${context}\n\n` : ""}Email content:\n\n${input}` }],
        tool_choice: { type: "any" } as Anthropic.ToolChoiceAny,
        tools: [
          {
            name: "return_email_analysis",
            description: "Return the email analysis as structured JSON",
            input_schema: {
              type: "object" as const,
              properties: {
                priority: { type: "string", enum: ["high", "medium", "low"] },
                priorityReason: { type: "string" },
                suggestedResponseTime: { type: "string" },
                draftReply: {
                  type: "object",
                  properties: {
                    subject: { type: "string" },
                    body: { type: "string" },
                    tone: { type: "string" },
                  },
                  required: ["subject", "body", "tone"],
                },
                actionItems: { type: "array", items: { type: "object" } },
                risks: { type: "array", items: { type: "object" } },
                keyPoints: { type: "array", items: { type: "string" } },
              },
              required: ["priority", "priorityReason", "suggestedResponseTime", "draftReply", "actionItems", "risks", "keyPoints"],
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

      throw new Error("No valid output from EmailAgent");
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw lastError || new Error("EmailAgent failed after 3 attempts");
}
