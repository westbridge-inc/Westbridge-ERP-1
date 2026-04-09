import Link from "next/link";

const PROCESSORS = [
  {
    name: "Fly.io",
    purpose: "Application hosting + PostgreSQL + WireGuard internal mesh",
    data: "All customer data at the storage and compute layer",
    region: "United States (iad), with secondary in Miami (mia) for Caribbean traffic",
    dpa: "Fly.io DSA",
    notes: "Hosts westbridge-api, westbridge-frontend, westbridge-db, westbridge-api-staging.",
  },
  {
    name: "Tigris Data",
    purpose: "PostgreSQL backup storage",
    data: "Encrypted database backups (AES-256 SSE)",
    region: "United States",
    dpa: "Tigris DPA",
    notes: "S3-compatible. Backup retention 7 days.",
  },
  {
    name: "Upstash",
    purpose: "Redis cache + BullMQ background queue",
    data: "Hashed session tokens, queue payloads, rate-limit counters",
    region: "United States",
    dpa: "Upstash DPA",
    notes: "TLS in transit. fly-westbridge-redis.upstash.io.",
  },
  {
    name: "Frappe Cloud (ERPNext)",
    purpose: "Business-layer ERP — invoices, expenses, projects, etc.",
    data: "Customer ERP documents within a per-tenant company namespace",
    region: "India / multi-region",
    dpa: "Frappe DPA",
    notes: "Each Westbridge tenant gets a dedicated ERPNext company.",
  },
  {
    name: "Resend",
    purpose: "Transactional email delivery",
    data: "Recipient address + email body (account activation, password reset, invite, payment receipt)",
    region: "United States, EU",
    dpa: "Resend DPA",
    notes: "Westbridge runs in dev-mode (skip + log) on staging to prevent test emails reaching real users.",
  },
  {
    name: "Paddle",
    purpose: "Payments — Merchant of Record",
    data: "Customer email, billing address, payment metadata. Westbridge does NOT see card data.",
    region: "UK, EU, US",
    dpa: "Paddle DPA",
    notes: "MoR model — Paddle handles tax, compliance, and chargebacks.",
  },
  {
    name: "Anthropic",
    purpose: "AI inference for the Cortex assistant",
    data: "Conversation context (the messages a user types into the AI chat)",
    region: "United States",
    dpa: "Anthropic Commercial Terms + DPA",
    notes: "Used by /api/cortex/chat and /api/ai/chat. We respect Anthropic's data retention defaults.",
  },
  {
    name: "Sentry",
    purpose: "Error tracking and performance monitoring",
    data: "Stack traces and request metadata (paths and headers redacted)",
    region: "United States, EU",
    dpa: "Sentry DPA",
    notes: "Cookies dropped before send; sensitive headers and absolute filesystem paths redacted.",
  },
  {
    name: "PostHog",
    purpose: "Product analytics",
    data: "Event names, anonymized user IDs, page views",
    region: "United States, EU",
    dpa: "PostHog DPA",
    notes: "PII is not sent — only anonymized identifiers.",
  },
  {
    name: "GitHub",
    purpose: "Source code hosting and CI/CD",
    data: "Source code (no customer data is stored in source code)",
    region: "United States",
    dpa: "GitHub Enterprise DPA",
    notes: "Branch protection enforced. Org-level MFA required.",
  },
];

export function SubprocessorsContent() {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <div className="mb-2">
        <Link href="/trust" className="text-sm text-muted-foreground underline hover:text-foreground">
          ← Back to Trust & Security
        </Link>
      </div>
      <h1 className="text-3xl font-display font-bold text-foreground mb-2 mt-4">Sub-processor list</h1>
      <p className="text-sm text-muted-foreground mb-2">Last updated 2026-04-09</p>
      <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
        This is the complete list of third parties that process Westbridge customer data on our behalf, as required by
        Article 28 of the GDPR and our Data Processing Agreement. We give customers 30 days&apos; notice before adding a
        new sub-processor.
      </p>

      <div className="space-y-6">
        {PROCESSORS.map((p) => (
          <div key={p.name} className="rounded-lg border border-border bg-background p-6">
            <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
              <h2 className="text-xl font-semibold text-foreground">{p.name}</h2>
              <span className="text-xs text-muted-foreground">DPA: {p.dpa}</span>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-[120px,1fr] gap-x-4 gap-y-2 text-[14px]">
              <dt className="text-muted-foreground">Purpose</dt>
              <dd className="text-foreground">{p.purpose}</dd>
              <dt className="text-muted-foreground">Data</dt>
              <dd className="text-foreground">{p.data}</dd>
              <dt className="text-muted-foreground">Region</dt>
              <dd className="text-foreground">{p.region}</dd>
              <dt className="text-muted-foreground">Notes</dt>
              <dd className="text-muted-foreground">{p.notes}</dd>
            </dl>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-border bg-muted/20 p-6">
        <h2 className="text-base font-semibold text-foreground mb-2">Notification of changes</h2>
        <p className="text-[14px] text-muted-foreground leading-relaxed">
          When we add a sub-processor or change an existing one&apos;s role, we will: (a) update this page, (b) email
          the primary contact on every active customer account, and (c) provide a 30-day objection window during which a
          customer can request termination of their contract for cause.
        </p>
      </div>

      <p className="text-xs text-muted-foreground mt-8 text-center">
        Questions about a sub-processor?{" "}
        <Link href="mailto:security@westbridgetoday.com" className="underline">
          security@westbridgetoday.com
        </Link>
      </p>
    </div>
  );
}
