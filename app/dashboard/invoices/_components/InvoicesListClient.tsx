"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToasts } from "@/components/ui/Toasts";
import { formatCurrency } from "@/lib/locale/currency";
import { formatDate } from "@/lib/locale/date";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import type { CurrencyCode } from "@/lib/constants";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { FileText, Download, Trash2, FileDown, Upload, Settings2, Check } from "lucide-react";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { ImportModal, type ImportFieldMapping } from "@/components/dashboard/ImportModal";

/* ---------- types ---------- */

export interface InvoiceRow {
  id: string;
  customer: string;
  amount: number;
  currency: CurrencyCode;
  status: string;
  date: string;
  dueDate: string;
}

/* ---------- filters ---------- */

const FILTERS = ["All", "Draft", "Unpaid", "Paid", "Overdue"] as const;

/* ---------- import field mappings ---------- */

const INVOICE_IMPORT_FIELDS: ImportFieldMapping[] = [
  { field: "customer", label: "Customer", required: true },
  { field: "posting_date", label: "Posting Date" },
  { field: "due_date", label: "Due Date" },
  { field: "grand_total", label: "Grand Total" },
  { field: "currency", label: "Currency" },
];

/* ---------- column visibility ---------- */

const COLUMN_VISIBILITY_KEY = "westbridge_col_visibility";

function loadColumnVisibility(doctype: string): Set<string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COLUMN_VISIBILITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    const cols = parsed[doctype];
    if (!Array.isArray(cols)) return null;
    return new Set(cols);
  } catch {
    return null;
  }
}

function saveColumnVisibility(doctype: string, visibleIds: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(COLUMN_VISIBILITY_KEY);
    const parsed: Record<string, string[]> = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    parsed[doctype] = Array.from(visibleIds);
    localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(parsed));
  } catch {
    // Storage unavailable
  }
}

/* ---------- debounce helper ---------- */

function useDebounce(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/* ---------- component ---------- */

interface InvoicesListClientProps {
  invoices: InvoiceRow[];
  currentPage: number;
  hasMore: boolean;
  title?: string;
  subtitle?: string;
  dateLabel?: string;
  dueDateLabel?: string;
  searchPlaceholder?: string;
  type?: string;
}

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
  const [filter, setFilter] = useState("All");
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

  // Column visibility (Item #20)
  const allColumnIds = useMemo(() => ["id", "customer", "amount", "status", "date", "dueDate", "actions"], []);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const stored = loadColumnVisibility(doctype);
    return stored ?? new Set(allColumnIds);
  });
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const columnsMenuRef = useRef<HTMLDivElement>(null);
  const columnsButtonRef = useRef<HTMLButtonElement>(null);

  // Close columns menu on click outside
  useEffect(() => {
    if (!columnsMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        columnsMenuRef.current &&
        !columnsMenuRef.current.contains(e.target as Node) &&
        columnsButtonRef.current &&
        !columnsButtonRef.current.contains(e.target as Node)
      ) {
        setColumnsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [columnsMenuOpen]);

  // Server-side search: update URL when debounced search changes (Item #19)
  const prevDebouncedRef = useRef(initialSearch);
  useEffect(() => {
    if (debouncedSearch === prevDebouncedRef.current) return;
    prevDebouncedRef.current = debouncedSearch;

    const params = new URLSearchParams();
    params.set("type", type);
    params.set("page", "0");
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }
    router.push(`?${params.toString()}`);
  }, [debouncedSearch, type, router]);

  const toggleColumn = useCallback(
    (colId: string) => {
      setVisibleColumns((prev) => {
        const next = new Set(prev);
        if (next.has(colId)) {
          // Don't allow hiding all columns — keep at least one
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

  const columns = useMemo(
    (): Column<InvoiceRow>[] => [
      {
        id: "id",
        header: idLabel,
        accessor: (row) => <span className="font-medium text-foreground">{row.id}</span>,
        sortValue: (row) => row.id,
      },
      {
        id: "customer",
        header: "Customer",
        accessor: (row) => <span className="text-muted-foreground">{row.customer}</span>,
        sortValue: (row) => row.customer,
      },
      {
        id: "amount",
        header: "Amount",
        align: "right" as const,
        accessor: (row) => (
          <span className="font-medium text-foreground">{formatCurrency(row.amount, row.currency)}</span>
        ),
        sortValue: (row) => row.amount,
      },
      {
        id: "status",
        header: "Status",
        accessor: (row) => <Badge status={row.status}>{row.status}</Badge>,
        sortValue: (row) => row.status,
      },
      {
        id: "date",
        header: dateLabel,
        accessor: (row) => (
          <span className="text-muted-foreground/60">{row.date ? formatDate(row.date) : "\u2014"}</span>
        ),
        sortValue: (row) => row.date,
      },
      {
        id: "dueDate",
        header: dueDateLabel,
        accessor: (row) => (
          <span className="text-muted-foreground/60">{row.dueDate ? formatDate(row.dueDate) : "\u2014"}</span>
        ),
        sortValue: (row) => row.dueDate,
      },
      {
        id: "actions",
        header: "",
        width: "80px",
        accessor: (row) => (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => handleDownloadPdf(row, e)}
              disabled={downloadingId === row.id}
              className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
              aria-label={`Download PDF for ${row.id}`}
            >
              <FileDown className="h-4 w-4" />
            </button>
            {row.status === "Draft" && (
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
            )}
          </div>
        ),
      },
    ],
    [dateLabel, dueDateLabel, idLabel, handleDownloadPdf, downloadingId],
  );

  // Filter columns by visibility (Item #20)
  const visibleCols = useMemo(() => columns.filter((c) => visibleColumns.has(c.id)), [columns, visibleColumns]);

  // Column labels for the visibility toggle dropdown
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

  // With server-side search (Item #19), we no longer filter by search client-side.
  // The search query is sent to the backend via URL params.
  // Client-side only applies the status filter pill.
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

  /* --- empty state --- */
  if (invoices.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <Button variant="primary" onClick={() => router.push("/dashboard/invoices/new")}>
            + Create New
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<FileText className="h-6 w-6" />}
              title={MODULE_EMPTY_STATES.invoices.title}
              description={MODULE_EMPTY_STATES.invoices.description}
              actionLabel={MODULE_EMPTY_STATES.invoices.actionLabel}
              actionHref={MODULE_EMPTY_STATES.invoices.actionLink}
              supportLine={EMPTY_STATE_SUPPORT_LINE}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* --- success state --- */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
          <Button variant="primary" onClick={() => router.push("/dashboard/invoices/new")}>
            + Create New
          </Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <Input
              type="search"
              placeholder={searchPlaceholder}
              className="w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              {FILTERS.map((f) => {
                const isActive = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
            {/* Column visibility toggle (Item #20) */}
            <div className="relative ml-auto">
              <button
                ref={columnsButtonRef}
                onClick={() => setColumnsMenuOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Toggle columns"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Columns
              </button>
              {columnsMenuOpen && (
                <div
                  ref={columnsMenuRef}
                  className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-lg"
                >
                  {allColumnIds
                    .filter((id) => id !== "actions")
                    .map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleColumn(id)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
                      >
                        <span
                          className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                            visibleColumns.has(id)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input"
                          }`}
                        >
                          {visibleColumns.has(id) && <Check className="h-3 w-3" />}
                        </span>
                        {columnLabels[id] ?? id}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          <DataTable<InvoiceRow>
            columns={visibleCols}
            data={filtered}
            keyExtractor={(row) => row.id}
            onRowClick={(record) => router.push(`/dashboard/invoices/${encodeURIComponent(record.id)}`)}
            emptyTitle="No matching invoices"
            emptyDescription="Try adjusting your search or filter criteria."
            pageSize={20}
          />
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <span className="text-sm text-muted-foreground">Page {currentPage + 1}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => {
                  const p = new URLSearchParams({ type, page: String(currentPage - 1) });
                  if (search) p.set("search", search);
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
                  const p = new URLSearchParams({ type, page: String(currentPage + 1) });
                  if (search) p.set("search", search);
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
