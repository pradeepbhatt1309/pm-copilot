import { Express, Request, Response } from "express";
import multer from "multer";
import { runOrchestrator } from "./agents/orchestrator.js";
import { runEmailAgent } from "./agents/emailAgent.js";
import { runMeetingAgent } from "./agents/meetingAgent.js";
import { runReportAgent } from "./agents/reportAgent.js";
import { runRiskAgent } from "./agents/riskAgent.js";
import { runStakeholderAgent } from "./agents/stakeholderAgent.js";
import { store } from "./storage.js";
import { runPreInputHook } from "./hooks/preInput.js";
import { runPostOutputHook } from "./hooks/postOutput.js";
import { checkInputGuardrail } from "./guardrails/inputGuardrail.js";
import { checkOutputGuardrail } from "./guardrails/outputGuardrail.js";
import { getMcpContext, searchKnowledgeBase } from "./mcp/server.js";
import { EMAIL_TEMPLATES } from "./mcp/resources.js";
import { v4 as uuidv4 } from "uuid";

const upload = multer({ storage: multer.memoryStorage() });

const batchJobs = new Map<string, { status: string; result?: unknown; error?: string }>();

export function createRoutes(app: Express) {
  // POST /api/process — main orchestrator endpoint
  app.post("/api/process", upload.single("file"), async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      let input: string = req.body.input || "";

      // Handle file upload
      if (req.file) {
        input += `\n[File: ${req.file.originalname}]\n${req.file.buffer.toString("utf-8").slice(0, 10000)}`;
      }

      // Input guardrail
      const guardrailResult = checkInputGuardrail(input);
      if (!guardrailResult.passed) {
        return res.status(400).json({ error: guardrailResult.reason });
      }

      // Pre-input hook
      const preResult = runPreInputHook(input);
      if (!preResult.allowed) {
        return res.status(400).json({ error: preResult.reason });
      }

      const sanitizedInput = preResult.sanitizedInput || input;
      const forceAgent = req.body.forceAgent as string | undefined;

      // Orchestrator routing
      let routing;
      if (forceAgent) {
        routing = {
          inputType: [forceAgent.replace("Agent", "").toUpperCase()],
          agentsToCall: [forceAgent],
          confidence: 1.0,
          context: "Forced routing",
          urgency: "medium" as const,
        };
      } else {
        routing = await runOrchestrator(sanitizedInput);
      }

      // Call agents in parallel
      const agentResults: Record<string, unknown> = {};
      const agentPromises = routing.agentsToCall.map(async (agentName: string) => {
        try {
          switch (agentName) {
            case "EmailAgent":
              agentResults.email = await runEmailAgent(sanitizedInput, getMcpContext());
              break;
            case "MeetingAgent":
              agentResults.meeting = await runMeetingAgent(sanitizedInput);
              break;
            case "ReportAgent":
              agentResults.report = await runReportAgent(sanitizedInput);
              break;
            case "RiskAgent":
              agentResults.risk = await runRiskAgent(sanitizedInput);
              break;
            case "StakeholderAgent":
              agentResults.stakeholder = await runStakeholderAgent(sanitizedInput);
              break;
          }
        } catch (err) {
          agentResults[agentName.toLowerCase().replace("agent", "")] = {
            error: `${agentName} failed`,
            message: (err as Error).message,
          };
        }
      });

      await Promise.all(agentPromises);

      const output = {
        routing,
        results: agentResults,
        processingTime: Date.now() - startTime,
      };

      // Output guardrail
      const outputCheck = checkOutputGuardrail(output);
      if (!outputCheck.passed) {
        return res.status(500).json({ error: outputCheck.reason });
      }

      // Post-output hook
      runPostOutputHook({
        input: sanitizedInput,
        output,
        agentsCalled: routing.agentsToCall,
        processingTime: Date.now() - startTime,
        inputType: routing.inputType,
      });

      return res.json(output);
    } catch (err) {
      console.error("Process error:", err);
      return res.status(500).json({ error: "Processing failed", message: (err as Error).message });
    }
  });

  // GET /api/history
  app.get("/api/history", (_req: Request, res: Response) => {
    res.json(store.getRecentInteractions(10));
  });

  // DELETE /api/history
  app.delete("/api/history", (_req: Request, res: Response) => {
    store.clearSession();
    res.json({ success: true });
  });

  // Agent-specific routes
  app.post("/api/agents/email", async (req: Request, res: Response) => {
    try {
      const result = await runEmailAgent(req.body.input, req.body.context);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/agents/meeting", async (req: Request, res: Response) => {
    try {
      const result = await runMeetingAgent(req.body.input);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/agents/report", async (req: Request, res: Response) => {
    try {
      const result = await runReportAgent(req.body.input);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/agents/risk", async (req: Request, res: Response) => {
    try {
      const result = await runRiskAgent(req.body.input);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  app.post("/api/agents/stakeholder", async (req: Request, res: Response) => {
    try {
      const result = await runStakeholderAgent(req.body.input, req.body.name);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  });

  // Stakeholder CRUD
  app.get("/api/stakeholders", (_req: Request, res: Response) => {
    res.json(store.getAllStakeholders());
  });

  app.get("/api/stakeholders/:id", (req: Request, res: Response) => {
    const s = store.getStakeholder(req.params.id);
    if (!s) return res.status(404).json({ error: "Not found" });
    return res.json(s);
  });

  app.post("/api/stakeholders", (req: Request, res: Response) => {
    const { name, organisation, role, projects, currentConcerns, communicationStyle, openActions, notes } = req.body;
    if (!name || !organisation || !role) {
      return res.status(400).json({ error: "name, organisation, and role are required" });
    }
    const stakeholder = store.createStakeholder({
      name,
      organisation,
      role,
      projects: Array.isArray(projects) ? projects : (projects || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      currentConcerns: Array.isArray(currentConcerns) ? currentConcerns : (currentConcerns || "").split("\n").filter(Boolean),
      communicationStyle: communicationStyle || "",
      openActions: Array.isArray(openActions) ? openActions : (openActions || "").split("\n").filter(Boolean),
      notes: notes || "",
    });
    return res.status(201).json(stakeholder);
  });

  app.put("/api/stakeholders/:id", (req: Request, res: Response) => {
    const { name, organisation, role, projects, currentConcerns, communicationStyle, openActions, notes } = req.body;
    const updated = store.updateStakeholder(req.params.id, {
      name,
      organisation,
      role,
      projects: Array.isArray(projects) ? projects : (projects || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      currentConcerns: Array.isArray(currentConcerns) ? currentConcerns : (currentConcerns || "").split("\n").filter(Boolean),
      communicationStyle: communicationStyle || "",
      openActions: Array.isArray(openActions) ? openActions : (openActions || "").split("\n").filter(Boolean),
      notes: notes || "",
    });
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  });

  app.delete("/api/stakeholders/:id", (req: Request, res: Response) => {
    const deleted = store.deleteStakeholder(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    return res.json({ success: true });
  });

  // Projects CRUD
  app.get("/api/projects", (_req: Request, res: Response) => {
    res.json(store.getAllProjects());
  });

  app.post("/api/projects", (req: Request, res: Response) => {
    const { name, status, lead, stakeholder, notes } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const project = store.createProject({ name, status: status || "On Track", lead: lead || "", stakeholder: stakeholder || "", notes: notes || "" });
    return res.status(201).json(project);
  });

  app.put("/api/projects/:id", (req: Request, res: Response) => {
    const { name, status, lead, stakeholder, notes } = req.body;
    const updated = store.updateProject(req.params.id, { name, status, lead, stakeholder, notes });
    if (!updated) return res.status(404).json({ error: "Not found" });
    return res.json(updated);
  });

  app.delete("/api/projects/:id", (req: Request, res: Response) => {
    const deleted = store.deleteProject(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    return res.json({ success: true });
  });

  // MCP endpoints
  app.get("/api/mcp/stakeholders", (_req: Request, res: Response) => {
    res.json(store.getAllStakeholders());
  });

  app.get("/api/mcp/templates/:type", (req: Request, res: Response) => {
    const template = EMAIL_TEMPLATES[req.params.type as keyof typeof EMAIL_TEMPLATES];
    if (!template) return res.status(404).json({ error: "Template not found" });
    return res.json(template);
  });

  app.get("/api/mcp/search", (req: Request, res: Response) => {
    const query = req.query.q as string || "";
    res.json(JSON.parse(searchKnowledgeBase(query)));
  });

  // Batch CI/CD
  app.post("/api/batch/weekly-report", async (req: Request, res: Response) => {
    const jobId = uuidv4();
    batchJobs.set(jobId, { status: "processing" });

    res.json({ jobId, status: "accepted" });

    // Process asynchronously
    (async () => {
      try {
        const projects = store.getAllProjects();
        const input = `Weekly report request. Projects: ${projects.map(p => `${p.name} (${p.status}): ${p.notes}`).join(". ")}`;
        const result = await runReportAgent(input);
        batchJobs.set(jobId, { status: "complete", result });
      } catch (err) {
        batchJobs.set(jobId, { status: "failed", error: (err as Error).message });
      }
    })();
  });

  app.get("/api/batch/:jobId", (req: Request, res: Response) => {
    const job = batchJobs.get(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    return res.json(job);
  });
}
