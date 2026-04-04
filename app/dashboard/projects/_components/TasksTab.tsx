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
import {
  mapErpTask,
  TASK_STATUS_VARIANT,
  PRIORITY_VARIANT,
  TASK_STATUSES,
  TASK_PRIORITIES,
} from "./utils";
import type { TaskRow } from "./types";

export function TasksTab() {
  const { addToast } = useToasts();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, error, refetch } = useErpList("Task", {
    fields: [
      "name",
      "subject",
      "project",
      "_assign",
      "priority",
      "exp_end_date",
      "status",
    ],
    orderBy: "creation desc",
    limit: 20,
  });

  const tasks = (data as Record<string, unknown>[]).map(mapErpTask);

  const filtered = tasks.filter((t) => {
    if (statusFilter !== "All" && t.status !== statusFilter) return false;
    if (priorityFilter !== "All" && t.priority !== priorityFilter) return false;
    if (
      search &&
      !t.subject.toLowerCase().includes(search.toLowerCase()) &&
      !t.project.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.erp.delete("Task", deleteId);
      addToast("Task deleted", "success");
      setDeleteId(null);
      refetch();
    } catch {
      addToast("Failed to delete task", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteId, addToast, refetch]);

  const isOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const columns: Column<TaskRow>[] = [
    {
      id: "subject",
      header: "Subject",
      accessor: (r) => (
        <Link
          href={`/dashboard/projects/tasks/${encodeURIComponent(r.id)}`}
          className="font-medium text-primary hover:underline"
        >
          {r.subject || r.id}
        </Link>
      ),
      sortValue: (r) => r.subject,
    },
    {
      id: "project",
      header: "Project",
      accessor: (r) => r.project || "\u2014",
      sortValue: (r) => r.project,
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      accessor: (r) => r.assignedTo || "\u2014",
      sortValue: (r) => r.assignedTo,
    },
    {
      id: "priority",
      header: "Priority",
      accessor: (r) => (
        <Badge variant={PRIORITY_VARIANT[r.priority] ?? "outline"}>
          {r.priority}
        </Badge>
      ),
    },
    {
      id: "dueDate",
      header: "Due Date",
      accessor: (r) => (
        <span
          className={`tabular-nums ${
            r.expEndDate && isOverdue(r.expEndDate) && r.status !== "Completed"
              ? "text-destructive font-medium"
              : "text-muted-foreground"
          }`}
        >
          {r.expEndDate || "\u2014"}
        </span>
      ),
      sortValue: (r) => r.expEndDate,
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => (
        <Badge variant={TASK_STATUS_VARIANT[r.status] ?? "outline"}>
          {r.status}
        </Badge>
      ),
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
  if (error) return <ErrorState message="Failed to load tasks" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
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
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px]">
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
        <div className="flex-1" />
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/projects/new?type=task">
            <Plus className="h-4 w-4 mr-1.5" /> Add Task
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No tasks yet"
          description="Create tasks to track work across your projects."
          actionLabel="Add Task"
          actionHref="/dashboard/projects/new?type=task"
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
        title="Delete task?"
        description="This action cannot be undone."
      />
    </div>
  );
}
