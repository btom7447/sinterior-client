"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Loader2, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Bank {
  name: string;
  code: string;
  slug: string;
}

interface BankAccount {
  _id: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  isDefault: boolean;
  verifiedAt: string;
}

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  // Add form state
  const [showForm, setShowForm] = useState(false);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolved, setResolved] = useState<{ accountName: string } | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [accRes, banksRes] = await Promise.all([
        apiGet<{ data: { accounts: BankAccount[] } }>("/bank-accounts/me"),
        apiGet<{ data: { banks: Bank[] } }>("/banks"),
      ]);
      setAccounts(accRes.data.accounts);
      setBanks(banksRes.data.banks);
    } catch {
      toast.error("Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Auto-resolve account name once both fields are valid.
  useEffect(() => {
    if (!bankCode || accountNumber.length < 10) {
      setResolved(null);
      setResolveError(null);
      return;
    }
    const t = setTimeout(async () => {
      setResolving(true);
      setResolveError(null);
      try {
        const res = await apiGet<{ data: { accountNumber: string; accountName: string } }>(
          `/banks/resolve?accountNumber=${accountNumber}&bankCode=${bankCode}`
        );
        setResolved({ accountName: res.data.accountName });
      } catch (err) {
        setResolveError(err instanceof Error ? err.message : "Could not verify account");
        setResolved(null);
      } finally {
        setResolving(false);
      }
    }, 600);
    return () => clearTimeout(t);
  }, [bankCode, accountNumber]);

  const handleSave = async () => {
    if (!resolved || !bankCode || !accountNumber) return;
    const bank = banks.find((b) => b.code === bankCode);
    if (!bank) return;
    setSaving(true);
    try {
      await apiPost("/bank-accounts", {
        accountNumber,
        bankCode,
        bankName: bank.name,
        isDefault: setAsDefault,
      });
      toast.success("Bank account saved");
      setShowForm(false);
      setBankCode("");
      setAccountNumber("");
      setResolved(null);
      setSetAsDefault(false);
      fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this bank account?")) return;
    try {
      await apiDelete(`/bank-accounts/${id}`);
      toast.success("Removed");
      fetchAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-7 w-48" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard/wallet"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Wallet
      </Link>

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Bank Accounts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Where your payouts will be sent. We verify each account with your bank before saving.
        </p>
      </div>

      {accounts.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-10 text-center">
          <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" strokeWidth={1} />
          <p className="text-sm text-muted-foreground mb-4">No bank account on file yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" /> Add bank account
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {accounts.map((a) => (
              <li
                key={a._id}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground truncate">{a.accountName}</p>
                    {a.isDefault && (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-success/10 text-success">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.bankName} · {a.accountNumber.replace(/(\d{4})(?=\d)/g, "$1 ")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(a._id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Plus className="w-4 h-4" /> Add another
          </button>
        </>
      )}

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h2 className="font-display font-semibold text-foreground">Add bank account</h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Bank</label>
            <select
              value={bankCode}
              onChange={(e) => setBankCode(e.target.value)}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">— select bank —</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Account number
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="0123456789"
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Resolution status */}
          {resolving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Verifying account…
            </div>
          )}
          {resolved && (
            <div className="flex items-center gap-2 text-sm text-success p-3 rounded-xl bg-success/5 border border-success/20">
              <CheckCircle2 className="w-4 h-4" />
              Account verified — <strong className="ml-1">{resolved.accountName}</strong>
            </div>
          )}
          {resolveError && (
            <div className="text-sm text-destructive p-3 rounded-xl bg-destructive/5 border border-destructive/20">
              {resolveError}
            </div>
          )}

          {accounts.length > 0 && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-foreground">Set as default for payouts</span>
            </label>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!resolved || saving}
              className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            We verify the account name with your bank before saving. The name on your bank
            account should match your registered name on Sintherior.
          </p>
        </div>
      )}
    </div>
  );
}
