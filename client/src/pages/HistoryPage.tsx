import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Interaction {
  id: string;
  timestamp: string;
  rawInput: string;
  inputType: string[];
  agentsCalled: string[];
  processingTime: number;
}

export default function HistoryPage() {
  const qc = useQueryClient();
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => apiRequest<Interaction[]>("GET", "/api/history"),
  });

  const clearMutation = useMutation({
    mutationFn: () => apiRequest<{ success: boolean }>("DELETE", "/api/history"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Interaction History</h1>
          <p className="text-muted-foreground text-sm mt-1">Last {history.length} interactions</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => clearMutation.mutate()} disabled={clearMutation.isPending}>
          <Trash2 className="w-4 h-4 mr-2" /> Clear History
        </Button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No interactions yet. Start on the Copilot page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...history].reverse().map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.rawInput.slice(0, 100)}...</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {item.inputType.map((t, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                      {item.agentsCalled.map((a, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{formatDate(item.timestamp)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.processingTime}ms</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
