"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { ROUTES } from "@/lib/config/site";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [csrfLoaded, setCsrfLoaded] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => {
    fetch("/api/csrf", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { data?: { token?: string }; token?: string }) => setCsrfToken(d.data?.token ?? d.token ?? null))
      .catch(() => setCsrfToken(null))
      .finally(() => setCsrfLoaded(true));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!csrfToken) {
      setError("Security token missing. Please refresh the page.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 403) {
          setError("Session expired. Please refresh and try again.");
          setCsrfToken(null);
          return;
        }
        const msg = typeof data?.error === "object" ? data.error?.message : data?.error;
        setError(msg || "Invalid credentials");
        setFailedAttempts((n) => n + 1);
        return;
      }
      // If the proxy returned a session token, set the httpOnly cookie via POST
      // then navigate to the dashboard. We MUST verify the session cookie was
      // set successfully before redirecting — otherwise the user lands on a
      // protected route without auth and gets bounced back to login.
      const sessionToken = data?.data?.sessionToken;
      if (sessionToken) {
        try {
          const sessionRes = await fetch("/api/auth/session", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: sessionToken }),
          });
          if (!sessionRes.ok) {
            setError("Failed to establish session. Please try again.");
            return;
          }
        } catch {
          setError("Failed to establish session. Please try again.");
          return;
        }
      }
      // Use replace() instead of push() so the back button doesn't return to login
      router.replace(ROUTES.dashboard);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setFailedAttempts((n) => n + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left: brand panel — muted bg with dot pattern + halo, hidden on mobile */}
      <div className="relative isolate hidden min-h-screen w-[50%] flex-col items-center justify-center overflow-hidden border-r border-border bg-muted/30 md:flex">
        <div className="dot-pattern pointer-events-none absolute inset-0" aria-hidden />
        <div className="absolute left-1/2 top-1/2 h-[60%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center px-12">
          <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <span className="text-xl font-bold">W</span>
          </div>
          <span className="mb-2 text-2xl font-bold tracking-tight text-foreground">WESTBRIDGE</span>
          <p className="max-w-[280px] text-sm leading-relaxed text-muted-foreground">
            Your complete business management platform.
          </p>
          <div className="mt-12 w-full max-w-[280px] space-y-3">
            {["38 modules", "Enterprise-grade security", "AI-powered insights"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="size-1.5 shrink-0 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background md:w-[50%]">
        <div className="w-full max-w-[400px] px-6 md:px-8">
          {/* Mobile: show small logo */}
          <div className="mb-8 flex justify-center md:hidden">
            <Logo variant="mark" size="md" className="text-foreground" />
          </div>

          <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your Westbridge account</p>

          {!csrfLoaded ? (
            <div className="mt-8 space-y-5" aria-busy="true">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-11 w-full rounded-md border border-input bg-muted/50" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-11 w-full rounded-md border border-input bg-muted/50" />
              </div>
              <div className="mt-8 h-11 w-full rounded-md bg-muted" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 rounded-md border-border focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-md border-border focus-visible:ring-ring"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div aria-live="polite">
                {error && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-destructive">
                      <p>{error}</p>
                      {failedAttempts >= 3 && (
                        <p className="mt-1 text-xs">
                          Forgot your password?{" "}
                          <Link href="/forgot-password" className="underline hover:no-underline">
                            Reset it here
                          </Link>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                <Link
                  href="/forgot-password"
                  className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
                >
                  Forgot your password?
                </Link>
              </p>

              <Button type="submit" disabled={loading} className="h-11 w-full">
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={ROUTES.signup}
              className="font-medium text-foreground underline underline-offset-2 hover:no-underline"
            >
              Get started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
