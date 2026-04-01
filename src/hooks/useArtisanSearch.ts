"use client";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/apiClient";
import { type ApiArtisan, type Pagination } from "@/types/api";

export type { ApiArtisan };

interface UseArtisanSearchOptions {
  latitude: number | null;
  longitude: number | null;
  radiusKm?: number;
  category?: string | null;
  search?: string;
  limit?: number;
  enabled?: boolean;
}

export const useArtisanSearch = ({
  latitude,
  longitude,
  radiusKm = 50,
  category = null,
  search,
  limit = 20,
  enabled = true,
}: UseArtisanSearchOptions) => {
  return useQuery({
    queryKey: ["artisans", latitude, longitude, radiusKm, category, search, limit],
    queryFn: async (): Promise<ApiArtisan[]> => {
      const params = new URLSearchParams();
      params.set("limit", String(limit));
      if (category) params.set("category", category);
      if (search) params.set("search", search);

      // Use geo endpoint if coordinates available
      if (latitude && longitude) {
        params.set("lat", String(latitude));
        params.set("lng", String(longitude));
        params.set("radiusKm", String(radiusKm));
        const res = await apiGet<{ data: ApiArtisan[]; pagination: Pagination }>(
          `/artisans/nearby?${params.toString()}`
        );
        return res.data;
      }

      // General list (no geo)
      const res = await apiGet<{ data: ApiArtisan[]; pagination: Pagination }>(
        `/artisans?${params.toString()}`
      );
      return res.data;
    },
    enabled,
    staleTime: 60000,
  });
};
