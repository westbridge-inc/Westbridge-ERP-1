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

/* ── Section 23: Features Grid ─────────────────────── */
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

/* ── Section 24: How It Works ──────────────────────── */
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

/* ── Section 22: Stats Strip ───────────────────────── */
const STATS = [
  { icon: Layers, value: "38", label: "Modules" },
  { icon: BarChart3, value: "7", label: "Bundles" },
  { icon: Lock, value: "256-bit", label: "Encryption" },
  { icon: Clock, value: `${TRIAL.days}-Day`, label: "Free Trial" },
];

export function HomeContent() {
  return (
    <>
      {/* ── Section 21: Hero ─────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="fade-in font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground text-balance md:text-5xl lg:text-6xl">
            The Enterprise ERP
            <br />
            for Growing Businesses
          </h1>

          <p className="fade-in-delay-1 mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Manage invoicing, CRM, inventory, HR, and accounting — all in one platform built for modern teams.
          </p>

          <div className="fade-in-delay-2 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-lg px-8 text-base">
              <Link href={ROUTES.signup}>Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-lg px-8 text-base">
              <Link href={ROUTES.pricing}>
                See Pricing <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="mt-5 text-sm text-muted-foreground/50">No credit card required.</p>
        </div>
      </section>

      {/* ── Section 22: Stats Strip ────────────────────── */}
      <section className="border-y border-border bg-muted/30 px-6 py-12 md:py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4 md:gap-12">
          {STATS.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
                <stat.icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              </div>
              <p className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 23: Features Grid ─────────────────── */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything your business needs, unified
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-muted-foreground">
            One platform to replace your scattered spreadsheets, legacy tools, and disconnected workflows.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border p-6 transition-colors duration-150 hover:bg-muted/40 md:p-8"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
                  <f.icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 24: How It Works ───────────────────── */}
      <section className="border-t border-border px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Get started in minutes
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center md:text-left">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background md:mx-0">
                  {s.num}
                </div>
                <h3 className="mt-4 text-xl font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 25: Final CTA ──────────────────────── */}
      <section className="bg-foreground px-6 py-20 text-background md:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Ready to streamline your business?
          </h2>
          <p className="mt-4 text-lg text-background/70">Start your {TRIAL.days}-day free trial today.</p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-lg bg-background px-8 text-base text-foreground hover:bg-background/90"
          >
            <Link href={ROUTES.signup}>Get Started Free</Link>
          </Button>
          <p className="mt-4 text-sm text-background/50">No credit card required.</p>
        </div>
      </section>
    </>
  );
}
