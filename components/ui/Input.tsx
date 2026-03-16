import * as React from "react";
import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  ref,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-lg border border-input bg-transparent px-3.5 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:border-foreground/30 focus-visible:ring-1 focus-visible:ring-foreground/10 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
}

export { Input };
