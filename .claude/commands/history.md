# /history

Show the last 5 inputs and outputs from the current session.

## Usage
/history

## Behaviour
1. Calls GET /api/history
2. Returns the last 5 interactions from the session store
3. Displays input type, agents called, and timestamp for each

## Output Format
Each interaction shows:
- Timestamp
- Input type(s) detected
- Agents called
- Processing time
- Truncated input (first 100 chars)

## When to Use
- To review what was processed in this session
- To find a previous output you want to copy
- To track which agents have been called and when
