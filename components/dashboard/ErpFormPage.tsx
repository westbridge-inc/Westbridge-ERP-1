"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { ErpFormFields } from "./ErpFormFields";
import { ErpFormLineItems } from "./ErpFormLineItems";
import { ErpFormSkeleton } from "./ErpFormSkeleton";

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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
    // Clear field-level error on change
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
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
    // Build Zod schema dynamically from field definitions for client-side validation
    const schemaShape: Record<string, z.ZodType> = {};
    for (const f of fields) {
      if (f.type === "number" || f.type === "currency") {
        if (f.required) {
          schemaShape[f.key] = z
            .union([z.number(), z.string()])
            .refine((v) => v !== "" && v != null, { message: `${f.label} is required` });
        } else {
          schemaShape[f.key] = z.union([z.number(), z.string()]).optional();
        }
      } else if (f.required) {
        schemaShape[f.key] = z.string().min(1, `${f.label} is required`);
      } else {
        schemaShape[f.key] = z.unknown();
      }
    }
    const schema = z.object(schemaShape);

    // Client-side validation before the network round-trip
    const validation = schema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      for (const issue of validation.error.issues) {
        const key = String(issue.path[0] ?? "");
        if (key && !errors[key]) {
          errors[key] = issue.message;
        }
      }
      setFieldErrors(errors);
      // Show the first error as a toast for visibility
      const firstError = validation.error.issues[0];
      if (firstError) {
        toast.error(firstError.message);
      }
      return;
    }
    setFieldErrors({});

    setSaving(true);
    try {
      // Fetch CSRF token
      const csrfRes = await fetch(API_BASE + "/api/csrf", { credentials: "include" });
      const csrfData = (await csrfRes.json()) as Record<string, unknown>;
      const csrfToken =
        ((csrfData?.data as Record<string, unknown>)?.token as string) ?? (csrfData?.token as string) ?? "";

      // Build body
      const body: Record<string, unknown> = { ...formData };
      if (lineItemColumns && lineItemChildKey) {
        body[lineItemChildKey] = lineItems;
      }

      const payload =
        isEdit && name ? JSON.stringify({ doctype, name, data: body }) : JSON.stringify({ doctype, data: body });

      const res = await fetch(`${API_BASE}/api/erp/doc`, {
        method: isEdit ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: payload,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const message = (errBody as { error?: { message?: string } })?.error?.message ?? `HTTP ${res.status}`;
        throw new Error(message);
      }

      const resBody = await res.json();
      const result: unknown = (resBody as { data: unknown }).data;

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
  }, [
    formData,
    lineItems,
    fields,
    doctype,
    name,
    isEdit,
    backHref,
    lineItemColumns,
    lineItemChildKey,
    onSuccess,
    router,
  ]);

  // -- Sections -------------------------------------------------------------
  const sections = groupBySection(fields);

  // -- Loading skeleton (edit mode) -----------------------------------------
  if (loading) {
    return <ErpFormSkeleton backHref={backHref} fields={fields} lineItemColumns={lineItemColumns} />;
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
            <h1 className="truncate font-display text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          </div>
        </div>
        <Button variant="default" size="default" disabled={saving} onClick={handleSave}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Field sections */}
      <ErpFormFields
        sections={sections}
        formData={formData}
        fieldErrors={fieldErrors}
        onChange={handleChange}
      />

      {/* Line items */}
      {lineItemColumns && lineItemColumns.length > 0 && (
        <ErpFormLineItems
          columns={lineItemColumns}
          rows={lineItems}
          label={lineItemLabel}
          onAdd={addLineItem}
          onRemove={removeLineItem}
          onChange={handleLineItemChange}
        />
      )}
    </div>
  );
}
