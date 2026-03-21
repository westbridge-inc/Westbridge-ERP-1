import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["**/node_modules/**", "**/e2e/**", "**/.next/**"],
    environmentMatchGlobs: [["**/*.test.tsx", "happy-dom"]] as [string, string][],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "node_modules/",
        "westbridge/",
        ".next/",
        "e2e/",
        "**/*.config.*",
        "**/prisma/generated/**",
        "lib/generated/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/types/**/*.d.ts",
        // shadcn/ui component wrappers — thin Radix primitives, not business logic
        "components/ui/**",
      ],
      thresholds: {
        // Coverage measured against lib/, types/, and components/ (UI excluded).
        // Dashboard page components are tested via E2E (Playwright), not unit coverage.
        statements: 65,
        branches: 50,
        functions: 55,
        lines: 65,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
