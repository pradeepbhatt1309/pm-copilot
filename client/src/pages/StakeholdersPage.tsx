import { useState, useMemo } from "react";
import { useStakeholders, useCreateStakeholder, useUpdateStakeholder, useDeleteStakeholder, type Stakeholder } from "@/hooks/useStakeholders";
import { useProcess } from "@/hooks/useProcess";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Users, Briefcase, Bot, Loader2 } from "lucide-react";

interface StakeholderFormData {
  name: string;
  organisation: string;
  role: string;
  projects: string;
  currentConcerns: string;
  communicationStyle: string;
  openActions: string;
  notes: string;
}

function StakeholderForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: Partial<Stakeholder>;
  onSave: (data: StakeholderFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<StakeholderFormData>({
    name: initial?.name || "",
    organisation: initial?.organisation || "",
    role: initial?.role || "",
    projects: initial?.projects?.join(", ") || "",
    currentConcerns: initial?.currentConcerns?.join("\n") || "",
    communicationStyle: initial?.communicationStyle || "",
    openActions: initial?.openActions?.join("\n") || "",
    notes: initial?.notes || "",
  });

  const set = (field: keyof StakeholderFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Name *</Label>
          <Input value={form.name} onChange={set("name")} placeholder="Sarah Mitchell" />
        </div>
        <div className="space-y-1">
          <Label>Organisation *</Label>
          <Input value={form.organisation} onChange={set("organisation")} placeholder="Client Co" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Role *</Label>
        <Input value={form.role} onChange={set("role")} placeholder="Director, PM, Lead..." />
      </div>
      <div className="space-y-1">
        <Label>Projects (comma-separated)</Label>
        <Input value={form.projects} onChange={set("projects")} placeholder="Project Alpha, Project Beta" />
      </div>
      <div className="space-y-1">
        <Label>Current Concerns (one per line)</Label>
        <Textarea value={form.currentConcerns} onChange={set("currentConcerns")} placeholder={"Delivery timeline\nBudget concerns"} rows={3} />
      </div>
      <div className="space-y-1">
        <Label>Communication Style</Label>
        <Input value={form.communicationStyle} onChange={set("communicationStyle")} placeholder="Direct, data-driven..." />
      </div>
      <div className="space-y-1">
        <Label>Open Actions (one per line)</Label>
        <Textarea value={form.openActions} onChange={set("openActions")} rows={2} />
      </div>
      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={set("notes")} rows={2} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={isSaving || !form.name || !form.organisation || !form.role}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function StakeholdersPage() {
  const { data: stakeholders = [], isLoading } = useStakeholders();
  const createMutation = useCreateStakeholder();
  const updateMutation = useUpdateStakeholder();
  const deleteMutation = useDeleteStakeholder();
  const { mutate: process, isPending: isBriefing } = useProcess();

  const [search, setSearch] = useState("");
  const [filterOrg, setFilterOrg] = useState("");
  const [dialogMode, setDialogMode] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Stakeholder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Stakeholder | null>(null);
  const [briefResult, setBriefResult] = useState<{ name: string; data: Record<string, unknown> } | null>(null);

  const organisations = useMemo(() => [...new Set(stakeholders.map(s => s.organisation))], [stakeholders]);

  const filtered = useMemo(() =>
    stakeholders.filter(s => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.organisation.toLowerCase().includes(search.toLowerCase());
      const matchOrg = !filterOrg || s.organisation === filterOrg;
      return matchSearch && matchOrg;
    }), [stakeholders, search, filterOrg]);

  const handleSave = (data: StakeholderFormData) => {
    const payload = {
      ...data,
      projects: data.projects.split(",").map(s => s.trim()).filter(Boolean),
      currentConcerns: data.currentConcerns.split("\n").filter(Boolean),
      openActions: data.openActions.split("\n").filter(Boolean),
    };

    if (dialogMode === "edit" && editTarget) {
      updateMutation.mutate({ id: editTarget.id, ...payload }, {
        onSuccess: () => { setDialogMode(null); setEditTarget(null); },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setDialogMode(null),
      });
    }
  };

  const handleBrief = (s: Stakeholder) => {
    process({ input: `Brief me on ${s.name} before our upcoming interaction.` }, {
      onSuccess: (result) => {
        if (result.results.stakeholder) {
          setBriefResult({ name: s.name, data: result.results.stakeholder });
        }
      },
    });
  };

  if (isLoading) return <div className="p-6">Loading stakeholders...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Stakeholders</h1>
          <p className="text-muted-foreground text-sm mt-1">{stakeholders.length} stakeholders in knowledge base</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setDialogMode("add"); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Stakeholder
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or org..." className="pl-9" />
        </div>
        <select
          value={filterOrg}
          onChange={e => setFilterOrg(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="">All organisations</option>
          {organisations.map(org => <option key={org} value={org}>{org}</option>)}
        </select>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(s => (
          <Card key={s.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.role}</p>
                </div>
                <Badge variant="outline" className="text-xs flex-shrink-0">{s.organisation}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {s.projects.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {s.projects.map((p, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      <Briefcase className="w-2.5 h-2.5 mr-1" />{p}
                    </Badge>
                  ))}
                </div>
              )}

              {s.currentConcerns.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Concerns</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{s.currentConcerns.slice(0, 2).join(" · ")}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handleBrief(s)}
                  disabled={isBriefing}
                >
                  <Bot className="w-3 h-3 mr-1" /> Brief me
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditTarget(s); setDialogMode("edit"); }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTarget(s)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No stakeholders found</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogMode !== null} onOpenChange={(o) => { if (!o) { setDialogMode(null); setEditTarget(null); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogMode === "edit" ? `Edit ${editTarget?.name}` : "Add Stakeholder"}</DialogTitle>
          </DialogHeader>
          <StakeholderForm
            initial={editTarget || undefined}
            onSave={handleSave}
            onCancel={() => { setDialogMode(null); setEditTarget(null); }}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Brief result dialog */}
      <Dialog open={briefResult !== null} onOpenChange={(o) => { if (!o) setBriefResult(null); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Stakeholder Brief: {briefResult?.name}</DialogTitle>
          </DialogHeader>
          {briefResult && (
            <div className="space-y-3 text-sm">
              {briefResult.data.talkingPoints && (briefResult.data.talkingPoints as string[]).length > 0 && (
                <div>
                  <p className="font-medium mb-1">Talking Points</p>
                  <ul className="space-y-1">{(briefResult.data.talkingPoints as string[]).map((t, i) => <li key={i}>→ {t}</li>)}</ul>
                </div>
              )}
              {briefResult.data.currentConcerns && (briefResult.data.currentConcerns as string[]).length > 0 && (
                <div>
                  <p className="font-medium mb-1">Current Concerns</p>
                  <ul className="space-y-1">{(briefResult.data.currentConcerns as string[]).map((c, i) => <li key={i} className="text-amber-700">⚠️ {c}</li>)}</ul>
                </div>
              )}
              {briefResult.data.communicationStyle && (
                <p><span className="font-medium">Style:</span> {String(briefResult.data.communicationStyle)}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
