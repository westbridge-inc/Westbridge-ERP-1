"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FileText, Upload, Download } from "lucide-react";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";

interface InvoiceEmptyStateProps {
  title: string;
  subtitle: string;
  onCreateNew: () => void;
}

export function InvoiceEmptyState({ title, subtitle, onCreateNew }: InvoiceEmptyStateProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl leading-tight tracking-tight font-display font-semibold text-foreground text-balance">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Button variant="primary" onClick={onCreateNew}>
          + Create New
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title={MODULE_EMPTY_STATES.invoices.title}
            description={MODULE_EMPTY_STATES.invoices.description}
            actionLabel={MODULE_EMPTY_STATES.invoices.actionLabel}
            actionHref={MODULE_EMPTY_STATES.invoices.actionLink}
            supportLine={EMPTY_STATE_SUPPORT_LINE}
          />
        </CardContent>
      </Card>
    </div>
  );
}

interface InvoiceHeaderProps {
  title: string;
  subtitle: string;
  onCreateNew: () => void;
  onImport: () => void;
  onExport: () => void;
}

export function InvoiceHeader({ title, subtitle, onCreateNew, onImport, onExport }: InvoiceHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onImport}>
          <Upload className="h-4 w-4 mr-1" />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-1" />
          Export CSV
        </Button>
        <Button variant="primary" onClick={onCreateNew}>
          + Create New
        </Button>
      </div>
    </div>
  );
}
