"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface TimelineEvent {
  description: string;
  timestamp: string;
  user?: string;
}

export type { TimelineEvent };

export function DocumentTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[3px] top-1 bottom-1 w-px bg-border" />
          <div className="space-y-4">
            {events.map((event, i) => (
              <div key={i} className="relative pl-6">
                {/* Dot */}
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-foreground" />
                <p className="text-sm font-medium">{event.description}</p>
                <p className="text-xs text-muted-foreground">
                  {event.timestamp}
                  {event.user && <span> &middot; {event.user}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
