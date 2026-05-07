# /triage

Force email triage on the current input. Bypasses orchestrator routing and sends directly to EmailAgent.

## Usage
/triage

## Behaviour
1. Takes the current input in the textarea
2. Sets forceAgent = "EmailAgent"
3. Calls POST /api/process with forceAgent parameter
4. Returns full email analysis: priority, draft reply, action items, risks

## When to Use
- When the orchestrator misclassifies an email as another type
- When you want to force email triage on ambiguous content
- When you need a fast reply draft without full orchestration overhead

## Output
Returns EmailAgent JSON: { priority, priorityReason, suggestedResponseTime, draftReply, actionItems, risks, keyPoints }
