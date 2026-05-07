import { useState } from "react";
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, type Project } from "@/hooks/useProjects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, FolderKanban, Loader2 } from "lucide-react";

function statusBadge(status: string) {
  const map: Record<string, "success" | "warning" | "danger" | "secondary"> = {
    "On Track": "success",
    "At Risk": "warning",
    "Delayed": "danger",
    "Delivered": "secondary",
  };
  const emoji: Record<string, string> = { "On Track": "🟢", "At Risk": "🟡", "Delayed": "🔴", "Delivered": "✅" };
  return (
    <Badge variant={map[status] || "secondary"}>
      {emoji[status]} {status}
    </Badge>
  );
}

interface ProjectFormData {
  name: string;
  status: Project["status"];
  lead: string;
  stakeholder: string;
  notes: string;
}

function ProjectForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial?: Partial<Project>;
  onSave: (data: ProjectFormData) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<ProjectFormData>({
    name: initial?.name || "",
    status: initial?.status || "On Track",
    lead: initial?.lead || "",
    stakeholder: initial?.stakeholder || "",
    notes: initial?.notes || "",
  });

  const set = (field: keyof ProjectFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>Project Name *</Label>
        <Input value={form.name} onChange={set("name")} placeholder="Project Alpha" />
      </div>
      <div className="space-y-1">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as Project["status"] }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="On Track">🟢 On Track</SelectItem>
            <SelectItem value="At Risk">🟡 At Risk</SelectItem>
            <SelectItem value="Delayed">🔴 Delayed</SelectItem>
            <SelectItem value="Delivered">✅ Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Internal Lead</Label>
          <Input value={form.lead} onChange={set("lead")} placeholder="Alex Thompson" />
        </div>
        <div className="space-y-1">
          <Label>Apollo Stakeholder</Label>
          <Input value={form.stakeholder} onChange={set("stakeholder")} placeholder="Sarah Mitchell" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Notes</Label>
        <Textarea value={form.notes} onChange={set("notes")} rows={3} />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(form)} disabled={isSaving || !form.name}>
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </div>
  );
}

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();
  const deleteMutation = useDeleteProject();

  const [dialogMode, setDialogMode] = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const handleSave = (data: ProjectFormData) => {
    if (dialogMode === "edit" && editTarget) {
      updateMutation.mutate({ id: editTarget.id, ...data }, {
        onSuccess: () => { setDialogMode(null); setEditTarget(null); },
      });
    } else {
      createMutation.mutate(data, { onSuccess: () => setDialogMode(null) });
    }
  };

  if (isLoading) return <div className="p-6">Loading projects...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">{projects.length} active projects</p>
        </div>
        <Button onClick={() => { setEditTarget(null); setDialogMode("add"); }}>
          <Plus className="w-4 h-4 mr-2" /> Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No projects yet</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Project</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Lead</th>
                <th className="px-4 py-3 text-left font-medium">Stakeholder</th>
                <th className="px-4 py-3 text-left font-medium">Notes</th>
                <th className="px-4 py-3 text-left font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map(p => (
                <tr key={p.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.lead}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.stakeholder}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{p.notes}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditTarget(p); setDialogMode("edit"); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(p)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogMode !== null} onOpenChange={(o) => { if (!o) { setDialogMode(null); setEditTarget(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === "edit" ? `Edit ${editTarget?.name}` : "Add Project"}</DialogTitle>
          </DialogHeader>
          <ProjectForm
            initial={editTarget || undefined}
            onSave={handleSave}
            onCancel={() => { setDialogMode(null); setEditTarget(null); }}
            isSaving={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

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
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
