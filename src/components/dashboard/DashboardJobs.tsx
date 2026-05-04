"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPatch, apiPost } from "@/lib/apiClient";
import { formatNaira, NIGERIAN_STATES } from "@/lib/constants";
import { resolveAssetUrl } from "@/types/api";
import { useAuth } from "@/hooks/useAuth";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Star,
  Calendar,
  CalendarClock,
  MapPin,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { JobActionModal } from "@/components/dashboard/JobActionModal";
import QuoteModal, { type QuoteData } from "@/components/dashboard/QuoteModal";
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
  state?: string;
  city?: string;
  appointmentDate?: string;
  scheduledDate?: string;
  bookingType?: "urgent" | "scheduled";
  status: "pending" | "quote_pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  paymentStatus?: "pending" | "paid" | "failed";
  totalAmount?: number;
  quoteId?: string;
  startedAt?: string;
  endedAt?: string;
  clientStartApproved?: boolean;
  artisanStartApproved?: boolean;
  clientEndApproved?: boolean;
  artisanEndApproved?: boolean;
  cancellationReason?: string;
  cancelledBy?: "client" | "artisan";
  workAccepted?: boolean;
  workAcceptedAt?: string;
  workAutoAcceptAt?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
}


interface Pagination { page: number; limit: number; total: number; pages: number; }

const STATUS_CONFIG = {
  pending: { label: "Pending", icon: Clock, color: "bg-warning/10 text-warning" },
  quote_pending: { label: "Quote Pending", icon: FileText, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  accepted: { label: "Accepted", icon: CheckCircle2, color: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", icon: Play, color: "bg-accent/10 text-accent" },
  completed: { label: "Completed", icon: CheckCircle2, color: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-destructive/10 text-destructive" },
};

const ARTISAN_TRANSITIONS: Record<string, string[]> = {
  pending: ["accepted", "cancelled"],
  quote_pending: ["cancelled"],
  accepted: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
};

const CLIENT_TRANSITIONS: Record<string, string[]> = {
  pending: ["cancelled"],
  quote_pending: ["cancelled"],
  accepted: ["cancelled"],
};


export default function DashboardJobs() {
  const { profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ?as=artisan|client — explicit override. Otherwise default by role.
  const explicitAs = searchParams?.get("as");
  const view: "artisan" | "client" =
    explicitAs === "artisan" || explicitAs === "client"
      ? explicitAs
      : profile?.role === "artisan"
      ? "artisan"
      : "client";
  const isArtisan = view === "artisan";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Job | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [titleSaving, setTitleSaving] = useState(false);

  // Reschedule state
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);

  // Dispute state
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);

  // Action modal state — replaces native confirm() dialogs
  const [actionModal, setActionModal] = useState<
    | null
    | "reject"
    | "cancel"
    | "approve-end"
  >(null);

  // Quote state
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteModalId, setQuoteModalId] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);

  const fetchJobs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10", as: view });
      if (filter !== "all") params.set("status", filter);
      const data = await apiGet<{ data: { jobs: Job[] }; pagination: Pagination }>(`/jobs?${params}`);
      setJobs(data.data?.jobs || []);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load jobs"); }
    finally { setLoading(false); }
  }, [filter, view]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const fetchQuotes = useCallback(async (jobId: string) => {
    setQuotesLoading(true);
    try {
      const res = await apiGet<{ data: { quotes: QuoteData[] } }>(`/quotes/job/${jobId}`);
      setQuotes(res.data?.quotes || []);
    } catch {
      setQuotes([]);
    } finally {
      setQuotesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected) {
      fetchQuotes(selected._id);
    } else {
      setQuotes([]);
    }
  }, [selected, fetchQuotes]);

  const performAction = async (
    id: string,
    action: "reject" | "cancel" | "approve-end",
    successMsg: string,
    body: Record<string, unknown> = {}
  ) => {
    setStatusUpdating(true);
    try {
      const res = await apiPost<{ data: { job: Job }; message?: string }>(
        `/jobs/${id}/${action}`,
        body
      );
      toast.success(res.message || successMsg);
      fetchJobs(pagination.page);
      if (selected?._id === id && res.data?.job) setSelected(res.data.job);
      setActionModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleMessage = (participantId: string, participantName: string) => {
    router.push(`/dashboard/chat?recipientId=${participantId}&recipientName=${encodeURIComponent(participantName)}`);
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

  const handlePay = async (jobId: string) => {
    setPayLoading(true);
    try {
      const data = await apiPost<{ data: { authorization_url: string } }>("/payments/initialize", {
        type: "job",
        entityId: jobId,
      });
      window.location.href = data.data.authorization_url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to initialize payment");
      setPayLoading(false);
    }
  };

  const saveTitle = async () => {
    if (!selected || !titleDraft.trim()) return;
    setTitleSaving(true);
    try {
      const res = await apiPatch<{ data: { job: Job } }>(`/jobs/${selected._id}/title`, { title: titleDraft.trim() });
      setSelected(res.data.job);
      setJobs((prev) => prev.map((j) => j._id === selected._id ? { ...j, title: titleDraft.trim() } : j));
      setEditingTitle(false);
      toast.success("Title updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update title");
    } finally {
      setTitleSaving(false);
    }
  };

  const handleReschedule = async () => {
    if (!selected) return;
    if (!rescheduleDate || !rescheduleReason.trim()) {
      toast.error("Please provide a new date and reason");
      return;
    }
    setRescheduleSubmitting(true);
    try {
      // Find the appointment linked to this job, then reschedule it
      const aptsRes = await apiGet<{ data: { appointments: { _id: string; jobId?: string }[] } }>("/appointments?limit=100");
      const linked = aptsRes.data?.appointments?.find((a) => a.jobId === selected._id);
      if (!linked) {
        toast.error("No appointment found for this job");
        setRescheduleSubmitting(false);
        return;
      }
      await apiPatch(`/appointments/${linked._id}/reschedule`, {
        date: rescheduleDate,
        reason: rescheduleReason,
      });
      toast.success("Appointment rescheduled");
      setShowReschedule(false);
      setRescheduleDate("");
      setRescheduleReason("");
      // Update the job's appointmentDate locally
      setSelected((p) => p ? { ...p, appointmentDate: rescheduleDate } : null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reschedule");
    } finally {
      setRescheduleSubmitting(false);
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
        <h1 className="font-display text-2xl font-bold text-foreground">
          {isArtisan ? "Jobs Hired For" : "My Hires"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isArtisan
            ? "Job requests sent to you — accept, decline, and manage progress."
            : "Artisans you've hired — track progress and confirm start/completion."}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "pending", "quote_pending", "accepted", "in_progress", "completed", "cancelled"].map((s) => (
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
                      <AvatarImage src={resolveAssetUrl(otherParty?.avatarUrl || "")} />
                      <AvatarFallback className="text-[8px]">{otherParty?.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground truncate">{otherParty?.fullName}</span>
                    {job.appointmentDate && (
                      <>
                        <span className="text-xs text-muted-foreground">&middot;</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" strokeWidth={1} />
                          {fmtDate(job.appointmentDate)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {job.budget != null && <p className="text-sm font-bold text-foreground">{fmt(job.budget)}</p>}
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                </div>
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
      {selected && !showReviewModal && !showReschedule && !showDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null); setEditingTitle(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <h3 className="font-display font-bold text-foreground">Job Details</h3>
              <button onClick={() => setSelected(null); setEditingTitle(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isArtisan && !["completed", "cancelled"].includes(selected.status) ? (
                editingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      maxLength={200}
                      className="flex-1 text-sm font-semibold bg-secondary rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingTitle(false); }}
                    />
                    <button onClick={saveTitle} disabled={titleSaving} className="text-xs text-primary font-medium hover:underline disabled:opacity-50">
                      {titleSaving ? "Saving…" : "Save"}
                    </button>
                    <button onClick={() => setEditingTitle(false)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <h4 className="font-semibold text-foreground">{selected.title}</h4>
                    <button
                      onClick={() => { setTitleDraft(selected.title); setEditingTitle(true); }}
                      className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                    >
                      Edit
                    </button>
                  </div>
                )
              ) : (
                <h4 className="font-semibold text-foreground">{selected.title}</h4>
              )}
              {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}

              {/* Appointment date badge */}
              {selected.appointmentDate && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <Calendar strokeWidth={1} className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Appointment Date</p>
                    <p className="text-sm font-semibold text-foreground">{fmtDate(selected.appointmentDate)}</p>
                  </div>
                  {["accepted", "in_progress"].includes(selected.status) && (
                    <button
                      onClick={() => {
                        setRescheduleDate("");
                        setRescheduleReason("");
                        setShowReschedule(true);
                      }}
                      className="text-xs text-primary font-medium hover:underline shrink-0"
                    >
                      Reschedule
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-2 text-sm">
                {selected.totalAmount != null && selected.totalAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-semibold">{fmt(selected.totalAmount)}</span>
                  </div>
                )}
                {selected.bookingType && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="capitalize font-medium">{selected.bookingType === "urgent" ? "Urgent" : "Scheduled"}</span>
                  </div>
                )}
                {selected.scheduledDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booked for</span>
                    <span>{fmtDate(selected.scheduledDate)}</span>
                  </div>
                )}
                {(selected.state || selected.city || selected.location) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location</span>
                    <span className="text-right">
                      {[selected.city, selected.state].filter(Boolean).join(", ") || selected.location}
                    </span>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[selected.status].color}`}>{STATUS_CONFIG[selected.status].label}</span></div>
                {selected.status === "cancelled" && selected.cancellationReason && (
                  <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-xs uppercase tracking-wider text-destructive font-medium mb-1">
                      Cancelled by {selected.cancelledBy === "client" ? "client" : selected.cancelledBy === "artisan" ? "artisan" : "—"}
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{selected.cancellationReason}</p>
                  </div>
                )}
                {selected.totalAmount != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className={`capitalize font-medium ${selected.paymentStatus === "paid" ? "text-success" : selected.paymentStatus === "failed" ? "text-destructive" : "text-warning"}`}>
                      {selected.paymentStatus || "pending"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{fmtDate(selected.createdAt)}</span></div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isArtisan ? "Client" : "Artisan"}</span>
                  <span>{isArtisan ? selected.clientId?.fullName : selected.artisanId?.fullName}</span>
                </div>
              </div>

              {/* Quote panel — visible on all jobs */}
              {["pending", "quote_pending", "accepted", "in_progress", "completed"].includes(selected.status) && (
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" strokeWidth={1} />
                      Quote
                    </p>
                    {isArtisan && ["pending", "accepted", "quote_pending"].includes(selected.status) && quotes.filter(q => q.status !== "superseded").length === 0 && (
                      <button
                        onClick={() => { setQuoteModalId(null); setQuoteModal(true); }}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        Create Quote
                      </button>
                    )}
                  </div>

                  {quotesLoading ? (
                    <p className="text-xs text-muted-foreground">Loading…</p>
                  ) : quotes.length === 0 ? (
                    <div className="p-3 rounded-xl bg-secondary/50 text-sm text-muted-foreground">
                      {isArtisan
                        ? "No quote sent yet. Create a quote to share your price with the client."
                        : "No quote received yet. The artisan will send one soon."}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {quotes.filter(q => q.status !== "superseded").map((q) => {
                        const isSent = q.status === "sent";
                        const isAccepted = q.status === "accepted";
                        const isRejected = q.status === "rejected";
                        const canEdit = isArtisan && (isSent || isRejected) && ["pending", "accepted", "quote_pending"].includes(selected.status);
                        return (
                          <div
                            key={q._id}
                            className={`p-3 rounded-xl border text-sm space-y-1.5 ${
                              isAccepted ? "border-success/30 bg-success/5" :
                              isRejected ? "border-destructive/20 bg-destructive/5" :
                              "border-border bg-secondary/30"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">Quote v{q.version}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                isAccepted ? "bg-success/20 text-success" :
                                isRejected ? "bg-destructive/20 text-destructive" :
                                "bg-primary/10 text-primary"
                              }`}>
                                {isSent ? "Awaiting response" : isRejected ? "Declined" : "Accepted"}
                              </span>
                            </div>
                            <div className="flex justify-between font-semibold text-foreground">
                              <span>Total</span>
                              <span>{formatNaira(q.total)}</span>
                            </div>
                            {/* Artisan: view/edit button on sent or rejected quote */}
                            {canEdit && (
                              <button
                                onClick={() => { setQuoteModalId(q._id); setQuoteModal(true); }}
                                className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 border border-border transition-colors"
                              >
                                {isRejected ? "Edit & Resend Quote" : "View / Edit Quote"}
                              </button>
                            )}
                            {/* Client: respond button on active sent quote */}
                            {!isArtisan && isSent && (
                              <button
                                onClick={() => { setQuoteModalId(q._id); setQuoteModal(true); }}
                                className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                              >
                                View & Respond to Quote
                              </button>
                            )}
                            {/* Client: view-only on accepted or rejected quote */}
                            {!isArtisan && (isAccepted || isRejected) && (
                              <button
                                onClick={() => { setQuoteModalId(q._id); setQuoteModal(true); }}
                                className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 border border-border transition-colors"
                              >
                                View Quote
                              </button>
                            )}
                            {/* Artisan: view-only on accepted quote */}
                            {isArtisan && isAccepted && (
                              <button
                                onClick={() => { setQuoteModalId(q._id); setQuoteModal(true); }}
                                className="w-full mt-1 px-3 py-2 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 border border-border transition-colors"
                              >
                                View Quote
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-border pt-3 space-y-3">
                <button
                  onClick={() => {
                    const other = isArtisan ? selected.clientId : selected.artisanId;
                    if (other?._id) handleMessage(other._id, other.fullName);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={1} />
                  {isArtisan ? "Message Client" : "Message Artisan"}
                </button>

                {/* Fallback pay button — only if payment failed / client came back without completing Paystack */}
                {!isArtisan && ["accepted", "in_progress", "completed"].includes(selected.status) && selected.totalAmount && selected.totalAmount > 0 && selected.paymentStatus !== "paid" && !!selected.quoteId && (
                  <button
                    onClick={() => handlePay(selected._id)}
                    disabled={payLoading}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    <CreditCard className="w-4 h-4" strokeWidth={1} />
                    {payLoading ? "Redirecting..." : `Complete Payment — ${formatNaira(selected.totalAmount)}`}
                  </button>
                )}

                {/* Completed — payment auto-released by platform when both parties confirmed */}
                {selected.status === "completed" && selected.paymentStatus === "paid" && (
                  <div className="p-3 rounded-xl border border-success/20 bg-success/5 flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <p className="text-sm text-foreground">
                      {isArtisan
                        ? "Job complete. Payment released to your wallet."
                        : "Job complete. Payment released to the artisan."}
                    </p>
                  </div>
                )}

                {!isArtisan && selected.status === "completed" && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                  >
                    <Star className="w-4 h-4" strokeWidth={1} />
                    Rate & Review Artisan
                  </button>
                )}

                {/* Decline — artisan only, when job is pending. Accept is implicit via sending a quote. */}
                {isArtisan && selected.status === "pending" && (
                  <button
                    onClick={() => setActionModal("reject")}
                    disabled={statusUpdating}
                    className="w-full px-3 py-2 rounded-xl text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                  >
                    Decline request
                  </button>
                )}

                {/* Awaiting quote banner */}
                {selected.status === "accepted" && !selected.quoteId && !isArtisan && (
                  <div className="p-3 rounded-xl border border-warning/20 bg-warning/5 flex items-center gap-3">
                    <FileText className="w-4 h-4 text-warning shrink-0" strokeWidth={1} />
                    <p className="text-sm text-foreground">Waiting for the artisan to send a quote. Accept it to lock in the price before work begins.</p>
                  </div>
                )}

                {/* Confirm completion — both parties confirm work is done */}
                {(selected.status === "accepted" || selected.status === "in_progress") && !!selected.quoteId && (() => {
                  const myApproved = isArtisan ? selected.artisanEndApproved : selected.clientEndApproved;
                  const otherApproved = isArtisan ? selected.clientEndApproved : selected.artisanEndApproved;
                  const otherLabel = isArtisan ? "client" : "artisan";

                  if (myApproved && !otherApproved) {
                    return (
                      <div className="p-3 rounded-xl border border-success/20 bg-success/5 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-success shrink-0" />
                        <p className="text-sm text-foreground">
                          Waiting for the {otherLabel} to confirm completion.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2 p-3 rounded-xl border border-success/20 bg-success/5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">Complete the job</span>
                        <span className="text-muted-foreground">Both parties must confirm</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isArtisan
                          ? "Confirm completion once the work is done and the client has signed off."
                          : "Confirm completion once the artisan has finished and you're satisfied with the work."}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-1.5 ${selected.clientEndApproved ? "text-success" : "text-muted-foreground"}`}>
                          {selected.clientEndApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          Client {selected.clientEndApproved ? "approved" : "pending"}
                        </div>
                        <div className={`flex items-center gap-1.5 ${selected.artisanEndApproved ? "text-success" : "text-muted-foreground"}`}>
                          {selected.artisanEndApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          Artisan {selected.artisanEndApproved ? "approved" : "pending"}
                        </div>
                      </div>
                      <button
                        onClick={() => setActionModal("approve-end")}
                        disabled={statusUpdating}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-success text-success-foreground hover:bg-success/90 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" strokeWidth={1} />
                        Confirm completion
                      </button>
                    </div>
                  );
                })()}

                {/* Cancel — for pending or accepted */}
                {(selected.status === "pending" || selected.status === "accepted") && (
                  <button
                    onClick={() => setActionModal("cancel")}
                    disabled={statusUpdating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" strokeWidth={1} />
                    Cancel job
                  </button>
                )}

                {selected.status !== "pending" && selected.status !== "cancelled" && (
                  <button
                    onClick={() => {
                      setDisputeReason("");
                      setShowDispute(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" strokeWidth={1} />
                    Raise a Dispute
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDispute && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowDispute(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" strokeWidth={1} />
                Raise a Dispute
              </h3>
              <button onClick={() => setShowDispute(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Our team will review this dispute and reach out to both parties within 48 hours.
              </p>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Describe the issue</label>
                <textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  maxLength={2000}
                  rows={5}
                  placeholder="What happened? Include dates, amounts, and any relevant context."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">{disputeReason.length}/2000</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDispute(false)}
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80"
                >
                  Cancel
                </button>
                <button
                  disabled={disputeSubmitting || !disputeReason.trim()}
                  onClick={async () => {
                    if (!disputeReason.trim()) return;
                    setDisputeSubmitting(true);
                    try {
                      await apiPost("/disputes", {
                        type: "job",
                        jobId: selected._id,
                        reason: disputeReason.trim(),
                      });
                      toast.success("Dispute submitted. Our team will review it.");
                      setShowDispute(false);
                      setDisputeReason("");
                    } catch (err) {
                      const msg = err instanceof Error ? err.message : "Failed to submit dispute";
                      toast.error(msg);
                    } finally {
                      setDisputeSubmitting(false);
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                >
                  {disputeSubmitting ? "Submitting..." : "Submit Dispute"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showReschedule && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowReschedule(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-primary" strokeWidth={1} />
                Reschedule Appointment
              </h3>
              <button onClick={() => setShowReschedule(false)} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Current date: <span className="font-medium text-foreground">{selected.appointmentDate ? fmtDate(selected.appointmentDate) : "Not set"}</span>
              </p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Reason for rescheduling *</label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="e.g. Materials won't arrive until next week..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
              <button
                onClick={handleReschedule}
                disabled={rescheduleSubmitting || !rescheduleDate || !rescheduleReason.trim()}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {rescheduleSubmitting ? "Rescheduling..." : "Confirm Reschedule"}
              </button>
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

      {/* ─── Job action confirmation modals ─── */}
      {/* Reject (artisan) */}
      <JobActionModal
        open={actionModal === "reject" && !!selected}
        onClose={() => setActionModal(null)}
        onConfirm={({ reason }) => {
          if (selected) performAction(selected._id, "reject", "Job declined", { reason });
        }}
        title="Decline this request"
        description="The client will be notified. They&apos;ll see your reason."
        icon={XCircle}
        tone="destructive"
        confirmLabel="Decline"
        reasonLabel="Why are you declining?"
        reasonPlaceholder="e.g. Fully booked this week / outside my service area / scope unclear…"
        reasonRequired
        loading={statusUpdating}
      />

      {/* Approve end */}
      <JobActionModal
        open={actionModal === "approve-end" && !!selected}
        onClose={() => setActionModal(null)}
        onConfirm={() => {
          if (selected) performAction(selected._id, "approve-end", "End approved");
        }}
        title="Confirm completion"
        description={
          isArtisan ? (
            <>
              Confirm the work is <strong className="text-foreground">done</strong>. Once the client also confirms, the job is marked complete and payment is automatically released to your wallet.
            </>
          ) : (
            <>
              Confirm the work is <strong className="text-foreground">done and you&apos;re satisfied</strong>. Once the artisan also confirms, the job is marked complete and payment is automatically released to them.
            </>
          )
        }
        icon={CheckCircle2}
        tone="success"
        confirmLabel={isArtisan ? "Yes, work is done" : "Yes, mark complete"}
        loading={statusUpdating}
      />

      {/* Cancel */}
      <JobActionModal
        open={actionModal === "cancel" && !!selected}
        onClose={() => setActionModal(null)}
        onConfirm={({ reason }) => {
          if (selected) performAction(selected._id, "cancel", "Job cancelled", { reason });
        }}
        title="Cancel this job"
        description="The other party will be notified and they&apos;ll see your reason."
        icon={XCircle}
        tone="destructive"
        confirmLabel="Cancel job"
        cancelLabel="Keep job"
        reasonLabel="Why are you cancelling?"
        reasonPlaceholder={
          isArtisan
            ? "e.g. Emergency came up / scope changed / client unresponsive…"
            : "e.g. Plans changed / found a different artisan / scope changed…"
        }
        reasonRequired
        hint={
          <span>
            <strong className="text-foreground">If there&apos;s a disagreement</strong>, raise a dispute
            instead so admin can mediate. Cancelling ends the engagement entirely.
          </span>
        }
        loading={statusUpdating}
      />

      {/* Quote Modal */}
      {quoteModal && selected && (
        <QuoteModal
          jobId={selected._id}
          jobTitle={selected.title}
          clientName={selected.clientId?.fullName}
          artisanName={selected.artisanId?.fullName}
          artisanAvatarUrl={resolveAssetUrl(selected.artisanId?.avatarUrl || "")}
          role={isArtisan ? "artisan" : "client"}
          existingQuote={
            quoteModalId
              ? (quotes.find((q) => q._id === quoteModalId) ?? null)
              : (quotes.find((q) => ["sent", "rejected"].includes(q.status)) ?? null)
          }
          onClose={() => { setQuoteModal(false); setQuoteModalId(null); }}
          onSuccess={() => {
            setQuoteModal(false);
            setQuoteModalId(null);
            fetchJobs(pagination.page);
            fetchQuotes(selected._id);
          }}
          onAccepted={(jobId) => {
            setQuoteModal(false);
            setQuoteModalId(null);
            handlePay(jobId);
          }}
        />
      )}
    </div>
  );
}
