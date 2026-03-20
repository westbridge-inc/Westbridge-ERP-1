"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE, ROUTES } from "@/lib/config/site";
import { Logo } from "@/components/brand/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const productLinks = [
  { href: ROUTES.modules, label: "Features" },
  { href: ROUTES.pricing, label: "Pricing" },
  { href: ROUTES.about, label: "Documentation" },
];

const companyLinks = [
  { href: ROUTES.about, label: "About" },
  { href: "mailto:careers@westbridge.gy", label: "Careers" },
  { href: "mailto:support@westbridge.gy", label: "Contact" },
];

const legalLinks = [
  { href: ROUTES.privacy, label: "Privacy" },
  { href: ROUTES.terms, label: "Terms" },
];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/leads/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Failed to subscribe");
      setSubmitted(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <p className="text-sm font-medium text-primary">You&apos;re subscribed! Check your inbox.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        required
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="max-w-[220px]"
      />
      <Button
        type="submit"
        size="sm"
        className="shrink-0 rounded-md bg-primary text-primary-foreground"
        loading={submitting}
      >
        Subscribe
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      {/* Newsletter banner */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">Stay updated</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get business tips and product updates.</p>
          </div>
          <div className="flex flex-col gap-2">
            <NewsletterForm />
            <p className="text-[11px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div>
            <Logo variant="full" size="sm" className="text-foreground" />
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Product</p>
              <ul className="mt-4 space-y-3">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Company</p>
              <ul className="mt-4 space-y-3">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("mailto:") ? (
                      <a
                        href={link.href}
                        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
              <ul className="mt-4 space-y-3">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-border pt-8 text-[13px] text-muted-foreground">
          &copy; 2026 {SITE.name} {SITE.legal}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
