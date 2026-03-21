"use client";

import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  /** Human-readable error message shown to the user. */
  message: string;
  /** Optional retry callback. When provided, a "Try again" button is rendered. */
  onRetry?: () => void;
}

/**
 * Shared error state component for consistent error presentation across pages.
 *
 * @example
 * <ErrorState message="Failed to load invoices." onRetry={() => refetch()} />
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-4 py-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
