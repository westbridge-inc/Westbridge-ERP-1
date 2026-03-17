"use client";

import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToasts } from "@/components/ui/Toasts";
import { validatePassword } from "@/lib/password-policy";
import { api, type TotpSetupResult } from "@/lib/api/client";

export function SecurityTab() {
  const { addToast } = useToasts();

  // Password state
  const [changePwModal, setChangePwModal] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  // 2FA state
  const [setupModal, setSetupModal] = useState(false);
  const [setupData, setSetupData] = useState<TotpSetupResult | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpError, setTotpError] = useState("");
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disableModal, setDisableModal] = useState(false);
  const [disabling, setDisabling] = useState(false);

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
        await api.auth.changePassword(currentPw, newPw);
        setChangePwModal(false);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
        setPwError("");
        addToast("Password updated successfully", "success");
      } catch (err) {
        setPwError(err instanceof Error ? err.message : "Failed to update password");
      } finally {
        setPwSaving(false);
      }
    },
    [currentPw, newPw, confirmPw, pwValidation, addToast],
  );

  const handleSetup2FA = useCallback(async () => {
    setTotpLoading(true);
    setTotpError("");
    try {
      const data = await api.auth.setup2FA();
      setSetupData(data);
      setSetupModal(true);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to start 2FA setup", "error");
    } finally {
      setTotpLoading(false);
    }
  }, [addToast]);

  const handleVerify2FA = useCallback(async () => {
    if (totpCode.length !== 6) return;
    setTotpLoading(true);
    setTotpError("");
    try {
      await api.auth.verify2FA(totpCode);
      setTotpEnabled(true);
      setShowBackupCodes(true);
      setTotpCode("");
      addToast("Two-factor authentication enabled", "success");
    } catch (err) {
      setTotpError(err instanceof Error ? err.message : "Invalid code. Try again.");
    } finally {
      setTotpLoading(false);
    }
  }, [totpCode, addToast]);

  const handleDisable2FA = useCallback(async () => {
    setDisabling(true);
    try {
      await api.auth.disable2FA();
      setTotpEnabled(false);
      setDisableModal(false);
      setSetupData(null);
      addToast("Two-factor authentication disabled", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to disable 2FA", "error");
    } finally {
      setDisabling(false);
    }
  }, [addToast]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Two-factor authentication and password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 2FA section */}
          <div className="flex justify-between items-start py-4 border-b border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Two-factor authentication</p>
              <p className="text-sm text-muted-foreground">
                {totpEnabled
                  ? "2FA is enabled. Your account is protected with an authenticator app."
                  : "Add a second verification step on sign-in."}
              </p>
            </div>
            {totpEnabled ? (
              <Button
                variant="outline"
                className="rounded-md border border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => setDisableModal(true)}
              >
                Disable
              </Button>
            ) : (
              <Button
                className="h-9 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm"
                onClick={handleSetup2FA}
                loading={totpLoading}
              >
                Enable
              </Button>
            )}
          </div>

          {/* Change password section */}
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

      {/* 2FA Setup Modal */}
      <Modal
        open={setupModal}
        onClose={() => !showBackupCodes && setSetupModal(false)}
        title="Set up two-factor authentication"
      >
        <div className="space-y-4">
          {showBackupCodes ? (
            <>
              <p className="text-sm text-foreground">
                Save these backup codes in a safe place. You can use them to access your account if you lose your
                authenticator device.
              </p>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/30 p-4">
                {setupData?.backupCodes.map((code) => (
                  <code key={code} className="text-sm font-mono text-foreground">
                    {code}
                  </code>
                ))}
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  setSetupModal(false);
                  setShowBackupCodes(false);
                }}
              >
                Done
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Scan this code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
              </p>
              {setupData && (
                <>
                  <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                    <p className="text-xs text-muted-foreground mb-2">Can&apos;t scan? Enter this key manually:</p>
                    <code className="text-sm font-mono text-foreground break-all">{setupData.secret}</code>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Enter the 6-digit code from your app</label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                      onKeyDown={(e) => e.key === "Enter" && handleVerify2FA()}
                      className="text-center text-lg tracking-widest font-mono"
                    />
                  </div>
                  {totpError && <p className="text-sm text-destructive">{totpError}</p>}
                  <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setSetupModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleVerify2FA} loading={totpLoading} disabled={totpCode.length !== 6}>
                      Verify & Enable
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Disable 2FA Confirmation */}
      <Modal open={disableModal} onClose={() => setDisableModal(false)} title="Disable two-factor authentication">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This will remove the second verification step from your account. Are you sure?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDisableModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDisable2FA}
              loading={disabling}
            >
              Disable 2FA
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
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
