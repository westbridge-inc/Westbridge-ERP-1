"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorStateProps {
  /** Short heading, e.g. "Failed to load invoices". Defaults to "Something went wrong". */
  title?: string;
  /** Human-readable error message shown to the user. */
  message: string;
  /** Optional retry callback. When provided, a "Try again" button is rendered. */
  onRetry?: () => void;
}

/**
 * Shared inline error state with AlertCircle icon, title, description, and
 * optional retry button. Follows the Microsoft-grade spec for error states.
 *
 * @example
 * <ErrorState title="Could not load invoices" message="The server returned an error." onRetry={() => refetch()} />
 */
export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-12 text-center">
      <AlertCircle className="size-8 text-destructive" aria-hidden />
      <p className="text-base font-semibold text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-1" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
