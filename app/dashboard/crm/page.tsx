export const dynamic = "force-dynamic";

import { Briefcase } from "lucide-react";
import { serverErpList } from "@/lib/api/server";
import { ListPageError } from "../_components/ListPageError";
import { CrmPipelineClient } from "./_components/CrmPipelineClient";
import type { Deal } from "./_components/CrmPipelineClient";

/* ------------------------------------------------------------------ */
/*  ERP mapper                                                         */
/* ------------------------------------------------------------------ */

function mapErpOpportunity(d: Record<string, unknown>): Deal {
  const name = String(d.name ?? "");
  const company = String(d.party_name ?? d.opportunity_from ?? "\u2014");
  const amount = Number(d.opportunity_amount ?? 0);
  const contact = String(d.contact_person ?? d.contact_display ?? "\u2014");
  const created = d.creation ?? d.modified;
  const date = created ? String(created) : "";
  const status = String(d.status ?? "Open").trim();
  return { name, company, amount, contact, date, status };
}

/* ------------------------------------------------------------------ */
/*  Page (async Server Component)                                      */
/* ------------------------------------------------------------------ */

export default async function CRMPage() {
  let deals: Deal[] = [];
  let error: string | null = null;

  try {
    const result = await serverErpList("Opportunity");
    deals = (result.data as Record<string, unknown>[]).map(mapErpOpportunity);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load pipeline.";
  }

  if (error) {
    return (
      <ListPageError
        title="CRM Pipeline"
        subtitle="Track deals through your sales pipeline"
        error={error}
        icon={<Briefcase className="h-6 w-6" />}
        createHref="/dashboard/crm/new"
      />
    );
  }

  return <CrmPipelineClient deals={deals} />;
}
