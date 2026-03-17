import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive/12 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground",
        success: "border-transparent bg-success/12 text-success dark:bg-success/20",
        warning: "border-transparent bg-warning/12 text-warning dark:bg-warning/20 dark:text-warning",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  Paid: "success",
  Active: "success",
  Submitted: "default",
  Draft: "outline",
  Overdue: "destructive",
  Unpaid: "warning",
  Error: "destructive",
};

const Badge = React.memo(function Badge({
  className,
  variant,
  status,
  ref,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof badgeVariants> & {
    status?: string;
  }) {
  const resolvedVariant = variant ?? (status ? (STATUS_VARIANT[status] ?? "secondary") : undefined);
  return (
    <div
      ref={ref}
      data-slot="badge"
      className={cn(badgeVariants({ variant: resolvedVariant }), className)}
      {...props}
    />
  );
});

export { Badge, badgeVariants };
