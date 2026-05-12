import Anthropic from "@anthropic-ai/sdk";

const MEETING_SYSTEM = `You are extracting structured information from meeting notes for a Senior PM in BFSI. Be precise — only extract what is explicitly stated, never infer.

Return valid JSON only:
{
  "meetingTitle": "string",
  "date": "string",
  "attendees": ["string"],
  "decisions": [{"decision": "string", "owner": "string", "rationale": "string"}],
  "actionItems": [{"task": "string", "owner": "string", "dueDate": "string", "priority": "high"}],
  "risks": [{"description": "string", "severity": "string"}],
  "followUpEmail": {"subject": "string", "body": "string", "recipients": ["string"]},
  "openItems": ["string"]
}`;

export async function runMeetingAgent(input: string): Promise<Record<string, unknown>> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const delay = attempt > 0 ? Math.pow(2, attempt - 1) * 1000 : 0;
      if (delay > 0) await new Promise(r => setTimeout(r, delay));

      const response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        system: MEETING_SYSTEM,
        messages: [{ role: "user", content: `Extract structured information from these meeting notes:\n\n${input}` }],
        tool_choice: { type: "any" } as Anthropic.ToolChoiceAny,
        tools: [
          {
            name: "return_meeting_analysis",
            description: "Return structured meeting analysis",
            input_schema: {
              type: "object" as const,
              properties: {
                meetingTitle: { type: "string" },
                date: { type: "string" },
                attendees: { type: "array", items: { type: "string" } },
                decisions: { type: "array", items: { type: "object" } },
                actionItems: { type: "array", items: { type: "object" } },
                risks: { type: "array", items: { type: "object" } },
                followUpEmail: { type: "object" },
                openItems: { type: "array", items: { type: "string" } },
              },
              required: ["meetingTitle", "date", "attendees", "decisions", "actionItems", "risks", "followUpEmail", "openItems"],
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

      throw new Error("No valid output from MeetingAgent");
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw lastError || new Error("MeetingAgent failed after 3 attempts");
}
