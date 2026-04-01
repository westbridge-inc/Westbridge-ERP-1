/**
 * Standard empty state copy and links for dashboard module pages.
 * Use with EmptyState: pass icon from lucide, and spread or map these fields.
 */

export const MODULE_EMPTY_STATES = {
  invoices: {
    title: "No invoices yet",
    description: "Create your first invoice to start tracking revenue and payments.",
    actionLabel: "Create Invoice",
    actionLink: "/dashboard/invoices?action=new",
  },
  crm: {
    title: "No deals in your pipeline",
    description: "Add your first deal to start tracking your sales pipeline.",
    actionLabel: "Add Deal",
    actionLink: "/dashboard/crm?action=new",
  },
  hr: {
    title: "No employees added",
    description: "Add your team members to manage HR, attendance, and payroll.",
    actionLabel: "Add Employee",
    actionLink: "/dashboard/hr?action=new",
  },
  payroll: {
    title: "No payroll runs yet",
    description: "Set up employees first, then run your first payroll cycle.",
    actionLabel: "Go to HR",
    actionLink: "/dashboard/hr",
  },
  inventory: {
    title: "No stock items",
    description: "Add your products and materials to start tracking inventory.",
    actionLabel: "Add Item",
    actionLink: "/dashboard/inventory?action=new",
  },
  expenses: {
    title: "No expense claims",
    description: "Submit your first expense claim for tracking and approval.",
    actionLabel: "New Claim",
    actionLink: "/dashboard/expenses?action=new",
  },
  procurement: {
    title: "No purchase orders",
    description: "Create a purchase order to manage supplier procurement.",
    actionLabel: "New PO",
    actionLink: "/dashboard/procurement?action=new",
  },
  quotations: {
    title: "No quotations",
    description: "Create a quotation to send professional proposals to clients.",
    actionLabel: "New Quote",
    actionLink: "/dashboard/quotations?action=new",
  },
  accounting: {
    title: "No accounting entries yet",
    description: "Set up your chart of accounts and create your first journal entry to start tracking finances.",
    actionLabel: "Set Up Accounts",
    actionLink: "/dashboard/settings",
  },
  analytics: {
    title: "Analytics will appear here",
    description:
      "Start by creating invoices, recording expenses, or processing payroll. Reports and trends will generate automatically as data flows in.",
    actionLabel: "Go to Dashboard",
    actionLink: "/dashboard",
  },
  projects: {
    title: "No projects yet",
    description: "Create your first project to track tasks, timelines, and progress.",
    actionLabel: "New Project",
    actionLink: "/dashboard/projects/new",
  },
  manufacturing: {
    title: "No bills of materials yet",
    description: "Define your first bill of materials to track raw materials, components, and production workflows.",
    actionLabel: "Create BOM",
    actionLink: "/dashboard/manufacturing/new",
  },
} as const;

export const EMPTY_STATE_SUPPORT_LINE = "Need help? Contact support@westbridgetoday.com";
