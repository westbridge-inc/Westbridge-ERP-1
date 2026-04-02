export const revalidate = 3600; // 1 hour — marketing pages change infrequently
import Link from "next/link";
import { ROUTES, TRIAL, SITE } from "@/lib/config/site";

export const metadata = {
  title: "Docs | Westbridge",
  description: "Getting started with Westbridge — setup, modules, API, security, and billing.",
  openGraph: {
    title: "Docs | Westbridge",
    description: "Getting started with Westbridge — setup, modules, API, security, and billing.",
  },
};

const NAV_ITEMS = [
  { id: "getting-started", label: "Getting Started" },
  { id: "dashboard", label: "Dashboard" },
  { id: "modules", label: "Modules" },
  { id: "api", label: "API" },
  { id: "security", label: "Security" },
  { id: "billing", label: "Billing" },
  { id: "support", label: "Support" },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">Documentation</p>
      <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
        Westbridge Docs
      </h1>
      <p className="mt-3 text-base text-muted-foreground/60">
        Everything you need to set up, configure, and run your business on Westbridge.
      </p>

      {/* Section nav */}
      <nav className="mt-10 flex flex-wrap gap-2">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="rounded-md border border-border/60 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-16">
        {/* ── Getting Started ─────────────────────────────────────── */}
        <section id="getting-started">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Getting Started</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Sign up at{" "}
              <Link href={ROUTES.signup} className="text-foreground underline underline-offset-4 hover:opacity-80">
                {SITE.domain}/signup
              </Link>{" "}
              and follow the four-step onboarding flow:
            </p>
            <ol className="list-decimal space-y-2 pl-6">
              <li>
                <span className="font-medium text-foreground">Company profile</span> — Enter your company name,
                industry, country, and team size.
              </li>
              <li>
                <span className="font-medium text-foreground">Choose a plan</span> — Select Solo, Starter, Business, or
                Enterprise. Every plan includes a {TRIAL.days}-day free trial with full access. No credit card required.
              </li>
              <li>
                <span className="font-medium text-foreground">Module add-ons</span> — Your plan includes a set of module
                bundles. Add additional bundles here if you need them.
              </li>
              <li>
                <span className="font-medium text-foreground">Create your account</span> — Set your email and password.
                After payment confirmation (processed via Paddle), you land directly in your dashboard.
              </li>
            </ol>
            <p>
              Once inside, a guided onboarding checklist walks you through initial configuration — connecting your chart
              of accounts, inviting team members, and sending your first invoice.
            </p>
          </div>
        </section>

        {/* ── Dashboard ───────────────────────────────────────────── */}
        <section id="dashboard">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>The main dashboard gives you a real-time view of your business. It includes:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <span className="font-medium text-foreground">KPI cards</span> — Total Revenue (month-to-date with
                trend), Active Users, Open Invoices, and Pending Orders. Each card shows period-over-period change.
              </li>
              <li>
                <span className="font-medium text-foreground">Revenue chart</span> — Visual breakdown of monthly
                revenue, rendered as an interactive chart.
              </li>
              <li>
                <span className="font-medium text-foreground">Recent activity</span> — A live feed of the latest
                transactions, status changes, and events across all modules.
              </li>
              <li>
                <span className="font-medium text-foreground">Quick actions</span> — One-click shortcuts to create a new
                invoice, add an expense, or build a quotation.
              </li>
              <li>
                <span className="font-medium text-foreground">Bridge AI</span> — An AI chat panel (powered by
                Anthropic&apos;s Claude) available on every page. Ask questions in natural language — revenue trends,
                overdue invoices, stock alerts, payroll anomalies — and get answers drawn from your live data.
              </li>
            </ul>
            <p>
              An ERP status indicator in the header shows the connection health of the backend services. If the backend
              is temporarily unreachable, the dashboard displays a service notice and retries automatically.
            </p>
          </div>
        </section>

        {/* ── Modules ─────────────────────────────────────────────── */}
        <section id="modules">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Modules</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Westbridge organizes 38 modules into 7 bundles. Each bundle includes built-in AI features via Bridge AI.
              See the full breakdown on the{" "}
              <Link href={ROUTES.modules} className="text-foreground underline underline-offset-4 hover:opacity-80">
                Modules page
              </Link>
              .
            </p>

            <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/60 sm:grid-cols-2">
              {[
                {
                  name: "Finance & Accounting",
                  desc: "General Ledger, AP/AR, fixed assets, bank reconciliation, multi-currency, tax management, budgeting, and financial reporting (P&L, balance sheet, cash flow).",
                  count: 9,
                },
                {
                  name: "Sales & CRM",
                  desc: "Lead management, opportunity pipeline, quotation builder, sales orders, territory management, and customer portal.",
                  count: 6,
                },
                {
                  name: "Inventory & Supply Chain",
                  desc: "Stock management, multi-warehouse, purchase orders, supplier management, bill of materials, quality inspection, and batch/serial tracking.",
                  count: 7,
                },
                {
                  name: "HR & Payroll",
                  desc: "Employee records, attendance and leave, payroll processing, expense claims, recruitment, training, and performance reviews.",
                  count: 7,
                },
                {
                  name: "Manufacturing",
                  desc: "Production planning, work orders, routing and operations, subcontracting, and capacity planning.",
                  count: 5,
                },
                {
                  name: "Project Management",
                  desc: "Project tracking, task management, billable timesheets, and Gantt charts connected to your financials.",
                  count: 4,
                },
                {
                  name: "Business Tools",
                  desc: "Website builder, e-commerce storefront, point of sale terminals, and custom report builder.",
                  count: 4,
                },
              ].map((bundle) => (
                <div key={bundle.name} className="bg-card p-6">
                  <p className="text-sm font-semibold text-foreground">{bundle.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground/50">{bundle.count} modules</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground/60">{bundle.desc}</p>
                </div>
              ))}
            </div>

            <p>
              Bundles are tied to plans. Solo includes Finance. Starter adds CRM. Business adds Inventory and HR.
              Enterprise includes all 38 modules. Additional bundles can be purchased as add-ons from{" "}
              <span className="font-medium text-foreground">Settings &gt; Modules</span>.
            </p>
          </div>
        </section>

        {/* ── API ─────────────────────────────────────────────────── */}
        <section id="api">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">API</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Westbridge exposes a RESTful API for programmatic access to your data. All endpoints are available under{" "}
              <code className="rounded border border-border bg-muted px-1.5 py-0.5 text-sm text-foreground">
                /api/erp/*
              </code>{" "}
              and return JSON.
            </p>
            <p>
              <span className="font-medium text-foreground">API key management</span> is available in{" "}
              <span className="font-medium text-foreground">Settings &gt; API</span>. Generate labeled keys, view
              prefixes, track last-used dates, and revoke keys at any time. Keys are shown once on creation and cannot
              be retrieved afterward — store them securely.
            </p>
            <p>
              A <span className="font-medium text-foreground">webhook URL</span> unique to your account is also
              provided. Share it with external services that need to send events to Westbridge.
            </p>
            <p>
              The full OpenAPI specification is available at{" "}
              <code className="rounded border border-border bg-muted px-1.5 py-0.5 text-sm text-foreground">
                /api/docs
              </code>
              , accessible from the API settings tab.
            </p>
            <p>
              API call limits depend on your plan — from 5,000/month on Solo to unlimited on Enterprise. Overage billing
              applies automatically when you exceed your plan&apos;s allocation.
            </p>
          </div>
        </section>

        {/* ── Security ────────────────────────────────────────────── */}
        <section id="security">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Security</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>Westbridge is built with enterprise-grade security at every layer:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <span className="font-medium text-foreground">OIDC Single Sign-On</span> — Connect your identity
                provider (Google Workspace, Okta, Azure AD) for centralized authentication. Available on Business and
                Enterprise plans.
              </li>
              <li>
                <span className="font-medium text-foreground">TOTP Two-Factor Authentication</span> — Enable 2FA from{" "}
                <span className="font-medium text-foreground">Settings &gt; Security</span> using any authenticator app
                (Google Authenticator, Authy, 1Password). Backup codes are generated on setup.
              </li>
              <li>
                <span className="font-medium text-foreground">Role-based access control</span> — Assign granular
                permissions per user. Control who can view, create, edit, or delete records across every module.
              </li>
              <li>
                <span className="font-medium text-foreground">Audit logging</span> — Every significant action is logged
                with a timestamp, user, and IP address. Enterprise plans include downloadable security audit reports.
              </li>
              <li>
                <span className="font-medium text-foreground">256-bit encryption</span> — All data is encrypted in
                transit (TLS) and at rest. Payment data is handled by Paddle in accordance with PCI standards.
              </li>
              <li>
                <span className="font-medium text-foreground">Session fingerprinting</span> — Sessions are bound to
                device and browser characteristics. Suspicious session changes trigger re-authentication.
              </li>
              <li>
                <span className="font-medium text-foreground">Password policy</span> — Enforced strength requirements on
                all passwords with real-time validation during entry.
              </li>
            </ul>
          </div>
        </section>

        {/* ── Billing ─────────────────────────────────────────────── */}
        <section id="billing">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Billing</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Westbridge offers four plans: <span className="font-medium text-foreground">Solo</span> ($49.99/mo),{" "}
              <span className="font-medium text-foreground">Starter</span> ($199.99/mo),{" "}
              <span className="font-medium text-foreground">Business</span> ($999.99/mo), and{" "}
              <span className="font-medium text-foreground">Enterprise</span> (custom pricing). Annual billing saves the
              equivalent of 2 months. Full details on the{" "}
              <Link href={ROUTES.pricing} className="text-foreground underline underline-offset-4 hover:opacity-80">
                Pricing page
              </Link>
              .
            </p>
            <p>
              Payments are processed via <span className="font-medium text-foreground">Paddle</span>, supporting all
              major credit cards and international payment methods. Subscription fees are billed in advance monthly or
              annually.
            </p>
            <p>
              <span className="font-medium text-foreground">Overage billing</span> applies automatically on Solo,
              Starter, and Business plans when usage exceeds plan limits (users, storage, ERP records, API calls, or AI
              queries). Enterprise has no overage charges.
            </p>
            <p>
              Manage your subscription from <span className="font-medium text-foreground">Settings &gt; Billing</span> —
              upgrade, downgrade, or view billing history. Changes take effect on the next billing cycle.
            </p>
            <p>
              <span className="font-medium text-foreground">Cancellation</span> is available at any time with no
              contracts. Your subscription remains active until the end of the current billing period. After
              cancellation, data is retained for 30 days before deletion. You can export everything in standard formats
              at any time.
            </p>
          </div>
        </section>

        {/* ── Support ─────────────────────────────────────────────── */}
        <section id="support">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Support</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              For questions, issues, or feature requests, contact us at{" "}
              <a
                href="mailto:support@westbridgetoday.com"
                className="text-foreground underline underline-offset-4 hover:opacity-80"
              >
                support@westbridgetoday.com
              </a>
              .
            </p>
            <p>Response times depend on your plan:</p>
            <ul className="list-disc space-y-1 pl-6">
              <li>
                <span className="font-medium text-foreground">Solo</span> — Email support
              </li>
              <li>
                <span className="font-medium text-foreground">Starter</span> — Priority email support (12-hour response)
              </li>
              <li>
                <span className="font-medium text-foreground">Business</span> — Priority support (4-hour response)
              </li>
              <li>
                <span className="font-medium text-foreground">Enterprise</span> — Dedicated account manager and priority
                email support
              </li>
            </ul>
            <p>
              For enterprise inquiries and custom integrations, reach out to{" "}
              <a
                href="mailto:sales@westbridgetoday.com"
                className="text-foreground underline underline-offset-4 hover:opacity-80"
              >
                sales@westbridgetoday.com
              </a>
              .
            </p>
          </div>
        </section>
      </div>

      {/* Footer links */}
      <div className="mt-16 border-t border-border/60 pt-8">
        <p className="text-sm text-muted-foreground">
          <Link href={ROUTES.home} className="text-foreground transition-colors hover:opacity-80">
            Back to home
          </Link>
          {" · "}
          <Link href={ROUTES.modules} className="text-foreground transition-colors hover:opacity-80">
            Modules
          </Link>
          {" · "}
          <Link href={ROUTES.pricing} className="text-foreground transition-colors hover:opacity-80">
            Pricing
          </Link>
        </p>
      </div>
    </div>
  );
}
