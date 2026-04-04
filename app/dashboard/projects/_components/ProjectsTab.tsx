"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolderKanban, Pencil, Trash2, Download } from "lucide-react";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToasts } from "@/components/ui/Toasts";
import { formatDate } from "@/lib/locale/date";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import { useErpList } from "@/lib/queries/useErpList";
import type { ProjectRow } from "./types";
import { mapErpProject, PROJECT_STATUS_VARIANT, PROJECT_STATUSES } from "./utils";

/* ------------------------------------------------------------------ */
/*  Column builder                                                     */
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProjectsTab() {
  const router = useRouter();
  const { addToast } = useToasts();

  const [projectPage, setProjectPage] = useState(0);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectStatus, setProjectStatus] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: rawProjects = [],
    hasMore: projectsHasMore,
    page: projectsCurrentPage,
    isLoading: projectsLoading,
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

  const projects = useMemo(() => (rawProjects as Record<string, unknown>[]).map(mapErpProject), [rawProjects]);

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (projectStatus !== "All") result = result.filter((r) => r.status === projectStatus);
    if (projectSearch) {
      const q = projectSearch.toLowerCase();
      result = result.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    return result;
  }, [projects, projectStatus, projectSearch]);

  const projectColumns = useMemo(
    () =>
      buildProjectColumns(
        (row) => router.push(`/dashboard/projects/${encodeURIComponent(row.id)}`),
        (row) => setDeleteTarget(row),
      ),
    [router],
  );

  const handleExport = useCallback(() => {
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
  }, [filteredProjects]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Project", deleteTarget.id);
      addToast(`${deleteTarget.id} deleted`, "success");
      setDeleteTarget(null);
      refetchProjects();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, refetchProjects]);

  return (
    <>
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
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.projectName ?? "project"}?`}
        description="This action cannot be undone. The project and its associated data will be permanently removed."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </>
  );
}
