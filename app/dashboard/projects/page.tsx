"use client";

import { Suspense, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FolderKanban, ListChecks, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardContent } from "@/components/ui/Card";
import { SkeletonTable } from "@/components/ui/SkeletonTable";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { useErpList } from "@/lib/queries/useErpList";
import { ProjectsTab } from "./_components/ProjectsTab";
import { TasksTab } from "./_components/TasksTab";
import { TimesheetsTab } from "./_components/TimesheetsTab";
import { mapErpProject, deriveProjectStats } from "./_components/utils";
import type { TabValue } from "./_components/types";

const AIChatPanel = dynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});

function ProjectsPageInner() {
  const router = useRouter();
  const view = (useSearchParams().get("view") ?? "projects") as TabValue;
  const {
    data: rawProjects = [],
    isLoading,
    isError,
  } = useErpList("Project", {
    fields: ["name", "status", "percent_complete", "expected_end_date"],
  });
  const stats = useMemo(
    () => deriveProjectStats((rawProjects as Record<string, unknown>[]).map(mapErpProject)),
    [rawProjects],
  );
  const handleTabChange = useCallback((v: string) => router.push(`/dashboard/projects?view=${v}`), [router]);
  const ctaLabel = view === "tasks" ? "Add Task" : view === "timesheets" ? "Log Time" : "Create Project";

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Projects</h1>
        <p className="text-sm text-muted-foreground">Manage and track project progress.</p>
      </div>
      <Button variant="primary" onClick={() => router.push("/dashboard/projects/new")}>
        + {ctaLabel}
      </Button>
    </div>
  );

  if (isError)
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <FolderKanban className="h-6 w-6 text-muted-foreground/50" />
            <p className="text-sm font-medium text-foreground">Nothing here yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Your ERP backend may be starting up.</p>
          </CardContent>
        </Card>
      </div>
    );

  if (isLoading)
    return (
      <div className="space-y-6">
        {header}
        {view === "projects" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="min-h-[88px] rounded-xl border border-border bg-card p-6 animate-pulse" />
            ))}
          </div>
        )}
        <Card>
          <CardContent className="p-0">
            <SkeletonTable rows={8} columns={view === "timesheets" ? 6 : 7} />
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="space-y-6">
      {header}
      {view === "projects" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <MetricCard label="Total Projects" value={stats.total} />
          <MetricCard label="Active" value={stats.active} subtextVariant="success" />
          <MetricCard label="Completed" value={stats.completed} subtextVariant="success" />
          <MetricCard label="Overdue" value={stats.overdue} subtextVariant="error" />
        </div>
      )}
      <Tabs value={view} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="projects">
            <FolderKanban className="h-4 w-4 mr-1.5" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListChecks className="h-4 w-4 mr-1.5" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="timesheets">
            <Clock className="h-4 w-4 mr-1.5" />
            Timesheets
          </TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
          <ProjectsTab />
        </TabsContent>
        <TabsContent value="tasks">
          <TasksTab />
        </TabsContent>
        <TabsContent value="timesheets">
          <TimesheetsTab />
        </TabsContent>
      </Tabs>
      <AIChatPanel module="general" />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center py-16 text-sm text-muted-foreground">Loading...</div>}
    >
      <ProjectsPageInner />
    </Suspense>
  );
}
