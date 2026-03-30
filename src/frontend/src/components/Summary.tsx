import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AttendanceRecord, Worker } from "@/lib/db";
import {
  BarChart2,
  IndianRupee,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

interface Props {
  workers: Worker[];
  attendance: AttendanceRecord[];
  date: string;
  onDateChange: (d: string) => void;
}

function calcWage(
  worker: Worker,
  record: AttendanceRecord | undefined,
): number {
  if (!record) return 0;
  switch (record.type) {
    case "full":
      return worker.dailyWage;
    case "half":
      return worker.dailyWage / 2;
    case "absent":
      return 0;
    case "extra":
      return record.extraAmount ?? 0;
  }
}

const STATS_CONFIG = [
  {
    key: "total",
    label: "Total Workers",
    colorClass: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "present",
    label: "Present",
    colorClass: "text-status-full",
    bg: "bg-status-full/10",
  },
  {
    key: "absent",
    label: "Absent",
    colorClass: "text-status-absent",
    bg: "bg-status-absent/10",
  },
  {
    key: "wages",
    label: "Total Wages",
    colorClass: "text-status-extra",
    bg: "bg-status-extra/10",
  },
];

export default function Summary({
  workers,
  attendance,
  date,
  onDateChange,
}: Props) {
  const getRecord = (workerId: number) =>
    attendance.find((a) => a.workerId === workerId);

  const presentCount = workers.filter((w) => {
    const r = getRecord(w.id!);
    return r && r.type !== "absent";
  }).length;

  const absentCount = workers.filter((w) => {
    const r = getRecord(w.id!);
    return r?.type === "absent";
  }).length;

  const totalWage = workers.reduce(
    (sum, w) => sum + calcWage(w, getRecord(w.id!)),
    0,
  );

  const statValues: Record<string, React.ReactNode> = {
    total: workers.length,
    present: presentCount,
    absent: absentCount,
    wages: `₹${totalWage.toLocaleString("en-IN")}`,
  };

  const statIcons: Record<string, React.ReactNode> = {
    total: <Users className="w-5 h-5" />,
    present: <TrendingUp className="w-5 h-5" />,
    absent: <XCircle className="w-5 h-5" />,
    wages: <IndianRupee className="w-5 h-5" />,
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-primary" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Label htmlFor="summary-date" className="text-sm whitespace-nowrap">
              Select Date
            </Label>
            <Input
              id="summary-date"
              data-ocid="summary.date.input"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {STATS_CONFIG.map((stat, i) => (
          <Card
            key={stat.key}
            data-ocid={`summary.stat.card.${i + 1}`}
            className="shadow-card"
          >
            <CardContent className="p-4">
              <div
                className={`inline-flex p-2 rounded-lg ${stat.bg} ${stat.colorClass} mb-2`}
              >
                {statIcons[stat.key]}
              </div>
              <p className={`text-2xl font-bold ${stat.colorClass}`}>
                {statValues[stat.key]}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-worker breakdown */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Worker Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {workers.length === 0 ? (
            <div
              data-ocid="summary.breakdown.empty_state"
              className="text-center py-10 text-muted-foreground"
            >
              <p>No workers to show</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {workers.map((w, idx) => {
                const record = getRecord(w.id!);
                const wage = calcWage(w, record);
                const typeColors: Record<string, string> = {
                  full: "bg-status-full/10 text-status-full",
                  half: "bg-status-half/10 text-status-half",
                  absent: "bg-status-absent/10 text-status-absent",
                  extra: "bg-status-extra/10 text-status-extra",
                };
                const label = record
                  ? record.type.charAt(0).toUpperCase() + record.type.slice(1)
                  : "—";
                return (
                  <li
                    key={w.id}
                    data-ocid={`summary.breakdown.item.${idx + 1}`}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{w.name}</p>
                      <p className="text-xs text-muted-foreground">
                        ₹{w.dailyWage}/day
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {record && (
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            typeColors[record.type] ?? ""
                          }`}
                        >
                          {label}
                        </span>
                      )}
                      <span className="text-sm font-semibold">
                        ₹{wage.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
