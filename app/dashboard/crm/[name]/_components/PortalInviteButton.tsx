"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

/**
 * Customer Portal invite UI.
 *
 * Currently rendered as "coming soon" because the backend endpoint
 * `POST /api/portal/invite` does not exist yet. Live audit (2026-04-09)
 * caught this as a broken feature: clicking "Send Portal Link" would
 * always 404 because the route is not implemented in ERP-2/src/routes/.
 *
 * The previous implementation also had a CSRF token shape bug — it read
 * `body.data.csrfToken` but the /api/csrf endpoint returns `body.data.token`,
 * so even if the backend route existed, the request would have failed
 * with a 403 invalid CSRF.
 *
 * Re-enable when:
 *   1. Backend ships POST /api/portal/invite (issue tracker)
 *   2. The CSRF read uses `data.token` (matches /api/csrf response shape)
 *   3. The /api/portal/invite route is added to the proxy allowlist in
 *      app/api/[[...path]]/route.ts
 *   4. End-to-end smoke test against the demo account confirms the
 *      generated portal link actually opens a customer-facing page.
 */
export function PortalInviteButton(_props: { customerName: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ExternalLink className="h-4 w-4" />
          Customer Portal
        </CardTitle>
        <CardDescription>
          Coming soon — invite customers to view their invoices, quotations, and orders. Want early access?{" "}
          <a className="underline" href="mailto:sales@westbridgetoday.com">
            Email sales
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
          The Customer Portal is in development. We&apos;ll notify your account owner when it&apos;s available.
        </div>
      </CardContent>
    </Card>
  );
}
