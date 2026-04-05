/** @type {import('@lhci/cli').UserConfig} */
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: "npm run build && npm start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 30000,
      url: ["http://localhost:3000/", "http://localhost:3000/login", "http://localhost:3000/pricing"],
      settings: {
        preset: "desktop",
        // Skip auth-required pages
        onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
      },
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        // Performance budgets
        "categories:performance": ["error", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        // Core Web Vitals
        "first-contentful-paint": ["warn", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 3500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        // Bundle size (ERP app with charts/tables is larger than a blog)
        "total-byte-weight": ["warn", { maxNumericValue: 800000 }],
        // Skip rules that don't apply to SPAs or are third-party driven
        redirects: "off",
        "uses-http2": "off",
        "meta-viewport": "off", // web app intentionally controls zoom
        "third-party-cookies": "off", // Paddle/PostHog are required integrations
        "network-dependency-tree-insight": "off", // experimental audit
        "unused-javascript": "off", // Next.js code-splits; some unused JS is expected
        "cache-insight": "off", // CDN handles caching in production
        "legacy-javascript": "off", // Next.js transpilation target handles this
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
