"use client";

import { Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import dynamic from "next/dynamic";
import { PurchaseOrdersTab } from "./_components/PurchaseOrdersTab";
import { PurchaseInvoicesTab } from "./_components/PurchaseInvoicesTab";
import { SuppliersTab } from "./_components/SuppliersTab";

const AIChatPanel = dynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});

function ProcurementPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "default";
  const activeTab = type === "supplier" ? "supplier" : type === "invoice" ? "invoice" : "default";

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === "default") {
        router.push("/dashboard/procurement");
      } else {
        router.push(`/dashboard/procurement?type=${value}`);
      }
    },
    [router],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Procurement</h1>
          <p className="text-sm text-muted-foreground">Manage purchases, invoices, and suppliers.</p>
        </div>
        <Button variant="primary" onClick={() => router.push("/dashboard/procurement/new")}>
          + Create New
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="default">Purchase Orders</TabsTrigger>
          <TabsTrigger value="invoice">Purchase Invoices</TabsTrigger>
          <TabsTrigger value="supplier">Suppliers</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "default" && <PurchaseOrdersTab />}
      {activeTab === "invoice" && <PurchaseInvoicesTab />}
      {activeTab === "supplier" && <SuppliersTab />}

      <AIChatPanel module="inventory" />
    </div>
  );
}

export default function ProcurementPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading…</div>}
    >
      <ProcurementPageInner />
    </Suspense>
  );
}
