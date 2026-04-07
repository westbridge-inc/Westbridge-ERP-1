"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Trash2 } from "lucide-react";
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
import { useErpList } from "@/lib/queries/useErpList";
import { api } from "@/lib/api/client";
import type { Lead } from "./types";
import { LEAD_BADGE, mapLead } from "./utils";
import { LEAD_STATUSES } from "./types";

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

function getLeadColumns(setDeleteTarget: (row: Lead) => void): Column<Lead>[] {
  return [
    {
      id: "leadName",
      header: "Lead Name",
      accessor: (row) => <span className="font-medium text-foreground">{row.leadName}</span>,
      sortValue: (row) => row.leadName,
    },
    {
      id: "companyName",
      header: "Company",
      accessor: (row) => <span className="text-muted-foreground">{row.companyName}</span>,
      sortValue: (row) => row.companyName,
    },
    {
      id: "source",
      header: "Source",
      accessor: (row) => <Badge variant="secondary">{row.source}</Badge>,
      sortValue: (row) => row.source,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <Badge variant={LEAD_BADGE[row.status] ?? "secondary"}>{row.status}</Badge>,
      sortValue: (row) => row.status,
    },
    {
      id: "email",
      header: "Email",
      accessor: (row) => <span className="text-muted-foreground">{row.email}</span>,
      sortValue: (row) => row.email,
    },
    {
      id: "phone",
      header: "Phone",
      accessor: (row) => <span className="text-muted-foreground">{row.phone}</span>,
      sortValue: (row) => row.phone,
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

export function LeadsTab() {
  const router = useRouter();
  const { addToast } = useToasts();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList("Lead", { page, limit: 100 });

  const leads = useMemo(() => (rawList as Record<string, unknown>[]).map(mapLead), [rawList]);

  const filtered = useMemo(() => {
    let rows = leads;
    if (statusFilter !== "All") rows = rows.filter((r) => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    return rows;
  }, [leads, statusFilter, search]);

  const columns = useMemo(() => getLeadColumns(setDeleteTarget), []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Lead", deleteTarget.id);
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
            <UserPlus className="h-6 w-6" />
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
              + Add Lead
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
          <SkeletonTable rows={8} columns={7} />
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
              placeholder="Search leads..."
              className="w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Statuses" : s}
                </option>
              ))}
            </select>
          </div>

          <DataTable<Lead>
            columns={columns}
            data={filtered}
            keyExtractor={(r) => r.id}
            onRowClick={(record) => router.push(`/dashboard/crm/${encodeURIComponent(record.id)}`)}
            loading={false}
            emptyState={
              <EmptyState
                icon={<UserPlus className="h-6 w-6" />}
                title="No leads yet"
                description="Add your first lead to start building your sales funnel."
                actionLabel="Add Lead"
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
