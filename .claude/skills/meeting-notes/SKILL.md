---
name: meeting-notes
description: Extract decisions and actions from meeting notes with follow-up email draft
trigger: when input contains meeting/call notes — attendees listed, discussion points, action items mentioned, or user says "meeting" "call" "sync" "standup"
input: raw meeting notes text
output: JSON with decisions, actions, follow-up emails, risks
do-not-use: for standalone emails or project status updates
---

# Meeting Notes Skill

## Trigger Conditions
Activate this skill when the input:
1. Lists attendees: "Attendees:", "Present:", "In attendance:"
2. Contains meeting indicators: "Meeting", "Call", "Sync", "Standup", "Workshop", "Review"
3. User says "from today's meeting", "call with [person]", "standup notes"
4. Input has numbered action items or "AI:" prefixes

Do NOT activate for:
- Pure email content (use email-triage skill)
- Project status without meeting context (use weekly-report skill)

## Process
1. Identify the meeting title, date, and attendees
2. Extract ONLY explicitly stated decisions — never infer
3. Extract all action items with owners and due dates
4. Identify any risks mentioned
5. Draft a professional follow-up email to all attendees
6. List any open items that need resolution

## Precision Rules
- Only extract what is explicitly stated in the notes
- If owner is not specified for an action, mark as "TBC"
- If date is not specified, mark as "TBC"
- Never fabricate attendee names

## Output Schema
```json
{
  "meetingTitle": "string",
  "date": "DD MMM YYYY or TBC",
  "attendees": ["string"],
  "decisions": [
    { "decision": "string", "owner": "string", "rationale": "string" }
  ],
  "actionItems": [
    { "task": "string", "owner": "string", "dueDate": "string", "priority": "high|medium|low" }
  ],
  "risks": [
    { "description": "string", "severity": "string" }
  ],
  "followUpEmail": {
    "subject": "string",
    "body": "string",
    "recipients": ["string"]
  },
  "openItems": ["string"]
}
```
