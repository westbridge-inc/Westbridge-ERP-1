"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { formatCurrency } from "@/lib/locale/currency";
import { Truck, Download, Trash2 } from "lucide-react";
import { formatDateLong } from "@/lib/locale/date";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { useErpList } from "@/lib/queries/useErpList";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToasts } from "@/components/ui/Toasts";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import { Input } from "@/components/ui/Input";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PurchaseOrder {
  id: string;
  supplier: string;
  amount: number;
  orderDate: string;
  expected: string;
  status: string;
}

interface SupplierRow {
  id: string;
  name: string;
  supplierType: string;
  country: string;
}

/* ------------------------------------------------------------------ */
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

function mapErpPurchaseOrder(d: Record<string, unknown>): PurchaseOrder {
  return {
    id: String(d.name ?? ""),
    supplier: String(d.supplier_name ?? d.supplier ?? "\u2014"),
    amount: Number(d.grand_total ?? d.net_total ?? 0),
    orderDate: String(d.transaction_date ?? d.posting_date ?? ""),
    expected: String(d.schedule_date ?? d.due_date ?? ""),
    status: String(d.status ?? "Draft").trim(),
  };
}

function mapErpSupplier(d: Record<string, unknown>): SupplierRow {
  return {
    id: String(d.name ?? ""),
    name: String(d.supplier_name ?? d.name ?? ""),
    supplierType: String(d.supplier_type ?? "\u2014"),
    country: String(d.country ?? "\u2014"),
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtDate(d: string): string {
  if (!d) return "\u2014";
  try {
    return formatDateLong(d);
  } catch {
    return d;
  }
}

/* ------------------------------------------------------------------ */
/*  Column definitions                                                 */
/* ------------------------------------------------------------------ */

function getPoColumns(setDeleteTarget: (row: PurchaseOrder) => void): Column<PurchaseOrder>[] {
  return [
    {
      id: "id",
      header: "PO #",
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
      accessor: (r) => <span className="font-medium text-foreground">{formatCurrency(r.amount, "USD")}</span>,
      sortValue: (r) => r.amount,
    },
    {
      id: "orderDate",
      header: "Order Date",
      accessor: (r) => <span className="text-muted-foreground/60">{fmtDate(r.orderDate)}</span>,
      sortValue: (r) => r.orderDate,
    },
    {
      id: "expected",
      header: "Expected",
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
      accessor: (r) => <span className="font-medium text-foreground">{formatCurrency(r.amount, "USD")}</span>,
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

function getSupplierColumns(setDeleteTarget: (row: SupplierRow) => void): Column<SupplierRow>[] {
  return [
    {
      id: "name",
      header: "Supplier Name",
      accessor: (r) => <span className="font-medium text-foreground">{r.name}</span>,
      sortValue: (r) => r.name,
    },
    {
      id: "supplierType",
      header: "Type",
      accessor: (r) => <span className="text-muted-foreground">{r.supplierType}</span>,
      sortValue: (r) => r.supplierType,
    },
    {
      id: "country",
      header: "Country",
      accessor: (r) => <span className="text-muted-foreground">{r.country}</span>,
      sortValue: (r) => r.country,
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
/*  Config by type                                                     */
/* ------------------------------------------------------------------ */

const TYPE_CONFIG = {
  default: { doctype: "Purchase Order", title: "Purchase Orders", subtitle: "Purchase orders and suppliers" },
  invoice: { doctype: "Purchase Invoice", title: "Purchase Invoices", subtitle: "Manage purchase invoices and bills" },
  supplier: { doctype: "Supplier", title: "Suppliers", subtitle: "Manage your suppliers" },
} as const;

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

function ProcurementPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "default";
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.default;
  const isSupplier = type === "supplier";

  const { addToast } = useToasts();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | SupplierRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList(config.doctype, { page });

  const data = useMemo(() => {
    const list = rawList as Record<string, unknown>[];
    if (isSupplier) return list.map(mapErpSupplier);
    return list.map(mapErpPurchaseOrder);
  }, [rawList, isSupplier]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [data, search]);

  const poColumns = useMemo(() => getPoColumns(setDeleteTarget), []);
  const piColumns = useMemo(() => getPiColumns(setDeleteTarget), []);
  const supplierColumns = useMemo(() => getSupplierColumns(setDeleteTarget), []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete(config.doctype, deleteTarget.id);
      addToast(`${deleteTarget.id} deleted`, "success");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, refetch, config.doctype]);

  const handleExport = useCallback(() => {
    if (isSupplier) {
      downloadCsv(
        filtered as unknown as Record<string, unknown>[],
        [
          { key: "id", label: "ID" },
          { key: "name", label: "Supplier Name" },
          { key: "supplierType", label: "Type" },
          { key: "country", label: "Country" },
        ],
        "suppliers",
      );
    } else {
      downloadCsv(
        filtered as unknown as Record<string, unknown>[],
        [
          { key: "id", label: "ID" },
          { key: "supplier", label: "Supplier" },
          { key: "amount", label: "Amount" },
          { key: "orderDate", label: "Order Date" },
          { key: "expected", label: "Expected" },
          { key: "status", label: "Status" },
        ],
        type === "invoice" ? "purchase-invoices" : "purchase-orders",
      );
    }
  }, [filtered, isSupplier, type]);

  const error =
    queryError instanceof Error ? queryError.message : isError ? `Failed to load ${config.title.toLowerCase()}.` : null;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{config.title}</h1>
            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
          </div>
          <Button variant="primary" onClick={() => router.push("/dashboard/procurement/new")}>
            + Create New
          </Button>
        </div>
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{config.title}</h1>
          <p className="text-sm text-muted-foreground">{config.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-1 h-4 w-4" /> Export CSV
          </Button>
          <Button variant="primary" onClick={() => router.push("/dashboard/procurement/new")}>
            + Create New
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            <Input
              placeholder={`Search ${config.title.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {loading ? (
            <SkeletonTable rows={6} columns={6} />
          ) : isSupplier ? (
            <DataTable
              columns={supplierColumns}
              data={filtered as SupplierRow[]}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/procurement/${encodeURIComponent(record.id)}`)}
              emptyState={
                <EmptyState
                  icon={<Truck className="h-6 w-6" />}
                  title="No suppliers yet"
                  description="Add your first supplier to start managing procurement."
                  actionLabel="Add Supplier"
                  actionHref="/dashboard/procurement/new"
                  supportLine={EMPTY_STATE_SUPPORT_LINE}
                />
              }
              pageSize={20}
            />
          ) : (
            <DataTable
              columns={type === "invoice" ? piColumns : poColumns}
              data={filtered as unknown as PurchaseOrder[]}
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
      <AIChatPanel module="inventory" />
    </div>
  );
}

export default function ProcurementPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading…</div>}
    >
      <ProcurementPageInner />
    </Suspense>
  );
}
