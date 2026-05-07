# Agents — CLAUDE.md

<!-- glob: agents/*.ts -->

All agent files in this directory MUST:
1. Return valid JSON ONLY — no conversational text, no markdown outside JSON
2. Use tool_choice: "any" on every Claude API call
3. Implement 3-attempt retry with exponential backoff (1s, 2s, 4s)
4. Implement graceful degradation — return a valid fallback JSON on all failures
5. Never throw unhandled exceptions to callers
6. Check circuit breaker state before making API calls
7. Use claude-sonnet-4-5 model

## JSON Validation
After receiving a response, validate it is parseable with JSON.parse().
On failure, retry up to 3 times. On 3rd failure, return the graceful degradation object.

## Agent Contracts

### EmailAgent
Input: raw email text + optional MCP context
Output: { priority, priorityReason, suggestedResponseTime, draftReply, actionItems, risks, keyPoints }

### MeetingAgent
Input: raw meeting notes text
Output: { meetingTitle, date, attendees, decisions, actionItems, risks, followUpEmail, openItems }

### ReportAgent
Input: project update text
Output: { weekOf, executiveSummary, portfolioHealth, projects, keyAchievements, risksForLeadership, decisionsNeeded, nextWeekOutlook }

### RiskAgent
Input: any text with risk indicators
Output: { overallRiskLevel, risks, escalationEmail, immediateActions }

### StakeholderAgent
Input: query text + MCP knowledge base context
Output: { name, organisation, role, projects, currentConcerns, communicationStyle, lastInteraction, talkingPoints, thingsToAvoid, openActions }
