"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, Trash2 } from "lucide-react";
import { EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
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
import { api } from "@/lib/api/client";
import type { Customer } from "./types";
import { mapCustomer } from "./utils";

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

function getCustomerColumns(
  router: ReturnType<typeof useRouter>,
  setDeleteTarget: (row: Customer) => void,
): Column<Customer>[] {
  return [
    {
      id: "customerName",
      header: "Customer Name",
      accessor: (row) => <span className="font-medium text-foreground">{row.customerName}</span>,
      sortValue: (row) => row.customerName,
    },
    {
      id: "customerType",
      header: "Type",
      accessor: (row) => <Badge variant="secondary">{row.customerType}</Badge>,
      sortValue: (row) => row.customerType,
    },
    {
      id: "territory",
      header: "Territory",
      accessor: (row) => <span className="text-muted-foreground">{row.territory}</span>,
      sortValue: (row) => row.territory,
    },
    {
      id: "outstanding",
      header: "Outstanding",
      align: "right",
      accessor: (row) => (
        <span className="font-medium text-foreground tabular-nums">{formatCurrency(row.outstanding)}</span>
      ),
      sortValue: (row) => row.outstanding,
    },
    {
      id: "actions",
      header: "",
      width: "80px",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/invoices?action=new&customer=${encodeURIComponent(row.id)}`);
            }}
            className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={`Create invoice for ${row.customerName}`}
          >
            Invoice
          </button>
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
        </div>
      ),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CustomersTab() {
  const router = useRouter();
  const { addToast } = useToasts();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList("Customer", { page, limit: 100 });

  const customers = useMemo(() => (rawList as Record<string, unknown>[]).map(mapCustomer), [rawList]);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }, [customers, search]);

  const columns = useMemo(() => getCustomerColumns(router, setDeleteTarget), [router]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Customer", deleteTarget.id);
      addToast(`${deleteTarget.id} deleted`, "success");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, refetch]);

  const error = queryError instanceof Error ? queryError.message : isError ? "Failed to load CRM data." : null;

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
            <Users className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">Nothing here yet</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Your ERP backend may be starting up. You can retry or add your first record.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/crm/new")}>
              + Add Customer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-0">
          <SkeletonTable rows={8} columns={5} />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <Input
              type="search"
              placeholder="Search customers..."
              className="w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <DataTable<Customer>
            columns={columns}
            data={filtered}
            keyExtractor={(r) => r.id}
            onRowClick={(record) => router.push(`/dashboard/crm/${encodeURIComponent(record.id)}`)}
            loading={false}
            emptyState={
              <EmptyState
                icon={<Users className="h-6 w-6" />}
                title="No customers yet"
                description="Add your first customer to manage your client relationships."
                actionLabel="Add Customer"
                actionHref="/dashboard/crm/new"
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.id ?? "record"}?`}
        description="This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </>
  );
}
