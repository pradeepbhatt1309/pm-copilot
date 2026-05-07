---
name: stakeholder-brief
description: Generate a pre-interaction context brief for a specific stakeholder using MCP knowledge base
trigger: when user mentions a specific person's name and asks for context, background, or "tell me about" or before a call or meeting with that person
input: stakeholder name, MCP knowledge base profile
output: JSON with role, projects, concerns, communication style, talking points, last interaction
do-not-use: for general questions not about a specific known stakeholder
---

# Stakeholder Brief Skill

## Trigger Conditions
Activate this skill when:
1. User mentions a known stakeholder name ("Brief me on Sarah", "Tell me about James")
2. User says "before my call with [name]", "meeting with [name]"
3. /stakeholder [name] command is used
4. Input contains "StakeholderAgent" routing from orchestrator

Do NOT activate for:
- General questions not tied to a specific person
- Questions about unknown individuals not in the MCP knowledge base

## Knowledge Base Rule
Use ONLY information from the MCP knowledge base.
NEVER fabricate:
- Meeting dates or interaction history
- Project assignments not in the KB
- Financial figures or client data
- Personal information

If information is not available, return the field as empty string or empty array.
Never guess or interpolate.

## Pre-Interaction Brief Structure
The brief should answer these questions for the PM:
1. Who is this person and what is their role?
2. What projects are we working on together?
3. What are they concerned about right now?
4. How do they prefer to communicate?
5. What should I talk about?
6. What should I avoid?
7. What actions are outstanding from my side?

## Output Schema
```json
{
  "name": "string",
  "organisation": "string",
  "role": "string",
  "projects": ["string"],
  "currentConcerns": ["string"],
  "communicationStyle": "string",
  "lastInteraction": "string or Unknown",
  "talkingPoints": ["string"],
  "thingsToAvoid": ["string"],
  "openActions": ["string"]
}
```
