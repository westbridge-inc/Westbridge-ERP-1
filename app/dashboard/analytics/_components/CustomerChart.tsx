"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/locale/currency";

interface CustomerChartProps {
  data: { name: string; total: number }[];
}

export function CustomerChart({ data }: CustomerChartProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xl font-semibold text-foreground font-display">Top Customers by Revenue</p>
        {data.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No customer data available.</p>
        ) : (
          <ul className="mt-4 space-y-3 text-base">
            {data.map((c, i) => (
              <li key={c.name} className="flex items-center justify-between">
                <span className="text-muted-foreground/60">{i + 1}.</span>
                <span className="flex-1 pl-2 text-foreground">{c.name}</span>
                <span className="font-medium text-foreground tabular-nums">{formatCurrency(c.total, "USD")}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
