"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { formatCurrency } from "@/lib/locale/currency";
import { formatDate } from "@/lib/locale/date";
import { AIChatPanel } from "@/components/ai/AIChatPanel";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ExpenseRow = {
  name: string;
  postingDate: string;
  description: string;
  category: string;
  amount: number;
  submittedBy: string;
  status: string;
};

/* ------------------------------------------------------------------ */
/*  Table columns                                                      */
/* ------------------------------------------------------------------ */

const expenseColumns: Column<ExpenseRow>[] = [
  {
    id: "date",
    header: "Date",
    accessor: (row) => (row.postingDate ? formatDate(row.postingDate) : "\u2014"),
    sortValue: (row) => row.postingDate || "",
    width: "120px",
  },
  {
    id: "description",
    header: "Description",
    accessor: (row) => row.description,
    sortValue: (row) => row.description,
  },
  {
    id: "category",
    header: "Category",
    accessor: (row) => (
      <span className="text-muted-foreground">{row.category}</span>
    ),
    sortValue: (row) => row.category,
    width: "140px",
  },
  {
    id: "amount",
    header: "Amount",
    accessor: (row) => (
      <span className="font-medium text-foreground">
        {row.amount > 0 ? formatCurrency(row.amount, "USD") : "\u2014"}
      </span>
    ),
    sortValue: (row) => row.amount,
    align: "right",
    width: "140px",
  },
  {
    id: "submittedBy",
    header: "Submitted By",
    accessor: (row) => (
      <span className="text-muted-foreground">{row.submittedBy}</span>
    ),
    sortValue: (row) => row.submittedBy,
    width: "160px",
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => <Badge status={row.status}>{row.status}</Badge>,
    sortValue: (row) => row.status,
    width: "120px",
  },
];

/* ------------------------------------------------------------------ */
/*  Metric card                                                        */
/* ------------------------------------------------------------------ */

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex-1 rounded-xl border border-border/70 bg-card px-6 py-5 transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-muted-foreground tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight font-display text-foreground">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ExpensesListClientProps {
  rows: ExpenseRow[];
  currentPage: number;
  hasMore: boolean;
}

export function ExpensesListClient({ rows, currentPage, hasMore }: ExpensesListClientProps) {
  const router = useRouter();

  const totalAmount = useMemo(
    () => rows.reduce((sum, r) => sum + r.amount, 0),
    [rows],
  );
  const pendingCount = useMemo(
    () => rows.filter((r) => r.status === "Pending").length,
    [rows],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">Expense claims and approvals</p>
        </div>
        <Button variant="primary" onClick={() => router.push("/dashboard/expenses/new")}>+ Add Expense</Button>
      </div>
      <div className="flex gap-6">
        <MetricCard label="Total claims" value={formatCurrency(totalAmount, "USD")} />
        <MetricCard label="Pending" value={pendingCount} />
        <MetricCard label="Total" value={rows.length} />
      </div>
      <Card>
        <CardContent className="p-0">
          <DataTable<ExpenseRow>
            columns={expenseColumns}
            data={rows}
            keyExtractor={(row) => row.name}
            onRowClick={(record) => router.push(`/dashboard/expenses/${encodeURIComponent(record.name)}`)}
            emptyState={
              <EmptyState
                icon={<Receipt className="h-6 w-6" />}
                title={MODULE_EMPTY_STATES.expenses.title}
                description={MODULE_EMPTY_STATES.expenses.description}
                actionLabel={MODULE_EMPTY_STATES.expenses.actionLabel}
                actionHref={MODULE_EMPTY_STATES.expenses.actionLink}
                supportLine={EMPTY_STATE_SUPPORT_LINE}
              />
            }
            pageSize={20}
          />
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <span className="text-sm text-muted-foreground">Page {currentPage + 1}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => router.push("?page=" + (currentPage - 1))}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => router.push("?page=" + (currentPage + 1))}>
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
