"use client";

import { useState, useSyncExternalStore, useRef } from "react";
import { WelcomeModal } from "@/components/dashboard/WelcomeModal";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";

const WELCOMED_KEY = "wb_welcomed";

function getWelcomedSnapshot(): boolean {
  return localStorage.getItem(WELCOMED_KEY) !== "true";
}
function getServerSnapshot(): boolean {
  return false;
}
const subscribe = () => () => {};

export function DashboardWelcome() {
  const needsWelcome = useSyncExternalStore(subscribe, getWelcomedSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const showWelcome = needsWelcome && !dismissed;
  const checklistRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <WelcomeModal
        open={showWelcome}
        onClose={() => setDismissed(true)}
        onGetStarted={() => {
          setDismissed(true);
          requestAnimationFrame(() =>
            checklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
          );
        }}
      />
      <OnboardingChecklist checklistRef={checklistRef} />
    </>
  );
}
