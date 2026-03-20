"use client";

import { useState, useCallback } from "react";
import { ArrowLeft, Check, X, Search, Upload, Download, RefreshCw, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Modal";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/locale/currency";
import { useErpList } from "@/lib/queries/useErpList";
import { api } from "@/lib/api/client";

interface BankEntry {
  name: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  matched: boolean;
  matchedTo?: string;
}

interface JournalEntry {
  name: string;
  posting_date: string;
  title: string;
  total_debit: number;
  total_credit: number;
  docstatus: number;
}

export default function BankReconciliationPage() {
  const [search, setSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Array<{ bank: string; journal: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch Journal Entries
  const { data: journalEntries, isLoading } = useErpList("Journal Entry", {
    fields: ["name", "posting_date", "title", "total_debit", "total_credit", "docstatus"],
    orderBy: "posting_date desc",
    limit: 100,
  });

  // Fetch Payment Entries
  const { data: paymentEntries } = useErpList("Payment Entry", {
    fields: ["name", "posting_date", "party_name", "paid_amount", "payment_type", "reference_no"],
    orderBy: "posting_date desc",
    limit: 100,
  });

  // Transform payment entries into bank-like format for reconciliation
  const rawPayments = (paymentEntries ?? []) as Record<string, unknown>[];
  const bankEntries: BankEntry[] = rawPayments.map((pe) => ({
    name: pe.name as string,
    date: pe.posting_date as string,
    description: `${pe.payment_type} - ${pe.party_name ?? "N/A"} ${pe.reference_no ? `(Ref: ${pe.reference_no})` : ""}`,
    amount: pe.paid_amount as number,
    type: (pe.payment_type as string) === "Receive" ? "credit" : "debit",
    matched: matchedPairs.some((p) => p.bank === (pe.name as string)),
    matchedTo: matchedPairs.find((p) => p.bank === (pe.name as string))?.journal,
  }));

  const rawJournals = (journalEntries ?? []) as Record<string, unknown>[];
  const journals: JournalEntry[] = rawJournals.map((je) => ({
    name: je.name as string,
    posting_date: je.posting_date as string,
    title: (je.title as string) ?? (je.name as string),
    total_debit: je.total_debit as number,
    total_credit: je.total_credit as number,
    docstatus: je.docstatus as number,
  }));

  function handleMatch() {
    if (!selectedBank || !selectedJournal) {
      toast.error("Select both a bank entry and a journal entry to match");
      return;
    }
    setMatchedPairs([...matchedPairs, { bank: selectedBank, journal: selectedJournal }]);
    setSelectedBank(null);
    setSelectedJournal(null);
    toast.success("Entries matched");
  }

  function handleUnmatch(bankName: string) {
    setMatchedPairs(matchedPairs.filter((p) => p.bank !== bankName));
    toast.info("Match removed");
  }

  const handleSaveReconciliation = useCallback(async () => {
    if (matchedPairs.length === 0) {
      toast.error("No matched pairs to save");
      return;
    }
    setSaving(true);
    let succeeded = 0;
    let failed = 0;
    const failedDetails: string[] = [];

    for (const pair of matchedPairs) {
      try {
        // Find the payment entry to get amount and type
        const paymentEntry = bankEntries.find((e) => e.name === pair.bank);
        const amount = paymentEntry?.amount ?? 0;
        const isReceive = paymentEntry?.type === "credit";

        // Create a reconciliation Journal Entry that clears the matched entries.
        // Debit the bank account and credit the clearing account (or vice versa)
        // depending on the payment direction.
        await api.erp.create("Journal Entry", {
          title: `Reconciliation: ${pair.bank} - ${pair.journal}`,
          voucher_type: "Journal Entry",
          posting_date: new Date().toISOString().split("T")[0],
          user_remark: `Bank reconciliation: Payment Entry ${pair.bank} matched with Journal Entry ${pair.journal}`,
          accounts: [
            {
              account: "Bank Clearance Account - WB",
              debit_in_account_currency: isReceive ? amount : 0,
              credit_in_account_currency: isReceive ? 0 : amount,
              reference_type: "Payment Entry",
              reference_name: pair.bank,
            },
            {
              account: "Bank Clearance Account - WB",
              debit_in_account_currency: isReceive ? 0 : amount,
              credit_in_account_currency: isReceive ? amount : 0,
              reference_type: "Journal Entry",
              reference_name: pair.journal,
            },
          ],
        });
        succeeded++;
      } catch (err) {
        failed++;
        const msg = err instanceof Error ? err.message : "Unknown error";
        if (failedDetails.length < 5) {
          failedDetails.push(`${pair.bank}: ${msg}`);
        }
      }
    }

    setSaving(false);
    setShowConfirm(false);

    if (failed === 0) {
      toast.success(
        `${succeeded} reconciliation Journal ${succeeded === 1 ? "Entry" : "Entries"} created successfully`,
      );
      setMatchedPairs([]);
    } else if (succeeded > 0) {
      toast.error(`${succeeded} created, ${failed} failed. ${failedDetails.join("; ")}`);
    } else {
      toast.error(`All ${failed} reconciliations failed. ${failedDetails.join("; ")}`);
    }
  }, [matchedPairs, bankEntries]);

  const unmatchedBank = bankEntries.filter((e) => !e.matched);
  const unmatchedJournals = journals.filter((j) => !matchedPairs.some((p) => p.journal === j.name));

  const filteredBank = unmatchedBank.filter(
    (e) =>
      !search ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalBankCredits = bankEntries.filter((e) => e.type === "credit").reduce((sum, e) => sum + e.amount, 0);
  const totalBankDebits = bankEntries.filter((e) => e.type === "debit").reduce((sum, e) => sum + e.amount, 0);
  const matchedCount = matchedPairs.length;
  const unmatchedCount = unmatchedBank.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/accounting">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 size-4" /> Accounting
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">Bank Reconciliation</h1>
            <p className="text-sm text-muted-foreground">Match payment entries with journal entries</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 size-4" /> Import Statement
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" /> Export
          </Button>
          {matchedPairs.length > 0 && (
            <Button size="sm" onClick={() => setShowConfirm(true)} disabled={saving}>
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
              Save ({matchedPairs.length})
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Credits</p>
            <p className="text-2xl font-semibold text-green-600">{formatCurrency(totalBankCredits, "USD")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Debits</p>
            <p className="text-2xl font-semibold text-red-600">{formatCurrency(totalBankDebits, "USD")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Matched</p>
            <p className="text-2xl font-semibold">{matchedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Unmatched</p>
            <p className="text-2xl font-semibold text-amber-600">{unmatchedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Match action bar */}
      {(selectedBank || selectedJournal) && (
        <div className="flex items-center gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <span className="text-sm">
            {selectedBank && !selectedJournal && "Now select a journal entry to match with"}
            {!selectedBank && selectedJournal && "Now select a payment entry to match with"}
            {selectedBank && selectedJournal && "Ready to match these entries"}
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedBank(null);
                setSelectedJournal(null);
              }}
            >
              Cancel
            </Button>
            <Button size="sm" disabled={!selectedBank || !selectedJournal} onClick={handleMatch}>
              <Check className="mr-2 size-4" /> Match
            </Button>
          </div>
        </div>
      )}

      {/* Two-panel view */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Payment Entries (Bank side) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Payment Entries</CardTitle>
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <RefreshCw className="mx-auto size-5 animate-spin text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : filteredBank.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No unmatched entries
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBank.map((entry) => (
                      <TableRow
                        key={entry.name}
                        className={`cursor-pointer ${
                          selectedBank === entry.name ? "bg-primary/10" : "hover:bg-accent"
                        }`}
                        onClick={() => setSelectedBank(entry.name)}
                      >
                        <TableCell className="text-sm">{entry.date}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">{entry.description}</TableCell>
                        <TableCell
                          className={`text-right text-sm font-medium ${
                            entry.type === "credit" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {entry.type === "credit" ? "+" : "-"}
                          {formatCurrency(entry.amount, "USD")}
                        </TableCell>
                        <TableCell>
                          {entry.matched ? (
                            <Badge variant="default" className="text-xs">
                              Matched
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Unmatched
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right: Journal Entries */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Journal Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unmatchedJournals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No unmatched journal entries
                      </TableCell>
                    </TableRow>
                  ) : (
                    unmatchedJournals.map((je) => (
                      <TableRow
                        key={je.name}
                        className={`cursor-pointer ${
                          selectedJournal === je.name ? "bg-primary/10" : "hover:bg-accent"
                        }`}
                        onClick={() => setSelectedJournal(je.name)}
                      >
                        <TableCell className="text-sm">{je.posting_date}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm">{je.title}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(je.total_debit, "USD")}</TableCell>
                        <TableCell className="text-right text-sm">{formatCurrency(je.total_credit, "USD")}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matched pairs */}
      {matchedPairs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Matched Entries ({matchedPairs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Entry</TableHead>
                  <TableHead>Journal Entry</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchedPairs.map((pair) => (
                  <TableRow key={pair.bank}>
                    <TableCell>{pair.bank}</TableCell>
                    <TableCell>{pair.journal}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleUnmatch(pair.bank)}>
                        <X className="mr-1 size-3" /> Unmatch
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Confirmation dialog */}
      <Dialog open={showConfirm} onOpenChange={(v) => !v && setShowConfirm(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Reconciliation</DialogTitle>
            <DialogDescription>
              This will create {matchedPairs.length} reconciliation Journal{" "}
              {matchedPairs.length === 1 ? "Entry" : "Entries"} to clear the matched payment and journal entry pairs.
              This action cannot be easily undone.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border p-3">
            <p className="mb-2 text-sm font-medium">Pairs to reconcile:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {matchedPairs.map((pair) => (
                <li key={pair.bank}>
                  {pair.bank} &rarr; {pair.journal}
                </li>
              ))}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveReconciliation} disabled={saving}>
              {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Check className="mr-2 size-4" />}
              Confirm Reconciliation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
