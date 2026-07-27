"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Lock, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  useMyBoards,
  usePinBoardState,
  useCreateBoard,
  useSavePin,
  useUnsavePin,
} from "@/hooks/useBoards";
import type { Pin } from "@/types/pins";

interface BoardPickerDialogProps {
  pin: Pin | null;
  onClose: () => void;
}

/**
 * The save flow: one tap on Save opens this picker (never a form first).
 * Tapping a board saves instantly; tapping again removes. Board creation is
 * inline so a first-time saver never leaves the moment.
 */
const BoardPickerDialog = ({ pin, onClose }: BoardPickerDialogProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const open = !!pin;

  const { data: boards, isLoading } = useMyBoards();
  const { data: boardIds } = usePinBoardState(pin?._id ?? "", open);
  const createBoard = useCreateBoard();
  const savePin = useSavePin();
  const unsavePin = useUnsavePin();

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  if (open && !isAuthenticated) {
    onClose();
    router.push(`/login?next=${encodeURIComponent(`/pin/${pin!._id}`)}`);
    return null;
  }

  const toggle = async (boardId: string, boardName: string) => {
    if (!pin) return;
    const already = boardIds?.includes(boardId);
    try {
      if (already) {
        await unsavePin.mutateAsync({ boardId, pinId: pin._id });
        toast(`Removed from ${boardName}`);
      } else {
        await savePin.mutateAsync({ boardId, pinId: pin._id });
        toast.success(`Saved to ${boardName}`);
        onClose();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !pin) return;
    try {
      const board = await createBoard.mutateAsync({ name: newName.trim() });
      setNewName("");
      setCreating(false);
      await savePin.mutateAsync({ boardId: board._id, pinId: pin._id });
      toast.success(`Saved to ${board.name}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create board");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl p-0">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle className="text-base">Save to board</DialogTitle>
        </DialogHeader>

        <div className="max-h-72 overflow-y-auto px-2 py-2">
          {isLoading && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading boards…</p>
          )}
          {!isLoading && !boards?.length && !creating && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No boards yet — create your first one below.
            </p>
          )}
          {boards?.map((board) => {
            const saved = boardIds?.includes(board._id);
            return (
              <button
                key={board._id}
                onClick={() => toggle(board._id, board.name)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary"
              >
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-secondary">
                  {board.coverUrl && (
                    <Image src={board.coverUrl} alt="" fill sizes="40px" className="object-cover" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                    {board.name}
                    {board.isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {board.pinCount} pin{board.pinCount === 1 ? "" : "s"}
                  </span>
                </span>
                {saved && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>

        <div className="border-t border-border/60 p-3">
          {creating ? (
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder='e.g. "My Kitchen Project"'
                maxLength={80}
                className="h-10 rounded-xl"
              />
              <Button
                onClick={handleCreate}
                disabled={!newName.trim() || createBoard.isPending}
                className="h-10 rounded-xl"
              >
                Save
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-secondary"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary">
                <Plus className="h-5 w-5 text-foreground" />
              </span>
              <span className="text-sm font-semibold text-foreground">Create board</span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BoardPickerDialog;
