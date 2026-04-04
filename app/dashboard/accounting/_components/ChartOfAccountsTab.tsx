"use client";

import { useState, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Calculator, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { useErpList } from "@/lib/queries/useErpList";
import nextDynamic from "next/dynamic";

const AIChatPanel = nextDynamic(
  () => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })),
  { ssr: false },
);

import type { GenericRow, TreeNode } from "./types";
import { mapAccount, buildAccountTree } from "./utils";

/* ------------------------------------------------------------------ */
/*  COA Tree View                                                      */
/* ------------------------------------------------------------------ */

function COATreeView({ accounts, onRowClick }: { accounts: GenericRow[]; onRowClick: (id: string) => void }) {
  const tree = useMemo(() => buildAccountTree(accounts), [accounts]);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    return new Set(tree.map((n) => n.id));
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  function renderNode(node: TreeNode): ReactNode {
    const isExpanded = expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    const isGroupRow = node.isGroup || hasChildren;

    return (
      <div key={node.id}>
        <div
          className="flex items-center border-b border-border/50 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
          style={{ paddingLeft: `${node.level * 20 + 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpand(node.id);
            } else if (!node.id.startsWith("group-")) {
              onRowClick(node.id);
            }
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(node.id);
                }}
                className="flex-shrink-0 rounded p-0.5 hover:bg-muted"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span className={`text-sm truncate ${isGroupRow ? "font-semibold text-foreground" : "text-foreground"}`}>
              {node.accountName}
            </span>
          </div>
          {node.accountType !== "" && (
            <span className="text-sm text-muted-foreground w-32 text-right flex-shrink-0">{node.accountType}</span>
          )}
          <span className="text-sm text-muted-foreground w-24 text-right flex-shrink-0">{node.rootType}</span>
        </div>
        {isExpanded && hasChildren && node.children.map((child) => renderNode(child))}
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <EmptyState
        icon={<Calculator className="h-6 w-6" />}
        title="No accounts yet"
        description="Create your first account to get started."
        actionLabel="Create New"
        actionHref="/dashboard/accounting/new"
        supportLine={EMPTY_STATE_SUPPORT_LINE}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center border-b border-border px-4 py-2 bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex-1">Account Name</span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-32 text-right">Type</span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-24 text-right">
          Root Type
        </span>
      </div>
      {tree.map((node) => renderNode(node))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ChartOfAccountsTab() {
  const router = useRouter();
  const {
    data: rawList = [],
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList("Account", {
    limit: 200,
    fields: ["name", "account_name", "account_type", "root_type", "is_group", "parent_account"],
  });

  const data = useMemo(() => (rawList as Record<string, unknown>[]).map(mapAccount), [rawList]);
  const error =
    queryError instanceof Error ? queryError.message : isError ? "Failed to load chart of accounts." : null;

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              <Calculator className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Could not load data right now</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up. You can retry or create a new entry.
            </p>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/accounting/new")}>
                + Create New
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <SkeletonTable rows={6} columns={5} />
          ) : (
            <COATreeView
              accounts={data}
              onRowClick={(id) => router.push(`/dashboard/accounting/${encodeURIComponent(id)}`)}
            />
          )}
        </CardContent>
      </Card>
      <AIChatPanel module="finance" />
    </div>
  );
}
