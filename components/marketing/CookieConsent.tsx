"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

const COOKIE_CONSENT_KEY = "westbridge_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Slight delay so it doesn't flash on page load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 shadow-lg md:bottom-4 md:left-4 md:right-auto md:max-w-md md:rounded-lg md:border">
      <p className="text-sm text-foreground">
        We use essential cookies for authentication and security. We also use analytics cookies to improve our
        platform.
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        By clicking &quot;Accept&quot;, you consent to analytics cookies. Essential cookies are always active.
        See our{" "}
        <a href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </a>
        .
      </p>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={accept}>
          Accept
        </Button>
        <Button size="sm" variant="outline" onClick={decline}>
          Essential Only
        </Button>
      </div>
    </div>
  );
}
