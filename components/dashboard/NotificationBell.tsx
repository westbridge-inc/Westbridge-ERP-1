"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Bell, FileText, BarChart3, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRealtimeEvents, type RealtimeNotification } from "@/lib/hooks/useRealtimeEvents";

/** Format a timestamp as a relative time string (e.g. "2m ago"). */
function relativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return "";

  const diffMs = now - then;
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/** Pick an icon component based on the event type. */
function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "erp.doc_updated":
      return <FileText className="size-4 text-muted-foreground" />;
    case "report.ready":
      return <BarChart3 className="size-4 text-muted-foreground" />;
    default:
      return <Bell className="size-4 text-muted-foreground" />;
  }
}

const MAX_DISPLAY = 20;

export function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead, clearAll } = useRealtimeEvents();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, handleClickOutside]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const displayed = notifications.slice(0, MAX_DISPLAY);

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-border bg-card shadow-md sm:w-96"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-xs text-muted-foreground">
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs text-muted-foreground">
                  Clear
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="size-7"
                aria-label="Close notifications"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="size-8 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">No notifications</p>
              </div>
            ) : (
              <ul className="divide-y">
                {displayed.map((n: RealtimeNotification) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent ${
                        !n.read ? "bg-accent/40" : ""
                      }`}
                    >
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        <NotificationIcon type={n.type} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        {n.message && <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>}
                        <p className="mt-1 text-xs text-muted-foreground">{relativeTime(n.timestamp)}</p>
                      </div>
                      {!n.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
