"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROUTES, TRIAL } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";

const STATS = [
  { value: "38", label: "Modules" },
  { value: "7", label: "Module bundles" },
  { value: "AI", label: "Powered insights" },
  { value: "SOC 2", label: "Ready" },
];

const PRINCIPLES = [
  {
    title: "Works on day one",
    desc: "Not after a six-month implementation. Sign up, configure your modules, start operating — in minutes, not quarters.",
  },
  {
    title: "Your data is yours",
    desc: "Export everything at any time in standard formats. No lock-in, no proprietary formats. Your business data always belongs to you.",
  },
  {
    title: "Enterprise tools, fair pricing",
    desc: "The same security, compliance, and depth that Fortune 500 companies require — available to businesses of every size.",
  },
];

export default function AboutContent() {
  return (
    <div className="mx-auto max-w-5xl bg-background px-6 py-24">
      {/* Headline */}
      <div className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">About Westbridge</p>
        <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.15] tracking-tight text-foreground md:text-5xl">
          Every business deserves enterprise-grade tools
          <br />
          <span className="text-muted-foreground/40">without the enterprise price tag.</span>
        </h1>
      </div>

      {/* Mission */}
      <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-2">
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">What we do</h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            Westbridge is a unified business operations platform. We bring accounting, CRM, inventory, HR, payroll,
            manufacturing, and project management into a single system — with AI built into every module.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            Instead of stitching together a dozen disconnected tools, businesses use Westbridge as their single source
            of truth. Every transaction, customer interaction, stock movement, and payroll run lives in one place,
            accessible to everyone who needs it.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">Why we built it</h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            Growing businesses run critical operations on spreadsheets, WhatsApp threads, and disconnected apps. Finance
            in one tool, HR in another, inventory in a third. Data never connects, decisions are made on incomplete
            information, and teams waste hours on manual reconciliation.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">
            We built Westbridge to replace all of that with one platform that works from day one — no six-month
            implementations, no consultants, no hidden costs.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="my-24 rounded-2xl border border-border/60 bg-muted/30">
        <div className="grid grid-cols-2 divide-x divide-border/60 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="px-6 py-8 text-center">
              <p className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Principles */}
      <div>
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">Principles</h2>
        <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground">What we believe</h3>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-3">
          {PRINCIPLES.map((belief) => (
            <div key={belief.title} className="bg-card p-10">
              <p className="text-base font-semibold text-foreground">{belief.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground/60">{belief.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="my-24 h-px bg-border/60" />

      {/* Contact */}
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">Get in touch</h2>
        <p className="mt-3 text-sm text-muted-foreground/60">
          Questions, partnerships, or enterprise inquiries — we would love to hear from you.
        </p>
        <a
          href="mailto:support@westbridgetoday.com"
          className="mt-2 inline-block text-sm font-medium text-foreground underline underline-offset-4 hover:text-foreground/80"
        >
          support@westbridgetoday.com
        </a>
      </div>

      {/* Divider */}
      <div className="my-24 h-px bg-border/60" />

      {/* CTA */}
      <div className="rounded-2xl bg-foreground px-8 py-20 text-center text-background">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Ready to get started?</h2>
        <p className="mt-4 text-background/40">No credit card required. {TRIAL.days}-day free trial.</p>
        <Button
          asChild
          size="lg"
          className="mt-8 h-12 rounded-lg bg-background px-8 text-foreground hover:bg-background/90"
        >
          <Link href={ROUTES.signup}>
            Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
