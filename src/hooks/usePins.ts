"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import type { FeedResponse, PinDetailResponse, Taxonomy, FeedFilters, Pin } from "@/types/pins";

const filterQuery = (filters: FeedFilters) => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) if (v) params.set(k, v);
  return params.toString();
};

/** Infinite ranked feed. Anonymous works; personalized automatically when logged in. */
export function useFeed(filters: FeedFilters = {}, initialPage?: FeedResponse["data"]) {
  return useInfiniteQuery({
    queryKey: ["feed", filters],
    queryFn: async ({ pageParam }) => {
      const qs = filterQuery(filters);
      const cursor = pageParam ? `cursor=${encodeURIComponent(pageParam)}` : "";
      const res = await apiGet<FeedResponse>(
        `/pins/feed?limit=24${qs ? `&${qs}` : ""}${cursor ? `&${cursor}` : ""}`
      );
      return res.data;
    },
    initialPageParam: "",
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    // Server-rendered first page (home) hydrates without a refetch flash.
    ...(initialPage
      ? { initialData: { pages: [initialPage], pageParams: [""] } }
      : {}),
    staleTime: 60_000,
  });
}

export function usePin(id: string, initial?: { pin: Pin; savedByMe: boolean }) {
  return useQuery({
    queryKey: ["pin", id],
    queryFn: async () => (await apiGet<PinDetailResponse>(`/pins/${id}`)).data,
    ...(initial ? { initialData: initial } : {}),
    staleTime: 60_000,
  });
}

export function useTaxonomy() {
  return useQuery({
    queryKey: ["pin-taxonomy"],
    queryFn: async () =>
      (await apiGet<{ success: boolean; data: Taxonomy }>("/pins/taxonomy")).data,
    staleTime: Infinity, // code constants server-side — changes only with deploys
  });
}
