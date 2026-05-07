# Tools — CLAUDE.md

<!-- glob: tools/*.ts -->

All tool files in this directory MUST:
1. Export a get*Tool() function returning the tool schema object
2. Return structured errors on failure — never throw
3. Include precise description with "Use when..." and "Do NOT use for..."
4. Define input_schema with required fields marked

## Error Format
```json
{
  "error_type": "TOOL_ERROR | VALIDATION_ERROR | NOT_FOUND",
  "message": "Human-readable description",
  "suggestion": "What the caller should do instead"
}
```

## Tool Inventory
- extract_actions — extracts action items from text
- draft_reply — drafts professional email replies
- summarise_thread — condenses long threads/documents
- flag_risks — identifies risk indicators in text
- lookup_stakeholder — fetches stakeholder from MCP knowledge base
