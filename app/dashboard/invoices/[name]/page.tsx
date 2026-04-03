"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Pencil, Download, MoreHorizontal, Mail, Copy, Printer, Trash2, AlertCircle, FileText } from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { DetailPageHeader } from "@/app/dashboard/_components/DetailPageHeader";
import { DetailGrid } from "@/app/dashboard/_components/DetailGrid";
import type { DetailField } from "@/app/dashboard/_components/DetailGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LineItem {
  item_name?: string;
  item_code?: string;
  qty?: number;
  rate?: number;
  amount?: number;
}

interface InvoiceDoc {
  name: string;
  status?: string;
  docstatus?: number;
  posting_date?: string;
  due_date?: string;
  payment_terms_template?: string;
  currency?: string;
  customer?: string;
  customer_name?: string;
  company?: string;
  net_total?: number;
  total_taxes_and_charges?: number;
  grand_total?: number;
  outstanding_amount?: number;
  items?: LineItem[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr?: string): string {
  if (!dateStr) return "--";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value?: number): string {
  if (value == null) return "$0.00";
  return `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function resolveStatus(doc: InvoiceDoc): string {
  if (doc.status) return doc.status;
  if (doc.docstatus === 0) return "Draft";
  if (doc.docstatus === 2) return "Cancelled";
  return "Submitted";
}

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function InvoiceSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-4 w-16" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Table skeleton */}
      <SkeletonTable rows={3} columns={5} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error / Not Found states
// ---------------------------------------------------------------------------

function InvoiceError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-1">Failed to load invoice</h2>
      <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching this invoice.</p>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function InvoiceNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
      <h2 className="text-lg font-semibold mb-1">Invoice not found</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The invoice you are looking for does not exist or has been deleted.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard/invoices">Back to Invoices</Link>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function InvoiceDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);

  const [doc, setDoc] = useState<InvoiceDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    setError(false);
    setNotFound(false);
    try {
      const result = (await api.erp.get("Sales Invoice", decodedName)) as InvoiceDoc;
      if (!result || !result.name) {
        setNotFound(true);
      } else {
        setDoc(result);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("not found") || msg.includes("404")) {
        setNotFound(true);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [decodedName]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // -- Download PDF handler ---------------------------------------------------
  async function handleDownloadPdf() {
    try {
      const blob = await api.erp.downloadPdf("Sales Invoice", decodedName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${decodedName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    }
  }

  // -- Delete handler ---------------------------------------------------------
  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${decodedName}?`)) return;
    try {
      await api.erp.delete("Sales Invoice", decodedName);
      toast.success("Invoice deleted");
      window.location.href = "/dashboard/invoices";
    } catch {
      toast.error("Failed to delete invoice");
    }
  }

  // -- Render states ----------------------------------------------------------
  if (loading) return <InvoiceSkeleton />;
  if (notFound) return <InvoiceNotFound />;
  if (error || !doc) return <InvoiceError onRetry={fetchDoc} />;

  const status = resolveStatus(doc);
  const paidAmount = (doc.grand_total ?? 0) - (doc.outstanding_amount ?? 0);

  // -- Detail fields ----------------------------------------------------------
  const detailFields: DetailField[] = [
    { label: "Invoice Date", value: formatDate(doc.posting_date) },
    { label: "Due Date", value: formatDate(doc.due_date) },
    {
      label: "Payment Terms",
      value: doc.payment_terms_template || "--",
    },
    { label: "Currency", value: doc.currency || "--" },
    { label: "Customer", value: doc.customer_name || doc.customer || "--" },
    { label: "Company", value: doc.company || "--" },
  ];

  // -- Summary fields ---------------------------------------------------------
  const summaryFields: DetailField[] = [
    { label: "Subtotal", value: formatCurrency(doc.net_total) },
    { label: "Tax", value: formatCurrency(doc.total_taxes_and_charges) },
    { label: "Total", value: formatCurrency(doc.grand_total) },
    { label: "Paid", value: formatCurrency(paidAmount) },
    {
      label: "Outstanding Balance",
      value: formatCurrency(doc.outstanding_amount),
    },
  ];

  const items = doc.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailPageHeader
        backHref="/dashboard/invoices"
        backLabel="Back to Invoices"
        title={decodedName}
        status={status}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/invoices/${encodeURIComponent(decodedName)}/edit`}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download PDF
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Email to Customer
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* Details + Summary grid */}
      <DetailGrid fields={detailFields} summaryFields={summaryFields} summaryTitle="Summary" />

      {/* Line Items */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-12">#</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="pl-6 text-sm text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="text-sm">{item.item_name || item.item_code || "--"}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{item.qty ?? 0}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{formatCurrency(item.rate)}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums pr-6">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Totals row */}
                <TableRow className="border-t-2">
                  <TableCell colSpan={4} className="pl-6 text-sm font-semibold text-right">
                    Total
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-right tabular-nums pr-6">
                    {formatCurrency(doc.grand_total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
