"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Pin, BudgetBand } from "@/types/pins";
import PinCard from "./PinCard";

interface MasonryFeedProps {
  pins: Pin[];
  bands?: BudgetBand[];
  onSave: (pin: Pin) => void;
  onEndReached?: () => void;
  loadingMore?: boolean;
}

/**
 * True masonry: pins are dealt into the currently-shortest column using the
 * server-stored aspect ratio, so order stays top-heavy and stable across
 * infinite-scroll appends (CSS columns would reflow earlier pins into new
 * positions every page). Heights are known before images load — zero CLS.
 */
const COL_META_COST = 0.28; // approximate title+author block, in column-width units

const useColumnCount = () => {
  const [cols, setCols] = useState(2);
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setCols(w >= 1536 ? 5 : w >= 1024 ? 4 : w >= 640 ? 3 : 2);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return cols;
};

const MasonryFeed = ({ pins, bands, onSave, onEndReached, loadingMore }: MasonryFeedProps) => {
  const cols = useColumnCount();
  const sentinelRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(() => {
    const buckets: Pin[][] = Array.from({ length: cols }, () => []);
    const heights = new Array(cols).fill(0);
    for (const pin of pins) {
      const shortest = heights.indexOf(Math.min(...heights));
      buckets[shortest].push(pin);
      heights[shortest] += 1 / (pin.aspectRatio || 1) + COL_META_COST;
    }
    return buckets;
  }, [pins, cols]);

  useEffect(() => {
    if (!onEndReached || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && onEndReached(),
      { rootMargin: "1200px" } // fetch well before the user hits the floor
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onEndReached]);

  return (
    <>
      <div className="flex items-start gap-4">
        {columns.map((column, i) => (
          <div key={i} className="min-w-0 flex-1">
            {column.map((pin) => (
              <PinCard key={pin._id} pin={pin} bands={bands} onSave={onSave} />
            ))}
          </div>
        ))}
      </div>
      <div ref={sentinelRef} className="h-px" />
      {loadingMore && (
        <div className="grid place-items-center py-8">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </>
  );
};

export default MasonryFeed;
