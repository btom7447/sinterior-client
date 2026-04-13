"use client";

import { useEffect, useState } from "react";
import { DollarSign, FileText, CheckCircle2, Clock, ArrowUpRight, Package, Briefcase, Star, TrendingUp, ShoppingBag, Image, ArrowRight, AlertTriangle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { apiGet } from "@/lib/apiClient";
import Link from "next/link";

interface Stats {
  [key: string]: number | undefined;
}

interface RecentOrder {
  _id: string;
  items: { name: string; quantity: number; priceAtOrder: number }[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-primary/10 text-primary",
  shipped: "bg-accent/10 text-accent",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const DashboardOverview = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({});
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPortfolio, setHasPortfolio] = useState(true);
  const [hasBusinessInfo, setHasBusinessInfo] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const fetches: Promise<unknown>[] = [
          apiGet<{ data: { stats: Stats } }>("/dashboard/stats"),
          apiGet<{ data: { orders: RecentOrder[] } }>("/dashboard/recent-orders"),
        ];
        if (profile?.role === "artisan") {
          fetches.push(apiGet<{ data: { portfolio?: { url: string }[] } }>("/artisans/me"));
        }
        if (profile?.role === "supplier") {
          fetches.push(apiGet<{ data: { supplier: { businessName?: string; description?: string } } }>("/suppliers/me").catch(() => null));
        }
        const results = await Promise.all(fetches);
        const statsRes = results[0] as { data: { stats: Stats } };
        const ordersRes = results[1] as { data: { orders: RecentOrder[] } };
        setStats(statsRes.data.stats);
        setRecentOrders(ordersRes.data.orders);
        if (profile?.role === "artisan" && results[2]) {
          const artisanRes = results[2] as { data: { portfolio?: { url: string }[] } };
          setHasPortfolio(!!(artisanRes.data?.portfolio && artisanRes.data.portfolio.length > 0));
        }
        if (profile?.role === "supplier" && results[2]) {
          const supplierRes = results[2] as { data: { supplier: { businessName?: string; description?: string } } } | null;
          const s = supplierRes?.data?.supplier;
          setHasBusinessInfo(!!(s?.businessName && s?.description));
        }
      } catch {
        // silent — dashboard still renders
      } finally {
        setLoading(false);
      }
    })();
  }, [profile?.role]);

  const fmt = (n?: number) => `₦${(n || 0).toLocaleString("en-NG")}`;
  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
  const role = profile?.role;

  const statCards =
    role === "artisan"
      ? [
          { label: "Total Jobs", value: String(stats.totalJobs || 0), icon: Briefcase, color: "primary" },
          { label: "Active Jobs", value: String(stats.activeJobs || 0), icon: FileText, color: "warning" },
          { label: "Completed", value: String(stats.completedJobs || 0), icon: CheckCircle2, color: "success" },
          { label: "Avg Rating", value: String(stats.avgRating || 0), icon: Star, color: "accent" },
        ]
      : role === "supplier"
      ? [
          { label: "Total Revenue", value: fmt(stats.totalRevenue), icon: DollarSign, color: "primary" },
          { label: "Total Products", value: String(stats.totalProducts || 0), icon: Package, color: "success" },
          { label: "Out of Stock", value: String(stats.outOfStockProducts || 0), icon: AlertTriangle, color: "warning" },
          { label: "Pending Orders", value: String(stats.pendingOrders || 0), icon: Clock, color: "accent" },
        ]
      : [
          { label: "Total Spent", value: fmt(stats.totalSpent), icon: DollarSign, color: "primary" },
          { label: "Total Orders", value: String(stats.totalOrders || 0), icon: FileText, color: "warning" },
          { label: "Completed", value: String(stats.completedOrders || 0), icon: CheckCircle2, color: "success" },
          { label: "Pending", value: String(stats.pendingOrders || 0), icon: Clock, color: "accent" },
        ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome, {profile?.full_name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {/* Portfolio Banner (artisans with no portfolio) */}
      {role === "artisan" && !loading && !hasPortfolio && (
        <Link href="/onboarding/artisan" className="block">
          <div className="rounded-2xl bg-warning/10 border border-warning/20 p-4 flex items-center gap-4 hover:bg-warning/15 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center shrink-0">
              <Image className="w-5 h-5 text-warning" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Add your portfolio</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Artisans with portfolio photos get 3x more job requests. Showcase your best work to attract clients.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-warning shrink-0" strokeWidth={1.5} />
          </div>
        </Link>
      )}

      {/* Business Info Banner (suppliers with incomplete business profile) */}
      {role === "supplier" && !loading && !hasBusinessInfo && (
        <Link href="/dashboard/business" className="block">
          <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4 flex items-center gap-4 hover:bg-primary/15 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Complete your business profile</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Suppliers with complete profiles get more visibility. Add your business name, description, and delivery info.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary shrink-0" strokeWidth={1.5} />
          </div>
        </Link>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="card-elevated p-4">
                <Skeleton className="w-10 h-10 rounded-xl mb-3" />
                <Skeleton className="h-7 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))
          : statCards.map((stat) => (
              <div key={stat.label} className="card-elevated p-4">
                <div className="mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      stat.color === "primary"
                        ? "bg-primary/10"
                        : stat.color === "warning"
                        ? "bg-warning/10"
                        : stat.color === "success"
                        ? "bg-success/10"
                        : "bg-accent/10"
                    }`}
                  >
                    <stat.icon
                      className={`w-5 h-5 ${
                        stat.color === "primary"
                          ? "text-primary"
                          : stat.color === "warning"
                          ? "text-warning"
                          : stat.color === "success"
                          ? "text-success"
                          : "text-accent"
                      }`}
                      strokeWidth={1}
                    />
                  </div>
                </div>
                <p className="font-display text-xl lg:text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {role === "artisan" && (
          <>
            <Link href="/dashboard/jobs" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">View Jobs</span>
            </Link>
            <Link href="/dashboard/appointments" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">Appointments</span>
            </Link>
            <Link href="/dashboard/reviews" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <Star className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">Reviews</span>
            </Link>
            <Link href="/dashboard/earnings" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">Earnings</span>
            </Link>
          </>
        )}
        {role === "supplier" && (
          <>
            <Link href="/dashboard/my-products" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">Products</span>
            </Link>
            <Link href="/dashboard/orders" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">Orders</span>
            </Link>
            <Link href="/dashboard/inventory" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">Inventory</span>
            </Link>
            <Link href="/dashboard/earnings" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">Earnings</span>
            </Link>
          </>
        )}
        {role === "client" && (
          <>
            <Link href="/dashboard/orders" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">My Orders</span>
            </Link>
            <Link href="/dashboard/projects" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">Projects</span>
            </Link>
            <Link href="/dashboard/saved" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <Star className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">Saved Artisans</span>
            </Link>
            <Link href="/dashboard/properties" className="card-elevated p-4 hover:bg-secondary/50 transition-colors flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" strokeWidth={1} />
              <span className="text-sm font-medium">Properties</span>
            </Link>
          </>
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-foreground">Recent Orders</h2>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm" className="text-primary text-xs">
              View All <ArrowUpRight className="w-4 h-4 ml-1" strokeWidth={1} />
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="space-y-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 px-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <ShoppingBag className="w-6 h-6 text-muted-foreground" strokeWidth={1} />
            </div>
            <p className="text-sm font-medium text-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground mt-1">Your recent purchases will appear here</p>
            <Link href="/products" className="text-xs text-primary hover:underline mt-3">Browse products</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Items</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Date</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Amount</th>
                  <th className="text-right py-3 px-2 text-muted-foreground font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-2 font-medium text-foreground truncate max-w-[200px]">
                      {o.items.map((i) => i.name).join(", ")}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{fmtDate(o.createdAt)}</td>
                    <td className="py-3 px-2 text-right font-semibold text-foreground">{fmt(o.totalAmount)}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[o.status] || "bg-muted text-muted-foreground"}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
