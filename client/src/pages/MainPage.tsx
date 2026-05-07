import { useState, useRef, useCallback } from "react";
import { Bot } from "lucide-react";
import { useProcess, type ProcessResult } from "@/hooks/useProcess";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Send, Paperclip, Copy, Mail, ListChecks,
  BarChart3, AlertTriangle, User, Loader2, CheckCircle2,
  Zap
} from "lucide-react";
import { copyToClipboard } from "@/lib/utils";

function detectInputType(text: string): { label: string; icon: string; color: string }[] {
  const types = [];
  const lower = text.toLowerCase();

  if (/from:|subject:|dear |regards,|hi |hello /.test(lower)) {
    types.push({ label: "Email", icon: "📧", color: "bg-blue-100 text-blue-700" });
  }
  if (/attendees:|meeting|standup|sync|call|action items:/i.test(lower)) {
    types.push({ label: "Meeting", icon: "📋", color: "bg-green-100 text-green-700" });
  }
  if (/rag|milestone|on track|at risk|delivered|phase \d/i.test(lower)) {
    types.push({ label: "Report", icon: "📊", color: "bg-purple-100 text-purple-700" });
  }
  if (/blocked|delayed|risk|concern|slipped|blocker|dependency/i.test(lower)) {
    types.push({ label: "Risk", icon: "⚠️", color: "bg-red-100 text-red-700" });
  }

  return types;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 text-xs">
      {copied ? <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> : <Copy className="w-3 h-3 mr-1" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

function EmailTab({ data }: { data: Record<string, unknown> }) {
  const reply = data.draftReply as Record<string, string> | undefined;
  const actionItems = data.actionItems as Array<Record<string, string>> | undefined;
  const risks = data.risks as Array<Record<string, string>> | undefined;
  const keyPoints = data.keyPoints as string[] | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={data.priority === "high" ? "danger" : data.priority === "medium" ? "warning" : "success"}>
          {String(data.priority || "medium").toUpperCase()} PRIORITY
        </Badge>
        <span className="text-sm text-muted-foreground">{String(data.suggestedResponseTime || "")}</span>
      </div>

      {data.priorityReason && (
        <p className="text-sm text-muted-foreground italic">{String(data.priorityReason)}</p>
      )}

      {reply && (
        <div className="border rounded-lg p-4 bg-slate-50">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">Draft Reply</h4>
            <CopyButton text={`Subject: ${reply.subject}\n\n${reply.body}`} />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Subject: {reply.subject}</p>
          <pre className="text-sm whitespace-pre-wrap font-sans">{reply.body}</pre>
        </div>
      )}

      {keyPoints && keyPoints.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Key Points</h4>
          <ul className="space-y-1">
            {keyPoints.map((p, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">•</span>{p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {actionItems && actionItems.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Action Items</h4>
          <div className="space-y-2">
            {actionItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3 text-sm p-2 rounded border">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{item.task}</p>
                  <p className="text-muted-foreground text-xs">{item.owner} · {item.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {risks && risks.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Risks Identified</h4>
          {risks.map((r, i) => (
            <div key={i} className="text-sm p-2 rounded border border-amber-200 bg-amber-50">
              <p className="font-medium text-amber-900">{r.description}</p>
              <p className="text-amber-700 text-xs mt-1">{r.suggestedAction}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActionsTab({ results }: { results: ProcessResult["results"] }) {
  const allActions: Array<{ task: string; owner: string; dueDate: string; priority: string; source: string }> = [];

  const emailActions = (results.email?.actionItems as Array<Record<string, string>>) || [];
  emailActions.forEach(a => allActions.push({ ...a, source: "Email" }));

  const meetingActions = (results.meeting?.actionItems as Array<Record<string, string>>) || [];
  meetingActions.forEach(a => allActions.push({ ...a, source: "Meeting" }));

  if (allActions.length === 0) {
    return <p className="text-sm text-muted-foreground">No action items extracted.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{allActions.length} action{allActions.length !== 1 ? "s" : ""} found</span>
        <CopyButton text={allActions.map(a => `[ ] ${a.task} — ${a.owner} (${a.dueDate})`).join("\n")} />
      </div>
      {allActions.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/30 transition-colors">
          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{item.task}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">{item.owner}</span>
              {item.dueDate && <span className="text-xs text-muted-foreground">· {item.dueDate}</span>}
              <Badge variant="outline" className="text-xs h-4">{item.source}</Badge>
            </div>
          </div>
          <Badge variant={item.priority === "high" ? "danger" : item.priority === "low" ? "success" : "warning"} className="flex-shrink-0">
            {item.priority || "medium"}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function MeetingTab({ data }: { data: Record<string, unknown> }) {
  const decisions = data.decisions as Array<Record<string, string>> | undefined;
  const followUpEmail = data.followUpEmail as Record<string, unknown> | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="font-semibold">{String(data.meetingTitle || "Meeting Notes")}</h3>
        <Badge variant="outline">{String(data.date || "")}</Badge>
      </div>

      {data.attendees && (data.attendees as string[]).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Attendees</h4>
          <div className="flex flex-wrap gap-1">
            {(data.attendees as string[]).map((a, i) => (
              <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
            ))}
          </div>
        </div>
      )}

      {decisions && decisions.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Decisions</h4>
          <div className="space-y-2">
            {decisions.map((d, i) => (
              <div key={i} className="p-3 rounded-lg border-l-4 border-l-indigo-500 bg-indigo-50">
                <p className="text-sm font-medium">{d.decision}</p>
                {d.owner && <p className="text-xs text-muted-foreground mt-1">Owner: {d.owner}</p>}
                {d.rationale && <p className="text-xs text-muted-foreground">{d.rationale}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {followUpEmail && (
        <div className="border rounded-lg p-4 bg-slate-50">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">Follow-up Email</h4>
            <CopyButton text={`Subject: ${followUpEmail.subject}\n\n${followUpEmail.body}`} />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Subject: {String(followUpEmail.subject || "")}</p>
          <pre className="text-sm whitespace-pre-wrap font-sans">{String(followUpEmail.body || "")}</pre>
        </div>
      )}

      {data.openItems && (data.openItems as string[]).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Open Items</h4>
          <ul className="space-y-1">
            {(data.openItems as string[]).map((item, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ReportTab({ data }: { data: Record<string, unknown> }) {
  const projects = data.projects as Array<Record<string, string>> | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge variant={
          data.portfolioHealth === "On Track" ? "success" :
          data.portfolioHealth === "Delayed" ? "danger" : "warning"
        }>
          Portfolio: {String(data.portfolioHealth || "")}
        </Badge>
        <span className="text-sm text-muted-foreground">Week of {String(data.weekOf || "")}</span>
      </div>

      <div className="p-4 rounded-lg bg-slate-50 border">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium text-sm">Executive Summary</h4>
          <CopyButton text={String(data.executiveSummary || "")} />
        </div>
        <p className="text-sm">{String(data.executiveSummary || "")}</p>
      </div>

      {projects && projects.length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Project Status</h4>
          <div className="space-y-2">
            {projects.map((p, i) => (
              <div key={i} className="p-3 rounded-lg border flex items-start gap-3">
                <span className="text-lg flex-shrink-0">{p.rag?.includes("Green") ? "🟢" : p.rag?.includes("Red") ? "🔴" : "🟡"}</span>
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.thisWeek}</p>
                  {p.risk && <p className="text-xs text-amber-600 mt-1">⚠️ {p.risk}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.decisionsNeeded && (data.decisionsNeeded as string[]).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Decisions Needed</h4>
          <ul className="space-y-1">
            {(data.decisionsNeeded as string[]).map((d, i) => (
              <li key={i} className="text-sm p-2 rounded border-l-4 border-l-amber-400 bg-amber-50">{d}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function RiskTab({ data }: { data: Record<string, unknown> }) {
  const risks = data.risks as Array<Record<string, unknown>> | undefined;
  const escalationEmail = data.escalationEmail as Record<string, string> | undefined;

  return (
    <div className="space-y-4">
      <Badge variant={
        data.overallRiskLevel === "High" ? "danger" :
        data.overallRiskLevel === "Low" ? "success" : "warning"
      }>
        Overall Risk: {String(data.overallRiskLevel || "")}
      </Badge>

      {risks && risks.length > 0 && (
        <div className="space-y-2">
          {risks.map((r, i) => (
            <div key={i} className={`p-3 rounded-lg border ${
              String(r.severity).includes("High") ? "border-red-200 bg-red-50" :
              String(r.severity).includes("Medium") ? "border-amber-200 bg-amber-50" :
              "border-green-200 bg-green-50"
            }`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{String(r.description || "")}</p>
                <span className="text-sm flex-shrink-0">{String(r.severity || "")}</span>
              </div>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{String(r.category || "")}</Badge>
                {r.escalationNeeded && <Badge variant="danger" className="text-xs">Escalation Needed</Badge>}
              </div>
              {r.mitigation && (
                <p className="text-xs text-muted-foreground mt-2">Mitigation: {String(r.mitigation)}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {data.immediateActions && (data.immediateActions as string[]).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Immediate Actions</h4>
          <ul className="space-y-1">
            {(data.immediateActions as string[]).map((a, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <Zap className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      )}

      {escalationEmail && (
        <div className="border rounded-lg p-4 bg-slate-50">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">Escalation Email</h4>
            <CopyButton text={`Subject: ${escalationEmail.subject}\n\n${escalationEmail.body}`} />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Subject: {escalationEmail.subject}</p>
          <pre className="text-sm whitespace-pre-wrap font-sans">{escalationEmail.body}</pre>
        </div>
      )}
    </div>
  );
}

function StakeholderTab({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-lg">{String(data.name || "")}</h3>
        <p className="text-sm text-muted-foreground">{String(data.role || "")} · {String(data.organisation || "")}</p>
      </div>

      {data.projects && (data.projects as string[]).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Projects</h4>
          <div className="flex flex-wrap gap-1">
            {(data.projects as string[]).map((p, i) => (
              <Badge key={i} variant="secondary">{p}</Badge>
            ))}
          </div>
        </div>
      )}

      {data.currentConcerns && (data.currentConcerns as string[]).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Current Concerns</h4>
          <ul className="space-y-1">
            {(data.currentConcerns as string[]).map((c, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-amber-500 mt-1 flex-shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.talkingPoints && (data.talkingPoints as string[]).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2">Talking Points</h4>
          <ul className="space-y-1">
            {(data.talkingPoints as string[]).map((t, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">→</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.communicationStyle && (
        <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
          <h4 className="font-medium text-sm text-blue-900 mb-1">Communication Style</h4>
          <p className="text-sm text-blue-800">{String(data.communicationStyle)}</p>
        </div>
      )}

      {data.thingsToAvoid && (data.thingsToAvoid as string[]).length > 0 && (
        <div>
          <h4 className="font-medium text-sm mb-2 text-red-600">Things to Avoid</h4>
          <ul className="space-y-1">
            {(data.thingsToAvoid as string[]).map((t, i) => (
              <li key={i} className="text-sm flex items-start gap-2 text-red-700">
                <span className="mt-0.5">✗</span>{t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "/triage", forceAgent: "EmailAgent" },
  { label: "/meeting", forceAgent: "MeetingAgent" },
  { label: "/report", forceAgent: "ReportAgent" },
  { label: "/risk", forceAgent: "RiskAgent" },
];

export default function MainPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [activeTab, setActiveTab] = useState("actions");
  const [file, setFile] = useState<File | null>(null);
  const [forceAgent, setForceAgent] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: process, isPending } = useProcess();

  const detectedTypes = detectInputType(input);

  const handleProcess = useCallback(() => {
    if (!input.trim() && !file) return;
    process(
      { input, file: file || undefined, forceAgent },
      {
        onSuccess: (data) => {
          setResult(data);
          setForceAgent(undefined);
          const tabs = getAvailableTabs(data);
          if (tabs.length > 0) setActiveTab(tabs[0].value);
        },
      }
    );
  }, [input, file, forceAgent, process]);

  const handleQuickAction = (action: { label: string; forceAgent: string }) => {
    setForceAgent(action.forceAgent);
    if (input.trim()) {
      process(
        { input, forceAgent: action.forceAgent },
        {
          onSuccess: (data) => {
            setResult(data);
            setForceAgent(undefined);
            const tabs = getAvailableTabs(data);
            if (tabs.length > 0) setActiveTab(tabs[0].value);
          },
        }
      );
    }
  };

  function getAvailableTabs(data: ProcessResult) {
    const tabs = [];
    if (data.results.email) tabs.push({ value: "email", label: "Email Reply", icon: "📧" });
    tabs.push({ value: "actions", label: "Actions", icon: "📋" });
    if (data.results.meeting) tabs.push({ value: "meeting", label: "Meeting", icon: "🗒️" });
    if (data.results.report) tabs.push({ value: "report", label: "Report", icon: "📊" });
    if (data.results.risk) tabs.push({ value: "risk", label: "Risks", icon: "⚠️" });
    if (data.results.stakeholder) tabs.push({ value: "stakeholder", label: "Stakeholder", icon: "👤" });
    return tabs;
  }

  const availableTabs = result ? getAvailableTabs(result) : [];

  return (
    <div className="flex h-full">
      {/* Left Panel — Input */}
      <div className="w-[40%] border-r flex flex-col p-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-700">PM Copilot</h1>
          <p className="text-sm text-muted-foreground">Paste anything — email, meeting notes, updates</p>
        </div>

        {/* Auto-detect badges */}
        {detectedTypes.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {detectedTypes.map((t, i) => (
              <span key={i} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${t.color}`}>
                {t.icon} {t.label} detected
              </span>
            ))}
          </div>
        )}

        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste an email, meeting notes, project update, or anything on your mind..."
          className="flex-1 min-h-[300px] resize-none text-sm leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleProcess();
          }}
        />

        {/* File attachment */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Paperclip className="w-3 h-3" />
            {file ? file.name : "Attach file"}
          </Button>
          {file && (
            <Button variant="ghost" size="sm" onClick={() => setFile(null)} className="text-xs text-muted-foreground">
              Remove
            </Button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {/* Quick action pills */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action)}
              className="text-xs px-3 py-1 rounded-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors font-mono"
            >
              {action.label}
            </button>
          ))}
        </div>

        <Button
          onClick={handleProcess}
          disabled={isPending || (!input.trim() && !file)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base font-medium"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Orchestrating agents...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Process with AI
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">Ctrl+Enter to process</p>
      </div>

      {/* Right Panel — Output */}
      <div className="flex-1 flex flex-col p-6 overflow-auto">
        {!result && !isPending && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">Ready to process</p>
              <p className="text-sm mt-1">Paste any PM content on the left and click Process with AI</p>
            </div>
          </div>
        )}

        {isPending && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="flex gap-2 justify-center mb-4">
                {["Orchestrator", "Routing", "Agents"].map((s, i) => (
                  <div key={i} className="flex items-center gap-1 text-sm text-indigo-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {s}
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-sm">Analysing and routing to specialist agents...</p>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Routing info */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Detected:</span>
              {result.routing.inputType.map((t, i) => (
                <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
              ))}
              <span>·</span>
              <span>Agents: {result.routing.agentsToCall.join(", ")}</span>
              <span>·</span>
              <span>{result.processingTime}ms</span>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex-wrap h-auto gap-1">
                {availableTabs.map(tab => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                    {tab.icon} {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {result.results.email && (
                <TabsContent value="email">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <EmailTab data={result.results.email} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="actions">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ListChecks className="w-4 h-4" /> Action Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActionsTab results={result.results} />
                  </CardContent>
                </Card>
              </TabsContent>

              {result.results.meeting && (
                <TabsContent value="meeting">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ListChecks className="w-4 h-4" /> Meeting Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MeetingTab data={result.results.meeting} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {result.results.report && (
                <TabsContent value="report">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" /> Leadership Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ReportTab data={result.results.report} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {result.results.risk && (
                <TabsContent value="risk">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Assessment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RiskTab data={result.results.risk} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {result.results.stakeholder && (
                <TabsContent value="stakeholder">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="w-4 h-4" /> Stakeholder Brief
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StakeholderTab data={result.results.stakeholder} />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
