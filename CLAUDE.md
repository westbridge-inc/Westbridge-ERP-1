# CLAUDE.md -- Westbridge ERP Frontend

## Overview

Next.js 16 frontend (React 19). Pure client -- no database, no business logic.
All data comes from the backend API via `lib/api/client.ts`.

## Backend URL

Set `NEXT_PUBLIC_API_URL` in `.env` (defaults to `http://localhost:4000`).

## Key Patterns

- **API client**: `lib/api/client.ts` handles CSRF double-submit, cookie auth, and JSON parsing. Never use raw `fetch()` in new code.
- **React Query hooks**: Use `useErpList` / `useErpDoc` from `lib/queries/` for data fetching. They wrap the API client with caching and revalidation.
- **Result types**: Backend returns `{ data, meta }` on success and `{ error, code }` on failure via `apiSuccess` / `apiError`. The client maps these to `Result<T, E>`.
- **Server vs client components**: Pages that need interactivity are `"use client"`. Layouts and static shells are server components. Do not add `"use client"` to a file unless it uses hooks or browser APIs.

## Component Conventions

- UI primitives come from shadcn/ui (`components/ui/`). Do not add new third-party component libraries.
- Style with Tailwind classes only -- no inline styles, no CSS modules.
- No `console.log` -- use the structured logger if you need debug output.
- No `any` types. Use generics or `unknown` with narrowing.

## Test Conventions

- **Runner**: Vitest with happy-dom environment.
- **Location**: Unit tests alongside source (`lib/foo.test.ts`), component tests in `__tests__/` directories.
- **Factories**: Use `test/factories.ts` for consistent mock data.
- **Commands**: `npm test` (single run), `vitest` (watch mode).

## What NOT To Do

- Do not add business logic or DB access -- this is a frontend-only repo.
- Do not bypass the API client with raw `fetch()`.
- Do not use `React.FC` -- use plain function components with typed props.
- Do not add `console.log` (CI will fail).
- Do not commit `.env` files or hardcoded secrets.
- Do not install new UI component libraries without team discussion.
