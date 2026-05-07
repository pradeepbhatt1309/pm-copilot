export function getSummariseThreadTool() {
  return {
    name: "summarise_thread",
    description: "Condenses long email threads or documents into key points. Use when input exceeds 500 words or contains multiple back-and-forth exchanges. Do NOT use for short single emails.",
    input_schema: {
      type: "object" as const,
      properties: {
        text: { type: "string", description: "The text to summarise" },
        maxLength: { type: "number", description: "Maximum length of summary in words" },
      },
      required: ["text"],
    },
  };
}
