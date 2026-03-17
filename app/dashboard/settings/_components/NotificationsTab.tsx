"use client";

import { useState, useCallback } from "react";
import { Switch } from "@/components/ui/Switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useToasts } from "@/components/ui/Toasts";

export function NotificationsTab() {
  const { addToast } = useToasts();

  const [emailNotif, setEmailNotif] = useState(true);
  const [invoiceReminders, setInvoiceReminders] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const handleNotifToggle = useCallback(
    (setter: (v: boolean) => void, value: boolean) => {
      setter(value);
      addToast("Preferences saved", "success");
    },
    [addToast],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose which notifications you want to receive. Changes are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {[
          {
            id: "email",
            label: "Email notifications",
            desc: "Receive updates and summaries by email",
            value: emailNotif,
            set: setEmailNotif,
          },
          {
            id: "invoice",
            label: "Invoice alerts",
            desc: "When invoices are paid or overdue",
            value: invoiceReminders,
            set: setInvoiceReminders,
          },
          {
            id: "security",
            label: "Security alerts",
            desc: "Login and password changes",
            value: securityAlerts,
            set: setSecurityAlerts,
          },
        ].map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center py-4 px-6 border-b border-border last:border-0"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch
              id={`notif-${item.id}`}
              checked={item.value}
              onCheckedChange={(v) => handleNotifToggle(item.set, v)}
              aria-label={item.label}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
