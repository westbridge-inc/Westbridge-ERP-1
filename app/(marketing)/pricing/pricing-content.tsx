"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { PLANS } from "@/lib/modules";
import { ROUTES, TRIAL } from "@/lib/config/site";
import { formatCurrency } from "@/lib/locale/currency";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const FAQ_ITEMS = [
  {
    q: "Can I switch plans?",
    a: "Yes, you can upgrade or downgrade anytime. Changes take effect on your next billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: `Yes, every plan includes a ${TRIAL.days}-day free trial with full access. No credit card required.`,
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit cards via secure checkout. We also support international payment methods.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, there are no contracts. Cancel anytime from your account settings.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes, save the equivalent of 2 months when you choose annual billing.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "You can export everything in standard formats. After cancellation, your data is retained for 30 days before deletion.",
  },
];

export function PricingContent() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      {/* Header */}
      <h1 className="text-center font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        Simple, transparent pricing
      </h1>
      <p className="mt-3 text-center text-base text-muted-foreground/60">
        Per user, per month. No setup fees. Cancel anytime.
      </p>

      {/* Billing toggle */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <button
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            annual ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${
              annual ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
          Annual
          <span className="ml-1.5 rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-semibold text-foreground">
            Save 2 months
          </span>
        </span>
      </div>

      {/* Plan cards — 4 in a row */}
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = annual ? plan.annualPricePerMonth : plan.pricePerMonth;
          const isPopular = plan.id === "starter";
          const isEnterprise = plan.id === "enterprise";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl bg-card p-8 ${
                isPopular
                  ? "border-2 border-foreground/10 shadow-[0_4px_24px_-4px_rgb(0_0_0/0.08)]"
                  : "border border-border/60"
              }`}
            >
              {/* Popular badge */}
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-1 text-[11px] font-medium tracking-wider text-background border-transparent">
                  Most Popular
                </Badge>
              )}

              {/* Plan name */}
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{plan.name}</p>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-1">
                {isEnterprise ? (
                  <span className="text-3xl font-semibold tracking-tight text-foreground">Contact Us</span>
                ) : (
                  <>
                    <span className="text-4xl font-semibold tracking-tight text-foreground">
                      {formatCurrency(price, "USD")}
                    </span>
                    <span className="text-sm text-muted-foreground/60">/mo</span>
                  </>
                )}
              </div>

              {/* Billing note */}
              {isEnterprise ? (
                <p className="mt-1.5 text-xs text-muted-foreground/50">Custom pricing for your organization</p>
              ) : annual ? (
                <p className="mt-1.5 text-xs text-muted-foreground/50">
                  Billed annually — {formatCurrency(price * 12, "USD")}/yr
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground/50">
                  {formatCurrency(plan.annualPricePerMonth, "USD")}/mo billed annually
                </p>
              )}

              {/* User limit */}
              <p className="mt-3 text-sm font-medium text-foreground">
                {plan.limits.users === -1 ? "Unlimited users" : `Up to ${plan.limits.users} users`}
              </p>

              {/* Divider */}
              <div className="my-5 h-px bg-border/60" />

              {/* Feature list */}
              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[13px] text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground/30" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={isEnterprise ? "mailto:sales@westbridgetoday.com" : ROUTES.signup}
                className={`mt-8 flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors ${
                  isPopular
                    ? "bg-foreground text-background hover:opacity-90"
                    : "border border-border bg-background text-foreground hover:bg-muted/50"
                }`}
              >
                {isEnterprise ? "Contact Sales" : "Start Free Trial"}
              </Link>
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        All plans include a {TRIAL.days}-day free trial. No credit card required.
      </p>

      {/* FAQ Section */}
      <div className="mx-auto mt-24 max-w-2xl">
        <h2 className="text-center font-display text-2xl font-semibold tracking-tight text-foreground">
          Frequently asked questions
        </h2>

        <div className="mt-10 divide-y divide-border/60">
          {FAQ_ITEMS.map((item, i) => (
            <div key={item.q} className="py-5">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-foreground">{item.q}</span>
                <ChevronDown
                  className={`ml-4 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && <p className="mt-3 text-sm leading-relaxed text-muted-foreground/70">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-24 rounded-2xl bg-foreground px-8 py-16 text-center text-background">
        <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Ready to get started?</h2>
        <p className="mt-3 text-background/50">Start your free trial today. No credit card required.</p>
        <Button
          asChild
          size="lg"
          className="mt-8 h-12 rounded-lg bg-background px-8 text-foreground hover:bg-background/90"
        >
          <Link href={ROUTES.signup}>Start Free Trial</Link>
        </Button>
      </div>
    </div>
  );
}
