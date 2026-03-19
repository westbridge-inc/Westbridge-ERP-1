# Storybook — Known Issues

## Next.js 16 + SWC Incompatibility

**Status:** Storybook build fails with SWC compilation errors.

**Root cause:** `@storybook/nextjs` v9.x internally depends on Next.js SWC transforms
that are incompatible with Next.js 16. The framework adapter has not yet been updated
to support the breaking changes in Next.js 16.1.x.

**Impact:** `npx storybook build` fails. The CI job `storybook` in
`.github/workflows/ci.yml` has `continue-on-error: true` to prevent pipeline
blockage.

**Why we did not switch frameworks:**
- `@storybook/react-vite` is not installed and would require adding a new
  dependency (plus Vite itself as a peer).
- `@storybook/react-webpack5` is not installed either.
- Adding new packages was scoped out of the current sprint. The Storybook
  framework adapter must be officially updated to support Next.js 16.

**Workaround (local development):**
Run `npx storybook dev -p 6006` — the dev server may still work for some
components that do not rely on Next.js-specific SWC transforms (e.g. pure
Radix UI wrappers).

**Resolution path:**
1. Monitor the `@storybook/nextjs` changelog for Next.js 16 support.
2. Once a compatible version is released, upgrade:
   ```bash
   npm install @storybook/nextjs@latest @storybook/react@latest storybook@latest
   ```
3. Verify: `npx storybook build`
4. Remove `continue-on-error: true` from `.github/workflows/ci.yml` storybook job.
