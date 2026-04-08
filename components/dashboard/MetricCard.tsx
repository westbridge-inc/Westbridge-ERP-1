import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  subtextVariant?: "default" | "success" | "error" | "muted";
  icon?: React.ComponentType<{ className?: string }>;
  trend?: number;
}

export const MetricCard = React.memo(function MetricCard({
  label,
  value,
  subtext,
  subtextVariant = "muted",
  icon: Icon,
  trend,
}: MetricCardProps) {
  const subtextClass =
    subtextVariant === "success"
      ? "text-success"
      : subtextVariant === "error"
        ? "text-destructive"
        : "text-muted-foreground";

  const TrendIcon = trend != null ? (trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus) : null;
  const showTrendBadge = trend != null && trend !== 0;

  return (
    <Card className="@container/card" role="region" aria-label={label}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{value}</CardTitle>
        {showTrendBadge && TrendIcon && (
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <TrendIcon className="size-3" aria-hidden="true" />
              {trend > 0 ? "+" : ""}
              {trend}%
            </Badge>
          </CardAction>
        )}
        {Icon && !showTrendBadge && (
          <CardAction>
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          </CardAction>
        )}
      </CardHeader>
      {subtext && (
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className={cn("line-clamp-1 flex items-center gap-1.5 font-medium", subtextClass)}>{subtext}</div>
        </CardFooter>
      )}
    </Card>
  );
});
