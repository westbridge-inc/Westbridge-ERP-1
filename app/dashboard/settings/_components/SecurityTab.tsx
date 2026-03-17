"use client";

import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/Tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToasts } from "@/components/ui/Toasts";
import { validatePassword } from "@/lib/password-policy";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function SecurityTab() {
  const { addToast } = useToasts();

  const [changePwModal, setChangePwModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  const pwValidation = useMemo(() => validatePassword(newPw), [newPw]);

  const handleChangePw = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPwError("");
      if (newPw !== confirmPw) {
        setPwError("Passwords do not match");
        return;
      }
      if (!pwValidation.valid) {
        setPwError(pwValidation.errors[0]);
        return;
      }
      setPwSaving(true);
      try {
        const csrfRes = await fetch(`${API_BASE}/api/csrf`, { credentials: "include" });
        const csrfData = await csrfRes.json().catch(() => ({}));
        const csrfToken = csrfData?.data?.token ?? "";
        const res = await fetch(`${API_BASE}/api/auth/change-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
          body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
          credentials: "include",
        });
        if (res.ok) {
          setChangePwModal(false);
          setCurrentPw("");
          setNewPw("");
          setConfirmPw("");
          setPwError("");
          addToast("Password updated successfully", "success");
        } else {
          const d = await res.json().catch(() => ({}));
          setPwError(d?.error?.message ?? "Failed to update password");
        }
      } catch {
        setPwError("Network error. Please try again.");
      } finally {
        setPwSaving(false);
      }
    },
    [currentPw, newPw, confirmPw, pwValidation, addToast],
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Two-factor authentication and password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-start py-4 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
              <p className="text-sm text-muted-foreground">Add a second verification step on sign-in.</p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-9 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm opacity-50 cursor-not-allowed"
                    disabled
                    aria-disabled="true"
                  >
                    Enable
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">Two-factor authentication is coming soon.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex justify-between items-start py-4">
            <div>
              <p className="text-sm font-medium text-foreground">Change password</p>
              <p className="text-sm text-muted-foreground">Use a strong password that you don&apos;t use elsewhere.</p>
            </div>
            <Button
              variant="outline"
              size="default"
              className="rounded-md border border-input"
              onClick={() => {
                setPwError("");
                setCurrentPw("");
                setNewPw("");
                setConfirmPw("");
                setChangePwModal(true);
              }}
            >
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>

      <Modal open={changePwModal} onClose={() => setChangePwModal(false)} title="Change password">
        <form onSubmit={handleChangePw} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none text-foreground">Current password</label>
            <Input
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none text-foreground">New password</label>
            <Input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {newPw && !pwValidation.valid && (
            <ul className="space-y-1">
              {pwValidation.errors.map((err) => (
                <li key={err} className="text-xs text-destructive">
                  {err}
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium leading-none text-foreground">Confirm new password</label>
            <Input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {pwError && <p className="text-sm text-destructive">{pwError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setChangePwModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={pwSaving} disabled={!currentPw || !newPw || !confirmPw}>
              Update password
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
