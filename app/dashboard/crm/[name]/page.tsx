"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Pencil, Trash2, AlertCircle, FileText } from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { DetailPageHeader } from "@/app/dashboard/_components/DetailPageHeader";
import { DetailGrid } from "@/app/dashboard/_components/DetailGrid";
import type { DetailField } from "@/app/dashboard/_components/DetailGrid";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PortalInviteButton } from "./_components/PortalInviteButton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OpportunityDoc {
  name: string;
  opportunity_name?: string;
  customer_name?: string;
  status?: string;
  contact_person?: string;
  contact_email?: string;
  contact_mobile?: string;
  source?: string;
  territory?: string;
  opportunity_amount?: number;
  sales_stage?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function CrmSkeleton() {
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
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error / Not Found states
// ---------------------------------------------------------------------------

function CrmError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-1">Failed to load opportunity</h2>
      <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching this opportunity.</p>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/crm">Back to CRM</Link>
        </Button>
      </div>
    </div>
  );
}

function CrmNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
      <h2 className="text-lg font-semibold mb-1">Opportunity not found</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The opportunity you are looking for does not exist or has been deleted.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard/crm">Back to CRM</Link>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function OpportunityDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);

  const [doc, setDoc] = useState<OpportunityDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    setError(false);
    setNotFound(false);
    try {
      const result = (await api.erp.get("Opportunity", decodedName)) as OpportunityDoc;
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

  // -- Delete handler ---------------------------------------------------------
  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${decodedName}?`)) return;
    try {
      await api.erp.delete("Opportunity", decodedName);
      toast.success("Opportunity deleted");
      window.location.href = "/dashboard/crm";
    } catch {
      toast.error("Failed to delete opportunity");
    }
  }

  // -- Render states ----------------------------------------------------------
  if (loading) return <CrmSkeleton />;
  if (notFound) return <CrmNotFound />;
  if (error || !doc) return <CrmError onRetry={fetchDoc} />;

  const status = doc.status || "Open";

  // -- Detail fields ----------------------------------------------------------
  const detailFields: DetailField[] = [
    { label: "Contact Person", value: doc.contact_person || "--" },
    { label: "Email", value: doc.contact_email || "--" },
    { label: "Phone", value: doc.contact_mobile || "--" },
    { label: "Source", value: doc.source || "--" },
    { label: "Territory", value: doc.territory || "--" },
    { label: "Opportunity Amount", value: formatCurrency(doc.opportunity_amount) },
    { label: "Stage", value: doc.sales_stage || "--" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailPageHeader
        backHref="/dashboard/crm"
        backLabel="Back to CRM"
        title={doc.opportunity_name || decodedName}
        subtitle={doc.customer_name}
        status={status}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/crm/${encodeURIComponent(decodedName)}/edit`}>
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

      {/* Details grid (no summary card) */}
      <DetailGrid fields={detailFields} />

      {/* Portal invite */}
      {doc.customer_name && <PortalInviteButton customerName={doc.customer_name} />}
    </div>
  );
}
