"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useErpList } from "@/lib/queries/useErpList";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import { api } from "@/lib/api/client";
import { useToasts } from "@/components/ui/Toasts";
import { mapErpProject, PROJECT_STATUS_VARIANT, PROJECT_STATUSES } from "./utils";
import type { ProjectRow } from "./types";

export function ProjectsTab() {
  const { addToast } = useToasts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, error, refetch } = useErpList("Project", {
    fields: [
      "name",
      "project_name",
      "status",
      "percent_complete",
      "expected_start_date",
      "expected_end_date",
      "company",
    ],
    orderBy: "creation desc",
    limit: 20,
  });

  const projects = (data as Record<string, unknown>[]).map(mapErpProject);

  const filtered = projects.filter((p) => {
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (
      search &&
      !p.projectName.toLowerCase().includes(search.toLowerCase()) &&
      !p.company.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.erp.delete("Project", deleteId);
      addToast("Project deleted", "success");
      setDeleteId(null);
      refetch();
    } catch {
      addToast("Failed to delete project", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteId, addToast, refetch]);

  const columns: Column<ProjectRow>[] = [
    {
      id: "projectName",
      header: "Project Name",
      accessor: (r) => (
        <Link
          href={`/dashboard/projects/${encodeURIComponent(r.id)}`}
          className="font-medium text-primary hover:underline"
        >
          {r.projectName}
        </Link>
      ),
      sortValue: (r) => r.projectName,
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => (
        <Badge variant={PROJECT_STATUS_VARIANT[r.status] ?? "outline"}>
          {r.status}
        </Badge>
      ),
    },
    {
      id: "progress",
      header: "Progress",
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-24 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(r.percentComplete, 100)}%` }}
            />
          </div>
          <span className="tabular-nums text-xs text-muted-foreground">
            {Math.round(r.percentComplete)}%
          </span>
        </div>
      ),
      sortValue: (r) => r.percentComplete,
    },
    {
      id: "startDate",
      header: "Start Date",
      accessor: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {r.expectedStartDate || "\u2014"}
        </span>
      ),
      sortValue: (r) => r.expectedStartDate,
    },
    {
      id: "endDate",
      header: "End Date",
      accessor: (r) => (
        <span className="tabular-nums text-muted-foreground">
          {r.expectedEndDate || "\u2014"}
        </span>
      ),
      sortValue: (r) => r.expectedEndDate,
    },
    {
      id: "company",
      header: "Company",
      accessor: (r) => r.company || "\u2014",
      sortValue: (r) => r.company,
    },
    {
      id: "actions",
      header: "",
      accessor: (r) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteId(r.id)}
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <SkeletonTable rows={8} columns={7} />;
  if (error) return <ErrorState message="Failed to load projects" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
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
        <div className="flex-1" />
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="h-4 w-4 mr-1.5" /> Create Project
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking progress."
          actionLabel="Create Project"
          actionHref="/dashboard/projects/new"
        />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          keyExtractor={(r) => r.id}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
        title="Delete project?"
        description="This action cannot be undone."
      />
    </div>
  );
}
