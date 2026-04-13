"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import {
  Users,
  ShoppingBag,
  Package,
  Briefcase,
  DollarSign,
  BadgeCheck,
  Scale,
  TrendingUp,
} from "lucide-react";

interface Stats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalJobs: number;
  totalRevenue: number;
  pendingVerifications: number;
  openDisputes: number;
  newUsersThisMonth: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ data: { stats: Stats } }>("/admin/stats");
        setStats(res.data.stats);
      } catch {
        // API not built yet — show zeroes
        setStats({
          totalUsers: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalJobs: 0,
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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={s.totalUsers} icon={Users} color="bg-blue-500/10 text-blue-500" />
        <StatCard label="Total Orders" value={s.totalOrders} icon={ShoppingBag} color="bg-green-500/10 text-green-500" />
        <StatCard label="Total Products" value={s.totalProducts} icon={Package} color="bg-purple-500/10 text-purple-500" />
        <StatCard label="Total Jobs" value={s.totalJobs} icon={Briefcase} color="bg-orange-500/10 text-orange-500" />
        <StatCard
          label="Total Revenue"
          value={`\u20A6${s.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard label="Pending Verifications" value={s.pendingVerifications} icon={BadgeCheck} color="bg-yellow-500/10 text-yellow-500" />
        <StatCard label="Open Disputes" value={s.openDisputes} icon={Scale} color="bg-red-500/10 text-red-500" />
        <StatCard label="New Users (Month)" value={s.newUsersThisMonth} icon={TrendingUp} color="bg-teal-500/10 text-teal-500" />
      </div>
    </div>
  );
}
