import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Bot, Server, Shield, Zap } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">PM Copilot configuration</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bot className="w-4 h-4" /> AI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Model</span>
              <Badge variant="secondary">claude-sonnet-4-5</Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Orchestrator</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Agents</span>
              <Badge variant="secondary">5 Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">tool_choice</span>
              <Badge variant="outline" className="font-mono">any</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4" /> Reliability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">JSON Retry Attempts</span>
              <Badge variant="outline">3x</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Backoff</span>
              <Badge variant="outline">1s → 2s → 4s</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Circuit Breaker</span>
              <Badge variant="outline">5 failures</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Session Timeout</span>
              <Badge variant="outline">8 hours</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Input Guardrail</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Output Guardrail</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Injection Detection</span>
              <Badge variant="success">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">BFSI Compliance Mode</span>
              <Badge variant="success">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="w-4 h-4" /> Infrastructure
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Backend Port</span>
              <Badge variant="outline" className="font-mono">5000</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Frontend Port</span>
              <Badge variant="outline" className="font-mono">5173</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Storage</span>
              <Badge variant="outline">In-Memory</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">File Upload</span>
              <Badge variant="outline">multer (memory)</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
