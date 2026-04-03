"use client";

import { useState, useEffect, useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.pricing, label: "Pricing" },
  { href: ROUTES.modules, label: "Modules" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.docs, label: "Docs" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
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
          "fixed left-0 right-0 top-0 z-40 h-16 transition-all duration-200",
          scrolled
            ? "border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href={ROUTES.home} className="inline-flex text-foreground hover:opacity-90">
            <Logo variant="full" size="sm" />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-100 hover:text-foreground",
                  pathname === link.href ? "text-foreground" : "text-muted-foreground",
                )}
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
                <Button asChild variant="ghost" size="sm">
                  <Link href={ROUTES.login}>Log in</Link>
                </Button>
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
            className="flex h-10 w-10 items-center justify-center rounded-md md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </nav>

      {/* Mobile overlay + drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-200 md:hidden",
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
        <div className="flex flex-1 flex-col gap-1 px-4 py-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobile}
              className={cn(
                "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            {isLoggedIn ? (
              <Button asChild className="w-full justify-center" onClick={closeMobile}>
                <Link href={ROUTES.dashboard}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="w-full justify-center" onClick={closeMobile}>
                  <Link href={ROUTES.login}>Log in</Link>
                </Button>
                <Button asChild className="w-full justify-center" onClick={closeMobile}>
                  <Link href={ROUTES.signup}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
