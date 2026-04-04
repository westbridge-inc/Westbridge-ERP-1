"use client";

import nextDynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/locale/currency";

const LazyBarChart = nextDynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const LazyBar = nextDynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const LazyXAxis = nextDynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const LazyYAxis = nextDynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const LazyResponsiveContainer = nextDynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const LazyTooltip = nextDynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });

interface ExpenseChartProps {
  data: { name: string; value: number }[];
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xl font-semibold text-foreground font-display">Revenue by Category</p>
        {data.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No category data available.</p>
        ) : (
          <div className="mt-4 h-48 min-h-[192px] w-full">
            <LazyResponsiveContainer width="100%" height={192}>
              <LazyBarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 80, bottom: 0 }}
              >
                <LazyXAxis type="number" hide />
                <LazyYAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <LazyTooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0), "USD"), "Revenue"]}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.25rem",
                    color: "var(--foreground)",
                  }}
                />
                <LazyBar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </LazyBarChart>
            </LazyResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
