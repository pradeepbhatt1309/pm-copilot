---
name: risk-radar
description: Identify, categorise, and prioritise all project risks with escalation recommendations
trigger: when input contains risk indicators — "delayed" "blocked" "slipped" "at risk" "concern" "issue" "dependency" "blocker" or user says "risks"
input: any text containing risk information
output: JSON with risks ranked by severity, mitigations, escalation recommendations, draft escalation email
do-not-use: as primary skill when email or meeting skill fits better
---

# Risk Radar Skill

## Trigger Conditions
Activate this skill when the input contains:
1. Risk keywords: "blocked", "delayed", "slipped", "at risk", "concern", "issue", "dependency", "blocker", "risk"
2. User says "identify risks", "risk scan", "what are the risks"
3. Input contains delivery updates with negative indicators
4. Alongside other skills when the content has embedded risk signals

Priority Rule: email-triage and meeting-notes take primary precedence.
Risk Radar runs as a secondary agent for mixed content.

## Conservative Stance
When in doubt, flag it. It is better to over-identify and allow the PM to dismiss
than to miss a critical risk.

## Risk Categories
- Timeline: delivery dates, milestones, phases
- Resource: people, budget, capacity
- Technical: architecture, infrastructure, integrations
- Stakeholder: relationships, expectations, change management
- Compliance: regulatory, audit, governance

## Severity Assessment
- 🔴 High: immediate action required, potential programme impact
- 🟡 Medium: monitor closely, mitigation plan needed
- 🟢 Low: note for tracking, no immediate action

## Escalation Rule
If ANY risk has escalationNeeded: true, a human escalation path must be identified.
The escalation email must be ready-to-send with minimal editing required.

## Output Schema
```json
{
  "overallRiskLevel": "High | Medium | Low",
  "risks": [
    {
      "description": "string",
      "category": "Timeline | Resource | Technical | Stakeholder | Compliance",
      "severity": "🔴 High | 🟡 Medium | 🟢 Low",
      "likelihood": "High | Medium | Low",
      "impact": "string",
      "mitigation": "string",
      "owner": "string",
      "escalationNeeded": true
    }
  ],
  "escalationEmail": {
    "subject": "string",
    "body": "string",
    "urgency": "Immediate | 24hrs | This week"
  },
  "immediateActions": ["string"]
}
```
