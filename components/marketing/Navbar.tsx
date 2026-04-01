"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ROUTES } from "@/lib/config/site";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};
const getSnapshot = () => document.cookie.split(";").some((c) => c.trim().startsWith("westbridge_logged_in="));
const getServerSnapshot = () => false;

function useIsLoggedIn() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const navLinks = [
  { href: ROUTES.modules, label: "Features" },
  { href: ROUTES.pricing, label: "Pricing" },
  { href: ROUTES.about, label: "About" },
];

const SCROLL_THRESHOLD = 24;

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = useIsLoggedIn();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <nav
        className={cn(
          "fixed left-0 right-0 top-0 z-50 h-16 transition-all duration-200",
          scrolled
            ? "border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-6">
          <Link href={ROUTES.home} className="inline-flex text-foreground hover:opacity-90">
            <Logo variant="full" size="sm" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden items-center gap-3 md:flex">
            {isLoggedIn ? (
              <Button asChild size="sm">
                <Link href={ROUTES.dashboard}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link
                  href={ROUTES.login}
                  className="text-[13px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
                <Button asChild size="sm">
                  <Link href={ROUTES.signup}>Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </nav>

      {/* Mobile overlay + drawer — pure CSS transitions */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-200 md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMobile}
        aria-hidden
      />
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-[300px] flex-col border-l border-border bg-background transition-transform duration-200 ease-out md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <Logo variant="full" size="sm" />
          <button
            type="button"
            onClick={closeMobile}
            className="flex h-10 w-10 items-center justify-center rounded-md"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-6 px-6 py-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className="text-[13px] font-medium uppercase tracking-wider text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 border-t border-border pt-6">
            {isLoggedIn ? (
              <Link href={ROUTES.dashboard} onClick={closeMobile}>
                <Button className="w-full justify-center">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href={ROUTES.login} onClick={closeMobile}>
                  <Button variant="ghost" className="w-full justify-center">
                    Sign in
                  </Button>
                </Link>
                <Link href={ROUTES.signup} onClick={closeMobile}>
                  <Button className="w-full justify-center">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
