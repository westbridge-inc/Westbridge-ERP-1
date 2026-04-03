"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, FileText, Users, UserPlus, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TRIAL } from "@/lib/config/site";

export interface SignupStep4Props {
  planName: string;
  onGoToDashboard?: () => void;
}

const quickStartItems = [
  {
    icon: FileText,
    title: "Create your first invoice",
    description: "Start tracking revenue",
    href: "/dashboard/invoices/new",
  },
  {
    icon: Users,
    title: "Add your first customer",
    description: "Build your customer directory",
    href: "/dashboard/crm/new",
  },
  {
    icon: UserPlus,
    title: "Invite your team",
    description: "Collaborate with your colleagues",
    href: "/dashboard/settings?tab=team",
  },
] as const;

function getTrialEndDate(): string {
  const end = new Date();
  end.setDate(end.getDate() + TRIAL.days);
  return end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function SignupStep4({ planName, onGoToDashboard }: SignupStep4Props) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [cancelled, setCancelled] = useState(false);

  const cancelRedirect = useCallback(() => {
    setCancelled(true);
  }, []);

  useEffect(() => {
    if (cancelled) return;

    const handleClick = () => cancelRedirect();
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [cancelled, cancelRedirect]);

  useEffect(() => {
    if (cancelled) return;

    if (countdown <= 0) {
      router.push("/dashboard");
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, cancelled, router]);

  const trialEnd = getTrialEndDate();

  return (
    <div className="flex flex-col items-center">
      <div className="h-16 w-16 rounded-full bg-foreground flex items-center justify-center">
        <Check className="w-8 h-8 text-background" />
      </div>

      <h1 className="text-2xl font-display font-semibold text-center mt-6">Welcome to Westbridge!</h1>

      <p className="text-sm text-muted-foreground text-center mt-3 max-w-sm mx-auto">
        Your 14-day free trial is active. Your workspace is ready with the {planName} plan.
      </p>

      <div className="w-full mt-8 space-y-3">
        {quickStartItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors group"
          >
            <div className="bg-foreground/5 rounded-lg h-9 w-9 flex items-center justify-center shrink-0">
              <item.icon className="w-4 h-4 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>

      <Button variant="default" type="button" className="w-full h-11 mt-8" onClick={onGoToDashboard} asChild>
        <Link href="/dashboard">
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Trial ends: {trialEnd}. You can upgrade or cancel anytime in Settings.
      </p>

      {!cancelled && (
        <p className="text-xs text-muted-foreground text-center mt-2">Redirecting to dashboard in {countdown}...</p>
      )}
    </div>
  );
}
