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

const AIChatPanel = nextDynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});

import type { GenericRow } from "./types";
import { mapJournalEntry } from "./utils";

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

const journalColumns: Column<GenericRow>[] = [
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
    id: "voucherType",
    header: "Voucher Type",
    accessor: (r) => <span className="text-muted-foreground">{r.voucherType as string}</span>,
    sortValue: (r) => r.voucherType as string,
  },
  {
    id: "totalDebit",
    header: "Debit",
    align: "right",
    accessor: (r) => (
      <span className="font-medium text-foreground tabular-nums">{formatCurrency(r.totalDebit as number, "USD")}</span>
    ),
    sortValue: (r) => r.totalDebit as number,
  },
  {
    id: "totalCredit",
    header: "Credit",
    align: "right",
    accessor: (r) => (
      <span className="font-medium text-foreground tabular-nums">{formatCurrency(r.totalCredit as number, "USD")}</span>
    ),
    sortValue: (r) => r.totalCredit as number,
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

export function JournalEntriesTab() {
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
  } = useErpList("Journal Entry", { page });

  const data = useMemo(() => (rawList as Record<string, unknown>[]).map(mapJournalEntry), [rawList]);
  const error = queryError instanceof Error ? queryError.message : isError ? "Failed to load journal entries." : null;

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              <Calculator className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Nothing here yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              You haven&apos;t added anything yet. Click below to create your first one — it only takes a moment.
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Refresh
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
            <SkeletonTable rows={6} columns={journalColumns.length} />
          ) : (
            <DataTable<GenericRow>
              columns={journalColumns}
              data={data}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/accounting/${encodeURIComponent(record.id)}`)}
              emptyState={
                <EmptyState
                  icon={<Calculator className="h-6 w-6" />}
                  title="No journal entries yet"
                  description="Create your first journal entry to get started."
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
