"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Truck, Trash2, Download } from "lucide-react";
import { EMPTY_STATE_SUPPORT_LINE, MODULE_EMPTY_STATES } from "@/lib/dashboard/empty-state-config";
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
import { formatCurrency } from "@/lib/locale/currency";
import { useErpList } from "@/lib/queries/useErpList";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import type { PurchaseOrder } from "./types";
import { mapErpPurchaseOrder, fmtDate } from "./utils";

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

function getPiColumns(setDeleteTarget: (row: PurchaseOrder) => void): Column<PurchaseOrder>[] {
  return [
    {
      id: "id",
      header: "Invoice #",
      accessor: (r) => <span className="font-medium text-foreground">{r.id}</span>,
      sortValue: (r) => r.id,
    },
    {
      id: "supplier",
      header: "Supplier",
      accessor: (r) => <span className="text-muted-foreground">{r.supplier}</span>,
      sortValue: (r) => r.supplier,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      accessor: (r) => (
        <span className="font-medium text-foreground tabular-nums">{formatCurrency(r.amount, "USD")}</span>
      ),
      sortValue: (r) => r.amount,
    },
    {
      id: "orderDate",
      header: "Date",
      accessor: (r) => <span className="text-muted-foreground/60">{fmtDate(r.orderDate)}</span>,
      sortValue: (r) => r.orderDate,
    },
    {
      id: "expected",
      header: "Due Date",
      accessor: (r) => <span className="text-muted-foreground/60">{fmtDate(r.expected)}</span>,
      sortValue: (r) => r.expected,
    },
    { id: "status", header: "Status", accessor: (r) => <Badge status={r.status}>{r.status}</Badge> },
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PurchaseInvoicesTab() {
  const router = useRouter();
  const { addToast } = useToasts();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList("Purchase Invoice", { page });

  const data = useMemo(
    () => (rawList as Record<string, unknown>[]).map(mapErpPurchaseOrder),
    [rawList],
  );

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [data, search]);

  const metrics = useMemo(() => {
    const total = filtered.length;
    const unpaid = filtered.filter((i) => i.status === "Unpaid" || i.status === "Overdue").length;
    const paid = filtered.filter((i) => i.status === "Paid").length;
    const totalAmount = filtered.reduce((sum, i) => sum + i.amount, 0);
    return { total, unpaid, paid, totalAmount };
  }, [filtered]);

  const columns = useMemo(() => getPiColumns(setDeleteTarget), []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Purchase Invoice", deleteTarget.id);
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
    downloadCsv(
      filtered as unknown as Record<string, unknown>[],
      [
        { key: "id", label: "ID" },
        { key: "supplier", label: "Supplier" },
        { key: "amount", label: "Amount" },
        { key: "orderDate", label: "Date" },
        { key: "expected", label: "Due Date" },
        { key: "status", label: "Status" },
      ],
      "purchase-invoices",
    );
  }, [filtered]);

  const error =
    queryError instanceof Error ? queryError.message : isError ? "Failed to load purchase invoices." : null;

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
            <Truck className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">Could not load data right now</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Your ERP backend may be starting up. You can retry or create a new record.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/procurement/new")}>
              + Create New
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Invoices" value={metrics.total} />
          <MetricCard label="Unpaid" value={metrics.unpaid} subtextVariant="error" />
          <MetricCard label="Paid" value={metrics.paid} subtextVariant="success" />
          <MetricCard label="Total Amount" value={formatCurrency(metrics.totalAmount, "USD")} />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <Input
              placeholder="Search purchase invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1 h-4 w-4" /> Export CSV
            </Button>
          </div>
          {loading ? (
            <SkeletonTable rows={6} columns={6} />
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/procurement/${encodeURIComponent(record.id)}`)}
              emptyState={
                <EmptyState
                  icon={<Truck className="h-6 w-6" />}
                  title={MODULE_EMPTY_STATES.procurement.title}
                  description={MODULE_EMPTY_STATES.procurement.description}
                  actionLabel={MODULE_EMPTY_STATES.procurement.actionLabel}
                  actionHref={MODULE_EMPTY_STATES.procurement.actionLink}
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
        title="Delete record"
        description={`Are you sure you want to delete ${deleteTarget?.id ?? "this record"}? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </>
  );
}
