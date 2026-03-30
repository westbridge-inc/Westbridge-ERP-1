"use client";

import Link from "next/link";
import { ArrowRight, Calculator, Users, Package, UserCog, BrainCircuit, ShieldCheck } from "lucide-react";
import { ROUTES, TRIAL } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";

const FEATURES = [
  {
    icon: Calculator,
    title: "Finance & Accounting",
    desc: "Double-entry accounting, invoicing, bank reconciliation, tax management",
  },
  {
    icon: Users,
    title: "Sales & CRM",
    desc: "Pipeline tracking, deal scoring, quotations, customer portal",
  },
  {
    icon: Package,
    title: "Inventory",
    desc: "Multi-warehouse, purchase orders, serial tracking, demand forecasting",
  },
  {
    icon: UserCog,
    title: "HR & Payroll",
    desc: "Employee management, payroll processing, leave tracking",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered",
    desc: "Bridge AI analyzes your data — revenue trends, overdue invoices, stock alerts, payroll anomalies",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    desc: "OIDC single sign-on, TOTP 2FA, audit logging, role-based access, API keys",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Sign up and choose your plan",
    desc: "Create your account in under a minute. Pick the plan that fits your business.",
  },
  {
    step: "02",
    title: "Connect your modules",
    desc: "Activate the modules you need — finance, CRM, inventory, HR, or all of them.",
  },
  {
    step: "03",
    title: "Start running your business",
    desc: "Send your first invoice, track your pipeline, manage payroll — all from one dashboard.",
  },
];

export function HomeContent() {
  return (
    <>
      {/* Hero */}
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 pt-24 pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-display text-5xl font-semibold leading-[1.08] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Run your entire business
            <br />
            <span className="text-muted-foreground/50">from one platform</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground/70">
            Accounting, CRM, inventory, HR, and manufacturing — unified with AI. Set up in minutes, not months.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 rounded-lg px-8">
              <Link href={ROUTES.signup}>
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-lg px-8">
              <Link href={ROUTES.pricing}>See Pricing</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground/40">No credit card required. {TRIAL.days}-day free trial.</p>
        </div>
      </section>

      {/* Value prop strip */}
      <section className="border-y border-border/60 bg-muted/30 px-6 py-10">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-muted-foreground/60">
          <span>No credit card required</span>
          <span className="hidden sm:inline">|</span>
          <span>{TRIAL.days}-day free trial</span>
          <span className="hidden sm:inline">|</span>
          <span>Cancel anytime</span>
          <span className="hidden sm:inline">|</span>
          <span>Set up in under 5 minutes</span>
        </div>
      </section>

      {/* Feature grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
            Platform
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Everything you need to operate
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground/60">
            Replace disconnected tools with one unified platform. Every module works together seamlessly.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="group flex flex-col rounded-2xl border border-transparent p-8 hover:border-border/50 hover:bg-muted/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/5">
                  <feature.icon className="h-5 w-5 text-foreground/40" strokeWidth={1.5} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
            Getting started
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-foreground">
            Up and running in minutes
          </h2>

          <div className="mt-16 space-y-12">
            {STEPS.map((item) => (
              <div key={item.step} className="flex gap-8">
                <span className="shrink-0 text-3xl font-light text-muted-foreground/20">{item.step}</span>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground/60">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 bg-foreground px-6 py-24 text-background">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to streamline your business?
          </h2>
          <p className="mt-4 text-background/50">
            Start your {TRIAL.days}-day free trial today. No credit card required.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-lg bg-background px-8 text-foreground hover:bg-background/90"
          >
            <Link href={ROUTES.signup}>Start Free Trial</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
