export interface ProjectRow {
  id: string;
  projectName: string;
  status: string;
  percentComplete: number;
  expectedStartDate: string;
  expectedEndDate: string;
  company: string;
}

export interface TaskRow {
  id: string;
  subject: string;
  project: string;
  assignedTo: string;
  priority: string;
  expEndDate: string;
  status: string;
}

export interface TimesheetRow {
  id: string;
  employeeName: string;
  project: string;
  totalHours: number;
  startDate: string;
  status: string;
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  overdue: number;
}

export type BadgeVariant = "default" | "destructive" | "outline" | "success" | "warning";

export type TabValue = "projects" | "tasks" | "timesheets";
