"use client";

import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Users,
  FileText,
  Package,
  Calculator,
  FolderKanban,
  ShoppingCart,
} from "lucide-react";
import { ROUTES, TRIAL } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";

const MODULES = [
  { icon: FileText, name: "Invoicing", desc: "Quotes, orders, invoices, payments" },
  { icon: ShoppingCart, name: "Procurement", desc: "Purchase orders, suppliers, matching" },
  { icon: Package, name: "Inventory", desc: "Stock, warehouses, movement tracking" },
  { icon: Calculator, name: "Accounting", desc: "GL, journal entries, financial reports" },
  { icon: Users, name: "HR & Payroll", desc: "Employees, attendance, salary, tax" },
  { icon: FolderKanban, name: "Projects", desc: "Tasks, timesheets, billing" },
];

const STATS = [
  { value: "38", label: "Modules" },
  { value: "9", label: "Currencies" },
  { value: "99.9%", label: "Uptime" },
  { value: "<1s", label: "Response time" },
];

export function HomeContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 pt-32 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
            <Zap className="h-3 w-3" />
            AI-powered ERP platform
          </div>

          <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Run your entire business
            <br />
            <span className="text-muted-foreground/50">from one platform</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground/70">
            Invoicing, inventory, HR, payroll, accounting, CRM — with AI built into every module. One platform. No
            spreadsheets.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="h-12 rounded-lg px-8">
              <Link href={ROUTES.signup}>
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 rounded-lg px-8">
              <Link href={ROUTES.modules}>See All Features</Link>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground/40">No credit card required. {TRIAL.days}-day free trial.</p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">Modules</p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Everything you need to operate
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-muted-foreground/60">
            Replace disconnected tools with one unified platform. Every module works together seamlessly.
          </p>

          <div className="mt-16 grid grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod) => (
              <div
                key={mod.name}
                className="group flex flex-col rounded-2xl border border-transparent p-8 hover:border-border/50 hover:bg-muted/30"
              >
                <mod.icon className="h-5 w-5 text-foreground/30" />
                <h3 className="mt-4 text-base font-semibold text-foreground">{mod.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground/60">{mod.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Westbridge */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
            Why Westbridge
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Built different
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "AI-native",
                desc: "Claude AI is built into every module. Ask questions about your data, generate reports, draft invoices — in natural language.",
              },
              {
                icon: Globe,
                title: "Global-ready",
                desc: "Multi-currency, multi-language, any tax system. Works for businesses in 100+ countries with local compliance built in.",
              },
              {
                icon: Shield,
                title: "Enterprise security",
                desc: "SOC 2 ready. AES-256 encryption. SSO. 2FA. Tamper-proof audit trails. Role-based access with 5-tier permissions.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-foreground/5">
                  <item.icon className="h-5 w-5 text-foreground/40" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
            Getting started
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-semibold tracking-tight text-foreground">
            Up and running in minutes
          </h2>

          <div className="mt-16 space-y-12">
            {[
              { step: "01", title: "Create your account", desc: "Sign up in 60 seconds. Pick your plan and modules." },
              {
                step: "02",
                title: "Configure your business",
                desc: "Add your company details, invite your team, set up permissions.",
              },
              {
                step: "03",
                title: "Start operating",
                desc: "Create your first invoice, add employees, track inventory — everything from one dashboard.",
              },
            ].map((item) => (
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

      {/* Pricing preview */}
      <section className="border-t border-border/60 bg-muted/20 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">Pricing</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground/60">Start free. Upgrade when you&apos;re ready. No hidden fees.</p>

          <div className="mt-16 grid grid-cols-1 gap-8 text-left md:grid-cols-2">
            {[
              {
                name: "Solo",
                price: "$49.99",
                features: ["3 users", "Finance & Accounting", "50 AI queries/mo", "Email support"],
              },
              {
                name: "Starter",
                price: "$199.99",
                popular: true,
                features: ["10 users", "Finance + CRM", "200 AI queries/mo", "Priority support"],
              },
              {
                name: "Business",
                price: "$999.99",
                features: ["50 users", "4 module bundles", "1,000 AI queries/mo", "SSO & 2FA"],
              },
              {
                name: "Enterprise",
                price: "$4,999.99",
                features: ["Unlimited users", "All 38 modules", "Unlimited AI", "Dedicated manager"],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.popular
                    ? "border-2 border-foreground/10 bg-card shadow-[0_4px_24px_-4px_rgb(0_0_0/0.06)]"
                    : "border border-border/60 bg-card"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-medium text-foreground">{plan.name}</p>
                  <p className="text-lg font-semibold text-foreground">
                    {plan.price}
                    <span className="text-xs font-normal text-muted-foreground/50">/mo</span>
                  </p>
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-[13px] text-muted-foreground/60">
                      — {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Button asChild size="lg" className="mt-10 h-12 rounded-lg px-8">
            <Link href={ROUTES.pricing}>
              See Full Pricing <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60 bg-foreground px-6 py-24 text-background">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to streamline your business?
          </h2>
          <p className="mt-4 text-background/50">Join thousands of businesses running on Westbridge.</p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 rounded-lg bg-background px-8 text-foreground hover:bg-background/90"
          >
            <Link href={ROUTES.signup}>Start Free Trial</Link>
          </Button>
          <p className="mt-3 text-xs text-background/30">No credit card required. {TRIAL.days}-day free trial.</p>
        </div>
      </section>
    </>
  );
}
