# /meeting

Force meeting notes extraction on the current input. Bypasses orchestrator routing and sends directly to MeetingAgent.

## Usage
/meeting

## Behaviour
1. Takes the current input in the textarea
2. Sets forceAgent = "MeetingAgent"
3. Calls POST /api/process with forceAgent parameter
4. Returns structured meeting analysis: decisions, actions, follow-up email

## When to Use
- When the orchestrator misclassifies meeting notes as another type
- When you want to extract meeting structure from informal notes
- When you need a follow-up email drafted immediately

## Output
Returns MeetingAgent JSON: { meetingTitle, date, attendees, decisions, actionItems, risks, followUpEmail, openItems }
