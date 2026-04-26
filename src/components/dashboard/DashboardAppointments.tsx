"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { resolveAssetUrl } from "@/types/api";
import {
  Calendar,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { JobActionModal } from "@/components/dashboard/JobActionModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface ProfileInfo {
  _id: string;
  fullName: string;
  avatarUrl: string | null;
  city: string;
}

interface ScheduledJob {
  _id: string;
  clientId: ProfileInfo;
  artisanId: ProfileInfo;
  title: string;
  description?: string;
  scheduledDate?: string;
  appointmentDate?: string;
  city?: string;
  state?: string;
  location?: string;
  bookingType: "urgent" | "scheduled";
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  dailyRate?: number;
}

interface Pagination { page: number; limit: number; total: number; pages: number; }

const STATUS_CFG = {
  pending: { label: "Awaiting response", color: "bg-warning/10 text-warning" },
  accepted: { label: "Confirmed", color: "bg-primary/10 text-primary" },
  in_progress: { label: "In progress", color: "bg-accent/10 text-accent" },
  completed: { label: "Completed", color: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive" },
} as const;

export default function DashboardAppointments() {
  const { profile } = useAuth();
  const router = useRouter();
  const isArtisan = profile?.role === "artisan";

  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");
  const [updating, setUpdating] = useState(false);

  // Action modal — replaces native confirm() dialogs
  const [actionModal, setActionModal] = useState<
    { kind: "accept" | "reject" | "cancel"; job: ScheduledJob } | null
  >(null);

  const fetchJobs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          bookingType: "scheduled",
        });
        if (filter !== "all" && filter !== "upcoming") params.set("status", filter);
        const data = await apiGet<{
          data: { jobs: ScheduledJob[] };
          pagination: Pagination;
        }>(`/jobs?${params}`);
        let list = data.data?.jobs || [];
        if (filter === "upcoming") {
          const now = Date.now();
          list = list.filter(
            (j) =>
              ["pending", "accepted"].includes(j.status) &&
              (!j.scheduledDate || new Date(j.scheduledDate).getTime() >= now - 24 * 60 * 60 * 1000)
          );
        }
        setJobs(list);
        setPagination(data.pagination);
      } catch {
        toast.error("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const action = async (
    id: string,
    act: "accept" | "reject" | "cancel" | "approve-start" | "approve-end",
    successMsg: string,
    body: Record<string, unknown> = {}
  ) => {
    setUpdating(true);
    try {
      const res = await apiPost<{ message?: string }>(`/jobs/${id}/${act}`, body);
      toast.success(res.message || successMsg);
      fetchJobs(pagination.page);
      setActionModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setUpdating(false);
    }
  };

  const fmtDate = (s?: string) =>
    s
      ? new Date(s).toLocaleDateString("en-NG", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  if (loading && !jobs.length) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-elevated p-4 flex items-center gap-4">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Appointments</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isArtisan
            ? "Job bookings clients have scheduled with you for a future date."
            : "Your scheduled job bookings (the ones you booked for later)."}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: "upcoming", label: "Upcoming" },
            { id: "pending", label: "Awaiting response" },
            { id: "accepted", label: "Confirmed" },
            { id: "completed", label: "Completed" },
            { id: "cancelled", label: "Cancelled" },
            { id: "all", label: "All" },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-foreground">No scheduled jobs</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            {isArtisan
              ? "When clients book you for a specific future date, they show up here."
              : "Booked-for-later jobs appear here. Hire an artisan and pick a date to start."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((j) => {
            const cfg = STATUS_CFG[j.status];
            const counterparty = isArtisan ? j.clientId : j.artisanId;
            const date = j.scheduledDate || j.appointmentDate;
            return (
              <li
                key={j._id}
                className="card-elevated p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex items-center gap-3 sm:w-64 shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={resolveAssetUrl(counterparty?.avatarUrl) || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {counterparty?.fullName?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{j.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {isArtisan ? "From" : "With"} {counterparty?.fullName || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {fmtDate(date)}
                  </div>
                  {(j.city || j.state) && (
                    <div className="flex items-center gap-1.5 text-muted-foreground truncate">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      {[j.city, j.state].filter(Boolean).join(", ")}
                    </div>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                  <button
                    onClick={() => router.push(`/dashboard/jobs?id=${j._id}`)}
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    View
                  </button>

                  {isArtisan && j.status === "pending" && (
                    <>
                      <button
                        onClick={() => setActionModal({ kind: "accept", job: j })}
                        disabled={updating}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => setActionModal({ kind: "reject", job: j })}
                        disabled={updating}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {(j.status === "pending" || j.status === "accepted") && (
                    <button
                      onClick={() => setActionModal({ kind: "cancel", job: j })}
                      disabled={updating}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                      title="Cancel"
                    >
                      <XCircle className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {pagination.total} appointment{pagination.total === 1 ? "" : "s"} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchJobs(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => fetchJobs(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Action confirmation modals */}
      <JobActionModal
        open={actionModal?.kind === "accept"}
        onClose={() => setActionModal(null)}
        onConfirm={() =>
          actionModal && action(actionModal.job._id, "accept", "Accepted")
        }
        title="Accept this booking"
        description={
          <>
            By accepting, you commit to the booking. Use chat to confirm scope and any prerequisites
            with the client before the start date.
          </>
        }
        icon={CheckCircle2}
        tone="primary"
        confirmLabel="Accept booking"
        agreementLabel={<>I&apos;ve discussed scope and timing with the client and we&apos;ve agreed.</>}
        loading={updating}
      />

      <JobActionModal
        open={actionModal?.kind === "reject"}
        onClose={() => setActionModal(null)}
        onConfirm={({ reason }) =>
          actionModal && action(actionModal.job._id, "reject", "Declined", { reason })
        }
        title="Decline this booking"
        description="The client will be notified and they'll see your reason."
        icon={XCircle}
        tone="destructive"
        confirmLabel="Decline"
        reasonLabel="Why are you declining?"
        reasonPlaceholder="e.g. Booked on that date / outside my service area / scope unclear…"
        reasonRequired
        loading={updating}
      />

      <JobActionModal
        open={actionModal?.kind === "cancel"}
        onClose={() => setActionModal(null)}
        onConfirm={({ reason }) =>
          actionModal && action(actionModal.job._id, "cancel", "Cancelled", { reason })
        }
        title="Cancel this booking"
        description="The other party will be notified and they'll see your reason."
        icon={XCircle}
        tone="destructive"
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
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
            instead so admin can mediate.
          </span>
        }
        loading={updating}
      />
    </div>
  );
}
