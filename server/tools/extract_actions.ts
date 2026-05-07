export interface ActionItem {
  task: string;
  owner: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

export interface ExtractActionsInput {
  text: string;
  context?: string;
}

export interface ExtractActionsOutput {
  actions: ActionItem[];
}

export interface ToolError {
  error_type: string;
  message: string;
  suggestion: string;
}

export function getExtractActionsTool() {
  return {
    name: "extract_actions",
    description: "Extracts all action items from any text. Use when input contains tasks, commitments, or follow-ups that need tracking. Do NOT use for generating new content or drafting communications.",
    input_schema: {
      type: "object" as const,
      properties: {
        text: { type: "string", description: "The text to extract actions from" },
        context: { type: "string", description: "Additional context about the text" },
      },
      required: ["text"],
    },
  };
}
