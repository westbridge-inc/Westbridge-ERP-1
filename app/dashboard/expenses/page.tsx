export const dynamic = "force-dynamic";

import { Receipt } from "lucide-react";
import { serverErpList } from "@/lib/api/server";
import { HydrateClient } from "@/lib/queries/HydrateClient";
import { ListPageError } from "../_components/ListPageError";
import { ExpensesListClient } from "./_components/ExpensesListClient";
import type { ExpenseRow } from "./_components/ExpensesListClient";

/* ------------------------------------------------------------------ */
/*  ERP mapper                                                         */
/* ------------------------------------------------------------------ */

function mapErpExpense(d: Record<string, unknown>): ExpenseRow {
  const amount = Number(d.total_sanctioned_amount ?? d.total_claimed_amount ?? d.grand_total ?? 0);
  return {
    name: String(d.name ?? ""),
    postingDate: String(d.posting_date ?? d.creation ?? ""),
    description: String(d.remark ?? d.employee_remarks ?? "Expense claim"),
    category: String(d.expense_type ?? "\u2014"),
    amount,
    submittedBy: String(d.employee_name ?? d.owner ?? "\u2014"),
    status: String(d.status ?? "Draft").trim(),
  };
}

/* ------------------------------------------------------------------ */
/*  Page (async Server Component)                                      */
/* ------------------------------------------------------------------ */

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "0");

  let rows: ExpenseRow[] = [];
  let currentPage = page;
  let hasMore = false;
  let error: string | null = null;
  let rawData: unknown[] = [];
  let rawMeta: { page: number; pageSize: number; hasMore: boolean } = { page, pageSize: 20, hasMore: false };

  try {
    const result = await serverErpList("Expense Claim", { page });
    rawData = result.data as unknown[];
    rawMeta = result.meta;
    rows = (result.data as Record<string, unknown>[]).map(mapErpExpense);
    currentPage = result.meta.page;
    hasMore = result.meta.hasMore;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load expense claims.";
  }

  if (error) {
    return (
      <ListPageError
        title="Expenses"
        subtitle="Track and manage business expenses."
        error={error}
        icon={<Receipt className="h-6 w-6" />}
        createHref="/dashboard/expenses/new"
        createLabel="+ Add Expense"
      />
    );
  }

  const queryParams = { page };

  return (
    <>
      <HydrateClient queryKey={["erp", "Expense Claim", queryParams]} data={{ data: rawData, meta: rawMeta }} />
      <ExpensesListClient rows={rows} currentPage={currentPage} hasMore={hasMore} />
    </>
  );
}
