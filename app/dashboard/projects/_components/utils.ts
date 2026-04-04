import type { ProjectRow, TaskRow, TimesheetRow, ProjectStats, BadgeVariant } from "./types";

/* ------------------------------------------------------------------ */
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

export function mapErpProject(r: Record<string, unknown>): ProjectRow {
  return {
    id: String(r.name ?? ""),
    projectName: String(r.project_name ?? r.name ?? ""),
    status: String(r.status ?? "Open").trim(),
    percentComplete: Number(r.percent_complete ?? 0),
    expectedStartDate: String(r.expected_start_date ?? ""),
    expectedEndDate: String(r.expected_end_date ?? ""),
    company: String(r.company ?? ""),
  };
}

export function mapErpTask(r: Record<string, unknown>): TaskRow {
  let assigned = "";
  if (r._assign) {
    try {
      const parsed = typeof r._assign === "string" ? JSON.parse(r._assign) : r._assign;
      if (Array.isArray(parsed) && parsed.length > 0) assigned = String(parsed[0]);
    } catch {
      assigned = String(r._assign ?? "");
    }
  }
  return {
    id: String(r.name ?? ""),
    subject: String(r.subject ?? ""),
    project: String(r.project ?? ""),
    assignedTo: assigned,
    priority: String(r.priority ?? "Medium"),
    expEndDate: String(r.exp_end_date ?? ""),
    status: String(r.status ?? "Open").trim(),
  };
}

export function mapErpTimesheet(r: Record<string, unknown>): TimesheetRow {
  return {
    id: String(r.name ?? ""),
    employeeName: String(r.employee_name ?? ""),
    project: String(r.project ?? r.parent_project ?? ""),
    totalHours: Number(r.total_hours ?? 0),
    startDate: String(r.start_date ?? ""),
    status: String(r.status ?? "Draft").trim(),
  };
}

/* ------------------------------------------------------------------ */
/*  Stat helpers                                                       */
/* ------------------------------------------------------------------ */

export function deriveProjectStats(projects: ProjectRow[]): ProjectStats {
  const now = new Date();
  let active = 0;
  let completed = 0;
  let overdue = 0;
  for (const p of projects) {
    if (p.status === "Completed") completed++;
    else if (p.status === "Open" || p.status === "Working") {
      active++;
      if (p.expectedEndDate && new Date(p.expectedEndDate) < now) overdue++;
    }
  }
  return { total: projects.length, active, completed, overdue };
}

/* ------------------------------------------------------------------ */
/*  Status badge variant maps                                          */
/* ------------------------------------------------------------------ */

export const PROJECT_STATUS_VARIANT: Record<string, BadgeVariant> = {
  Open: "outline",
  Working: "default",
  Completed: "success",
  Cancelled: "destructive",
  Overdue: "destructive",
};

export const TASK_STATUS_VARIANT: Record<string, BadgeVariant> = {
  Open: "outline",
  Working: "default",
  Completed: "success",
  Cancelled: "destructive",
  Overdue: "destructive",
};

export const PRIORITY_VARIANT: Record<string, BadgeVariant> = {
  Urgent: "destructive",
  High: "destructive",
  Medium: "warning",
  Low: "outline",
};

/* ------------------------------------------------------------------ */
/*  Filter constants                                                   */
/* ------------------------------------------------------------------ */

export const PROJECT_STATUSES = ["All", "Open", "Working", "Completed", "Cancelled"] as const;
export const TASK_STATUSES = ["All", "Open", "Working", "Completed", "Cancelled", "Overdue"] as const;
export const TASK_PRIORITIES = ["All", "Urgent", "High", "Medium", "Low"] as const;
