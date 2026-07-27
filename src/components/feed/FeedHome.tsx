"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFeed } from "@/hooks/usePins";
import { useTaxonomy } from "@/hooks/usePins";
import MasonryFeed from "./MasonryFeed";
import FilterChips from "./FilterChips";
import BoardPickerDialog from "./BoardPickerDialog";
import type { FeedFilters, FeedResponse, Pin } from "@/types/pins";

interface FeedHomeProps {
  /** Server-rendered first page (unfiltered) — hydrates without a fetch flash. */
  initialPage: FeedResponse["data"] | null;
  /** Route the feed lives at — filter state is written to this path's URL. */
  basePath?: string;
}

const FeedHome = ({ initialPage, basePath = "/feed" }: FeedHomeProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [savingPin, setSavingPin] = useState<Pin | null>(null);

  const filters: FeedFilters = useMemo(
    () => ({
      trade: searchParams.get("trade") ?? undefined,
      room: searchParams.get("room") ?? undefined,
      budgetBand: searchParams.get("budgetBand") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
    }),
    [searchParams]
  );
  const hasFilters = Object.values(filters).some(Boolean);

  const { data: taxonomy } = useTaxonomy();
  const feed = useFeed(filters, hasFilters ? undefined : initialPage ?? undefined);

  const pins = useMemo(
    () => feed.data?.pages.flatMap((p) => p.pins) ?? [],
    [feed.data]
  );

  const setFilters = useCallback(
    (next: FeedFilters) => {
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) if (v) params.set(k, v);
      router.replace(params.size ? `${basePath}?${params}` : basePath, { scroll: false });
    },
    [router, basePath]
  );

  const onEndReached = useCallback(() => {
    if (feed.hasNextPage && !feed.isFetchingNextPage) feed.fetchNextPage();
  }, [feed]);

  return (
    <div className="mx-auto max-w-400 px-4 pb-16 pt-4 sm:px-6">
      <FilterChips filters={filters} onChange={setFilters} />

      <div className="mt-4">
        {feed.isLoading ? (
          <FeedSkeleton />
        ) : pins.length === 0 ? (
          <div className="grid place-items-center py-24 text-center">
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Nothing here yet — try widening your filters."
                : "The feed is warming up. Check back shortly."}
            </p>
          </div>
        ) : (
          <MasonryFeed
            pins={pins}
            bands={taxonomy?.budgetBands}
            onSave={setSavingPin}
            onEndReached={onEndReached}
            loadingMore={feed.isFetchingNextPage}
          />
        )}
      </div>

      <BoardPickerDialog pin={savingPin} onClose={() => setSavingPin(null)} />
    </div>
  );
};

/** Aspect-varied placeholder cells so even loading looks like a feed. */
const FeedSkeleton = () => (
  <div className="flex items-start gap-4">
    {Array.from({ length: 4 }).map((_, col) => (
      <div key={col} className="min-w-0 flex-1 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-secondary"
            style={{ aspectRatio: [0.75, 1.1, 0.85][(col + i) % 3] }}
          />
        ))}
      </div>
    ))}
  </div>
);

export default FeedHome;
