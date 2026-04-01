"use client";
import { useState, useEffect } from "react";
import { Bell, Moon, Shield, RefreshCw, MapPin, Flame, Eye, EyeOff, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { toast } from "sonner";

interface Settings {
  notifications: boolean;
  darkMode: boolean;
  autoRenew: boolean;
  landRegistry: boolean;
  landInsurance: boolean;
  fireAlarm: boolean;
}

const defaults: Settings = {
  notifications: true,
  darkMode: false,
  autoRenew: true,
  landRegistry: true,
  landInsurance: true,
  fireAlarm: false,
};

const DashboardSettings = () => {
  const { changePassword } = useAuth();

  const [settings, setSettings] = useState<Settings>(defaults);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, next: false });
  const [savingPw, setSavingPw] = useState(false);

  // Load settings from API on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ data: { settings: Settings } }>("/profiles/me/settings");
        if (res.data.settings) setSettings({ ...defaults, ...res.data.settings });
      } catch {
        // use defaults
      } finally {
        setLoadingSettings(false);
      }
    })();
  }, []);

  const toggle = async (key: keyof Settings) => {
    const newValue = !settings[key];
    setSettings((prev) => ({ ...prev, [key]: newValue }));
    try {
      await apiPatch("/profiles/me/settings", { [key]: newValue });
    } catch {
      // revert on failure
      setSettings((prev) => ({ ...prev, [key]: !newValue }));
      toast.error("Failed to save setting");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (pwForm.next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(pwForm.current, pwForm.next);
      toast.success("Password changed successfully");
      setPwForm({ current: "", next: "", confirm: "" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setSavingPw(false);
    }
  };

  const settingSections = [
    {
      title: "General",
      items: [
        { key: "notifications" as const, icon: Bell, label: "Application Notification", description: "Receive push notifications for updates and alerts" },
        { key: "darkMode" as const, icon: Moon, label: "Dark Mode", description: "Toggle between light and dark themes" },
        { key: "autoRenew" as const, icon: RefreshCw, label: "Subscription Auto-Renewal", description: "Automatically renew your subscription when it expires" },
      ],
    },
    {
      title: "Expiry Reminders",
      items: [
        { key: "landRegistry" as const, icon: MapPin, label: "Land Data Registry Expiry", description: "Get notified before your land registry data expires" },
        { key: "landInsurance" as const, icon: Shield, label: "Land Insurance Expiry", description: "Receive alerts when your land insurance is about to expire" },
        { key: "fireAlarm" as const, icon: Flame, label: "Fire Alarm Safety Service Expiry", description: "Get reminders for fire alarm safety service renewals" },
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

      {loadingSettings ? (
        <div className="card-elevated p-6 animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg" />
          ))}
        </div>
      ) : settingSections.map((section) => (
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
                <Switch checked={settings[item.key]} onCheckedChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Security — Change Password */}
      <div className="card-elevated p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lock className="w-4 h-4 text-primary" strokeWidth={1} />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground leading-tight">Security</h2>
            <p className="text-xs text-muted-foreground">Update your password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label htmlFor="current-pw">Current password</Label>
            <div className="relative">
              <Input
                id="current-pw"
                type={showPw.current ? "text" : "password"}
                placeholder="••••••••"
                value={pwForm.current}
                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                className="pr-10 rounded-xl"
                required
              />
              <button type="button" onClick={() => setShowPw((s) => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw.current ? <EyeOff className="w-4 h-4" strokeWidth={1} /> : <Eye className="w-4 h-4" strokeWidth={1} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-pw">New password</Label>
            <div className="relative">
              <Input
                id="new-pw"
                type={showPw.next ? "text" : "password"}
                placeholder="••••••••"
                value={pwForm.next}
                onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
                className="pr-10 rounded-xl"
                required
                minLength={8}
              />
              <button type="button" onClick={() => setShowPw((s) => ({ ...s, next: !s.next }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw.next ? <EyeOff className="w-4 h-4" strokeWidth={1} /> : <Eye className="w-4 h-4" strokeWidth={1} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pw">Confirm new password</Label>
            <Input
              id="confirm-pw"
              type="password"
              placeholder="••••••••"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              className="rounded-xl"
              required
              minLength={8}
            />
          </div>

          <Button type="submit" disabled={savingPw} className="rounded-xl">
            {savingPw ? "Updating..." : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DashboardSettings;
