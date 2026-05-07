export function getFlagRisksTool() {
  return {
    name: "flag_risks",
    description: "Identifies risk indicators in text and returns structured risk assessment. Use when input contains delivery updates, project status or stakeholder concerns. Do NOT use as primary tool for emails.",
    input_schema: {
      type: "object" as const,
      properties: {
        text: { type: "string", description: "Text to analyse for risks" },
        projectContext: { type: "string", description: "Project context" },
        threshold: { type: "string", enum: ["low", "medium", "high"], description: "Minimum severity threshold to flag" },
      },
      required: ["text"],
    },
  };
}
