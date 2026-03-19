import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import type { FormFieldDef } from "./ErpFormPage";

export interface ErpFormFieldsProps {
  sections: { label: string; fields: FormFieldDef[] }[];
  formData: Record<string, unknown>;
  fieldErrors: Record<string, string>;
  onChange: (key: string, value: unknown) => void;
}

/** Render a single form field based on its type definition. */
function renderField(
  field: FormFieldDef,
  value: unknown,
  onChange: (key: string, value: unknown) => void,
) {
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
          onChange={(e) => onChange(field.key, e.target.value)}
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
          onChange={(e) => onChange(field.key, e.target.value === "" ? "" : Number(e.target.value))}
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
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    case "select":
      return (
        <Select
          value={(value as string) ?? ""}
          onValueChange={(v) => onChange(field.key, v)}
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
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      );

    default:
      return null;
  }
}

export function ErpFormFields({ sections, formData, fieldErrors, onChange }: ErpFormFieldsProps) {
  return (
    <>
      {sections.map((sec) => (
        <Card key={sec.label}>
          <CardHeader className="pb-2">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{sec.label}</h2>
          </CardHeader>
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sec.fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label htmlFor={`field-${f.key}`}>
                  {f.label}
                  {f.required && <span className="ml-1 text-destructive">*</span>}
                </Label>
                {renderField(f, formData[f.key], onChange)}
                {fieldErrors[f.key] && <p className="text-xs text-destructive">{fieldErrors[f.key]}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
