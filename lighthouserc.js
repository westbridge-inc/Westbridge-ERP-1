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
        // Bundle size
        "total-byte-weight": ["warn", { maxNumericValue: 500000 }],
        // Skip rules that don't apply to SPAs
        redirects: "off",
        "uses-http2": "off",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
