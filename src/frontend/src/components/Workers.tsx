import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Worker, addWorker, deleteWorker, updateWorker } from "@/lib/db";
import { Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import WorkerReport from "./WorkerReport";

interface Props {
  workers: Worker[];
  onWorkersChange: () => void;
}

export default function Workers({ workers, onWorkersChange }: Props) {
  const [name, setName] = useState("");
  const [wage, setWage] = useState("");
  const [adding, setAdding] = useState(false);

  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [editName, setEditName] = useState("");
  const [editWage, setEditWage] = useState("");
  const [saving, setSaving] = useState(false);

  const [reportWorker, setReportWorker] = useState<Worker | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !wage) {
      toast.error("Name and wage are required");
      return;
    }
    setAdding(true);
    try {
      await addWorker({
        name: name.trim(),
        dailyWage: Number.parseFloat(wage),
      });
      setName("");
      setWage("");
      onWorkersChange();
      toast.success("Worker added");
    } catch {
      toast.error("Failed to add worker");
    } finally {
      setAdding(false);
    }
  };

  const openEdit = (w: Worker) => {
    setEditWorker(w);
    setEditName(w.name);
    setEditWage(String(w.dailyWage));
  };

  const handleEditSave = async () => {
    if (!editWorker || !editName.trim() || !editWage) {
      toast.error("Name and wage are required");
      return;
    }
    setSaving(true);
    try {
      await updateWorker({
        ...editWorker,
        name: editName.trim(),
        dailyWage: Number.parseFloat(editWage),
      });
      setEditWorker(null);
      onWorkersChange();
      toast.success("Worker updated");
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this worker?")) return;
    try {
      await deleteWorker(id);
      onWorkersChange();
      toast.success("Worker removed");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Add New Worker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="worker-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="worker-name"
                data-ocid="workers.name.input"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="worker-wage">
                Daily Wage (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="worker-wage"
                data-ocid="workers.wage.input"
                type="number"
                min={0}
                placeholder="e.g. 500"
                value={wage}
                onChange={(e) => setWage(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              data-ocid="workers.add.submit_button"
              disabled={adding}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" />
              {adding ? "Adding..." : "Add Worker"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Workers</CardTitle>
          <p className="text-xs text-muted-foreground">
            {workers.length} worker{workers.length !== 1 ? "s" : ""} registered
            {workers.length > 0 && " — tap a name to view report"}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {workers.length === 0 ? (
            <div
              data-ocid="workers.list.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <p className="font-medium">No workers yet</p>
              <p className="text-sm mt-1">
                Add your first worker using the form above
              </p>
            </div>
          ) : (
            <ul data-ocid="workers.list" className="divide-y divide-border">
              {workers.map((w, idx) => (
                <li
                  key={w.id}
                  data-ocid={`workers.list.item.${idx + 1}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors"
                >
                  <button
                    type="button"
                    className="text-left flex-1 min-w-0"
                    onClick={() => setReportWorker(w)}
                  >
                    <p className="font-medium text-sm text-primary hover:underline underline-offset-2 truncate">
                      {w.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ₹{w.dailyWage} / day
                    </p>
                  </button>
                  <div className="flex gap-2 ml-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid={`workers.list.edit_button.${idx + 1}`}
                      onClick={() => openEdit(w)}
                      className="h-9 w-9 text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-ocid={`workers.list.delete_button.${idx + 1}`}
                      onClick={() => handleDelete(w.id!)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog
        open={!!editWorker}
        onOpenChange={(o) => !o && setEditWorker(null)}
      >
        <DialogContent data-ocid="workers.edit.dialog">
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                data-ocid="workers.edit.name.input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-wage">Daily Wage (₹)</Label>
              <Input
                id="edit-wage"
                data-ocid="workers.edit.wage.input"
                type="number"
                min={0}
                value={editWage}
                onChange={(e) => setEditWage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="workers.edit.cancel_button"
              onClick={() => setEditWorker(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="workers.edit.save_button"
              onClick={handleEditSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Worker Report Modal */}
      <WorkerReport
        worker={reportWorker}
        onClose={() => setReportWorker(null)}
      />
    </div>
  );
}
