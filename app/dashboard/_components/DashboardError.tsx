"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function DashboardError({ message }: { message: string }) {
  const router = useRouter();
  const isAuth = message.toLowerCase().includes("session expired") || message.toLowerCase().includes("sign in");

  return (
    <Card className="mt-8">
      <CardContent className="flex flex-col items-center justify-center py-16">
        {isAuth ? (
          <>
            <p className="text-sm text-destructive">{message}</p>
            <Button variant="primary" className="mt-4" onClick={() => router.push("/login")}>
              Sign in
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">Could not load dashboard data</p>
            <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
              Your ERP backend may be starting up or temporarily unavailable. This is normal during setup.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => router.refresh()}>
              Retry
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
