"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { api } from "@/lib/api/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Field definition for the form. */
export interface FormFieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "currency";
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: unknown;
  /** Groups fields into card sections. Fields without a section go in "Details". */
  section?: string;
  readOnly?: boolean;
}

/** Column definition for a line-item child table. */
export interface LineItemColumnDef {
  key: string;
  label: string;
  type: "text" | "number" | "currency" | "date" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Auto-compute a value from the row, e.g. `(row) => (row.qty as number) * (row.rate as number)` */
  computed?: (row: Record<string, unknown>) => unknown;
}

export interface ErpFormPageProps {
  title: string;
  doctype: string;
  /** If provided, the form is in edit mode — the document is fetched and pre-filled. */
  name?: string;
  fields: FormFieldDef[];
  backHref: string;
  /** Optional line items (child table). */
  lineItemColumns?: LineItemColumnDef[];
  /** Heading shown above the line-items card, e.g. "Items". */
  lineItemLabel?: string;
  /** Key in the document body that holds the child rows, e.g. "items". */
  lineItemChildKey?: string;
  /** Called after a successful create or update. */
  onSuccess?: (result: unknown) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Group an array of fields by their `section` value (default "Details"). */
function groupBySection(fields: FormFieldDef[]): { label: string; fields: FormFieldDef[] }[] {
  const map = new Map<string, FormFieldDef[]>();
  for (const f of fields) {
    const section = f.section ?? "Details";
    if (!map.has(section)) map.set(section, []);
    map.get(section)!.push(f);
  }
  return Array.from(map.entries()).map(([label, fields]) => ({ label, fields }));
}

/** Build default formData from field definitions. */
function buildDefaults(fields: FormFieldDef[]): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const f of fields) {
    data[f.key] = f.defaultValue ?? "";
  }
  return data;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ErpFormPage({
  title,
  doctype,
  name,
  fields,
  backHref,
  lineItemColumns,
  lineItemLabel = "Items",
  lineItemChildKey = "items",
  onSuccess,
}: ErpFormPageProps) {
  const router = useRouter();
  const isEdit = Boolean(name);

  // -- State ----------------------------------------------------------------
  const [formData, setFormData] = useState<Record<string, unknown>>(() => buildDefaults(fields));
  const [lineItems, setLineItems] = useState<Record<string, unknown>[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // -- Edit-mode: fetch document --------------------------------------------
  useEffect(() => {
    if (!isEdit || !name) return;
    let cancelled = false;

    async function fetchDoc() {
      try {
        setLoading(true);
        const doc = (await api.erp.get(doctype, name!)) as Record<string, unknown>;
        if (cancelled) return;

        // Pre-fill form data
        const next: Record<string, unknown> = {};
        for (const f of fields) {
          next[f.key] = doc[f.key] ?? f.defaultValue ?? "";
        }
        setFormData(next);

        // Pre-fill line items
        if (lineItemColumns && lineItemChildKey && Array.isArray(doc[lineItemChildKey])) {
          setLineItems(doc[lineItemChildKey] as Record<string, unknown>[]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load document";
        toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDoc();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctype, name, isEdit]);

  // -- Field change handler -------------------------------------------------
  const handleChange = useCallback((key: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  // -- Line-item helpers ----------------------------------------------------
  const handleLineItemChange = useCallback(
    (rowIndex: number, key: string, value: unknown) => {
      setLineItems((prev) => {
        const next = [...prev];
        next[rowIndex] = { ...next[rowIndex], [key]: value };

        // Re-compute any computed columns for this row
        if (lineItemColumns) {
          for (const col of lineItemColumns) {
            if (col.computed) {
              next[rowIndex][col.key] = col.computed(next[rowIndex]);
            }
          }
        }

        return next;
      });
    },
    [lineItemColumns],
  );

  const addLineItem = useCallback(() => {
    const emptyRow: Record<string, unknown> = {};
    if (lineItemColumns) {
      for (const col of lineItemColumns) {
        emptyRow[col.key] = "";
      }
    }
    setLineItems((prev) => [...prev, emptyRow]);
  }, [lineItemColumns]);

  const removeLineItem = useCallback((index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // -- Save -----------------------------------------------------------------
  const handleSave = useCallback(async () => {
    // Basic required-field validation
    for (const f of fields) {
      if (f.required && (formData[f.key] === "" || formData[f.key] == null)) {
        toast.error(`${f.label} is required`);
        return;
      }
    }

    setSaving(true);
    try {
      // Fetch CSRF token
      const csrfRes = await fetch(API_BASE + "/api/csrf", { credentials: "include" });
      const csrfData = (await csrfRes.json()) as Record<string, unknown>;
      const csrfToken =
        ((csrfData?.data as Record<string, unknown>)?.token as string) ??
        (csrfData?.token as string) ??
        "";

      // Build body
      const body: Record<string, unknown> = { ...formData };
      if (lineItemColumns && lineItemChildKey) {
        body[lineItemChildKey] = lineItems;
      }

      let result: unknown;
      if (isEdit && name) {
        result = await api.erp.update(doctype, name, body);
      } else {
        result = await api.erp.create(doctype, body);
      }

      toast.success(isEdit ? `${doctype} updated successfully` : `${doctype} created successfully`);

      if (onSuccess) {
        onSuccess(result);
      } else {
        router.push(backHref);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }, [formData, lineItems, fields, doctype, name, isEdit, backHref, lineItemColumns, lineItemChildKey, onSuccess, router]);

  // -- Sections -------------------------------------------------------------
  const sections = groupBySection(fields);

  // -- Loading skeleton (edit mode) -----------------------------------------
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Top bar skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="shrink-0" asChild>
              <Link href={backHref} aria-label="Back">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-24 animate-pulse rounded bg-muted" />
        </div>

        {/* Card skeletons */}
        {sections.map((sec) => (
          <Card key={sec.label}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sec.fields.map((f) => (
                <div key={f.key} className="space-y-2">
                  <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-9 w-full animate-pulse rounded bg-muted" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Line items skeleton */}
        {lineItemColumns && lineItemColumns.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-32 w-full animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // -- Render a single field ------------------------------------------------
  function renderField(field: FormFieldDef) {
    const value = formData[field.key];
    const id = `field-${field.key}`;

    switch (field.type) {
      case "text":
        return (
          <Input
            id={id}
            type="text"
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            readOnly={field.readOnly}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        );

      case "number":
      case "currency":
        return (
          <Input
            id={id}
            type="number"
            step="0.01"
            placeholder={field.placeholder}
            value={value != null && value !== "" ? String(value) : ""}
            readOnly={field.readOnly}
            onChange={(e) =>
              handleChange(field.key, e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        );

      case "date":
        return (
          <Input
            id={id}
            type="date"
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            readOnly={field.readOnly}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        );

      case "select":
        return (
          <Select
            value={(value as string) ?? ""}
            onValueChange={(v) => handleChange(field.key, v)}
            disabled={field.readOnly}
          >
            <SelectTrigger id={id}>
              <SelectValue placeholder={field.placeholder ?? "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {(field.options ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "textarea":
        return (
          <textarea
            id={id}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            readOnly={field.readOnly}
            onChange={(e) => handleChange(field.key, e.target.value)}
          />
        );

      default:
        return null;
    }
  }

  // -- Render a line-item cell ----------------------------------------------
  function renderLineItemCell(
    col: LineItemColumnDef,
    row: Record<string, unknown>,
    rowIndex: number,
  ) {
    const cellValue = row[col.key];
    const isComputed = Boolean(col.computed);

    switch (col.type) {
      case "text":
        return (
          <Input
            type="text"
            placeholder={col.placeholder}
            value={(cellValue as string) ?? ""}
            readOnly={isComputed}
            onChange={(e) => handleLineItemChange(rowIndex, col.key, e.target.value)}
            className="h-8 text-sm"
          />
        );

      case "number":
      case "currency":
        return (
          <Input
            type="number"
            step="0.01"
            placeholder={col.placeholder}
            value={cellValue != null && cellValue !== "" ? String(cellValue) : ""}
            readOnly={isComputed}
            onChange={(e) =>
              handleLineItemChange(
                rowIndex,
                col.key,
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className="h-8 text-sm"
          />
        );

      case "date":
        return (
          <Input
            type="date"
            placeholder={col.placeholder}
            value={(cellValue as string) ?? ""}
            readOnly={isComputed}
            onChange={(e) => handleLineItemChange(rowIndex, col.key, e.target.value)}
            className="h-8 text-sm"
          />
        );

      case "select":
        return (
          <Select
            value={(cellValue as string) ?? ""}
            onValueChange={(v) => handleLineItemChange(rowIndex, col.key, v)}
            disabled={isComputed}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder={col.placeholder ?? "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {(col.options ?? []).map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  }

  // -- Main render ----------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href={backHref} aria-label="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          </div>
        </div>
        <Button variant="default" size="default" disabled={saving} onClick={handleSave}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Field sections */}
      {sections.map((sec) => (
        <Card key={sec.label}>
          <CardHeader className="pb-2">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {sec.label}
            </h2>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sec.fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={`field-${f.key}`}>
                  {f.label}
                  {f.required && <span className="ml-1 text-destructive">*</span>}
                </Label>
                {renderField(f)}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Line items */}
      {lineItemColumns && lineItemColumns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {lineItemLabel}
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    #
                  </TableHead>
                  {lineItemColumns.map((col) => (
                    <TableHead
                      key={col.key}
                      className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      {col.label}
                    </TableHead>
                  ))}
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={lineItemColumns.length + 2}
                      className="py-6 text-center text-sm text-muted-foreground"
                    >
                      No items added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  lineItems.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {rowIndex + 1}
                      </TableCell>
                      {lineItemColumns.map((col) => (
                        <TableCell key={col.key}>
                          {renderLineItemCell(col, row, rowIndex)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeLineItem(rowIndex)}
                          aria-label={`Remove row ${rowIndex + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="border-t border-border p-4">
              <Button variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Row
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
