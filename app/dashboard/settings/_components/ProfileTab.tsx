"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToasts } from "@/components/ui/Toasts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface SessionUser {
  userId: string;
  accountId: string;
  role: string;
  email: string;
  name: string;
}

interface ProfileTabProps {
  onSessionLoaded?: (user: SessionUser) => void;
}

export function ProfileTab({ onSessionLoaded }: ProfileTabProps) {
  const { addToast } = useToasts();

  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const initialNameRef = useRef("");

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/validate`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { data?: SessionUser }) => {
        const u = d?.data;
        if (u) {
          setSessionUser(u);
          const name = u.name?.trim() || u.email.split("@")[0].replace(/[._-]/g, " ");
          setDisplayName(name);
          setEmail(u.email ?? "");
          initialNameRef.current = name;
          onSessionLoaded?.(u);
        }
      })
      .catch(() => {})
      .finally(() => setProfileLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const dirty = displayName !== initialNameRef.current;

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!dirty) return;
      setSaving(true);
      try {
        const csrfRes = await fetch(`${API_BASE}/api/csrf`, { credentials: "include" });
        const csrfData = (await csrfRes.json().catch(() => ({}))) as { data?: { token?: string }; token?: string };
        const csrfToken = csrfData?.data?.token ?? csrfData?.token ?? "";
        const res = await fetch(`${API_BASE}/api/account/profile`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
          credentials: "include",
          body: JSON.stringify({ name: displayName }),
        });
        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
          throw new Error(errData?.error?.message ?? "Failed to save profile");
        }
        initialNameRef.current = displayName;
        addToast("Profile saved", "success");
      } catch {
        addToast("Failed to save profile", "error");
      } finally {
        setSaving(false);
      }
    },
    [dirty, displayName, addToast],
  );

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Manage your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="max-w-lg space-y-5" onSubmit={handleSave}>
          {profileLoading ? (
            <>
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none text-foreground">Name</label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none text-foreground">Email</label>
                <Input type="email" value={email} disabled className="bg-muted" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 py-3 px-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-success">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Signed in as <strong className="text-foreground">{sessionUser?.role ?? "member"}</strong>
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </>
          )}
          <Button
            type="submit"
            className="h-9 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            loading={saving}
            disabled={!dirty || profileLoading}
          >
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
