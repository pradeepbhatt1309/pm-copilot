# /stakeholder [name]

Look up a stakeholder from the MCP knowledge base and generate a brief.

## Usage
/stakeholder Sarah Mitchell
/stakeholder James

## Behaviour
1. Looks up the named stakeholder in the MCP knowledge base
2. Sends to StakeholderAgent with full profile context
3. Returns a pre-interaction brief with talking points

## Parameters
- name: partial or full stakeholder name (optional — shows list if omitted)

## When to Use
- Before a call or meeting with a specific stakeholder
- When you need a quick reminder of their concerns and communication style
- When preparing talking points for a difficult conversation

## Output
Returns StakeholderAgent JSON: { name, organisation, role, projects, currentConcerns, communicationStyle, lastInteraction, talkingPoints, thingsToAvoid, openActions }
