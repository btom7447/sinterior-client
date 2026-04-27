"use client";

import { useEffect, useState } from "react";
import { DollarSign, FileText, CheckCircle2, Clock, ArrowUpRight, Package, Briefcase, Star, TrendingUp, ShoppingBag, Image, ArrowRight, AlertTriangle, Building2, ShieldOff, ShieldCheck, Wallet as WalletIcon, Receipt, Ban } from "lucide-react";
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
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  // null = unknown, "none" = never submitted, otherwise the latest status string.
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  // Wallet snapshot for sellers (artisan + supplier)
  interface WalletSnapshot {
    pendingBalance: number;
    holdingBalance: number;
    availableBalance: number;
    feesOwed: number;
    withdrawalsPaused: boolean;
    pauseReason?: string;
    isNegative: boolean;
    holdHours: number;
  }
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);

  // Active escrow count — quick "X awaiting release" hint
  const [heldEscrowCount, setHeldEscrowCount] = useState<number>(0);

  // Suspension status
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const fetches: Promise<unknown>[] = [
          apiGet<{ data: { stats: Stats } }>("/dashboard/stats"),
          apiGet<{ data: { orders: RecentOrder[] } }>("/dashboard/recent-orders"),
        ];
        if (profile?.role === "artisan") {
          fetches.push(apiGet<{ data: { artisan: { portfolio?: { url: string }[]; isVerified?: boolean } } }>("/artisans/me"));
        }
        if (profile?.role === "supplier") {
          fetches.push(apiGet<{ data: { supplier: { businessName?: string; description?: string; isVerified?: boolean } } }>("/suppliers/me").catch(() => null));
        }
        // Verification history (artisans + suppliers only) — for the latest-status banner.
        const isSeller = profile?.role === "artisan" || profile?.role === "supplier";
        if (isSeller) {
          fetches.push(
            apiGet<{ data: { verifications: { status: string; createdAt: string }[] } }>("/verification/my").catch(() => null)
          );
          // Wallet + held escrow for sellers
          fetches.push(
            apiGet<{ data: { wallet: WalletSnapshot } }>("/wallet/me").catch(() => null)
          );
          fetches.push(
            apiGet<{ data: { entries: unknown[] } }>("/wallet/me/escrow").catch(() => null)
          );
        }
        const results = await Promise.all(fetches);
        const statsRes = results[0] as { data: { stats: Stats } };
        const ordersRes = results[1] as { data: { orders: RecentOrder[] } };
        setStats(statsRes.data.stats);
        setRecentOrders(ordersRes.data.orders);
        if (profile?.role === "artisan" && results[2]) {
          const artisanRes = results[2] as { data: { artisan: { portfolio?: { url: string }[]; isVerified?: boolean } } };
          const a = artisanRes.data?.artisan;
          setHasPortfolio(!!(a?.portfolio && a.portfolio.length > 0));
          setIsVerified(!!a?.isVerified);
        }
        if (profile?.role === "supplier" && results[2]) {
          const supplierRes = results[2] as { data: { supplier: { businessName?: string; description?: string; isVerified?: boolean } } } | null;
          const s = supplierRes?.data?.supplier;
          setHasBusinessInfo(!!(s?.businessName && s?.description));
          setIsVerified(!!s?.isVerified);
        }
        if (isSeller) {
          // results layout for sellers: [stats, orders, role-profile, verifications, wallet, escrow]
          const verifRes = results[3] as { data: { verifications: { status: string; createdAt: string }[] } } | null;
          const list = verifRes?.data?.verifications || [];
          if (list.length === 0) {
            setVerificationStatus("none");
          } else {
            const sorted = [...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
            setVerificationStatus(sorted[0].status);
          }
          const walletRes = results[4] as { data: { wallet: WalletSnapshot } } | null;
          if (walletRes?.data?.wallet) setWallet(walletRes.data.wallet);
          const escrowRes = results[5] as { data: { entries: unknown[] } } | null;
          if (escrowRes?.data?.entries) setHeldEscrowCount(escrowRes.data.entries.length);
        }

        // Suspension surfaces from the auth profile (loaded by useAuth above) —
        // the /auth/me payload now includes isSuspended after admin updates.
        if (profile && (profile as { is_suspended?: boolean }).is_suspended) {
          setIsSuspended(true);
          setSuspensionReason(
            (profile as { suspension_reason?: string }).suspension_reason || null
          );
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

      {/* Suspension banner — top priority. Shown for any suspended seller. */}
      {(role === "artisan" || role === "supplier") && isSuspended && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3">
          <Ban className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-display font-semibold text-foreground">Account suspended</p>
            <p className="text-sm text-muted-foreground mt-1">
              {suspensionReason || "Contact admin to resolve."} You can&apos;t accept new orders or hires until reinstated. In-progress work continues to completion.
            </p>
          </div>
        </div>
      )}

      {/* Wallet alerts — negative balance and fees-owed warnings */}
      {(role === "artisan" || role === "supplier") && wallet && (
        <>
          {wallet.isNegative && (
            <Link href="/dashboard/wallet" className="block">
              <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-4 flex items-start gap-3 hover:bg-destructive/15 transition-colors">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-display font-semibold text-foreground">
                    Wallet in the red — payouts paused
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your available balance is{" "}
                    <strong className="text-destructive">
                      ₦{(wallet.availableBalance / 100).toLocaleString("en-NG")}
                    </strong>
                    . Future earnings will go toward this balance first.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              </div>
            </Link>
          )}
          {wallet.feesOwed > 0 && !wallet.isNegative && (
            <Link href="/dashboard/wallet" className="block">
              <div className="rounded-2xl bg-warning/10 border border-warning/30 p-4 flex items-start gap-3 hover:bg-warning/15 transition-colors">
                <Receipt className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-display font-semibold text-foreground">
                    Platform fees owed: ₦{(wallet.feesOwed / 100).toLocaleString("en-NG")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Will be deducted from your wallet on the next weekly invoice.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              </div>
            </Link>
          )}
          {wallet.withdrawalsPaused && !wallet.isNegative && (wallet.feesOwed || 0) === 0 && (
            <div className="rounded-2xl bg-warning/10 border border-warning/30 p-4 flex items-start gap-3">
              <ShieldOff className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-display font-semibold text-foreground">Payouts paused</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {wallet.pauseReason || "Contact admin if you believe this is in error."}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Verification banner (artisan + supplier) — surfaces the current state of their identity/business verification. */}
      {(role === "artisan" || role === "supplier") &&
        !loading &&
        isVerified === false && (
          <Link href="/dashboard/verification" className="block">
            {(() => {
              const isSupplier = role === "supplier";
              const noun = isSupplier ? "business" : "identity";
              const verb = isSupplier ? "Verify your business" : "Verify your identity";

              if (verificationStatus === "pending") {
                return (
                  <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 flex items-center gap-4 hover:bg-amber-500/15 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">Verification under review</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Admin is reviewing your {noun} verification. We&apos;ll email you with the decision.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-amber-600 shrink-0" strokeWidth={1.5} />
                  </div>
                );
              }
              if (verificationStatus === "rejected" || verificationStatus === "revoked") {
                const wasRevoked = verificationStatus === "revoked";
                return (
                  <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-4 hover:bg-destructive/15 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center shrink-0">
                      <ShieldOff className="w-5 h-5 text-destructive" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {wasRevoked ? "Verification revoked" : "Verification rejected"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        See the reviewer&apos;s reason and submit a new request.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-destructive shrink-0" strokeWidth={1.5} />
                  </div>
                );
              }
              // Default: never submitted
              return (
                <div className="rounded-2xl bg-muted-foreground/5 border border-dashed border-border p-4 flex items-center gap-4 hover:bg-muted-foreground/10 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-muted-foreground/15 flex items-center justify-center shrink-0">
                    <ShieldOff className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{verb}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isSupplier
                        ? "Submit your CAC + supporting documents. Admin reviews each request before granting the verified badge."
                        : "Submit your government-issued ID. Admin reviews each request before granting the verified badge."}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" strokeWidth={1.5} />
                </div>
              );
            })()}
          </Link>
        )}

      {/* Verified confirmation pill (subtle reassurance once verified) */}
      {(role === "artisan" || role === "supplier") && !loading && isVerified === true && (
        <div className="rounded-2xl bg-success/5 border border-success/20 p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-success" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-foreground">
            <span className="font-medium">Verified.</span>{" "}
            <span className="text-muted-foreground">
              The verified badge appears on your public profile.
            </span>
          </p>
        </div>
      )}

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

      {/* Wallet snapshot — 3-bucket view for sellers */}
      {(role === "artisan" || role === "supplier") && wallet && !loading && (
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5 text-primary" strokeWidth={1} />
              <h2 className="font-display text-lg font-bold text-foreground">Wallet</h2>
            </div>
            <Link href="/dashboard/wallet">
              <Button variant="ghost" size="sm" className="text-primary text-xs">
                Manage <ArrowUpRight className="w-4 h-4 ml-1" strokeWidth={1} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-warning/5 border border-warning/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-warning" strokeWidth={1} />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">In Escrow</p>
              </div>
              <p className="font-display text-xl font-bold text-foreground">
                ₦{(wallet.pendingBalance / 100).toLocaleString("en-NG")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {heldEscrowCount > 0 ? `${heldEscrowCount} awaiting release` : "Awaiting buyer acceptance"}
              </p>
            </div>
            <div className="rounded-xl bg-accent/5 border border-accent/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-accent" strokeWidth={1} />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Holding</p>
              </div>
              <p className="font-display text-xl font-bold text-foreground">
                ₦{(wallet.holdingBalance / 100).toLocaleString("en-NG")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Cools down for {wallet.holdHours}h
              </p>
            </div>
            <div className={`rounded-xl border p-4 ${wallet.isNegative ? "bg-destructive/5 border-destructive/30" : "bg-success/5 border-success/20"}`}>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className={`w-4 h-4 ${wallet.isNegative ? "text-destructive" : "text-success"}`} strokeWidth={1} />
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Available</p>
              </div>
              <p className={`font-display text-xl font-bold ${wallet.isNegative ? "text-destructive" : "text-foreground"}`}>
                ₦{(wallet.availableBalance / 100).toLocaleString("en-NG")}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {wallet.withdrawalsPaused ? "Payouts paused" : "Ready to withdraw"}
              </p>
            </div>
          </div>
        </div>
      )}

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
