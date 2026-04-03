"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Users, UserPlus, Trash2 } from "lucide-react";
import { EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToasts } from "@/components/ui/Toasts";
import { formatDate } from "@/lib/locale/date";
import { formatCurrency } from "@/lib/locale/currency";
import { useErpList } from "@/lib/queries/useErpList";
import { api } from "@/lib/api/client";
import dynamic from "next/dynamic";

const AIChatPanel = dynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Opportunity {
  id: string;
  company: string;
  amount: number;
  status: string;
  contact: string;
  date: string;
}

interface Customer {
  id: string;
  customerName: string;
  customerType: string;
  territory: string;
  outstanding: number;
}

interface Lead {
  id: string;
  leadName: string;
  companyName: string;
  source: string;
  status: string;
  email: string;
  phone: string;
}

/* ------------------------------------------------------------------ */
/*  Badge variant maps                                                 */
/* ------------------------------------------------------------------ */

const OPP_BADGE: Record<string, "outline" | "default" | "success" | "destructive" | "warning"> = {
  Open: "outline",
  Quotation: "default",
  Converted: "success",
  Lost: "destructive",
  Replied: "warning",
};

const LEAD_BADGE: Record<string, "outline" | "default" | "success" | "destructive" | "warning"> = {
  Lead: "outline",
  Open: "default",
  Replied: "warning",
  Converted: "success",
  "Do Not Contact": "destructive",
};

/* ------------------------------------------------------------------ */
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

function mapOpportunity(r: Record<string, unknown>): Opportunity {
  return {
    id: String(r.name ?? ""),
    company: String(r.customer_name ?? r.party_name ?? r.opportunity_from ?? "\u2014"),
    amount: Number(r.opportunity_amount ?? 0),
    status: String(r.status ?? "Open").trim(),
    contact: String(r.contact_person ?? r.contact_display ?? "\u2014"),
    date: String(r.transaction_date ?? r.creation ?? ""),
  };
}

function mapCustomer(r: Record<string, unknown>): Customer {
  return {
    id: String(r.name ?? ""),
    customerName: String(r.customer_name ?? r.name ?? ""),
    customerType: String(r.customer_type ?? "\u2014"),
    territory: String(r.territory ?? "\u2014"),
    outstanding: Number(r.outstanding_amount ?? 0),
  };
}

function mapLead(r: Record<string, unknown>): Lead {
  return {
    id: String(r.name ?? ""),
    leadName: String(r.lead_name ?? r.name ?? ""),
    companyName: String(r.company_name ?? "\u2014"),
    source: String(r.source ?? "\u2014"),
    status: String(r.status ?? "Lead").trim(),
    email: String(r.email_id ?? "\u2014"),
    phone: String(r.phone ?? r.mobile_no ?? "\u2014"),
  };
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

function deriveOppStats(rows: Opportunity[]) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  let pipeline = 0;
  let open = 0;
  let wonThisMonth = 0;
  let lostThisMonth = 0;
  for (const r of rows) {
    pipeline += r.amount;
    if (r.status === "Open") open++;
    const d = new Date(r.date);
    const sameMonth = d.getMonth() === month && d.getFullYear() === year;
    if (r.status === "Converted" && sameMonth) wonThisMonth++;
    if (r.status === "Lost" && sameMonth) lostThisMonth++;
  }
  return { pipeline, open, wonThisMonth, lostThisMonth };
}

/* ------------------------------------------------------------------ */
/*  Columns                                                            */
/* ------------------------------------------------------------------ */

function getOpportunityColumns(
  router: ReturnType<typeof useRouter>,
  setDeleteTarget: (row: Opportunity) => void,
): Column<Opportunity>[] {
  return [
    {
      id: "id",
      header: "Name",
      accessor: (row) => (
        <a
          href={`/dashboard/crm/${encodeURIComponent(row.id)}`}
          className="font-medium text-foreground hover:underline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            router.push(`/dashboard/crm/${encodeURIComponent(row.id)}`);
          }}
        >
          {row.id}
        </a>
      ),
      sortValue: (row) => row.id,
    },
    {
      id: "company",
      header: "Company",
      accessor: (row) => <span className="text-muted-foreground">{row.company}</span>,
      sortValue: (row) => row.company,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      accessor: (row) => <span className="font-medium text-foreground tabular-nums">{formatCurrency(row.amount)}</span>,
      sortValue: (row) => row.amount,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <Badge variant={OPP_BADGE[row.status] ?? "secondary"}>{row.status}</Badge>,
      sortValue: (row) => row.status,
    },
    {
      id: "contact",
      header: "Contact",
      accessor: (row) => <span className="text-muted-foreground">{row.contact}</span>,
      sortValue: (row) => row.contact,
    },
    {
      id: "date",
      header: "Date",
      accessor: (row) => <span className="text-muted-foreground/60">{row.date ? formatDate(row.date) : "\u2014"}</span>,
      sortValue: (row) => row.date,
    },
    {
      id: "actions",
      header: "",
      width: "48px",
      accessor: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(row);
          }}
          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label={`Delete ${row.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];
}

function getCustomerColumns(
  router: ReturnType<typeof useRouter>,
  setDeleteTarget: (row: Customer) => void,
): Column<Customer>[] {
  return [
    {
      id: "customerName",
      header: "Customer Name",
      accessor: (row) => <span className="font-medium text-foreground">{row.customerName}</span>,
      sortValue: (row) => row.customerName,
    },
    {
      id: "customerType",
      header: "Type",
      accessor: (row) => <Badge variant="secondary">{row.customerType}</Badge>,
      sortValue: (row) => row.customerType,
    },
    {
      id: "territory",
      header: "Territory",
      accessor: (row) => <span className="text-muted-foreground">{row.territory}</span>,
      sortValue: (row) => row.territory,
    },
    {
      id: "outstanding",
      header: "Outstanding",
      align: "right",
      accessor: (row) => (
        <span className="font-medium text-foreground tabular-nums">{formatCurrency(row.outstanding)}</span>
      ),
      sortValue: (row) => row.outstanding,
    },
    {
      id: "actions",
      header: "",
      width: "80px",
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/invoices?action=new&customer=${encodeURIComponent(row.id)}`);
            }}
            className="rounded px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={`Create invoice for ${row.customerName}`}
          >
            Invoice
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            aria-label={`Delete ${row.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];
}

function getLeadColumns(setDeleteTarget: (row: Lead) => void): Column<Lead>[] {
  return [
    {
      id: "leadName",
      header: "Lead Name",
      accessor: (row) => <span className="font-medium text-foreground">{row.leadName}</span>,
      sortValue: (row) => row.leadName,
    },
    {
      id: "companyName",
      header: "Company",
      accessor: (row) => <span className="text-muted-foreground">{row.companyName}</span>,
      sortValue: (row) => row.companyName,
    },
    {
      id: "source",
      header: "Source",
      accessor: (row) => <Badge variant="secondary">{row.source}</Badge>,
      sortValue: (row) => row.source,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => <Badge variant={LEAD_BADGE[row.status] ?? "secondary"}>{row.status}</Badge>,
      sortValue: (row) => row.status,
    },
    {
      id: "email",
      header: "Email",
      accessor: (row) => <span className="text-muted-foreground">{row.email}</span>,
      sortValue: (row) => row.email,
    },
    {
      id: "phone",
      header: "Phone",
      accessor: (row) => <span className="text-muted-foreground">{row.phone}</span>,
      sortValue: (row) => row.phone,
    },
    {
      id: "actions",
      header: "",
      width: "48px",
      accessor: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(row);
          }}
          className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label={`Delete ${row.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */

type CrmView = "opportunities" | "customers" | "leads";

const TAB_CONFIG: { key: CrmView; label: string; doctype: string }[] = [
  { key: "opportunities", label: "Opportunities", doctype: "Opportunity" },
  { key: "customers", label: "Customers", doctype: "Customer" },
  { key: "leads", label: "Leads", doctype: "Lead" },
];

const OPP_STATUSES = ["All", "Open", "Quotation", "Converted", "Lost", "Replied"];
const LEAD_STATUSES = ["All", "Lead", "Open", "Replied", "Converted", "Do Not Contact"];

/* ------------------------------------------------------------------ */
/*  Page inner                                                         */
/* ------------------------------------------------------------------ */

function CRMPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToasts();

  const view = (searchParams.get("view") as CrmView) || "opportunities";
  const tabConfig = TAB_CONFIG.find((t) => t.key === view) ?? TAB_CONFIG[0];

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState<Opportunity | Customer | Lead | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    data: rawList = [],
    hasMore,
    page: currentPage,
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
  } = useErpList(tabConfig.doctype, { page, limit: 100 });

  /* ---- Map rows ---- */
  const opportunities = useMemo(
    () => (view === "opportunities" ? (rawList as Record<string, unknown>[]).map(mapOpportunity) : []),
    [rawList, view],
  );
  const customers = useMemo(
    () => (view === "customers" ? (rawList as Record<string, unknown>[]).map(mapCustomer) : []),
    [rawList, view],
  );
  const leads = useMemo(
    () => (view === "leads" ? (rawList as Record<string, unknown>[]).map(mapLead) : []),
    [rawList, view],
  );

  /* ---- Filter ---- */
  const filteredOpps = useMemo(() => {
    let rows = opportunities;
    if (statusFilter !== "All") rows = rows.filter((r) => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    return rows;
  }, [opportunities, statusFilter, search]);

  const filteredCustomers = useMemo(() => {
    let rows = customers;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    return rows;
  }, [customers, search]);

  const filteredLeads = useMemo(() => {
    let rows = leads;
    if (statusFilter !== "All") rows = rows.filter((r) => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    return rows;
  }, [leads, statusFilter, search]);

  /* ---- Stats (opportunities only) ---- */
  const stats = useMemo(() => (view === "opportunities" ? deriveOppStats(opportunities) : null), [opportunities, view]);

  /* ---- Columns ---- */
  const oppColumns = useMemo(
    () => getOpportunityColumns(router, setDeleteTarget as (row: Opportunity) => void),
    [router],
  );
  const custColumns = useMemo(() => getCustomerColumns(router, setDeleteTarget as (row: Customer) => void), [router]);
  const leadColumns = useMemo(() => getLeadColumns(setDeleteTarget as (row: Lead) => void), []);

  /* ---- Delete ---- */
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.erp.delete(tabConfig.doctype, deleteTarget.id);
      addToast(`${deleteTarget.id} deleted`, "success");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, refetch, tabConfig.doctype]);

  /* ---- Tab switch ---- */
  const switchTab = useCallback(
    (tab: CrmView) => {
      setSearch("");
      setStatusFilter("All");
      setPage(0);
      router.push(`/dashboard/crm?view=${tab}`);
    },
    [router],
  );

  const error = queryError instanceof Error ? queryError.message : isError ? "Failed to load CRM data." : null;

  /* ---- Error state ---- */
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="CRM"
          description="Manage your sales pipeline and customer relationships."
          action={
            <Button variant="primary" onClick={() => router.push("/dashboard/crm/new")}>
              + Add Opportunity
            </Button>
          }
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              <Briefcase className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Could not load data right now</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up. You can retry or add your first record.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
              <Button variant="primary" size="sm" onClick={() => router.push("/dashboard/crm/new")}>
                + Add Opportunity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- Loading state ---- */
  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="CRM"
          description="Manage your sales pipeline and customer relationships."
          action={
            <Button variant="primary" onClick={() => router.push("/dashboard/crm/new")}>
              + Add Opportunity
            </Button>
          }
        />
        {view === "opportunities" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-h-[88px] rounded-xl border border-border bg-card p-6 animate-pulse" />
            ))}
          </div>
        )}
        <Card>
          <CardContent className="p-0">
            <SkeletonTable rows={8} columns={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- CTA label per tab ---- */
  const ctaLabel = view === "customers" ? "+ Add Customer" : view === "leads" ? "+ Add Lead" : "+ Add Opportunity";
  const emptyTitle =
    view === "customers" ? "No customers yet" : view === "leads" ? "No leads yet" : "No opportunities yet";
  const emptyIcon =
    view === "customers" ? (
      <Users className="h-6 w-6" />
    ) : view === "leads" ? (
      <UserPlus className="h-6 w-6" />
    ) : (
      <Briefcase className="h-6 w-6" />
    );
  const statusOptions = view === "opportunities" ? OPP_STATUSES : view === "leads" ? LEAD_STATUSES : [];

  /* ---- Success state ---- */
  return (
    <div className="space-y-6">
      <PageHeader
        title="CRM"
        description="Manage your sales pipeline and customer relationships."
        action={
          <Button variant="primary" onClick={() => router.push("/dashboard/crm/new")}>
            {ctaLabel}
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              view === tab.key
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Metrics (opportunities only) */}
      {view === "opportunities" && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Pipeline" value={formatCurrency(stats.pipeline)} />
          <MetricCard label="Open" value={stats.open} />
          <MetricCard label="Won This Month" value={stats.wonThisMonth} subtextVariant="success" />
          <MetricCard label="Lost This Month" value={stats.lostThisMonth} subtextVariant="error" />
        </div>
      )}

      {/* Table card */}
      <Card>
        <CardContent className="p-0">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <Input
              type="search"
              placeholder={`Search ${tabConfig.label.toLowerCase()}...`}
              className="w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {statusOptions.length > 0 && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Statuses" : s}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Data table per tab */}
          {view === "opportunities" && (
            <DataTable<Opportunity>
              columns={oppColumns}
              data={filteredOpps}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/crm/${encodeURIComponent(record.id)}`)}
              loading={false}
              emptyState={
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  description="Add your first opportunity to start tracking your sales pipeline."
                  actionLabel="Add Opportunity"
                  actionHref="/dashboard/crm/new"
                  supportLine={EMPTY_STATE_SUPPORT_LINE}
                />
              }
              pageSize={20}
            />
          )}
          {view === "customers" && (
            <DataTable<Customer>
              columns={custColumns}
              data={filteredCustomers}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/crm/${encodeURIComponent(record.id)}`)}
              loading={false}
              emptyState={
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  description="Add your first customer to manage your client relationships."
                  actionLabel="Add Customer"
                  actionHref="/dashboard/crm/new"
                  supportLine={EMPTY_STATE_SUPPORT_LINE}
                />
              }
              pageSize={20}
            />
          )}
          {view === "leads" && (
            <DataTable<Lead>
              columns={leadColumns}
              data={filteredLeads}
              keyExtractor={(r) => r.id}
              onRowClick={(record) => router.push(`/dashboard/crm/${encodeURIComponent(record.id)}`)}
              loading={false}
              emptyState={
                <EmptyState
                  icon={emptyIcon}
                  title={emptyTitle}
                  description="Add your first lead to start building your sales funnel."
                  actionLabel="Add Lead"
                  actionHref="/dashboard/crm/new"
                  supportLine={EMPTY_STATE_SUPPORT_LINE}
                />
              }
              pageSize={20}
            />
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2">
            <span className="text-sm text-muted-foreground">Page {currentPage + 1}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.id ?? "record"}?`}
        description="This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />

      <AIChatPanel module="crm" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export default function CRMPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading...</div>}
    >
      <CRMPageInner />
    </Suspense>
  );
}
