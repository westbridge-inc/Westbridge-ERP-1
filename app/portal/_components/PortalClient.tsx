"use client";

import type { ReactNode } from "react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FileText, Download, CheckCircle2, Clock, Package, ShieldAlert } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Types ──────────────────────────────────────────────────────────────────

interface PortalInfo {
  customerName: string;
  customerEmail: string;
  accountId: string;
  companyName: string;
}

interface Invoice {
  name: string;
  posting_date?: string;
  due_date?: string;
  grand_total?: number;
  outstanding_amount?: number;
  currency?: string;
  status?: string;
}

interface Quotation {
  name: string;
  transaction_date?: string;
  valid_till?: string;
  grand_total?: number;
  currency?: string;
  status?: string;
  docstatus?: number;
}

interface Order {
  name: string;
  transaction_date?: string;
  delivery_date?: string;
  grand_total?: number;
  currency?: string;
  status?: string;
  per_delivered?: number;
  per_billed?: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number | undefined, currency?: string): string {
  if (amount == null) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string | undefined): string {
  if (!date) return "--";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function statusVariant(
  status: string | undefined,
): "default" | "success" | "warning" | "destructive" | "outline" | "secondary" {
  const s = (status ?? "").toLowerCase();
  if (["paid", "completed", "delivered", "submitted", "accepted"].includes(s)) return "success";
  if (["overdue", "cancelled", "expired", "lost"].includes(s)) return "destructive";
  if (["unpaid", "partly paid", "partially delivered", "to deliver and bill"].includes(s)) return "warning";
  if (["draft", "open"].includes(s)) return "outline";
  return "secondary";
}

// ─── Component ──────────────────────────────────────────────────────────────

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
        // Refresh quotations
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

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          <p className="text-sm text-gray-500">Verifying your access...</p>
        </div>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────

  if (error || !portalInfo) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="rounded-full bg-red-50 p-3">
              <ShieldAlert className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Access Denied</h2>
              <p className="mt-2 text-sm text-gray-500">{error ?? "Unable to access the portal."}</p>
            </div>
            <div className="mt-2 rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500">
              Please contact your vendor for a new portal link.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Main portal ──────────────────────────────────────────────────────────

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {portalInfo.customerName}</h1>
        <p className="mt-1 text-sm text-gray-500">View your documents from {portalInfo.companyName || "your vendor"}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="invoices">
        <TabsList className="mb-6">
          <TabsTrigger value="invoices" className="gap-1.5">
            <FileText className="h-4 w-4" />
            Invoices
            {invoices.length > 0 && (
              <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                {invoices.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="quotations" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Quotations
            {quotations.length > 0 && (
              <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                {quotations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5">
            <Package className="h-4 w-4" />
            Orders
            {orders.length > 0 && (
              <span className="ml-1 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs font-medium text-gray-700">
                {orders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Loading overlay for docs */}
        {loadingDocs && (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
              <p className="text-sm text-gray-500">Loading documents...</p>
            </div>
          </div>
        )}

        {/* ─── Invoices tab ───────────────────────────────────────────── */}
        {!loadingDocs && (
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <EmptyDocState icon={<FileText className="h-8 w-8" />} label="No invoices yet" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Outstanding</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">PDF</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.name}>
                          <TableCell className="font-medium">{inv.name}</TableCell>
                          <TableCell>{formatDate(inv.posting_date)}</TableCell>
                          <TableCell>{formatDate(inv.due_date)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(inv.grand_total, inv.currency)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(inv.outstanding_amount, inv.currency)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(inv.status)}>{inv.status ?? "Draft"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPdf(inv.name)}
                              loading={downloadingPdf === inv.name}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ─── Quotations tab ─────────────────────────────────────────── */}
        {!loadingDocs && (
          <TabsContent value="quotations">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quotations</CardTitle>
              </CardHeader>
              <CardContent>
                {quotations.length === 0 ? (
                  <EmptyDocState icon={<Clock className="h-8 w-8" />} label="No quotations yet" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Quotation #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Valid Until</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotations.map((q) => {
                        const canAccept =
                          (q.docstatus === 0 || q.docstatus == null) &&
                          (q.status ?? "").toLowerCase() !== "ordered" &&
                          (q.status ?? "").toLowerCase() !== "cancelled" &&
                          (q.status ?? "").toLowerCase() !== "lost";
                        return (
                          <TableRow key={q.name}>
                            <TableCell className="font-medium">{q.name}</TableCell>
                            <TableCell>{formatDate(q.transaction_date)}</TableCell>
                            <TableCell>{formatDate(q.valid_till)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(q.grand_total, q.currency)}</TableCell>
                            <TableCell>
                              <Badge variant={statusVariant(q.status)}>{q.status ?? "Draft"}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {canAccept ? (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleAcceptQuotation(q.name)}
                                  loading={acceptingQuote === q.name}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                  Accept
                                </Button>
                              ) : (
                                <span className="text-xs text-gray-400">{q.docstatus === 1 ? "Accepted" : "--"}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* ─── Orders tab ─────────────────────────────────────────────── */}
        {!loadingDocs && (
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sales Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <EmptyDocState icon={<Package className="h-8 w-8" />} label="No orders yet" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Delivery Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Delivered</TableHead>
                        <TableHead>Billed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o.name}>
                          <TableCell className="font-medium">{o.name}</TableCell>
                          <TableCell>{formatDate(o.transaction_date)}</TableCell>
                          <TableCell>{formatDate(o.delivery_date)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(o.grand_total, o.currency)}</TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(o.status)}>{o.status ?? "Draft"}</Badge>
                          </TableCell>
                          <TableCell>
                            <ProgressPill value={o.per_delivered} />
                          </TableCell>
                          <TableCell>
                            <ProgressPill value={o.per_billed} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function EmptyDocState({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-gray-400">
      {icon}
      <p className="text-sm">{label}</p>
    </div>
  );
}

function ProgressPill({ value }: { value?: number }) {
  const pct = value ?? 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full bg-gray-900 transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="text-xs text-gray-500">{Math.round(pct)}%</span>
    </div>
  );
}
