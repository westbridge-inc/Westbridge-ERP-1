"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

/**
 * Seeds the React Query cache from server-fetched data.
 *
 * Place this in a server component page alongside the client component
 * that consumes the same query key. On first render it hydrates the cache
 * so the client component never re-fetches data the server already loaded.
 *
 * @example
 * // In a server component page:
 * const data = await serverErpList("Sales Invoice", { page });
 * return (
 *   <>
 *     <HydrateClient queryKey={["erp", "Sales Invoice", { page }]} data={data} />
 *     <InvoicesListClient invoices={data} />
 *   </>
 * );
 */
export function HydrateClient({ queryKey, data }: { queryKey: readonly unknown[]; data: unknown }) {
  const queryClient = useQueryClient();
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current && data !== undefined) {
      queryClient.setQueryData(queryKey, data);
      hydrated.current = true;
    }
  }, [queryClient, queryKey, data]);

  return null;
}
