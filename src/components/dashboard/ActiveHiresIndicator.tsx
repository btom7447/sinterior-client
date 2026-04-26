"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Wrench, Briefcase, ArrowRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiGet } from "@/lib/apiClient";

interface ActiveJob {
  _id: string;
  title: string;
  bookingType?: "urgent" | "scheduled";
  role: "artisan" | "client";
  counterparty?: { fullName?: string; avatarUrl?: string | null };
  startedAt: string | null;
  dailyRate: number;
  daysRunning: number;
  costSoFar: number;
}

interface ActiveJobsResponse {
  data: { jobs: ActiveJob[]; total: number; totalCostSoFar: number };
}

const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const POLL_MS = 60_000; // refresh every minute so the day count stays current

export function ActiveHiresIndicator() {
  const [jobs, setJobs] = useState<ActiveJob[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchJobs = async () => {
      try {
        const res = await apiGet<ActiveJobsResponse>("/jobs/active");
        if (!cancelled) {
          setJobs(res.data.jobs);
          setLoaded(true);
        }
      } catch {
        // Silent — user might not be signed in yet.
        if (!cancelled) setLoaded(true);
      }
    };

    fetchJobs();
    const id = setInterval(fetchJobs, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Hide entirely when there are no active hires — keeps the header uncluttered.
  if (!loaded || jobs.length === 0) return null;

  const totalCost = jobs.reduce((sum, j) => sum + j.costSoFar, 0);
  // Earnings (artisan side) and Spending (client side) split — we surface
  // whichever is non-zero in the pill so the user knows what they're tracking.
  const artisanJobs = jobs.filter((j) => j.role === "artisan");
  const clientJobs = jobs.filter((j) => j.role === "client");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex items-center gap-2 px-3 h-9 rounded-full bg-success/10 text-success hover:bg-success/15 transition-colors text-sm font-medium"
          title={`${jobs.length} active hire${jobs.length === 1 ? "" : "s"}`}
        >
          <Activity className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">
            {jobs.length} active {jobs.length === 1 ? "hire" : "hires"}
          </span>
          <span className="sm:hidden">{jobs.length}</span>
          <span className="hidden md:inline text-xs opacity-70">·</span>
          <span className="hidden md:inline text-xs">{fmt(totalCost)}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="p-3 border-b border-border">
          <p className="text-sm font-display font-semibold text-foreground">
            Active hires
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {jobs.length} {jobs.length === 1 ? "job" : "jobs"} in progress · running total{" "}
            <span className="text-foreground font-medium">{fmt(totalCost)}</span>
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {/* Group by perspective when both sides are present */}
          {artisanJobs.length > 0 && (
            <Section
              label="As artisan (earning)"
              icon={Wrench}
              jobs={artisanJobs}
              tone="success"
            />
          )}
          {clientJobs.length > 0 && (
            <Section
              label="As client (paying)"
              icon={Briefcase}
              jobs={clientJobs}
              tone="primary"
            />
          )}
        </div>

        <Link
          href="/dashboard/jobs"
          className="block p-3 border-t border-border text-center text-sm font-medium text-primary hover:bg-secondary transition-colors"
        >
          View all jobs <ArrowRight className="w-3.5 h-3.5 inline-block ml-1" />
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Section({
  label,
  icon: Icon,
  jobs,
  tone,
}: {
  label: string;
  icon: React.ElementType;
  jobs: ActiveJob[];
  tone: "success" | "primary";
}) {
  const dotCls = tone === "success" ? "text-success" : "text-primary";

  return (
    <div>
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <ul>
        {jobs.map((j) => (
          <li key={j._id}>
            <Link
              href={`/dashboard/jobs?as=${j.role}`}
              className="block px-3 py-2.5 hover:bg-secondary transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {j.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    with {j.counterparty?.fullName || "—"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${dotCls}`}>
                    Day {j.daysRunning}
                  </p>
                  <p className="text-xs text-muted-foreground">{fmt(j.costSoFar)}</p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
