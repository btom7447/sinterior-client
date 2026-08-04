"use client";

/**
 * What buyers looked for, and what they did not find.
 *
 * `GET /search/gaps` has existed, admin-only, with no caller. It answers the
 * one merchandising question a marketplace actually has: which searches come
 * back empty. Every one of those is somebody who arrived wanting to spend money
 * and left — and the fix is not a design change, it is recruiting a supplier who
 * sells the thing.
 *
 * Empty searches lead. The popular list is underneath for context, because a
 * term searched twice and never found matters less than one searched two
 * hundred times.
 */
import { useEffect, useState } from "react";
import { SearchX, TrendingUp } from "lucide-react";
import { apiGet } from "@/lib/apiClient";
import { Skeleton } from "@/components/ui/skeleton";

interface Term {
  term: string;
  count: number;
  emptyCount?: number;
  lastSearchedAt?: string;
}

export function SearchDemand() {
  const [gaps, setGaps] = useState<Term[]>([]);
  const [popular, setPopular] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    apiGet<{ data: { gaps: Term[]; popular: Term[] } }>("/search/gaps?limit=20")
      .then((res) => {
        setGaps(res.data.gaps ?? []);
        setPopular(res.data.popular ?? []);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card-elevated p-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (failed) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center gap-2">
          <SearchX strokeWidth={1.5} className="w-5 h-5 text-amber-600" />
          <h2 className="font-display font-semibold text-foreground">Searched, found nothing</h2>
        </div>

        {gaps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Every search so far has returned something.
          </p>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">
              Demand with nobody selling into it. Each is a supplier worth recruiting.
            </p>
            <ul className="space-y-2">
              {gaps.map((t) => (
                <li
                  key={t.term}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5"
                >
                  <span className="text-sm font-medium text-foreground">{t.term}</span>
                  <span className="text-xs text-amber-600 font-medium">
                    {t.emptyCount} empty
                    {t.count > (t.emptyCount ?? 0) && (
                      <span className="text-muted-foreground"> of {t.count}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="card-elevated p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp strokeWidth={1.5} className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-foreground">Most searched</h2>
        </div>

        {popular.length === 0 ? (
          <p className="text-sm text-muted-foreground">No searches recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {popular.map((t) => (
              <li
                key={t.term}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-2.5"
              >
                <span className="text-sm font-medium text-foreground">{t.term}</span>
                <span className="text-xs text-muted-foreground">
                  {t.count}
                  {/* A popular term that often comes back empty is the most
                      urgent thing on either list. */}
                  {!!t.emptyCount && t.emptyCount > 0 && (
                    <span className="text-amber-600"> · {t.emptyCount} empty</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
