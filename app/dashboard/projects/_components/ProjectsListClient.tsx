"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FolderKanban, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useToasts } from "@/components/ui/Toasts";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { formatDate } from "@/lib/locale/date";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import { AIChatPanel } from "@/components/ai/AIChatPanel";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ProjectRow = {
  name: string;
  projectName: string;
  status: string;
  percentComplete: number;
  expectedStartDate: string;
  expectedEndDate: string;
  company: string;
};

/* ------------------------------------------------------------------ */
/*  Table columns                                                      */
/* ------------------------------------------------------------------ */

const projectColumns: Column<ProjectRow>[] = [
  {
    id: "name",
    header: "Project ID",
    accessor: (row) => <span className="font-medium text-foreground">{row.name}</span>,
    sortValue: (row) => row.name,
    width: "160px",
  },
  {
    id: "projectName",
    header: "Name",
    accessor: (row) => row.projectName,
    sortValue: (row) => row.projectName,
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => <Badge status={row.status}>{row.status}</Badge>,
    sortValue: (row) => row.status,
    width: "120px",
  },
  {
    id: "percentComplete",
    header: "Progress (%)",
    accessor: (row) => <span className="text-muted-foreground">{row.percentComplete}%</span>,
    sortValue: (row) => row.percentComplete,
    align: "right",
    width: "120px",
  },
  {
    id: "startDate",
    header: "Start Date",
    accessor: (row) => (row.expectedStartDate ? formatDate(row.expectedStartDate) : "\u2014"),
    sortValue: (row) => row.expectedStartDate || "",
    width: "120px",
  },
  {
    id: "endDate",
    header: "End Date",
    accessor: (row) => (row.expectedEndDate ? formatDate(row.expectedEndDate) : "\u2014"),
    sortValue: (row) => row.expectedEndDate || "",
    width: "120px",
  },
];

/* ------------------------------------------------------------------ */
/*  Metric card                                                        */
/* ------------------------------------------------------------------ */

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex-1 rounded-xl border border-border/70 bg-card px-6 py-5 transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-muted-foreground tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight font-display text-foreground">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status filter tabs                                                 */
/* ------------------------------------------------------------------ */

const STATUS_FILTERS = ["All", "Open", "Completed", "Cancelled"] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ProjectsListClientProps {
  rows: ProjectRow[];
  currentPage: number;
  hasMore: boolean;
}

export function ProjectsListClient({ rows, currentPage, hasMore }: ProjectsListClientProps) {
  const router = useRouter();
  const { addToast } = useToasts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openCount = useMemo(() => rows.filter((r) => r.status === "Open").length, [rows]);
  const completedCount = useMemo(() => rows.filter((r) => r.status === "Completed").length, [rows]);

  const filtered = useMemo(() => {
    let result = rows;
    if (statusFilter !== "All") {
      result = result.filter((row) => row.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
    }
    return result;
  }, [rows, search, statusFilter]);

  const columns = useMemo(
    (): Column<ProjectRow>[] => [
      ...projectColumns,
      {
        id: "actions",
        header: "",
        width: "48px",
        accessor: (row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Delete ${row.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Project", deleteTarget.name);
      addToast(`${deleteTarget.name} deleted`, "success");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, router]);

  const handleExport = useCallback(() => {
    downloadCsv(
      filtered as unknown as Record<string, unknown>[],
      [
        { key: "name", label: "Project ID" },
        { key: "projectName", label: "Name" },
        { key: "status", label: "Status" },
        { key: "percentComplete", label: "Progress (%)" },
        { key: "expectedStartDate", label: "Start Date" },
        { key: "expectedEndDate", label: "End Date" },
        { key: "company", label: "Company" },
      ],
      "projects",
    );
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage projects and track progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => router.push("/dashboard/projects/new")}>
            + New Project
          </Button>
        </div>
      </div>
      <div className="flex gap-6">
        <MetricCard label="Total projects" value={rows.length} />
        <MetricCard label="Open" value={openCount} />
        <MetricCard label="Completed" value={completedCount} />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <Input
              type="search"
              placeholder="Search projects..."
              className="w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-1">
              {STATUS_FILTERS.map((s) => (
                <Button
                  key={s}
                  variant={statusFilter === s ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setStatusFilter(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
          <DataTable<ProjectRow>
            columns={columns}
            data={filtered}
            keyExtractor={(row) => row.name}
            onRowClick={(record) => router.push(`/dashboard/projects/${encodeURIComponent(record.name)}`)}
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
            <span className="text-sm text-muted-foreground">Page {currentPage + 1}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => router.push("?page=" + (currentPage - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => router.push("?page=" + (currentPage + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.name ?? "record"}?`}
        description="This action cannot be undone. The project and its associated data will be permanently removed."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />

      <AIChatPanel module="general" />
    </div>
  );
}
