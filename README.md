# 🧠 PM Copilot

An AI-powered personal productivity tool for Senior Project Managers in BFSI Wealth & Asset Management. Built on a multi-agent architecture powered by Claude — one input box, five specialist agents, zero manual routing.

---

## 🚀 What It Does

Paste anything — an email, meeting notes, a project update, a risk concern. PM Copilot's Orchestrator Agent detects what it is, routes it to the right specialist agents, and returns clean, professional, structured outputs instantly.

No dropdowns. No mode selection. Just paste and get.

---

## 🧩 Multi-Agent Architecture

PM Copilot uses a **hub-and-spoke** orchestration model:

```
User Input
    ↓
OrchestratorAgent (detects type, routes)
    ↓
┌─────────────────────────────────────┐
│  EmailAgent     → triage + replies  │
│  MeetingAgent   → decisions + actions│
│  ReportAgent    → leadership briefs │
│  RiskAgent      → risk assessment   │
│  StakeholderAgent → context briefs  │
└─────────────────────────────────────┘
    ↓
Unified structured output
```

The Orchestrator never does analysis itself — coordination only. Multiple agents can be called in parallel for mixed-content inputs.

---

## 🧠 Key Features

- **Auto-detection** — detects email, meeting notes, project update, or risk content as you type
- **5 specialist agents** — each returns structured JSON output
- **Slash commands** — `/triage` `/meeting` `/report` `/risk` `/stakeholder` `/draft` `/clear` `/history`
- **MCP knowledge base** — stakeholder profiles, project context, email templates
- **Full CRUD** — add, edit, delete stakeholders and projects via UI
- **Session history** — last 10 interactions stored in session
- **File upload** — attach PDF, DOCX, TXT, XLSX for processing
- **Graceful degradation** — every agent has a fallback if AI call fails
- **Retry logic** — exponential backoff (1s → 2s → 4s), circuit breaker after 5 failures
- **Input/output guardrails** — blocks prompt injection, validates JSON structure
- **Dark mode** — full theme support

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| UI Components | shadcn/ui, Tailwind CSS |
| Routing | wouter |
| Data Fetching | TanStack Query v5 |
| Backend | Node.js, Express |
| AI | Anthropic Claude Sonnet (claude-sonnet-4-5) |
| MCP Server | stdio (local) / SSE (remote) |
| File Handling | multer (memory storage only) |
| Storage | In-memory (no database) |

---

## 📐 Agent System Prompts

Each agent receives a precise system prompt and returns **valid JSON only**:

| Agent | Output |
|---|---|
| EmailAgent | Priority, draft reply, action items, risks |
| MeetingAgent | Decisions, actions, follow-up email, open items |
| ReportAgent | Executive summary, RAG per project, risks, decisions needed |
| RiskAgent | Risks ranked by severity, mitigations, escalation email |
| StakeholderAgent | Role, projects, concerns, communication style, talking points |

All agents use `tool_choice: "any"` and include 3x JSON validation-retry on malformed output.

---

## 🗂️ CLAUDE.md Hierarchy

```
~/.claude/CLAUDE.md          → Global: PM persona, never fabricate facts
CLAUDE.md                    → Project: JSON-only, graceful degradation, BFSI compliance
agents/CLAUDE.md             → Strict JSON, no conversational text
tools/CLAUDE.md              → Structured errors required
mcp/CLAUDE.md                → Knowledge base formatting rules
skills/CLAUDE.md             → Trigger conditions must be precise
```

---

## 🔌 MCP Knowledge Base

**Resources:**
- `stakeholders://people/{id}` — stakeholder profiles
- `projects://active/{id}` — project context
- `templates://email/*` — status update, escalation, risk alert
- `templates://report/weekly` — weekly report template

**Tools:**
- `search_kb` — RAG search over knowledge base
- `get_stakeholder` — fetch stakeholder profile
- `get_template` — fetch email/report template
- `log_interaction` — record interaction for future context

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v18+
- Anthropic API key

### Installation

```bash
# Clone the repo
git clone https://github.com/pradeepbhatt1309/pm-copilot-Description-AI-powered-personal-PM-productivity-tool.git
cd pm-copilot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# Run the app
npm run dev
```

| Service | Port |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:5000 |
| MCP Server | http://localhost:3001 |

---

## 🔑 Environment Variables

```env
ANTHROPIC_API_KEY=your_key_here
```

---

## 📱 Pages

| Route | Description |
|---|---|
| `/` | Main copilot interface — paste anything |
| `/history` | Past interactions |
| `/stakeholders` | Stakeholder knowledge base (full CRUD) |
| `/projects` | Project register (full CRUD) |
| `/templates` | Email and report templates |
| `/settings` | Preferences |

---

## 🔒 Reliability & Safety

- **Retry:** All Claude calls retry 3x with exponential backoff (1s, 2s, 4s)
- **Circuit breaker:** After 5 failures → simplified mode
- **Guardrails:** Blocks prompt injection, API keys in input, off-topic requests
- **Graceful degradation:** Every agent has a defined fallback — system never hard-fails
- **BFSI compliance:** Never suggests sharing sensitive data externally
- **Memory:** Files processed in memory only — never written to disk
- **Session:** Auto-purged after 8 hours inactivity

---

## 💡 Why I Built This

Senior PMs in financial services spend a disproportionate amount of time on mechanical work — drafting replies, summarising meetings, formatting reports, assessing risks. This is exactly the work AI should be doing.

PM Copilot explores what happens when you give a PM a true AI chief of staff — one that understands BFSI context, knows your stakeholders, and returns outputs you can use immediately. Built as part of my AI upskilling while managing enterprise AI delivery programmes.

---

## 📌 Status

✅ Fully functional — all 5 agents live, MCP knowledge base working, full CRUD operational

## 🧑‍💻 Author

Pradeep Bhatt

Senior Project Manager | AI Delivery | BFSI  
[LinkedIn](https://www.linkedin.com/in/pradeep-bhatt-3372a954/) · [GitHub](https://github.com/pradeepbhatt1309)
