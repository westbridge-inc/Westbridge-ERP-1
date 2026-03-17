"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

interface SalarySlipData {
  employee_name: string;
  posting_date: string;
  start_date: string;
  end_date: string;
  gross_pay: number | "";
  total_deduction: number | "";
  net_pay: number | "";
}

const INITIAL_DATA: SalarySlipData = {
  employee_name: "",
  posting_date: new Date().toISOString().slice(0, 10),
  start_date: "",
  end_date: "",
  gross_pay: "",
  total_deduction: "",
  net_pay: "",
};

export default function SalarySlipDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);
  const router = useRouter();

  const [formData, setFormData] = useState<SalarySlipData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchDoc() {
      try {
        setLoading(true);
        const doc = (await api.erp.get("Salary Slip", decodedName)) as Record<string, unknown>;
        if (cancelled) return;
        setFormData({
          employee_name: String(doc.employee_name ?? ""),
          posting_date: String(doc.posting_date ?? ""),
          start_date: String(doc.start_date ?? ""),
          end_date: String(doc.end_date ?? ""),
          gross_pay: doc.gross_pay != null ? Number(doc.gross_pay) : "",
          total_deduction: doc.total_deduction != null ? Number(doc.total_deduction) : "",
          net_pay: doc.net_pay != null ? Number(doc.net_pay) : "",
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load salary slip";
        toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDoc();
    return () => {
      cancelled = true;
    };
  }, [decodedName]);

  const handleChange = useCallback((key: keyof SalarySlipData, value: string | number) => {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-calculate net pay
      if (key === "gross_pay" || key === "total_deduction") {
        const gross = key === "gross_pay" ? Number(value) || 0 : Number(next.gross_pay) || 0;
        const deductions = key === "total_deduction" ? Number(value) || 0 : Number(next.total_deduction) || 0;
        next.net_pay = gross - deductions;
      }
      return next;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!formData.employee_name.trim()) {
      toast.error("Employee is required");
      return;
    }
    if (!formData.posting_date) {
      toast.error("Posting Date is required");
      return;
    }

    setSaving(true);
    try {
      await api.erp.update("Salary Slip", decodedName, {
        employee_name: formData.employee_name,
        posting_date: formData.posting_date,
        start_date: formData.start_date,
        end_date: formData.end_date,
        gross_pay: formData.gross_pay === "" ? 0 : formData.gross_pay,
        total_deduction: formData.total_deduction === "" ? 0 : formData.total_deduction,
        net_pay: formData.net_pay === "" ? 0 : formData.net_pay,
      });
      toast.success("Salary Slip updated successfully");
      router.push("/dashboard/payroll");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [formData, decodedName, router]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await api.erp.delete("Salary Slip", decodedName);
      toast.success("Salary Slip deleted");
      router.push("/dashboard/payroll");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      toast.error(msg);
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [decodedName, router]);

  /* Loading skeleton */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href="/dashboard/payroll" aria-label="Back">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded bg-muted" />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="h-9 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/dashboard/payroll" aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-foreground">
              Salary Slip {decodedName}
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="default"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
            disabled={deleting}
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button variant="default" size="default" disabled={saving} onClick={handleSave}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Salary Slip Details */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Salary Slip Details
          </h2>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="field-employee_name">
              Employee<span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="field-employee_name"
              type="text"
              placeholder="Employee name or ID"
              value={formData.employee_name}
              onChange={(e) => handleChange("employee_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="field-posting_date">
              Posting Date<span className="ml-1 text-destructive">*</span>
            </Label>
            <Input
              id="field-posting_date"
              type="date"
              value={formData.posting_date}
              onChange={(e) => handleChange("posting_date", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pay Period */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Pay Period</h2>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="field-start_date">Start Date</Label>
            <Input
              id="field-start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="field-end_date">End Date</Label>
            <Input
              id="field-end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Earnings & Deductions */}
      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Earnings & Deductions
          </h2>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="field-gross_pay">Gross Pay</Label>
            <Input
              id="field-gross_pay"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.gross_pay !== "" ? String(formData.gross_pay) : ""}
              onChange={(e) =>
                handleChange("gross_pay", e.target.value === "" ? ("" as unknown as number) : Number(e.target.value))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="field-total_deduction">Total Deductions</Label>
            <Input
              id="field-total_deduction"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.total_deduction !== "" ? String(formData.total_deduction) : ""}
              onChange={(e) =>
                handleChange(
                  "total_deduction",
                  e.target.value === "" ? ("" as unknown as number) : Number(e.target.value),
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="field-net_pay">Net Pay</Label>
            <Input
              id="field-net_pay"
              type="number"
              step="0.01"
              value={formData.net_pay !== "" ? String(formData.net_pay) : ""}
              readOnly
              className="bg-muted/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Salary Slip"
        description={`Are you sure you want to delete salary slip "${decodedName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
      />
    </div>
  );
}
