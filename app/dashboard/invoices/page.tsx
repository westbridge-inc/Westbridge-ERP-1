export const dynamic = "force-dynamic";

import { FileText } from "lucide-react";
import { serverErpList } from "@/lib/api/server";
import type { CurrencyCode } from "@/lib/constants";
import { ListPageError } from "../_components/ListPageError";
import { InvoicesListClient } from "./_components/InvoicesListClient";
import type { InvoiceRow } from "./_components/InvoicesListClient";

/* ---------- ERP mapper ---------- */

function mapErpInvoice(d: Record<string, unknown>): InvoiceRow {
  const name = (d.name as string) ?? "";
  const customer = (d.customer_name as string) ?? (d.customer as string) ?? "\u2014";
  const amount = Number(d.grand_total ?? d.outstanding_amount ?? 0);
  const currency = ((d.currency as string) ?? "USD") as CurrencyCode;
  const status = String(d.status ?? "Draft").trim();
  const date = (d.posting_date as string) ?? "";
  const dueDate = (d.due_date as string) ?? "";
  return { id: name, customer, amount, currency, status, date, dueDate };
}

/* ---------- Page (async Server Component) ---------- */

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "0");

  let invoices: InvoiceRow[] = [];
  let currentPage = page;
  let hasMore = false;
  let error: string | null = null;

  try {
    const result = await serverErpList("Sales Invoice", { page });
    invoices = (result.data as Record<string, unknown>[]).map(mapErpInvoice);
    currentPage = result.meta.page;
    hasMore = result.meta.hasMore;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load invoices.";
  }

  if (error) {
    return (
      <ListPageError
        title="Invoices"
        subtitle="Manage and track invoices"
        error={error}
        icon={<FileText className="h-6 w-6" />}
        createHref="/dashboard/invoices/new"
      />
    );
  }

  return (
    <InvoicesListClient
      invoices={invoices}
      currentPage={currentPage}
      hasMore={hasMore}
    />
  );
}
