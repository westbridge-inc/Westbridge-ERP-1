"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FileText, ShoppingCart, Package, Calculator, Users, FolderKanban, Check, Phone } from "lucide-react";
import { ROUTES, TRIAL } from "@/lib/config/site";
import { PLANS } from "@/lib/modules";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/Select";
import { BackgroundBeams } from "@/components/aceternity/BackgroundBeams";
import { TextGenerateEffect } from "@/components/aceternity/TextGenerateEffect";
import { BentoGrid } from "@/components/aceternity/BentoGrid";
import { InfiniteMovingCards } from "@/components/aceternity/InfiniteMovingCards";
import { Card, CardContent } from "@/components/ui/Card";

const BENTO_CARDS = [
  {
    title: "Sales & Invoicing",
    description: "Quotations, orders, and invoices in one place. Track payments and overdue items.",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Procurement",
    description: "Purchase orders, supplier management, and three-way matching.",
    icon: <ShoppingCart className="h-5 w-5" />,
  },
  {
    title: "Inventory Management",
    description: "Stock levels, warehouses, and movement tracking across locations.",
    icon: <Package className="h-5 w-5" />,
  },
  {
    title: "Accounting & Finance",
    description: "General ledger, chart of accounts, journal entries, and financial reports.",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    title: "Human Resources",
    description: "Employees, attendance, payroll, and leave management.",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Projects & Timesheets",
    description: "Projects, tasks, and time tracking for accurate billing.",
    icon: <FolderKanban className="h-5 w-5" />,
  },
];

function DashboardPreview() {
  const [imageError, setImageError] = useState(false);
  if (imageError) {
    return (
      <div className="w-full max-w-4xl h-64 mx-auto rounded-xl border border-border bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
        Dashboard Preview
      </div>
    );
  }
  return (
    <Image
      src="/images/dashboard-preview.png"
      alt="Westbridge dashboard"
      width={1200}
      height={675}
      className="w-full max-w-4xl mx-auto rounded-xl border border-border shadow-xl"
      onError={() => setImageError(true)}
    />
  );
}

const CARIBBEAN_COUNTRIES = [
  "Guyana",
  "Trinidad & Tobago",
  "Barbados",
  "Jamaica",
  "Suriname",
  "Bahamas",
  "Belize",
  "Antigua & Barbuda",
  "Dominica",
  "Grenada",
  "St. Kitts & Nevis",
  "St. Lucia",
  "St. Vincent & the Grenadines",
  "Haiti",
  "Dominican Republic",
  "Cayman Islands",
  "Bermuda",
  "Turks & Caicos",
  "British Virgin Islands",
  "U.S. Virgin Islands",
  "Curacao",
  "Aruba",
  "Other",
];

function DemoCTASection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    country: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/leads/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again or contact us directly.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-border bg-gradient-to-br from-muted/40 via-background to-muted/60 px-6 py-20">
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">Get a Free Demo</h2>
            <p className="mt-4 text-muted-foreground">
              See how Westbridge can transform your business. Book a 15-minute demo with our team.
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  Or call us:{" "}
                  <a
                    href="tel:+5926001234"
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    +592 600 1234
                  </a>
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <svg className="h-4 w-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.347 0-4.518-.804-6.236-2.152l-.436-.348-3.148 1.055 1.055-3.148-.348-.436A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                <span>
                  WhatsApp:{" "}
                  <a
                    href="https://wa.me/5926001234"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-foreground hover:text-primary transition-colors"
                  >
                    +592 600 1234
                  </a>
                </span>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">Demo Booked!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Our team will reach out within 24 hours to confirm your demo time.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="demo-name" className="mb-1.5 block text-sm font-medium text-foreground">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="demo-name"
                      required
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="demo-email" className="mb-1.5 block text-sm font-medium text-foreground">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="demo-email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="demo-company" className="mb-1.5 block text-sm font-medium text-foreground">
                      Company Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="demo-company"
                      required
                      placeholder="Your company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="demo-phone" className="mb-1.5 block text-sm font-medium text-foreground">
                      Phone <span className="text-muted-foreground text-xs">(optional)</span>
                    </label>
                    <Input
                      id="demo-phone"
                      type="tel"
                      placeholder="+592 xxx xxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="demo-country" className="mb-1.5 block text-sm font-medium text-foreground">
                      Country <span className="text-destructive">*</span>
                    </label>
                    <Select
                      required
                      value={formData.country}
                      onValueChange={(value) => setFormData({ ...formData, country: value })}
                    >
                      <SelectTrigger id="demo-country">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARIBBEAN_COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-md bg-primary text-primary-foreground"
                    loading={submitting}
                  >
                    Book Demo
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    quote:
      "We closed our first external audit in 3 days instead of 3 weeks. Everything was already in one place — invoices, GL entries, expense claims. The auditor didn't ask for a single spreadsheet.",
    name: "Anita Ramkissoon",
    company: "Trident Distribution Ltd",
    role: "CFO, Trinidad",
  },
  {
    quote:
      "We were running payroll on a spreadsheet for 31 employees. Migrating to Westbridge took one afternoon. We imported our employee list, configured the salary structure, and ran payroll the same week.",
    name: "Jerome Baptiste",
    company: "Baptiste & Sons Construction",
    role: "Operations Manager, Barbados",
  },
  {
    quote:
      "The multi-currency support is what sold us. We invoice in USD and GYD, deal with TTD suppliers, and need NIS calculations done right. Every other platform either didn't support it or charged extra for it.",
    name: "Natasha Persaud",
    company: "Persaud Trading Co.",
    role: "Owner, Guyana",
  },
  {
    quote:
      "We switched from QuickBooks because it couldn't handle GYD properly. Westbridge does multi-currency natively — USD invoices for our overseas suppliers, GYD for local customers. Saved us hours every week.",
    name: "Rajesh Doobay",
    company: "Doobay Hardware Supplies",
    role: "Owner, Guyana",
  },
  {
    quote:
      "Managing inventory across our warehouse in Kingston and distribution in Montego Bay used to require two separate systems. Now it's one dashboard with real-time stock levels.",
    name: "Camille St. Cyr",
    company: "Island Fresh Exports",
    role: "Founder, Jamaica",
  },
  {
    quote:
      "The payroll module handles NIS and PAYE automatically. Our HR team no longer dreads month-end. We process 87 employees in under 10 minutes.",
    name: "Denise Thompson-Ali",
    company: "Caribbean Professional Services",
    role: "Managing Director, Trinidad",
  },
];

export function HomeContent() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-6 pt-24 pb-20">
        <BackgroundBeams className="opacity-60" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Caribbean&apos;s #1 Cloud ERP
          </p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-[56px]">
            The ERP Built for Caribbean Businesses
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-lg text-muted-foreground">
            <TextGenerateEffect
              words="From Georgetown to Port of Spain, Westbridge handles your invoicing, inventory, payroll, VAT compliance, and multi-currency accounting — all in one platform."
              duration={1.2}
            />
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-md bg-primary px-8 text-primary-foreground">
              <Link href={ROUTES.signup}>Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-md px-8">
              <Link href={ROUTES.modules}>See Features</Link>
            </Button>
          </div>
          <div className="mt-12 w-full max-w-4xl mx-auto">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Social proof bar */}
      <section className="border-t border-border bg-muted/20 py-6">
        <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {[
            "Trusted across 15+ Caribbean territories",
            "GYD \u00b7 USD \u00b7 TTD \u00b7 BBD \u00b7 XCD built-in",
            "VAT, NIS & PAYE compliant",
          ].map((point, i) => (
            <span key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
              {i > 0 && (
                <span className="hidden text-border sm:inline" aria-hidden>
                  ·
                </span>
              )}
              {point}
            </span>
          ))}
        </div>
      </section>

      {/* Features - Bento */}
      <section className="border-t border-border bg-background px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-foreground">
            Everything you need
          </h2>
          <div className="mt-12">
            <BentoGrid cards={BENTO_CARDS} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-3">
            {[
              { step: "1", title: "Sign up", desc: "Create your account in 60 seconds." },
              { step: "2", title: "Configure", desc: "Set up your modules and team." },
              { step: "3", title: "Operate", desc: "Run your entire business from one dashboard." },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <span className="font-display text-4xl font-semibold text-muted-foreground/80">{item.step}</span>
                <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                {item.step !== "3" && (
                  <div className="absolute left-[60%] top-8 hidden h-px w-[80%] bg-border md:block" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-background py-20">
        <div className="mx-auto max-w-6xl px-6">
          <InfiniteMovingCards
            cards={TESTIMONIALS}
            className="[mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-muted/20 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-display text-3xl font-semibold tracking-tight text-foreground">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Per user, per month. No setup fees. Cancel anytime.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PLANS.slice(0, 3).map((plan) => {
              const isPopular = plan.id === "business";
              const cta = plan.id === "enterprise" ? "Contact Sales" : "Start Free Trial";
              const href = plan.id === "enterprise" ? ROUTES.about : ROUTES.signup;
              return (
                <Card key={plan.id} className={`relative flex flex-col ${isPopular ? "ring-2 ring-primary" : ""}`}>
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
                      Most Popular
                    </span>
                  )}
                  <CardContent className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-xl font-semibold text-foreground">{plan.name}</h3>
                    <p className="mt-4 text-3xl font-bold text-foreground">
                      ${plan.pricePerMonth.toLocaleString()}
                      <span className="text-base font-normal text-muted-foreground">/mo</span>
                    </p>
                    <ul className="mt-6 space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="h-4 w-4 shrink-0 text-primary" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="mt-auto w-full rounded-md bg-primary text-primary-foreground" size="lg">
                      <Link href={href}>{cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo CTA */}
      <DemoCTASection />

      {/* Final CTA */}
      <section className="bg-primary px-6 py-20 text-primary-foreground">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Ready to modernize your Caribbean business?
          </h2>
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-md bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link href={ROUTES.signup}>Get started free</Link>
          </Button>
          <p className="mt-4 text-sm text-primary-foreground/80">
            No credit card required. {TRIAL.days}-day free trial.
          </p>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Join hundreds of Caribbean businesses already on Westbridge
          </p>
        </div>
      </section>
    </>
  );
}
