"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Event types emitted by the SSE stream. */
export type RealtimeEventType = "notification.new" | "erp.doc_updated" | "report.ready" | string;

/** A single notification derived from a real-time event. */
export interface RealtimeNotification {
  id: string;
  type: RealtimeEventType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

/** Map SSE event types to user-friendly default titles. */
function defaultTitle(type: RealtimeEventType): string {
  switch (type) {
    case "erp.doc_updated":
      return "Document Updated";
    case "report.ready":
      return "Report Ready";
    case "notification.new":
      return "Notification";
    default:
      return "Notification";
  }
}

const MAX_NOTIFICATIONS = 100;
const STORAGE_KEY = "westbridge_notifications";
const RECONNECT_DELAY_MS = 3_000;

/** Read persisted notifications from localStorage. */
function loadStoredNotifications(): RealtimeNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return (parsed as RealtimeNotification[]).slice(0, MAX_NOTIFICATIONS);
  } catch {
    return [];
  }
}

/** Persist notifications to localStorage. */
function saveNotifications(notifications: RealtimeNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

/**
 * SSE hook that connects to the real-time event stream and returns a list of
 * notifications. Reconnects automatically on disconnect. Persists the last 100
 * notifications in localStorage so they survive page refreshes.
 */
export function useRealtimeEvents() {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(() => loadStoredNotifications());
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idCounterRef = useRef(0);

  // Persist whenever notifications change
  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const addNotification = useCallback(
    (type: RealtimeEventType, payload: Record<string, unknown>, timestamp: string) => {
      const id = `rt-${Date.now()}-${idCounterRef.current++}`;
      const title = typeof payload.title === "string" ? payload.title : defaultTitle(type);
      const message = typeof payload.message === "string" ? payload.message : "";

      const notification: RealtimeNotification = {
        id,
        type,
        title,
        message,
        timestamp,
        read: false,
      };

      setNotifications((prev) => [notification, ...prev].slice(0, MAX_NOTIFICATIONS));
    },
    [],
  );

  const connectRef = useRef<() => void>(undefined);

  useEffect(() => {
    const doConnect = () => {
      // Clean up any existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      const url = `${API_BASE}/api/events/stream`;
      const es = new EventSource(url, { withCredentials: true });
      eventSourceRef.current = es;

      const handleEvent = (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data as string) as {
            type?: string;
            payload?: Record<string, unknown>;
            timestamp?: string;
          };
          const type = data.type ?? "notification.new";
          const payload = data.payload ?? {};
          const timestamp = data.timestamp ?? new Date().toISOString();
          addNotification(type, payload, timestamp);
        } catch {
          // Ignore malformed events
        }
      };

      es.addEventListener("notification.new", handleEvent);
      es.addEventListener("erp.doc_updated", handleEvent);
      es.addEventListener("report.ready", handleEvent);
      es.onmessage = handleEvent;

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        reconnectTimerRef.current = setTimeout(() => {
          connectRef.current?.();
        }, RECONNECT_DELAY_MS);
      };
    };

    connectRef.current = doConnect;
    doConnect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, unreadCount, markAllRead, markRead, clearAll };
}
