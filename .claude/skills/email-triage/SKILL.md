---
name: email-triage
description: Triage and draft replies to professional emails in BFSI context
trigger: when input contains email content — From/Subject fields, email-style language, or user says "email from" or "reply to"
input: raw email text, stakeholder context from MCP knowledge base
output: JSON with priority, draft reply, action items, risks
do-not-use: for meeting notes or project status updates
---

# Email Triage Skill

## Trigger Conditions
Activate this skill when the input:
1. Contains `From:` or `Subject:` header fields
2. Uses email-style language: "Dear", "Hi [name]", "Kind regards", "Best regards"
3. User says "email from [person]" or "reply to this email"
4. Input starts with a quoted reply chain

Do NOT activate for:
- Meeting notes (use meeting-notes skill instead)
- Project status updates (use weekly-report skill instead)
- Risk-only content without email framing

## Process
1. Identify the sender and infer their role/urgency from MCP stakeholder context
2. Assess priority: High (requires same-day response), Medium (24-48hrs), Low (this week)
3. Extract all action items from the email
4. Draft a professional reply in the PM's voice — concise, senior-appropriate
5. Flag any risks mentioned or implied in the email

## Output Schema
```json
{
  "priority": "high | medium | low",
  "priorityReason": "Why this priority was assigned",
  "suggestedResponseTime": "e.g. Today by 5pm",
  "draftReply": {
    "subject": "Re: Original Subject",
    "body": "Full email body text",
    "tone": "professional | direct | diplomatic"
  },
  "actionItems": [
    { "task": "string", "owner": "string", "dueDate": "string", "priority": "string" }
  ],
  "risks": [
    { "description": "string", "severity": "high|medium|low", "suggestedAction": "string" }
  ],
  "keyPoints": ["string"]
}
```

## BFSI Notes
- Always use formal salutations with C-suite and director-level contacts
- Never include sensitive financial data or client names in drafts
- Flag regulatory compliance risks immediately as high priority
