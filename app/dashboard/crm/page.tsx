"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/Button";
import dynamic from "next/dynamic";
import type { CrmView } from "./_components/types";
import { TAB_CONFIG } from "./_components/types";
import { OpportunitiesTab } from "./_components/OpportunitiesTab";
import { CustomersTab } from "./_components/CustomersTab";
import { LeadsTab } from "./_components/LeadsTab";

const AIChatPanel = dynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});

function CRMPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = (searchParams.get("view") as CrmView) || "opportunities";

  const switchTab = useCallback(
    (tab: CrmView) => {
      router.push(`/dashboard/crm?view=${tab}`);
    },
    [router],
  );

  const ctaLabel = view === "customers" ? "+ Add Customer" : view === "leads" ? "+ Add Lead" : "+ Add Opportunity";

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

      {view === "opportunities" && <OpportunitiesTab />}
      {view === "customers" && <CustomersTab />}
      {view === "leads" && <LeadsTab />}

      <AIChatPanel module="crm" />
    </div>
  );
}

export default function CRMPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading...</div>}
    >
      <CRMPageInner />
    </Suspense>
  );
}
