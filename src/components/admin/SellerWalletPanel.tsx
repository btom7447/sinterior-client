"use client";

/**
 * A seller's wallet, and the four things an admin can do to it.
 *
 * `GET /admin/wallets/:profileId`, `adjust`, `suspend`, `unsuspend` and
 * `send-fee-reminder` all shipped and none of them had a caller anywhere — the
 * only way to suspend a seller who was taking money and not delivering was
 * curl. Which meant, in practice, that nobody could.
 *
 * It lives on the user detail page because that is where an admin already is
 * when they decide somebody needs stopping.
 *
 * Money is in kobo everywhere on the wire; naira only ever appears on screen
 * and in the one input, which converts on the way out.
 */
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Ban, BellRing, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { toast } from "sonner";

const naira = (kobo: number) =>
  `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface SellerWallet {
  _id: string;
  pendingBalance: number;
  availableBalance: number;
  holdingBalance?: number;
  feesOwed: number;
  totalEarned?: number;
  isPaused?: boolean;
}

const BUCKETS = ["available", "pending", "holding", "feesOwed"] as const;
type Bucket = (typeof BUCKETS)[number];

export function SellerWalletPanel({
  profileId,
  isSuspended,
  onChanged,
}: {
  profileId: string;
  isSuspended?: boolean;
  onChanged?: () => void;
}) {
  const [wallet, setWallet] = useState<SellerWallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const [reason, setReason] = useState("");
  const [amountNaira, setAmountNaira] = useState("");
  const [bucket, setBucket] = useState<Bucket>("available");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { wallet: SellerWallet } }>(
        `/admin/wallets/${profileId}`
      );
      setWallet(res.data.wallet);
    } catch {
      // A seller who has never been paid has no wallet row. That is not an
      // error worth a red banner — it is simply nothing to show yet.
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (label: string, fn: () => Promise<unknown>, done: string) => {
    setBusy(label);
    try {
      await fn();
      toast.success(done);
      setReason("");
      setAmountNaira("");
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "That did not go through.");
    } finally {
      setBusy(null);
    }
  };

  const suspend = () => {
    if (!reason.trim()) return toast.error("A reason is required to suspend a seller.");
    run(
      "suspend",
      () => apiPost(`/admin/wallets/${profileId}/suspend`, { reason: reason.trim() }),
      "Seller suspended."
    );
  };

  const unsuspend = () =>
    run("unsuspend", () => apiPost(`/admin/wallets/${profileId}/unsuspend`, {}), "Seller reinstated.");

  const adjust = () => {
    const value = Number(amountNaira);
    if (!Number.isFinite(value) || value === 0) {
      return toast.error("Enter an amount. Negative takes money off.");
    }
    if (!reason.trim()) return toast.error("An adjustment needs a reason on the record.");
    run(
      "adjust",
      () =>
        apiPost(`/admin/wallets/${profileId}/adjust`, {
          // Kobo on the wire. Rounded, because a float here becomes a balance
          // nobody can reconcile.
          amount: Math.round(value * 100),
          bucket,
          reason: reason.trim(),
        }),
      "Wallet adjusted."
    );
  };

  const remind = () =>
    run(
      "remind",
      () => apiPost(`/admin/wallets/${profileId}/send-fee-reminder`, {}),
      "Reminder sent."
    );

  if (loading) {
    return (
      <div className="card-elevated p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading wallet…</span>
      </div>
    );
  }

  return (
    <div className="card-elevated p-6 space-y-5">
      <div className="flex items-center gap-2">
        <Wallet strokeWidth={1.5} className="w-5 h-5 text-primary" />
        <h2 className="font-display font-semibold text-foreground">Wallet &amp; standing</h2>
        {isSuspended && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600">
            <Ban className="w-3 h-3" /> Suspended
          </span>
        )}
      </div>

      {!wallet ? (
        <p className="text-sm text-muted-foreground">
          No wallet yet — this seller has never been paid.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Figure label="Available" value={naira(wallet.availableBalance)} />
          <Figure label="In escrow" value={naira(wallet.pendingBalance)} />
          <Figure label="Holding" value={naira(wallet.holdingBalance ?? 0)} />
          <Figure
            label="Fees owed"
            value={naira(wallet.feesOwed)}
            tone={wallet.feesOwed > 0 ? "warn" : undefined}
          />
        </div>
      )}

      {/* One reason box for whichever action is taken. Every one of these
          endpoints demands a reason, and rightly — each is something the seller
          will ask about later. */}
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          Reason (required for suspend and adjust)
        </label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Goes on the record and is shown to the seller"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Adjust by (₦)
          </label>
          <input
            value={amountNaira}
            onChange={(e) => setAmountNaira(e.target.value)}
            inputMode="numeric"
            placeholder="-5000 to deduct"
            className="w-40 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Bucket
          </label>
          <select
            value={bucket}
            onChange={(e) => setBucket(e.target.value as Bucket)}
            className="px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {BUCKETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={adjust}
          disabled={!!busy || !wallet}
          className="px-4 py-3 rounded-xl bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors disabled:opacity-40"
        >
          {busy === "adjust" ? "Adjusting…" : "Apply adjustment"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        {isSuspended ? (
          <button
            onClick={unsuspend}
            disabled={!!busy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            {busy === "unsuspend" ? "Reinstating…" : "Reinstate seller"}
          </button>
        ) : (
          <button
            onClick={suspend}
            disabled={!!busy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            <Ban className="w-4 h-4" />
            {busy === "suspend" ? "Suspending…" : "Suspend seller"}
          </button>
        )}

        {/* Only when there is something to chase. The endpoint 400s otherwise,
            so offering it would be offering a button that fails. */}
        {!!wallet?.feesOwed && wallet.feesOwed > 0 && (
          <button
            onClick={remind}
            disabled={!!busy}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-40"
          >
            <BellRing className="w-4 h-4" />
            {busy === "remind" ? "Sending…" : `Chase ${naira(wallet.feesOwed)} in fees`}
          </button>
        )}
      </div>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        Suspending stops the seller listing and being paid out. Adjustments are written to the
        ledger with your reason attached.
      </p>
    </div>
  );
}

function Figure({ label, value, tone }: { label: string; value: string; tone?: "warn" }) {
  return (
    <div className="rounded-xl border border-border p-3">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p
        className={`mt-1 text-sm font-semibold ${tone === "warn" ? "text-amber-600" : "text-foreground"}`}
      >
        {value}
      </p>
    </div>
  );
}
