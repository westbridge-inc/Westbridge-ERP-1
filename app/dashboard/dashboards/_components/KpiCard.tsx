"use client";

import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/locale/currency";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  /** Short label such as "Total Revenue". */
  label: string;
  /** Numeric or pre-formatted value to display. */
  value: string | number;
  /** Percentage change vs. the previous period. Positive = up, negative = down. */
  delta?: number;
  /** Direction of the trend, used to colour and pick the arrow icon. */
  trend?: "up" | "down" | "flat";
  /** Optional icon shown in the corner of the card. */
  icon?: LucideIcon;
  /** How to format a numeric `value`. Ignored if `value` is already a string. */
  format?: "currency" | "number" | "percent";
}

function formatValue(value: string | number, format?: KpiCardProps["format"]): string {
  if (typeof value === "string") return value;
  if (format === "currency") return formatCurrency(value, "USD");
  if (format === "percent") return `${value.toFixed(1)}%`;
  // Default: locale-formatted number
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function pickTrend(delta: number | undefined, trend: KpiCardProps["trend"]): "up" | "down" | "flat" {
  if (trend) return trend;
  if (delta == null) return "flat";
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

export function KpiCard({ label, value, delta, trend, icon: Icon, format }: KpiCardProps) {
  const direction = pickTrend(delta, trend);
  const TrendIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;
  const trendColor =
    direction === "up" ? "text-success" : direction === "down" ? "text-destructive" : "text-muted-foreground";
  const formatted = formatValue(value, format);

  return (
    <Card className="hover:shadow-sm transition-shadow" role="region" aria-label={label}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p
              className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight text-foreground font-display tabular-nums truncate"
              title={formatted}
            >
              {formatted}
            </p>
            {delta != null && (
              <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium", trendColor)}>
                <TrendIcon className="size-3.5" aria-hidden="true" />
                <span className="tabular-nums">
                  {delta > 0 ? "+" : ""}
                  {delta.toFixed(1)}%
                </span>
                <span className="text-muted-foreground font-normal">vs prior period</span>
              </div>
            )}
          </div>
          {Icon && (
            <div
              className="shrink-0 size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"
              aria-hidden="true"
            >
              <Icon className="size-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
