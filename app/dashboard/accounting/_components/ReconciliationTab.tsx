"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calculator } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { formatCurrency } from "@/lib/locale/currency";
import { useErpList } from "@/lib/queries/useErpList";
import nextDynamic from "next/dynamic";

const AIChatPanel = nextDynamic(
  () => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })),
  { ssr: false },
);

import type { GenericRow } from "./types";
import { mapReconciliation } from "./utils";

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const reconciliationColumns: Column<GenericRow>[] = [
  {
    id: "id",
    header: "Entry #",
    accessor: (r) => <span className="font-medium text-foreground">{r.id as string}</span>,
    sortValue: (r) => r.id,
  },
  {
    id: "postingDate",
    header: "Date",
    accessor: (r) => <span className="text-muted-foreground/60">{r.postingDate as string}</span>,
    sortValue: (r) => r.postingDate as string,
  },
  {
    id: "referenceNo",
    header: "Reference",
    accessor: (r) => <span className="text-muted-foreground">{r.referenceNo as string}</span>,
    sortValue: (r) => r.referenceNo as string,
  },
  {
    id: "partyName",
    header: "Party",
    accessor: (r) => <span className="text-muted-foreground">{r.partyName as string}</span>,
    sortValue: (r) => r.partyName as string,
  },
  {
    id: "paidAmount",
    header: "Amount",
    align: "right",
    accessor: (r) => (
      <span className="font-medium text-foreground tabular-nums">{formatCurrency(r.paidAmount as number, "USD")}</span>
    ),
    sortValue: (r) => r.paidAmount as number,
  },
  {
    id: "paymentType",
    header: "Type",
    accessor: (r) => <span className="text-muted-foreground">{r.paymentType as string}</span>,
    sortValue: (r) => r.paymentType as string,
  },
  {
    id: "clearanceDate",
    header: "Clearance Date",
    accessor: (r) => <span className="text-muted-foreground/60">{r.clearanceDate as string}</span>,
    sortValue: (r) => r.clearanceDate as string,
  },
  {
    id: "status",
    header: "Status",
    accessor: (r) => <Badge status={r.status as string}>{r.status as string}</Badge>,
    sortValue: (r) => r.status as string,
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ReconciliationTab() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList("Payment Entry", { page });

  const data = useMemo(() => (rawList as Record<string, unknown>[]).map(mapReconciliation), [rawList]);
  const error =
    queryError instanceof Error ? queryError.message : isError ? "Failed to load reconciliation entries." : null;

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              <Calculator className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Could not load data right now</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up. You can retry or create a new entry.
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/accounting/new")}>
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
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <SkeletonTable rows={6} columns={reconciliationColumns.length} />
          ) : (
            <DataTable<GenericRow>
              columns={reconciliationColumns}
              data={data}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/accounting/${encodeURIComponent(record.id)}`)}
              emptyState={
                <EmptyState
                  icon={<Calculator className="h-6 w-6" />}
                  title="No reconciliation entries yet"
                  description="Create your first reconciliation entry to get started."
                  actionLabel="Create New"
                  actionHref="/dashboard/accounting/new"
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
      <AIChatPanel module="finance" />
    </div>
  );
}
