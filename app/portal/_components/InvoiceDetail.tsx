import { Card, CardContent } from "@/components/ui/Card";
import { ShieldAlert } from "lucide-react";

interface PortalLoadingProps {
  message?: string;
}

export function PortalLoading({ message = "Verifying your access..." }: PortalLoadingProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface PortalErrorProps {
  error: string | null;
}

export function PortalError({ error }: PortalErrorProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-3">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl leading-snug font-semibold text-foreground">Access Denied</h2>
            <p className="mt-2 text-sm text-muted-foreground">{error ?? "Unable to access the portal."}</p>
          </div>
          <div className="mt-2 rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
            Please contact your vendor for a new portal link.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DocsLoadingProps {
  message?: string;
}

export function DocsLoading({ message = "Loading documents..." }: DocsLoadingProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
