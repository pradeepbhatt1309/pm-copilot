# PM Copilot

AI-powered personal productivity tool for a Senior Project Manager in BFSI Wealth & Asset Management.

## What It Does

One input box. Paste anything — email, meeting notes, project updates, or random thoughts. The Orchestrator Agent detects what it is, routes to the right specialist agents, and returns clean professional outputs instantly.

**No manual mode selection. No dropdowns. Just paste and get.**

## Quick Start

### Prerequisites
- Node.js 18+
- Anthropic API key

### Setup
```bash
# Clone and install
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Start development (backend + frontend)
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Architecture

### Multi-Agent Hub and Spoke
```
Input → OrchestratorAgent → EmailAgent
                          → MeetingAgent
                          → ReportAgent
                          → RiskAgent
                          → StakeholderAgent
```

The Orchestrator analyses the input type and routes to one or more specialist agents in parallel. Results are assembled and returned in a unified response.

### Agent Capabilities

| Agent | Input | Output |
|-------|-------|--------|
| EmailAgent | Email content | Priority, draft reply, action items, risks |
| MeetingAgent | Meeting notes | Decisions, actions, follow-up email |
| ReportAgent | Project updates | Executive summary, RAG status, decisions needed |
| RiskAgent | Any content | Risk assessment, escalation email |
| StakeholderAgent | Stakeholder query | Brief with talking points |

## Tech Stack

- **Frontend**: React + TypeScript + Vite + TanStack Query v5
- **Backend**: Express + Node.js (TypeScript)
- **AI**: Claude claude-sonnet-4-5 via Anthropic SDK
- **UI**: shadcn/ui + Tailwind CSS + lucide-react
- **Routing**: wouter
- **Storage**: In-memory (no database required)
- **File upload**: multer (memory storage)

## Slash Commands

| Command | Description |
|---------|-------------|
| `/triage` | Force EmailAgent on current input |
| `/meeting` | Force MeetingAgent on current input |
| `/report` | Force ReportAgent on current input |
| `/risk` | Force RiskAgent on current input |
| `/stakeholder [name]` | Lookup stakeholder in MCP knowledge base |
| `/draft [context]` | Draft email with given context |
| `/clear` | Clear current session |
| `/history` | Show last 5 inputs and outputs |

## API Reference

### Core
```
POST /api/process          # Main orchestrator endpoint
GET  /api/history          # Last 10 interactions
DELETE /api/history        # Clear session
```

### Agent-Specific
```
POST /api/agents/email
POST /api/agents/meeting
POST /api/agents/report
POST /api/agents/risk
POST /api/agents/stakeholder
```

### Stakeholders (CRUD)
```
GET    /api/stakeholders
GET    /api/stakeholders/:id
POST   /api/stakeholders
PUT    /api/stakeholders/:id
DELETE /api/stakeholders/:id
```

### Projects (CRUD)
```
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### MCP
```
GET /api/mcp/stakeholders
GET /api/mcp/templates/:type    # types: status-update, escalation, risk-alert, meeting-summary
GET /api/mcp/search?q=query
```

### Batch
```
POST /api/batch/weekly-report
GET  /api/batch/:jobId
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Main copilot interface — paste anything |
| `/history` | Past interactions |
| `/stakeholders` | Stakeholder knowledge base (full CRUD) |
| `/projects` | Project register (full CRUD) |
| `/templates` | Email and report templates |
| `/settings` | Configuration overview |

## Seed Data

The app starts with dummy stakeholders and projects pre-loaded:

**Stakeholders**: Sarah Mitchell, James Patel, Priya Sharma, Robert Chen, Alex Thompson, Maya Singh

**Projects**: Project Alpha (At Risk), Project Beta (On Track), Project Gamma (On Track), Project Delta (At Risk), Project Epsilon (On Track)

All seed data is editable and deletable via the UI.

## Reliability Features

- **Retry logic**: All Claude calls retry 3x with exponential backoff (1s, 2s, 4s)
- **JSON validation**: Retry 3x on malformed JSON output
- **Circuit breaker**: After 5 consecutive failures, simplified mode activates
- **Graceful degradation**: Every agent has a fallback response
- **Input guardrails**: Blocks prompt injection, credential patterns
- **Output guardrails**: Validates JSON structure before returning

## Environment Variables

```env
ANTHROPIC_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
```

## CLAUDE.md Hierarchy

```
CLAUDE.md                          # Project-level rules
agents/CLAUDE.md                   # Agent contracts
tools/CLAUDE.md                    # Tool schemas
mcp/CLAUDE.md                      # MCP server rules
skills/CLAUDE.md                   # Skill frontmatter rules
server/agents/CLAUDE.md            # Runtime agent rules
server/tools/CLAUDE.md             # Runtime tool rules
server/mcp/CLAUDE.md               # Runtime MCP rules
```
