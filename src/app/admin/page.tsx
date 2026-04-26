"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricStrip, type Metric } from "@/components/admin/MetricStrip";

interface Stats {
  activeUsers: number;
  activeArtisans: number;
  activeSellers: number;
  activeOrders: number;
  productsInStock: number;
  activeJobs: number;
  totalRevenue: number;
  pendingVerifications: number;
  openDisputes: number;
  newUsersThisMonth: number;
}

const fmtN = (n: number) => n.toLocaleString("en-NG");
const fmtNaira = (n: number) => `₦${fmtN(n)}`;

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ data: { stats: Stats } }>("/admin/stats");
        setStats(res.data.stats);
      } catch {
        setStats({
          activeUsers: 0,
          activeArtisans: 0,
          activeSellers: 0,
          activeOrders: 0,
          productsInStock: 0,
          activeJobs: 0,
          totalRevenue: 0,
          pendingVerifications: 0,
          openDisputes: 0,
          newUsersThisMonth: 0,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((__, j) => (
                <div key={j} className="bg-card border border-border rounded-2xl p-4 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-16" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const s = stats!;

  const peopleMetrics: Metric[] = [
    { label: "Active Users", value: fmtN(s.activeUsers) },
    { label: "Active Artisans", value: fmtN(s.activeArtisans) },
    { label: "Active Sellers", value: fmtN(s.activeSellers) },
    { label: "New Users (Month)", value: fmtN(s.newUsersThisMonth), tone: "info" },
  ];

  const marketplaceMetrics: Metric[] = [
    { label: "Active Orders", value: fmtN(s.activeOrders) },
    { label: "Active Jobs", value: fmtN(s.activeJobs) },
    { label: "Products in Stock", value: fmtN(s.productsInStock) },
  ];

  const revenueMetrics: Metric[] = [
    { label: "Total Revenue", value: fmtNaira(s.totalRevenue), tone: "success" },
  ];

  const opsMetrics: Metric[] = [
    {
      label: "Pending Verifications",
      value: fmtN(s.pendingVerifications),
      tone: s.pendingVerifications > 0 ? "warning" : "default",
    },
    {
      label: "Open Disputes",
      value: fmtN(s.openDisputes),
      tone: s.openDisputes > 0 ? "danger" : "default",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview and key metrics</p>
      </div>

      <Section title="People">
        <MetricStrip metrics={peopleMetrics} columns={4} />
      </Section>

      <Section title="Marketplace activity">
        <MetricStrip metrics={marketplaceMetrics} columns={3} />
      </Section>

      <Section title="Revenue">
        <MetricStrip metrics={revenueMetrics} columns={2} />
      </Section>

      <Section title="Operations">
        <MetricStrip metrics={opsMetrics} columns={2} />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}
