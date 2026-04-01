"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { Heart, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";

interface Bookmark {
  _id: string;
  artisanId: { _id: string; fullName: string; avatarUrl: string | null; city: string; state: string };
  createdAt: string;
}

interface Pagination { page: number; limit: number; total: number; pages: number; }

export default function DashboardSaved() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: { bookmarks: Bookmark[] }; pagination: Pagination }>(`/bookmarks?page=${page}&limit=10`);
      setBookmarks(data.data?.bookmarks || []);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load saved artisans"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

  const removeSaved = async (artisanId: string) => {
    try {
      await apiPost("/bookmarks/toggle", { artisanId });
      toast.success("Removed from saved");
      fetchBookmarks(pagination.page);
    } catch { toast.error("Failed to remove"); }
  };

  if (loading && !bookmarks.length) return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-40" /><Skeleton className="h-4 w-48 mt-2" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="card-elevated p-4 space-y-3">
            <div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-20" /></div></div>
            <div className="flex gap-2 pt-3 border-t border-border"><Skeleton className="h-8 flex-1 rounded-lg" /><Skeleton className="h-8 w-10 rounded-lg" /></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Saved Artisans</h1>
        <p className="text-muted-foreground text-sm mt-1">Artisans you&apos;ve bookmarked</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Heart className="w-12 h-12 text-muted-foreground/40 mb-3" strokeWidth={1} />
          <p className="text-muted-foreground">No saved artisans yet</p>
          <Link href="/artisan" className="text-primary text-sm mt-2 hover:underline">Browse artisans</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bm) => (
            <div key={bm._id} className="card-elevated p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={bm.artisanId?.avatarUrl || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{bm.artisanId?.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{bm.artisanId?.fullName}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" strokeWidth={1} />
                    <span>{bm.artisanId?.city}{bm.artisanId?.state ? `, ${bm.artisanId.state}` : ""}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Link href={`/artisan/${bm.artisanId?._id}`} className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  View Profile
                </Link>
                <button onClick={() => removeSaved(bm.artisanId?._id)} className="py-1.5 px-3 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                  <Heart className="w-3 h-3 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchBookmarks(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchBookmarks(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
