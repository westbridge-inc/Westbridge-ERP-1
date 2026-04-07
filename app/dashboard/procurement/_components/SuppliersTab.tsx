"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Truck, Trash2, Download } from "lucide-react";
import { EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToasts } from "@/components/ui/Toasts";
import { useErpList } from "@/lib/queries/useErpList";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import type { SupplierRow } from "./types";
import { mapErpSupplier } from "./utils";

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SuppliersTab() {
  const router = useRouter();
  const { addToast } = useToasts();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<SupplierRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList("Supplier", { page });

  const data = useMemo(() => (rawList as Record<string, unknown>[]).map(mapErpSupplier), [rawList]);

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [data, search]);

  const metrics = useMemo(() => ({ total: filtered.length }), [filtered]);

  const columns = useMemo(() => getSupplierColumns(setDeleteTarget), []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Supplier", deleteTarget.id);
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
        { key: "name", label: "Supplier Name" },
        { key: "supplierType", label: "Type" },
        { key: "country", label: "Country" },
      ],
      "suppliers",
    );
  }, [filtered]);

  const error = queryError instanceof Error ? queryError.message : isError ? "Failed to load suppliers." : null;

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
            <Truck className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">Nothing here yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            You haven&apos;t added anything yet. Click below to create your first one — it only takes a moment.
          </p>
          <div className="mt-4 flex gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/procurement/new")}>
              + Add Supplier
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {!loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Suppliers" value={metrics.total} />
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <Input
              placeholder="Search suppliers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-1 h-4 w-4" /> Export CSV
            </Button>
          </div>
          {loading ? (
            <SkeletonTable rows={6} columns={4} />
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
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
