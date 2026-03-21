"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

import { ProfileTab } from "./_components/ProfileTab";
import { TeamTab } from "./_components/TeamTab";
import { SecurityTab } from "./_components/SecurityTab";
import { NotificationsTab } from "./_components/NotificationsTab";
import { AppearanceTab } from "./_components/AppearanceTab";
import { BillingTab } from "./_components/BillingTab";
import { IntegrationsTab } from "./_components/IntegrationsTab";
import { ModulesTab } from "./_components/ModulesTab";
import { ApiTab } from "./_components/ApiTab";

const TAB_ITEMS = [
  { id: "general", label: "Profile" },
  { id: "team", label: "Team" },
  { id: "security", label: "Security" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "billing", label: "Billing" },
  { id: "integrations", label: "Integrations" },
  { id: "modules", label: "Modules" },
  { id: "api", label: "API" },
];
const TAB_IDS = TAB_ITEMS.map((t) => t.id);

function SettingsContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const validUrlTab = tabFromUrl && TAB_IDS.includes(tabFromUrl) ? tabFromUrl : null;
  const [localTab, setLocalTab] = useState<string | null>(null);
  const tab = localTab ?? validUrlTab ?? "general";

  const setTab = (id: string) => setLocalTab(id);

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences" />
      <div className="mt-8">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex h-auto flex-wrap gap-1 bg-transparent p-0">
            {TAB_ITEMS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="rounded-md px-3 py-1.5 text-sm">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="mt-6 space-y-6">
        {tab === "general" && <ProfileTab />}
        {tab === "team" && <TeamTab />}
        {tab === "security" && <SecurityTab />}
        {tab === "notifications" && <NotificationsTab />}
        {tab === "appearance" && <AppearanceTab />}
        {tab === "billing" && <BillingTab />}
        {tab === "integrations" && <IntegrationsTab />}
        {tab === "modules" && <ModulesTab />}
        {tab === "api" && <ApiTab />}
        {!TAB_IDS.includes(tab) && (
          <div className="flex flex-col items-center py-12">
            <p className="text-xl font-semibold text-foreground">{TAB_ITEMS.find((t) => t.id === tab)?.label}</p>
            <p className="mt-2 text-base text-muted-foreground">This section is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (!mounted) return <PageSkeleton />;
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SettingsContent />
    </Suspense>
  );
}
