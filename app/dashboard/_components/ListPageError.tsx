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

export function ListPageError({
  title,
  subtitle,
  error,
  icon,
  createHref,
  createLabel = "+ Create New",
}: ListPageErrorProps) {
  const router = useRouter();

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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
            {icon}
          </div>
          <p className="text-sm font-medium text-foreground">Something went wrong</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={() => router.refresh()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
