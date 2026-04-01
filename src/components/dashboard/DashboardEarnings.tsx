"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { DollarSign, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Stats {
  totalRevenue?: number;
  totalSpent?: number;
  completedOrders?: number;
  completedJobs?: number;
  pendingOrders?: number;
  activeJobs?: number;
  [key: string]: number | undefined;
}

export default function DashboardEarnings() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ data: { stats: Stats } }>("/dashboard/stats");
        setStats(data.data.stats);
      } catch { toast.error("Failed to load earnings"); }
      finally { setLoading(false); }
    })();
  }, []);

  const fmt = (n?: number) => `₦${(n || 0).toLocaleString("en-NG")}`;
  const role = profile?.role;

  if (loading) return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-28" /><Skeleton className="h-4 w-48 mt-2" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-elevated p-4">
            <Skeleton className="w-10 h-10 rounded-xl mb-3" />
            <Skeleton className="h-7 w-20 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="card-elevated p-6"><Skeleton className="h-4 w-64 mx-auto" /></div>
    </div>
  );

  const cards = role === "client"
    ? [
        { label: "Total Spent", value: fmt(stats.totalSpent), icon: DollarSign, color: "primary" },
        { label: "Total Orders", value: String(stats.totalOrders || 0), icon: TrendingUp, color: "success" },
        { label: "Completed", value: String(stats.completedOrders || 0), icon: CheckCircle2, color: "success" },
        { label: "Pending", value: String(stats.pendingOrders || 0), icon: Clock, color: "warning" },
      ]
    : role === "artisan"
    ? [
        { label: "Total Jobs", value: String(stats.totalJobs || 0), icon: TrendingUp, color: "primary" },
        { label: "Completed", value: String(stats.completedJobs || 0), icon: CheckCircle2, color: "success" },
        { label: "Active", value: String(stats.activeJobs || 0), icon: Clock, color: "warning" },
        { label: "Avg Rating", value: String(stats.avgRating || 0), icon: DollarSign, color: "primary" },
      ]
    : [
        { label: "Total Revenue", value: fmt(stats.totalRevenue), icon: DollarSign, color: "primary" },
        { label: "Total Products", value: String(stats.totalProducts || 0), icon: TrendingUp, color: "success" },
        { label: "Active Products", value: String(stats.activeProducts || 0), icon: CheckCircle2, color: "success" },
        { label: "Pending Orders", value: String(stats.pendingOrders || 0), icon: Clock, color: "warning" },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Earnings</h1>
        <p className="text-muted-foreground text-sm mt-1">Financial overview of your account</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card-elevated p-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              card.color === "primary" ? "bg-primary/10" : card.color === "success" ? "bg-success/10" : "bg-warning/10"
            }`}>
              <card.icon className={`w-5 h-5 ${
                card.color === "primary" ? "text-primary" : card.color === "success" ? "text-success" : "text-warning"
              }`} strokeWidth={1} />
            </div>
            <p className="font-display text-xl lg:text-2xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="card-elevated p-6 text-center">
        <p className="text-muted-foreground text-sm">Detailed earnings breakdown and charts coming soon.</p>
      </div>
    </div>
  );
}
