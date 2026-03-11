"use client";

import { useState, useEffect, useRef } from "react";
import { WelcomeModal } from "@/components/dashboard/WelcomeModal";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";

const WELCOMED_KEY = "wb_welcomed";

export function DashboardWelcome() {
  const [showWelcome, setShowWelcome] = useState<boolean | null>(null);
  const checklistRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setShowWelcome(
      typeof window !== "undefined"
        ? localStorage.getItem(WELCOMED_KEY) !== "true"
        : false,
    );
  }, []);

  return (
    <>
      <WelcomeModal
        open={showWelcome === true}
        onClose={() => setShowWelcome(false)}
        onGetStarted={() => {
          setShowWelcome(false);
          requestAnimationFrame(() =>
            checklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
          );
        }}
      />
      <OnboardingChecklist checklistRef={checklistRef} />
    </>
  );
}
