"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { BadgeCheck, Clock, X, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface VerificationRow {
  _id: string;
  sellerId: {
    fullName: string;
    avatarUrl: string | null;
  };
  businessName: string;
  documentType: string;
  documentUrl: string;
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

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalPages: 1, totalResults: 0 });
  const [statusFilter, setStatusFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<VerificationRow | null>(null);
  const [reviewNote, setReviewNote] = useState("");

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

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    try {
      await apiPatch(`/admin/verifications/${id}`, { status, reviewNote });
      toast.success(`Verification ${status}`);
      setReviewModal(null);
      setReviewNote("");
      fetchRequests(pagination.page);
    } catch {
      toast.error("Action failed");
    }
  };

  const statusIcon = (status: string) => {
    if (status === "approved") return <BadgeCheck className="w-4 h-4 text-green-500" />;
    if (status === "rejected") return <X className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Seller Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and verify seller credentials</p>
      </div>

      <div className="flex gap-2">
        {["pending", "approved", "rejected", ""].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
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
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
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
                <p className="font-medium text-foreground">{r.sellerId?.fullName || "Unknown"}</p>
                <p className="text-sm text-muted-foreground">{r.businessName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground capitalize">{r.documentType?.replace(/_/g, " ")}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  {statusIcon(r.status)}
                  <span className="text-xs font-medium capitalize">{r.status}</span>
                </div>
                {r.status === "pending" && (
                  <button
                    onClick={() => { setReviewModal(r); setReviewNote(""); }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Review
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
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-display font-bold text-foreground">Review Verification</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Seller:</span> {reviewModal.sellerId?.fullName}</p>
              <p><span className="text-muted-foreground">Business:</span> {reviewModal.businessName}</p>
              <p><span className="text-muted-foreground">Document:</span> {reviewModal.documentType?.replace(/_/g, " ")}</p>
              {reviewModal.documentUrl && (
                <a href={reviewModal.documentUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">
                  View Document
                </a>
              )}
            </div>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Review note (optional)..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleDecision(reviewModal._id, "approved")}
                className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleDecision(reviewModal._id, "rejected")}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => setReviewModal(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
