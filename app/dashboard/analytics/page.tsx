"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnalyticsDashboard } from "./_components/AnalyticsDashboard";
import { ProjectsListView, PROJECT_TYPE_CONFIG } from "./_components/ProjectsListView";

function AnalyticsPageInner() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  if (type && PROJECT_TYPE_CONFIG[type]) {
    return <ProjectsListView type={type} />;
  }

  return <AnalyticsDashboard />;
}

export default function AnalyticsPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading...</div>}
    >
      <AnalyticsPageInner />
    </Suspense>
  );
}

export { AnalyticsDashboard };
