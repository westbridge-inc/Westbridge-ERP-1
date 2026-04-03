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
import { Badge } from "@/components/ui/Badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProjectDoc {
  name: string;
  project_name?: string;
  company?: string;
  status?: string;
  expected_start_date?: string;
  expected_end_date?: string;
  department?: string;
  priority?: string;
  project_type?: string;
  percent_complete?: number;
  total_tasks?: number;
  estimated_costing?: number;
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

function ProjectSkeleton() {
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
            <Skeleton className="h-3 w-full mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error / Not Found states
// ---------------------------------------------------------------------------

function ProjectError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <h2 className="text-lg font-semibold mb-1">Failed to load project</h2>
      <p className="text-sm text-muted-foreground mb-4">Something went wrong while fetching this project.</p>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onRetry}>
          Retry
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/projects">Back to Projects</Link>
        </Button>
      </div>
    </div>
  );
}

function ProjectNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileText className="h-10 w-10 text-muted-foreground mb-4" />
      <h2 className="text-lg font-semibold mb-1">Project not found</h2>
      <p className="text-sm text-muted-foreground mb-4">
        The project you are looking for does not exist or has been deleted.
      </p>
      <Button variant="outline" asChild>
        <Link href="/dashboard/projects">Back to Projects</Link>
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function ProjectDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);

  const [doc, setDoc] = useState<ProjectDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    setError(false);
    setNotFound(false);
    try {
      const result = (await api.erp.get("Project", decodedName)) as ProjectDoc;
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
      await api.erp.delete("Project", decodedName);
      toast.success("Project deleted");
      window.location.href = "/dashboard/projects";
    } catch {
      toast.error("Failed to delete project");
    }
  }

  // -- Render states ----------------------------------------------------------
  if (loading) return <ProjectSkeleton />;
  if (notFound) return <ProjectNotFound />;
  if (error || !doc) return <ProjectError onRetry={fetchDoc} />;

  const status = doc.status || "Open";
  const percent = doc.percent_complete ?? 0;

  // -- Detail fields ----------------------------------------------------------
  const detailFields: DetailField[] = [
    { label: "Start Date", value: formatDate(doc.expected_start_date) },
    { label: "End Date", value: formatDate(doc.expected_end_date) },
    { label: "Company", value: doc.company || "--" },
    { label: "Department", value: doc.department || "--" },
    { label: "Priority", value: doc.priority || "--" },
    { label: "Project Type", value: doc.project_type || "--" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <DetailPageHeader
        backHref="/dashboard/projects"
        backLabel="Back to Projects"
        title={doc.project_name || decodedName}
        subtitle={doc.company}
        status={status}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/projects/${encodeURIComponent(decodedName)}/edit`}>
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

      {/* Details + Summary grid */}
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
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-muted-foreground">% Complete</dt>
                <dd className="text-3xl font-bold tabular-nums mt-0.5">{percent}%</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd className="mt-0.5">
                  <Badge status={status}>{status}</Badge>
                </dd>
              </div>
              {doc.total_tasks != null && (
                <div>
                  <dt className="text-sm text-muted-foreground">Total Tasks</dt>
                  <dd className="text-sm font-medium tabular-nums mt-0.5">{doc.total_tasks}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground">Estimated Cost</dt>
                <dd className="text-sm font-medium tabular-nums mt-0.5">{formatCurrency(doc.estimated_costing)}</dd>
              </div>
            </dl>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{percent}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
