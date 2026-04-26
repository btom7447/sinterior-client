"use client";

import { useEffect, useState } from "react";
import { X, type LucideIcon } from "lucide-react";

type Tone = "primary" | "success" | "warning" | "destructive";

const TONE_BTN: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  success: "bg-success text-success-foreground hover:bg-success/90",
  warning: "bg-warning text-warning-foreground hover:bg-warning/90",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const TONE_ICON_BG: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export interface JobActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (extras: { reason?: string }) => void | Promise<void>;
  title: string;
  description: string | React.ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  confirmLabel: string;
  cancelLabel?: string;
  /** When set, shows a reason textarea. If `reasonRequired` is true, confirm is disabled until non-empty. */
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonRequired?: boolean;
  /** When set, shows a checkbox the user must tick to enable confirm. */
  agreementLabel?: React.ReactNode;
  /** Optional small note shown below the body (e.g. "consider raising a dispute"). */
  hint?: React.ReactNode;
  /** When true, the confirm button shows a loading state and is disabled. */
  loading?: boolean;
}

export function JobActionModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  icon: Icon,
  tone = "primary",
  confirmLabel,
  cancelLabel = "Cancel",
  reasonLabel,
  reasonPlaceholder,
  reasonRequired = false,
  agreementLabel,
  hint,
  loading = false,
}: JobActionModalProps) {
  const [reason, setReason] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Reset transient state when the modal opens.
  useEffect(() => {
    if (open) {
      setReason("");
      setAgreed(false);
    }
  }, [open]);

  // Close on ESC.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, loading, onClose]);

  if (!open) return null;

  const reasonOk = !reasonRequired || reason.trim().length > 0;
  const agreementOk = !agreementLabel || agreed;
  const canConfirm = !loading && reasonOk && agreementOk;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => !loading && onClose()}
    >
      <div
        className="bg-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${TONE_ICON_BG[tone]}`}>
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h3 className="font-display font-bold text-foreground truncate">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-sm text-muted-foreground leading-relaxed">{description}</div>

          {agreementLabel && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-secondary/30 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0"
              />
              <span className="text-sm text-foreground">{agreementLabel}</span>
            </label>
          )}

          {reasonLabel && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {reasonLabel}
                {reasonRequired && <span className="text-destructive ml-1">*</span>}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={reasonPlaceholder}
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {reason.length}/1000 — shown to the other party.
              </p>
            </div>
          )}

          {hint && (
            <div className="text-xs text-muted-foreground p-3 rounded-xl bg-secondary/50">
              {hint}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() =>
              onConfirm({ reason: reasonLabel ? reason.trim() : undefined })
            }
            disabled={!canConfirm}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${TONE_BTN[tone]}`}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
