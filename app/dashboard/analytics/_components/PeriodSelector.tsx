"use client";

import type { PeriodKey } from "./types";
import { PERIOD_OPTIONS } from "./types";

interface PeriodSelectorProps {
  period: PeriodKey;
  onPeriodChange: (period: PeriodKey) => void;
}

export function PeriodSelector({ period, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onPeriodChange(opt.value)}
          className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
            period === opt.value
              ? "bg-foreground text-background font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
