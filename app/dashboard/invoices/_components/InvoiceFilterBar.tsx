"use client";

import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Settings2, Check } from "lucide-react";
import { FILTERS } from "./utils";

interface InvoiceFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: string;
  onFilterChange: (value: string) => void;
  searchPlaceholder: string;
  allColumnIds: string[];
  visibleColumns: Set<string>;
  onToggleColumn: (colId: string) => void;
  columnsMenuOpen: boolean;
  onColumnsMenuToggle: () => void;
  columnLabels: Record<string, string>;
}

export function InvoiceFilterBar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  searchPlaceholder,
  allColumnIds,
  visibleColumns,
  onToggleColumn,
  columnsMenuOpen,
  onColumnsMenuToggle,
  columnLabels,
}: InvoiceFilterBarProps) {
  const columnsMenuRef = useRef<HTMLDivElement>(null);
  const columnsButtonRef = useRef<HTMLButtonElement>(null);

  // Close columns menu on click outside
  useEffect(() => {
    if (!columnsMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        columnsMenuRef.current &&
        !columnsMenuRef.current.contains(e.target as Node) &&
        columnsButtonRef.current &&
        !columnsButtonRef.current.contains(e.target as Node)
      ) {
        onColumnsMenuToggle();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [columnsMenuOpen, onColumnsMenuToggle]);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
      <Input
        type="search"
        placeholder={searchPlaceholder}
        className="w-80"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="flex gap-2">
        {FILTERS.map((f) => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f}
            </button>
          );
        })}
      </div>
      {/* Column visibility toggle */}
      <div className="relative ml-auto">
        <button
          ref={columnsButtonRef}
          onClick={onColumnsMenuToggle}
          className="inline-flex items-center gap-1.5 rounded-lg border border-input px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="Toggle columns"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Columns
        </button>
        {columnsMenuOpen && (
          <div
            ref={columnsMenuRef}
            className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-border bg-card p-1 shadow-lg"
          >
            {allColumnIds
              .filter((id) => id !== "actions")
              .map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onToggleColumn(id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded-sm border ${
                      visibleColumns.has(id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input"
                    }`}
                  >
                    {visibleColumns.has(id) && <Check className="h-3 w-3" />}
                  </span>
                  {columnLabels[id] ?? id}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
