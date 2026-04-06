"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { resolveAssetUrl } from "@/types/api";
import { Calendar, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Profile { _id: string; fullName: string; avatarUrl: string | null; city: string; }

interface Appointment {
  _id: string;
  clientId: Profile;
  artisanId: Profile;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  createdAt: string;
}

interface Pagination { page: number; limit: number; total: number; pages: number; }

const STATUS_CFG = {
  scheduled: { label: "Scheduled", color: "bg-primary/10 text-primary" },
  completed: { label: "Completed", color: "bg-success/10 text-success" },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive" },
  no_show: { label: "No Show", color: "bg-warning/10 text-warning" },
};

export default function DashboardAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetch = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (filter === "upcoming") params.set("upcoming", "true");
      else if (filter !== "all") params.set("status", filter);
      const data = await apiGet<{ data: { appointments: Appointment[] }; pagination: Pagination }>(`/appointments?${params}`);
      setAppointments(data.data?.appointments || []);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load appointments"); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateStatus = async (id: string, status: string) => {
    setStatusUpdating(true);
    try {
      await apiPatch(`/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetch(pagination.page);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setStatusUpdating(false); }
  };

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" });

  if (loading && !appointments.length) return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-56 mt-2" /></div>
      <div className="flex gap-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-lg" />)}</div>
      <div className="space-y-3">{[...Array(4)].map((_, i) => (
        <div key={i} className="card-elevated p-4 flex items-center gap-4">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /><div className="flex items-center gap-2"><Skeleton className="w-4 h-4 rounded-full" /><Skeleton className="h-3 w-20" /></div></div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Appointments</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your scheduled appointments</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["all", "upcoming", "scheduled", "completed", "cancelled"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? "All" : s === "upcoming" ? "Upcoming" : STATUS_CFG[s as keyof typeof STATUS_CFG]?.label || s}
          </button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-foreground">{filter === "upcoming" ? "No upcoming appointments" : "No appointments"}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">Scheduled appointments with clients will show up here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const cfg = STATUS_CFG[apt.status];
            return (
              <div key={apt._id} className="card-elevated p-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/5 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">{new Date(apt.date).toLocaleDateString("en-NG", { month: "short" })}</span>
                    <span className="text-lg font-bold text-primary">{new Date(apt.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{apt.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" strokeWidth={1} />
                      <span>{apt.time || fmtDate(apt.date)}</span>
                      {apt.location && <><span>&middot;</span><span className="truncate">{apt.location}</span></>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={resolveAssetUrl(apt.clientId?.avatarUrl || "")} />
                        <AvatarFallback className="text-[8px]">{apt.clientId?.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{apt.clientId?.fullName}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${cfg.color}`}>{cfg.label}</span>
                  </div>
                </div>
                {apt.status === "scheduled" && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button onClick={() => updateStatus(apt._id, "completed")} disabled={statusUpdating} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success hover:bg-success/20 disabled:opacity-50 transition-colors">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </button>
                    <button onClick={() => updateStatus(apt._id, "cancelled")} disabled={statusUpdating} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-50 transition-colors">
                      <XCircle className="w-3 h-3" /> Cancel
                    </button>
                    <button onClick={() => updateStatus(apt._id, "no_show")} disabled={statusUpdating} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-warning/10 text-warning hover:bg-warning/20 disabled:opacity-50 transition-colors">
                      No Show
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetch(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetch(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
