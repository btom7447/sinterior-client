"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet as WalletIcon,
  Lock,
  Unlock,
  ArrowUpFromLine,
  Receipt,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const fmtKobo = (k: number) =>
  `₦${(k / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

type TabId = "escrow" | "payouts" | "platform";

interface EscrowEntry {
  _id: string;
  entityType: string;
  entityId: string;
  buyerProfileId: { _id: string; fullName: string };
  sellerProfileId: { _id: string; fullName: string };
  amount: number;
  feeAmount: number;
  netAmount: number;
  status: string;
  refundedAmount?: number;
  heldAt: string;
  releasedAt?: string;
  refundedAt?: string;
}

interface Payout {
  _id: string;
  amount: number;
  status: string;
  scheduledFor: string;
  requestedAt: string;
  failureReason?: string;
  profileId: { _id: string; fullName: string };
  bankAccountId: { accountNumber: string; bankName: string; accountName: string };
}

interface PlatformWallet {
  pendingBalance: number;
  holdingBalance: number;
  availableBalance: number;
  totalEarned: number;
}

const escrowStatusCls: Record<string, string> = {
  held: "bg-amber-500/10 text-amber-600",
  released: "bg-success/10 text-success",
  refunded: "bg-destructive/10 text-destructive",
  partially_refunded: "bg-warning/10 text-warning",
};

const payoutStatusCls: Record<string, { cls: string; icon: React.ElementType }> = {
  pending: { cls: "bg-amber-500/10 text-amber-600", icon: Clock },
  processing: { cls: "bg-primary/10 text-primary", icon: RefreshCw },
  completed: { cls: "bg-success/10 text-success", icon: CheckCircle2 },
  failed: { cls: "bg-destructive/10 text-destructive", icon: AlertCircle },
  cancelled: { cls: "bg-secondary text-muted-foreground", icon: XCircle },
};

export default function AdminPaymentsPage() {
  const [tab, setTab] = useState<TabId>("escrow");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Escrow, payouts, platform wallet and emergency controls.
        </p>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(
          [
            { id: "escrow", label: "Escrow" },
            { id: "payouts", label: "Payouts" },
            { id: "platform", label: "Platform Wallet" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "escrow" && <EscrowTab />}
      {tab === "payouts" && <PayoutsTab />}
      {tab === "platform" && <PlatformTab />}
    </div>
  );
}

// ── Escrow tab ─────────────────────────────────────────────────────────────

function EscrowTab() {
  const [entries, setEntries] = useState<EscrowEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [refundModal, setRefundModal] = useState<EscrowEntry | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [working, setWorking] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await apiGet<{ data: { entries: EscrowEntry[] } }>(`/admin/escrow?${params}`);
      setEntries(res.data.entries);
    } catch {
      toast.error("Failed to load escrow");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleRefund = async () => {
    if (!refundModal || !refundReason.trim()) return;
    setWorking(true);
    try {
      const body: Record<string, unknown> = { reason: refundReason.trim() };
      if (refundAmount) body.amount = Math.round(Number(refundAmount) * 100);
      await apiPost(`/admin/escrow/${refundModal._id}/refund`, body);
      toast.success("Refund issued");
      setRefundModal(null);
      setRefundAmount("");
      setRefundReason("");
      fetchEntries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setWorking(false);
    }
  };

  const handleForceRelease = async (entry: EscrowEntry) => {
    const reason = prompt("Reason for force-releasing this escrow?");
    if (!reason?.trim()) return;
    try {
      await apiPost(`/admin/escrow/${entry._id}/release`, { reason: reason.trim() });
      toast.success("Force-released");
      fetchEntries();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["", "held", "released", "refunded", "partially_refunded"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-60 rounded-2xl" />
      ) : entries.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          No escrow entries
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Buyer</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Seller</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e._id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                  <td className="p-3 capitalize">{e.entityType}</td>
                  <td className="p-3">{e.buyerProfileId?.fullName || "—"}</td>
                  <td className="p-3">{e.sellerProfileId?.fullName || "—"}</td>
                  <td className="p-3 text-right font-medium">{fmtKobo(e.amount)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                        escrowStatusCls[e.status] || "bg-secondary"
                      }`}
                    >
                      {e.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {e.status === "held" && (
                      <>
                        <button
                          onClick={() => handleForceRelease(e)}
                          className="text-xs text-primary hover:underline mr-3"
                        >
                          Force release
                        </button>
                        <button
                          onClick={() => setRefundModal(e)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Refund
                        </button>
                      </>
                    )}
                    {(e.status === "released" || e.status === "partially_refunded") && (
                      <button
                        onClick={() => setRefundModal(e)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Refund modal */}
      {refundModal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setRefundModal(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-md p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-foreground">Issue refund</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Escrow {fmtKobo(refundModal.amount)} ·{" "}
                <span className="capitalize">{refundModal.status.replace("_", " ")}</span>
              </p>
              {refundModal.status === "released" && (
                <p className="text-warning">
                  Funds already released — refund will pull from seller&apos;s wallet (may go negative).
                </p>
              )}
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Amount (₦) — leave blank for full
              </label>
              <input
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={`${(refundModal.amount / 100).toFixed(2)}`}
                className="w-full mt-1 h-10 rounded-xl border border-input bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Reason (required)
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="w-full mt-1 px-3 py-2 rounded-xl border border-input bg-background text-sm resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRefundModal(null)}
                className="flex-1 py-2 rounded-xl bg-secondary text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={working || !refundReason.trim()}
                className="flex-1 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 disabled:opacity-50"
              >
                {working ? "Refunding…" : "Issue refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Payouts tab ────────────────────────────────────────────────────────────

function PayoutsTab() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchPayouts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "30" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await apiGet<{ data: { payouts: Payout[] } }>(`/admin/payouts?${params}`);
      setPayouts(res.data.payouts);
    } catch {
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const releaseNow = async (id: string) => {
    if (!confirm("Skip cooldown and release this payout on the next cron tick?")) return;
    try {
      await apiPost(`/admin/payouts/${id}/release-now`, {});
      toast.success("Cooldown bypassed");
      fetchPayouts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };
  const cancel = async (id: string) => {
    const reason = prompt("Cancellation reason?");
    if (!reason?.trim()) return;
    try {
      await apiPost(`/admin/payouts/${id}/cancel`, { reason: reason.trim() });
      toast.success("Cancelled and wallet refunded");
      fetchPayouts();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["", "pending", "processing", "completed", "failed", "cancelled"].map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <Skeleton className="h-60 rounded-2xl" />
      ) : payouts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
          No payouts
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left p-3 font-medium text-muted-foreground">Seller</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Bank</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Scheduled</th>
                <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => {
                const cfg = payoutStatusCls[p.status] || payoutStatusCls.pending;
                const Icon = cfg.icon;
                return (
                  <tr key={p._id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                    <td className="p-3">{p.profileId?.fullName || "—"}</td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {p.bankAccountId
                        ? `${p.bankAccountId.bankName} · ${p.bankAccountId.accountNumber}`
                        : "—"}
                    </td>
                    <td className="p-3 text-right font-medium">{fmtKobo(p.amount)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium capitalize ${cfg.cls}`}
                      >
                        <Icon
                          className={`w-3 h-3 ${p.status === "processing" ? "animate-spin" : ""}`}
                        />
                        {p.status}
                      </span>
                      {p.failureReason && (
                        <p className="text-xs text-destructive mt-1">{p.failureReason}</p>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{fmtDate(p.scheduledFor)}</td>
                    <td className="p-3 text-right">
                      {p.status === "pending" && (
                        <>
                          <button
                            onClick={() => releaseNow(p._id)}
                            className="text-xs text-primary hover:underline mr-3"
                          >
                            Release now
                          </button>
                          <button
                            onClick={() => cancel(p._id)}
                            className="text-xs text-destructive hover:underline"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Platform tab ───────────────────────────────────────────────────────────

function PlatformTab() {
  const [wallet, setWallet] = useState<PlatformWallet | null>(null);
  const [recent, setRecent] = useState<{ _id: string; type: string; amount: number; description?: string; createdAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalPaused, setGlobalPaused] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [walletRes, settings] = await Promise.all([
        apiGet<{ data: { wallet: PlatformWallet; recent: typeof recent } }>(
          "/admin/wallets/platform"
        ),
        apiGet<{ data: { settings: Record<string, unknown> } }>("/admin/settings"),
      ]);
      setWallet(walletRes.data.wallet);
      setRecent(walletRes.data.recent);
      setGlobalPaused(!!settings.data.settings.globalPayoutsPaused);
    } catch {
      toast.error("Failed to load platform wallet");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const togglePause = async () => {
    const next = !globalPaused;
    if (next && !confirm("Pause ALL payouts platform-wide? This blocks every seller from withdrawing.")) return;
    try {
      await apiPost("/admin/settings/global-pause", { paused: next });
      setGlobalPaused(next);
      toast.success(next ? "Global pause enabled" : "Global pause disabled");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  };

  if (loading) return <Skeleton className="h-60 rounded-2xl" />;
  if (!wallet) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <WalletIcon className="w-4 h-4 text-success" />
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Available</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{fmtKobo(wallet.availableBalance)}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Lifetime fees</p>
          <p className="text-2xl font-bold text-foreground mt-2">{fmtKobo(wallet.totalEarned)}</p>
        </div>
        <button
          onClick={togglePause}
          className={`bg-card border rounded-2xl p-4 text-left transition-colors ${
            globalPaused
              ? "border-destructive/40 bg-destructive/5 hover:bg-destructive/10"
              : "border-border hover:border-destructive/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {globalPaused ? (
              <Lock className="w-4 h-4 text-destructive" />
            ) : (
              <Unlock className="w-4 h-4 text-muted-foreground" />
            )}
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Global pause</p>
          </div>
          <p className={`text-sm font-semibold ${globalPaused ? "text-destructive" : "text-foreground"}`}>
            {globalPaused ? "ALL payouts paused" : "Click to pause all payouts"}
          </p>
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-2">
          <Receipt className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground">Recent platform activity</h3>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No activity yet</div>
        ) : (
          <ul className="divide-y divide-border">
            {recent.map((tx) => (
              <li key={tx._id} className="p-3 flex items-center justify-between text-sm">
                <div>
                  <p className="text-foreground">{tx.type.replace(/_/g, " ")}</p>
                  {tx.description && (
                    <p className="text-xs text-muted-foreground">{tx.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{fmtDate(tx.createdAt)}</p>
                </div>
                <div className={`font-semibold ${tx.amount >= 0 ? "text-success" : "text-destructive"}`}>
                  {tx.amount >= 0 ? "+" : ""}
                  {fmtKobo(tx.amount)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
