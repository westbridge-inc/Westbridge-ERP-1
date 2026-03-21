"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Modal";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { api } from "@/lib/api/client";

/* ---------- types ---------- */

export interface ImportFieldMapping {
  /** The doctype field name (e.g. "customer_name"). */
  field: string;
  /** Human-readable label shown in the UI. */
  label: string;
  /** Whether this field is required for each row. */
  required?: boolean;
}

interface ImportModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the modal is dismissed. */
  onClose: () => void;
  /** The doctype to create documents for (e.g. "Sales Invoice"). */
  doctype: string;
  /** Mapping definitions — user maps CSV columns to these fields. */
  fieldMappings: ImportFieldMapping[];
  /** Called after import completes so parent can refresh data. */
  onComplete?: () => void;
}

type ImportStep = "upload" | "mapping" | "importing" | "done";

interface ImportResult {
  created: number;
  failed: number;
  total: number;
  errors: string[];
}

/* ---------- CSV parser ---------- */

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ",") {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

/* ---------- component ---------- */

export function ImportModal({ open, onClose, doctype, fieldMappings, onComplete }: ImportModalProps) {
  const [step, setStep] = useState<ImportStep>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [columnMap, setColumnMap] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setStep("upload");
    setCsvHeaders([]);
    setCsvRows([]);
    setColumnMap({});
    setResult(null);
    setProgress(0);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        if (typeof text !== "string") return;

        const { headers, rows } = parseCSV(text);
        if (headers.length === 0) return;

        setCsvHeaders(headers);
        setCsvRows(rows);

        // Auto-map columns whose names match field names or labels
        const autoMap: Record<string, string> = {};
        for (const mapping of fieldMappings) {
          const lowerField = mapping.field.toLowerCase();
          const lowerLabel = mapping.label.toLowerCase();
          const matchIdx = headers.findIndex((h) => {
            const lh = h.toLowerCase();
            return lh === lowerField || lh === lowerLabel || lh === lowerField.replace(/_/g, " ");
          });
          if (matchIdx >= 0) {
            autoMap[mapping.field] = headers[matchIdx];
          }
        }
        setColumnMap(autoMap);
        setStep("mapping");
      };
      reader.readAsText(file);

      // Reset file input so re-selecting the same file triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [fieldMappings],
  );

  const handleMapColumn = useCallback((field: string, csvColumn: string) => {
    setColumnMap((prev) => {
      const next = { ...prev };
      if (csvColumn === "__none__") {
        delete next[field];
      } else {
        next[field] = csvColumn;
      }
      return next;
    });
  }, []);

  const canImport = fieldMappings.filter((m) => m.required).every((m) => columnMap[m.field] !== undefined);

  const buildRowData = useCallback(
    (row: string[]): Record<string, unknown> => {
      const data: Record<string, unknown> = {};
      for (const mapping of fieldMappings) {
        const csvCol = columnMap[mapping.field];
        if (csvCol) {
          const colIdx = csvHeaders.indexOf(csvCol);
          if (colIdx >= 0 && row[colIdx] !== undefined) {
            data[mapping.field] = row[colIdx];
          }
        }
      }
      return data;
    },
    [fieldMappings, columnMap, csvHeaders],
  );

  /** Import one-by-one as a fallback when the batch endpoint is unavailable. */
  const importOneByOne = useCallback(
    async (rows: string[][]): Promise<ImportResult> => {
      const total = rows.length;
      let created = 0;
      let failed = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const data = buildRowData(rows[i]);
        try {
          await api.erp.create(doctype, data);
          created++;
        } catch (err) {
          failed++;
          const msg = err instanceof Error ? err.message : "Unknown error";
          if (errors.length < 10) {
            errors.push(`Row ${i + 1}: ${msg}`);
          }
        }
        setProgress(Math.round(((i + 1) / total) * 100));
      }

      return { created, failed, total, errors };
    },
    [buildRowData, doctype],
  );

  const handleImport = useCallback(async () => {
    setStep("importing");
    setProgress(0);

    const total = csvRows.length;

    // Build all items up front
    const items = csvRows.map(buildRowData);

    // Process in batch chunks of up to 100
    const BATCH_SIZE = 100;
    let created = 0;
    let failed = 0;
    const errors: string[] = [];
    let batchAvailable = true;

    for (let offset = 0; offset < items.length; offset += BATCH_SIZE) {
      const chunk = items.slice(offset, offset + BATCH_SIZE);

      if (batchAvailable) {
        try {
          const batchResult = await api.erp.batch(doctype, chunk);
          created += batchResult.created;
          failed += batchResult.failed;
          for (const err of batchResult.errors) {
            if (errors.length < 10) errors.push(err);
          }
          setProgress(Math.round((Math.min(offset + chunk.length, total) / total) * 100));
        } catch {
          // Batch endpoint not available — fall back to one-by-one for remaining rows
          batchAvailable = false;
          const remainingRows = csvRows.slice(offset);
          const fallbackResult = await importOneByOne(remainingRows);
          created += fallbackResult.created;
          failed += fallbackResult.failed;
          for (const err of fallbackResult.errors) {
            if (errors.length < 10) errors.push(err);
          }
          break;
        }
      } else {
        const remainingRows = csvRows.slice(offset, offset + BATCH_SIZE);
        const fallbackResult = await importOneByOne(remainingRows);
        created += fallbackResult.created;
        failed += fallbackResult.failed;
        for (const err of fallbackResult.errors) {
          if (errors.length < 10) errors.push(err);
        }
      }
    }

    setProgress(100);
    setResult({ created, failed, total, errors });
    setStep("done");
  }, [csvRows, buildRowData, doctype, importOneByOne]);

  const handleDone = useCallback(() => {
    handleClose();
    onComplete?.();
  }, [handleClose, onComplete]);

  const previewRows = csvRows.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import {doctype}</DialogTitle>
          <DialogDescription>Upload a CSV file to bulk-create {doctype.toLowerCase()} records.</DialogDescription>
        </DialogHeader>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Upload className="size-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Select a .csv file to import</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileSelect}
              className="hidden"
              id="import-file-input"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Choose File
            </Button>
          </div>
        )}

        {/* Step 2: Column Mapping */}
        {step === "mapping" && (
          <div className="space-y-4">
            {/* Preview table */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Preview ({csvRows.length} rows total)</h4>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {csvHeaders.map((h, i) => (
                        <th key={i} className="whitespace-nowrap px-3 py-2 text-left font-medium text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, ri) => (
                      <tr key={ri} className="border-b border-border last:border-0">
                        {csvHeaders.map((_, ci) => (
                          <td key={ci} className="whitespace-nowrap px-3 py-1.5 text-foreground">
                            {row[ci] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Column mapping */}
            <div>
              <h4 className="mb-2 text-sm font-medium text-foreground">Map Columns</h4>
              <div className="space-y-2">
                {fieldMappings.map((mapping) => (
                  <div key={mapping.field} className="flex items-center gap-3">
                    <span className="w-40 text-sm text-foreground">
                      {mapping.label}
                      {mapping.required && <span className="ml-0.5 text-destructive">*</span>}
                    </span>
                    <Select
                      value={columnMap[mapping.field] ?? "__none__"}
                      onValueChange={(val) => handleMapColumn(mapping.field, val)}
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Select CSV column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">-- Skip --</SelectItem>
                        {csvHeaders.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" disabled={!canImport} onClick={handleImport}>
                Import {csvRows.length} rows
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Importing */}
        {step === "importing" && (
          <div className="space-y-4 py-8">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Importing...</p>
              <p className="mt-1 text-sm text-muted-foreground">{progress}% complete</p>
            </div>
            <div className="mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 4: Done */}
        {step === "done" && result && (
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center gap-3">
              {result.failed === 0 ? (
                <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="size-6 text-success" />
                </div>
              ) : (
                <div className="flex size-12 items-center justify-center rounded-full bg-warning/10">
                  <AlertCircle className="size-6 text-warning" />
                </div>
              )}
              <h4 className="text-base font-semibold text-foreground">Import Complete</h4>
            </div>

            <div className="mx-auto grid max-w-xs grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{result.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{result.created}</p>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{result.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="mb-1 text-xs font-medium text-destructive">Errors:</p>
                <ul className="space-y-0.5 text-xs text-destructive/80">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <DialogFooter>
              <Button variant="primary" onClick={handleDone}>
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
