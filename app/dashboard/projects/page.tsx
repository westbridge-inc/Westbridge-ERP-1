"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FolderKanban, ListChecks, Clock, Download, Trash2, Pencil } from "lucide-react";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToasts } from "@/components/ui/Toasts";
import { formatDate } from "@/lib/locale/date";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import { useErpList } from "@/lib/queries/useErpList";
import dynamic from "next/dynamic";

const AIChatPanel = dynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ProjectRow {
  id: string;
  projectName: string;
  status: string;
  percentComplete: number;
  expectedStartDate: string;
  expectedEndDate: string;
  company: string;
}

interface TaskRow {
  id: string;
  subject: string;
  project: string;
  assignedTo: string;
  priority: string;
  expEndDate: string;
  status: string;
}

interface TimesheetRow {
  id: string;
  employeeName: string;
  project: string;
  totalHours: number;
  startDate: string;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

function mapErpProject(r: Record<string, unknown>): ProjectRow {
  return {
    id: String(r.name ?? ""),
    projectName: String(r.project_name ?? r.name ?? ""),
    status: String(r.status ?? "Open").trim(),
    percentComplete: Number(r.percent_complete ?? 0),
    expectedStartDate: String(r.expected_start_date ?? ""),
    expectedEndDate: String(r.expected_end_date ?? ""),
    company: String(r.company ?? ""),
  };
}

function mapErpTask(r: Record<string, unknown>): TaskRow {
  let assigned = "";
  if (r._assign) {
    try {
      const parsed = typeof r._assign === "string" ? JSON.parse(r._assign) : r._assign;
      if (Array.isArray(parsed) && parsed.length > 0) assigned = String(parsed[0]);
    } catch {
      assigned = String(r._assign ?? "");
    }
  }
  return {
    id: String(r.name ?? ""),
    subject: String(r.subject ?? ""),
    project: String(r.project ?? ""),
    assignedTo: assigned,
    priority: String(r.priority ?? "Medium"),
    expEndDate: String(r.exp_end_date ?? ""),
    status: String(r.status ?? "Open").trim(),
  };
}

function mapErpTimesheet(r: Record<string, unknown>): TimesheetRow {
  return {
    id: String(r.name ?? ""),
    employeeName: String(r.employee_name ?? ""),
    project: String(r.project ?? r.parent_project ?? ""),
    totalHours: Number(r.total_hours ?? 0),
    startDate: String(r.start_date ?? ""),
    status: String(r.status ?? "Draft").trim(),
  };
}

/* ------------------------------------------------------------------ */
/*  Stat helpers                                                       */
/* ------------------------------------------------------------------ */

interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

function deriveProjectStats(projects: ProjectRow[]): ProjectStats {
  const now = new Date();
  let active = 0;
  let completed = 0;
  let overdue = 0;
  for (const p of projects) {
    if (p.status === "Completed") completed++;
    else if (p.status === "Open" || p.status === "Working") {
      active++;
      if (p.expectedEndDate && new Date(p.expectedEndDate) < now) overdue++;
    }
  }
  return { total: projects.length, active, completed, overdue };
}

/* ------------------------------------------------------------------ */
/*  Status badge helpers                                               */
/* ------------------------------------------------------------------ */

type BadgeVariant = "default" | "destructive" | "outline" | "success" | "warning";

const PROJECT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  Open: "outline",
  Working: "default",
  Completed: "success",
  Cancelled: "destructive",
  Overdue: "destructive",
};

const TASK_STATUS_VARIANT: Record<string, BadgeVariant> = {
  Open: "outline",
  Working: "default",
  Completed: "success",
  Cancelled: "destructive",
  Overdue: "destructive",
};

const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  Urgent: "destructive",
  High: "destructive",
  Medium: "warning",
  Low: "outline",
};

/* ------------------------------------------------------------------ */
/*  Project columns                                                    */
/* ------------------------------------------------------------------ */

function buildProjectColumns(
  onEdit: (row: ProjectRow) => void,
  onDelete: (row: ProjectRow) => void,
): Column<ProjectRow>[] {
  return [
    {
      id: "projectName",
      header: "Project Name",
      accessor: (row) => (
        <Link
          href={`/dashboard/projects/${encodeURIComponent(row.id)}`}
          className="font-medium text-foreground hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.projectName}
        </Link>
      ),
      sortValue: (row) => row.projectName,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <Badge variant={PROJECT_STATUS_VARIANT[row.status] ?? "default"}>{row.status}</Badge>,
      sortValue: (row) => row.status,
      width: "120px",
    },
    {
      id: "progress",
      header: "Progress",
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
            <div
              className="h-2 bg-foreground rounded-full transition-all"
              style={{ width: `${Math.min(row.percentComplete, 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{row.percentComplete}%</span>
        </div>
      ),
      sortValue: (row) => row.percentComplete,
      width: "180px",
    },
    {
      id: "startDate",
      header: "Start Date",
      accessor: (row) => (
        <span className="text-muted-foreground">
          {row.expectedStartDate ? formatDate(row.expectedStartDate) : "\u2014"}
        </span>
      ),
      sortValue: (row) => row.expectedStartDate || "",
      width: "120px",
    },
    {
      id: "endDate",
      header: "End Date",
      accessor: (row) => (
        <span className="text-muted-foreground">
          {row.expectedEndDate ? formatDate(row.expectedEndDate) : "\u2014"}
        </span>
      ),
      sortValue: (row) => row.expectedEndDate || "",
      width: "120px",
    },
    {
      id: "company",
      header: "Company",
      accessor: (row) => <span className="text-muted-foreground">{row.company || "\u2014"}</span>,
      sortValue: (row) => row.company,
    },
    {
      id: "actions",
      header: "",
      width: "80px",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={`Edit ${row.projectName}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Delete ${row.projectName}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Task columns                                                       */
/* ------------------------------------------------------------------ */

function buildTaskColumns(onEdit: (row: TaskRow) => void, onDelete: (row: TaskRow) => void): Column<TaskRow>[] {
  const now = new Date();
  return [
    {
      id: "subject",
      header: "Subject",
      accessor: (row) => (
        <Link
          href={`/dashboard/projects/${encodeURIComponent(row.id)}`}
          className="font-medium text-foreground hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {row.subject}
        </Link>
      ),
      sortValue: (row) => row.subject,
    },
    {
      id: "project",
      header: "Project",
      accessor: (row) => <span className="text-muted-foreground">{row.project || "\u2014"}</span>,
      sortValue: (row) => row.project,
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      accessor: (row) => <span className="text-muted-foreground">{row.assignedTo || "\u2014"}</span>,
      sortValue: (row) => row.assignedTo,
    },
    {
      id: "priority",
      header: "Priority",
      accessor: (row) => <Badge variant={PRIORITY_VARIANT[row.priority] ?? "outline"}>{row.priority}</Badge>,
      sortValue: (row) => row.priority,
      width: "100px",
    },
    {
      id: "expEndDate",
      header: "Due Date",
      accessor: (row) => {
        const overdue =
          row.expEndDate && row.status !== "Completed" && row.status !== "Cancelled" && new Date(row.expEndDate) < now;
        return (
          <span className={overdue ? "text-destructive font-medium" : "text-muted-foreground"}>
            {row.expEndDate ? formatDate(row.expEndDate) : "\u2014"}
          </span>
        );
      },
      sortValue: (row) => row.expEndDate || "",
      width: "120px",
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <Badge variant={TASK_STATUS_VARIANT[row.status] ?? "default"}>{row.status}</Badge>,
      sortValue: (row) => row.status,
      width: "120px",
    },
    {
      id: "actions",
      header: "",
      width: "80px",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={`Edit ${row.subject}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Delete ${row.subject}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Timesheet columns                                                  */
/* ------------------------------------------------------------------ */

function buildTimesheetColumns(
  onEdit: (row: TimesheetRow) => void,
  onDelete: (row: TimesheetRow) => void,
): Column<TimesheetRow>[] {
  return [
    {
      id: "employeeName",
      header: "Employee",
      accessor: (row) => <span className="font-medium text-foreground">{row.employeeName || "\u2014"}</span>,
      sortValue: (row) => row.employeeName,
    },
    {
      id: "project",
      header: "Project",
      accessor: (row) => <span className="text-muted-foreground">{row.project || "\u2014"}</span>,
      sortValue: (row) => row.project,
    },
    {
      id: "totalHours",
      header: "Total Hours",
      accessor: (row) => <span className="tabular-nums">{row.totalHours.toFixed(1)}</span>,
      sortValue: (row) => row.totalHours,
      align: "right",
      width: "120px",
    },
    {
      id: "startDate",
      header: "Date",
      accessor: (row) => (
        <span className="text-muted-foreground">{row.startDate ? formatDate(row.startDate) : "\u2014"}</span>
      ),
      sortValue: (row) => row.startDate || "",
      width: "120px",
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <Badge status={row.status}>{row.status}</Badge>,
      sortValue: (row) => row.status,
      width: "120px",
    },
    {
      id: "actions",
      header: "",
      width: "80px",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row);
            }}
            className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={`Edit ${row.id}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row);
            }}
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Delete ${row.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Filters                                                            */
/* ------------------------------------------------------------------ */

const PROJECT_STATUSES = ["All", "Open", "Working", "Completed", "Cancelled"] as const;
const TASK_STATUSES = ["All", "Open", "Working", "Completed", "Cancelled", "Overdue"] as const;
const TASK_PRIORITIES = ["All", "Urgent", "High", "Medium", "Low"] as const;

type TabValue = "projects" | "tasks" | "timesheets";

/* ------------------------------------------------------------------ */
/*  Inner page component                                               */
/* ------------------------------------------------------------------ */

function ProjectsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToasts();

  const view = (searchParams.get("view") ?? "projects") as TabValue;

  /* ---- Projects state ---- */
  const [projectPage, setProjectPage] = useState(0);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatus, setProjectStatus] = useState("All");
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<ProjectRow | null>(null);

  /* ---- Tasks state ---- */
  const [taskPage, setTaskPage] = useState(0);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatus, setTaskStatus] = useState("All");
  const [taskPriority, setTaskPriority] = useState("All");
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<TaskRow | null>(null);

  /* ---- Timesheets state ---- */
  const [tsPage, setTsPage] = useState(0);
  const [tsSearch, setTsSearch] = useState("");
  const [deleteTimesheetTarget, setDeleteTimesheetTarget] = useState<TimesheetRow | null>(null);

  const [deleting, setDeleting] = useState(false);

  /* ---- Data fetching ---- */
  const {
    data: rawProjects = [],
    hasMore: projectsHasMore,
    page: projectsCurrentPage,
    isLoading: projectsLoading,
    isError: projectsIsError,
    error: projectsError,
    refetch: refetchProjects,
  } = useErpList("Project", {
    page: projectPage,
    fields: [
      "name",
      "project_name",
      "status",
      "percent_complete",
      "expected_start_date",
      "expected_end_date",
      "company",
    ],
  });

  const {
    data: rawTasks = [],
    hasMore: tasksHasMore,
    page: tasksCurrentPage,
    isLoading: tasksLoading,
    isError: tasksIsError,
    error: tasksError,
    refetch: refetchTasks,
  } = useErpList("Task", {
    page: taskPage,
    fields: ["name", "subject", "project", "_assign", "priority", "exp_end_date", "status"],
  });

  const {
    data: rawTimesheets = [],
    hasMore: tsHasMore,
    page: tsCurrentPage,
    isLoading: tsLoading,
    isError: tsIsError,
    error: tsError,
    refetch: refetchTimesheets,
  } = useErpList("Timesheet", {
    page: tsPage,
    fields: ["name", "employee_name", "project", "parent_project", "total_hours", "start_date", "status"],
  });

  /* ---- Map data ---- */
  const projects = useMemo(() => (rawProjects as Record<string, unknown>[]).map(mapErpProject), [rawProjects]);
  const tasks = useMemo(() => (rawTasks as Record<string, unknown>[]).map(mapErpTask), [rawTasks]);
  const timesheets = useMemo(() => (rawTimesheets as Record<string, unknown>[]).map(mapErpTimesheet), [rawTimesheets]);

  /* ---- Stats ---- */
  const stats = useMemo(() => deriveProjectStats(projects), [projects]);

  /* ---- Filtered data ---- */
  const filteredProjects = useMemo(() => {
    let result = projects;
    if (projectStatus !== "All") result = result.filter((r) => r.status === projectStatus);
    if (projectSearch) {
      const q = projectSearch.toLowerCase();
      result = result.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    return result;
  }, [projects, projectStatus, projectSearch]);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (taskStatus !== "All") result = result.filter((r) => r.status === taskStatus);
    if (taskPriority !== "All") result = result.filter((r) => r.priority === taskPriority);
    if (taskSearch) {
      const q = taskSearch.toLowerCase();
      result = result.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    return result;
  }, [tasks, taskStatus, taskPriority, taskSearch]);

  const filteredTimesheets = useMemo(() => {
    let result = timesheets;
    if (tsSearch) {
      const q = tsSearch.toLowerCase();
      result = result.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    return result;
  }, [timesheets, tsSearch]);

  /* ---- Columns (memoized with actions) ---- */
  const projectColumns = useMemo(
    () =>
      buildProjectColumns(
        (row) => router.push(`/dashboard/projects/${encodeURIComponent(row.id)}`),
        (row) => setDeleteProjectTarget(row),
      ),
    [router],
  );

  const taskColumns = useMemo(
    () =>
      buildTaskColumns(
        (row) => router.push(`/dashboard/projects/${encodeURIComponent(row.id)}`),
        (row) => setDeleteTaskTarget(row),
      ),
    [router],
  );

  const timesheetColumns = useMemo(
    () =>
      buildTimesheetColumns(
        (row) => router.push(`/dashboard/projects/${encodeURIComponent(row.id)}`),
        (row) => setDeleteTimesheetTarget(row),
      ),
    [router],
  );

  /* ---- Delete handlers ---- */
  const handleDeleteProject = useCallback(async () => {
    if (!deleteProjectTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Project", deleteProjectTarget.id);
      addToast(`${deleteProjectTarget.id} deleted`, "success");
      setDeleteProjectTarget(null);
      refetchProjects();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteProjectTarget, addToast, refetchProjects]);

  const handleDeleteTask = useCallback(async () => {
    if (!deleteTaskTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Task", deleteTaskTarget.id);
      addToast(`${deleteTaskTarget.id} deleted`, "success");
      setDeleteTaskTarget(null);
      refetchTasks();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTaskTarget, addToast, refetchTasks]);

  const handleDeleteTimesheet = useCallback(async () => {
    if (!deleteTimesheetTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Timesheet", deleteTimesheetTarget.id);
      addToast(`${deleteTimesheetTarget.id} deleted`, "success");
      setDeleteTimesheetTarget(null);
      refetchTimesheets();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTimesheetTarget, addToast, refetchTimesheets]);

  /* ---- Export ---- */
  const handleExport = useCallback(() => {
    if (view === "tasks") {
      downloadCsv(
        filteredTasks as unknown as Record<string, unknown>[],
        [
          { key: "id", label: "ID" },
          { key: "subject", label: "Subject" },
          { key: "project", label: "Project" },
          { key: "assignedTo", label: "Assigned To" },
          { key: "priority", label: "Priority" },
          { key: "expEndDate", label: "Due Date" },
          { key: "status", label: "Status" },
        ],
        "tasks",
      );
    } else if (view === "timesheets") {
      downloadCsv(
        filteredTimesheets as unknown as Record<string, unknown>[],
        [
          { key: "id", label: "ID" },
          { key: "employeeName", label: "Employee" },
          { key: "project", label: "Project" },
          { key: "totalHours", label: "Total Hours" },
          { key: "startDate", label: "Date" },
          { key: "status", label: "Status" },
        ],
        "timesheets",
      );
    } else {
      downloadCsv(
        filteredProjects as unknown as Record<string, unknown>[],
        [
          { key: "id", label: "Project ID" },
          { key: "projectName", label: "Name" },
          { key: "status", label: "Status" },
          { key: "percentComplete", label: "Progress (%)" },
          { key: "expectedStartDate", label: "Start Date" },
          { key: "expectedEndDate", label: "End Date" },
          { key: "company", label: "Company" },
        ],
        "projects",
      );
    }
  }, [view, filteredProjects, filteredTasks, filteredTimesheets]);

  /* ---- Tab change ---- */
  const handleTabChange = useCallback(
    (value: string) => {
      router.push(`/dashboard/projects?view=${value}`);
    },
    [router],
  );

  /* ---- CTA per tab ---- */
  const ctaLabel = view === "tasks" ? "Add Task" : view === "timesheets" ? "Log Time" : "Create Project";
  const ctaHref = "/dashboard/projects/new";

  /* ---- Error state ---- */
  const currentError =
    view === "projects"
      ? projectsIsError
        ? projectsError instanceof Error
          ? projectsError.message
          : "Failed to load projects."
        : null
      : view === "tasks"
        ? tasksIsError
          ? tasksError instanceof Error
            ? tasksError.message
            : "Failed to load tasks."
          : null
        : tsIsError
          ? tsError instanceof Error
            ? tsError.message
            : "Failed to load timesheets."
          : null;

  const currentLoading = view === "projects" ? projectsLoading : view === "tasks" ? tasksLoading : tsLoading;
  const currentRefetch = view === "projects" ? refetchProjects : view === "tasks" ? refetchTasks : refetchTimesheets;

  /* ---- Header ---- */
  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Projects</h1>
        <p className="text-sm text-muted-foreground">Manage and track project progress.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
        <Button variant="primary" onClick={() => router.push(ctaHref)}>
          + {ctaLabel}
        </Button>
      </div>
    </div>
  );

  /* ---- Error rendering ---- */
  if (currentError) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              <FolderKanban className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Could not load data right now</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up. You can retry or create your first record.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => currentRefetch()}>
                Retry
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push(ctaHref)}>
                + {ctaLabel}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Loading rendering ---- */
  if (currentLoading) {
    return (
      <div className="space-y-6">
        {header}
        {view === "projects" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-h-[88px] rounded-xl border border-border bg-card p-6 animate-pulse" />
            ))}
          </div>
        )}
        <Card>
          <CardContent className="p-0">
            <SkeletonTable rows={8} columns={view === "timesheets" ? 6 : 7} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      {/* Metrics (projects tab only) */}
      {view === "projects" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Projects" value={stats.total} />
          <MetricCard label="Active" value={stats.active} subtextVariant="success" />
          <MetricCard label="Completed" value={stats.completed} subtextVariant="success" />
          <MetricCard label="Overdue" value={stats.overdue} subtextVariant="error" />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={view} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="projects">
            <FolderKanban className="h-4 w-4 mr-1.5" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListChecks className="h-4 w-4 mr-1.5" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="timesheets">
            <Clock className="h-4 w-4 mr-1.5" />
            Timesheets
          </TabsTrigger>
        </TabsList>

        {/* ---------- Projects Tab ---------- */}
        <TabsContent value="projects">
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="w-80"
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                />
                <Select value={projectStatus} onValueChange={setProjectStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DataTable<ProjectRow>
                columns={projectColumns}
                data={filteredProjects}
                keyExtractor={(r) => r.id}
                onRowClick={(record) => router.push(`/dashboard/projects/${encodeURIComponent(record.id)}`)}
                emptyState={
                  <EmptyState
                    icon={<FolderKanban className="h-6 w-6" />}
                    title={MODULE_EMPTY_STATES.projects.title}
                    description={MODULE_EMPTY_STATES.projects.description}
                    actionLabel={MODULE_EMPTY_STATES.projects.actionLabel}
                    actionHref={MODULE_EMPTY_STATES.projects.actionLink}
                    supportLine={EMPTY_STATE_SUPPORT_LINE}
                  />
                }
                pageSize={20}
              />
              <div className="flex items-center justify-between border-t border-border px-4 py-2">
                <span className="text-sm text-muted-foreground">Page {projectsCurrentPage + 1}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={projectsCurrentPage === 0}
                    onClick={() => setProjectPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!projectsHasMore}
                    onClick={() => setProjectPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Tasks Tab ---------- */}
        <TabsContent value="tasks">
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  className="w-80"
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                />
                <Select value={taskStatus} onValueChange={setTaskStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DataTable<TaskRow>
                columns={taskColumns}
                data={filteredTasks}
                keyExtractor={(r) => r.id}
                onRowClick={(record) => router.push(`/dashboard/projects/${encodeURIComponent(record.id)}`)}
                emptyState={
                  <EmptyState
                    icon={<ListChecks className="h-6 w-6" />}
                    title="No tasks yet"
                    description="Create tasks to track work items across your projects."
                    actionLabel="Add Task"
                    actionHref="/dashboard/projects/new"
                    supportLine={EMPTY_STATE_SUPPORT_LINE}
                  />
                }
                pageSize={20}
              />
              <div className="flex items-center justify-between border-t border-border px-4 py-2">
                <span className="text-sm text-muted-foreground">Page {tasksCurrentPage + 1}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={tasksCurrentPage === 0}
                    onClick={() => setTaskPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!tasksHasMore}
                    onClick={() => setTaskPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------- Timesheets Tab ---------- */}
        <TabsContent value="timesheets">
          <Card>
            <CardContent className="p-0">
              <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                <Input
                  type="search"
                  placeholder="Search timesheets..."
                  className="w-80"
                  value={tsSearch}
                  onChange={(e) => setTsSearch(e.target.value)}
                />
              </div>
              <DataTable<TimesheetRow>
                columns={timesheetColumns}
                data={filteredTimesheets}
                keyExtractor={(r) => r.id}
                onRowClick={(record) => router.push(`/dashboard/projects/${encodeURIComponent(record.id)}`)}
                emptyState={
                  <EmptyState
                    icon={<Clock className="h-6 w-6" />}
                    title="No timesheets yet"
                    description="Log time against projects to track effort and billable hours."
                    actionLabel="Log Time"
                    actionHref="/dashboard/projects/new"
                    supportLine={EMPTY_STATE_SUPPORT_LINE}
                  />
                }
                pageSize={20}
              />
              <div className="flex items-center justify-between border-t border-border px-4 py-2">
                <span className="text-sm text-muted-foreground">Page {tsCurrentPage + 1}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={tsCurrentPage === 0}
                    onClick={() => setTsPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={!tsHasMore} onClick={() => setTsPage((p) => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!deleteProjectTarget}
        onClose={() => setDeleteProjectTarget(null)}
        onConfirm={handleDeleteProject}
        title={`Delete ${deleteProjectTarget?.projectName ?? "project"}?`}
        description="This action cannot be undone. The project and its associated data will be permanently removed."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
      <ConfirmDialog
        open={!!deleteTaskTarget}
        onClose={() => setDeleteTaskTarget(null)}
        onConfirm={handleDeleteTask}
        title={`Delete ${deleteTaskTarget?.subject ?? "task"}?`}
        description="This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
      <ConfirmDialog
        open={!!deleteTimesheetTarget}
        onClose={() => setDeleteTimesheetTarget(null)}
        onConfirm={handleDeleteTimesheet}
        title={`Delete ${deleteTimesheetTarget?.id ?? "timesheet"}?`}
        description="This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />

      <AIChatPanel module="general" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Export with Suspense boundary                                      */
/* ------------------------------------------------------------------ */

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading...</div>}
    >
      <ProjectsPageInner />
    </Suspense>
  );
}
