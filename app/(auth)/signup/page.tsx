"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { getPlan, isModuleIncludedInPlan } from "@/lib/modules";
import { ROUTES } from "@/lib/config/site";
import type { PlanId } from "@/lib/modules";
import { SignupStep1 } from "./SignupStep1";
import { SignupStep2 } from "./SignupStep2";
import { SignupStep3 } from "./SignupStep3";
import { SignupStep4 } from "./SignupStep4";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stepFromUrl = Math.min(4, Math.max(1, parseInt(searchParams.get("step") ?? "1", 10) || 1));
  const [step, setStepState] = useState(stepFromUrl);
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("United States");
  const [employees, setEmployees] = useState(5);
  const [planId, setPlanId] = useState<PlanId>("starter");
  const [addOnIds, setAddOnIds] = useState<Set<string>>(new Set());
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [step1Errors, setStep1Errors] = useState<{ company?: string; industry?: string }>({});

  const setStep = useCallback(
    (s: number) => {
      setStepState(s);
      const url = new URL(window.location.href);
      url.searchParams.set("step", String(s));
      router.replace(url.pathname + url.search, { scroll: false });
    },
    [router],
  );

  const returnFromPayment = searchParams.get("success") === "true";

  // Fetch CSRF token on mount and auto-refresh every 4 minutes to prevent
  // token expiry during long signup flows.
  useEffect(() => {
    const fetchCsrf = () => {
      fetch(`${API_BASE}/api/csrf`, { credentials: "include" })
        .then((r) => r.json())
        .then((d: { data?: { token?: string }; token?: string }) => setCsrfToken(d.data?.token ?? d.token ?? null))
        .catch(() => setCsrfToken(null));
    };
    fetchCsrf();
    const interval = setInterval(fetchCsrf, 4 * 60 * 1000); // Refresh every 4 min
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (returnFromPayment) setStep(4);
  }, [returnFromPayment, setStep]);

  useEffect(() => {
    setStepState(stepFromUrl);
  }, [stepFromUrl]);

  const plan = getPlan(planId);

  const toggleAddOn = (id: string) => {
    if (isModuleIncludedInPlan(id, planId)) return;
    setAddOnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href={ROUTES.home} className="flex shrink-0 items-center">
            <span className="font-semibold text-sm tracking-[0.2em] text-foreground font-display">WESTBRIDGE</span>
          </Link>
          <Link href={ROUTES.login} className="text-sm text-muted-foreground">
            Sign in
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-xl px-6 py-12">
        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-2 w-12 rounded-full ${step >= s ? "bg-primary" : "bg-border"}`} />
          ))}
        </div>

        {step === 1 && (
          <SignupStep1
            company={company}
            setCompany={setCompany}
            industry={industry}
            setIndustry={setIndustry}
            country={country}
            setCountry={setCountry}
            employees={employees}
            setEmployees={setEmployees}
            step1Errors={step1Errors}
            setStep1Errors={setStep1Errors}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <SignupStep2
            planId={planId}
            setPlanId={setPlanId}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <SignupStep3
            planId={planId}
            planName={plan.name}
            planPrice={plan.pricePerMonth}
            addOnIds={addOnIds}
            toggleAddOn={toggleAddOn}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <SignupStep4
            returnFromPayment={returnFromPayment}
            planName={plan.name}
            planIncludedBundleIds={[...plan.includedBundleIds]}
            addOnIds={addOnIds}
            company={company}
            csrfToken={csrfToken}
            setCsrfToken={setCsrfToken}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}

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
