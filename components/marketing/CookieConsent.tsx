"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const COOKIE_NAME = "westbridge_consent";

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value};expires=${expires};path=/;SameSite=Lax`;
}

function getCookie(name: string): string | null {
  // Plain string parse — avoids RegExp construction entirely
  const prefix = `${name}=`;
  const parts = document.cookie.split("; ");
  for (const part of parts) {
    if (part.startsWith(prefix)) return part.slice(prefix.length);
  }
  return null;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // Don't show on dashboard pages (user already accepted by signing up)
  const isDashboard = pathname?.startsWith("/dashboard");

  useEffect(() => {
    if (isDashboard) return;
    const consent = getCookie(COOKIE_NAME);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isDashboard]);

  function acceptAll() {
    setCookie(COOKIE_NAME, "all", 365);
    setVisible(false);
  }

  function essentialOnly() {
    setCookie(COOKIE_NAME, "essential", 365);
    setVisible(false);
  }

  if (!visible || isDashboard) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300 border-t border-border bg-background p-4 shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use cookies to improve your experience and analyze usage. Read our{" "}
          <Link href="/privacy" className="text-foreground underline hover:no-underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" size="sm" onClick={essentialOnly}>
            Manage
          </Button>
          <Button size="sm" onClick={acceptAll}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
