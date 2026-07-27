"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";

interface FollowState {
  isFollowing: boolean;
  followers: number;
}

export function useFollowStatus(profileId: string | undefined) {
  return useQuery({
    queryKey: ["follow", profileId],
    queryFn: async () =>
      (
        await apiGet<{ success: boolean; data: FollowState }>(
          `/profiles/${profileId}/follow`
        )
      ).data,
    enabled: !!profileId,
    staleTime: 30_000,
  });
}

export function useToggleFollow(profileId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (isFollowing: boolean) =>
      (
        await (isFollowing
          ? apiDelete<{ success: boolean; data: FollowState }>(`/profiles/${profileId}/follow`)
          : apiPost<{ success: boolean; data: FollowState }>(`/profiles/${profileId}/follow`))
      ).data,
    onSuccess: (data) => {
      qc.setQueryData(["follow", profileId], data);
      // A follow changes feed personalization — refresh lazily.
      qc.invalidateQueries({ queryKey: ["feed"], refetchType: "none" });
    },
  });
}
