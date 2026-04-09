import Link from "next/link";
import { ROUTES } from "@/lib/config/site";
import { ShieldCheck, Lock, Eye, Server, Users, AlertTriangle } from "lucide-react";

const sectionTitle = "text-2xl font-display font-bold text-foreground mt-12 mb-3";
const sectionLead = "text-[15px] text-muted-foreground leading-relaxed mb-6";
const subTitle = "text-base font-semibold text-foreground mt-6 mb-2";
const p = "text-[15px] text-muted-foreground leading-relaxed mb-4";
const list = "text-[15px] text-muted-foreground space-y-2 list-disc pl-6 mb-6";
const strong = "text-foreground font-medium";

export function TrustContent() {
  return (
    <div className="max-w-3xl mx-auto py-16 px-6">
      {/* ─── Hero ───────────────────────────────────────────────────────────── */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
          <ShieldCheck className="h-3.5 w-3.5" />
          Last reviewed 2026-04-09
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-4">Trust & Security at Westbridge</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          We treat customer data the way our customers expect us to: defensively, transparently, and with controls that
          can be verified — not just claimed. This page is our public summary of those controls. We update it any time a
          security-relevant change ships.
        </p>
      </div>

      {/* ─── Quick facts ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
        <FactCard icon={<Lock className="h-4 w-4" />} title="Encryption">
          AES-256-GCM at rest with associated-data binding. TLS 1.2+ in transit. HSTS preload, 2-year max-age.
        </FactCard>
        <FactCard icon={<Server className="h-4 w-4" />} title="Tenant isolation">
          PostgreSQL row-level security on every tenant table, runtime-pinned via AsyncLocalStorage. Defense in depth
          with explicit application-level filtering.
        </FactCard>
        <FactCard icon={<Eye className="h-4 w-4" />} title="Audit trail">
          Hash-chained, tamper-evident audit log. Every authentication, authorization decision, and ERP write is
          recorded and exportable.
        </FactCard>
        <FactCard icon={<Users className="h-4 w-4" />} title="Authentication">
          bcrypt password hashing (cost 14), opt-in TOTP MFA with backup codes, SAML 2.0 / OIDC SSO, account lockout
          after 5 failed attempts, 7-day session expiry with idle timeout and fingerprint validation.
        </FactCard>
      </div>

      {/* ─── Sections ───────────────────────────────────────────────────────── */}
      <h2 className={sectionTitle}>Our security posture in one paragraph</h2>
      <p className={sectionLead}>
        Westbridge runs on Fly.io with PostgreSQL row-level security as the second layer of tenant isolation,
        AES-256-GCM for sensitive columns at rest, TLS 1.2+ everywhere on the wire, a hash-chained audit log, automated
        dependency and SAST scanning on every pull request, and a deploy pipeline that gates production behind a staging
        health check. We are not yet SOC 2 attested — that audit is scheduled for 2026-Q3 — but every control a Type 1
        audit will look for is already implemented and listed below.
      </p>

      <h2 className={sectionTitle}>1. Data protection</h2>
      <h3 className={subTitle}>Encryption at rest</h3>
      <p className={p}>
        Sensitive columns (passwords, TOTP secrets, ERPNext session IDs, encryption keys, payment provider API keys, SSO
        client secrets, webhook signing secrets) are encrypted with <strong className={strong}>AES-256-GCM</strong>.
        Each encrypted field is bound to a per-context associated-data string (AAD), so a ciphertext for one record
        cannot be successfully decrypted as another — even by an attacker with the encryption key. Storage volumes are
        also encrypted at the platform layer by Fly.io.
      </p>
      <h3 className={subTitle}>Encryption in transit</h3>
      <p className={p}>
        All public endpoints serve HTTPS with TLS 1.2 minimum (TLS 1.3 preferred). HSTS is enabled with a 2-year
        max-age, includeSubDomains, and preload. Internal traffic between Fly.io machines flows over Fly&apos;s
        encrypted WireGuard mesh.
      </p>
      <h3 className={subTitle}>Tenant isolation</h3>
      <p className={p}>
        Every database table that holds tenant data is governed by{" "}
        <strong className={strong}>PostgreSQL row-level security</strong> policies. The runtime application connects as
        a database role that does <strong className={strong}>not</strong> bypass these policies — if our application
        code ever forgot to filter by account, the database would default-deny the row. Application code also explicitly
        filters by account ID, giving us two independent layers that would both have to fail at the same time for one
        customer&apos;s data to leak to another.
      </p>

      <h2 className={sectionTitle}>2. Access control</h2>
      <p className={p}>
        Westbridge supports four customer-facing roles (owner, admin, member, viewer), opt-in TOTP-based two-factor
        authentication with single-use backup codes, account lockout after 5 failed login attempts, and Single Sign-On
        via SAML 2.0 and OIDC. Sessions have a 7-day absolute expiry, a 30-minute idle timeout, and a fingerprint
        (User-Agent + IP /24 hash) that&apos;s validated on every request to detect hijacking. Sessions are HttpOnly,
        SameSite-secure, and revoked automatically on password change. Every state-changing request is gated by a CSRF
        token bound to the session.
      </p>
      <p className={p}>
        <strong className={strong}>Honest note:</strong> two-factor authentication is currently opt-in for all roles.
        Org-wide enforcement for owner and admin roles is on the roadmap for 2026-Q3. Customers who want to enforce MFA
        on their own users today can do so via SSO with their identity provider&apos;s MFA policy.
      </p>
      <p className={p}>
        Internally, all Westbridge personnel access production through MFA-enforced consoles. Database access uses
        per-person SSH certificates with a 1-day TTL, issued by Fly.io. There are no shared credentials.
      </p>

      <h2 className={sectionTitle}>3. Audit logging and tamper evidence</h2>
      <p className={p}>
        Westbridge maintains a per-tenant audit log of every security-relevant event: authentication, authorization
        decisions, ERP document writes, billing changes, team membership changes, and administrative actions. Each row
        is hashed and chained to its predecessor with SHA-256, so tampering with a single row breaks the chain and is
        detectable on verification. Customer admins can export their own tenant&apos;s audit log as CSV.
      </p>

      <h2 className={sectionTitle}>4. Reliability and incident response</h2>
      <p className={p}>
        We track SLO targets of <strong className={strong}>99.5%</strong> API availability and{" "}
        <strong className={strong}>500 ms p95 latency</strong> over 30 days. The application emits structured logs to
        Sentry, which alerts on unhandled errors, error-rate spikes, latency regressions, and authentication anomalies.
        The deploy pipeline runs every change through CI (15 status checks), then staging, then a production canary,
        then the rest of production — with automated rollback on health-check failure at any step.
      </p>
      <p className={p}>
        Database backups are stored in a separate Tigris bucket with AES-256 server-side encryption. Our recovery
        objectives are <strong className={strong}>RTO 1 hour</strong> for non-database failures and{" "}
        <strong className={strong}>RTO 4 hours</strong> for a full database restore.
      </p>

      <h2 className={sectionTitle}>5. Vendor management and sub-processors</h2>
      <p className={p}>
        Westbridge uses a small, intentionally chosen set of sub-processors. Each one has a Data Processing Agreement on
        file, meets the security baseline in our Vendor Management Policy, and is reviewed quarterly. Customers receive
        30 days&apos; notice before any new sub-processor is added.
      </p>
      <p className={p}>
        Current sub-processors:{" "}
        <Link href="/trust/subprocessors" className="underline text-foreground">
          see the full sub-processor list
        </Link>
        .
      </p>

      <h2 className={sectionTitle}>6. Compliance status</h2>
      <p className={p}>
        We are committed to a transparent, dated roadmap to SOC 2 attestation rather than vague claims of &quot;SOC 2
        ready&quot;. Where we are today:
      </p>
      <ul className={list}>
        <li>
          <strong className={strong}>SOC 2 Type 1:</strong> formal audit scheduled for 2026-Q3 with a recognized CPA
          firm. Every Trust Services Criterion the Type 1 will examine is{" "}
          <strong className={strong}>already implemented</strong> and mapped to the source code that satisfies it. The
          mapping is available to prospective customers under NDA.
        </li>
        <li>
          <strong className={strong}>SOC 2 Type 2:</strong> to begin after Type 1 is issued. The 6-month observation
          window means a Type 2 report is realistic for early 2027.
        </li>
        <li>
          <strong className={strong}>Penetration test:</strong> third-party engagement scheduled for 2026-Q2.
        </li>
        <li>
          <strong className={strong}>GDPR / UK GDPR:</strong> Data Processing Agreement available at{" "}
          <Link href="/dpa" className="underline text-foreground">
            /dpa
          </Link>
          . Includes EU SCCs Module 2 and the UK IDTA addendum.
        </li>
        <li>
          <strong className={strong}>Cyber liability insurance:</strong> in process; binding scheduled for 2026-Q2.
        </li>
      </ul>

      <h2 className={sectionTitle}>7. Reporting a security issue</h2>
      <p className={p}>
        If you believe you have found a vulnerability in Westbridge, please email{" "}
        <Link href="mailto:security@westbridgetoday.com" className="underline text-foreground">
          security@westbridgetoday.com
        </Link>{" "}
        with the details. We respond to all reports within 5 business days and credit responsible disclosure on this
        page.
      </p>
      <p className={p}>
        Please do not test rate-limit-bypass, denial-of-service, or social-engineering attacks against the production
        system without prior written permission. Authorized testing windows can be arranged via the same email.
      </p>

      <h2 className={sectionTitle}>8. Key documents</h2>
      <ul className={list}>
        <li>
          <Link href="/privacy" className="underline text-foreground">
            Privacy Policy
          </Link>
        </li>
        <li>
          <Link href="/terms" className="underline text-foreground">
            Terms of Service
          </Link>
        </li>
        <li>
          <Link href="/dpa" className="underline text-foreground">
            Data Processing Agreement
          </Link>
        </li>
        <li>
          <Link href="/refund-policy" className="underline text-foreground">
            Refund Policy
          </Link>
        </li>
        <li>
          <Link href="/trust/subprocessors" className="underline text-foreground">
            Sub-processor list
          </Link>
        </li>
      </ul>

      {/* ─── Footer note ────────────────────────────────────────────────────── */}
      <div className="mt-16 rounded-lg border border-border bg-muted/20 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Honest disclosure</p>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              We do not currently hold a SOC 2 attestation. We do not currently have a third-party penetration test
              report dated within the last 12 months. We do not currently carry cyber liability insurance. All three are
              in flight with documented target dates above. If you require any of these as a precondition for a
              contract, please get in touch — we&apos;ll keep you informed of progress and share the relevant artifacts
              the moment they exist. This honest framing is itself part of how we build trust.
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-12 text-center">
        Trust page version 1.0 · Last reviewed 2026-04-09 · Reviewed by Westbridge CISO ·{" "}
        <Link href={ROUTES.privacy} className="underline">
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/terms" className="underline">
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/dpa" className="underline">
          DPA
        </Link>
      </p>
    </div>
  );
}

function FactCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-foreground" aria-hidden>
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-[13.5px] text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}
