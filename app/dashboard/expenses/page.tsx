"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Receipt, Trash2 } from "lucide-react";
import { EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
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
import { formatCurrency } from "@/lib/locale/currency";
import { useErpList } from "@/lib/queries/useErpList";
import { api } from "@/lib/api/client";
import dynamic from "next/dynamic";

const AIChatPanel = dynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ExpenseRow {
  id: string;
  description: string;
  amount: number;
  employee: string;
  status: string;
  date: string;
}

/* ------------------------------------------------------------------ */
/*  Badge variant map                                                  */
/* ------------------------------------------------------------------ */

const EXPENSE_BADGE: Record<string, "outline" | "warning" | "default" | "success" | "destructive"> = {
  Draft: "outline",
  Unpaid: "warning",
  Submitted: "default",
  Approved: "success",
  Rejected: "destructive",
};

/* ------------------------------------------------------------------ */
/*  Mapper                                                             */
/* ------------------------------------------------------------------ */

function mapExpense(r: Record<string, unknown>): ExpenseRow {
  return {
    id: String(r.name ?? ""),
    description: String(r.expense_type ?? r.remark ?? "Expense claim"),
    amount: Number(r.total_claimed_amount ?? r.total_sanctioned_amount ?? r.grand_total ?? 0),
    employee: String(r.employee_name ?? r.owner ?? "\u2014"),
    status: String(r.status ?? r.approval_status ?? "Draft").trim(),
    date: String(r.posting_date ?? r.creation ?? ""),
  };
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

function deriveStats(rows: ExpenseRow[]) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  let totalThisMonth = 0;
  let pending = 0;
  let approvedThisMonth = 0;
  let totalAmount = 0;

  for (const r of rows) {
    const d = new Date(r.date);
    const sameMonth = d.getMonth() === month && d.getFullYear() === year;
    if (sameMonth) totalThisMonth += r.amount;
    if (r.status === "Draft" || r.status === "Submitted") pending++;
    if (r.status === "Approved" && sameMonth) approvedThisMonth += r.amount;
    totalAmount += r.amount;
  }

  const avg = rows.length > 0 ? totalAmount / rows.length : 0;
  return { totalThisMonth, pending, approvedThisMonth, average: avg };
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const STATUSES = ["All", "Draft", "Submitted", "Approved", "Rejected"];

function getExpenseColumns(
  router: ReturnType<typeof useRouter>,
  setDeleteTarget: (row: ExpenseRow) => void,
): Column<ExpenseRow>[] {
  return [
    {
      id: "id",
      header: "Name",
      accessor: (row) => (
        <a
          href={`/dashboard/expenses/${encodeURIComponent(row.id)}`}
          className="font-medium text-foreground hover:underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/dashboard/expenses/${encodeURIComponent(row.id)}`);
          }}
        >
          {row.id}
        </a>
      ),
      sortValue: (row) => row.id,
    },
    {
      id: "description",
      header: "Description",
      accessor: (row) => (
        <span className="text-muted-foreground max-w-[200px] truncate inline-block">{row.description}</span>
      ),
      sortValue: (row) => row.description,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      accessor: (row) => <span className="font-medium text-foreground tabular-nums">{formatCurrency(row.amount)}</span>,
      sortValue: (row) => row.amount,
    },
    {
      id: "employee",
      header: "Employee",
      accessor: (row) => <span className="text-muted-foreground">{row.employee}</span>,
      sortValue: (row) => row.employee,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <Badge variant={EXPENSE_BADGE[row.status] ?? "secondary"}>{row.status}</Badge>,
      sortValue: (row) => row.status,
    },
    {
      id: "date",
      header: "Date",
      accessor: (row) => <span className="text-muted-foreground/60">{row.date ? formatDate(row.date) : "\u2014"}</span>,
      sortValue: (row) => row.date,
    },
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
  ];
}

/* ------------------------------------------------------------------ */
/*  Page inner                                                         */
/* ------------------------------------------------------------------ */

function ExpensesPageInner() {
  const router = useRouter();
  const { addToast } = useToasts();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<ExpenseRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList("Expense Claim", { page, limit: 100 });

  /* ---- Map rows ---- */
  const expenses = useMemo(() => (rawList as Record<string, unknown>[]).map(mapExpense), [rawList]);

  /* ---- Filter ---- */
  const filtered = useMemo(() => {
    let rows = expenses;
    if (statusFilter !== "All") rows = rows.filter((r) => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    return rows;
  }, [expenses, statusFilter, search]);

  /* ---- Stats ---- */
  const stats = useMemo(() => deriveStats(expenses), [expenses]);

  /* ---- Columns ---- */
  const columns = useMemo(() => getExpenseColumns(router, setDeleteTarget), [router]);

  /* ---- Delete ---- */
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Expense Claim", deleteTarget.id);
      addToast(`${deleteTarget.id} deleted`, "success");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, refetch]);

  const error = queryError instanceof Error ? queryError.message : isError ? "Failed to load expense claims." : null;

  /* ---- Error state ---- */
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Expenses"
          description="Track and manage business expenses."
          action={
            <Button variant="primary" onClick={() => router.push("/dashboard/expenses/new")}>
              + Add Expense
            </Button>
          }
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              <Receipt className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Nothing here yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up. You can retry or add your first expense.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/expenses/new")}>
                + Add Expense
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
        <PageHeader
          title="Expenses"
          description="Track and manage business expenses."
          action={
            <Button variant="primary" onClick={() => router.push("/dashboard/expenses/new")}>
              + Add Expense
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-h-[88px] rounded-xl border border-border bg-card p-6 animate-pulse" />
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            <SkeletonTable rows={8} columns={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Success state ---- */
  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Track and manage business expenses."
        action={
          <Button variant="primary" onClick={() => router.push("/dashboard/expenses/new")}>
            + Add Expense
          </Button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard label="Total This Month" value={formatCurrency(stats.totalThisMonth)} />
        <MetricCard
          label="Pending Approval"
          value={stats.pending}
          subtextVariant={stats.pending > 0 ? "error" : "muted"}
        />
        <MetricCard
          label="Approved This Month"
          value={formatCurrency(stats.approvedThisMonth)}
          subtextVariant="success"
        />
        <MetricCard label="Average Amount" value={formatCurrency(stats.average)} />
      </div>

      {/* Table card */}
      <Card>
        <CardContent className="p-0">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <Input
              type="search"
              placeholder="Search expenses..."
              className="w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Statuses" : s}
                </option>
              ))}
            </select>
          </div>

          <DataTable<ExpenseRow>
            columns={columns}
            data={filtered}
            keyExtractor={(r) => r.id}
            onRowClick={(record) => router.push(`/dashboard/expenses/${encodeURIComponent(record.id)}`)}
            loading={false}
            emptyState={
              <EmptyState
                icon={<Receipt className="h-6 w-6" />}
                title="No expenses recorded"
                description="Submit your first expense claim for tracking and approval."
                actionLabel="Add Expense"
                actionHref="/dashboard/expenses/new"
                supportLine={EMPTY_STATE_SUPPORT_LINE}
              />
            }
            pageSize={20}
          />

          {/* Pagination */}
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

      <AIChatPanel module="finance" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export default function ExpensesPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading…</div>}
    >
      <ExpensesPageInner />
    </Suspense>
  );
}
