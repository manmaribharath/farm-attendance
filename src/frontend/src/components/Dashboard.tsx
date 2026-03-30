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
import {
  type AttendanceRecord,
  type AttendanceType,
  type Worker,
  upsertAttendance,
} from "@/lib/db";
import { CalendarIcon, CheckCircle2, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  workers: Worker[];
  attendance: AttendanceRecord[];
  date: string;
  onDateChange: (d: string) => void;
  onAttendanceChange: () => void;
}

const BUTTONS: {
  type: AttendanceType;
  label: string;
  color: string;
  activeColor: string;
}[] = [
  {
    type: "full",
    label: "Full",
    color: "border-status-full text-status-full hover:bg-status-full/10",
    activeColor: "bg-status-full text-white border-status-full",
  },
  {
    type: "half",
    label: "Half",
    color: "border-status-half text-status-half hover:bg-status-half/10",
    activeColor: "bg-status-half text-white border-status-half",
  },
  {
    type: "absent",
    label: "Absent",
    color: "border-status-absent text-status-absent hover:bg-status-absent/10",
    activeColor: "bg-status-absent text-white border-status-absent",
  },
  {
    type: "extra",
    label: "Extra",
    color: "border-status-extra text-status-extra hover:bg-status-extra/10",
    activeColor: "bg-status-extra text-white border-status-extra",
  },
];

export default function Dashboard({
  workers,
  attendance,
  date,
  onDateChange,
  onAttendanceChange,
}: Props) {
  const [extraModal, setExtraModal] = useState<{
    workerId: number;
    workerName: string;
  } | null>(null);
  const [extraAmount, setExtraAmount] = useState("");
  const [saving, setSaving] = useState<number | null>(null);

  const getRecord = (workerId: number) =>
    attendance.find((a) => a.workerId === workerId);

  const handleAttendance = async (workerId: number, type: AttendanceType) => {
    if (type === "extra") {
      const w = workers.find((wk) => wk.id === workerId);
      setExtraModal({ workerId, workerName: w?.name ?? "" });
      setExtraAmount("");
      return;
    }
    setSaving(workerId);
    try {
      await upsertAttendance({ workerId, date, type });
      onAttendanceChange();
      toast.success("Attendance saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const handleExtraConfirm = async () => {
    if (!extraModal) return;
    const amount = Number.parseFloat(extraAmount);
    if (Number.isNaN(amount) || amount < 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSaving(extraModal.workerId);
    try {
      await upsertAttendance({
        workerId: extraModal.workerId,
        date,
        type: "extra",
        extraAmount: amount,
      });
      onAttendanceChange();
      toast.success("Extra amount saved");
      setExtraModal(null);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            Daily Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Label
              htmlFor="date-input"
              className="text-sm font-medium whitespace-nowrap"
            >
              Select Date
            </Label>
            <Input
              id="date-input"
              data-ocid="dashboard.date.input"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Worker Attendance Table */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Worker Attendance Table</CardTitle>
          <p className="text-xs text-muted-foreground">
            {workers.length} workers listed
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {workers.length === 0 ? (
            <div
              data-ocid="dashboard.attendance.empty_state"
              className="text-center py-12 text-muted-foreground px-4"
            >
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No workers added yet</p>
              <p className="text-sm mt-1">Go to Workers tab to add your team</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-ocid="dashboard.attendance.table">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">
                      Worker Name
                    </th>
                    <th
                      className="text-center text-xs font-semibold px-2 py-3"
                      style={{ color: "oklch(var(--status-full))" }}
                    >
                      Full
                    </th>
                    <th
                      className="text-center text-xs font-semibold px-2 py-3"
                      style={{ color: "oklch(var(--status-half))" }}
                    >
                      Half
                    </th>
                    <th
                      className="text-center text-xs font-semibold px-2 py-3"
                      style={{ color: "oklch(var(--status-absent))" }}
                    >
                      Absent
                    </th>
                    <th
                      className="text-center text-xs font-semibold px-2 py-3"
                      style={{ color: "oklch(var(--status-extra))" }}
                    >
                      Extra
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker, idx) => {
                    const record = getRecord(worker.id!);
                    return (
                      <tr
                        key={worker.id}
                        data-ocid={`dashboard.attendance.item.${idx + 1}`}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">
                            {worker.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ₹{worker.dailyWage}/day
                          </div>
                        </td>
                        {BUTTONS.map((btn) => (
                          <td key={btn.type} className="px-2 py-3 text-center">
                            <button
                              type="button"
                              data-ocid={`dashboard.attendance.${btn.type}.button.${idx + 1}`}
                              disabled={saving === worker.id}
                              onClick={() =>
                                handleAttendance(worker.id!, btn.type)
                              }
                              className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-semibold border-2 min-h-[44px] min-w-[60px] transition-all ${
                                record?.type === btn.type
                                  ? btn.activeColor
                                  : btn.color
                              }`}
                            >
                              {record?.type === btn.type && (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              {btn.label}
                              {btn.type === "extra" &&
                                record?.type === "extra" &&
                                record.extraAmount != null && (
                                  <span className="ml-0.5">
                                    ₹{record.extraAmount}
                                  </span>
                                )}
                            </button>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extra Amount Modal */}
      <Dialog
        open={!!extraModal}
        onOpenChange={(open) => !open && setExtraModal(null)}
      >
        <DialogContent data-ocid="dashboard.extra.dialog">
          <DialogHeader>
            <DialogTitle>Enter Extra Amount</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">
              Worker: <strong>{extraModal?.workerName}</strong>
            </p>
            <div className="space-y-1">
              <Label htmlFor="extra-amount">Amount (₹)</Label>
              <Input
                id="extra-amount"
                data-ocid="dashboard.extra.input"
                type="number"
                min={0}
                placeholder="e.g. 650"
                value={extraAmount}
                onChange={(e) => setExtraAmount(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleExtraConfirm()}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="dashboard.extra.cancel_button"
              onClick={() => setExtraModal(null)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="dashboard.extra.confirm_button"
              onClick={handleExtraConfirm}
              disabled={saving !== null}
              className="bg-status-extra hover:bg-status-extra/90 text-white"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
