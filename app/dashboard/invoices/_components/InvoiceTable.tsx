"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { formatCurrency } from "@/lib/locale/currency";
import { formatDate } from "@/lib/locale/date";
import { FileDown, Trash2 } from "lucide-react";
import type { InvoiceRow } from "./types";

interface InvoiceTableProps {
  data: InvoiceRow[];
  visibleColumns: Set<string>;
  idLabel: string;
  dateLabel: string;
  dueDateLabel: string;
  downloadingId: string | null;
  onDownloadPdf: (row: InvoiceRow, e: React.MouseEvent) => void;
  onDeleteClick: (row: InvoiceRow) => void;
  onRowClick: (row: InvoiceRow) => void;
}

export function InvoiceTable({
  data,
  visibleColumns,
  idLabel,
  dateLabel,
  dueDateLabel,
  downloadingId,
  onDownloadPdf,
  onDeleteClick,
  onRowClick,
}: InvoiceTableProps) {
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
          <span className="font-medium text-foreground tabular-nums">{formatCurrency(row.amount, row.currency)}</span>
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
              onClick={(e) => onDownloadPdf(row, e)}
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
                  onDeleteClick(row);
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
    [dateLabel, dueDateLabel, idLabel, onDownloadPdf, downloadingId, onDeleteClick],
  );

  const visibleCols = useMemo(() => columns.filter((c) => visibleColumns.has(c.id)), [columns, visibleColumns]);

  return (
    <DataTable<InvoiceRow>
      columns={visibleCols}
      data={data}
      keyExtractor={(row) => row.id}
      onRowClick={onRowClick}
      emptyTitle="No matching invoices"
      emptyDescription="Try adjusting your search or filter criteria."
      pageSize={20}
    />
  );
}
