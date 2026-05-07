# /draft [context]

Draft a professional email with additional context provided.

## Usage
/draft responding to Sarah's concern about Alpha delay
/draft following up on UAT blockers

## Behaviour
1. Takes the current input + the provided context
2. Forces EmailAgent with the context appended
3. Returns a polished draft reply

## Parameters
- context: additional context to guide the draft (appended to input)

## When to Use
- When you want to guide the email draft with specific instructions
- When the input is minimal and you need to add context
- When drafting a new email rather than replying to an existing one

## Output
Returns EmailAgent JSON with emphasis on draftReply field.
Note: Plan mode is recommended before sending sensitive stakeholder communications.
