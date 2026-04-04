import type { PeriodKey, RawInvoice } from "./types";

/* ------------------------------------------------------------------ */
/*  Month helpers                                                      */
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

export function getLast12Months(): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

/* ------------------------------------------------------------------ */
/*  Period range                                                       */
/* ------------------------------------------------------------------ */

export function getPeriodRange(period: PeriodKey): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (period) {
    case "this_month": {
      const start = new Date(y, m, 1);
      const end = new Date(y, m + 1, 0);
      return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
    }
    case "last_month": {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
    }
    case "this_quarter": {
      const qStart = Math.floor(m / 3) * 3;
      const start = new Date(y, qStart, 1);
      const end = new Date(y, qStart + 3, 0);
      return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
    }
    case "this_year":
    default: {
      return { start: `${y}-01-01`, end: `${y}-12-31` };
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Data derivations                                                   */
/* ------------------------------------------------------------------ */

export function buildRevenueTrend(salesInvoices: RawInvoice[]) {
  const months = getLast12Months();
  const byMonth: Record<string, number> = {};
  months.forEach((m) => {
    byMonth[m] = 0;
  });

  salesInvoices.forEach((inv) => {
    if (inv.posting_date && (inv.status === "Paid" || inv.docstatus === 1)) {
      const key = getMonthKey(inv.posting_date);
      if (byMonth[key] !== undefined) byMonth[key] += inv.grand_total ?? 0;
    }
  });

  return months.map((m) => ({ month: getMonthLabel(m), value: byMonth[m] }));
}

export function buildTopCustomers(salesInvoices: RawInvoice[]) {
  const byCustomer: Record<string, { name: string; total: number }> = {};
  salesInvoices.forEach((inv) => {
    if (inv.status === "Paid" || inv.docstatus === 1) {
      const custName = inv.customer_name ?? inv.customer ?? "Unknown";
      if (!byCustomer[custName]) byCustomer[custName] = { name: custName, total: 0 };
      byCustomer[custName].total += inv.grand_total ?? 0;
    }
  });
  return Object.values(byCustomer)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

export function buildRevenueByCategory(salesInvoices: RawInvoice[]) {
  const byGroup: Record<string, number> = {};
  let hasItemGroups = false;

  salesInvoices.forEach((inv) => {
    if (inv.status === "Paid" || inv.docstatus === 1) {
      if (inv.items && Array.isArray(inv.items) && inv.items.length > 0) {
        inv.items.forEach((item) => {
          if (item.item_group) {
            hasItemGroups = true;
            byGroup[item.item_group] = (byGroup[item.item_group] ?? 0) + (item.amount ?? 0);
          }
        });
      }
    }
  });

  if (!hasItemGroups) {
    salesInvoices.forEach((inv) => {
      if (inv.status === "Paid" || inv.docstatus === 1) {
        const group = inv.customer_name ?? inv.customer ?? "Other";
        byGroup[group] = (byGroup[group] ?? 0) + (inv.grand_total ?? 0);
      }
    });
  }

  return Object.entries(byGroup)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}
