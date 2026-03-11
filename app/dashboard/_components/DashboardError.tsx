"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function DashboardError({ message }: { message: string }) {
  const router = useRouter();

  return (
    <Card className="mt-8 border-destructive/50">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-destructive">{message}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.refresh()}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
