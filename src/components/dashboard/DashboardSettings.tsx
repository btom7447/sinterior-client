"use client";
import { useState } from "react";
import { Bell, Moon, Shield, RefreshCw, MapPin, Flame } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const DashboardSettings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoRenew: true,
    landRegistry: true,
    landInsurance: true,
    fireAlarm: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const settingSections = [
    {
      title: "General",
      items: [
        {
          key: "notifications" as const,
          icon: Bell,
          label: "Application Notification",
          description: "Receive push notifications for updates and alerts",
        },
        {
          key: "darkMode" as const,
          icon: Moon,
          label: "Dark Mode",
          description: "Toggle between light and dark themes",
        },
        {
          key: "autoRenew" as const,
          icon: RefreshCw,
          label: "Subscription Auto-Renewal",
          description: "Automatically renew your subscription when it expires",
        },
      ],
    },
    {
      title: "Expiry Reminders",
      items: [
        {
          key: "landRegistry" as const,
          icon: MapPin,
          label: "Land Data Registry Expiry",
          description: "Get notified before your land registry data expires",
        },
        {
          key: "landInsurance" as const,
          icon: Shield,
          label: "Land Insurance Expiry",
          description: "Receive alerts when your land insurance is about to expire",
        },
        {
          key: "fireAlarm" as const,
          icon: Flame,
          label: "Fire Alarm Safety Service Expiry",
          description: "Get reminders for fire alarm safety service renewals",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your notifications, preferences and security settings.
        </p>
      </div>

      {settingSections.map((section) => (
        <div key={section.title} className="card-elevated p-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">{section.title}</h2>
          <div className="space-y-1">
            {section.items.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-4 border-b border-border/50 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-4 h-4 text-primary" strokeWidth={1} />
                  </div>
                  <div>
                    <Label className="text-foreground font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                  </div>
                </div>
                <Switch
                  checked={settings[item.key]}
                  onCheckedChange={() => toggle(item.key)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardSettings;
