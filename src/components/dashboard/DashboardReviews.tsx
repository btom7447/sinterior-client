"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/apiClient";
import { resolveAssetUrl } from "@/types/api";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Review {
  _id: string;
  reviewerId: { _id: string; fullName: string; avatarUrl: string | null };
  rating: number;
  comment?: string;
  createdAt: string;
}

interface Pagination { page: number; limit: number; total: number; pages: number; }

export default function DashboardReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: { reviews: Review[] }; pagination: Pagination }>(`/reviews/me?page=${page}&limit=10`);
      setReviews(data.data?.reviews || []);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load reviews"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  if (loading && !reviews.length) return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-28" /><Skeleton className="h-4 w-52 mt-2" /></div>
      <div className="card-elevated p-6 flex items-center gap-6">
        <div className="text-center space-y-2"><Skeleton className="h-10 w-12 mx-auto" /><div className="flex gap-0.5 justify-center">{[...Array(5)].map((_, i) => <Skeleton key={i} className="w-4 h-4 rounded" />)}</div><Skeleton className="h-3 w-16 mx-auto" /></div>
      </div>
      <div className="space-y-3">{[...Array(4)].map((_, i) => (
        <div key={i} className="card-elevated p-4 flex items-start gap-3">
          <Skeleton className="w-9 h-9 rounded-full" />
          <div className="flex-1 space-y-2"><div className="flex justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-16" /></div><div className="flex gap-0.5">{[...Array(5)].map((_, j) => <Skeleton key={j} className="w-3.5 h-3.5 rounded" />)}</div><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div>
        </div>
      ))}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-muted-foreground text-sm mt-1">See what clients say about your work</p>
      </div>

      {/* Summary */}
      <div className="card-elevated p-6 flex items-center gap-6">
        <div className="text-center">
          <p className="font-display text-4xl font-bold text-foreground">{avgRating}</p>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? "text-warning fill-warning" : "text-muted-foreground/30"}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{pagination.total} review{pagination.total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-foreground">No reviews yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">Reviews from clients will appear here after you complete jobs</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review._id} className="card-elevated p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={resolveAssetUrl(review.reviewerId?.avatarUrl || "")} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{review.reviewerId?.fullName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{review.reviewerId?.fullName}</p>
                    <span className="text-xs text-muted-foreground">{fmtDate(review.createdAt)}</span>
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? "text-warning fill-warning" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchReviews(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchReviews(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
