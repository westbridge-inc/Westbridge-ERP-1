const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Fetch a list of records for a given doctype from the ERP backend.
 * Treats 404/502/503 as "no data" rather than throwing.
 */
export async function fetchDoctype(doctype: string, limit: number, fields?: string[]): Promise<unknown[]> {
  const qs = new URLSearchParams({ doctype, limit: String(limit) });
  if (fields) qs.set("fields", JSON.stringify(fields));
  const res = await fetch(`${API_BASE}/api/erp/list?${qs.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) {
    // Treat 404/502/503 as "no data" rather than crashing
    if (res.status === 404 || res.status === 502 || res.status === 503) {
      return [];
    }
    throw new Error(`HTTP ${res.status}`);
  }
  const body = await res.json();
  return (body?.data as unknown[]) ?? [];
}
