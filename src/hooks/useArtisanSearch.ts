"use client";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ArtisanSearchResult {
  id: string;
  profile_id: string;
  full_name: string;
  avatar_url: string | null;
  skill: string;
  skill_category: string;
  city: string;
  state: string;
  price_per_day: number | null;
  currency: string | null;
  is_verified: boolean | null;
  completed_jobs: number | null;
  rating: number | null;
  review_count: number | null;
  distance_km: number | null;
}

const mockArtisans: ArtisanSearchResult[] = [
  { id: "1", profile_id: "1", full_name: "Emmanuel Okonkwo", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", skill: "Master Electrician", skill_category: "electrical", city: "Lagos", state: "Lagos", price_per_day: 15000, currency: "NGN", is_verified: true, completed_jobs: 234, rating: 4.9, review_count: 127, distance_km: 2.5 },
  { id: "2", profile_id: "2", full_name: "Chidinma Eze", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", skill: "Interior Painter", skill_category: "painting", city: "Lagos", state: "Lagos", price_per_day: 12000, currency: "NGN", is_verified: true, completed_jobs: 156, rating: 4.8, review_count: 89, distance_km: 5.1 },
  { id: "3", profile_id: "3", full_name: "Adebayo Johnson", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", skill: "Plumbing Expert", skill_category: "plumbing", city: "Lagos", state: "Lagos", price_per_day: 18000, currency: "NGN", is_verified: true, completed_jobs: 312, rating: 4.7, review_count: 156, distance_km: 8.3 },
  { id: "4", profile_id: "4", full_name: "Ngozi Amadi", avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", skill: "Tile & Floor Specialist", skill_category: "tiling", city: "Lagos", state: "Lagos", price_per_day: 20000, currency: "NGN", is_verified: true, completed_jobs: 89, rating: 5.0, review_count: 64, distance_km: 12.7 },
  { id: "5", profile_id: "5", full_name: "Oluwaseun Abiodun", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80", skill: "Master Carpenter", skill_category: "carpentry", city: "Ibadan", state: "Oyo", price_per_day: 16000, currency: "NGN", is_verified: true, completed_jobs: 178, rating: 4.9, review_count: 98, distance_km: 15.2 },
  { id: "6", profile_id: "6", full_name: "Fatima Ibrahim", avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80", skill: "Interior Designer", skill_category: "painting", city: "Abuja", state: "FCT", price_per_day: 25000, currency: "NGN", is_verified: true, completed_jobs: 94, rating: 4.8, review_count: 72, distance_km: 22.8 },
];

interface UseArtisanSearchOptions {
  latitude: number | null;
  longitude: number | null;
  radiusKm?: number;
  category?: string | null;
  limit?: number;
  enabled?: boolean;
}

export const useArtisanSearch = ({
  latitude,
  longitude,
  radiusKm = 50,
  category = null,
  limit = 20,
  enabled = true,
}: UseArtisanSearchOptions) => {
  return useQuery({
    queryKey: ["artisans", latitude, longitude, radiusKm, category, limit],
    queryFn: async (): Promise<ArtisanSearchResult[]> => {
      try {
        if (latitude && longitude) {
          const { data, error } = await supabase.rpc("search_artisans_by_proximity", {
            user_lat: latitude, user_lng: longitude,
            radius_km: radiusKm, category_filter: category, limit_count: limit,
          });
          if (!error && data && data.length > 0) return data;
        } else {
          const { data, error } = await supabase
            .from("artisan_profiles")
            .select(`id, profile_id, skill, skill_category, city, state, price_per_day, currency, is_verified, completed_jobs, rating, review_count, profiles (full_name, avatar_url)`)
            .eq("is_available", true).order("rating", { ascending: false }).limit(limit);
          if (!error && data && data.length > 0) {
            return data.map((item) => ({
              id: item.id, profile_id: item.profile_id,
              full_name: (item.profiles as any)?.full_name || "Unknown",
              avatar_url: (item.profiles as any)?.avatar_url || null,
              skill: item.skill, skill_category: item.skill_category,
              city: item.city, state: item.state,
              price_per_day: item.price_per_day, currency: item.currency,
              is_verified: item.is_verified, completed_jobs: item.completed_jobs,
              rating: item.rating, review_count: item.review_count, distance_km: null,
            }));
          }
        }
      } catch { /* fall to mock */ }

      let filtered = mockArtisans;
      if (category) filtered = filtered.filter((a) => a.skill_category === category);
      if (latitude && longitude) filtered = [...filtered].sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
      return filtered.slice(0, limit);
    },
    enabled,
    staleTime: 60000,
  });
};
