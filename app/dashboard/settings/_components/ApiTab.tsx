"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToasts } from "@/components/ui/Toasts";
import { api, type ApiKeyEntry } from "@/lib/api/client";

export function ApiTab() {
  const { addToast } = useToasts();

  const [accountId, setAccountId] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [keysLoading, setKeysLoading] = useState(true);

  const [apiKeyModal, setApiKeyModal] = useState<{ open: boolean; label: string; generatedKey: string | null }>({
    open: false,
    label: "",
    generatedKey: null,
  });
  const [generating, setGenerating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ApiKeyEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.auth
      .getSession()
      .then((session) => {
        if (!cancelled) setAccountId(session.accountId);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadKeys = useCallback(() => {
    setKeysLoading(true);
    api.settings.apiKeys
      .list()
      .then((data) => setApiKeys(data.keys))
      .catch(() => setApiKeys([]))
      .finally(() => setKeysLoading(false));
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleGenerateKey = useCallback(async () => {
    if (!apiKeyModal.label.trim()) {
      addToast("Please enter a label for the key", "error");
      return;
    }
    setGenerating(true);
    try {
      const result = await api.settings.apiKeys.create(apiKeyModal.label.trim());
      setApiKeyModal((p) => ({ ...p, generatedKey: result.key }));
      loadKeys();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to generate key", "error");
    } finally {
      setGenerating(false);
    }
  }, [apiKeyModal.label, addToast, loadKeys]);

  const handleDeleteKey = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.settings.apiKeys.delete(deleteTarget.id);
      addToast("API key deleted", "success");
      setDeleteTarget(null);
      loadKeys();
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to delete key", "error");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, addToast, loadKeys]);

  const copyToClipboard = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        addToast(`${label} copied to clipboard`, "success");
      } catch {
        addToast("Failed to copy to clipboard", "error");
      }
    },
    [addToast],
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.westbridgetoday.com";
  const webhookUrl = accountId ? `${appUrl}/api/webhooks/${accountId}` : "Loading\u2026";

  function formatKeyDate(dateStr: string | null): string {
    if (!dateStr) return "\u2014";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

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
                  <TableHead className="px-4 py-3 w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keysLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-8 text-center">
                      <div className="h-5 w-48 mx-auto animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ) : apiKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No API keys yet. Generate one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  apiKeys.map((row) => {
                    const isExpired = row.expiresAt ? new Date(row.expiresAt) < new Date() : false;
                    const status = isExpired ? "Expired" : "Active";
                    return (
                      <TableRow key={row.id} className="border-t border-border">
                        <TableCell className="px-4 py-3 font-mono text-sm text-foreground">{row.prefix}</TableCell>
                        <TableCell className="px-4 py-3 text-foreground">{row.label}</TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground">
                          {formatKeyDate(row.createdAt)}
                        </TableCell>
                        <TableCell className="px-4 py-3 text-muted-foreground">
                          {formatKeyDate(row.lastUsedAt)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <Badge status={status}>{status}</Badge>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <button
                            onClick={() => setDeleteTarget(row)}
                            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label={`Delete ${row.label}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
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
                <Button variant="primary" onClick={handleGenerateKey} disabled={generating}>
                  {generating ? "Generating..." : "Generate"}
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

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteKey}
        title={`Delete API key "${deleteTarget?.label ?? ""}"?`}
        description="This action cannot be undone. Any integrations using this key will stop working."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="destructive"
      />
    </>
  );
}
