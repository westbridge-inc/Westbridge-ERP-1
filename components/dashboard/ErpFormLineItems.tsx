import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LineItemColumnDef } from "./ErpFormPage";

export interface ErpFormLineItemsProps {
  columns: LineItemColumnDef[];
  rows: Record<string, unknown>[];
  label: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (rowIndex: number, key: string, value: unknown) => void;
}

/** Render a single line-item cell based on column type. */
function renderLineItemCell(
  col: LineItemColumnDef,
  row: Record<string, unknown>,
  rowIndex: number,
  onChange: (rowIndex: number, key: string, value: unknown) => void,
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
          onChange={(e) => onChange(rowIndex, col.key, e.target.value)}
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
            onChange(rowIndex, col.key, e.target.value === "" ? "" : Number(e.target.value))
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
          onChange={(e) => onChange(rowIndex, col.key, e.target.value)}
          className="h-8 text-sm"
        />
      );

    case "select":
      return (
        <Select
          value={(cellValue as string) ?? ""}
          onValueChange={(v) => onChange(rowIndex, col.key, v)}
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

export function ErpFormLineItems({ columns, rows, label, onAdd, onRemove, onChange }: ErpFormLineItemsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </h2>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                #
              </TableHead>
              {columns.map((col) => (
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
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + 2}
                  className="py-6 text-center text-sm text-muted-foreground"
                >
                  No items added yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="text-center text-sm text-muted-foreground">{rowIndex + 1}</TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{renderLineItemCell(col, row, rowIndex, onChange)}</TableCell>
                  ))}
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(rowIndex)}
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
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add Row
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
