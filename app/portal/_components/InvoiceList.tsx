import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { FileText, Download, CheckCircle2, Clock, Package } from "lucide-react";
import type { Invoice, Quotation, Order } from "./types";
import { formatCurrency, formatDate, statusVariant } from "./types";

// ─── Sub-components ─────────────────────────────────────────────────────────

function EmptyDocState({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground/70">
      {icon}
      <p className="text-sm">{label}</p>
    </div>
  );
}

function ProgressPill({ value }: { value?: number }) {
  const pct = value ?? 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted">
        <div className="h-1.5 rounded-full bg-foreground transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{Math.round(pct)}%</span>
    </div>
  );
}

// ─── Invoice Table ──────────────────────────────────────────────────────────

interface InvoiceTableProps {
  invoices: Invoice[];
  downloadingPdf: string | null;
  onDownloadPdf: (invoiceName: string) => void;
}

export function InvoiceTable({ invoices, downloadingPdf, onDownloadPdf }: InvoiceTableProps) {
  return (
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
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(inv.grand_total, inv.currency)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(inv.outstanding_amount, inv.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(inv.status)}>{inv.status ?? "Draft"}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownloadPdf(inv.name)}
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
  );
}

// ─── Quotation Table ────────────────────────────────────────────────────────

interface QuotationTableProps {
  quotations: Quotation[];
  acceptingQuote: string | null;
  onAcceptQuotation: (quotationName: string) => void;
}

export function QuotationTable({ quotations, acceptingQuote, onAcceptQuotation }: QuotationTableProps) {
  return (
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
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(q.grand_total, q.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(q.status)}>{q.status ?? "Draft"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {canAccept ? (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onAcceptQuotation(q.name)}
                          loading={acceptingQuote === q.name}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Accept
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground/70">
                          {q.docstatus === 1 ? "Accepted" : "--"}
                        </span>
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
  );
}

// ─── Order Table ────────────────────────────────────────────────────────────

interface OrderTableProps {
  orders: Order[];
}

export function OrderTable({ orders }: OrderTableProps) {
  return (
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
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(o.grand_total, o.currency)}
                  </TableCell>
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
  );
}
