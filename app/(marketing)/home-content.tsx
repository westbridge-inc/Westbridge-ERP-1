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
  Check,
} from "lucide-react";
import { ROUTES, TRIAL } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

/* ── Features ─────────────────────────────────────── */
const FEATURES = [
  {
    icon: Calculator,
    title: "Finance & Accounting",
    desc: "Track every dollar in and out. Automate invoicing, reconcile accounts, and generate financial reports with one click.",
  },
  {
    icon: Users,
    title: "CRM & Sales",
    desc: "Track leads, manage your pipeline, and close deals faster with built-in quotation workflows and a customer portal.",
  },
  {
    icon: Package,
    title: "Inventory & Supply Chain",
    desc: "Real-time stock levels across warehouses. Purchase orders, serial tracking, and demand forecasting included.",
  },
  {
    icon: UserCog,
    title: "Human Resources",
    desc: "Employee lifecycle from onboarding to performance reviews. Leave tracking, attendance, and expense claims built in.",
  },
  {
    icon: BrainCircuit,
    title: "AI Powered",
    desc: "Ask questions about your business in plain English. Revenue trends, overdue alerts, and anomaly detection — powered by AI.",
  },
  {
    icon: ShieldCheck,
    title: "Security & Compliance",
    desc: "256-bit encryption, SSO, two-factor authentication, audit logging, and role-based access control. Enterprise-grade from day one.",
  },
];

/* ── How it works ─────────────────────────────────── */
const STEPS = [
  {
    num: 1,
    title: "Sign up & choose a plan",
    desc: "Create your account in under 2 minutes. No credit card, no sales call.",
  },
  {
    num: 2,
    title: "Connect your business data",
    desc: "Import customers, items, and employees. Or start fresh — we'll guide you.",
  },
  {
    num: 3,
    title: "Start managing everything",
    desc: "Invoices, inventory, CRM — all in one place. Send your first invoice today.",
  },
];

/* ── Stats ────────────────────────────────────────── */
const STATS = [
  { icon: Layers, value: "38", label: "Modules" },
  { icon: BarChart3, value: "7", label: "Bundles" },
  { icon: Lock, value: "256-bit", label: "Encryption" },
  { icon: Clock, value: `${TRIAL.days}-Day`, label: "Free Trial" },
];

export function HomeContent() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden pt-16 pb-16 sm:pt-20 md:pt-24">
        {/* Dot pattern + halo glow backdrop */}
        <div className="dot-pattern pointer-events-none absolute inset-0 -z-10" aria-hidden />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="fade-in mb-8 flex justify-center">
              <Badge variant="outline" className="gap-2 px-4 py-2">
                <span className="inline-block size-1.5 rounded-full bg-success" />
                Built for growing businesses
                <ArrowRight className="size-3" />
              </Badge>
            </div>

            <h1 className="fade-in mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              The Enterprise ERP
              <br />
              <span className="text-gradient-primary">for Growing Businesses</span>
            </h1>

            <p className="fade-in-delay-1 mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Manage invoicing, CRM, inventory, HR, and accounting — all in one platform built for modern teams.
            </p>

            <div className="fade-in-delay-2 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-11 px-8 text-base">
                <Link href={ROUTES.signup}>
                  Get Started <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-11 px-8 text-base">
                <Link href={ROUTES.pricing}>See Pricing</Link>
              </Button>
            </div>

            <p className="mt-5 text-sm text-muted-foreground">No credit card required.</p>
          </div>

          {/* Hero visual — dashboard screenshot placeholder with halo glow */}
          <div className="mx-auto mt-20 max-w-6xl">
            <div className="relative">
              <div className="absolute left-1/2 -top-8 -z-10 h-40 w-[90%] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl lg:h-80" />
              <div className="relative overflow-hidden rounded-xl border bg-card shadow-2xl">
                <div className="aspect-[16/9] bg-gradient-to-br from-muted to-muted/30" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-b from-transparent via-background/70 to-background md:h-40 lg:h-48" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────── */}
      <section className="border-y border-border bg-muted/30 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <stat.icon className="size-5" strokeWidth={1.75} />
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything your business needs, unified
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              One platform to replace your scattered spreadsheets, legacy tools, and disconnected workflows.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:p-8"
              >
                <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="size-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────── */}
      <section className="border-t border-border py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">
              How it works
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Get started in minutes</h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center md:text-left">
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground md:mx-0">
                  {s.num}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────── */}
      <section className="border-t border-border bg-muted/30 py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border bg-card p-8 shadow-xl md:p-16">
            <div className="absolute left-1/2 -top-20 -z-0 h-40 w-[80%] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to streamline your business?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start your {TRIAL.days}-day free trial today. No credit card required.
              </p>
              <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" /> No credit card
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" /> Cancel anytime
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="size-4 text-success" /> All features included
                </li>
              </ul>
              <Button asChild size="lg" className="mt-8 h-12 px-8 text-base">
                <Link href={ROUTES.signup}>
                  Get Started Free <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
