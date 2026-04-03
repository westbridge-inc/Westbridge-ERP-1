"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Pencil, Trash2, AlertCircle, FileText } from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";
import { DetailPageHeader } from "@/app/dashboard/_components/DetailPageHeader";
import type { DetailField } from "@/app/dashboard/_components/DetailGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EmployeeDoc {
  name: string;
  employee_name?: string;
  designation?: string;
  status?: string;
  department?: string;
  date_of_joining?: string;
  employment_type?: string;
  company?: string;
  reports_to?: string;
  personal_email?: string;
  company_email?: string;
  cell_phone?: string;
  date_of_birth?: string;
  gender?: string;
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

// ---------------------------------------------------------------------------
// Loading Skeleton
// ---------------------------------------------------------------------------

function EmployeeSkeleton() {
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
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-24 mb-1" />
                  <Skeleton className="h-4 w-20" />
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

function EmployeeError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-1">Failed to load employee</h2>
      <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching this employee.</p>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/hr">Back to HR</Link>
        </Button>
      </div>
    </div>
  );
}

function EmployeeNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
      <h2 className="text-lg font-semibold mb-1">Employee not found</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The employee you are looking for does not exist or has been deleted.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard/hr">Back to HR</Link>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function EmployeeDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);

  const [doc, setDoc] = useState<EmployeeDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    setError(false);
    setNotFound(false);
    try {
      const result = (await api.erp.get("Employee", decodedName)) as EmployeeDoc;
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
      await api.erp.delete("Employee", decodedName);
      toast.success("Employee deleted");
      window.location.href = "/dashboard/hr";
    } catch {
      toast.error("Failed to delete employee");
    }
  }

  // -- Render states ----------------------------------------------------------
  if (loading) return <EmployeeSkeleton />;
  if (notFound) return <EmployeeNotFound />;
  if (error || !doc) return <EmployeeError onRetry={fetchDoc} />;

  const status = doc.status || "Active";

  // -- Detail fields ----------------------------------------------------------
  const detailFields: DetailField[] = [
    { label: "Department", value: doc.department || "--" },
    { label: "Designation", value: doc.designation || "--" },
    { label: "Date of Joining", value: formatDate(doc.date_of_joining) },
    { label: "Employment Type", value: doc.employment_type || "--" },
    { label: "Company", value: doc.company || "--" },
    { label: "Reports To", value: doc.reports_to || "--" },
  ];

  // -- Personal fields (second column) ----------------------------------------
  const personalFields: DetailField[] = [
    { label: "Email", value: doc.personal_email || doc.company_email || "--" },
    { label: "Phone", value: doc.cell_phone || "--" },
    { label: "Date of Birth", value: formatDate(doc.date_of_birth) },
    { label: "Gender", value: doc.gender || "--" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailPageHeader
        backHref="/dashboard/hr"
        backLabel="Back to HR"
        title={doc.employee_name || decodedName}
        subtitle={doc.designation}
        status={status}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/hr/${encodeURIComponent(decodedName)}/edit`}>
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

      {/* Details + Personal grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              {detailFields.map((field) => (
                <div key={field.label}>
                  <dt className="text-sm text-muted-foreground">{field.label}</dt>
                  <dd className="text-sm font-medium tabular-nums mt-0.5">{field.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {personalFields.map((field) => (
                <div key={field.label}>
                  <dt className="text-sm text-muted-foreground">{field.label}</dt>
                  <dd className="text-sm font-medium tabular-nums mt-0.5">{field.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
