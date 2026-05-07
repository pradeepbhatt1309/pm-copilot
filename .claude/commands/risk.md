# /risk

Force risk assessment on the current input. Bypasses orchestrator and sends directly to RiskAgent.

## Usage
/risk

## Behaviour
1. Takes the current input in the textarea
2. Sets forceAgent = "RiskAgent"
3. Calls POST /api/process with forceAgent parameter
4. Returns comprehensive risk analysis with escalation email

## When to Use
- When you want a dedicated risk scan on any content
- When the orchestrator doesn't detect RISK type
- When preparing for a risk review or steering committee

## Output
Returns RiskAgent JSON: { overallRiskLevel, risks, escalationEmail, immediateActions }
Note: If high-severity risks are detected, escalationNeeded is set to true for human escalation.
