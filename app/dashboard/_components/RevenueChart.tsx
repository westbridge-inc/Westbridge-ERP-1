"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/locale/currency";

interface RevenuePoint {
  month: string;
  value: number;
}

/** Format Y-axis ticks as human-readable ($12K, $1.2M, etc.) */
function formatYTick(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return `$${value}`;
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const isEmpty = !data || data.length === 0;

  const maxValue = data?.length ? Math.max(...data.map((d) => d.value)) : 0;

  return (
    <div
      className="mt-8 rounded-xl border border-border bg-card p-6"
      role="figure"
      aria-label="Revenue chart — last 6 months"
    >
      <p className="font-display text-lg font-semibold text-foreground">Revenue</p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Last 6 months</p>
      {isEmpty ? (
        <div className="mt-4 flex h-64 w-full flex-col items-center justify-center text-center">
          <p className="text-sm font-medium text-foreground">No revenue data yet</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Revenue trends will appear here once you create and submit your first invoices.
          </p>
        </div>
      ) : (
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart data={data} margin={{ top: 0, right: 0, left: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={formatYTick}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                width={54}
                domain={[0, (max: number) => max || maxValue || 1000]}
              />
              <Tooltip
                formatter={(value) => [value != null ? formatCurrency(Number(value), "USD") : "\u2014", "Revenue"]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--foreground)",
                }}
                labelStyle={{ color: "var(--muted-foreground)" }}
              />
              <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#fillRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
