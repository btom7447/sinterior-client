"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface PlatformSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  commissionRate: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  requireEmailVerification: boolean;
  maxProductImages: number;
  minWithdrawalAmount: number;
}

const defaults: PlatformSettings = {
  siteName: "Sintherior",
  siteDescription: "Nigeria's premier interior design and artisan marketplace",
  supportEmail: "support@sintherior.com",
  commissionRate: 5,
  maintenanceMode: false,
  allowNewRegistrations: true,
  requireEmailVerification: true,
  maxProductImages: 10,
  minWithdrawalAmount: 5000,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ data: { settings: PlatformSettings } }>("/admin/settings");
        setSettings({ ...defaults, ...res.data.settings });
      } catch {
        // API not built yet — use defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPatch("/admin/settings", settings);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 3 }).map((__, j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure platform-wide settings</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* General */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-foreground">General</h3>
          <div>
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Site Name</label>
            <input
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Site Description</label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Support Email</label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <hr className="border-border" />

        {/* Commerce */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-foreground">Commerce</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Commission Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={settings.commissionRate}
                onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Min Withdrawal ({"\u20A6"})</label>
              <input
                type="number"
                min={0}
                value={settings.minWithdrawalAmount}
                onChange={(e) => setSettings({ ...settings, minWithdrawalAmount: Number(e.target.value) })}
                className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Max Product Images</label>
            <input
              type="number"
              min={1}
              max={20}
              value={settings.maxProductImages}
              onChange={(e) => setSettings({ ...settings, maxProductImages: Number(e.target.value) })}
              className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <hr className="border-border" />

        {/* Toggles */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-foreground">Controls</h3>
          {[
            { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Temporarily disable the platform for all users" },
            { key: "allowNewRegistrations" as const, label: "Allow New Registrations", desc: "Allow new users to register" },
            { key: "requireEmailVerification" as const, label: "Require Email Verification", desc: "Users must verify email before accessing dashboard" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, [key]: !settings[key] })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings[key] ? "bg-primary" : "bg-secondary"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    settings[key] ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
