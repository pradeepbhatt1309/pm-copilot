# PM Copilot — Project CLAUDE.md

PM Copilot is a personal productivity tool for a Senior Project Manager in BFSI Wealth & Asset Management.

## Core Rules
- All agents MUST return valid JSON only. No markdown, no prose.
- Validation-retry: max 3 attempts on malformed JSON output.
- Graceful degradation required for every agent — never return an unhandled error.
- BFSI compliance: never suggest sharing sensitive data externally.
- Plan mode: use before drafting sensitive stakeholder emails.

## Agent Architecture
- Hub: OrchestratorAgent — routes input to correct specialist agents
- Spokes: EmailAgent, MeetingAgent, ReportAgent, RiskAgent, StakeholderAgent

## Output Format
All agent responses must be parseable JSON objects. Arrays must be valid JSON arrays.
Never return null for required fields — use empty string or empty array instead.

## Glob Rules
- agents/*.ts → JSON output enforced, tool_choice: any required
- tools/*.ts → structured error responses required
- mcp/resources/*.md → markdown formatting for KB articles
- skills/*.md → SKILL.md frontmatter required
