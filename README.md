<div align="center">
  <h1>Westbridge ERP</h1>
  <p><strong>Enterprise Resource Planning — Modern, Fast, Intelligent</strong></p>

  <p>
    <a href="https://github.com/westbridgeinc/Westbridge-ERP-1/actions/workflows/ci.yml"><img src="https://github.com/westbridgeinc/Westbridge-ERP-1/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
    <a href="https://github.com/westbridgeinc/Westbridge-ERP-1/actions/workflows/security.yml"><img src="https://github.com/westbridgeinc/Westbridge-ERP-1/actions/workflows/security.yml/badge.svg" alt="Security"></a>
    <img src="https://img.shields.io/badge/next.js-16-black" alt="Next.js 16">
    <img src="https://img.shields.io/badge/react-19-blue" alt="React 19">
    <img src="https://img.shields.io/badge/license-proprietary-red" alt="License">
  </p>

  <p>
    <a href="#features">Features</a> &middot;
    <a href="#getting-started">Getting Started</a> &middot;
    <a href="#architecture">Architecture</a> &middot;
    <a href="#project-structure">Project Structure</a> &middot;
    <a href="#deployment">Deployment</a> &middot;
    <a href="#api-reference">API Reference</a>
  </p>
</div>

---

## Overview

Westbridge ERP is a full-featured business management platform that unifies accounting, CRM, inventory, HR, manufacturing, and project management into a single application. Built with Next.js 16 and React 19, it delivers a fast, responsive experience across desktop and mobile.

This repository contains the **frontend** application. It is a pure client that communicates with the [Westbridge Backend API](https://github.com/westbridgeinc/Westbridge-ERP-2) for all data, authentication, and business logic.

## Features

### 38 Modules Across 7 Bundles

| Bundle                       | Modules                                                                                             | Highlights                                            |
| ---------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Finance & Accounting**     | General Ledger, AP/AR, Fixed Assets, Bank Reconciliation, Budgeting, Multi-Currency, Tax, Reporting | Double-entry accounting with automated reconciliation |
| **Sales & CRM**              | Leads, Opportunities, Quotations, Sales Orders, Customer Portal, Territories                        | Full pipeline from lead to close                      |
| **Inventory & Supply Chain** | Stock, Warehouses, Purchase Orders, Suppliers, BOM, Quality, Batch & Serial Tracking                | Multi-warehouse with real-time valuation              |
| **HR & Payroll**             | Employees, Attendance & Leave, Payroll, Expense Claims, Recruitment, Training, Performance          | End-to-end workforce management                       |
| **Manufacturing**            | Production Planning, Work Orders, Routing, Subcontracting, Capacity Planning                        | MRP-driven manufacturing execution                    |
| **Project Management**       | Projects, Tasks, Timesheets, Gantt Charts                                                           | Resource planning with billable-hour tracking         |
| **Business Tools**           | Website Builder, E-Commerce, Point of Sale, Custom Reports                                          | Online storefront, POS, and analytics                 |

### Platform Capabilities

- **Bridge AI** — Intelligent assistant with real-time access to your business data. Financial summaries, cash flow forecasts, anomaly detection, and natural language queries across all modules.
- **Customer Portal** — Self-service portal for customers to view invoices, accept quotations, and track orders.
- **Team Management** — Role-based access control with plan-enforced user limits and granular module permissions.
- **Mobile-Ready** — Progressive Web App with responsive layouts, bottom navigation, and touch-optimized interactions.
- **Enterprise Security** — CSRF double-submit protection, TOTP-based 2FA, session fingerprinting, nonce-based CSP, and rate limiting on all endpoints.
- **Observability** — Sentry error tracking, PostHog product analytics, and structured logging.

## Tech Stack

| Layer         | Technology                                         |
| ------------- | -------------------------------------------------- |
| Framework     | Next.js 16 (App Router, standalone output)         |
| UI            | React 19, Tailwind CSS 4, shadcn/ui, Radix UI      |
| State         | TanStack React Query v5, React Context             |
| Charts        | Recharts 3                                         |
| Auth          | Cookie-based sessions with CSRF double-submit      |
| Forms         | Zod 4 schema validation                            |
| Testing       | Vitest 4, Testing Library, Playwright, Storybook 9 |
| Observability | Sentry, PostHog                                    |
| Deployment    | Vercel (recommended), Docker, Fly.io               |

## Getting Started

### Prerequisites

- **Node.js** 22+ (20.19+ minimum)
- **Running backend API** — see [Westbridge-ERP-2](https://github.com/westbridgeinc/Westbridge-ERP-2) for setup

### Installation

```bash
# Clone the repository
git clone https://github.com/westbridgeinc/Westbridge-ERP-1.git
cd Westbridge-ERP-1

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend (default: http://localhost:4000)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### Environment Variables

| Variable                   | Required | Description                          |
| -------------------------- | -------- | ------------------------------------ |
| `NEXT_PUBLIC_API_URL`      | Yes      | Backend API URL for browser requests |
| `BACKEND_URL`              | Yes      | Backend URL for server-side requests |
| `NEXT_PUBLIC_SENTRY_DSN`   | No       | Sentry error tracking DSN            |
| `NEXT_PUBLIC_POSTHOG_KEY`  | No       | PostHog analytics project key        |
| `NEXT_PUBLIC_POSTHOG_HOST` | No       | PostHog host URL                     |

## Architecture

### Rendering Strategy

Westbridge ERP uses the Next.js App Router with a deliberate split between server and client components:

- **Server components** handle layouts, static shells, and initial page structure. They run at build time or on the server with zero client-side JavaScript overhead.
- **Client components** (`"use client"`) are used for interactive elements: forms, data tables, charts, and anything requiring hooks or browser APIs.
- **No SSR data fetching** for business data. All ERP data flows through the typed API client on the client side, keeping the frontend stateless and the backend as the single source of truth.

### API Client

All communication with the backend goes through `lib/api/client.ts`. This client handles:

- CSRF double-submit token management
- Cookie-based authentication forwarding
- Typed JSON response parsing with `Result<T, E>` types
- Automatic error mapping

Direct `fetch()` calls are not permitted in new code.

### Data Fetching

React Query hooks in `lib/queries/` provide caching, background revalidation, and optimistic updates:

- `useErpList` — Paginated list queries with server-side search and filtering
- `useErpDoc` — Single document fetching with cache management

### Route Groups

```
app/(auth)/        Login, signup, forgot-password, invite acceptance
app/(marketing)/   Public pages: homepage, pricing, modules, about
app/dashboard/     Authenticated ERP modules (18 sections)
app/portal/        Customer self-service portal
app/api/           API routes (health, events)
```

## Project Structure

```
.
├── app/                          # Next.js App Router pages and layouts
│   ├── (auth)/                   # Authentication pages
│   ├── (marketing)/              # Public marketing pages
│   ├── dashboard/                # ERP module pages
│   │   ├── accounting/           # General ledger, chart of accounts
│   │   ├── admin/                # Admin panel
│   │   ├── analytics/            # Dashboards and reporting
│   │   ├── crm/                  # Leads, opportunities, pipeline
│   │   ├── expenses/             # Expense tracking and claims
│   │   ├── hr/                   # Employee management
│   │   ├── inventory/            # Stock, warehouses, items
│   │   ├── invoices/             # Sales invoices
│   │   ├── manufacturing/        # Work orders, production
│   │   ├── onboarding/           # First-run setup wizard
│   │   ├── payroll/              # Salary processing
│   │   ├── procurement/          # Purchase orders, suppliers
│   │   ├── projects/             # Project and task management
│   │   ├── quotations/           # Quote builder
│   │   └── settings/             # Account and app settings
│   └── portal/                   # Customer portal
├── components/                   # React components
│   ├── ai/                       # Bridge AI assistant components
│   ├── analytics/                # Analytics and chart components
│   ├── dashboard/                # Dashboard-specific components
│   ├── marketing/                # Marketing page components
│   └── ui/                       # shadcn/ui primitives
├── lib/                          # Core libraries
│   ├── api/                      # Typed API client
│   ├── hooks/                    # Custom React hooks
│   ├── queries/                  # React Query hooks
│   ├── i18n/                     # Internationalization
│   ├── config/                   # App configuration
│   └── utils/                    # Utility functions
├── types/                        # TypeScript types and Zod schemas
├── e2e/                          # Playwright end-to-end tests
├── stories/                      # Storybook component stories
├── test/                         # Test utilities and factories
├── docs/                         # Architecture decisions, runbooks, policies
├── infra/                        # Infrastructure configuration
├── scripts/                      # Build and setup scripts
└── public/                       # Static assets
```

## Testing

```bash
# Unit tests
npm test

# Unit tests in watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# End-to-end tests (requires running app + backend)
npm run test:e2e

# Component stories
npm run storybook

# Type checking
npm run typecheck

# Linting
npm run lint
```

Tests use Vitest with happy-dom for unit/component testing, and Playwright for end-to-end browser testing. Test factories in `test/factories.ts` provide consistent mock data across all test suites.

## Deployment

Westbridge ERP supports multiple deployment targets. See [DEPLOY.md](DEPLOY.md) for detailed instructions.

### Vercel (Recommended)

Connect the repository to Vercel. It auto-detects Next.js and handles builds, CDN distribution, and SSL with zero configuration.

### Docker

```bash
docker build -t westbridge-frontend .
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.westbridge.gy \
  -e BACKEND_URL=https://api.westbridge.gy \
  westbridge-frontend
```

The multi-stage Dockerfile produces a standalone image (~150 MB) using Next.js standalone output mode.

### Fly.io

See `DEPLOY.md` for Fly.io deployment scripts and configuration.

## API Reference

This frontend communicates exclusively with the Westbridge Backend API. For API documentation, endpoint schemas, and authentication details, see the [Westbridge-ERP-2](https://github.com/westbridgeinc/Westbridge-ERP-2) repository.

## Related Documentation

| Document                                                     | Description                                     |
| ------------------------------------------------------------ | ----------------------------------------------- |
| [DEPLOY.md](DEPLOY.md)                                       | Deployment guide for Vercel, Docker, and Fly.io |
| [CONTRIBUTING.md](CONTRIBUTING.md)                           | Development setup, code style, and PR process   |
| [CHANGELOG.md](CHANGELOG.md)                                 | Version history and release notes               |
| [SECURITY.md](SECURITY.md)                                   | Security policy and vulnerability reporting     |
| [SETUP.md](SETUP.md)                                         | Detailed local development setup                |
| [docs/PRODUCTION-READINESS.md](docs/PRODUCTION-READINESS.md) | Production deployment checklist                 |

## License

Proprietary -- source available for reference only. See [LICENSE](LICENSE) for terms.

Copyright (c) 2025-present Westbridge Inc. All rights reserved.
