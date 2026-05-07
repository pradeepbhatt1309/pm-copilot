export function getLookupStakeholderTool() {
  return {
    name: "lookup_stakeholder",
    description: "Fetches stakeholder context from MCP knowledge base. Use when user asks about a specific person or before a meeting. Do NOT use for general questions not related to a known stakeholder.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Name of the stakeholder to look up" },
        purpose: { type: "string", description: "Why you need this information" },
      },
      required: ["name"],
    },
  };
}
