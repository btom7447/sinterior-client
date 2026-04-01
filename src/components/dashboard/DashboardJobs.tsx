"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPatch, apiPost } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  MessageCircle,
  Star,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ProfileInfo {
  _id: string;
  fullName: string;
  avatarUrl: string | null;
  city: string;
}

interface Job {
  _id: string;
  clientId: ProfileInfo;
  artisanId: ProfileInfo;
  title: string;
  description: string;
  budget?: number;
  location?: string;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  startDate?: string;
  endDate?: string;
  createdAt: string;
}

interface Pagination { page: number; limit: number; total: number; pages: number; }

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "bg-warning/10 text-warning" },
  accepted: { label: "Accepted", icon: CheckCircle2, color: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", icon: Play, color: "bg-accent/10 text-accent" },
  completed: { label: "Completed", icon: CheckCircle2, color: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-destructive/10 text-destructive" },
};

// Artisan transitions
const ARTISAN_TRANSITIONS: Record<string, string[]> = {
  pending: ["accepted", "cancelled"],
  accepted: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
};

// Client can only cancel
const CLIENT_TRANSITIONS: Record<string, string[]> = {
  pending: ["cancelled"],
  accepted: ["cancelled"],
};

export default function DashboardJobs() {
  const { profile } = useAuth();
  const router = useRouter();
  const isArtisan = profile?.role === "artisan";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Job | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchJobs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (filter !== "all") params.set("status", filter);
      const data = await apiGet<{ data: { jobs: Job[] }; pagination: Pagination }>(`/jobs?${params}`);
      setJobs(data.data?.jobs || []);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load jobs"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiPatch(`/jobs/${id}/status`, { status });
      toast.success(`Job ${status.replace("_", " ")}`);
      fetchJobs(pagination.page);
      if (selected?._id === id) setSelected((p) => p ? { ...p, status: status as Job["status"] } : null);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
  };

  const handleMessage = async (participantId: string) => {
    try {
      await apiPost("/chat/messages", {
        receiverId: participantId,
        content: `Hi! I'd like to discuss the job "${selected?.title}".`,
      });
      router.push("/dashboard/chat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start chat");
    }
  };

  const handleSubmitReview = async () => {
    if (!selected) return;
    setReviewSubmitting(true);
    try {
      await apiPost("/reviews", {
        artisanId: selected.artisanId._id,
        rating: reviewRating,
        comment: reviewComment || undefined,
      });
      toast.success("Review submitted!");
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const transitions = isArtisan ? ARTISAN_TRANSITIONS : CLIENT_TRANSITIONS;
  const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  if (loading && !jobs.length) return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-48 mt-2" /></div>
      <div className="flex gap-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}</div>
      <div className="space-y-3">{[...Array(5)].map((_, i) => (
        <div key={i} className="card-elevated p-4 flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><div className="flex items-center gap-2"><Skeleton className="w-4 h-4 rounded-full" /><Skeleton className="h-3 w-24" /></div></div>
          <div className="text-right space-y-2"><Skeleton className="h-4 w-16 ml-auto" /><Skeleton className="h-4 w-14 rounded-full ml-auto" /></div>
        </div>
      ))}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Jobs</h1>
        <p className="text-muted-foreground text-sm mt-1">Track and manage job requests</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "pending", "accepted", "in_progress", "completed", "cancelled"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? "All" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
          </button>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Briefcase className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-foreground">{filter !== "all" ? `No ${filter.replace("_", " ")} jobs` : "No jobs yet"}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {isArtisan ? "Job requests from clients will appear here" : "Jobs you create for artisans will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const cfg = STATUS_CONFIG[job.status];
            const Icon = cfg.icon;
            const otherParty = isArtisan ? job.clientId : job.artisanId;
            return (
              <div key={job._id} className="card-elevated p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => setSelected(job)}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Icon className="w-5 h-5" strokeWidth={1} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{job.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Avatar className="w-4 h-4">
                      <AvatarImage src={otherParty?.avatarUrl || ""} />
                      <AvatarFallback className="text-[8px]">{otherParty?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate">{otherParty?.fullName}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {job.budget != null && <p className="text-sm font-bold text-foreground">{fmt(job.budget)}</p>}
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
                <Eye className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1} />
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchJobs(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchJobs(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      {/* Job Detail Modal */}
      {selected && !showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">Job Details</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <h4 className="font-semibold text-foreground">{selected.title}</h4>
              {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}
              <div className="space-y-2 text-sm">
                {selected.budget != null && <div className="flex justify-between"><span className="text-muted-foreground">Budget</span><span className="font-semibold">{fmt(selected.budget)}</span></div>}
                {selected.location && <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span>{selected.location}</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selected.status].color}`}>{STATUS_CONFIG[selected.status].label}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{fmtDate(selected.createdAt)}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArtisan ? "Client" : "Artisan"}</span>
                  <span>{isArtisan ? selected.clientId?.fullName : selected.artisanId?.fullName}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-border pt-3 space-y-3">
                {/* Message */}
                <button
                  onClick={() => {
                    const otherId = isArtisan ? selected.clientId?._id : selected.artisanId?._id;
                    if (otherId) handleMessage(otherId);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1} />
                  {isArtisan ? "Message Client" : "Message Artisan"}
                </button>

                {/* Review button (client only, completed jobs) */}
                {!isArtisan && selected.status === "completed" && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                  >
                    <Star className="w-4 h-4" strokeWidth={1} />
                    Rate & Review Artisan
                  </button>
                )}

                {/* Status transitions */}
                {transitions[selected.status] && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Update Status</p>
                    <div className="flex gap-2">
                      {transitions[selected.status].map((next) => (
                        <button key={next} onClick={() => updateStatus(selected._id, next)} className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${next === "cancelled" ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                          {STATUS_CONFIG[next as keyof typeof STATUS_CONFIG].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">Rate {selected.artisanId?.fullName}</h3>
              <button onClick={() => setShowReviewModal(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setReviewRating(s)} className="p-0.5">
                      <Star className={`w-8 h-8 transition-colors ${s <= reviewRating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} strokeWidth={1} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Comment (optional)</p>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was your experience with this artisan?"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <button
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
