"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Pencil, Trash2, AlertCircle, FileText } from "lucide-react";
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WorkOrderItem {
  item_code?: string;
  required_qty?: number;
  available_qty_at_source?: number;
}

interface WorkOrderDoc {
  name: string;
  production_item?: string;
  status?: string;
  qty?: number;
  produced_qty?: number;
  planned_start_date?: string;
  planned_end_date?: string;
  company?: string;
  required_items?: WorkOrderItem[];
}

interface BomItem {
  item_code?: string;
  qty?: number;
  rate?: number;
  amount?: number;
}

interface BomDoc {
  name: string;
  item?: string;
  quantity?: number;
  rate?: number;
  operating_cost?: number;
  items?: BomItem[];
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

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function ManufacturingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-5 w-32 mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </div>
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
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <SkeletonTable rows={3} columns={3} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error / Not Found states
// ---------------------------------------------------------------------------

function ManufacturingError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-1">Failed to load document</h2>
      <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching this document.</p>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/manufacturing">Back to Manufacturing</Link>
        </Button>
      </div>
    </div>
  );
}

function ManufacturingNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
      <h2 className="text-lg font-semibold mb-1">Document not found</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The document you are looking for does not exist or has been deleted.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard/manufacturing">Back to Manufacturing</Link>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Work Order View
// ---------------------------------------------------------------------------

function WorkOrderView({ doc, decodedName }: { doc: WorkOrderDoc; decodedName: string }) {
  const status = doc.status || "Draft";
  const remaining = (doc.qty ?? 0) - (doc.produced_qty ?? 0);
  const items = doc.required_items ?? [];

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${decodedName}?`)) return;
    try {
      await api.erp.delete("Work Order", decodedName);
      toast.success("Work order deleted");
      window.location.href = "/dashboard/manufacturing";
    } catch {
      toast.error("Failed to delete work order");
    }
  }

  const detailFields: DetailField[] = [
    { label: "Production Item", value: doc.production_item || "--" },
    { label: "Qty to Manufacture", value: String(doc.qty ?? 0) },
    { label: "Status", value: status },
    { label: "Planned Start", value: formatDate(doc.planned_start_date) },
    { label: "Planned End", value: formatDate(doc.planned_end_date) },
    { label: "Company", value: doc.company || "--" },
  ];

  const summaryFields: DetailField[] = [
    { label: "Produced Qty", value: String(doc.produced_qty ?? 0) },
    { label: "Remaining", value: String(remaining) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/dashboard/manufacturing"
        backLabel="Back to Manufacturing"
        title={decodedName}
        subtitle={doc.production_item}
        status={status}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/manufacturing/${encodeURIComponent(decodedName)}/edit?type=Work Order`}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </>
        }
      />

      <DetailGrid fields={detailFields} summaryFields={summaryFields} summaryTitle="Summary" />

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Required Items</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-12">#</TableHead>
                  <TableHead>Item Code</TableHead>
                  <TableHead className="text-right">Required Qty</TableHead>
                  <TableHead className="text-right pr-6">Available Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="pl-6 text-sm text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="text-sm">{item.item_code || "--"}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{item.required_qty ?? 0}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums pr-6">
                      {item.available_qty_at_source ?? 0}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BOM View
// ---------------------------------------------------------------------------

function BomView({ doc, decodedName }: { doc: BomDoc; decodedName: string }) {
  const items = doc.items ?? [];

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${decodedName}?`)) return;
    try {
      await api.erp.delete("BOM", decodedName);
      toast.success("BOM deleted");
      window.location.href = "/dashboard/manufacturing";
    } catch {
      toast.error("Failed to delete BOM");
    }
  }

  const detailFields: DetailField[] = [
    { label: "Item", value: doc.item || "--" },
    { label: "Quantity", value: String(doc.quantity ?? 0) },
    { label: "Rate", value: formatCurrency(doc.rate) },
    { label: "Operating Cost", value: formatCurrency(doc.operating_cost) },
  ];

  return (
    <div className="space-y-6">
      <DetailPageHeader
        backHref="/dashboard/manufacturing"
        backLabel="Back to Manufacturing"
        title={decodedName}
        subtitle={doc.item}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/manufacturing/${encodeURIComponent(decodedName)}/edit?type=BOM`}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </>
        }
      />

      <DetailGrid fields={detailFields} />

      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Materials</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6 w-12">#</TableHead>
                  <TableHead>Item Code</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right pr-6">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="pl-6 text-sm text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="text-sm">{item.item_code || "--"}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{item.qty ?? 0}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums">{formatCurrency(item.rate)}</TableCell>
                    <TableCell className="text-sm text-right tabular-nums pr-6">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ManufacturingDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const isBom = type === "BOM" || decodedName.startsWith("BOM-");
  const doctype = isBom ? "BOM" : "Work Order";

  const [doc, setDoc] = useState<WorkOrderDoc | BomDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    setError(false);
    setNotFound(false);
    try {
      const result = (await api.erp.get(doctype, decodedName)) as WorkOrderDoc | BomDoc;
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
  }, [decodedName, doctype]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  // -- Render states ----------------------------------------------------------
  if (loading) return <ManufacturingSkeleton />;
  if (notFound) return <ManufacturingNotFound />;
  if (error || !doc) return <ManufacturingError onRetry={fetchDoc} />;

  if (isBom) {
    return <BomView doc={doc as BomDoc} decodedName={decodedName} />;
  }
  return <WorkOrderView doc={doc as WorkOrderDoc} decodedName={decodedName} />;
}
