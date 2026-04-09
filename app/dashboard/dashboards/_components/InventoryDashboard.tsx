"use client";

import { useMemo } from "react";
import nextDynamic from "next/dynamic";
import { AlertTriangle, Boxes, Package, Warehouse } from "lucide-react";
import { useErpList } from "@/lib/queries/useErpList";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/locale/currency";
import { KpiCard } from "./KpiCard";
import { DashboardSkeleton } from "./FinanceDashboard";

const LazyResponsiveContainer = nextDynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const LazyBarChart = nextDynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const LazyBar = nextDynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const LazyXAxis = nextDynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const LazyYAxis = nextDynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const LazyTooltip = nextDynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const LazyCartesianGrid = nextDynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

interface RawItem {
  name?: string;
  item_name?: string;
  item_code?: string;
  default_warehouse?: string;
  total_projected_qty?: number;
  valuation_rate?: number;
  stock_uom?: string;
  is_stock_item?: number;
}

interface RawStockEntry {
  name?: string;
  posting_date?: string;
  stock_entry_type?: string;
  total_outgoing_value?: number;
  total_incoming_value?: number;
  from_warehouse?: string;
  to_warehouse?: string;
  docstatus?: number;
}

const LOW_STOCK_THRESHOLD = 10;

interface MappedItem {
  id: string;
  name: string;
  warehouse: string;
  qty: number;
  value: number;
  uom: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
}

function mapItem(r: RawItem): MappedItem {
  const qty = Number(r.total_projected_qty ?? 0);
  const status: MappedItem["status"] = qty <= 0 ? "Out of Stock" : qty < LOW_STOCK_THRESHOLD ? "Low Stock" : "In Stock";
  return {
    id: String(r.name ?? ""),
    name: String(r.item_name ?? r.name ?? "—"),
    warehouse: String(r.default_warehouse ?? "—"),
    qty,
    value: Number(r.valuation_rate ?? 0) * qty,
    uom: String(r.stock_uom ?? ""),
    status,
  };
}

export function InventoryDashboard() {
  const itemsQuery = useErpList("Item", {
    fields: [
      "name",
      "item_name",
      "item_code",
      "default_warehouse",
      "total_projected_qty",
      "valuation_rate",
      "stock_uom",
      "is_stock_item",
    ],
    limit: 500,
  });
  const stockEntriesQuery = useErpList("Stock Entry", {
    fields: [
      "name",
      "posting_date",
      "stock_entry_type",
      "total_outgoing_value",
      "total_incoming_value",
      "from_warehouse",
      "to_warehouse",
      "docstatus",
    ],
    limit: 50,
    orderBy: "posting_date desc",
  });

  const rawItems = useMemo(() => (itemsQuery.data as RawItem[]) ?? [], [itemsQuery.data]);
  const stockEntries = useMemo(() => (stockEntriesQuery.data as RawStockEntry[]) ?? [], [stockEntriesQuery.data]);

  const items = useMemo(() => rawItems.map(mapItem), [rawItems]);

  const loading = itemsQuery.isLoading || stockEntriesQuery.isLoading;
  const errored = itemsQuery.isError && stockEntriesQuery.isError;

  // ── KPIs ──────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalSkus = items.length;
    const lowStock = items.filter((i) => i.status === "Low Stock").length;
    const outOfStock = items.filter((i) => i.status === "Out of Stock").length;
    const totalValue = items.reduce((s, i) => s + i.value, 0);
    return { totalSkus, lowStock, outOfStock, totalValue };
  }, [items]);

  // ── Stock value by warehouse ─────────────────────────────────────
  const warehouseData = useMemo(() => {
    const byWh: Record<string, number> = {};
    items.forEach((i) => {
      const wh = i.warehouse || "Unassigned";
      byWh[wh] = (byWh[wh] ?? 0) + i.value;
    });
    return Object.entries(byWh)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [items]);

  // ── Top 10 items by value ────────────────────────────────────────
  const topItems = useMemo(() => {
    return [...items].sort((a, b) => b.value - a.value).slice(0, 10);
  }, [items]);

  // ── Low stock alerts ─────────────────────────────────────────────
  const lowStockAlerts = useMemo(() => {
    return items.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock").slice(0, 8);
  }, [items]);

  // ── Recent stock movements ───────────────────────────────────────
  const recentMovements = useMemo(() => {
    return [...stockEntries].sort((a, b) => (b.posting_date ?? "").localeCompare(a.posting_date ?? "")).slice(0, 10);
  }, [stockEntries]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Inventory Health</h1>
        <p className="text-sm text-muted-foreground">Stock value, low-stock alerts, and movement activity.</p>
      </div>

      {errored && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Could not reach the ERP backend. Showing zero values until the connection is restored.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total SKUs" value={kpis.totalSkus} icon={Boxes} format="number" />
        <KpiCard label="Low Stock Items" value={kpis.lowStock} icon={AlertTriangle} format="number" />
        <KpiCard label="Total Stock Value" value={kpis.totalValue} icon={Package} format="currency" />
        <KpiCard label="Out of Stock" value={kpis.outOfStock} icon={Warehouse} format="number" />
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-foreground font-display">Stock Value by Warehouse</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Top warehouses by valuation</p>
          {warehouseData.every((w) => w.value === 0) ? (
            <p className="mt-8 text-sm text-muted-foreground">No warehouse data yet.</p>
          ) : (
            <div className="mt-4 h-64 min-h-[256px] w-full">
              <LazyResponsiveContainer width="100%" height={256}>
                <LazyBarChart
                  data={warehouseData}
                  layout="vertical"
                  margin={{ top: 5, right: 12, left: 80, bottom: 0 }}
                >
                  <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <LazyXAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  />
                  <LazyYAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  />
                  <LazyTooltip
                    formatter={(value) => [formatCurrency(Number(value ?? 0), "USD"), "Value"]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <LazyBar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                </LazyBarChart>
              </LazyResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Top 10 Items by Value</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Highest valuation × quantity</p>
            {topItems.length === 0 || topItems.every((i) => i.value === 0) ? (
              <p className="mt-8 text-sm text-muted-foreground">No items with valuation yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[480px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">Item</th>
                      <th className="py-2 pr-3 text-right font-medium">Qty</th>
                      <th className="py-2 text-right font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topItems.map((item) => (
                      <tr key={item.id} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-3 font-medium text-foreground truncate max-w-[180px]">{item.name}</td>
                        <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                          {item.qty.toLocaleString()} {item.uom}
                        </td>
                        <td className="py-2 text-right tabular-nums font-medium text-foreground">
                          {formatCurrency(item.value, "USD")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Low Stock Alerts</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Items at or below threshold</p>
            {lowStockAlerts.length === 0 ? (
              <p className="mt-8 text-sm text-success">All items are well stocked.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {lowStockAlerts.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.qty} {item.uom} in {item.warehouse}
                      </p>
                    </div>
                    <Badge variant={item.status === "Out of Stock" ? "destructive" : "warning"}>{item.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-foreground font-display">Recent Stock Movements</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Last 10 stock entries</p>
          {recentMovements.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">No stock movements recorded yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Entry</th>
                    <th className="py-2 pr-3 font-medium">Type</th>
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium">From</th>
                    <th className="py-2 pr-3 font-medium">To</th>
                    <th className="py-2 text-right font-medium">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMovements.map((m) => (
                    <tr key={m.name} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-foreground">{m.name}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{m.stock_entry_type ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{m.posting_date ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground truncate max-w-[120px]">
                        {m.from_warehouse ?? "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground truncate max-w-[120px]">
                        {m.to_warehouse ?? "—"}
                      </td>
                      <td className="py-2.5 text-right tabular-nums font-medium text-foreground">
                        {formatCurrency(m.total_incoming_value ?? m.total_outgoing_value ?? 0, "USD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
