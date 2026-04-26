"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { BadgeCheck, Clock, X, ChevronLeft, ChevronRight, FileText, ShieldOff, ShieldAlert } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricStrip, type Metric } from "@/components/admin/MetricStrip";
import { toast } from "sonner";

interface DocumentItem {
  type: string;
  url: string;
  label?: string;
}

interface VerificationRow {
  _id: string;
  sellerId: {
    fullName: string;
    avatarUrl: string | null;
    role?: string;
  };
  kind?: "business" | "individual";
  businessName: string;
  documentType?: string;
  documentUrl?: string;
  documents?: DocumentItem[];
  status: string;
  createdAt: string;
  reviewNote: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface VerifPageStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalPages: 1, totalResults: 0 });
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<VerificationRow | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [stats, setStats] = useState<VerifPageStats | null>(null);

  const refreshStats = useCallback(() => {
    apiGet<{ data: { stats: VerifPageStats } }>("/admin/page-stats?page=verification")
      .then((r) => setStats(r.data.stats))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const fetchRequests = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await apiGet<{ data: { verifications: VerificationRow[] }; pagination: Pagination }>(`/admin/verifications?${params}`);
      setRequests(res.data.verifications);
      setPagination(res.pagination);
    } catch {
      toast.error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDecision = async (
    id: string,
    status: "approved" | "rejected" | "revoked"
  ) => {
    if ((status === "rejected" || status === "revoked") && !reviewNote.trim()) {
      toast.error("Please give a reason — it will be shown to the requestor.");
      return;
    }
    try {
      await apiPatch(`/admin/verifications/${id}`, { status, reviewNote });
      toast.success(`Verification ${status}`);
      setReviewModal(null);
      setReviewNote("");
      fetchRequests(pagination.page);
      refreshStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  const statusIcon = (status: string) => {
    if (status === "approved") return <BadgeCheck className="w-4 h-4 text-green-500" />;
    if (status === "rejected") return <X className="w-4 h-4 text-red-500" />;
    if (status === "revoked") return <ShieldOff className="w-4 h-4 text-orange-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const metrics: Metric[] | null = stats
    ? [
        { label: "Total", value: stats.total.toLocaleString("en-NG") },
        { label: "Pending", value: stats.pending.toLocaleString("en-NG"), tone: stats.pending > 0 ? "warning" : "default" },
        { label: "Approved", value: stats.approved.toLocaleString("en-NG"), tone: "success" },
        { label: "Rejected", value: stats.rejected.toLocaleString("en-NG") },
      ]
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Seller Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and verify seller credentials</p>
      </div>

      <MetricStrip metrics={metrics} loading={!stats} columns={4} />

      <div className="flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "revoked", ""].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
            >
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          ))
        ) : requests.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
            No verification requests found
          </div>
        ) : (
          requests.map((r) => (
            <div key={r._id} className="bg-card border border-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={r.sellerId?.avatarUrl || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {r.sellerId?.fullName?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground">{r.sellerId?.fullName || "Unknown"}</p>
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                    {r.kind === "business" ? "Business" : r.kind === "individual" ? "Individual" : (r.sellerId?.role === "supplier" ? "Business" : "Individual")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{r.businessName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {(r.documents?.length ?? (r.documentUrl ? 1 : 0))} document
                    {((r.documents?.length ?? (r.documentUrl ? 1 : 0)) === 1) ? "" : "s"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  {statusIcon(r.status)}
                  <span className="text-xs font-medium capitalize">{r.status}</span>
                </div>
                {(r.status === "pending" || r.status === "approved") && (
                  <button
                    onClick={() => { setReviewModal(r); setReviewNote(""); }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    {r.status === "approved" ? "Manage" : "Review"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{pagination.totalResults} requests total</p>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchRequests(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
            <button onClick={() => fetchRequests(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setReviewModal(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const isBusiness = reviewModal.kind === "business" || reviewModal.sellerId?.role === "supplier";
              const isApproved = reviewModal.status === "approved";
              const docList: DocumentItem[] = reviewModal.documents?.length
                ? reviewModal.documents
                : reviewModal.documentUrl
                ? [{ type: reviewModal.documentType || "other", url: reviewModal.documentUrl }]
                : [];

              return (
                <>
                  <div className="shrink-0 p-6 border-b border-border">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-display font-bold text-foreground">
                        {isApproved ? "Manage verification" : isBusiness ? "Verify business" : "Verify identity"}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {isBusiness ? "Business" : "Individual"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isBusiness
                        ? "Confirm the business is real and the documents check out."
                        : "Confirm the artisan's identity from their submitted documents."}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Submitted by</p>
                        <p className="text-foreground mt-0.5">{reviewModal.sellerId?.fullName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {isBusiness ? "Business name" : "Full name on document"}
                        </p>
                        <p className="text-foreground mt-0.5">{reviewModal.businessName}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Documents ({docList.length})
                      </p>
                      {docList.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No documents uploaded.</p>
                      ) : (
                        <ul className="space-y-2">
                          {docList.map((d, i) => (
                            <li
                              key={i}
                              className="flex items-center justify-between p-3 rounded-xl border border-border bg-secondary/30"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="text-sm capitalize truncate">
                                  {d.label || d.type.replace(/_/g, " ")}
                                </span>
                              </div>
                              <a
                                href={d.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline shrink-0 ml-3"
                              >
                                Open
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {reviewModal.reviewNote && reviewModal.status !== "pending" && (
                      <div className="p-3 rounded-xl border border-border bg-secondary/20 text-sm">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          Previous reviewer note
                        </p>
                        <p className="text-foreground whitespace-pre-wrap">{reviewModal.reviewNote}</p>
                      </div>
                    )}

                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Reviewer note
                      </label>
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder={
                          isApproved
                            ? "Reason for revoking (required to revoke)…"
                            : "Required if rejecting. Optional if approving."
                        }
                        className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Shown to the requestor when status is rejected or revoked.
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 p-6 border-t border-border flex gap-3">
                    {isApproved ? (
                      <>
                        <button
                          onClick={() => handleDecision(reviewModal._id, "revoked")}
                          className="flex-1 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <ShieldOff className="w-4 h-4" />
                          Revoke verification
                        </button>
                        <button
                          onClick={() => setReviewModal(null)}
                          className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
                        >
                          Close
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDecision(reviewModal._id, "approved")}
                          className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleDecision(reviewModal._id, "rejected")}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => setReviewModal(null)}
                          className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
