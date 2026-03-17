"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ReactNode } from "react";

interface ListPageErrorProps {
  title: string;
  subtitle: string;
  error: string;
  icon: ReactNode;
  createHref?: string;
  createLabel?: string;
}

/**
 * Check if an error message indicates a session/auth issue (not a data issue).
 * Auth errors should prompt the user to sign in again.
 */
function isAuthError(error: string): boolean {
  const lower = error.toLowerCase();
  return (
    lower.includes("session expired") ||
    lower.includes("sign in") ||
    lower.includes("log in") ||
    lower.includes("unauthorized") ||
    lower.includes("access denied") ||
    lower.includes("http 401") ||
    lower.includes("http 403")
  );
}

export function ListPageError({
  title,
  subtitle,
  error,
  icon,
  createHref,
  createLabel = "+ Create New",
}: ListPageErrorProps) {
  const router = useRouter();
  const authIssue = isAuthError(error);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {createHref && (
          <Button variant="primary" onClick={() => router.push(createHref)}>
            {createLabel}
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          {authIssue ? (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                {icon}
              </div>
              <p className="text-sm font-medium text-foreground">Session expired</p>
              <p className="mt-1 text-sm text-muted-foreground">Please sign in again to continue.</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={() => router.push("/login")}>
                Sign in
              </Button>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
                {icon}
              </div>
              <p className="text-sm font-medium text-foreground">Could not load data right now</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                This may be because your ERP backend is starting up or there are no records yet. You can retry or create
                your first record.
              </p>
              <div className="mt-4 flex gap-3">
                <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                  Retry
                </Button>
                {createHref && (
                  <Button variant="primary" size="sm" onClick={() => router.push(createHref)}>
                    {createLabel}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
