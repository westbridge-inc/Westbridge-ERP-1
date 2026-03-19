import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import type { FormFieldDef, LineItemColumnDef } from "./ErpFormPage";

/** Group fields by their `section` value (default "Details"). */
function groupBySection(fields: FormFieldDef[]): { label: string; fields: FormFieldDef[] }[] {
  const map = new Map<string, FormFieldDef[]>();
  for (const f of fields) {
    const section = f.section ?? "Details";
    if (!map.has(section)) map.set(section, []);
    map.get(section)!.push(f);
  }
  return Array.from(map.entries()).map(([label, fields]) => ({ label, fields }));
}

export interface ErpFormSkeletonProps {
  backHref: string;
  fields: FormFieldDef[];
  lineItemColumns?: LineItemColumnDef[];
}

export function ErpFormSkeleton({ backHref, fields, lineItemColumns }: ErpFormSkeletonProps) {
  const sections = groupBySection(fields);

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
