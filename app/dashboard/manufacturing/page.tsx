export const dynamic = "force-dynamic";

import { Factory } from "lucide-react";
import { serverErpList } from "@/lib/api/server";
import { ListPageError } from "../_components/ListPageError";
import { ManufacturingListClient } from "./_components/ManufacturingListClient";
import type { BomRow, WorkOrderRow } from "./_components/ManufacturingListClient";

/* ------------------------------------------------------------------ */
/*  ERP mappers                                                        */
/* ------------------------------------------------------------------ */

function mapErpBom(d: Record<string, unknown>): BomRow {
  return {
    name: String(d.name ?? ""),
    item: String(d.item ?? ""),
    quantity: Number(d.quantity ?? 0),
    isActive: Number(d.is_active ?? 0) === 1 ? "Yes" : "No",
    isDefault: Number(d.is_default ?? 0) === 1 ? "Yes" : "No",
  };
}

function mapErpWorkOrder(d: Record<string, unknown>): WorkOrderRow {
  return {
    name: String(d.name ?? ""),
    productionItem: String(d.production_item ?? ""),
    qty: Number(d.qty ?? 0),
    status: String(d.status ?? "Draft").trim(),
    plannedStartDate: String(d.planned_start_date ?? ""),
  };
}

/* ------------------------------------------------------------------ */
/*  Page (async Server Component)                                      */
/* ------------------------------------------------------------------ */

export default async function ManufacturingPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Number(params.page ?? "0");

  let bomRows: BomRow[] = [];
  let bomPage = page;
  let bomHasMore = false;

  let woRows: WorkOrderRow[] = [];
  let woPage = page;
  let woHasMore = false;

  let error: string | null = null;

  try {
    const [bomResult, woResult] = await Promise.all([
      serverErpList("BOM", {
        page,
        fields: ["name", "item", "quantity", "is_active", "is_default"],
      }),
      serverErpList("Work Order", {
        page,
        fields: ["name", "production_item", "qty", "status", "planned_start_date"],
      }),
    ]);

    bomRows = (bomResult.data as Record<string, unknown>[]).map(mapErpBom);
    bomPage = bomResult.meta.page;
    bomHasMore = bomResult.meta.hasMore;

    woRows = (woResult.data as Record<string, unknown>[]).map(mapErpWorkOrder);
    woPage = woResult.meta.page;
    woHasMore = woResult.meta.hasMore;
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load manufacturing data.";
  }

  if (error) {
    return (
      <ListPageError
        title="Manufacturing"
        subtitle="Manage manufacturing orders."
        error={error}
        icon={<Factory className="h-6 w-6" />}
        createHref="/dashboard/manufacturing/new"
        createLabel="+ New BOM"
      />
    );
  }

  return (
    <ManufacturingListClient
      bomRows={bomRows}
      woRows={woRows}
      bomPage={bomPage}
      bomHasMore={bomHasMore}
      woPage={woPage}
      woHasMore={woHasMore}
    />
  );
}
