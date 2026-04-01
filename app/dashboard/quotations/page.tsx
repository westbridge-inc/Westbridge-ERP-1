"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { formatCurrency } from "@/lib/locale/currency";
import { FileBarChart, Download, Trash2 } from "lucide-react";
import { formatDateLong } from "@/lib/locale/date";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { useErpList } from "@/lib/queries/useErpList";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToasts } from "@/components/ui/Toasts";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import { Input } from "@/components/ui/Input";

interface QuotationRow {
  id: string;
  customer: string;
  amount: number;
  validUntil: string;
  status: string;
}

function mapErpQuotation(d: Record<string, unknown>): QuotationRow {
  return {
    id: String(d.name ?? ""),
    customer: String(d.party_name ?? d.customer_name ?? "\u2014"),
    amount: Number(d.grand_total ?? d.net_total ?? 0),
    validUntil: String(d.valid_till ?? ""),
    status: String((d.status ?? d.docstatus === 1) ? "Submitted" : "Draft").trim(),
  };
}

function fmtDate(d: string): string {
  if (!d) return "\u2014";
  try {
    return formatDateLong(d);
  } catch {
    return d;
  }
}

function getColumns(setDeleteTarget: (row: QuotationRow) => void): Column<QuotationRow>[] {
  return [
    {
      id: "id",
      header: "Quote #",
      accessor: (r) => <span className="font-medium text-foreground">{r.id}</span>,
      sortValue: (r) => r.id,
    },
    {
      id: "customer",
      header: "Customer",
      accessor: (r) => <span className="text-muted-foreground">{r.customer}</span>,
      sortValue: (r) => r.customer,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      accessor: (r) => <span className="font-medium text-foreground">{formatCurrency(r.amount, "USD")}</span>,
      sortValue: (r) => r.amount,
    },
    {
      id: "validUntil",
      header: "Valid Until",
      accessor: (r) => <span className="text-muted-foreground/60">{fmtDate(r.validUntil)}</span>,
      sortValue: (r) => r.validUntil,
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

export default function QuotationsPage() {
  const router = useRouter();
  const { addToast } = useToasts();
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<QuotationRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList("Quotation", { page });
  const data = useMemo(() => (rawList as Record<string, unknown>[]).map(mapErpQuotation), [rawList]);
  const error = queryError instanceof Error ? queryError.message : isError ? "Failed to load quotations." : null;

  const filtered = useMemo(() => {
    if (!search) return data;
    const q = search.toLowerCase();
    return data.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [data, search]);

  const columns = useMemo(() => getColumns(setDeleteTarget), []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Quotation", deleteTarget.id);
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
        { key: "id", label: "Quote #" },
        { key: "customer", label: "Customer" },
        { key: "amount", label: "Amount" },
        { key: "validUntil", label: "Valid Until" },
        { key: "status", label: "Status" },
      ],
      "quotations",
    );
  }, [filtered]);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Quotations</h1>
            <p className="text-sm text-muted-foreground">Sales quotations and proposals</p>
          </div>
          <Button variant="primary" onClick={() => router.push("/dashboard/quotations/new")}>
            + Create New
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              <FileBarChart className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Could not load data right now</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up. You can retry or create your first quotation.
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/quotations/new")}>
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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Quotations</h1>
          <p className="text-sm text-muted-foreground">Sales quotations and proposals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => router.push("/dashboard/quotations/new")}>
            + Create New
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Input
              type="search"
              placeholder="Search quotations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {loading ? (
            <SkeletonTable rows={6} columns={5} />
          ) : (
            <DataTable
              columns={columns}
              data={filtered}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/quotations/${encodeURIComponent(record.id)}`)}
              emptyState={
                <EmptyState
                  icon={<FileBarChart className="h-6 w-6" />}
                  title={MODULE_EMPTY_STATES.quotations.title}
                  description={MODULE_EMPTY_STATES.quotations.description}
                  actionLabel={MODULE_EMPTY_STATES.quotations.actionLabel}
                  actionHref={MODULE_EMPTY_STATES.quotations.actionLink}
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
        title="Delete Quotation"
        description={`Are you sure you want to delete ${deleteTarget?.id ?? "this quotation"}? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
      <AIChatPanel module="crm" />
    </div>
  );
}
