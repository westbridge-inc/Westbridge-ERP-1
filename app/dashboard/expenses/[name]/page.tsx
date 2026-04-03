"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Pencil, Trash2, AlertCircle, FileText } from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { DetailPageHeader } from "@/app/dashboard/_components/DetailPageHeader";
import { DetailGrid } from "@/app/dashboard/_components/DetailGrid";
import type { DetailField } from "@/app/dashboard/_components/DetailGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExpenseLineItem {
  expense_date?: string;
  expense_type?: string;
  description?: string;
  amount?: number;
}

interface ExpenseClaimDoc {
  name: string;
  employee_name?: string;
  approval_status?: string;
  posting_date?: string;
  department?: string;
  total_claimed_amount?: number;
  total_sanctioned_amount?: number;
  expenses?: ExpenseLineItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr?: string): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value?: number): string {
  if (value == null) return "$0.00";
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function ExpenseSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <SkeletonTable rows={3} columns={4} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error / Not Found states
// ---------------------------------------------------------------------------

function ExpenseError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-1">Failed to load expense claim</h2>
      <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching this expense claim.</p>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/expenses">Back to Expenses</Link>
        </Button>
      </div>
    </div>
  );
}

function ExpenseNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
      <h2 className="text-lg font-semibold mb-1">Expense claim not found</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The expense claim you are looking for does not exist or has been deleted.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard/expenses">Back to Expenses</Link>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ExpenseClaimDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);

  const [doc, setDoc] = useState<ExpenseClaimDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    setError(false);
    setNotFound(false);
    try {
      const result = (await api.erp.get("Expense Claim", decodedName)) as ExpenseClaimDoc;
      if (!result || !result.name) {
        setNotFound(true);
      } else {
        setDoc(result);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("not found") || msg.includes("404")) {
        setNotFound(true);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [decodedName]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // -- Delete handler ---------------------------------------------------------
  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${decodedName}?`)) return;
    try {
      await api.erp.delete("Expense Claim", decodedName);
      toast.success("Expense claim deleted");
      window.location.href = "/dashboard/expenses";
    } catch {
      toast.error("Failed to delete expense claim");
    }
  }

  // -- Render states ----------------------------------------------------------
  if (loading) return <ExpenseSkeleton />;
  if (notFound) return <ExpenseNotFound />;
  if (error || !doc) return <ExpenseError onRetry={fetchDoc} />;

  const status = doc.approval_status || "Draft";
  const difference = (doc.total_claimed_amount ?? 0) - (doc.total_sanctioned_amount ?? 0);

  // -- Detail fields ----------------------------------------------------------
  const detailFields: DetailField[] = [
    { label: "Posting Date", value: formatDate(doc.posting_date) },
    { label: "Employee", value: doc.employee_name || "--" },
    { label: "Department", value: doc.department || "--" },
    { label: "Approval Status", value: status },
    { label: "Total Claimed", value: formatCurrency(doc.total_claimed_amount) },
  ];

  // -- Summary fields ---------------------------------------------------------
  const summaryFields: DetailField[] = [
    { label: "Total Claimed", value: formatCurrency(doc.total_claimed_amount) },
    { label: "Sanctioned Amount", value: formatCurrency(doc.total_sanctioned_amount) },
    { label: "Difference", value: formatCurrency(difference) },
  ];

  const items = doc.expenses ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailPageHeader
        backHref="/dashboard/expenses"
        backLabel="Back to Expenses"
        title={decodedName}
        subtitle={doc.employee_name}
        status={status}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/expenses/${encodeURIComponent(decodedName)}/edit`}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </>
        }
      />

      {/* Details + Summary grid */}
      <DetailGrid fields={detailFields} summaryFields={summaryFields} summaryTitle="Summary" />

      {/* Line Items */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-12">#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expense Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="pl-6 text-sm text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="text-sm">{formatDate(item.expense_date)}</TableCell>
                    <TableCell className="text-sm">{item.expense_type || "--"}</TableCell>
                    <TableCell className="text-sm">{item.description || "--"}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums pr-6">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={4} className="pl-6 text-sm font-semibold text-right">
                    Total
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-right tabular-nums pr-6">
                    {formatCurrency(doc.total_claimed_amount)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
