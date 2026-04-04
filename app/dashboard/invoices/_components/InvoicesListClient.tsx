"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToasts } from "@/components/ui/Toasts";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import dynamic from "next/dynamic";
import { ImportModal } from "@/components/dashboard/ImportModal";

import type { InvoiceRow, InvoicesListClientProps } from "./types";
import { useDebounce, loadColumnVisibility, saveColumnVisibility, INVOICE_IMPORT_FIELDS } from "./utils";
import { InvoiceEmptyState, InvoiceHeader } from "./InvoiceMetrics";
import { InvoiceFilterBar } from "./InvoiceFilterBar";
import { InvoiceTable } from "./InvoiceTable";

export type { InvoiceRow } from "./types";

const AIChatPanel = dynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});

export function InvoicesListClient({
  invoices,
  currentPage,
  hasMore,
  title = "Invoices",
  subtitle = "Manage and track invoices",
  dateLabel = "Date",
  dueDateLabel = "Due Date",
  searchPlaceholder = "Search invoices...",
  type = "invoice",
}: InvoicesListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToasts();
  const initialFilter = searchParams.get("status") ?? "All";
  const [filter, setFilter] = useState(initialFilter);
  const initialSearch = searchParams.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 400);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const isOrder = type === "order";
  const idLabel = isOrder ? "Order #" : "Invoice #";
  const doctype = isOrder ? "Sales Order" : "Sales Invoice";

  // Column visibility
  const allColumnIds = useMemo(() => ["id", "customer", "amount", "status", "date", "dueDate", "actions"], []);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const stored = loadColumnVisibility(doctype);
    return stored ?? new Set(allColumnIds);
  });
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);

  const columnLabels: Record<string, string> = useMemo(
    () => ({
      id: idLabel,
      customer: "Customer",
      amount: "Amount",
      status: "Status",
      date: dateLabel,
      dueDate: dueDateLabel,
      actions: "Actions",
    }),
    [idLabel, dateLabel, dueDateLabel],
  );

  // Build URL params consistently
  const buildParams = useCallback(
    (overrides: { page?: number; search?: string; status?: string } = {}) => {
      const p = new URLSearchParams();
      p.set("type", type);
      p.set("page", String(overrides.page ?? 0));
      const s = overrides.search ?? debouncedSearch;
      if (s) p.set("search", s);
      const f = overrides.status ?? filter;
      if (f && f !== "All") p.set("status", f);
      return p;
    },
    [type, debouncedSearch, filter],
  );

  const handleFilterChange = useCallback(
    (newFilter: string) => {
      setFilter(newFilter);
      const p = buildParams({ status: newFilter, page: 0 });
      router.push(`?${p.toString()}`);
    },
    [buildParams, router],
  );

  // Server-side search: update URL when debounced search changes
  const prevDebouncedRef = useRef(initialSearch);
  useEffect(() => {
    if (debouncedSearch === prevDebouncedRef.current) return;
    prevDebouncedRef.current = debouncedSearch;
    const p = buildParams({ search: debouncedSearch, page: 0 });
    router.push(`?${p.toString()}`);
  }, [debouncedSearch, buildParams, router]);

  const toggleColumn = useCallback(
    (colId: string) => {
      setVisibleColumns((prev) => {
        const next = new Set(prev);
        if (next.has(colId)) {
          if (next.size <= 1) return prev;
          next.delete(colId);
        } else {
          next.add(colId);
        }
        saveColumnVisibility(doctype, next);
        return next;
      });
    },
    [doctype],
  );

  const handleDownloadPdf = useCallback(
    async (row: InvoiceRow, e: React.MouseEvent) => {
      e.stopPropagation();
      setDownloadingId(row.id);
      try {
        const blob = await api.erp.downloadPdf(doctype, row.id);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${row.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Failed to download PDF", "error");
      } finally {
        setDownloadingId(null);
      }
    },
    [doctype, addToast],
  );

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      return filter === "All" || inv.status === filter;
    });
  }, [invoices, filter]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete(doctype, deleteTarget.id);
      addToast(`${deleteTarget.id} deleted`, "success");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, doctype, addToast, router]);

  const handleExport = useCallback(() => {
    downloadCsv(
      filtered,
      [
        { key: "id", label: idLabel },
        { key: "customer", label: "Customer" },
        { key: "amount", label: "Amount" },
        { key: "currency", label: "Currency" },
        { key: "status", label: "Status" },
        { key: "date", label: dateLabel },
        { key: "dueDate", label: dueDateLabel },
      ],
      doctype.toLowerCase().replace(/\s+/g, "-"),
    );
  }, [filtered, idLabel, dateLabel, dueDateLabel, doctype]);

  if (invoices.length === 0) {
    return (
      <InvoiceEmptyState
        title={title}
        subtitle={subtitle}
        onCreateNew={() => router.push("/dashboard/invoices/new")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <InvoiceHeader
        title={title}
        subtitle={subtitle}
        onCreateNew={() => router.push("/dashboard/invoices/new")}
        onImport={() => setImportOpen(true)}
        onExport={handleExport}
      />

      <Card>
        <CardContent className="p-0">
          <InvoiceFilterBar
            search={search}
            onSearchChange={setSearch}
            filter={filter}
            onFilterChange={handleFilterChange}
            searchPlaceholder={searchPlaceholder}
            allColumnIds={allColumnIds}
            visibleColumns={visibleColumns}
            onToggleColumn={toggleColumn}
            columnsMenuOpen={columnsMenuOpen}
            onColumnsMenuToggle={() => setColumnsMenuOpen((v) => !v)}
            columnLabels={columnLabels}
          />

          <InvoiceTable
            data={filtered}
            visibleColumns={visibleColumns}
            idLabel={idLabel}
            dateLabel={dateLabel}
            dueDateLabel={dueDateLabel}
            downloadingId={downloadingId}
            onDownloadPdf={handleDownloadPdf}
            onDeleteClick={setDeleteTarget}
            onRowClick={(record) => router.push(`/dashboard/invoices/${encodeURIComponent(record.id)}`)}
          />

          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <span className="text-sm text-muted-foreground">Page {currentPage + 1}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => {
                  const p = buildParams({ page: currentPage - 1 });
                  router.push(`?${p.toString()}`);
                }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => {
                  const p = buildParams({ page: currentPage + 1 });
                  router.push(`?${p.toString()}`);
                }}
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
        title={`Delete ${deleteTarget?.id ?? "record"}?`}
        description="This action cannot be undone. The record will be permanently removed."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        doctype={doctype}
        fieldMappings={INVOICE_IMPORT_FIELDS}
        onComplete={() => router.refresh()}
      />

      <AIChatPanel module="finance" />
    </div>
  );
}
