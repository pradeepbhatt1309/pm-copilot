export function getDraftReplyTool() {
  return {
    name: "draft_reply",
    description: "Drafts a professional email reply in the PM's voice. Use when a reply to an email is needed. Do NOT use for meeting follow-ups or report generation.",
    input_schema: {
      type: "object" as const,
      properties: {
        originalEmail: { type: "string", description: "The original email content" },
        context: { type: "string", description: "Context about the situation" },
        tone: { type: "string", enum: ["formal", "professional", "direct"], description: "Desired tone" },
        urgency: { type: "string", enum: ["high", "medium", "low"], description: "Urgency level" },
      },
      required: ["originalEmail"],
    },
  };
}
