"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, Download, Trash2 } from "lucide-react";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/locale/currency";
import { formatDate } from "@/lib/locale/date";
import dynamic from "next/dynamic";

const AIChatPanel = dynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToasts } from "@/components/ui/Toasts";
import { downloadCsv } from "@/lib/utils/csv";
import { api } from "@/lib/api/client";
import { Input } from "@/components/ui/Input";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Deal = {
  name: string;
  company: string;
  amount: number;
  contact: string;
  date: string;
  status: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const DEFAULT_STAGES = ["Open", "Quotation", "Negotiation", "Won", "Lost"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface CrmPipelineClientProps {
  deals: Deal[];
}

export function CrmPipelineClient({ deals }: CrmPipelineClientProps) {
  const router = useRouter();
  const { addToast } = useToasts();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Deal | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return deals;
    const q = search.toLowerCase();
    return deals.filter((row) => Object.values(row).some((v) => String(v).toLowerCase().includes(q)));
  }, [deals, search]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete("Opportunity", deleteTarget.name);
      addToast(`${deleteTarget.name} deleted`, "success");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, router]);

  const handleExport = useCallback(() => {
    downloadCsv(
      filtered,
      [
        { key: "name", label: "Name" },
        { key: "company", label: "Company" },
        { key: "amount", label: "Amount" },
        { key: "contact", label: "Contact" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status" },
      ],
      "crm-pipeline",
    );
  }, [filtered]);

  const columns = useMemo(() => {
    const statuses = Array.from(new Set(filtered.map((d) => d.status).filter(Boolean)));
    const order = statuses.length
      ? statuses.sort((a, b) => {
          const ia = DEFAULT_STAGES.indexOf(a);
          const ib = DEFAULT_STAGES.indexOf(b);
          if (ia === -1 && ib === -1) return a.localeCompare(b);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        })
      : DEFAULT_STAGES;
    return order.map((status) => {
      const items = filtered.filter((d) => d.status === status);
      const total = items.reduce((sum, d) => sum + d.amount, 0);
      return { id: status, title: status, count: items.length, total, deals: items };
    });
  }, [filtered]);

  /* ---------- Main render ---------- */
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">CRM Pipeline</h1>
          <p className="text-sm text-muted-foreground">Track deals through your sales pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="primary" asChild>
            <Link href="/dashboard/crm/new">+ Create New</Link>
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Input
          type="search"
          placeholder="Search deals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<Users className="h-6 w-6" />}
              title={MODULE_EMPTY_STATES.crm.title}
              description={MODULE_EMPTY_STATES.crm.description}
              actionLabel={MODULE_EMPTY_STATES.crm.actionLabel}
              actionHref={MODULE_EMPTY_STATES.crm.actionLink}
              supportLine={EMPTY_STATE_SUPPORT_LINE}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div key={col.id} className="min-w-[280px] flex-1 rounded-xl border border-border/70 bg-muted/50 p-3">
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground font-display">{col.title}</h2>
                  <Badge status={col.title}>{col.count}</Badge>
                </div>
                <span className="text-xs font-medium text-muted-foreground/70 tabular-nums">
                  {col.total > 0 ? formatCurrency(col.total, "USD") : "\u2014"}
                </span>
              </div>

              {/* Deal cards */}
              <div className="space-y-3">
                {col.deals.map((deal) => (
                  <div
                    key={deal.name}
                    onClick={() => router.push(`/dashboard/crm/${encodeURIComponent(deal.name)}`)}
                    className="cursor-pointer rounded-lg border border-border/70 bg-card p-4 transition-all duration-150 hover:border-primary/20 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-foreground">{deal.company}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(deal);
                        }}
                        className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label={`Delete ${deal.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                      {deal.amount > 0 ? formatCurrency(deal.amount, "USD") : "\u2014"}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground/60">{deal.contact}</span>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium bg-muted text-muted-foreground">
                          {initials(deal.contact)}
                        </span>
                        <span className="text-xs text-muted-foreground/60">
                          {deal.date ? formatDate(deal.date) : "\u2014"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {col.deals.length === 0 && (
                  <p className="py-8 text-center text-xs text-muted-foreground/60">No deals</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Deal"
        description={`Are you sure you want to delete ${deleteTarget?.name ?? "this deal"}? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
      <AIChatPanel module="crm" />
    </div>
  );
}
