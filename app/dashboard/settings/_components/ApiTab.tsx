"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToasts } from "@/components/ui/Toasts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function ApiTab() {
  const { addToast } = useToasts();

  const [accountId, setAccountId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/validate`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { data?: { accountId: string } }) => {
        setAccountId(d?.data?.accountId ?? null);
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []);

  const [apiKeys] = useState([
    {
      id: "key-1",
      prefix: "wb_live_\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022abc1",
      label: "Production",
      created: "2025-01-15",
      lastUsed: "Today",
      status: "Active",
    },
  ]);
  const [apiKeyModal, setApiKeyModal] = useState<{ open: boolean; label: string; generatedKey: string | null }>({
    open: false,
    label: "",
    generatedKey: null,
  });

  const handleGenerateKey = useCallback(() => {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    const key =
      "wb_live_" +
      Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 32);
    setApiKeyModal((p) => ({ ...p, generatedKey: key }));
  }, []);

  const copyToClipboard = useCallback(
    (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      addToast(`${label} copied to clipboard`, "success");
    },
    [addToast],
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.westbridge.gy";
  const webhookUrl = accountId ? `${appUrl}/api/webhooks/${accountId}` : "Loading\u2026";

  return (
    <>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-base font-semibold text-foreground">API Keys</p>
            <Button variant="primary" onClick={() => setApiKeyModal({ open: true, label: "", generatedKey: null })}>
              Generate new key
            </Button>
          </div>
          <div className="mt-4 overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">
                    Prefix
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">
                    Label
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">
                    Created
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">
                    Last used
                  </TableHead>
                  <TableHead className="px-4 py-3 text-left text-[11px] font-semibold uppercase text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((row) => (
                  <TableRow key={row.id} className="border-t border-border">
                    <TableCell className="px-4 py-3 font-mono text-sm text-foreground">{row.prefix}</TableCell>
                    <TableCell className="px-4 py-3 text-foreground">{row.label}</TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">{row.created}</TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">{row.lastUsed}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge status={row.status}>{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">API documentation</p>
          <a
            href="/api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-base text-primary hover:underline"
          >
            OpenAPI spec <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        <div>
          <p className="text-base font-semibold text-foreground">Webhook URL</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Send this URL to services that need to notify Westbridge of events.
          </p>
          <div className="mt-2 flex items-center gap-2">
            {profileLoading ? (
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
            ) : (
              <code className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground break-all">
                {webhookUrl}
              </code>
            )}
            <Button
              variant="secondary"
              onClick={() => copyToClipboard(webhookUrl, "Webhook URL")}
              disabled={profileLoading}
              leftIcon={<Copy className="h-4 w-4" />}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={apiKeyModal.open}
        onClose={() => setApiKeyModal({ open: false, label: "", generatedKey: null })}
        title={apiKeyModal.generatedKey ? "API key created" : "Generate new key"}
      >
        <div className="space-y-4">
          {!apiKeyModal.generatedKey ? (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none text-foreground">Label</label>
                <Input
                  value={apiKeyModal.label}
                  onChange={(e) => setApiKeyModal((p) => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Production"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setApiKeyModal({ open: false, label: "", generatedKey: null })}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleGenerateKey}>
                  Generate
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">Copy this key now. It won&apos;t be shown again.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-mono break-all text-foreground">
                  {apiKeyModal.generatedKey}
                </code>
                <Button
                  variant="secondary"
                  onClick={() => copyToClipboard(apiKeyModal.generatedKey!, "API key")}
                  leftIcon={<Copy className="h-4 w-4" />}
                >
                  Copy
                </Button>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setApiKeyModal({ open: false, label: "", generatedKey: null })}
              >
                Done
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
