# MCP Server — CLAUDE.md

<!-- glob: mcp/**/*.ts -->

## Transport
- stdio for local development
- SSE for future remote deployment

## Resource URI Patterns
- stakeholders://people/{id}
- projects://active/{id}
- templates://email/{type}
- templates://report/{type}

## Knowledge Base Articles (mcp/resources/*.md)
Must follow this format:
```
---
title: string
type: stakeholder | project | template
id: string
tags: string[]
---

# Content here in markdown
```

## MCP Tools
- search_kb: RAG search over knowledge base (returns top 5 matches)
- get_stakeholder: fetch full stakeholder profile by name or id
- get_template: fetch email or report template by type
- log_interaction: record interaction for future context

## MCP Prompts (Reusable Templates)
- weekly_report_prompt: leadership report template
- escalation_prompt: escalation email template
- risk_assessment_prompt: risk evaluation template

## Sampling
MCP server uses sampling to:
- Generate personalised templates based on stakeholder communication style
- Update stakeholder profiles with new interaction context server-side
- Refine risk assessments with historical context

## Context Injection
Inject only relevant KB chunks per request (RAG).
Cache stakeholder profiles — stale after 24 hours.
Long inputs (>1000 words): summarise first, then process.
