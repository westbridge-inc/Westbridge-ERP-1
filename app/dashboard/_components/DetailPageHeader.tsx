"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface DetailPageHeaderProps {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: string;
  status?: string;
  actions?: ReactNode;
}

export function DetailPageHeader({ backHref, backLabel, title, subtitle, status, actions }: DetailPageHeaderProps) {
  return (
    <div>
      <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
        <Link href={backHref}>
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </Button>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-semibold text-foreground">{title}</h1>
          {status && <Badge status={status}>{status}</Badge>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
