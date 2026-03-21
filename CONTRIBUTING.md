# Contributing to Westbridge ERP

Thank you for contributing to Westbridge ERP. This guide covers the conventions, standards, and processes that keep the codebase consistent and maintainable. Please read it before submitting your first pull request.

---

## Table of Contents

- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Branch Naming](#branch-naming)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Architecture Guidelines](#architecture-guidelines)
- [Known Inconsistencies](#known-inconsistencies)
- [Getting Help](#getting-help)

---

## Development Setup

### Prerequisites

| Requirement | Version                          |
| ----------- | -------------------------------- |
| Node.js     | 22+ (20.19+ minimum)             |
| npm         | 10+                              |
| Backend API | Running at `NEXT_PUBLIC_API_URL` |

### Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_API_URL to your backend (default: http://localhost:4000)

# Start development server
npm run dev
```

Alternatively, run the setup script for a fully automated first-run experience:

```bash
./scripts/setup.sh
```

The setup script handles dependency installation, environment configuration, and starts the development server. On first run, it copies `.env.example` to `.env.local`. Fill in any values marked with `GENERATE_WITH_*` before starting the server.

### Verify Your Setup

```bash
npm run build        # Ensure the project compiles
npm test             # Ensure tests pass
npm run typecheck    # Ensure type safety
npm run lint         # Ensure linting rules pass
```

All four commands must pass before submitting a PR.

---

## Code Style

### TypeScript

- **Strict mode is enforced.** The `tsconfig.json` has `"strict": true`. No exceptions.
- **No `any` types.** Use generics, `unknown` with type narrowing, or explicit interfaces. The CI pipeline will reject `any`.
- **No `React.FC`.** Use plain function components with typed props:

```tsx
// Correct
interface InvoiceRowProps {
  invoice: Invoice;
  onSelect: (id: string) => void;
}

function InvoiceRow({ invoice, onSelect }: InvoiceRowProps) {
  return <tr onClick={() => onSelect(invoice.id)}>...</tr>;
}

// Incorrect
const InvoiceRow: React.FC<InvoiceRowProps> = ({ invoice, onSelect }) => { ... };
```

### Tailwind CSS

- **All styling uses Tailwind utility classes.** No inline `style` attributes. No CSS modules. No standalone CSS files outside `globals.css`.
- Shared design tokens (colors, spacing, typography) are defined in the Tailwind configuration. Use them consistently.
- For complex component variants, use `class-variance-authority` (CVA) as found in `components/ui/`.

### Component Conventions

- **UI primitives** come from shadcn/ui in `components/ui/`. Do not add new third-party component libraries without team discussion.
- **Data fetching** in new code must use `useErpList` or `useErpDoc` from `lib/queries/`. Do not use raw `fetch()`.
- **No `console.log`.** Use the structured logger for debug output. The CI lint step will fail on `console.log` statements.
- Prefer composition over configuration. Small, focused components that compose together are easier to test and maintain.

### Imports

- Use `@/` path aliases for all imports (e.g., `@/components/ui/button`, `@/lib/api/client`).
- Group imports in this order: React/Next.js, external libraries, internal modules, types. Separate each group with a blank line.

### Formatting

The project uses Prettier with the default configuration. Formatting is enforced via `lint-staged` on commit. Run manually with:

```bash
npx prettier --write .
```

---

## Branch Naming

Use the following prefixes with kebab-case descriptions. Keep names short (3-5 words).

| Prefix      | Purpose              | Example                         |
| ----------- | -------------------- | ------------------------------- |
| `feat/`     | New feature          | `feat/bulk-csv-import`          |
| `fix/`      | Bug fix              | `fix/invoice-pagination-offset` |
| `chore/`    | Dependencies, config | `chore/bump-next-16`            |
| `docs/`     | Documentation only   | `docs/update-deploy-guide`      |
| `security/` | Security patches     | `security/csrf-invite-endpoint` |
| `refactor/` | Code restructuring   | `refactor/extract-data-table`   |
| `test/`     | Test additions/fixes | `test/payroll-unit-tests`       |

---

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/) loosely. Subject line format:

```
<type>(<scope>): <short imperative description>
```

**Types:** `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `security`

**Scope:** The module or area touched (e.g., `auth`, `invoices`, `api-client`, `ci`, `crm`).

### Examples

```
feat(invoices): add status filter to DataTable
fix(session): debounce lastActiveAt updates to 60s
chore(deps): bump next from 15.3.0 to 16.1.7
security(csrf): add double-submit validation to invite/accept
refactor(queries): migrate expenses to useErpList
test(payroll): add salary slip calculation tests
```

### Rules

- No period at the end of the subject line.
- Use imperative mood ("add", not "added" or "adds").
- Body is optional but appreciated for non-obvious changes.
- Reference issues with `Closes #123` in the body or footer.

---

## Pull Request Process

### Before Opening a PR

Run through this checklist:

- [ ] `npm run build` passes locally with no TypeScript errors
- [ ] `npm test` passes with no failures
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] No new `console.log` statements
- [ ] New environment variables are added to `.env.example` with a descriptive comment
- [ ] If you added a route, it has at least a basic smoke test
- [ ] If you made a breaking API change, the previous version still works until clients migrate

### PR Guidelines

1. **Keep PRs focused.** One feature, one fix, or one refactor per PR. Large PRs are harder to review and more likely to introduce regressions.
2. **Write a clear description.** Explain _what_ changed and _why_. Include screenshots for UI changes.
3. **Link related issues.** Use `Closes #123` or `Relates to #456` in the PR description.
4. **Add tests for new functionality.** Features without tests will not be merged.
5. **Update documentation** if your change affects setup, configuration, or usage.

### Review Process

- All PRs require at least one approving review before merge.
- Security-related PRs require two reviewers and the `security` label.
- CI must pass (build, lint, typecheck, tests) before merge is enabled.
- Merge via squash-and-merge to keep the main branch history clean.

---

## Testing Requirements

### Unit Tests

- **Location:** Alongside source files (e.g., `lib/modules.test.ts`, `lib/constants.test.ts`).
- **Runner:** Vitest with happy-dom environment.
- **Factories:** Use `test/factories.ts` for consistent mock data across all tests.

```bash
npm test              # Single run
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### End-to-End Tests

- **Location:** `e2e/` directory.
- **Runner:** Playwright.
- **Requires:** Running application and backend.

```bash
npm run test:e2e
```

### Component Stories

- **Location:** `stories/` directory.
- **Runner:** Storybook 9.

```bash
npm run storybook         # Development
npm run build-storybook   # Build static site
```

### What to Test

- **Business logic** in `lib/` — always.
- **Data transformations** — always.
- **Component rendering** — for complex interactive components.
- **API client behavior** — for new endpoints or error handling changes.
- **E2E flows** — for critical user journeys (auth, invoice creation, payment).

---

## Architecture Guidelines

### API Client

All backend communication goes through `lib/api/client.ts`. This client handles CSRF tokens, cookie auth, and typed responses. Never bypass it with raw `fetch()`.

### React Query

Use the hooks in `lib/queries/` for all data fetching:

- `useErpList` for paginated lists with search, filter, and sort
- `useErpDoc` for individual document fetching

These hooks manage caching, background revalidation, and loading/error states automatically.

### Server vs. Client Components

- Default to **server components**. They run at build time or on the server with zero client-side JS.
- Add `"use client"` only when a component uses hooks, browser APIs, or event handlers.
- Keep client component boundaries as narrow as possible.

### Result Types

The backend returns `{ data, meta }` on success and `{ error, code }` on failure. The API client maps these to `Result<T, E>` types. Handle both cases explicitly — do not assume success.

---

## Known Inconsistencies

Some areas of the codebase predate current conventions. Do not extend these patterns into new code, but also do not refactor them in unrelated PRs:

- `app/dashboard/accounting/page.tsx` — Pre-refactor page structure. Works correctly but does not follow current component patterns.
- Several older API routes do not use the pipeline pattern. Migrate when making changes to those routes.

For the full list, see `docs/TECH-DEBT.md`.

---

## Getting Help

- **GitHub Discussions** — Open a discussion for architecture questions, feature proposals, or general questions.
- **Slack** — `#engineering` channel for real-time collaboration. Responses are typically within a few hours.
- **Documentation** — See `docs/` for architecture decision records, runbooks, and operational policies.
