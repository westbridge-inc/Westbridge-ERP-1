"use client";

import { useState, useCallback } from "react";
import { Copy } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToasts } from "@/components/ui/Toasts";

export function IntegrationsTab() {
  const { addToast } = useToasts();

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

  return (
    <>
      <div className="max-w-2xl space-y-8">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">API keys</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage API keys for programmatic access.</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {apiKeys.length} active key{apiKeys.length !== 1 ? "s" : ""}
            </span>
            <Button
              variant="default"
              size="default"
              onClick={() => setApiKeyModal({ open: true, label: "", generatedKey: null })}
            >
              Create key
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
