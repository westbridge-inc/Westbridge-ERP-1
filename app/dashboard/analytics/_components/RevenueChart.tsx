"use client";

import { useMemo } from "react";
import nextDynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/locale/currency";

const LazyAreaChart = nextDynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const LazyArea = nextDynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const LazyXAxis = nextDynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const LazyYAxis = nextDynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const LazyResponsiveContainer = nextDynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const LazyTooltip = nextDynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const LazyCartesianGrid = nextDynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

interface RevenueChartProps {
  data: { month: string; value: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxVal = useMemo(() => {
    let max = 0;
    data.forEach((d) => {
      if (d.value > max) max = d.value;
    });
    return max > 0 ? max * 1.15 : 100;
  }, [data]);

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xl font-semibold text-foreground font-display">Revenue Trend</p>
        <p className="mt-0.5 text-sm text-muted-foreground">Last 12 months</p>
        <div className="mt-4 h-64 min-h-[256px] w-full">
          <LazyResponsiveContainer width="100%" height={256}>
            <LazyAreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevAnalytics" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <LazyXAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <LazyYAxis hide domain={[0, maxVal]} />
              <LazyTooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0), "USD"), "Revenue"]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.25rem",
                  color: "var(--foreground)",
                }}
                labelStyle={{ color: "var(--muted-foreground)" }}
              />
              <LazyArea
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#fillRevAnalytics)"
              />
            </LazyAreaChart>
          </LazyResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
