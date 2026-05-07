---
name: weekly-report
description: Generate a C-suite leadership summary from project status updates with RAG indicators
trigger: when input contains project status updates — RAG mentions, milestone updates, delivery progress, or user says "report" "update" "summary" "weekly"
input: raw project update text
output: JSON with executive summary, RAG per project, risks, decisions needed
do-not-use: for emails or meeting notes
---

# Weekly Report Skill

## Trigger Conditions
Activate this skill when the input:
1. Mentions RAG status: "Red", "Amber", "Green", "On Track", "At Risk"
2. References milestones: "Phase", "milestone", "delivery", "release", "go-live"
3. User says "generate report", "weekly update", "status summary"
4. Input contains multiple project updates in structured format

Do NOT activate for:
- Pure email content
- Meeting notes without project status

## Process
1. Identify all projects mentioned and their status
2. Write an executive summary in business language (no jargon)
3. Assign RAG status to each project: 🟢 Green / 🟡 Amber / 🔴 Red
4. Extract key achievements for the week
5. Identify risks that require leadership attention
6. List decisions that need to be made by leadership

## Tone Guidelines
- Business language only — no technical terminology
- Active voice preferred
- Quantify where possible ("3 of 5 projects on track")
- Risk statements should be clear and actionable

## Output Schema
```json
{
  "weekOf": "DD MMM YYYY",
  "executiveSummary": "2-3 sentence portfolio overview",
  "portfolioHealth": "On Track | At Risk | Delayed",
  "projects": [
    {
      "name": "string",
      "rag": "🟢 Green | 🟡 Amber | 🔴 Red",
      "thisWeek": "string",
      "nextMilestone": "string",
      "risk": "string or empty"
    }
  ],
  "keyAchievements": ["string"],
  "risksForLeadership": ["string"],
  "decisionsNeeded": ["string"],
  "nextWeekOutlook": "string"
}
```
