"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, Warehouse, ArrowRightLeft, Download, Trash2 } from "lucide-react";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/locale/currency";
import dynamic from "next/dynamic";

const AIChatPanel = dynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});
import { useErpList } from "@/lib/queries/useErpList";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToasts } from "@/components/ui/Toasts";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import { Input } from "@/components/ui/Input";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InventoryItem {
  id: string;
  item: string;
  warehouse: string;
  qty: number;
  value: number;
  uom: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

interface InventoryStats {
  totalItems: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

/* ------------------------------------------------------------------ */
/*  Badge variant mapping                                              */
/* ------------------------------------------------------------------ */

function inventoryBadgeVariant(status: string): "success" | "warning" | "destructive" {
  if (status === "Out of Stock") return "destructive";
  if (status === "Low Stock") return "warning";
  return "success";
}

/* ------------------------------------------------------------------ */
/*  Mapper & Stats                                                     */
/* ------------------------------------------------------------------ */

function mapErpItem(r: Record<string, unknown>, i: number): InventoryItem {
  const qty = Number(r.total_projected_qty ?? 0);
  return {
    id: String(r.name ?? `ITM-${i}`),
    item: String(r.item_name ?? r.name ?? ""),
    warehouse: String(r.default_warehouse ?? "\u2014"),
    qty,
    value: Number(r.valuation_rate ?? 0) * qty,
    uom: String(r.stock_uom ?? ""),
    status: qty <= 0 ? "Out of Stock" : qty < 10 ? "Low Stock" : "In Stock",
  };
}

function deriveStats(items: InventoryItem[]): InventoryStats {
  return items.reduce(
    (acc, item) => ({
      totalItems: acc.totalItems + 1,
      lowStock: acc.lowStock + (item.status === "Low Stock" ? 1 : 0),
      outOfStock: acc.outOfStock + (item.status === "Out of Stock" ? 1 : 0),
      totalValue: acc.totalValue + item.value,
    }),
    { totalItems: 0, lowStock: 0, outOfStock: 0, totalValue: 0 },
  );
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

function getItemColumns(setDeleteTarget: (row: InventoryItem) => void): Column<InventoryItem>[] {
  return [
    {
      id: "item",
      header: "Item",
      accessor: (row) => <span className="font-medium text-foreground">{row.item}</span>,
      sortValue: (row) => row.item,
    },
    {
      id: "warehouse",
      header: "Warehouse",
      accessor: (row) => <span className="text-muted-foreground">{row.warehouse}</span>,
      sortValue: (row) => row.warehouse,
    },
    {
      id: "qty",
      header: "Qty",
      align: "right",
      accessor: (row) => <span className="text-muted-foreground">{row.qty.toLocaleString()}</span>,
      sortValue: (row) => row.qty,
    },
    {
      id: "value",
      header: "Value",
      align: "right",
      accessor: (row) => <span className="font-medium text-foreground">{formatCurrency(row.value)}</span>,
      sortValue: (row) => row.value,
    },
    {
      id: "uom",
      header: "UOM",
      accessor: (row) => <span className="text-muted-foreground/60">{row.uom}</span>,
      sortValue: (row) => row.uom,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <Badge variant={inventoryBadgeVariant(row.status)}>{row.status}</Badge>,
      sortValue: (row) => (row.status === "Out of Stock" ? 0 : row.status === "Low Stock" ? 1 : 2),
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
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Stock Entry & Warehouse mappers + columns                          */
/* ------------------------------------------------------------------ */

interface GenericRow {
  id: string;
  [key: string]: unknown;
}

function mapStockEntry(d: Record<string, unknown>): GenericRow {
  return {
    id: String(d.name ?? ""),
    purpose: String(d.stock_entry_type ?? d.purpose ?? "\u2014"),
    postingDate: String(d.posting_date ?? ""),
    status: String(d.docstatus === 1 ? "Submitted" : d.docstatus === 2 ? "Cancelled" : "Draft"),
  };
}

function mapWarehouse(d: Record<string, unknown>): GenericRow {
  return {
    id: String(d.name ?? ""),
    warehouseName: String(d.warehouse_name ?? d.name ?? ""),
    warehouseType: String(d.warehouse_type ?? "\u2014"),
    company: String(d.company ?? "\u2014"),
  };
}

function getStockEntryColumns(setDeleteTarget: (row: GenericRow) => void): Column<GenericRow>[] {
  return [
    {
      id: "id",
      header: "Entry #",
      accessor: (r) => <span className="font-medium text-foreground">{r.id as string}</span>,
      sortValue: (r) => r.id,
    },
    {
      id: "purpose",
      header: "Purpose",
      accessor: (r) => <span className="text-muted-foreground">{r.purpose as string}</span>,
      sortValue: (r) => r.purpose as string,
    },
    {
      id: "postingDate",
      header: "Date",
      accessor: (r) => <span className="text-muted-foreground/60">{r.postingDate as string}</span>,
      sortValue: (r) => r.postingDate as string,
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => <Badge status={r.status as string}>{r.status as string}</Badge>,
      sortValue: (r) => r.status as string,
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

function getWarehouseColumns(setDeleteTarget: (row: GenericRow) => void): Column<GenericRow>[] {
  return [
    {
      id: "id",
      header: "Warehouse ID",
      accessor: (r) => <span className="font-medium text-foreground">{r.id as string}</span>,
      sortValue: (r) => r.id,
    },
    {
      id: "warehouseName",
      header: "Name",
      accessor: (r) => <span className="text-muted-foreground">{r.warehouseName as string}</span>,
      sortValue: (r) => r.warehouseName as string,
    },
    {
      id: "warehouseType",
      header: "Type",
      accessor: (r) => <span className="text-muted-foreground">{r.warehouseType as string}</span>,
      sortValue: (r) => r.warehouseType as string,
    },
    {
      id: "company",
      header: "Company",
      accessor: (r) => <span className="text-muted-foreground/60">{r.company as string}</span>,
      sortValue: (r) => r.company as string,
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

const TYPE_CONFIG = {
  default: { doctype: "Item", title: "Inventory", subtitle: "Stock levels and warehouse management" },
  entry: { doctype: "Stock Entry", title: "Stock Entries", subtitle: "Track stock movements" },
  warehouse: { doctype: "Warehouse", title: "Warehouses", subtitle: "Manage your warehouses" },
} as const;

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

function InventoryPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "default";
  const config = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.default;
  const isItem = type === "default" || !type;

  const { addToast } = useToasts();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | GenericRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList(config.doctype, { page, limit: 100 });

  const items = useMemo(
    () =>
      isItem
        ? (rawList as Record<string, unknown>[]).map(mapErpItem)
        : type === "entry"
          ? (rawList as Record<string, unknown>[]).map(mapStockEntry)
          : (rawList as Record<string, unknown>[]).map(mapWarehouse),
    [rawList, isItem, type],
  );

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, search]);

  const itemColumns = useMemo(() => getItemColumns(setDeleteTarget as (row: InventoryItem) => void), []);
  const stockEntryColumns = useMemo(() => getStockEntryColumns(setDeleteTarget as (row: GenericRow) => void), []);
  const warehouseColumns = useMemo(() => getWarehouseColumns(setDeleteTarget as (row: GenericRow) => void), []);

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
    if (isItem) {
      downloadCsv(
        filtered as unknown as Record<string, unknown>[],
        [
          { key: "id", label: "ID" },
          { key: "item", label: "Item" },
          { key: "warehouse", label: "Warehouse" },
          { key: "qty", label: "Qty" },
          { key: "value", label: "Value" },
          { key: "uom", label: "UOM" },
          { key: "status", label: "Status" },
        ],
        "inventory",
      );
    } else if (type === "entry") {
      downloadCsv(
        filtered as unknown as Record<string, unknown>[],
        [
          { key: "id", label: "ID" },
          { key: "purpose", label: "Purpose" },
          { key: "postingDate", label: "Date" },
          { key: "status", label: "Status" },
        ],
        "stock-entries",
      );
    } else {
      downloadCsv(
        filtered as unknown as Record<string, unknown>[],
        [
          { key: "id", label: "ID" },
          { key: "warehouseName", label: "Name" },
          { key: "warehouseType", label: "Type" },
          { key: "company", label: "Company" },
        ],
        "warehouses",
      );
    }
  }, [filtered, isItem, type]);

  const error =
    queryError instanceof Error ? queryError.message : isError ? `Failed to load ${config.title.toLowerCase()}.` : null;
  const stats = useMemo(() => (isItem ? deriveStats(filtered as InventoryItem[]) : null), [filtered, isItem]);

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{config.title}</h1>
        <p className="text-sm text-muted-foreground">{config.subtitle}</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-1 h-4 w-4" /> Export CSV
        </Button>
        <Button variant="primary" onClick={() => router.push("/dashboard/inventory/new")}>
          + Create New
        </Button>
      </div>
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
              <Package className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Could not load data right now</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up. You can retry or create a new item.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/inventory/new")}>
                + Create New
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
            <SkeletonTable rows={8} columns={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Success / Empty states ---- */
  return (
    <div className="space-y-6">
      {header}
      {isItem && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Items" value={stats.totalItems} />
          <MetricCard
            label="Low Stock"
            value={stats.lowStock}
            subtextVariant={stats.lowStock > 0 ? "error" : "muted"}
          />
          <MetricCard
            label="Out of Stock"
            value={stats.outOfStock}
            subtextVariant={stats.outOfStock > 0 ? "error" : "muted"}
          />
          <MetricCard label="Total Value" value={formatCurrency(stats.totalValue)} />
        </div>
      )}
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
          {isItem ? (
            <DataTable<InventoryItem>
              columns={itemColumns}
              data={filtered as InventoryItem[]}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/inventory/${encodeURIComponent(record.id)}`)}
              loading={false}
              emptyState={
                <EmptyState
                  icon={<Package className="h-6 w-6" />}
                  title={MODULE_EMPTY_STATES.inventory.title}
                  description={MODULE_EMPTY_STATES.inventory.description}
                  actionLabel={MODULE_EMPTY_STATES.inventory.actionLabel}
                  actionHref={MODULE_EMPTY_STATES.inventory.actionLink}
                  supportLine={EMPTY_STATE_SUPPORT_LINE}
                />
              }
              pageSize={20}
            />
          ) : (
            <DataTable<GenericRow>
              columns={type === "entry" ? stockEntryColumns : warehouseColumns}
              data={filtered as GenericRow[]}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/inventory/${encodeURIComponent(record.id)}`)}
              loading={false}
              emptyState={
                <EmptyState
                  icon={type === "entry" ? <ArrowRightLeft className="h-6 w-6" /> : <Warehouse className="h-6 w-6" />}
                  title={`No ${config.title.toLowerCase()} yet`}
                  description={`Create your first ${type === "entry" ? "stock entry" : "warehouse"} to get started.`}
                  actionLabel="Create New"
                  actionHref="/dashboard/inventory/new"
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

export default function InventoryPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading…</div>}
    >
      <InventoryPageInner />
    </Suspense>
  );
}
