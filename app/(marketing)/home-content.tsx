"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Users,
  Package,
  UserCog,
  BrainCircuit,
  ShieldCheck,
  Layers,
  Lock,
  Clock,
  BarChart3,
} from "lucide-react";
import { ROUTES, TRIAL } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";

const FEATURES = [
  {
    icon: Calculator,
    title: "Finance & Accounting",
    desc: "Double-entry ledger, invoicing, bank reconciliation, and multi-currency tax management.",
  },
  {
    icon: Users,
    title: "Sales & CRM",
    desc: "Pipeline tracking, deal scoring, automated quotations, and a self-serve customer portal.",
  },
  {
    icon: Package,
    title: "Inventory & Supply Chain",
    desc: "Multi-warehouse stock, purchase orders, serial tracking, and demand forecasting.",
  },
  {
    icon: UserCog,
    title: "HR & Payroll",
    desc: "Employee lifecycle management, payroll processing, leave tracking, and compliance.",
  },
  {
    icon: BrainCircuit,
    title: "Built-in AI",
    desc: "Revenue trends, overdue invoice alerts, stock predictions, and payroll anomaly detection.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "OIDC single sign-on, TOTP two-factor auth, audit logging, and role-based access control.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create your account",
    desc: "Sign up in under a minute. No credit card, no sales call.",
  },
  {
    num: "02",
    title: "Activate your modules",
    desc: "Turn on finance, CRM, inventory, HR, or the full suite.",
  },
  {
    num: "03",
    title: "Run your business",
    desc: "Send invoices, close deals, and manage payroll from one place.",
  },
];

const STATS = [
  { icon: Layers, value: "38", label: "Modules" },
  { icon: BarChart3, value: "7", label: "Bundles" },
  { icon: Lock, value: "256-bit", label: "Encryption" },
  { icon: Clock, value: `${TRIAL.days}-day`, label: "Free Trial" },
];

export function HomeContent() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────── */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pb-32 pt-32">
        <div className="mx-auto max-w-4xl text-center fade-in">
          <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground/60">
            Enterprise Resource Planning
          </p>

          <h1 className="mt-6 font-display text-[clamp(2.5rem,6vw,5rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            One platform to run
            <br />
            your entire business
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Accounting, CRM, inventory, HR, and manufacturing — unified with AI intelligence. Set up in minutes, not
            months.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 rounded-lg px-8 text-sm">
              <Link href={ROUTES.signup}>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-lg px-8 text-sm">
              <Link href={ROUTES.pricing}>See Pricing</Link>
            </Button>
          </div>

          <p className="mt-5 text-xs text-muted-foreground/50">No credit card required</p>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────── */}
      <section className="border-y border-border bg-foreground px-6 py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-10 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <stat.icon className="mb-3 h-5 w-5 text-background/40" strokeWidth={1.5} />
              <p className="text-2xl font-semibold tracking-tight text-background">{stat.value}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.15em] text-background/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────── */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-5xl fade-in">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground/50">
            Platform
          </p>
          <h2 className="mt-4 text-center font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Everything you need to operate
          </h2>
          <p className="mx-auto mt-5 max-w-md text-center text-sm leading-relaxed text-muted-foreground">
            Replace disconnected tools with one unified system. Every module works together out of the box.
          </p>

          <div className="mt-20 grid grid-cols-1 gap-x-1 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-2xl p-8 transition-colors duration-200 hover:bg-muted/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/[0.04]">
                  <f.icon
                    className="h-5 w-5 text-foreground/50 transition-colors duration-200 group-hover:text-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mt-5 text-[15px] font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────── */}
      <section className="border-t border-border px-6 py-32">
        <div className="mx-auto max-w-3xl fade-in">
          <p className="text-center text-[11px] font-medium uppercase tracking-[0.25em] text-muted-foreground/50">
            Getting started
          </p>
          <h2 className="mt-4 text-center font-display text-3xl font-semibold tracking-tight text-foreground">
            Up and running in minutes
          </h2>

          <div className="mt-20 space-y-16">
            {STEPS.map((s) => (
              <div key={s.num} className="flex items-start gap-8">
                <span className="shrink-0 font-display text-4xl font-extralight tracking-tight text-foreground/10">
                  {s.num}
                </span>
                <div className="pt-1">
                  <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────── */}
      <section className="bg-foreground px-6 py-32 text-background">
        <div className="mx-auto max-w-2xl text-center fade-in">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to streamline your operations?
          </h2>
          <p className="mt-5 text-base text-background/50">
            Start your {TRIAL.days}-day free trial today. No credit card required, no commitments.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-10 h-12 rounded-lg bg-background px-8 text-sm text-foreground hover:bg-background/90"
          >
            <Link href={ROUTES.signup}>
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
