"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface DetailField {
  label: string;
  value: ReactNode;
}

interface DetailGridProps {
  fields: DetailField[];
  summaryFields?: DetailField[];
  summaryTitle?: string;
}

export type { DetailField };

export function DetailGrid({ fields, summaryFields, summaryTitle = "Summary" }: DetailGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="text-sm text-muted-foreground">{field.label}</dt>
                <dd className="text-sm font-medium tabular-nums mt-0.5">{field.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
      {summaryFields && summaryFields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{summaryTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              {summaryFields.map((field, i) => {
                const isLast = i === summaryFields.length - 1;
                return (
                  <div key={field.label} className={isLast ? "border-t border-border pt-2" : ""}>
                    <dt className="text-sm text-muted-foreground">{field.label}</dt>
                    <dd className={`text-sm mt-0.5 tabular-nums ${isLast ? "font-bold" : "font-medium"}`}>
                      {field.value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
