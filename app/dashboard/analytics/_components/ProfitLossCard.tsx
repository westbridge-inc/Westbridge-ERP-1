"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/locale/currency";
import type { PeriodKey } from "./types";
import { PERIOD_OPTIONS } from "./types";

interface ProfitLossCardProps {
  totalRevenue: number;
  totalExpenses: number;
  profitMargin: number;
  period: PeriodKey;
}

export function ProfitLossCard({ totalRevenue, totalExpenses, profitMargin, period }: ProfitLossCardProps) {
  const netProfit = totalRevenue - totalExpenses;

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-xl font-semibold text-foreground font-display">Profit & Loss Summary</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "This Year"}
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Revenue</span>
            <span className="text-sm font-medium text-foreground tabular-nums">
              {formatCurrency(totalRevenue, "USD")}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Expenses</span>
            <span className="text-sm font-medium text-foreground tabular-nums">
              {formatCurrency(totalExpenses, "USD")}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-semibold text-foreground">Net Profit</span>
            <span
              className={`text-sm font-semibold tabular-nums ${
                netProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(netProfit, "USD")}
            </span>
          </div>
          {totalRevenue > 0 && (
            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-xs text-muted-foreground">Profit Margin</span>
              <span
                className={`text-xs font-medium tabular-nums ${
                  profitMargin >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {profitMargin.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
