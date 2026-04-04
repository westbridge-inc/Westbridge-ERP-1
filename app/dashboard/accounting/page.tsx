"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { AccountingDashboard } from "./_components/AccountingDashboard";
import { JournalEntriesTab } from "./_components/JournalEntriesTab";
import { ChartOfAccountsTab } from "./_components/ChartOfAccountsTab";
import { PaymentsTab } from "./_components/PaymentsTab";
import { ReconciliationTab } from "./_components/ReconciliationTab";

const ACCOUNTING_TABS = [
  { value: "dashboard", label: "Dashboard" },
  { value: "journal", label: "Journal Entries" },
  { value: "coa", label: "Chart of Accounts" },
  { value: "payment", label: "Payments" },
  { value: "reconciliation", label: "Reconciliation" },
] as const;

type AccountingTabValue = (typeof ACCOUNTING_TABS)[number]["value"];

const VALID_TAB_VALUES = new Set<string>(ACCOUNTING_TABS.map((t) => t.value));

function AccountingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const activeTab: AccountingTabValue = type && VALID_TAB_VALUES.has(type) ? (type as AccountingTabValue) : "dashboard";

  const handleTabChange = (value: string) => {
    if (value === "dashboard") {
      router.push("/dashboard/accounting");
    } else {
      router.push(`/dashboard/accounting?type=${value}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Accounting</h1>
          <p className="text-sm text-muted-foreground">Financial management and reporting.</p>
        </div>
        <Button variant="primary" onClick={() => router.push("/dashboard/accounting/new")}>
          + Create New
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          {ACCOUNTING_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {activeTab === "dashboard" && <AccountingDashboard />}
      {activeTab === "journal" && <JournalEntriesTab />}
      {activeTab === "coa" && <ChartOfAccountsTab />}
      {activeTab === "payment" && <PaymentsTab />}
      {activeTab === "reconciliation" && <ReconciliationTab />}
    </div>
  );
}

export default function AccountingPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </div>
      }
    >
      <AccountingPageInner />
    </Suspense>
  );
}
