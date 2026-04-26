"use client";

import { Skeleton } from "@/components/ui/skeleton";

export interface Metric {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}

const TONE_CLASS: Record<NonNullable<Metric["tone"]>, string> = {
  default: "text-foreground",
  success: "text-green-600",
  warning: "text-amber-600",
  danger: "text-destructive",
  info: "text-primary",
};

interface MetricStripProps {
  metrics: Metric[] | null;
  loading?: boolean;
  columns?: 2 | 3 | 4 | 5 | 6;
}

const COL_CLASS: Record<NonNullable<MetricStripProps["columns"]>, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

export function MetricStrip({ metrics, loading, columns = 5 }: MetricStripProps) {
  if (loading || !metrics) {
    return (
      <div className={`grid ${COL_CLASS[columns]} gap-3`}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid ${COL_CLASS[columns]} gap-3`}>
      {metrics.map((m) => (
        <div key={m.label} className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{m.label}</p>
          <p className={`text-2xl font-bold mt-1 ${TONE_CLASS[m.tone || "default"]}`}>{m.value}</p>
          {m.hint && <p className="text-xs text-muted-foreground mt-0.5">{m.hint}</p>}
        </div>
      ))}
    </div>
  );
}
