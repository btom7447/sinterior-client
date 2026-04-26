"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { Scale, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricStrip, type Metric } from "@/components/admin/MetricStrip";
import { toast } from "sonner";

interface DisputeRow {
  _id: string;
  type: string;
  reason: string;
  status: string;
  raisedBy: { fullName: string };
  against: { fullName: string };
  orderId?: string;
  jobId?: string;
  createdAt: string;
  adminNote: string;
  resolution: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const statusColors: Record<string, string> = {
  open: "bg-red-500/10 text-red-600",
  under_review: "bg-yellow-500/10 text-yellow-600",
  resolved: "bg-green-500/10 text-green-600",
  dismissed: "bg-gray-500/10 text-gray-600",
};

interface DisputePageStats {
  open: number;
  underReview: number;
  resolved: number;
  dismissed: number;
  total: number;
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalPages: 1, totalResults: 0 });
  const [statusFilter, setStatusFilter] = useState("open");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DisputeRow | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [resolution, setResolution] = useState("");
  const [stats, setStats] = useState<DisputePageStats | null>(null);

  const refreshStats = useCallback(() => {
    apiGet<{ data: { stats: DisputePageStats } }>("/admin/page-stats?page=disputes")
      .then((r) => setStats(r.data.stats))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  const fetchDisputes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await apiGet<{ data: { disputes: DisputeRow[] }; pagination: Pagination }>(`/admin/disputes?${params}`);
      setDisputes(res.data.disputes);
      setPagination(res.pagination);
    } catch {
      toast.error("Failed to load disputes");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleResolve = async (id: string, status: "resolved" | "dismissed") => {
    try {
      await apiPatch(`/admin/disputes/${id}`, { status, adminNote, resolution });
      toast.success(`Dispute ${status}`);
      setSelected(null);
      setAdminNote("");
      setResolution("");
      fetchDisputes(pagination.page);
      refreshStats();
    } catch {
      toast.error("Action failed");
    }
  };

  const metrics: Metric[] | null = stats
    ? [
        { label: "Total", value: stats.total.toLocaleString("en-NG") },
        { label: "Open", value: stats.open.toLocaleString("en-NG"), tone: stats.open > 0 ? "danger" : "default" },
        { label: "Under Review", value: stats.underReview.toLocaleString("en-NG"), tone: stats.underReview > 0 ? "warning" : "default" },
        { label: "Resolved", value: stats.resolved.toLocaleString("en-NG"), tone: "success" },
        { label: "Dismissed", value: stats.dismissed.toLocaleString("en-NG") },
      ]
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Dispute Resolution</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and resolve platform disputes</p>
      </div>

      <MetricStrip metrics={metrics} loading={!stats} columns={5} />

      <div className="flex gap-2 flex-wrap">
        {["open", "under_review", "resolved", "dismissed", ""].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              statusFilter === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-secondary/80"
            }`}
          >
            {s?.replace(/_/g, " ") || "All"}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full max-w-md" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Skeleton className="h-6 w-20 rounded-lg" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))
        ) : disputes.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
            No disputes found
          </div>
        ) : (
          disputes.map((d) => (
            <div
              key={d._id}
              onClick={() => { setSelected(d); setAdminNote(d.adminNote || ""); setResolution(d.resolution || ""); }}
              className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                    {d.type === "order" ? <Scale className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-orange-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-foreground capitalize">{d.type} Dispute</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{d.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {d.raisedBy?.fullName || "Unknown"} vs {d.against?.fullName || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium capitalize ${statusColors[d.status] || "bg-secondary"}`}>
                    {d.status?.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{pagination.totalResults} disputes total</p>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchDisputes(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
            <button onClick={() => fetchDisputes(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dispute Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 p-6 border-b border-border">
              <h3 className="text-lg font-display font-bold text-foreground capitalize">{selected.type} Dispute</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {selected.raisedBy?.fullName} vs {selected.against?.fullName}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Reason</p>
                <p className="text-sm text-foreground">{selected.reason}</p>
              </div>

              {selected.status === "open" || selected.status === "under_review" ? (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Admin Note</label>
                    <textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Internal notes..."
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Resolution</label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Resolution details..."
                    />
                  </div>
                </>
              ) : (
                <>
                  {selected.adminNote && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Admin Note</p>
                      <p className="text-sm text-foreground">{selected.adminNote}</p>
                    </div>
                  )}
                  {selected.resolution && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Resolution</p>
                      <p className="text-sm text-foreground">{selected.resolution}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="shrink-0 p-6 border-t border-border flex gap-3">
              {(selected.status === "open" || selected.status === "under_review") && (
                <>
                  <button
                    onClick={() => handleResolve(selected._id, "resolved")}
                    className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleResolve(selected._id, "dismissed")}
                    className="flex-1 py-2.5 rounded-xl bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                </>
              )}
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
