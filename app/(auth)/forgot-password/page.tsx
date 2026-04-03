"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { ROUTES } from "@/lib/config/site";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/csrf`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCsrfToken(d?.data?.token ?? ""))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ email }),
      });
      if (res.status >= 500) {
        setError("Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        {sent ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
            <div className="mb-4 flex justify-center">
              <Mail className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <h1 className="text-lg font-semibold text-foreground font-display">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ve sent a password reset link to <strong className="text-foreground font-medium">{email}</strong>
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-foreground font-medium underline hover:no-underline"
              >
                try again
              </button>
              .
            </p>
            <Link href={ROUTES.login} className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground">
              &larr; Back to Login
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-foreground font-display">Forgot your password?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email address and we&apos;ll send you a reset link.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>

              <div aria-live="polite">{error && <p className="text-sm text-destructive">{error}</p>}</div>

              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={loading || !email.trim()}
                className="h-10 w-full"
              >
                {loading ? "Sending\u2026" : "Send Reset Link"}
              </Button>
            </form>

            <Link
              href={ROUTES.login}
              className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              &larr; Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
