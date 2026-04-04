"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { FileText, Clock, Package } from "lucide-react";

import type { PortalInfo, Invoice, Quotation, Order } from "./types";
import { PortalHeader } from "./PortalHeader";
import { PortalLoading, PortalError, DocsLoading } from "./InvoiceDetail";
import { InvoiceTable, QuotationTable, OrderTable } from "./InvoiceList";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function PortalClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [portalInfo, setPortalInfo] = useState<PortalInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [acceptingQuote, setAcceptingQuote] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError("No access token provided. Please use the link sent to your email.");
      setLoading(false);
      return;
    }

    const currentToken = token;

    async function validate() {
      try {
        const res = await fetch(`${API_BASE}/api/portal/validate?token=${encodeURIComponent(currentToken)}`, {
          credentials: "include",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          const message =
            (body as { error?: { message?: string } })?.error?.message ?? "This link is invalid or has expired.";
          setError(message);
          setLoading(false);
          return;
        }
        const body = (await res.json()) as { data: PortalInfo };
        setPortalInfo(body.data);
      } catch {
        setError("Unable to validate your access. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    validate();
  }, [token]);

  // Fetch documents once validated
  const fetchDocs = useCallback(async () => {
    if (!token || !portalInfo) return;
    setLoadingDocs(true);

    try {
      const [invRes, quotRes, ordRes] = await Promise.all([
        fetch(`${API_BASE}/api/portal/invoices?token=${encodeURIComponent(token)}`, { credentials: "include" }),
        fetch(`${API_BASE}/api/portal/quotations?token=${encodeURIComponent(token)}`, { credentials: "include" }),
        fetch(`${API_BASE}/api/portal/orders?token=${encodeURIComponent(token)}`, { credentials: "include" }),
      ]);

      if (invRes.ok) {
        const body = (await invRes.json()) as { data: Invoice[] };
        setInvoices(Array.isArray(body.data) ? body.data : []);
      }
      if (quotRes.ok) {
        const body = (await quotRes.json()) as { data: Quotation[] };
        setQuotations(Array.isArray(body.data) ? body.data : []);
      }
      if (ordRes.ok) {
        const body = (await ordRes.json()) as { data: Order[] };
        setOrders(Array.isArray(body.data) ? body.data : []);
      }
    } catch {
      // silently fail — individual tabs will show empty state
    } finally {
      setLoadingDocs(false);
    }
  }, [token, portalInfo]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  // Accept a quotation
  async function handleAcceptQuotation(quotationName: string) {
    if (!token) return;
    setAcceptingQuote(quotationName);

    try {
      const res = await fetch(`${API_BASE}/api/portal/quotations/accept?token=${encodeURIComponent(token)}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quotationName }),
      });

      if (res.ok) {
        const quotRes = await fetch(`${API_BASE}/api/portal/quotations?token=${encodeURIComponent(token)}`, {
          credentials: "include",
        });
        if (quotRes.ok) {
          const body = (await quotRes.json()) as { data: Quotation[] };
          setQuotations(Array.isArray(body.data) ? body.data : []);
        }
      }
    } catch {
      // silently fail
    } finally {
      setAcceptingQuote(null);
    }
  }

  // Download invoice PDF
  async function handleDownloadPdf(invoiceName: string) {
    if (!token) return;
    setDownloadingPdf(invoiceName);

    try {
      const res = await fetch(
        `${API_BASE}/api/portal/invoice-pdf?token=${encodeURIComponent(token)}&name=${encodeURIComponent(invoiceName)}`,
        { credentials: "include" },
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice-${invoiceName}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch {
      // silently fail
    } finally {
      setDownloadingPdf(null);
    }
  }

  if (loading) return <PortalLoading />;
  if (error || !portalInfo) return <PortalError error={error} />;

  return (
    <div>
      <PortalHeader portalInfo={portalInfo} />

      <Tabs defaultValue="invoices">
        <TabsList className="mb-6">
          <TabsTrigger value="invoices" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Invoices
            {invoices.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                {invoices.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="quotations" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Quotations
            {quotations.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                {quotations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5">
            <Package className="h-4 w-4" />
            Orders
            {orders.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                {orders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {loadingDocs && <DocsLoading />}

        {!loadingDocs && (
          <TabsContent value="invoices">
            <InvoiceTable invoices={invoices} downloadingPdf={downloadingPdf} onDownloadPdf={handleDownloadPdf} />
          </TabsContent>
        )}

        {!loadingDocs && (
          <TabsContent value="quotations">
            <QuotationTable
              quotations={quotations}
              acceptingQuote={acceptingQuote}
              onAcceptQuotation={handleAcceptQuotation}
            />
          </TabsContent>
        )}

        {!loadingDocs && (
          <TabsContent value="orders">
            <OrderTable orders={orders} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
