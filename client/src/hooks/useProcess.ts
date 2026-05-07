import { useMutation } from "@tanstack/react-query";

export interface ProcessResult {
  routing: {
    inputType: string[];
    agentsToCall: string[];
    confidence: number;
    context: string;
    urgency: string;
  };
  results: {
    email?: Record<string, unknown>;
    meeting?: Record<string, unknown>;
    report?: Record<string, unknown>;
    risk?: Record<string, unknown>;
    stakeholder?: Record<string, unknown>;
  };
  processingTime: number;
}

export function useProcess() {
  return useMutation({
    mutationFn: async ({ input, file, forceAgent }: { input: string; file?: File; forceAgent?: string }): Promise<ProcessResult> => {
      const formData = new FormData();
      formData.append("input", input);
      if (file) formData.append("file", file);
      if (forceAgent) formData.append("forceAgent", forceAgent);

      const res = await fetch("/api/process", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Processing failed" }));
        throw new Error(err.error || "Processing failed");
      }
      return res.json();
    },
  });
}
