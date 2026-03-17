"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  /** Current 1-based page number. */
  page: number;
  /** Number of items displayed per page. */
  perPage: number;
  /** Total number of items across all pages. */
  total: number;
  /** Called with the new page number when the user navigates. */
  onChange: (page: number) => void;
  /** Additional CSS class names for the wrapper element. */
  className?: string;
}

export function Pagination({ page, perPage, total, onChange, className = "" }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const start = Math.min((page - 1) * perPage + 1, total);
  const end = Math.min(page * perPage, total);

  if (total <= 0) return null;

  return (
    <div className={`flex items-center justify-between text-sm text-muted-foreground/60 ${className}`}>
      <span className="text-sm">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="px-2 text-sm font-medium text-muted-foreground">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
