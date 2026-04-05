# Performance Budget

Last updated: 2026-04-05

## Core Web Vitals Targets

| Metric                         | Target  | Threshold | Enforcement |
| ------------------------------ | ------- | --------- | ----------- |
| Largest Contentful Paint (LCP) | < 2.5s  | < 3.5s    | CI error    |
| First Contentful Paint (FCP)   | < 1.5s  | < 2.0s    | CI warning  |
| Cumulative Layout Shift (CLS)  | < 0.05  | < 0.1     | CI error    |
| Total Blocking Time (TBT)      | < 200ms | < 300ms   | CI warning  |

## Lighthouse Score Targets

| Category       | Minimum Score | Enforcement             |
| -------------- | ------------- | ----------------------- |
| Performance    | 80            | CI error — blocks merge |
| Accessibility  | 90            | CI error — blocks merge |
| Best Practices | 90            | CI error — blocks merge |
| SEO            | 90            | CI error — blocks merge |

## Bundle Size Budget

| Asset                   | Budget   | Current                       |
| ----------------------- | -------- | ----------------------------- |
| Total page weight       | < 500 KB | TBD (measure after first run) |
| JavaScript (compressed) | < 200 KB | TBD                           |
| CSS (compressed)        | < 50 KB  | TBD                           |
| Largest single chunk    | < 100 KB | TBD                           |

## How to Check Locally

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Build and audit
npm run build && lhci autorun
```

## When Budget is Exceeded

1. Check the Lighthouse CI report in the PR comment
2. Identify the regression (new dependency? unoptimized image? layout shift?)
3. Fix before merging — performance regressions compound over time
4. If the budget is genuinely too tight, update this document with justification
