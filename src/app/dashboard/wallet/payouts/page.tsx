"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpFromLine,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Wallet {
  availableBalance: number;
  withdrawalsPaused: boolean;
  pauseReason?: string;
  isNegative: boolean;
  minPayout: number;
  payoutReviewHours: number;
}

interface BankAccount {
  _id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  isDefault: boolean;
}

interface Payout {
  _id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  scheduledFor: string;
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
  bankAccountId: BankAccount;
}

const fmtKobo = (k: number) =>
  `₦${(k / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusCfg = {
  pending: { icon: Clock, cls: "bg-amber-500/10 text-amber-600", label: "Awaiting cooldown" },
  processing: { icon: Loader2, cls: "bg-primary/10 text-primary", label: "Processing" },
  completed: { icon: CheckCircle2, cls: "bg-success/10 text-success", label: "Completed" },
  failed: { icon: AlertCircle, cls: "bg-destructive/10 text-destructive", label: "Failed" },
  cancelled: { icon: XCircle, cls: "bg-secondary text-muted-foreground", label: "Cancelled" },
} as const;

export default function PayoutsPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [bankAccountId, setBankAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [w, a, p] = await Promise.all([
        apiGet<{ data: { wallet: Wallet } }>("/wallet/me"),
        apiGet<{ data: { accounts: BankAccount[] } }>("/bank-accounts/me"),
        apiGet<{ data: { payouts: Payout[] } }>("/payouts/me"),
      ]);
      setWallet(w.data.wallet);
      setAccounts(a.data.accounts);
      setPayouts(p.data.payouts);
      // Auto-pick default bank account
      const def = a.data.accounts.find((x) => x.isDefault) || a.data.accounts[0];
      if (def && !bankAccountId) setBankAccountId(def._id);
    } catch {
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSubmit = async () => {
    if (!wallet || !bankAccountId || !amount) return;
    const kobo = Math.round(Number(amount) * 100);
    if (kobo < wallet.minPayout) {
      toast.error(`Minimum payout is ${fmtKobo(wallet.minPayout)}`);
      return;
    }
    if (kobo > wallet.availableBalance) {
      toast.error("Amount exceeds available balance");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/payouts", { amount: kobo, bankAccountId });
      toast.success("Payout queued");
      setAmount("");
      fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to queue payout");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (!wallet) return null;

  const blockReason = wallet.isNegative
    ? "Your wallet is in the red. Clear the negative balance before requesting a payout."
    : wallet.withdrawalsPaused
      ? wallet.pauseReason || "Your payouts are paused. Contact admin."
      : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard/wallet"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Wallet
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Payouts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Withdraw your available balance to your bank account.
        </p>
      </div>

      {/* Request form */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display font-semibold text-foreground">Request payout</h2>
          <span className="text-sm text-muted-foreground">
            Available: <strong className="text-foreground">{fmtKobo(wallet.availableBalance)}</strong>
          </span>
        </div>

        {blockReason && (
          <div className="text-sm text-destructive p-3 rounded-xl bg-destructive/5 border border-destructive/20">
            {blockReason}
          </div>
        )}

        {accounts.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-6 text-center">
            <Building2 className="w-7 h-7 text-muted-foreground mx-auto mb-2" strokeWidth={1} />
            <p className="text-sm text-muted-foreground mb-3">
              You need a bank account on file before you can withdraw.
            </p>
            <Link
              href="/dashboard/wallet/bank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
            >
              Add bank account
            </Link>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Bank account
              </label>
              <select
                value={bankAccountId}
                onChange={(e) => setBankAccountId(e.target.value)}
                disabled={!!blockReason}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
              >
                {accounts.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.accountName} · {a.bankName} · {a.accountNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Amount (₦)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={!!blockReason}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Min: {fmtKobo(wallet.minPayout)} · Max: {fmtKobo(wallet.availableBalance)}
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!!blockReason || submitting || !amount || !bankAccountId}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <ArrowUpFromLine className="w-4 h-4" />
              {submitting ? "Queuing…" : "Request payout"}
            </button>
            <p className="text-xs text-muted-foreground">
              Funds will be sent to your bank in approximately {wallet.payoutReviewHours}h after review.
              Failed transfers are automatically refunded to your wallet.
            </p>
          </>
        )}
      </div>

      {/* History */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-semibold text-foreground">Payout history</h2>
        </div>
        {payouts.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No payouts yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {payouts.map((p) => {
              const cfg = statusCfg[p.status];
              const Icon = cfg.icon;
              return (
                <li key={p._id} className="p-4 flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${cfg.cls}`}>
                    <Icon className={`w-4 h-4 ${p.status === "processing" ? "animate-spin" : ""}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {fmtKobo(p.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      To {p.bankAccountId?.accountName} · {p.bankAccountId?.bankName}
                    </p>
                    {p.failureReason && (
                      <p className="text-xs text-destructive mt-0.5">{p.failureReason}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${cfg.cls.split(" ").pop()}`}>
                      {cfg.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {new Date(p.requestedAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
