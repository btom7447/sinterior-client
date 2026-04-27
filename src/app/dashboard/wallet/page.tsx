"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet as WalletIcon,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface Wallet {
  _id: string;
  pendingBalance: number;
  holdingBalance: number;
  availableBalance: number;
  feesOwed: number;
  totalEarned: number;
  totalPaidOut: number;
  totalFeesPaid: number;
  currency: string;
  withdrawalsPaused: boolean;
  pauseReason?: string;
  isNegative: boolean;
  feeMode: string;
  minPayout: number;
  holdHours: number;
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  bucket: string;
  source?: string;
  description?: string;
  availableAt?: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const fmtNaira = (kobo: number) =>
  `${kobo < 0 ? "-" : ""}₦${(Math.abs(kobo) / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const txTypeLabel: Record<string, string> = {
  escrow_credit: "Payment received",
  escrow_release: "Released from escrow",
  hold_expire: "Hold period ended",
  fee_deduction: "Platform fee",
  fee_accrue: "Fee accrued",
  fee_invoice: "Fee invoice",
  payout: "Payout to bank",
  payout_reversal: "Payout reversed",
  refund_in: "Refund credit",
  refund_out: "Refund debit",
  platform_fee_in: "Platform fee credit",
  adjustment: "Adjustment",
};

export default function WalletPage() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 15,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchWallet = useCallback(async () => {
    try {
      const res = await apiGet<{ data: { wallet: Wallet } }>("/wallet/me");
      setWallet(res.data.wallet);
    } catch {
      toast.error("Failed to load wallet");
    }
  }, []);

  const fetchTransactions = useCallback(async (page = 1) => {
    try {
      const res = await apiGet<{
        data: { transactions: Transaction[] };
        pagination: Pagination;
      }>(`/wallet/me/transactions?page=${page}&limit=15`);
      setTransactions(res.data.transactions);
      setPagination(res.pagination);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchWallet(), fetchTransactions()]).finally(() => setLoading(false));
  }, [fetchWallet, fetchTransactions]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-7 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-8 text-center text-muted-foreground">Wallet unavailable</div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Wallet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track earnings, escrow holds, and payouts.
        </p>
      </div>

      {wallet.isNegative && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Your wallet is in the red</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your wallet is owing {fmtNaira(Math.abs(wallet.availableBalance))}. Payouts are
              paused until this is cleared. Earnings from new orders/jobs will go toward the
              balance first.
            </p>
          </div>
        </div>
      )}

      {wallet.feesOwed > 0 && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 flex items-start gap-3">
          <Receipt className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">
              Platform fees owed: {fmtNaira(wallet.feesOwed)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {wallet.feeMode === "per_transaction"
                ? "Accrued from pay-on-delivery orders. Will be deducted from your next online earnings."
                : `Invoiced ${wallet.feeMode}. Next deduction will pull from your available balance.`}
            </p>
          </div>
        </div>
      )}

      {wallet.withdrawalsPaused && !wallet.isNegative && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">Payouts paused</p>
            <p className="text-sm text-muted-foreground mt-1">
              {wallet.pauseReason || "Contact admin if you believe this is in error."}
            </p>
          </div>
        </div>
      )}

      {/* Three-bucket balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <BucketCard
          icon={Clock}
          tone="warning"
          label="Pending (in escrow)"
          value={fmtNaira(wallet.pendingBalance)}
          hint="Held until delivery / acceptance"
        />
        <BucketCard
          icon={TrendingUp}
          tone="primary"
          label="Holding"
          value={fmtNaira(wallet.holdingBalance)}
          hint={`Released — withdrawable after ${wallet.holdHours}h`}
        />
        <BucketCard
          icon={CheckCircle2}
          tone={wallet.isNegative ? "destructive" : "success"}
          label="Available"
          value={fmtNaira(wallet.availableBalance)}
          hint="Ready to withdraw"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/dashboard/wallet/payouts"
          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ArrowUpFromLine className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Request payout</p>
            <p className="text-xs text-muted-foreground">Withdraw to your bank</p>
          </div>
        </Link>
        <Link
          href="/dashboard/wallet/bank"
          className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
            <Building2 className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Bank accounts</p>
            <p className="text-xs text-muted-foreground">Manage payout destinations</p>
          </div>
        </Link>
      </div>

      {/* Lifetime stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Lifetime earned" value={fmtNaira(wallet.totalEarned)} />
        <StatTile label="Total paid out" value={fmtNaira(wallet.totalPaidOut)} />
        <StatTile label="Fees paid" value={fmtNaira(wallet.totalFeesPaid)} />
        <StatTile label="Min payout" value={fmtNaira(wallet.minPayout)} />
      </div>

      {/* Transactions */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-semibold text-foreground">Recent activity</h2>
          <span className="text-xs text-muted-foreground">
            {pagination.total} entries
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <WalletIcon className="w-10 h-10 mx-auto mb-2 opacity-30" strokeWidth={1} />
            No wallet activity yet.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => {
              const isCredit = tx.amount > 0;
              return (
                <li key={tx._id} className="p-4 flex items-center gap-4">
                  <div
                    className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                      isCredit ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {isCredit ? (
                      <ArrowDownToLine className="w-4 h-4" />
                    ) : (
                      <ArrowUpFromLine className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {txTypeLabel[tx.type] || tx.type}
                    </p>
                    {tx.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {tx.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fmtDate(tx.createdAt)}
                      {tx.bucket && ` · ${tx.bucket}`}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      isCredit ? "text-success" : "text-destructive"
                    }`}
                  >
                    {isCredit ? "+" : ""}
                    {fmtNaira(tx.amount)}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {pagination.pages > 1 && (
          <div className="p-3 border-t border-border flex items-center justify-between">
            <button
              onClick={() => fetchTransactions(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchTransactions(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

function BucketCard({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: React.ElementType;
  tone: "primary" | "success" | "warning" | "destructive";
  label: string;
  value: string;
  hint: string;
}) {
  const toneCls: Record<typeof tone, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${toneCls[tone]}`}>
          <Icon className="w-4 h-4" strokeWidth={1.5} />
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary/40 rounded-xl p-3">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}
