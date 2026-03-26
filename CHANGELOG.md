# Changelog

All notable changes to Westbridge ERP are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-03-20

### Added

- **38 ERP modules** across 7 bundles: Finance & Accounting, Sales & CRM, Inventory & Supply Chain, HR & Payroll, Manufacturing, Project Management, Business Tools
- **Bridge AI assistant** with 12 data tools — financial summaries, cash flow forecasts, anomaly detection, natural language queries across all modules
- **Customer self-service portal** — customers can view invoices, accept quotations, and track order status
- **Mobile PWA** with bottom navigation, responsive data tables, and touch-optimized interactions
- **Bulk CSV import** for all major document types
- **Server-side search** with debounced queries and paginated results
- **Column visibility controls** on all data tables
- **Module hide/unhide** from the sidebar for workspace customization
- **PDF invoice download** with branded templates
- **Onboarding wizard** for first-run account setup and module selection
- **Dark/light theme** toggle with system preference detection
- **Real-time notifications** via Server-Sent Events with exponential backoff reconnection

### Security

- CSRF double-submit protection on all state-mutating endpoints
- TOTP-based two-factor authentication (2FA)
- Session fingerprinting with partial IP matching for shared-NAT environments
- Rate limiting on all API endpoints with tiered limits by plan
- Plan-based module access enforcement — modules outside the active plan are inaccessible
- Nonce-based Content Security Policy (CSP) via middleware
- HSTS, Referrer-Policy, and Permissions-Policy security headers
- AES-256-GCM encryption for sensitive session data at rest
- Timing-safe comparison for all signature validation
- Cryptographically secure token generation (`crypto.getRandomValues`)

### Infrastructure

- Sentry integration for error tracking and performance monitoring
- PostHog integration for product analytics
- Structured logging with pino (JSON in production, pretty-print in development)
- OpenTelemetry tracing with auto-instrumentation for HTTP, database, and cache layers
- Prometheus metrics endpoint with SLO tracking and error budget monitoring
- Feature flags system with Redis-backed deterministic percentage rollouts
- Health check endpoints (`/api/health/ready`, `/api/health/live`) for container orchestration
- Multi-stage Docker build producing standalone image (~150 MB)
- Vercel, Docker, and Fly.io deployment support

---

## [0.9.0] — 2026-02-14

### Added

- Real-time SSE stream (`/api/events/stream`) for live invoice and notification updates
- In-app notification service (Redis-backed, 30-day TTL per account)
- `useRealtimeEvents` hook for dashboard components
- Server-Sent Events reconnection with exponential backoff on client

### Changed

- `/api/health` now returns `degraded` status when non-critical checks fail, instead of `unhealthy`
- Improved pino log redaction — `authorization` header and nested `*.password` paths now redacted

### Fixed

- Session fingerprint collision on shared-NAT offices (use first 3 IP octets, not full IP)
- `validateSession` hot-path debounce was updating `lastActiveAt` on every request — now 60s minimum

---

## [0.8.0] — 2026-01-20

### Added

- OpenTelemetry tracing with auto-instrumentation for HTTP, Prisma, and Redis
- Prometheus metrics endpoint at `/api/metrics` (protected by `METRICS_TOKEN`)
- `/api/health/ready` and `/api/health/live` for Kubernetes probes
- SLO definitions and error budget tracking
- Feature flags system — Redis-backed, deterministic percentage rollouts, admin API at `/api/admin/flags`
- A/B experimentation infrastructure with Chi-squared significance testing

### Changed

- pino replaces custom console wrapper — structured JSON in production, pretty-print in development
- Prometheus `westbridge_http_request_duration_ms` now uses buckets optimized for p99 distribution

### Fixed

- Rate limiter pipeline race: INCR and PEXPIRE now in a single Redis pipeline

---

## [0.7.2] — 2026-01-08

### Security

- HTML injection in email templates — added `esc()` escaping to all user-supplied values
- CSRF validation added to `/api/invite/accept`, `/api/auth/reset-password`, `/api/auth/forgot-password`
- Rate limiting on `GET /api/invite` token-validation endpoint (20 req/min)
- API key generation now uses `crypto.getRandomValues()` — replaced `Math.random()` which is not cryptographically secure

### Fixed

- ERPNext password-update calls now send correct `Authorization: token key:secret` header
- Added `ERPNEXT_API_KEY` and `ERPNEXT_API_SECRET` to `.env.example`

---

## [0.7.1] — 2025-12-19

### Security

- Removed deprecated payment integration module with plaintext credential exposure
- Middleware replaced with proper session validation via `/api/auth/validate`
- Auto-user-creation gated to first user only — all subsequent users must be invited

---

## [0.7.0] — 2025-12-10

### Added

- Password reset flow: forgot-password page, reset-password page, and supporting API endpoints
- Invite flow: invite page, invitation API with token validation, and acceptance endpoint
- Transactional email via Resend — invite, password-reset, and account-activated templates
- Multi-tenancy enforcement: all backend queries scoped by account

### Changed

- Database migrations now use `prisma migrate deploy` consistently across all environments
- `ENCRYPTION_KEY` requires a 64-character hex string; removed derived key approach

### Fixed

- Payment signature comparison now uses `timingSafeEqual` — timing oracle closed
- Session credentials encrypted at rest (AES-256-GCM)

---

## [0.6.1] — 2025-11-27

### Fixed

- TypeScript configuration — resolved ambient type pollution that blocked CI
- Docker Compose ports bound to `127.0.0.1` to prevent accidental external exposure

---

## [0.6.0] — 2025-11-14

### Added

- CSRF double-submit protection on all state-mutating endpoints
- Nonce-based strict CSP, HSTS, Referrer-Policy, and Permissions-Policy headers
- Transactional account creation with Prisma `$transaction` to prevent race conditions
- Account-activated email on payment confirmation

### Changed

- Default currency set to USD throughout — all regional currency references removed
- Removed API proxy rewrites that were forwarding unauthenticated requests

---

## [0.5.0] — 2025-10-30

### Added

- shadcn/ui design system applied throughout dashboard
- Settings page: Profile, Notifications, Billing, Security, Appearance, Team tabs
- `DataTable` component with client-side sort, pagination, and empty states
- `PageHeader`, `EmptyState`, `SkeletonTable` reusable components
- Dark/light theme toggle

### Changed

- All inline style props converted to Tailwind utility classes
- Raw HTML elements replaced with shadcn/ui equivalents

---

## [0.4.0] — 2025-10-03

### Added

- Invoices page with status filters, search, and DataTable
- Expenses page with category badges and running totals
- Analytics page with summary cards
- ERP list/doc API routes with doctype allowlist and `order_by` sanitization

### Changed

- Dashboard home page redesigned with metric cards, Recent Activity, and Quick Actions

---

## [0.3.0] — 2025-09-12

### Added

- Signup flow with plan selection and password policy validation
- Login page with forgot-password link
- Session management — 7-day expiry, 30-minute idle timeout, max 5 concurrent sessions
- Password strength scoring with zxcvbn-style analysis

---

## [0.2.0] — 2025-08-21

### Added

- Backend integration layer — typed API client and service layer
- Marketing site: homepage, pricing page (USD plans), modules page
- Payment webhook handler
- Docker Compose setup for local development

---

## [0.1.0] — 2025-07-28

### Added

- Project scaffold: Next.js App Router, Prisma + PostgreSQL, Tailwind CSS
- Basic authentication: login endpoint, session cookie, middleware
- Environment configuration (`.env.example`) and Docker Compose
- CI pipeline skeleton (GitHub Actions)
