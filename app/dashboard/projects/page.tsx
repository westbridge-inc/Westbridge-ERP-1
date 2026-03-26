export const dynamic = "force-dynamic";

import { FolderKanban } from "lucide-react";
import { serverErpList } from "@/lib/api/server";
import { ListPageError } from "../_components/ListPageError";
import { ProjectsListClient } from "./_components/ProjectsListClient";
import type { ProjectRow } from "./_components/ProjectsListClient";

/* ------------------------------------------------------------------ */
/*  ERP mapper                                                         */
/* ------------------------------------------------------------------ */

function mapErpProject(d: Record<string, unknown>): ProjectRow {
  return {
    name: String(d.name ?? ""),
    projectName: String(d.project_name ?? ""),
    status: String(d.status ?? "Open").trim(),
    percentComplete: Number(d.percent_complete ?? 0),
    expectedStartDate: String(d.expected_start_date ?? ""),
    expectedEndDate: String(d.expected_end_date ?? ""),
    company: String(d.company ?? ""),
  };
}

/* ------------------------------------------------------------------ */
/*  Page (async Server Component)                                      */
/* ------------------------------------------------------------------ */

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "0");

  let rows: ProjectRow[] = [];
  let currentPage = page;
  let hasMore = false;
  let error: string | null = null;

  try {
    const result = await serverErpList("Project", {
      page,
      fields: [
        "name",
        "project_name",
        "status",
        "percent_complete",
        "expected_start_date",
        "expected_end_date",
        "company",
      ],
    });
    rows = (result.data as Record<string, unknown>[]).map(mapErpProject);
    currentPage = result.meta.page;
    hasMore = result.meta.hasMore;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load projects.";
  }

  if (error) {
    return (
      <ListPageError
        title="Projects"
        subtitle="Manage projects and track progress"
        error={error}
        icon={<FolderKanban className="h-6 w-6" />}
        createHref="/dashboard/projects/new"
        createLabel="+ New Project"
      />
    );
  }

  return <ProjectsListClient rows={rows} currentPage={currentPage} hasMore={hasMore} />;
}
