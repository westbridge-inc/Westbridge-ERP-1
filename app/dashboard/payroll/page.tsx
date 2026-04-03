"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DollarSign } from "lucide-react";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/locale/currency";
import { formatDate } from "@/lib/locale/date";
import dynamic from "next/dynamic";

const AIChatPanel = dynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});
import { Input } from "@/components/ui/Input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { useErpList } from "@/lib/queries/useErpList";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PayrollRecord {
  id: string;
  employee: string;
  period: string;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: "Processed" | "Pending" | "Rejected";
}

interface PayrollStats {
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  headcount: number;
}

/* ------------------------------------------------------------------ */
/*  Mapper & Stats                                                     */
/* ------------------------------------------------------------------ */

function mapErpSalarySlip(r: Record<string, unknown>, i: number): PayrollRecord {
  const docstatus = Number(r.docstatus ?? 0);
  const status: PayrollRecord["status"] = docstatus === 1 ? "Processed" : docstatus === 2 ? "Rejected" : "Pending";
  return {
    id: String(r.name ?? `PAY-${i}`),
    employee: String(r.employee_name ?? r.name ?? ""),
    period: String(r.start_date ?? ""),
    grossPay: Number(r.gross_pay ?? 0),
    deductions: Number(r.total_deduction ?? 0),
    netPay: Number(r.net_pay ?? 0),
    status,
  };
}

function deriveStats(records: PayrollRecord[]): PayrollStats {
  return records.reduce(
    (acc, r) => ({
      totalGross: acc.totalGross + r.grossPay,
      totalDeductions: acc.totalDeductions + r.deductions,
      totalNet: acc.totalNet + r.netPay,
      headcount: acc.headcount + 1,
    }),
    { totalGross: 0, totalDeductions: 0, totalNet: 0, headcount: 0 },
  );
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const columns: Column<PayrollRecord>[] = [
  {
    id: "employee",
    header: "Employee",
    accessor: (row) => <span className="font-medium text-foreground">{row.employee}</span>,
    sortValue: (row) => row.employee,
  },
  {
    id: "period",
    header: "Period",
    accessor: (row) => <span className="text-muted-foreground">{formatDate(row.period)}</span>,
    sortValue: (row) => row.period,
  },
  {
    id: "grossPay",
    header: "Gross Pay",
    align: "right",
    accessor: (row) => <span className="text-muted-foreground tabular-nums">{formatCurrency(row.grossPay)}</span>,
    sortValue: (row) => row.grossPay,
  },
  {
    id: "deductions",
    header: "Deductions",
    align: "right",
    accessor: (row) => <span className="text-muted-foreground/60 tabular-nums">{formatCurrency(row.deductions)}</span>,
    sortValue: (row) => row.deductions,
  },
  {
    id: "netPay",
    header: "Net Pay",
    align: "right",
    accessor: (row) => <span className="font-medium text-foreground tabular-nums">{formatCurrency(row.netPay)}</span>,
    sortValue: (row) => row.netPay,
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => <Badge status={row.status}>{row.status}</Badge>,
    sortValue: (row) => row.status,
  },
];

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function PayrollPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [periodFilter, setPeriodFilter] = useState("All");
  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList("Salary Slip", {
    page,
    limit: 100,
    fields: ["name", "employee_name", "start_date", "gross_pay", "total_deduction", "net_pay", "docstatus"],
  });

  const records = useMemo(() => (rawList as Record<string, unknown>[]).map(mapErpSalarySlip), [rawList]);
  const error = queryError instanceof Error ? queryError.message : isError ? "Failed to load payroll data." : null;
  const stats = useMemo(() => deriveStats(records), [records]);

  const pendingCount = useMemo(() => records.filter((r) => r.status === "Pending").length, [records]);
  const processedCount = useMemo(() => records.filter((r) => r.status === "Processed").length, [records]);

  const filteredRecords = useMemo(() => {
    let result = records;

    if (statusFilter !== "All") {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (periodFilter !== "All") {
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      result = result.filter((r) => {
        if (!r.period) return false;
        const d = new Date(r.period);
        switch (periodFilter) {
          case "This Month":
            return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
          case "Last Month": {
            const lm = thisMonth === 0 ? 11 : thisMonth - 1;
            const ly = thisMonth === 0 ? thisYear - 1 : thisYear;
            return d.getMonth() === lm && d.getFullYear() === ly;
          }
          case "This Quarter": {
            const qStart = Math.floor(thisMonth / 3) * 3;
            return d.getFullYear() === thisYear && d.getMonth() >= qStart && d.getMonth() <= qStart + 2;
          }
          default:
            return true;
        }
      });
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }

    return result;
  }, [records, statusFilter, periodFilter, search]);

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Payroll</h1>
        <p className="text-sm text-muted-foreground">Process and manage employee salaries.</p>
      </div>
      <Button variant="primary" asChild>
        <Link href="/dashboard/payroll/new">+ Create New</Link>
      </Button>
    </div>
  );

  /* ---- Error state ---- */
  if (error) {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              <DollarSign className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Could not load payroll data</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up. You can retry or set up employees first in HR.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="space-y-6">
        {header}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-h-[88px] rounded-xl border border-border bg-card p-6 animate-pulse" />
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            <SkeletonTable rows={6} columns={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Success / Empty states ---- */
  return (
    <div className="space-y-6">
      {header}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard label="Total Payroll This Month" value={formatCurrency(stats.totalNet)} />
        <MetricCard label="Pending" value={pendingCount} subtextVariant="muted" />
        <MetricCard label="Processed" value={processedCount} subtextVariant="success" />
        <MetricCard label="Employees" value={stats.headcount} />
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <Input
              type="search"
              placeholder="Search payroll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Pending">Draft</SelectItem>
                <SelectItem value="Processed">Submitted</SelectItem>
                <SelectItem value="Rejected">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Periods</SelectItem>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="This Quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DataTable<PayrollRecord>
            columns={columns}
            data={filteredRecords}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => router.push(`/dashboard/payroll/${encodeURIComponent(r.id)}`)}
            loading={false}
            emptyState={
              <EmptyState
                icon={<DollarSign className="h-6 w-6" />}
                title={MODULE_EMPTY_STATES.payroll.title}
                description={MODULE_EMPTY_STATES.payroll.description}
                actionLabel={MODULE_EMPTY_STATES.payroll.actionLabel}
                actionHref={MODULE_EMPTY_STATES.payroll.actionLink}
                supportLine={EMPTY_STATE_SUPPORT_LINE}
              />
            }
            pageSize={20}
          />
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
      <AIChatPanel module="hr" />
    </div>
  );
}
