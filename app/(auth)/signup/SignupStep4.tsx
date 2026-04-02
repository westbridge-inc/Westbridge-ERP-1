import Link from "next/link";
import { useCallback, useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { validatePassword, TOTAL_PW_REQUIREMENTS } from "@/lib/password-policy";
import { ROUTES } from "@/lib/config/site";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const PADDLE_PRICES: Record<string, string> = {
  Solo: process.env.NEXT_PUBLIC_PADDLE_PRICE_SOLO ?? "",
  Starter: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER ?? "",
  Business: process.env.NEXT_PUBLIC_PADDLE_PRICE_BUSINESS ?? "",
  Enterprise: process.env.NEXT_PUBLIC_PADDLE_PRICE_ENTERPRISE ?? "",
};

export interface SignupStep4Props {
  returnFromPayment: boolean;
  paymentFailed: boolean;
  planName: string;
  planIncludedBundleIds: string[];
  addOnIds: Set<string>;
  company: string;
  csrfToken: string | null;
  setCsrfToken: (v: string | null) => void;
  onBack: () => void;
}

export function SignupStep4({
  returnFromPayment,
  paymentFailed,
  planName,
  planIncludedBundleIds,
  addOnIds,
  company,
  csrfToken,
  setCsrfToken,
  onBack,
}: SignupStep4Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paddleOpen, setPaddleOpen] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [, setEmailValid] = useState(false);

  const validateEmail = useCallback((value: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value.trim());
  }, []);

  if (paymentFailed) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <XCircle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-foreground font-display">Payment failed</h1>
        <p className="mt-3 text-muted-foreground max-w-sm">
          Your payment could not be processed. Please try again or contact support if the issue persists.
        </p>
        <Button
          variant="default"
          size="lg"
          className="mt-8 h-12 w-full max-w-xs text-sm font-medium tracking-wide"
          asChild
        >
          <Link href={ROUTES.signup}>Try again</Link>
        </Button>
      </div>
    );
  }

  if (returnFromPayment) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-foreground font-display">Your account is now active!</h1>
        <p className="mt-3 text-muted-foreground max-w-sm">
          You&apos;re all set on the <strong>{planName}</strong> plan. Your workspace is ready to go.
        </p>
        <Button
          variant="default"
          size="lg"
          className="mt-8 h-12 w-full max-w-xs text-sm font-medium tracking-wide"
          asChild
        >
          <Link href={ROUTES.dashboard}>Go to Dashboard</Link>
        </Button>
        <Link href={ROUTES.login} className="mt-4 text-sm text-muted-foreground hover:text-foreground transition">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-foreground font-display">Create your account</h1>
      <form
        className="mt-8 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setSignupError(null);
          if (!csrfToken) {
            setSignupError("Security token missing. Please refresh the page.");
            return;
          }
          setSubmitting(true);
          try {
            const res = await fetch(`${API_BASE}/api/signup`, {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
              },
              body: JSON.stringify({
                name,
                email,
                password,
                companyName: company,
                plan: planName,
                modulesSelected: [...planIncludedBundleIds, ...addOnIds],
              }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              if (res.status === 403) {
                setSignupError("Session expired. Please refresh and try again.");
                setCsrfToken(null);
                return;
              }
              const msg = typeof data?.error === "object" ? data.error?.message : data?.error;
              setSignupError(msg || "Signup failed");
              return;
            }
            const payload = data.data ?? data;
            const selectedPriceId = PADDLE_PRICES[planName] ?? "";
            if (selectedPriceId && window.Paddle) {
              setPaddleOpen(true);
              window.Paddle.Checkout.open({
                items: [{ priceId: selectedPriceId, quantity: 1 }],
                customer: { email },
                customData: { accountId: payload.accountId ?? "" },
                settings: {
                  successUrl: `${window.location.origin}/signup?payment=success`,
                  displayMode: "overlay",
                  theme: "light",
                },
              });
              return;
            }
            setSignupError(
              !selectedPriceId
                ? "No price configured for the selected plan. Please contact support."
                : "Payment system is loading. Please try again in a moment.",
            );
          } catch {
            setSignupError("Something went wrong. Please try again.");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full name</Label>
          <Input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input
            id="signup-email"
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailValid(validateEmail(e.target.value));
            }}
            onBlur={() => {
              setEmailTouched(true);
              setEmailValid(validateEmail(email));
            }}
          />
          {emailTouched && email.trim() && !validateEmail(email) && (
            <p className="text-sm text-destructive" role="alert">
              Enter a valid email address
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {password.length > 0 &&
            (() => {
              const pwResult = validatePassword(password);
              const passed = TOTAL_PW_REQUIREMENTS - pwResult.errors.length;
              return (
                <>
                  <ul className="mt-2 space-y-1 text-xs">
                    {pwResult.errors.length === 0 ? (
                      <li className="text-success">{"\u2713"} Password meets all requirements</li>
                    ) : (
                      pwResult.errors.map((e) => (
                        <li key={e} className="text-destructive">
                          {"\u2717"} {e}
                        </li>
                      ))
                    )}
                  </ul>
                  <div className="mt-2 flex gap-1">
                    {Array.from({ length: TOTAL_PW_REQUIREMENTS }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          i < passed
                            ? passed === TOTAL_PW_REQUIREMENTS
                              ? "bg-success"
                              : passed >= 4
                                ? "bg-warning"
                                : "bg-destructive"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </>
              );
            })()}
        </div>
        <div aria-live="polite">{signupError && <p className="text-sm text-destructive">{signupError}</p>}</div>
        <Button
          variant="default"
          size="lg"
          type="submit"
          disabled={
            submitting || paddleOpen || !csrfToken || !validateEmail(email) || !validatePassword(password).valid
          }
          className="mt-6 h-11 w-full"
        >
          {!csrfToken ? (
            "Loading\u2026"
          ) : submitting ? (
            "Setting up your workspace\u2026"
          ) : paddleOpen ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Waiting for payment...
            </span>
          ) : (
            "Continue to payment"
          )}
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground/40">
          You&apos;ll complete payment securely via Paddle. All major cards supported.
        </p>
      </form>
      <button type="button" onClick={onBack} className="mt-4 text-sm text-muted-foreground/60 hover:opacity-100">
        Back
      </button>
    </>
  );
}
