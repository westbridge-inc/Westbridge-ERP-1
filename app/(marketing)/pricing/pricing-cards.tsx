"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap, Info } from "lucide-react";
import { PLANS, MODULE_BUNDLES, formatLimit } from "@/lib/modules";
import { ROUTES } from "@/lib/config/site";
import { formatCurrency } from "@/lib/locale/currency";

const USAGE_ROWS = [
  { label: "Users", key: "users" as const, unit: "users" },
  { label: "Storage", key: "storageGB" as const, unit: "GB" },
  { label: "ERP records / mo", key: "erpRecordsPerMonth" as const, unit: "" },
  { label: "AI queries / mo", key: "aiQueriesPerMonth" as const, unit: "" },
  { label: "API calls / mo", key: "apiCallsPerMonth" as const, unit: "" },
];

export function PricingCards() {
  const [annual, setAnnual] = useState(false);
  const [showUsage, setShowUsage] = useState(false);

  return (
    <>
      {/* Billing toggle */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
        <button
          role="switch"
          aria-checked={annual}
          onClick={() => setAnnual((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${annual ? "bg-primary" : "bg-muted"}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
          Annual
          <span className="ml-1.5 rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold text-success">
            Save 2 months
          </span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const price = annual ? plan.annualPricePerMonth : plan.pricePerMonth;
          const isPopular = plan.id === "starter";

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl bg-card p-8 ${
                isPopular
                  ? "border-2 border-foreground/10 shadow-[0_4px_24px_-4px_rgb(0_0_0/0.08)]"
                  : "border border-border/60"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-4 py-1 text-[11px] font-medium tracking-wider text-background">
                  {plan.badge}
                </span>
              )}

              {/* Plan name + price */}
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{plan.name}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-foreground">
                  {formatCurrency(price, "USD")}
                </span>
                <span className="text-sm text-muted-foreground/60">/mo</span>
              </div>
              {annual ? (
                <p className="mt-1.5 text-xs text-muted-foreground/50">
                  Billed annually — {formatCurrency(price * 12, "USD")}/yr
                </p>
              ) : (
                <p className="mt-1.5 text-xs text-muted-foreground/50">
                  {formatCurrency(plan.annualPricePerMonth, "USD")}/mo billed annually
                </p>
              )}

              {/* Divider */}
              <div className="my-6 h-px bg-border/60" />

              {/* Features */}
              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[13.5px] text-foreground/80">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-foreground/30" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.id === "enterprise" ? "mailto:sales@westbridge.gy" : ROUTES.signup}
                className={`mt-8 flex w-full items-center justify-center rounded-lg px-6 py-3 text-sm font-medium ${
                  isPopular
                    ? "bg-foreground text-background hover:opacity-90"
                    : "border border-border bg-background text-foreground hover:bg-muted/50"
                }`}
              >
                {plan.id === "enterprise" ? "Contact Sales" : "Start Free Trial"}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Usage limits comparison toggle */}
      <div className="mx-auto mt-8 max-w-5xl">
        <button
          onClick={() => setShowUsage((v) => !v)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Info className="h-4 w-4" />
          {showUsage ? "Hide" : "Show"} usage limits & overage rates
        </button>

        {showUsage && (
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="py-3 pl-5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground/60">
                    Limit
                  </th>
                  {PLANS.map((p) => (
                    <th
                      key={p.id}
                      className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground/60"
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {USAGE_ROWS.map((row) => (
                  <tr key={row.key} className="border-b border-border">
                    <td className="py-3 pl-5 font-medium text-foreground">{row.label}</td>
                    {PLANS.map((p) => (
                      <td key={p.id} className="py-3 px-4 text-center text-muted-foreground">
                        {formatLimit(p.limits[row.key], row.unit)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-muted/40">
                  <td className="py-3 pl-5 font-semibold text-foreground">Overage — extra user</td>
                  {PLANS.map((p) => (
                    <td key={p.id} className="py-3 px-4 text-center text-muted-foreground">
                      {p.overageRates.perExtraUser === 0 ? "—" : `$${p.overageRates.perExtraUser}/user/mo`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 pl-5 font-semibold text-foreground">Overage — extra AI query</td>
                  {PLANS.map((p) => (
                    <td key={p.id} className="py-3 px-4 text-center text-muted-foreground">
                      {p.overageRates.perExtraAiQuery === 0 ? "—" : `$${p.overageRates.perExtraAiQuery}/query`}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add-on bundles */}
      <div className="mx-auto mt-8 max-w-5xl rounded-xl border border-border bg-muted/40 p-5">
        <p className="text-sm font-bold text-foreground">Need additional modules?</p>
        <p className="mt-1 text-sm text-muted-foreground">Add bundles to any plan. All bundles include AI features.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MODULE_BUNDLES.map((b) => (
            <span
              key={b.id}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground"
            >
              <Zap className="h-3 w-3 text-primary" />
              {b.name} —{" "}
              <span className="text-primary font-semibold">{formatCurrency(b.standalonePrice, "USD")}/mo</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
