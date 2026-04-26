"use client";

import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this right now. Try again in a moment.",
  onRetry,
  retrying = false,
  secondaryLabel,
  onSecondary,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-destructive" strokeWidth={1.5} />
      </div>
      <p className="font-display text-lg font-semibold text-foreground">{title}</p>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        {onRetry && (
          <Button onClick={onRetry} disabled={retrying} className="rounded-xl gap-1.5">
            <RefreshCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} strokeWidth={1} />
            {retrying ? "Retrying…" : "Try again"}
          </Button>
        )}
        {secondaryLabel && onSecondary && (
          <Button variant="outline" onClick={onSecondary} className="rounded-xl gap-1.5">
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
