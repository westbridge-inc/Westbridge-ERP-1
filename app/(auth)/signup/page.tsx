"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { Check, Lock } from "lucide-react";
import { ROUTES, TRIAL } from "@/lib/config/site";
import type { PlanId } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { SignupStep1 } from "./SignupStep1";
import { SignupStep2 } from "./SignupStep2";
import { SignupStep3 } from "./SignupStep3";
import { SignupStep4 } from "./SignupStep4";

const STEP_LABELS = ["Account", "Company", "Plan", "Done"] as const;

/* -------------------------------------------------------------------------- */
/*  Progress Bar                                                              */
/* -------------------------------------------------------------------------- */

function ProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mx-auto max-w-md py-8">
      <div className="flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const completed = currentStep > stepNum;
          const active = currentStep === stepNum;
          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                    completed
                      ? "bg-foreground text-background"
                      : active
                        ? "bg-foreground text-background"
                        : "border border-border bg-background text-muted-foreground",
                  )}
                >
                  {completed ? <Check className="h-4 w-4" /> : stepNum}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-xs",
                    completed || active ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-px flex-1 transition-colors",
                    currentStep > stepNum ? "bg-foreground" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main Content                                                              */
/* -------------------------------------------------------------------------- */

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("");
  const [planId, setPlanId] = useState<PlanId>("starter");
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Legacy ?payment=success redirect — compute initial step
  const paymentParam = searchParams.get("payment");
  const returnFromPayment = paymentParam === "success" || searchParams.get("success") === "true";
  const stepParam = parseInt(searchParams.get("step") ?? "1", 10) || 1;
  const initialStep = returnFromPayment ? 4 : Math.min(4, Math.max(1, stepParam));

  const [step, setStepState] = useState(initialStep);

  const setStep = useCallback(
    (s: number) => {
      setStepState(s);
      const url = new URL(window.location.href);
      url.searchParams.set("step", String(s));
      router.replace(url.pathname + url.search, { scroll: false });
    },
    [router],
  );

  // Fetch CSRF on mount, refresh every 4 minutes
  useEffect(() => {
    const fetchCsrf = () => {
      fetch("/api/csrf", { credentials: "include" })
        .then((r) => r.json())
        .then((d: { data?: { token?: string }; token?: string }) => setCsrfToken(d.data?.token ?? d.token ?? null))
        .catch(() => setCsrfToken(null));
    };
    fetchCsrf();
    const interval = setInterval(fetchCsrf, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Derive plan name for Step4
  const planName =
    planId === "solo" ? "Solo" : planId === "starter" ? "Starter" : planId === "business" ? "Business" : "Enterprise";

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href={ROUTES.home} className="flex shrink-0 items-center">
            <span className="font-semibold text-sm tracking-[0.2em] text-foreground font-display">WESTBRIDGE</span>
          </Link>
          <span className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={ROUTES.login}
              className="text-foreground font-medium underline underline-offset-4 hover:text-foreground/80"
            >
              Sign in
            </Link>
          </span>
        </div>
      </nav>

      {/* Progress bar */}
      <ProgressBar currentStep={step} />

      {/* Content area */}
      <div className="mx-auto max-w-md px-6">
        {step === 1 && (
          <SignupStep1
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            csrfToken={csrfToken}
            setCsrfToken={setCsrfToken}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <SignupStep2
            company={company}
            setCompany={setCompany}
            industry={industry}
            setIndustry={setIndustry}
            country={country}
            setCountry={setCountry}
            companySize={companySize}
            setCompanySize={setCompanySize}
            timezone={timezone}
            setTimezone={setTimezone}
            currency={currency}
            setCurrency={setCurrency}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <SignupStep3
            planId={planId}
            setPlanId={setPlanId}
            companySize={companySize}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && <SignupStep4 planName={planName} />}
      </div>

      {/* Trust footer */}
      <div className="mx-auto max-w-md px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="w-3 h-3" /> Your data is encrypted and secure
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{TRIAL.days}-day free trial · No credit card required</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page Export                                                                */
/* -------------------------------------------------------------------------- */

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground/60">
          Loading&hellip;
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
