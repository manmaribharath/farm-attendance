import Calculator from "@/components/Calculator";
import Dashboard from "@/components/Dashboard";
import Summary from "@/components/Summary";
import Workers from "@/components/Workers";
import { Toaster } from "@/components/ui/sonner";
import {
  type AttendanceRecord,
  type Worker,
  getAllWorkers,
  getAttendanceForDate,
} from "@/lib/db";
import {
  BarChart2,
  Calculator as CalcIcon,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const today = () => new Date().toISOString().slice(0, 10);

type Tab = "dashboard" | "workers" | "summary" | "calculator";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState<string>(today());

  const loadWorkers = useCallback(async () => {
    const w = await getAllWorkers();
    setWorkers(w);
  }, []);

  const loadAttendance = useCallback(async (d: string) => {
    const a = await getAttendanceForDate(d);
    setAttendance(a);
  }, []);

  useEffect(() => {
    loadWorkers();
  }, [loadWorkers]);

  useEffect(() => {
    loadAttendance(date);
  }, [date, loadAttendance]);

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    { id: "workers", label: "Workers", icon: <Users className="w-5 h-5" /> },
    {
      id: "summary",
      label: "Summary",
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      id: "calculator",
      label: "Calculator",
      icon: <CalcIcon className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top App Bar */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                🌾
              </span>
            </div>
            <span className="font-bold text-lg tracking-tight">FarmTrack</span>
          </div>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                data-ocid={`nav.${item.id}.link`}
                onClick={() => setTab(item.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === item.id
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Page header */}
      <div className="bg-card border-b border-border px-4 py-4 max-w-6xl mx-auto w-full">
        <h1 className="text-xl font-bold text-foreground">
          Attendance &amp; Wage Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage daily attendance and wages for your workers
        </p>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-4 pb-24 md:pb-6">
        {tab === "dashboard" && (
          <Dashboard
            workers={workers}
            attendance={attendance}
            date={date}
            onDateChange={(d) => setDate(d)}
            onAttendanceChange={() => loadAttendance(date)}
          />
        )}
        {tab === "workers" && (
          <Workers workers={workers} onWorkersChange={loadWorkers} />
        )}
        {tab === "summary" && (
          <Summary
            workers={workers}
            attendance={attendance}
            date={date}
            onDateChange={setDate}
          />
        )}
        {tab === "calculator" && <Calculator />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`mobile.nav.${item.id}.tab`}
              onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                tab === item.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <Toaster />
    </div>
  );
}
