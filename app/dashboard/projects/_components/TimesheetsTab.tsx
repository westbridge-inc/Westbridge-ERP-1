"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Download, Trash2 } from "lucide-react";
import { useErpList } from "@/lib/queries/useErpList";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { api } from "@/lib/api/client";
import { useToasts } from "@/components/ui/Toasts";

interface TimesheetRow {
  id: string;
  employee: string;
  project: string;
  totalHours: number;
  date: string;
  status: string;
}

function mapErpTimesheet(d: Record<string, unknown>): TimesheetRow {
  return {
    id: String(d.name ?? ""),
    employee: String(d.employee_name ?? d.employee ?? ""),
    project: String(d.parent_project ?? d.project ?? ""),
    totalHours: Number(d.total_hours ?? 0),
    date: String(d.start_date ?? d.creation ?? "").slice(0, 10),
    status: String(d.status ?? d.docstatus === 1 ? "Submitted" : "Draft"),
  };
}

export function TimesheetsTab() {
  const { addToast } = useToasts();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data, isLoading, error, refetch } = useErpList("Timesheet", {
    fields: ["name", "employee_name", "employee", "parent_project", "project", "total_hours", "start_date", "status", "docstatus", "creation"],
    orderBy: "creation desc",
    limit: 20,
  });

  const timesheets = (data as Record<string, unknown>[]).map(mapErpTimesheet);
  const filtered = timesheets.filter((t: TimesheetRow) =>
    !search || t.employee.toLowerCase().includes(search.toLowerCase()) || t.project.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = useCallback(async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.erp.delete("Timesheet", deleteId);
      addToast("Timesheet deleted", "success");
      setDeleteId(null);
      refetch();
    } catch {
      addToast("Failed to delete timesheet", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteId, addToast, refetch]);

  const columns: Column<TimesheetRow>[] = [
    { id: "employee", header: "Employee", accessor: (r) => r.employee, sortValue: (r) => r.employee },
    { id: "project", header: "Project", accessor: (r) => r.project || "—", sortValue: (r) => r.project },
    {
      id: "hours",
      header: "Hours",
      accessor: (r) => <span className="tabular-nums">{r.totalHours.toFixed(1)}</span>,
      sortValue: (r) => r.totalHours,
      align: "right",
    },
    { id: "date", header: "Date", accessor: (r) => <span className="tabular-nums text-muted-foreground">{r.date}</span>, sortValue: (r) => r.date },
    { id: "status", header: "Status", accessor: (r) => <Badge status={r.status}>{r.status}</Badge> },
    {
      id: "actions",
      header: "",
      accessor: (r) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" onClick={() => setDeleteId(r.id)} aria-label="Delete">
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <SkeletonTable rows={8} columns={6} />;
  if (error) return <ErrorState message="Failed to load timesheets" onRetry={refetch} />;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search timesheets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex-1" />
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/projects/new?type=timesheet">
            <Plus className="h-4 w-4 mr-1.5" /> Log Time
          </Link>
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No timesheets yet"
          description="Log time against projects and tasks."
          actionLabel="Log Time"
          actionHref="/dashboard/projects/new?type=timesheet"
        />
      ) : (
        <DataTable data={filtered} columns={columns} keyExtractor={(r) => r.id} />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
        title="Delete timesheet?"
        description="This action cannot be undone."
      />
    </div>
  );
}
