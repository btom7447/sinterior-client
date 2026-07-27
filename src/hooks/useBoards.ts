"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/apiClient";
import type { Board } from "@/types/pins";
import { useAuth } from "@/hooks/useAuth";

export function useMyBoards() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["my-boards"],
    queryFn: async () =>
      (await apiGet<{ success: boolean; data: { boards: Board[] } }>("/boards")).data.boards,
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

/** Which of my boards already hold this pin — powers the picker's checkmarks. */
export function usePinBoardState(pinId: string, enabled: boolean) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ["pin-board-state", pinId],
    queryFn: async () =>
      (
        await apiGet<{ success: boolean; data: { boardIds: string[] } }>(
          `/boards/pin-state/${pinId}`
        )
      ).data.boardIds,
    enabled: enabled && isAuthenticated,
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; isPrivate?: boolean }) =>
      (await apiPost<{ success: boolean; data: { board: Board } }>("/boards", body)).data.board,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-boards"] }),
  });
}

export function useSavePin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ boardId, pinId }: { boardId: string; pinId: string }) =>
      apiPost(`/boards/${boardId}/pins`, { pinId }),
    onSuccess: (_res, { pinId }) => {
      qc.invalidateQueries({ queryKey: ["my-boards"] });
      qc.invalidateQueries({ queryKey: ["pin-board-state", pinId] });
      qc.invalidateQueries({ queryKey: ["pin", pinId] });
    },
  });
}

export function useUnsavePin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ boardId, pinId }: { boardId: string; pinId: string }) =>
      apiDelete(`/boards/${boardId}/pins/${pinId}`),
    onSuccess: (_res, { pinId }) => {
      qc.invalidateQueries({ queryKey: ["my-boards"] });
      qc.invalidateQueries({ queryKey: ["pin-board-state", pinId] });
      qc.invalidateQueries({ queryKey: ["pin", pinId] });
    },
  });
}
