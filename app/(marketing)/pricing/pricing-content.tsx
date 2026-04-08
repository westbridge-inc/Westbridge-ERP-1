"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ArrowRight } from "lucide-react";
import { PLANS } from "@/lib/modules";
import { ROUTES, TRIAL } from "@/lib/config/site";
import { formatCurrency } from "@/lib/locale/currency";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/* ── FAQ data ──────────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "Can I switch plans?",
    a: "Yes. You can upgrade or downgrade anytime from your account settings. Changes take effect on your next billing cycle and you only pay the difference.",
  },
  {
    q: "Is there a free trial?",
    a: `Every plan includes a ${TRIAL.days}-day free trial with full access to your plan's features. No credit card required to start.`,
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards processed securely through Paddle.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no long-term contracts. Cancel anytime from your account settings — you'll retain access until the end of your current billing period.",
  },
  {
    q: "Do you offer discounts for annual billing?",
    a: "Annual billing is coming soon. When available, you'll save the equivalent of two months per year.",
  },
  {
    q: "What's included in the trial?",
    a: `Full access to every feature in your chosen plan for ${TRIAL.days} days. No restrictions, no credit card, no commitment.`,
  },
];

/* ── Component ─────────────────────────────────────────────────────────────── */

export function PricingContent() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="relative isolate overflow-hidden">
      {/* Dot pattern backdrop */}
      <div className="dot-pattern pointer-events-none absolute inset-x-0 top-0 h-[500px] -z-10" aria-hidden />

      <div className="container mx-auto px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">
            Pricing
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, <span className="text-gradient-primary">transparent pricing</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Choose the plan that grows with your business. All plans include a {TRIAL.days}-day free trial.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-10 flex items-center justify-center">
          <div className="inline-flex items-center rounded-full border bg-muted p-1">
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                !annual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors",
                annual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Annual
              <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards — single bordered container with lifted popular card */}
        <div className="mx-auto mt-14 max-w-6xl">
          <div className="rounded-xl border bg-card">
            <div className="grid grid-cols-1 lg:grid-cols-4">
              {PLANS.map((plan) => {
                const price = annual ? plan.annualPricePerMonth : plan.pricePerMonth;
                const isPopular = plan.id === "starter";
                const isEnterprise = plan.id === "enterprise";

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col p-8",
                      !isPopular && "border-b last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0",
                      isPopular &&
                        "my-2 mx-4 rounded-xl bg-background shadow-xl ring-1 ring-border backdrop-blur lg:my-4",
                    )}
                  >
                    {isPopular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground shadow-md">
                        Most Popular
                      </Badge>
                    )}

                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{plan.name}</p>

                    <div className="mt-5 flex items-baseline gap-1">
                      {isEnterprise ? (
                        <span className="text-3xl font-semibold tracking-tight text-foreground">Contact Sales</span>
                      ) : (
                        <>
                          <span className="text-4xl font-semibold tracking-tight tabular-nums text-foreground">
                            {formatCurrency(price, "USD")}
                          </span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </>
                      )}
                    </div>

                    {isEnterprise ? (
                      <p className="mt-1.5 text-xs text-muted-foreground">Custom pricing for your organization</p>
                    ) : annual ? (
                      <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                        Billed annually at {formatCurrency(price * 12, "USD")}/yr
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(plan.annualPricePerMonth, "USD")}/mo if billed annually
                      </p>
                    )}

                    <div className="my-6 h-px bg-border" />

                    <ul className="flex-1 space-y-3">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/90">
                          <Check className="mt-0.5 size-4 flex-shrink-0 text-success" strokeWidth={2.5} />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      {isEnterprise ? (
                        <Button asChild variant="outline" size="lg" className="w-full">
                          <Link href="mailto:sales@westbridgetoday.com">Contact Sales</Link>
                        </Button>
                      ) : isPopular ? (
                        <Button asChild size="lg" className="w-full">
                          <Link href={ROUTES.signup}>
                            Start Free Trial <ArrowRight className="ml-2 size-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild variant="outline" size="lg" className="w-full">
                          <Link href={ROUTES.signup}>Start Free Trial</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          All plans include a {TRIAL.days}-day free trial. No credit card required.
        </p>

        {/* FAQ */}
        <div className="mx-auto mt-24 max-w-2xl">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={item.q} className="rounded-lg border bg-card">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-accent/50"
                  >
                    <span className="text-sm font-medium text-foreground">{item.q}</span>
                    <ChevronDown
                      className={cn(
                        "ml-4 size-4 flex-shrink-0 text-muted-foreground transition-transform",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t px-4 py-4">
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto mt-24 max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border bg-card p-8 text-center shadow-xl md:p-16">
            <div className="absolute left-1/2 -top-20 -z-0 h-40 w-[80%] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Still not sure? <span className="text-gradient-primary">Start your free trial.</span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">No credit card. No commitment. Cancel anytime.</p>
              <Button asChild size="lg" className="mt-8 h-12 px-8 text-base">
                <Link href={ROUTES.signup}>
                  Start {TRIAL.days}-Day Free Trial <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
