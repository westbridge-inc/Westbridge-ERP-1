"use client";

export const dynamic = "force-dynamic";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { UserCog, ClipboardCheck, Download, Trash2 } from "lucide-react";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToasts } from "@/components/ui/Toasts";
import { formatDate } from "@/lib/locale/date";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { useErpList } from "@/lib/queries/useErpList";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  status: "Active" | "Inactive";
  dateJoined: string;
}

interface HRStats {
  total: number;
  active: number;
  inactive: number;
}

interface AttendanceRow {
  id: string;
  employee: string;
  employeeName: string;
  attendanceDate: string;
  status: string;
}

/* ------------------------------------------------------------------ */
/*  Mapper & Stats                                                     */
/* ------------------------------------------------------------------ */

function mapErpEmployee(r: Record<string, unknown>, i: number): Employee {
  return {
    id: String(r.name ?? `EMP-${i}`),
    name: String(r.employee_name ?? r.name ?? ""),
    designation: String(r.designation ?? "\u2014"),
    department: String(r.department ?? "\u2014"),
    status: String(r.status ?? "") === "Active" ? "Active" : "Inactive",
    dateJoined: String(r.date_of_joining ?? ""),
  };
}

function deriveStats(employees: Employee[]): HRStats {
  const active = employees.filter((e) => e.status === "Active").length;
  return { total: employees.length, active, inactive: employees.length - active };
}

function mapErpAttendance(r: Record<string, unknown>): AttendanceRow {
  return {
    id: String(r.name ?? ""),
    employee: String(r.employee ?? ""),
    employeeName: String(r.employee_name ?? r.employee ?? ""),
    attendanceDate: String(r.attendance_date ?? ""),
    status: String(r.status ?? "Absent"),
  };
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const employeeColumns: Column<Employee>[] = [
  {
    id: "name",
    header: "Name",
    accessor: (row) => <span className="font-medium text-foreground">{row.name}</span>,
    sortValue: (row) => row.name,
  },
  {
    id: "designation",
    header: "Designation",
    accessor: (row) => <span className="text-muted-foreground">{row.designation}</span>,
    sortValue: (row) => row.designation,
  },
  {
    id: "department",
    header: "Department",
    accessor: (row) => <span className="text-muted-foreground">{row.department}</span>,
    sortValue: (row) => row.department,
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => <Badge status={row.status}>{row.status}</Badge>,
    sortValue: (row) => row.status,
  },
  {
    id: "dateJoined",
    header: "Date Joined",
    accessor: (row) => <span className="text-muted-foreground/60">{formatDate(row.dateJoined)}</span>,
    sortValue: (row) => row.dateJoined,
  },
];

const attendanceColumns: Column<AttendanceRow>[] = [
  {
    id: "id",
    header: "ID",
    accessor: (r) => <span className="font-medium text-foreground">{r.id}</span>,
    sortValue: (r) => r.id,
  },
  {
    id: "employeeName",
    header: "Employee",
    accessor: (r) => <span className="text-foreground">{r.employeeName}</span>,
    sortValue: (r) => r.employeeName,
  },
  {
    id: "attendanceDate",
    header: "Date",
    accessor: (r) => <span className="text-muted-foreground/60">{r.attendanceDate}</span>,
    sortValue: (r) => r.attendanceDate,
  },
  {
    id: "status",
    header: "Status",
    accessor: (r) => <Badge status={r.status}>{r.status}</Badge>,
    sortValue: (r) => r.status,
  },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

function HRPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToasts();
  const type = searchParams.get("type");
  const isAttendance = type === "attendance";

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList(isAttendance ? "Attendance" : "Employee", {
    page,
    limit: 100,
    ...(isAttendance
      ? {}
      : { fields: ["name", "employee_name", "designation", "department", "status", "date_of_joining"] }),
  });

  const employees = useMemo(
    () => (isAttendance ? [] : (rawList as Record<string, unknown>[]).map(mapErpEmployee)),
    [rawList, isAttendance],
  );
  const attendanceRows = useMemo(
    () => (isAttendance ? (rawList as Record<string, unknown>[]).map(mapErpAttendance) : []),
    [rawList, isAttendance],
  );
  const error =
    queryError instanceof Error
      ? queryError.message
      : isError
        ? `Failed to load ${isAttendance ? "attendance" : "employees"}.`
        : null;
  const stats = useMemo(() => (isAttendance ? null : deriveStats(employees)), [employees, isAttendance]);

  const filteredEmployees = useMemo(() => {
    if (!search) return employees;
    const q = search.toLowerCase();
    return employees.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [employees, search]);

  const filteredAttendance = useMemo(() => {
    if (!search) return attendanceRows;
    const q = search.toLowerCase();
    return attendanceRows.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [attendanceRows, search]);

  const employeeColumnsWithActions = useMemo(
    (): Column<Employee>[] => [
      ...employeeColumns,
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
            aria-label={`Delete ${row.id}`}
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
      await api.erp.delete("Employee", deleteTarget.id);
      addToast(`${deleteTarget.id} deleted`, "success");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, refetch]);

  const handleExport = useCallback(() => {
    if (isAttendance) {
      downloadCsv(
        filteredAttendance as unknown as Record<string, unknown>[],
        [
          { key: "id", label: "ID" },
          { key: "employeeName", label: "Employee" },
          { key: "attendanceDate", label: "Date" },
          { key: "status", label: "Status" },
        ],
        "attendance",
      );
    } else {
      downloadCsv(
        filteredEmployees as unknown as Record<string, unknown>[],
        [
          { key: "id", label: "ID" },
          { key: "name", label: "Name" },
          { key: "designation", label: "Designation" },
          { key: "department", label: "Department" },
          { key: "status", label: "Status" },
          { key: "dateJoined", label: "Date Joined" },
        ],
        "employee",
      );
    }
  }, [isAttendance, filteredEmployees, filteredAttendance]);

  const title = isAttendance ? "Attendance" : "HR";
  const subtitle = isAttendance ? "Employee attendance records" : "Employee directory and management";

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
        <Button variant="primary" onClick={() => router.push("/dashboard/hr/new")}>
          + Create New
        </Button>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              {isAttendance ? <ClipboardCheck className="h-6 w-6" /> : <UserCog className="h-6 w-6" />}
            </div>
            <p className="text-sm font-medium text-foreground">Could not load data right now</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up. You can retry or add your first{" "}
              {isAttendance ? "attendance record" : "employee"}.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/hr/new")}>
                + Create New
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {header}
        {!isAttendance && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-h-[88px] rounded-xl border border-border bg-card p-6 animate-pulse" />
            ))}
          </div>
        )}
        <Card>
          <CardContent className="p-0">
            <SkeletonTable rows={8} columns={isAttendance ? 4 : 5} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}
      {!isAttendance && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard label="Total Employees" value={stats.total} />
          <MetricCard label="Active" value={stats.active} subtextVariant="success" />
          <MetricCard label="Inactive" value={stats.inactive} subtextVariant="muted" />
        </div>
      )}
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <Input
              type="search"
              placeholder={isAttendance ? "Search attendance..." : "Search employees..."}
              className="w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAttendance ? (
            <DataTable<AttendanceRow>
              columns={attendanceColumns}
              data={filteredAttendance}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/hr/${encodeURIComponent(record.id)}`)}
              loading={false}
              emptyState={
                <EmptyState
                  icon={<ClipboardCheck className="h-6 w-6" />}
                  title="No attendance records yet"
                  description="Attendance records will appear here once employees start checking in."
                  actionLabel="Mark Attendance"
                  actionHref="/dashboard/hr/new"
                  supportLine={EMPTY_STATE_SUPPORT_LINE}
                />
              }
              pageSize={20}
            />
          ) : (
            <DataTable<Employee>
              columns={employeeColumnsWithActions}
              data={filteredEmployees}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/hr/${encodeURIComponent(record.id)}`)}
              loading={false}
              emptyState={
                <EmptyState
                  icon={<UserCog className="h-6 w-6" />}
                  title={MODULE_EMPTY_STATES.hr.title}
                  description={MODULE_EMPTY_STATES.hr.description}
                  actionLabel={MODULE_EMPTY_STATES.hr.actionLabel}
                  actionHref={MODULE_EMPTY_STATES.hr.actionLink}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.id ?? "record"}?`}
        description="This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />

      <AIChatPanel module="hr" />
    </div>
  );
}

export default function HRPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading…</div>}
    >
      <HRPageInner />
    </Suspense>
  );
}
