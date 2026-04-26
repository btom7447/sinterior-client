"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  Search,
  ShieldCheck,
  Sparkles,
  Bookmark,
  ExternalLink,
  Share2,
  X,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { apiGet } from "@/lib/apiClient";
import { toast } from "sonner";

interface FeedItem {
  kind: "admin" | "portfolio";
  id: string;
  title: string;
  caption: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  posterUrl: string | null;
  linkUrl: string | null;
  tags: string[];
  isFeatured: boolean;
  author: {
    name: string;
    avatarUrl: string | null;
    role: string;
    isVerified?: boolean;
  };
  createdAt: string;
}

const PAGE_SIZE = 40;
const SAVED_KEY = "sintherior:saved-pins";

const getSavedSet = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FeedItem | null>(null);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const skipRef = useRef(0);

  useEffect(() => setSavedSet(getSavedSet()), []);

  const fetchPage = useCallback(async (replace = false) => {
    if (replace) {
      skipRef.current = 0;
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(false);
    try {
      const res = await apiGet<{
        data: { items: FeedItem[]; total: number; hasMore: boolean };
      }>(`/feed?limit=${PAGE_SIZE}&skip=${skipRef.current}`);
      setItems((prev) => (replace ? res.data.items : [...prev, ...res.data.items]));
      skipRef.current += res.data.items.length;
      setHasMore(res.data.hasMore);
    } catch {
      if (replace) setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(true);
  }, [fetchPage]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || loading || error) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPage(false);
        }
      },
      { rootMargin: "400px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [fetchPage, hasMore, loadingMore, loading, error]);

  const allTags = useMemo(
    () => Array.from(new Set(items.flatMap((i) => i.tags || []))).slice(0, 24),
    [items]
  );

  const visible = useMemo(() => {
    let list = items;
    if (activeTag) list = list.filter((i) => i.tags?.includes(activeTag));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          (i.caption || "").toLowerCase().includes(q) ||
          (i.author?.name || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, activeTag, search]);

  const toggleSave = (id: string) => {
    const next = new Set(savedSet);
    if (next.has(id)) {
      next.delete(id);
      toast("Removed from saved pins");
    } else {
      next.add(id);
      toast.success("Saved");
    }
    setSavedSet(next);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // localStorage unavailable — silent
    }
  };

  const sharePin = async (item: FeedItem) => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = {
      title: item.title,
      text: item.caption || item.title,
      url,
    };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Couldn't share");
    }
  };

  return (
    <AppLayout>
      <main className="max-w-[1600px] mx-auto px-3 sm:px-5 py-6">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Feed</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Inspiration from artisans across Nigeria, plus the latest from Sintherior.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pins, artisans, ideas…"
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-secondary/60 border border-transparent focus:bg-card focus:border-border focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-colors"
            />
          </div>
        </div>

        {/* Tag chips */}
        {allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-colors ${
                !activeTag
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap capitalize transition-colors ${
                  activeTag === tag
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Masonry */}
        {error ? (
          <ErrorState
            title="Couldn't load the feed"
            description="We hit a snag fetching feed items. Try again in a moment."
            onRetry={() => fetchPage(true)}
          />
        ) : loading ? (
          <FeedSkeleton />
        ) : visible.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground font-medium">No pins match that search</p>
            <p className="text-muted-foreground text-sm mt-1">
              Try different keywords or clear your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
              {visible.map((item) => (
                <PinCard
                  key={item.id}
                  item={item}
                  saved={savedSet.has(item.id)}
                  onOpen={() => setSelected(item)}
                  onSave={() => toggleSave(item.id)}
                />
              ))}
            </div>
            <div ref={sentinelRef} className="h-12 mt-8" />
            {loadingMore && (
              <div className="text-center py-4 text-sm text-muted-foreground">Loading more…</div>
            )}
            {!hasMore && items.length > PAGE_SIZE && (
              <p className="text-center text-xs text-muted-foreground py-6">
                You&apos;ve reached the end of the feed.
              </p>
            )}
          </>
        )}
      </main>

      {/* Pin Detail Modal */}
      {selected && (
        <PinDetailModal
          item={selected}
          saved={savedSet.has(selected.id)}
          onClose={() => setSelected(null)}
          onSave={() => toggleSave(selected.id)}
          onShare={() => sharePin(selected)}
        />
      )}
    </AppLayout>
  );
}

// ── Pin card (masonry tile) ─────────────────────────────────────────────────

function PinCard({
  item,
  saved,
  onOpen,
  onSave,
}: {
  item: FeedItem;
  saved: boolean;
  onOpen: () => void;
  onSave: () => void;
}) {
  return (
    <div className="break-inside-avoid mb-3 group">
      <button
        onClick={onOpen}
        className="relative block w-full overflow-hidden rounded-2xl bg-secondary text-left focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <PinMedia item={item} aria-hidden />

        {/* Hover overlay (desktop) — darken with action buttons */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {/* Top-right: Save button (intercepts click) */}
          <div className="absolute top-2 right-2 pointer-events-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-colors ${
                saved
                  ? "bg-foreground text-background"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }`}
            >
              {saved ? "Saved" : "Save"}
            </button>
          </div>
          {/* Bottom-left: title preview + visit chip */}
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2 pointer-events-none">
            <p className="text-white text-sm font-medium drop-shadow-md line-clamp-2 max-w-[70%]">
              {item.title}
            </p>
            {item.linkUrl && (
              <span className="pointer-events-none inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 text-foreground text-xs font-medium shadow">
                <ExternalLink className="w-3 h-3" /> Visit
              </span>
            )}
          </div>
        </div>

        {/* Featured badge (always visible) */}
        {item.isFeatured && (
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow">
            <Sparkles className="w-3 h-3" /> Featured
          </span>
        )}

        {/* Video play indicator */}
        {item.mediaType === "video" && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-black/60 text-white text-xs font-medium pointer-events-none">
            <Play className="w-3 h-3 fill-current" /> Video
          </span>
        )}
      </button>

      {/* Below-card meta (Pinterest keeps this minimal) */}
      <div className="px-1 pt-2">
        <p className="font-medium text-foreground text-sm leading-snug line-clamp-2">
          {item.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {item.author.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.author.avatarUrl}
              alt=""
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
              {item.author.name.charAt(0)}
            </div>
          )}
          <span className="text-xs text-muted-foreground truncate">{item.author.name}</span>
          {item.author.isVerified && (
            <ShieldCheck className="w-3 h-3 text-success shrink-0" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Media renderer (image or video) ────────────────────────────────────────

function PinMedia({
  item,
  controls = false,
  autoPlay = false,
  muted = true,
}: {
  item: FeedItem;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  "aria-hidden"?: boolean;
}) {
  if (item.mediaType === "video") {
    return (
      <video
        src={item.mediaUrl}
        poster={item.posterUrl || undefined}
        className="w-full h-auto block"
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        loop={!controls}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.mediaUrl}
      alt={item.title}
      className="w-full h-auto block"
      loading="lazy"
    />
  );
}

// ── Pin detail modal ───────────────────────────────────────────────────────

function PinDetailModal({
  item,
  saved,
  onClose,
  onSave,
  onShare,
}: {
  item: FeedItem;
  saved: boolean;
  onClose: () => void;
  onSave: () => void;
  onShare: () => void;
}) {
  const [muted, setMuted] = useState(true);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-card rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col md:flex-row overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/95 text-foreground shadow flex items-center justify-center hover:bg-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media side */}
        <div className="md:w-1/2 bg-black flex items-center justify-center relative">
          {item.mediaType === "video" ? (
            <>
              <video
                src={item.mediaUrl}
                poster={item.posterUrl || undefined}
                className="w-full max-h-[60vh] md:max-h-[92vh] object-contain"
                controls
                autoPlay
                muted={muted}
                playsInline
              />
              <button
                onClick={() => setMuted((m) => !m)}
                className="absolute bottom-3 left-3 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.mediaUrl}
              alt={item.title}
              className="w-full max-h-[60vh] md:max-h-[92vh] object-contain"
            />
          )}
        </div>

        {/* Detail side */}
        <div className="md:w-1/2 flex flex-col p-6 overflow-y-auto">
          {/* Action row */}
          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={onSave}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                saved
                  ? "bg-foreground text-background"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }`}
            >
              <Bookmark
                className={`w-4 h-4 inline-block mr-1.5 ${saved ? "fill-current" : ""}`}
              />
              {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={onShare}
              className="px-3 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-sm font-medium transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {item.linkUrl && (
              <Link
                href={item.linkUrl}
                className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Visit <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Featured pill */}
          {item.isFeatured && (
            <span className="self-start inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}

          {/* Title + caption */}
          <h2 className="font-display text-2xl font-bold text-foreground leading-tight">
            {item.title}
          </h2>
          {item.caption && (
            <p className="text-muted-foreground mt-3 leading-relaxed whitespace-pre-wrap">
              {item.caption}
            </p>
          )}

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-xs capitalize"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="mt-auto pt-6 border-t border-border flex items-center gap-3">
            {item.author.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.author.avatarUrl}
                alt={item.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {item.author.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-medium text-foreground truncate">{item.author.name}</p>
                {item.author.isVerified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-success shrink-0" strokeWidth={1.5} />
                )}
              </div>
              <p className="text-xs text-muted-foreground capitalize">{item.author.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ────────────────────────────────────────────────────────────────

function FeedSkeleton() {
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3">
      {Array.from({ length: 16 }).map((_, i) => (
        <div key={i} className="break-inside-avoid mb-3">
          <Skeleton
            className="w-full rounded-2xl"
            style={{ height: `${160 + (i % 4) * 80}px` }}
          />
          <Skeleton className="h-3 w-3/4 mt-2 ml-1" />
          <Skeleton className="h-3 w-1/2 mt-1.5 ml-1" />
        </div>
      ))}
    </div>
  );
}
