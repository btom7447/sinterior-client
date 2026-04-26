"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AnalyticsData {
  usersOverTime: { month: string; count: number }[];
  ordersOverTime: { month: string; count: number; revenue: number }[];
  topCategories: { name: string; count: number }[];
  topArtisans: { name: string; jobs: number }[];
  usersByRole: { role: string; count: number }[];
  revenueThisMonth: number;
  revenuePrevMonth: number;
  ordersThisMonth: number;
  ordersPrevMonth: number;
}

function MetricCard({
  label,
  value,
  prev,
  icon: Icon,
  prefix,
}: {
  label: string;
  value: number;
  prev: number;
  icon: React.ElementType;
  prefix?: string;
}) {
  const change = prev > 0 ? ((value - prev) / prev) * 100 : 0;
  const isUp = change >= 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
        <div className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-green-500" : "text-red-500"}`}>
          {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground">
        {prefix}{value.toLocaleString()}
      </p>
      <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ data: { analytics: AnalyticsData } }>("/admin/analytics");
        setData(res.data.analytics);
      } catch {
        // API not built yet — show placeholder
        setData({
          usersOverTime: [],
          ordersOverTime: [],
          topCategories: [],
          topArtisans: [],
          usersByRole: [],
          revenueThisMonth: 0,
          revenuePrevMonth: 0,
          ordersThisMonth: 0,
          ordersPrevMonth: 0,
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
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-7 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <Skeleton className="h-5 w-32" />
              {Array.from({ length: 5 }).map((__, j) => (
                <div key={j} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  const d = data!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform performance and trends</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Revenue This Month" value={d.revenueThisMonth} prev={d.revenuePrevMonth} icon={DollarSign} prefix={"\u20A6"} />
        <MetricCard label="Orders This Month" value={d.ordersThisMonth} prev={d.ordersPrevMonth} icon={ShoppingBag} />
        <MetricCard
          label="Total Users"
          value={d.usersByRole.reduce((sum, r) => sum + r.count, 0)}
          prev={d.usersByRole.reduce((sum, r) => sum + r.count, 0)}
          icon={Users}
        />
        <MetricCard
          label="Growth Rate"
          value={d.usersOverTime.length > 0 ? d.usersOverTime[d.usersOverTime.length - 1].count : 0}
          prev={d.usersOverTime.length > 1 ? d.usersOverTime[d.usersOverTime.length - 2].count : 0}
          icon={TrendingUp}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-bold text-foreground mb-4">Users by Role</h3>
          {d.usersByRole.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            <div className="space-y-3">
              {d.usersByRole.map((r) => {
                const total = d.usersByRole.reduce((s, x) => s + x.count, 0);
                const pct = total > 0 ? (r.count / total) * 100 : 0;
                return (
                  <div key={r.role}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="capitalize text-foreground">{r.role}</span>
                      <span className="text-muted-foreground">{r.count} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-bold text-foreground mb-4">Top Categories</h3>
          {d.topCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            <div className="space-y-3">
              {d.topCategories.slice(0, 8).map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    {c.name}
                  </span>
                  <span className="text-muted-foreground">{c.count} products</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Artisans */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-bold text-foreground mb-4">Top Artisans</h3>
          {d.topArtisans.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            <div className="space-y-3">
              {d.topArtisans.slice(0, 8).map((a, i) => (
                <div key={a.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    <span className="text-muted-foreground mr-2">{i + 1}.</span>
                    {a.name}
                  </span>
                  <span className="text-muted-foreground">{a.jobs} jobs</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Orders */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-display font-bold text-foreground mb-4">Monthly Orders</h3>
          {d.ordersOverTime.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available</p>
          ) : (
            <div className="space-y-3">
              {d.ordersOverTime.slice(-6).map((m) => (
                <div key={m.month} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{m.month}</span>
                  <div className="text-right">
                    <span className="text-foreground font-medium">{m.count} orders</span>
                    <span className="text-muted-foreground ml-2">{"\u20A6"}{m.revenue.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
