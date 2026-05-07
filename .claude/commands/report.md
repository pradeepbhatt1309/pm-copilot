# /report

Force leadership report generation on the current input. Bypasses orchestrator and sends directly to ReportAgent.

## Usage
/report

## Behaviour
1. Takes the current input in the textarea
2. Sets forceAgent = "ReportAgent"
3. Calls POST /api/process with forceAgent parameter
4. Returns a C-suite-ready leadership summary with RAG status

## When to Use
- When pasting project updates for weekly leadership reporting
- When the orchestrator doesn't detect PROJECT_UPDATE type
- When preparing for a board or executive review

## Output
Returns ReportAgent JSON: { weekOf, executiveSummary, portfolioHealth, projects, keyAchievements, risksForLeadership, decisionsNeeded, nextWeekOutlook }
