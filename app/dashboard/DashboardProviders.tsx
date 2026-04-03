"use client";

import dynamic from "next/dynamic";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ErpConnectionBanner } from "@/components/dashboard/ErpConnectionBanner";
import { ErpConnectionProvider } from "@/components/dashboard/ErpConnectionContext";
import { OfflineBanner } from "@/components/dashboard/OfflineBanner";
const PageTransition = dynamic(
  () => import("@/components/dashboard/PageTransition").then((m) => ({ default: m.PageTransition })),
  { ssr: false },
);
import { ShortcutsProvider } from "@/components/dashboard/ShortcutsContext";
import { SubscriptionGate } from "@/components/dashboard/SubscriptionGate";
import { TrialBanner } from "@/components/dashboard/TrialBanner";
import { QueryProvider } from "@/components/dashboard/QueryProvider";
import { WebVitalsReporter } from "@/lib/web-vitals";

const AppSidebar = dynamic(() => import("@/components/dashboard/AppSidebar").then((m) => m.AppSidebar), {
  ssr: false,
  loading: () => <div className="w-[260px] min-w-[260px] border-r border-border bg-sidebar" />,
});

export function DashboardProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <SidebarProvider>
        <ShortcutsProvider>
          <ErpConnectionProvider>
            <SubscriptionGate>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <SidebarInset>
                  <TrialBanner />
                  <OfflineBanner />
                  <DashboardHeader />
                  <ErpConnectionBanner />
                  <WebVitalsReporter />
                  <main id="main-content" className="flex-1 overflow-y-auto bg-muted/30 p-6">
                    <PageTransition>{children}</PageTransition>
                  </main>
                </SidebarInset>
              </div>
            </SubscriptionGate>
          </ErpConnectionProvider>
        </ShortcutsProvider>
      </SidebarProvider>
    </QueryProvider>
  );
}
