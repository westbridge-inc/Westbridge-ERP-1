"use client";

import { useState, useEffect, useCallback } from "react";
import { Switch } from "@/components/ui/Switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToasts } from "@/components/ui/Toasts";
import { api, type NotificationPrefs } from "@/lib/api/client";

export function NotificationsTab() {
  const { addToast } = useToasts();

  const [prefs, setPrefs] = useState<NotificationPrefs>({
    emailInvoices: true,
    emailReports: true,
    emailSecurityAlerts: true,
    emailProductUpdates: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.settings.notifications
      .get()
      .then((data) => {
        if (!cancelled) setPrefs(data);
      })
      .catch(() => {
        // Keep defaults on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = useCallback(
    async (key: keyof NotificationPrefs, value: boolean) => {
      const previous = prefs[key];
      setPrefs((p) => ({ ...p, [key]: value }));
      try {
        await api.settings.notifications.update({ [key]: value });
        addToast("Preferences saved", "success");
      } catch {
        setPrefs((p) => ({ ...p, [key]: previous }));
        addToast("Failed to save preferences", "error");
      }
    },
    [prefs, addToast],
  );

  const items: { id: string; key: keyof NotificationPrefs; label: string; desc: string }[] = [
    {
      id: "invoices",
      key: "emailInvoices",
      label: "Invoice alerts",
      desc: "When invoices are paid or overdue",
    },
    {
      id: "reports",
      key: "emailReports",
      label: "Email reports",
      desc: "Receive updates and summaries by email",
    },
    {
      id: "security",
      key: "emailSecurityAlerts",
      label: "Security alerts",
      desc: "Login and password changes",
    },
    {
      id: "updates",
      key: "emailProductUpdates",
      label: "Product updates",
      desc: "New features and announcements",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose which notifications you want to receive. Changes are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center py-4 px-6 border-b border-border last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            {loading ? (
              <div className="h-5 w-9 animate-pulse rounded-full bg-muted" />
            ) : (
              <Switch
                id={`notif-${item.id}`}
                checked={prefs[item.key]}
                onCheckedChange={(v) => handleToggle(item.key, v)}
                aria-label={item.label}
              />
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
