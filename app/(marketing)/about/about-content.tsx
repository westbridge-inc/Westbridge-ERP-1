"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";

export default function AboutContent() {
  return (
    <div className="mx-auto max-w-6xl bg-background px-6 py-24">

      {/* Headline */}
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
          About Westbridge
        </p>
        <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-foreground md:text-5xl">
          Enterprise operations infrastructure.
          <br />
          <span className="text-muted-foreground/40">For every growing business.</span>
        </h1>
      </div>

      {/* Mission */}
      <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">Our mission</h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            We believe every business — regardless of size or location — deserves the same
            operational tools that Fortune 500 companies use. Not a watered-down version.
            Not &ldquo;good enough for small business.&rdquo; The real thing.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">The problem</h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            Growing businesses run critical operations on spreadsheets, WhatsApp threads,
            and disconnected tools. Finance in one app, HR in another, inventory in a third.
            We built Westbridge to replace all of that with one platform.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-24 h-px bg-border/60" />

      {/* Principles */}
      <div>
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">Principles</h2>
        <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">What we believe</h3>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-3">
          {[
            {
              title: "Works on day one",
              desc: "Not after a six-month implementation. Sign up, configure your modules, start operating — in minutes, not quarters.",
            },
            {
              title: "Compliance built in",
              desc: "Multi-currency, local tax rules, payroll deductions — these are first-class features, not afterthoughts or paid add-ons.",
            },
            {
              title: "Your data is yours",
              desc: "Export everything at any time in standard formats. No lock-in, no proprietary formats. Your business data always belongs to you.",
            },
          ].map((belief) => (
            <div key={belief.title} className="bg-card p-10">
              <p className="text-base font-semibold text-foreground">{belief.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/60">{belief.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="my-24 h-px bg-border/60" />

      {/* What sets us apart */}
      <div>
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">Differentiators</h2>
        <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">What&apos;s built in</h3>

        <div className="mt-12 space-y-1">
          {[
            {
              title: "AI-native platform",
              desc: "Claude AI is embedded in every module. Ask questions about your financials in plain English. Generate reports, draft invoices, flag anomalies — all from one chat interface.",
            },
            {
              title: "Global-ready compliance",
              desc: "Multi-currency support for 9+ currencies. Tax compliance for multiple jurisdictions. Payroll rules that adapt to your country. One platform that works whether you're in Georgetown, London, or Lagos.",
            },
            {
              title: "Enterprise security at every tier",
              desc: "AES-256 encryption, SSO, 2FA, tamper-proof audit trails, role-based access, SOC 2-aligned controls. The same security infrastructure a Fortune 500 would require — available from day one.",
            },
          ].map((item, i) => (
            <div key={item.title} className="flex gap-8 rounded-xl p-8 hover:bg-muted/30">
              <span className="shrink-0 text-3xl font-light text-muted-foreground/15">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h4 className="text-base font-semibold text-foreground">{item.title}</h4>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground/60">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="my-24 h-px bg-border/60" />

      {/* CTA */}
      <div className="rounded-2xl bg-foreground px-8 py-20 text-center text-background">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Ready to get started?
        </h2>
        <p className="mt-4 text-background/40">
          No credit card required. Up and running in minutes.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 h-12 rounded-lg bg-background px-8 text-foreground hover:bg-background/90"
        >
          <Link href={ROUTES.signup}>Start Free Trial <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  );
}
