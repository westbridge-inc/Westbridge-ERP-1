"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Trash2 } from "lucide-react";
import { EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
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
import { formatDate } from "@/lib/locale/date";
import { formatCurrency } from "@/lib/locale/currency";
import { useErpList } from "@/lib/queries/useErpList";
import { api } from "@/lib/api/client";
import type { Opportunity } from "./types";
import { OPP_BADGE, mapOpportunity, deriveOppStats } from "./utils";
import { OPP_STATUSES } from "./types";

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

function getOpportunityColumns(
  router: ReturnType<typeof useRouter>,
  setDeleteTarget: (row: Opportunity) => void,
): Column<Opportunity>[] {
  return [
    {
      id: "id",
      header: "Name",
      accessor: (row) => (
        <a
          href={`/dashboard/crm/${encodeURIComponent(row.id)}`}
          className="font-medium text-foreground hover:underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/dashboard/crm/${encodeURIComponent(row.id)}`);
          }}
        >
          {row.id}
        </a>
      ),
      sortValue: (row) => row.id,
    },
    {
      id: "company",
      header: "Company",
      accessor: (row) => <span className="text-muted-foreground">{row.company}</span>,
      sortValue: (row) => row.company,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      accessor: (row) => <span className="font-medium text-foreground tabular-nums">{formatCurrency(row.amount)}</span>,
      sortValue: (row) => row.amount,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <Badge variant={OPP_BADGE[row.status] ?? "secondary"}>{row.status}</Badge>,
      sortValue: (row) => row.status,
    },
    {
      id: "contact",
      header: "Contact",
      accessor: (row) => <span className="text-muted-foreground">{row.contact}</span>,
      sortValue: (row) => row.contact,
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
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OpportunitiesTab() {
  const router = useRouter();
  const { addToast } = useToasts();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList("Opportunity", { page, limit: 100 });

  const opportunities = useMemo(
    () => (rawList as Record<string, unknown>[]).map(mapOpportunity),
    [rawList],
  );

  const filtered = useMemo(() => {
    let rows = opportunities;
    if (statusFilter !== "All") rows = rows.filter((r) => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    return rows;
  }, [opportunities, statusFilter, search]);

  const stats = useMemo(() => deriveOppStats(opportunities), [opportunities]);

  const columns = useMemo(
    () => getOpportunityColumns(router, setDeleteTarget),
    [router],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Opportunity", deleteTarget.id);
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
            <Briefcase className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">Could not load data right now</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Your ERP backend may be starting up. You can retry or add your first record.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/crm/new")}>
              + Add Opportunity
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <MetricCard label="Total Pipeline" value={formatCurrency(stats.pipeline)} />
        <MetricCard label="Open" value={stats.open} />
        <MetricCard label="Won This Month" value={stats.wonThisMonth} subtextVariant="success" />
        <MetricCard label="Lost This Month" value={stats.lostThisMonth} subtextVariant="error" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <Input
              type="search"
              placeholder="Search opportunities..."
              className="w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
            >
              {OPP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All Statuses" : s}
                </option>
              ))}
            </select>
          </div>

          <DataTable<Opportunity>
            columns={columns}
            data={filtered}
            keyExtractor={(r) => r.id}
            onRowClick={(record) => router.push(`/dashboard/crm/${encodeURIComponent(record.id)}`)}
            loading={false}
            emptyState={
              <EmptyState
                icon={<Briefcase className="h-6 w-6" />}
                title="No opportunities yet"
                description="Add your first opportunity to start tracking your sales pipeline."
                actionLabel="Add Opportunity"
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
