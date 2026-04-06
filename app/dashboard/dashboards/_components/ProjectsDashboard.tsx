"use client";

import { useMemo } from "react";
import nextDynamic from "next/dynamic";
import { AlertCircle, Briefcase, Clock, Coins } from "lucide-react";
import { useErpList } from "@/lib/queries/useErpList";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/locale/currency";
import { KpiCard } from "./KpiCard";
import { DashboardSkeleton } from "./FinanceDashboard";

const LazyResponsiveContainer = nextDynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const LazyPieChart = nextDynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const LazyPie = nextDynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const LazyCell = nextDynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const LazyBarChart = nextDynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const LazyBar = nextDynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const LazyXAxis = nextDynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const LazyYAxis = nextDynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const LazyTooltip = nextDynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const LazyLegend = nextDynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const LazyCartesianGrid = nextDynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

interface RawProject {
  name?: string;
  project_name?: string;
  status?: string;
  percent_complete?: number;
  expected_start_date?: string;
  expected_end_date?: string;
  estimated_costing?: number;
  total_costing_amount?: number;
}

interface RawTask {
  name?: string;
  subject?: string;
  status?: string;
  exp_end_date?: string;
  project?: string;
  priority?: string;
}

interface RawTimesheet {
  name?: string;
  employee?: string;
  employee_name?: string;
  total_hours?: number;
  start_date?: string;
  status?: string;
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function isMtd(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth();
}

export function ProjectsDashboard() {
  const projectQuery = useErpList("Project", {
    fields: [
      "name",
      "project_name",
      "status",
      "percent_complete",
      "expected_start_date",
      "expected_end_date",
      "estimated_costing",
      "total_costing_amount",
    ],
    limit: 200,
  });
  const taskQuery = useErpList("Task", {
    fields: ["name", "subject", "status", "exp_end_date", "project", "priority"],
    limit: 500,
  });
  const timesheetQuery = useErpList("Timesheet", {
    fields: ["name", "employee", "employee_name", "total_hours", "start_date", "status"],
    limit: 200,
    orderBy: "start_date desc",
  });

  const projects = useMemo(() => (projectQuery.data as RawProject[]) ?? [], [projectQuery.data]);
  const tasks = useMemo(() => (taskQuery.data as RawTask[]) ?? [], [taskQuery.data]);
  const timesheets = useMemo(() => (timesheetQuery.data as RawTimesheet[]) ?? [], [timesheetQuery.data]);

  const loading = projectQuery.isLoading || taskQuery.isLoading || timesheetQuery.isLoading;
  const errored = projectQuery.isError && taskQuery.isError && timesheetQuery.isError;

  // ── KPIs ──────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const active = projects.filter((p) => p.status === "Open" || p.status === "Working").length;
    const today = new Date();
    const overdueTasks = tasks.filter((t) => {
      if (t.status === "Completed" || t.status === "Cancelled") return false;
      if (!t.exp_end_date) return false;
      return new Date(t.exp_end_date) < today;
    }).length;
    const hoursMtd = timesheets.filter((ts) => isMtd(ts.start_date)).reduce((s, ts) => s + (ts.total_hours ?? 0), 0);
    const totalEstimated = projects.reduce((s, p) => s + (p.estimated_costing ?? 0), 0);
    const totalActual = projects.reduce((s, p) => s + (p.total_costing_amount ?? 0), 0);
    const budgetUtilization = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;
    return { active, overdueTasks, hoursMtd, budgetUtilization };
  }, [projects, tasks, timesheets]);

  // ── Projects by status ────────────────────────────────────────────
  const statusData = useMemo(() => {
    const byStatus: Record<string, number> = {};
    projects.forEach((p) => {
      const s = p.status || "Open";
      byStatus[s] = (byStatus[s] ?? 0) + 1;
    });
    return Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  }, [projects]);

  // ── Hours per team member ─────────────────────────────────────────
  const hoursByMember = useMemo(() => {
    const byMember: Record<string, number> = {};
    timesheets.forEach((ts) => {
      const member = ts.employee_name || ts.employee || "Unassigned";
      byMember[member] = (byMember[member] ?? 0) + (ts.total_hours ?? 0);
    });
    return Object.entries(byMember)
      .map(([member, hours]) => ({ member, hours }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 8);
  }, [timesheets]);

  // ── Upcoming deadlines (active tasks) ─────────────────────────────
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    return tasks
      .filter((t) => {
        if (t.status === "Completed" || t.status === "Cancelled") return false;
        if (!t.exp_end_date) return false;
        const due = new Date(t.exp_end_date);
        const diff = (due.getTime() - today.getTime()) / 86_400_000;
        return diff >= -2 && diff <= 14;
      })
      .sort((a, b) => (a.exp_end_date ?? "").localeCompare(b.exp_end_date ?? ""))
      .slice(0, 8);
  }, [tasks]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Project Tracker</h1>
        <p className="text-sm text-muted-foreground">Active projects, overdue tasks, hours, and budget burn.</p>
      </div>

      {errored && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Could not reach the ERP backend. Showing zero values until the connection is restored.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active Projects" value={kpis.active} icon={Briefcase} format="number" />
        <KpiCard label="Overdue Tasks" value={kpis.overdueTasks} icon={AlertCircle} format="number" />
        <KpiCard label="Hours Logged (MTD)" value={kpis.hoursMtd} icon={Clock} format="number" />
        <KpiCard label="Budget Utilization" value={kpis.budgetUtilization} icon={Coins} format="percent" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Projects by Status</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Live distribution</p>
            {statusData.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No projects yet.</p>
            ) : (
              <div className="mt-4 h-64 min-h-[256px] w-full">
                <LazyResponsiveContainer width="100%" height={256}>
                  <LazyPieChart>
                    <LazyPie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {statusData.map((_, i) => (
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
            <p className="text-xl font-semibold text-foreground font-display">Hours per Team Member</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Total timesheet hours</p>
            {hoursByMember.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No timesheets logged yet.</p>
            ) : (
              <div className="mt-4 h-64 min-h-[256px] w-full">
                <LazyResponsiveContainer width="100%" height={256}>
                  <LazyBarChart
                    data={hoursByMember}
                    layout="vertical"
                    margin={{ top: 5, right: 12, left: 80, bottom: 0 }}
                  >
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <LazyXAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    />
                    <LazyYAxis
                      type="category"
                      dataKey="member"
                      width={80}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    />
                    <LazyTooltip
                      formatter={(value) => [`${Number(value ?? 0)} hrs`, "Hours"]}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.375rem",
                      }}
                    />
                    <LazyBar dataKey="hours" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </LazyBarChart>
                </LazyResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-foreground font-display">Upcoming Deadlines</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Tasks due in the next 14 days</p>
          {upcomingDeadlines.length === 0 ? (
            <p className="mt-8 text-sm text-success">No deadlines coming up. Nice work.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Task</th>
                    <th className="py-2 pr-3 font-medium">Project</th>
                    <th className="py-2 pr-3 font-medium">Priority</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 text-right font-medium">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingDeadlines.map((t) => (
                    <tr key={t.name} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-foreground truncate max-w-[200px]">
                        {t.subject ?? t.name ?? "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground truncate max-w-[160px]">{t.project ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <Badge variant={t.priority === "Urgent" || t.priority === "High" ? "destructive" : "secondary"}>
                          {t.priority ?? "Medium"}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{t.status ?? "—"}</td>
                      <td className="py-2.5 text-right tabular-nums text-foreground">{t.exp_end_date ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {projects.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Tracking {projects.length} project{projects.length === 1 ? "" : "s"} • Total budget{" "}
          {formatCurrency(
            projects.reduce((s, p) => s + (p.estimated_costing ?? 0), 0),
            "USD",
          )}
        </p>
      )}
    </div>
  );
}
