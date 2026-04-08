"use client";

import { useState } from "react";
import { ExternalLink, Send, Copy, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PortalInviteButtonProps {
  customerName: string;
}

export function PortalInviteButton({ customerName }: PortalInviteButtonProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleInvite() {
    if (!email) {
      toast.error("Please enter a customer email address.");
      return;
    }

    setSending(true);
    try {
      // Fetch CSRF token
      const csrfRes = await fetch(`/api/csrf`, { credentials: "include" });
      const csrfBody = (await csrfRes.json()) as { data?: { csrfToken?: string } };
      const csrfToken = csrfBody.data?.csrfToken ?? "";

      const res = await fetch(`/api/portal/invite`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          customerName,
          customerEmail: email,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = (body as { error?: { message?: string } })?.error?.message ?? "Failed to send portal invite";
        toast.error(message);
        return;
      }

      const body = (await res.json()) as { data: { tokenId: string; portalUrl: string } };
      setPortalUrl(body.data.portalUrl);
      toast.success("Portal invite sent successfully.");
    } catch {
      toast.error("Failed to send portal invite. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleCopy() {
    if (!portalUrl) return;
    try {
      await navigator.clipboard.writeText(portalUrl);
      setCopied(true);
      toast.success("Portal link copied to clipboard.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ExternalLink className="h-4 w-4" />
          Customer Portal
        </CardTitle>
        <CardDescription>Send this customer a link to view their invoices, quotations, and orders</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="portal-email">Customer Email</Label>
            <Input
              id="portal-email"
              type="email"
              placeholder="customer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleInvite} loading={sending} leftIcon={<Send className="h-4 w-4" />}>
            Send Portal Link
          </Button>
        </div>

        {portalUrl && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
            <code className="flex-1 truncate text-xs text-muted-foreground">{portalUrl}</code>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
