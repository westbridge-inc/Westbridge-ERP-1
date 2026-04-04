"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ListChecks, Pencil, Trash2, Download } from "lucide-react";
import { EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
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
import type { TaskRow } from "./types";
import { mapErpTask, TASK_STATUS_VARIANT, PRIORITY_VARIANT, TASK_STATUSES, TASK_PRIORITIES } from "./utils";

/* ------------------------------------------------------------------ */
/*  Column builder                                                     */
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TasksTab() {
  const router = useRouter();
  const { addToast } = useToasts();

  const [taskPage, setTaskPage] = useState(0);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatus, setTaskStatus] = useState("All");
  const [taskPriority, setTaskPriority] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<TaskRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: rawTasks = [],
    hasMore: tasksHasMore,
    page: tasksCurrentPage,
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useErpList("Task", {
    page: taskPage,
    fields: ["name", "subject", "project", "_assign", "priority", "exp_end_date", "status"],
  });

  const tasks = useMemo(() => (rawTasks as Record<string, unknown>[]).map(mapErpTask), [rawTasks]);

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

  const taskColumns = useMemo(
    () =>
      buildTaskColumns(
        (row) => router.push(`/dashboard/projects/${encodeURIComponent(row.id)}`),
        (row) => setDeleteTarget(row),
      ),
    [router],
  );

  const handleExport = useCallback(() => {
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
  }, [filteredTasks]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Task", deleteTarget.id);
      addToast(`${deleteTarget.id} deleted`, "success");
      setDeleteTarget(null);
      refetchTasks();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, refetchTasks]);

  return (
    <>
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
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export CSV
            </Button>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.subject ?? "task"}?`}
        description="This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </>
  );
}
