"use client";

import { useMemo } from "react";
import nextDynamic from "next/dynamic";
import { CalendarDays, UserCheck, UserMinus, UserPlus, Users } from "lucide-react";
import { useErpList } from "@/lib/queries/useErpList";
import { Card, CardContent } from "@/components/ui/Card";
import { KpiCard } from "./KpiCard";
import { DashboardSkeleton } from "./FinanceDashboard";

const LazyResponsiveContainer = nextDynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const LazyPieChart = nextDynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const LazyPie = nextDynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const LazyCell = nextDynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const LazyLineChart = nextDynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const LazyLine = nextDynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const LazyXAxis = nextDynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const LazyYAxis = nextDynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const LazyTooltip = nextDynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const LazyLegend = nextDynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const LazyCartesianGrid = nextDynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

interface RawEmployee {
  name?: string;
  employee_name?: string;
  designation?: string;
  department?: string;
  status?: string;
  date_of_joining?: string;
  date_of_birth?: string;
}

interface RawAttendance {
  name?: string;
  employee?: string;
  employee_name?: string;
  attendance_date?: string;
  status?: string;
}

interface RawLeave {
  name?: string;
  employee?: string;
  employee_name?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
  leave_type?: string;
  total_leave_days?: number;
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

function isToday(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

function isMtd(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth();
}

function withinNextDays(dateStr: string | undefined, days: number): boolean {
  if (!dateStr) return false;
  const t = new Date();
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return false;
  // Birthdays / anniversaries: align year to current year
  target.setFullYear(t.getFullYear());
  const diffDays = (target.getTime() - t.getTime()) / 86_400_000;
  return diffDays >= 0 && diffDays <= days;
}

function lastNDays(n: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    out.push({ key, label: `${d.getMonth() + 1}/${d.getDate()}` });
  }
  return out;
}

export function HRDashboard() {
  const employeeQuery = useErpList("Employee", {
    fields: ["name", "employee_name", "designation", "department", "status", "date_of_joining", "date_of_birth"],
    limit: 500,
  });
  const attendanceQuery = useErpList("Attendance", {
    fields: ["name", "employee", "employee_name", "attendance_date", "status"],
    limit: 500,
    orderBy: "attendance_date desc",
  });
  const leaveQuery = useErpList("Leave Application", {
    fields: ["name", "employee", "employee_name", "from_date", "to_date", "status", "leave_type", "total_leave_days"],
    limit: 200,
  });

  const employees = useMemo(() => (employeeQuery.data as RawEmployee[]) ?? [], [employeeQuery.data]);
  const attendance = useMemo(() => (attendanceQuery.data as RawAttendance[]) ?? [], [attendanceQuery.data]);
  const leaves = useMemo(() => (leaveQuery.data as RawLeave[]) ?? [], [leaveQuery.data]);

  const loading = employeeQuery.isLoading || attendanceQuery.isLoading || leaveQuery.isLoading;
  const errored = employeeQuery.isError && attendanceQuery.isError && leaveQuery.isError;

  // ── KPIs ──────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = employees.filter((e) => e.status === "Active").length;
    const presentToday = attendance.filter((a) => a.status === "Present" && isToday(a.attendance_date)).length;
    const onLeaveToday = leaves.filter(
      (l) =>
        l.status === "Approved" &&
        (l.from_date ?? "") <= new Date().toISOString().split("T")[0] &&
        (l.to_date ?? "") >= new Date().toISOString().split("T")[0],
    ).length;
    const newHires = employees.filter((e) => isMtd(e.date_of_joining)).length;
    return { total, presentToday, onLeaveToday, newHires };
  }, [employees, attendance, leaves]);

  // ── Department breakdown ──────────────────────────────────────────
  const departmentData = useMemo(() => {
    const byDept: Record<string, number> = {};
    employees.forEach((e) => {
      if (e.status !== "Active") return;
      const dept = e.department || "Unassigned";
      byDept[dept] = (byDept[dept] ?? 0) + 1;
    });
    return Object.entries(byDept)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [employees]);

  // ── Attendance rate (last 30 days) ────────────────────────────────
  const attendanceTrend = useMemo(() => {
    const days = lastNDays(30);
    const byDay: Record<string, { present: number; total: number }> = {};
    days.forEach(({ key }) => {
      byDay[key] = { present: 0, total: 0 };
    });
    attendance.forEach((a) => {
      const k = a.attendance_date ?? "";
      if (k in byDay) {
        byDay[k].total += 1;
        if (a.status === "Present") byDay[k].present += 1;
      }
    });
    return days.map(({ key, label }) => ({
      day: label,
      rate: byDay[key].total > 0 ? (byDay[key].present / byDay[key].total) * 100 : 0,
    }));
  }, [attendance]);

  // ── Leave balance summary ─────────────────────────────────────────
  const leaveSummary = useMemo(() => {
    const byType: Record<string, number> = {};
    leaves.forEach((l) => {
      if (l.status !== "Approved") return;
      const type = l.leave_type || "Other";
      byType[type] = (byType[type] ?? 0) + (l.total_leave_days ?? 0);
    });
    return Object.entries(byType)
      .map(([type, days]) => ({ type, days }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 6);
  }, [leaves]);

  // ── Upcoming birthdays / anniversaries ───────────────────────────
  const upcomingEvents = useMemo(() => {
    const events: { name: string; type: "Birthday" | "Anniversary"; date: string }[] = [];
    employees.forEach((e) => {
      if (e.status !== "Active") return;
      if (e.date_of_birth && withinNextDays(e.date_of_birth, 30)) {
        events.push({
          name: e.employee_name ?? e.name ?? "—",
          type: "Birthday",
          date: e.date_of_birth,
        });
      }
      if (e.date_of_joining && withinNextDays(e.date_of_joining, 30)) {
        events.push({
          name: e.employee_name ?? e.name ?? "—",
          type: "Anniversary",
          date: e.date_of_joining,
        });
      }
    });
    return events.slice(0, 8);
  }, [employees]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">HR Overview</h1>
        <p className="text-sm text-muted-foreground">Headcount, attendance, leave, and team milestones.</p>
      </div>

      {errored && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Could not reach the ERP backend. Showing zero values until the connection is restored.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Employees" value={kpis.total} icon={Users} format="number" />
        <KpiCard label="Present Today" value={kpis.presentToday} icon={UserCheck} format="number" />
        <KpiCard label="On Leave" value={kpis.onLeaveToday} icon={UserMinus} format="number" />
        <KpiCard label="New Hires (MTD)" value={kpis.newHires} icon={UserPlus} format="number" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Department Breakdown</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Active employees by department</p>
            {departmentData.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No active employees yet.</p>
            ) : (
              <div className="mt-4 h-64 min-h-[256px] w-full">
                <LazyResponsiveContainer width="100%" height={256}>
                  <LazyPieChart>
                    <LazyPie
                      data={departmentData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {departmentData.map((_, i) => (
                        <LazyCell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </LazyPie>
                    <LazyTooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.375rem",
                      }}
                    />
                    <LazyLegend wrapperStyle={{ fontSize: 12 }} />
                  </LazyPieChart>
                </LazyResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Attendance Rate</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Last 30 days</p>
            {attendanceTrend.every((d) => d.rate === 0) ? (
              <p className="mt-8 text-sm text-muted-foreground">No attendance data yet.</p>
            ) : (
              <div className="mt-4 h-64 min-h-[256px] w-full">
                <LazyResponsiveContainer width="100%" height={256}>
                  <LazyLineChart data={attendanceTrend} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <LazyXAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      interval={4}
                    />
                    <LazyYAxis
                      domain={[0, 100]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      width={36}
                    />
                    <LazyTooltip
                      formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, "Attendance"]}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.375rem",
                      }}
                    />
                    <LazyLine type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  </LazyLineChart>
                </LazyResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Leave Balance Summary</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Approved leave days by type</p>
            {leaveSummary.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No approved leave records yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {leaveSummary.map((l) => {
                  const max = leaveSummary[0]?.days || 1;
                  const pct = (l.days / max) * 100;
                  return (
                    <li key={l.type}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{l.type}</span>
                        <span className="font-medium tabular-nums text-foreground">
                          {l.days.toFixed(0)} {l.days === 1 ? "day" : "days"}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Upcoming Events</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Birthdays & anniversaries (next 30 days)</p>
            {upcomingEvents.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No upcoming events.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {upcomingEvents.map((e, i) => (
                  <li
                    key={`${e.name}-${e.type}-${i}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background p-3"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{e.name}</p>
                        <p className="text-xs text-muted-foreground">{e.type}</p>
                      </div>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground">{e.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
