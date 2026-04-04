import type { GenericRow, TreeNode, RawInvoice } from "./types";

/* ------------------------------------------------------------------ */
/*  List-view mappers                                                  */
/* ------------------------------------------------------------------ */

export function mapJournalEntry(d: Record<string, unknown>): GenericRow {
  return {
    id: String(d.name ?? ""),
    postingDate: String(d.posting_date ?? ""),
    voucherType: String(d.voucher_type ?? "\u2014"),
    totalDebit: Number(d.total_debit ?? 0),
    totalCredit: Number(d.total_credit ?? 0),
    status: String(d.docstatus === 1 ? "Submitted" : d.docstatus === 2 ? "Cancelled" : "Draft"),
  };
}

export function mapAccount(d: Record<string, unknown>): GenericRow {
  return {
    id: String(d.name ?? ""),
    accountName: String(d.account_name ?? d.name ?? ""),
    accountType: String(d.account_type ?? "\u2014"),
    rootType: String(d.root_type ?? "\u2014"),
    isGroup: d.is_group ? "Yes" : "No",
    parentAccount: String(d.parent_account ?? ""),
    _isGroup: Boolean(d.is_group),
  };
}

export function mapReconciliation(d: Record<string, unknown>): GenericRow {
  return {
    id: String(d.name ?? ""),
    postingDate: String(d.posting_date ?? ""),
    referenceNo: String(d.reference_no ?? d.name ?? "\u2014"),
    paidAmount: Number(d.paid_amount ?? 0),
    partyName: String(d.party_name ?? d.party ?? "\u2014"),
    paymentType: String(d.payment_type ?? "\u2014"),
    status: String(d.docstatus === 1 ? "Submitted" : d.docstatus === 2 ? "Cancelled" : "Draft"),
    clearanceDate: String(d.clearance_date ?? "\u2014"),
  };
}

export function mapPaymentEntry(d: Record<string, unknown>): GenericRow {
  return {
    id: String(d.name ?? ""),
    postingDate: String(d.posting_date ?? ""),
    paymentType: String(d.payment_type ?? "\u2014"),
    partyName: String(d.party_name ?? d.party ?? "\u2014"),
    paidAmount: Number(d.paid_amount ?? 0),
    modeOfPayment: String(d.mode_of_payment ?? "\u2014"),
  };
}

/* ------------------------------------------------------------------ */
/*  COA Tree builder                                                   */
/* ------------------------------------------------------------------ */

export function buildAccountTree(accounts: GenericRow[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Create nodes
  accounts.forEach((acc) => {
    nodeMap.set(acc.id, {
      id: acc.id,
      accountName: acc.accountName as string,
      accountType: acc.accountType as string,
      rootType: acc.rootType as string,
      isGroup: acc._isGroup as boolean,
      children: [],
      level: 0,
    });
  });

  // Build hierarchy
  accounts.forEach((acc) => {
    const node = nodeMap.get(acc.id);
    if (!node) return;
    const parentId = acc.parentAccount as string;
    if (parentId && nodeMap.has(parentId)) {
      const parent = nodeMap.get(parentId)!;
      node.level = parent.level + 1;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  // If tree is flat (no parent_account data), group by root_type
  if (roots.length === accounts.length && accounts.length > 0) {
    const byRootType = new Map<string, TreeNode>();
    const grouped: TreeNode[] = [];

    accounts.forEach((acc) => {
      const rt = acc.rootType as string;
      if (!byRootType.has(rt)) {
        const group: TreeNode = {
          id: `group-${rt}`,
          accountName: rt,
          accountType: "",
          rootType: rt,
          isGroup: true,
          children: [],
          level: 0,
        };
        byRootType.set(rt, group);
        grouped.push(group);
      }
      const parent = byRootType.get(rt)!;
      const node = nodeMap.get(acc.id);
      if (node) {
        node.level = 1;
        parent.children.push(node);
      }
    });

    return grouped;
  }

  // Fix levels recursively
  function fixLevels(nodes: TreeNode[], level: number) {
    nodes.forEach((n) => {
      n.level = level;
      fixLevels(n.children, level + 1);
    });
  }
  fixLevels(roots, 0);

  return roots;
}

/* ------------------------------------------------------------------ */
/*  Dashboard helpers                                                  */
/* ------------------------------------------------------------------ */

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthLabel(key: string): string {
  const [, m] = key.split("-");
  return MONTH_NAMES[parseInt(m, 10) - 1] ?? key;
}

export function getLast6Months(): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

export function daysBetween(from: string, to: Date): number {
  const a = new Date(from);
  return Math.floor((to.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/* ------------------------------------------------------------------ */
/*  Dashboard data computations                                        */
/* ------------------------------------------------------------------ */

export interface BarDatum { month: string; revenue: number; expenses: number }

export function computeBarData(salesInvoices: RawInvoice[], purchaseInvoices: RawInvoice[]): BarDatum[] {
  const months = getLast6Months();
  const revByMonth: Record<string, number> = {};
  const expByMonth: Record<string, number> = {};
  months.forEach((m) => { revByMonth[m] = 0; expByMonth[m] = 0; });

  salesInvoices.forEach((inv) => {
    if (inv.posting_date && (inv.status === "Paid" || inv.docstatus === 1)) {
      const key = getMonthKey(inv.posting_date);
      if (revByMonth[key] !== undefined) revByMonth[key] += inv.grand_total ?? 0;
    }
  });

  purchaseInvoices.forEach((inv) => {
    if (inv.posting_date && (inv.status === "Paid" || inv.docstatus === 1)) {
      const key = getMonthKey(inv.posting_date);
      if (expByMonth[key] !== undefined) expByMonth[key] += inv.grand_total ?? 0;
    }
  });

  return months.map((m) => ({ month: getMonthLabel(m), revenue: revByMonth[m], expenses: expByMonth[m] }));
}

export function computeMaxBarValue(barData: BarDatum[]): number {
  let max = 0;
  barData.forEach((d) => {
    if (d.revenue > max) max = d.revenue;
    if (d.expenses > max) max = d.expenses;
  });
  return max > 0 ? max * 1.15 : 100;
}

export interface AgingData { buckets: Array<{ label: string; amount: number }>; total: number }

export function computeAgingData(salesInvoices: RawInvoice[]): AgingData {
  const unpaid = salesInvoices.filter((inv) => inv.status === "Unpaid" || inv.status === "Overdue");
  const buckets = [
    { label: "Current (0-30)", amount: 0 },
    { label: "31-60 days", amount: 0 },
    { label: "61-90 days", amount: 0 },
    { label: "91-120 days", amount: 0 },
    { label: "120+ days", amount: 0 },
  ];
  const today = new Date();
  unpaid.forEach((inv) => {
    const outstanding = inv.outstanding_amount ?? inv.grand_total ?? 0;
    const dueDate = inv.due_date ?? inv.posting_date;
    if (!dueDate) return;
    const overdue = daysBetween(dueDate, today);
    if (overdue <= 30) buckets[0].amount += outstanding;
    else if (overdue <= 60) buckets[1].amount += outstanding;
    else if (overdue <= 90) buckets[2].amount += outstanding;
    else if (overdue <= 120) buckets[3].amount += outstanding;
    else buckets[4].amount += outstanding;
  });
  const total = buckets.reduce((s, b) => s + b.amount, 0);
  return { buckets, total };
}

export function computeChartSubtitle(): string {
  const months = getLast6Months();
  if (months.length < 2) return "";
  return `Monthly (${getMonthLabel(months[0])} \u2013 ${getMonthLabel(months[months.length - 1])})`;
}
