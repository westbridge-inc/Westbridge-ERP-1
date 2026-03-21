"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Factory, Download, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useToasts } from "@/components/ui/Toasts";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { formatDate } from "@/lib/locale/date";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import { AIChatPanel } from "@/components/ai/AIChatPanel";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BomRow = {
  name: string;
  item: string;
  quantity: number;
  isActive: string;
  isDefault: string;
};

export type WorkOrderRow = {
  name: string;
  productionItem: string;
  qty: number;
  status: string;
  plannedStartDate: string;
};

/* ------------------------------------------------------------------ */
/*  BOM columns                                                        */
/* ------------------------------------------------------------------ */

const bomColumns: Column<BomRow>[] = [
  {
    id: "name",
    header: "BOM ID",
    accessor: (row) => <span className="font-medium text-foreground">{row.name}</span>,
    sortValue: (row) => row.name,
    width: "180px",
  },
  {
    id: "item",
    header: "Item",
    accessor: (row) => row.item,
    sortValue: (row) => row.item,
  },
  {
    id: "quantity",
    header: "Quantity",
    accessor: (row) => <span className="text-muted-foreground">{row.quantity}</span>,
    sortValue: (row) => row.quantity,
    align: "right",
    width: "100px",
  },
  {
    id: "isActive",
    header: "Is Active",
    accessor: (row) => <Badge status={row.isActive === "Yes" ? "Active" : "Inactive"}>{row.isActive}</Badge>,
    sortValue: (row) => row.isActive,
    width: "100px",
  },
  {
    id: "isDefault",
    header: "Is Default",
    accessor: (row) => <span className="text-muted-foreground">{row.isDefault}</span>,
    sortValue: (row) => row.isDefault,
    width: "100px",
  },
];

/* ------------------------------------------------------------------ */
/*  Work Order columns                                                 */
/* ------------------------------------------------------------------ */

const workOrderColumns: Column<WorkOrderRow>[] = [
  {
    id: "name",
    header: "WO ID",
    accessor: (row) => <span className="font-medium text-foreground">{row.name}</span>,
    sortValue: (row) => row.name,
    width: "180px",
  },
  {
    id: "productionItem",
    header: "Item",
    accessor: (row) => row.productionItem,
    sortValue: (row) => row.productionItem,
  },
  {
    id: "qty",
    header: "Quantity",
    accessor: (row) => <span className="text-muted-foreground">{row.qty}</span>,
    sortValue: (row) => row.qty,
    align: "right",
    width: "100px",
  },
  {
    id: "status",
    header: "Status",
    accessor: (row) => <Badge status={row.status}>{row.status}</Badge>,
    sortValue: (row) => row.status,
    width: "120px",
  },
  {
    id: "plannedStartDate",
    header: "Planned Start Date",
    accessor: (row) => (row.plannedStartDate ? formatDate(row.plannedStartDate) : "\u2014"),
    sortValue: (row) => row.plannedStartDate || "",
    width: "160px",
  },
];

/* ------------------------------------------------------------------ */
/*  Metric card                                                        */
/* ------------------------------------------------------------------ */

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex-1 rounded-xl border border-border/70 bg-card px-6 py-5 transition-shadow hover:shadow-md">
      <p className="text-sm font-medium text-muted-foreground tracking-wide">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight font-display text-foreground">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab types                                                          */
/* ------------------------------------------------------------------ */

type TabKey = "bom" | "workorder";

const TABS: { key: TabKey; label: string }[] = [
  { key: "bom", label: "Bills of Materials" },
  { key: "workorder", label: "Work Orders" },
];

const BOM_STATUS_FILTERS = ["All", "Active", "Inactive"] as const;
const WO_STATUS_FILTERS = ["All", "Draft", "Not Started", "In Process", "Completed", "Stopped", "Cancelled"] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ManufacturingListClientProps {
  bomRows: BomRow[];
  woRows: WorkOrderRow[];
  bomPage: number;
  bomHasMore: boolean;
  woPage: number;
  woHasMore: boolean;
}

export function ManufacturingListClient({
  bomRows,
  woRows,
  bomPage,
  bomHasMore,
  woPage,
  woHasMore,
}: ManufacturingListClientProps) {
  const router = useRouter();
  const { addToast } = useToasts();
  const [activeTab, setActiveTab] = useState<TabKey>("bom");
  const [search, setSearch] = useState("");
  const [bomStatusFilter, setBomStatusFilter] = useState<string>("All");
  const [woStatusFilter, setWoStatusFilter] = useState<string>("All");
  const [deleteTarget, setDeleteTarget] = useState<{ name: string; doctype: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* BOM filtering */
  const filteredBoms = useMemo(() => {
    let result = bomRows;
    if (bomStatusFilter === "Active") {
      result = result.filter((r) => r.isActive === "Yes");
    } else if (bomStatusFilter === "Inactive") {
      result = result.filter((r) => r.isActive === "No");
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
    }
    return result;
  }, [bomRows, search, bomStatusFilter]);

  /* Work order filtering */
  const filteredWos = useMemo(() => {
    let result = woRows;
    if (woStatusFilter !== "All") {
      result = result.filter((r) => r.status === woStatusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
    }
    return result;
  }, [woRows, search, woStatusFilter]);

  const bomColumnsWithActions = useMemo(
    (): Column<BomRow>[] => [
      ...bomColumns,
      {
        id: "actions",
        header: "",
        width: "48px",
        accessor: (row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget({ name: row.name, doctype: "BOM" });
            }}
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Delete ${row.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
      },
    ],
    [],
  );

  const woColumnsWithActions = useMemo(
    (): Column<WorkOrderRow>[] => [
      ...workOrderColumns,
      {
        id: "actions",
        header: "",
        width: "48px",
        accessor: (row) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget({ name: row.name, doctype: "Work Order" });
            }}
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Delete ${row.name}`}
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
      await api.erp.delete(deleteTarget.doctype, deleteTarget.name);
      addToast(`${deleteTarget.name} deleted`, "success");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, router]);

  const handleExport = useCallback(() => {
    if (activeTab === "bom") {
      downloadCsv(
        filteredBoms as unknown as Record<string, unknown>[],
        [
          { key: "name", label: "BOM ID" },
          { key: "item", label: "Item" },
          { key: "quantity", label: "Quantity" },
          { key: "isActive", label: "Is Active" },
          { key: "isDefault", label: "Is Default" },
        ],
        "bom",
      );
    } else {
      downloadCsv(
        filteredWos as unknown as Record<string, unknown>[],
        [
          { key: "name", label: "WO ID" },
          { key: "productionItem", label: "Item" },
          { key: "qty", label: "Quantity" },
          { key: "status", label: "Status" },
          { key: "plannedStartDate", label: "Planned Start Date" },
        ],
        "work-orders",
      );
    }
  }, [activeTab, filteredBoms, filteredWos]);

  const currentPage = activeTab === "bom" ? bomPage : woPage;
  const hasMore = activeTab === "bom" ? bomHasMore : woHasMore;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Manufacturing</h1>
          <p className="text-sm text-muted-foreground">Bills of materials and work orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => router.push("/dashboard/manufacturing/new")}>
            + New {activeTab === "bom" ? "BOM" : "Work Order"}
          </Button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSearch("");
            }}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Metrics */}
      {activeTab === "bom" ? (
        <div className="flex gap-6">
          <MetricCard label="Total BOMs" value={bomRows.length} />
          <MetricCard label="Active" value={bomRows.filter((r) => r.isActive === "Yes").length} />
          <MetricCard label="Default" value={bomRows.filter((r) => r.isDefault === "Yes").length} />
        </div>
      ) : (
        <div className="flex gap-6">
          <MetricCard label="Total Work Orders" value={woRows.length} />
          <MetricCard label="In Process" value={woRows.filter((r) => r.status === "In Process").length} />
          <MetricCard label="Completed" value={woRows.filter((r) => r.status === "Completed").length} />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <Input
              type="search"
              placeholder={activeTab === "bom" ? "Search BOMs..." : "Search work orders..."}
              className="w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-1">
              {activeTab === "bom"
                ? BOM_STATUS_FILTERS.map((s) => (
                    <Button
                      key={s}
                      variant={bomStatusFilter === s ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setBomStatusFilter(s)}
                    >
                      {s}
                    </Button>
                  ))
                : WO_STATUS_FILTERS.map((s) => (
                    <Button
                      key={s}
                      variant={woStatusFilter === s ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setWoStatusFilter(s)}
                    >
                      {s}
                    </Button>
                  ))}
            </div>
          </div>

          {activeTab === "bom" ? (
            <DataTable<BomRow>
              columns={bomColumnsWithActions}
              data={filteredBoms}
              keyExtractor={(row) => row.name}
              onRowClick={(record) => router.push(`/dashboard/manufacturing/${encodeURIComponent(record.name)}`)}
              emptyState={
                <EmptyState
                  icon={<Factory className="h-6 w-6" />}
                  title={MODULE_EMPTY_STATES.manufacturing.title}
                  description={MODULE_EMPTY_STATES.manufacturing.description}
                  actionLabel={MODULE_EMPTY_STATES.manufacturing.actionLabel}
                  actionHref={MODULE_EMPTY_STATES.manufacturing.actionLink}
                  supportLine={EMPTY_STATE_SUPPORT_LINE}
                />
              }
              pageSize={20}
            />
          ) : (
            <DataTable<WorkOrderRow>
              columns={woColumnsWithActions}
              data={filteredWos}
              keyExtractor={(row) => row.name}
              onRowClick={(record) => router.push(`/dashboard/manufacturing/${encodeURIComponent(record.name)}`)}
              emptyState={
                <EmptyState
                  icon={<Factory className="h-6 w-6" />}
                  title={MODULE_EMPTY_STATES.manufacturing.title}
                  description={MODULE_EMPTY_STATES.manufacturing.description}
                  actionLabel={MODULE_EMPTY_STATES.manufacturing.actionLabel}
                  actionHref={MODULE_EMPTY_STATES.manufacturing.actionLink}
                  supportLine={EMPTY_STATE_SUPPORT_LINE}
                />
              }
              pageSize={20}
            />
          )}

          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <span className="text-sm text-muted-foreground">Page {currentPage + 1}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => router.push("?page=" + (currentPage - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => router.push("?page=" + (currentPage + 1))}
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
        title={`Delete ${deleteTarget?.name ?? "record"}?`}
        description="This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />

      <AIChatPanel module="general" />
    </div>
  );
}
