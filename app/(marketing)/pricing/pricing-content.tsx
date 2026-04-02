"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { PLANS } from "@/lib/modules";
import { ROUTES, TRIAL } from "@/lib/config/site";
import { formatCurrency } from "@/lib/locale/currency";
import { Button } from "@/components/ui/Button";

/* ── FAQ data (real answers, no fluff) ─────────────────────────────────────── */

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
    a: "Yes. There are no long-term contracts. Cancel anytime from your account settings -- you'll retain access until the end of your current billing period.",
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
    <div className="mx-auto max-w-6xl px-6 py-20">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <h1 className="text-center font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        Simple, transparent pricing
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-base leading-relaxed text-muted-foreground">
        Pick the plan that fits your business. Start with a {TRIAL.days}-day free trial -- no credit card required.
      </p>

      {/* ── Billing toggle ─────────────────────────────────────────────────── */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <button
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            annual ? "bg-foreground" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-sm transition-transform ${
              annual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
          Annual
          <span className="ml-1.5 rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-semibold text-foreground/70">
            Save 2 months
          </span>
        </span>
      </div>

      {/* ── Plan cards ─────────────────────────────────────────────────────── */}
      <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = annual ? plan.annualPricePerMonth : plan.pricePerMonth;
          const isPopular = plan.id === "starter";
          const isEnterprise = plan.id === "enterprise";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl p-7 transition-shadow ${
                isPopular ? "border-2 border-blue-600/20 shadow-sm" : "border border-border"
              }`}
            >
              {/* Popular badge */}
              {isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-50 px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  Most Popular
                </span>
              )}

              {/* Plan name */}
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{plan.name}</p>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-1">
                {isEnterprise ? (
                  <span className="text-3xl font-semibold tracking-tight text-foreground">Contact Sales</span>
                ) : (
                  <>
                    <span className="text-4xl font-semibold tracking-tight text-foreground">
                      {formatCurrency(price, "USD")}
                    </span>
                    <span className="text-sm text-muted-foreground">/mo</span>
                  </>
                )}
              </div>

              {/* Billing note */}
              {isEnterprise ? (
                <p className="mt-1.5 text-xs text-muted-foreground">Custom pricing for your organization</p>
              ) : annual ? (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Billed annually at {formatCurrency(price * 12, "USD")}/yr
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {formatCurrency(plan.annualPricePerMonth, "USD")}/mo if billed annually
                </p>
              )}

              {/* Divider */}
              <div className="my-6 h-px bg-border" />

              {/* Feature list */}
              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] leading-snug text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground/40" strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-8">
                {isEnterprise ? (
                  <Button asChild variant="outline" size="lg" className="w-full">
                    <Link href="mailto:sales@westbridgetoday.com">Contact Sales</Link>
                  </Button>
                ) : isPopular ? (
                  <Button asChild size="lg" className="w-full">
                    <Link href={ROUTES.signup}>Start Free Trial</Link>
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

      {/* Trial note */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        All plans include a {TRIAL.days}-day free trial. No credit card required.
      </p>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <div className="mx-auto mt-24 max-w-2xl">
        <h2 className="text-center font-display text-2xl font-semibold tracking-tight text-foreground">
          Frequently asked questions
        </h2>

        <div className="mt-10 divide-y divide-border">
          {FAQ_ITEMS.map((item, i) => (
            <div key={item.q} className="py-5">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-foreground">{item.q}</span>
                <ChevronDown
                  className={`ml-4 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ─────────────────────────────────────────────────────── */}
      <div className="mt-24 rounded-xl border border-border bg-foreground px-8 py-16 text-center text-background">
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Ready to get started?</h2>
        <p className="mt-3 text-sm text-background/60">
          Start your {TRIAL.days}-day free trial today. No credit card required.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-lg bg-background px-8 text-foreground hover:bg-background/90">
          <Link href={ROUTES.signup}>Start Free Trial</Link>
        </Button>
      </div>
    </div>
  );
}
