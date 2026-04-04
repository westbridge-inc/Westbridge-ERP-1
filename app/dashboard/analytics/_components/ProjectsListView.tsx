"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, CheckSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { useErpList } from "@/lib/queries/useErpList";
import nextDynamic from "next/dynamic";
import type { GenericRow } from "./types";

const AIChatPanel = nextDynamic(
  () => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })),
  { ssr: false },
);

/* ------------------------------------------------------------------ */
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

function mapProject(d: Record<string, unknown>): GenericRow {
  return {
    id: String(d.name ?? ""),
    projectName: String(d.project_name ?? d.name ?? ""),
    status: String(d.status ?? "Open"),
    percentComplete: Number(d.percent_complete ?? 0),
    expectedEndDate: String(d.expected_end_date ?? ""),
    company: String(d.company ?? "\u2014"),
  };
}

function mapTask(d: Record<string, unknown>): GenericRow {
  return {
    id: String(d.name ?? ""),
    subject: String(d.subject ?? d.name ?? ""),
    project: String(d.project ?? "\u2014"),
    status: String(d.status ?? "Open"),
    priority: String(d.priority ?? "Medium"),
    assignedTo: String(d._assign ?? "\u2014"),
  };
}

function mapTimesheet(d: Record<string, unknown>): GenericRow {
  return {
    id: String(d.name ?? ""),
    employee: String(d.employee_name ?? d.employee ?? "\u2014"),
    totalHours: Number(d.total_hours ?? 0),
    startDate: String(d.start_date ?? ""),
    endDate: String(d.end_date ?? ""),
    status: String(d.docstatus === 1 ? "Submitted" : d.docstatus === 2 ? "Cancelled" : "Draft"),
  };
}

/* ------------------------------------------------------------------ */
/*  Column definitions                                                 */
/* ------------------------------------------------------------------ */

const projectColumns: Column<GenericRow>[] = [
  { id: "id", header: "Project ID", accessor: (r) => <span className="font-medium text-foreground">{r.id as string}</span>, sortValue: (r) => r.id },
  { id: "projectName", header: "Project Name", accessor: (r) => <span className="text-foreground">{r.projectName as string}</span>, sortValue: (r) => r.projectName as string },
  { id: "status", header: "Status", accessor: (r) => <Badge status={r.status as string}>{r.status as string}</Badge>, sortValue: (r) => r.status as string },
  { id: "percentComplete", header: "Progress", align: "right", accessor: (r) => <span className="text-muted-foreground">{r.percentComplete as number}%</span>, sortValue: (r) => r.percentComplete as number },
  { id: "expectedEndDate", header: "End Date", accessor: (r) => <span className="text-muted-foreground/60">{(r.expectedEndDate as string) || "\u2014"}</span>, sortValue: (r) => r.expectedEndDate as string },
];

const taskColumns: Column<GenericRow>[] = [
  { id: "id", header: "Task ID", accessor: (r) => <span className="font-medium text-foreground">{r.id as string}</span>, sortValue: (r) => r.id },
  { id: "subject", header: "Subject", accessor: (r) => <span className="text-foreground">{r.subject as string}</span>, sortValue: (r) => r.subject as string },
  { id: "project", header: "Project", accessor: (r) => <span className="text-muted-foreground">{r.project as string}</span>, sortValue: (r) => r.project as string },
  { id: "status", header: "Status", accessor: (r) => <Badge status={r.status as string}>{r.status as string}</Badge>, sortValue: (r) => r.status as string },
  { id: "priority", header: "Priority", accessor: (r) => <span className="text-muted-foreground">{r.priority as string}</span>, sortValue: (r) => r.priority as string },
];

const timesheetColumns: Column<GenericRow>[] = [
  { id: "id", header: "Timesheet #", accessor: (r) => <span className="font-medium text-foreground">{r.id as string}</span>, sortValue: (r) => r.id },
  { id: "employee", header: "Employee", accessor: (r) => <span className="text-foreground">{r.employee as string}</span>, sortValue: (r) => r.employee as string },
  { id: "totalHours", header: "Hours", align: "right", accessor: (r) => <span className="text-muted-foreground">{(r.totalHours as number).toFixed(1)}</span>, sortValue: (r) => r.totalHours as number },
  { id: "startDate", header: "Start", accessor: (r) => <span className="text-muted-foreground/60">{(r.startDate as string) || "\u2014"}</span>, sortValue: (r) => r.startDate as string },
  { id: "endDate", header: "End", accessor: (r) => <span className="text-muted-foreground/60">{(r.endDate as string) || "\u2014"}</span>, sortValue: (r) => r.endDate as string },
  { id: "status", header: "Status", accessor: (r) => <Badge status={r.status as string}>{r.status as string}</Badge>, sortValue: (r) => r.status as string },
];

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

export const PROJECT_TYPE_CONFIG: Record<
  string,
  {
    doctype: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    columns: Column<GenericRow>[];
    mapper: (d: Record<string, unknown>) => GenericRow;
  }
> = {
  project: { doctype: "Project", title: "Projects", subtitle: "Manage your projects", icon: <FolderKanban className="h-6 w-6" />, columns: projectColumns, mapper: mapProject },
  task: { doctype: "Task", title: "Tasks", subtitle: "Track project tasks", icon: <CheckSquare className="h-6 w-6" />, columns: taskColumns, mapper: mapTask },
  timesheet: { doctype: "Timesheet", title: "Timesheets", subtitle: "Track time spent on projects", icon: <Clock className="h-6 w-6" />, columns: timesheetColumns, mapper: mapTimesheet },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProjectsListView({ type }: { type: string }) {
  const router = useRouter();
  const config = PROJECT_TYPE_CONFIG[type]!;
  const [page, setPage] = useState(0);
  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList(config.doctype, { page });
  const data = useMemo(() => (rawList as Record<string, unknown>[]).map(config.mapper), [rawList, config.mapper]);
  const error =
    queryError instanceof Error ? queryError.message : isError ? `Failed to load ${config.title.toLowerCase()}.` : null;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{config.title}</h1>
            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          </div>
          <Button variant="primary" onClick={() => router.push("/dashboard/analytics/new")}>
            + Create New
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              {config.icon}
            </div>
            <p className="text-sm font-medium text-foreground">Could not load data right now</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up. You can retry or create a new record.
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/analytics/new")}>
                + Create New
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
        </div>
        <Button variant="primary" onClick={() => router.push("/dashboard/analytics/new")}>
          + Create New
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <SkeletonTable rows={6} columns={config.columns.length} />
          ) : (
            <DataTable<GenericRow>
              columns={config.columns}
              data={data}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/analytics/${encodeURIComponent(record.id)}`)}
              emptyState={
                <EmptyState
                  icon={config.icon}
                  title={`No ${config.title.toLowerCase()} yet`}
                  description={`Create your first ${config.title.toLowerCase().replace(/s$/, "")} to get started.`}
                  actionLabel="Create New"
                  actionHref="/dashboard/analytics/new"
                  supportLine={EMPTY_STATE_SUPPORT_LINE}
                />
              }
              pageSize={20}
            />
          )}
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <span className="text-sm text-muted-foreground">Page {currentPage + 1}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <AIChatPanel module="projects" />
    </div>
  );
}
