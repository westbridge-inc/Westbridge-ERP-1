"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Check, Circle, CheckCircle } from "lucide-react";
import { ROUTES } from "@/lib/config/site";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

interface InviteInfo {
  email: string;
  role: string;
  companyName: string;
}

const PW_REQUIREMENTS = [
  { label: "At least 10 characters", test: (p: string) => p.length >= 10 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /\d/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/csrf`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCsrfToken(d?.data?.token ?? ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) {
      setInviteError("Missing invite token.");
      setLoading(false);
      return;
    }
    fetch(`${API_BASE}/api/invite?token=${encodeURIComponent(token)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok && d.error) {
          setInviteError(d.error.message ?? d.error ?? "Invalid invite");
          return;
        }
        setInviteInfo({ email: d.data.email, role: d.data.role, companyName: d.data.companyName });
      })
      .catch(() => setInviteError("Failed to load invite. Please try again."))
      .finally(() => setLoading(false));
  }, [token]);

  const requirements = PW_REQUIREMENTS.map((r) => ({ ...r, met: r.test(password) }));
  const allMet = requirements.every((r) => r.met);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allMet) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/invite/accept`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ token, name, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error?.message ?? data?.error ?? "Something went wrong.");
        return;
      }

      // Try to auto-login after accepting the invite
      try {
        const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
          body: JSON.stringify({ email: inviteInfo?.email, password }),
        });
        if (loginRes.ok) {
          const loginData = await loginRes.json().catch(() => ({}));
          const sessionToken = loginData?.data?.sessionToken;
          if (sessionToken) {
            await fetch(`${API_BASE}/api/auth/session`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: sessionToken }),
            });
          }
          setSuccess(true);
          setTimeout(() => router.push(ROUTES.dashboard), 2000);
          return;
        }
      } catch {
        // Auto-login failed — fall back to manual login redirect
      }

      setSuccess(true);
      setTimeout(() => router.push(ROUTES.login), 2500);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="text-center text-sm text-muted-foreground">Verifying invite&hellip;</div>;
  }

  if (inviteError) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-destructive">{inviteError}</p>
        <Link href={ROUTES.login} className="mt-4 block text-sm text-muted-foreground hover:text-foreground">
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
      {success ? (
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-success" />
          <h1 className="mt-4 text-lg font-display font-semibold text-foreground">You&apos;re in!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Taking you to your dashboard&hellip;</p>
        </div>
      ) : (
        <>
          <h1 className="text-xl font-display font-semibold text-foreground">Join {inviteInfo?.companyName}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve been invited as <strong className="text-foreground font-medium">{inviteInfo?.role}</strong>. Set
            up your account below.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{inviteInfo?.email}</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                required
                autoFocus
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="pr-10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {requirements.map((req) => (
                    <li key={req.label} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <Check className="w-3 h-3 text-foreground" />
                      ) : (
                        <Circle className="w-3 h-3 text-muted-foreground/40" />
                      )}
                      <span className={req.met ? "text-foreground" : "text-muted-foreground"}>{req.label}</span>
                    </li>
                  ))}
                  {allMet && (
                    <li className="text-xs text-foreground font-medium mt-1">Password meets all requirements</li>
                  )}
                </ul>
              )}
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <Button
              type="submit"
              variant="default"
              size="lg"
              disabled={submitting || !name.trim() || !allMet}
              className="h-11 w-full"
            >
              {submitting ? "Setting up your account\u2026" : "Create Account"}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

export default function InvitePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading&hellip;</div>}>
          <InviteContent />
        </Suspense>
      </div>
    </div>
  );
}
