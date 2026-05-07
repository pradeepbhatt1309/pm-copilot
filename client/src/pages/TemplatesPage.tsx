import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { copyToClipboard } from "@/lib/utils";

const TEMPLATE_TYPES = ["status-update", "escalation", "risk-alert", "meeting-summary"] as const;

const LABELS: Record<string, string> = {
  "status-update": "Weekly Status Update",
  "escalation": "Escalation Email",
  "risk-alert": "Risk Alert",
  "meeting-summary": "Meeting Summary",
};

function TemplateCard({ type }: { type: string }) {
  const [copied, setCopied] = useState(false);
  const { data } = useQuery({
    queryKey: ["template", type],
    queryFn: () => apiRequest<{ subject: string; body: string }>("GET", `/api/mcp/templates/${type}`),
  });

  const handleCopy = async () => {
    if (!data) return;
    await copyToClipboard(`Subject: ${data.subject}\n\n${data.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">{LABELS[type] || type}</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data ? (
          <div className="space-y-2">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
              <p className="text-sm bg-muted rounded px-2 py-1 font-mono text-xs">{data.subject}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Body</p>
              <pre className="text-xs bg-muted rounded p-2 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">{data.body}</pre>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">Loading...</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TemplatesPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <p className="text-muted-foreground text-sm mt-1">Professional templates for common PM communications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATE_TYPES.map(type => (
          <TemplateCard key={type} type={type} />
        ))}
      </div>
    </div>
  );
}
