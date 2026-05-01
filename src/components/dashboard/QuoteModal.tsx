"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NairaInput } from "@/components/ui/NairaInput";
import { apiPost, apiPatch } from "@/lib/apiClient";
import { formatNaira } from "@/types/api";
import { toast } from "sonner";

interface MaterialRow {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

interface Quote {
  _id: string;
  pricingMode: string;
  labourCost: number;
  materials: MaterialRow[];
  materialTotal: number;
  total: number;
  notes?: string;
  status: string;
  version: number;
  sentAt: string;
}

interface QuoteModalProps {
  jobId: string;
  jobTitle: string;
  artisanName: string;
  pricingMode: string;
  role: "artisan" | "client";
  existingQuote?: Quote | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_ROW = (): MaterialRow => ({
  description: "",
  qty: 1,
  unit: "",
  unitPrice: 0,
  lineTotal: 0,
});

export default function QuoteModal({
  jobId,
  jobTitle,
  artisanName,
  pricingMode,
  role,
  existingQuote,
  onClose,
  onSuccess,
}: QuoteModalProps) {
  const isArtisan = role === "artisan";
  const isEditing = !!existingQuote && isArtisan;

  const [labourCost, setLabourCost] = useState<number | null>(
    existingQuote?.labourCost ?? null
  );
  const [materials, setMaterials] = useState<MaterialRow[]>(
    existingQuote?.materials?.length ? existingQuote.materials : [EMPTY_ROW()]
  );
  const [notes, setNotes] = useState(existingQuote?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  const materialTotal = materials.reduce((sum, r) => sum + (r.lineTotal || 0), 0);
  const total = (labourCost ?? 0) + materialTotal;

  const updateRow = (i: number, field: keyof MaterialRow, value: string | number) => {
    setMaterials((prev) => {
      const next = [...prev];
      const row = { ...next[i], [field]: value };
      if (field === "qty" || field === "unitPrice") {
        row.lineTotal = Number(row.qty) * Number(row.unitPrice);
      }
      next[i] = row;
      return next;
    });
  };

  const addRow = () => setMaterials((prev) => [...prev, EMPTY_ROW()]);
  const removeRow = (i: number) =>
    setMaterials((prev) => prev.filter((_, idx) => idx !== i));

  const handleSend = async () => {
    if (!labourCost || labourCost <= 0) {
      toast.error("Labour cost is required");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        jobId,
        pricingMode,
        labourCost,
        materials: materials.filter((r) => r.description.trim()),
        notes: notes.trim() || undefined,
      };
      if (isEditing) {
        await apiPatch(`/quotes/${existingQuote!._id}`, payload);
        toast.success("Quote updated");
      } else {
        await apiPost("/quotes", payload);
        toast.success("Quote sent");
      }
      onSuccess();
    } catch {
      toast.error("Failed to send quote");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async () => {
    if (!existingQuote) return;
    setSubmitting(true);
    try {
      await apiPost(`/quotes/${existingQuote._id}/accept`, {});
      toast.success("Quote accepted");
      onSuccess();
    } catch {
      toast.error("Failed to accept quote");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!existingQuote) return;
    setSubmitting(true);
    try {
      await apiPost(`/quotes/${existingQuote._id}/reject`, {});
      toast.success("Quote rejected");
      onSuccess();
    } catch {
      toast.error("Failed to reject quote");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-foreground text-lg">
                {isArtisan ? (isEditing ? "Update Quote" : "Send Quote") : "Quote from Artisan"}
              </h2>
              {existingQuote && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                  v{existingQuote.version}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {jobTitle} · {artisanName}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Labour */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Labour cost (₦) <span className="text-destructive">*</span>
            </Label>
            {isArtisan ? (
              <div className="mt-1.5">
                <NairaInput value={labourCost} onChange={setLabourCost} placeholder="e.g. 50,000" />
              </div>
            ) : (
              <p className="mt-1.5 text-foreground font-semibold text-lg">
                {formatNaira(existingQuote?.labourCost ?? 0)}
              </p>
            )}
          </div>

          {/* Materials */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Materials</p>
              {isArtisan && (
                <button
                  type="button"
                  onClick={addRow}
                  className="text-xs text-primary hover:text-primary/80 inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add row
                </button>
              )}
            </div>

            {/* Column headers */}
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 text-[11px] uppercase tracking-wider text-muted-foreground mb-1 px-1">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit</span>
              <span>Unit price</span>
              <span className="w-8" />
            </div>

            <div className="space-y-2">
              {(isArtisan ? materials : existingQuote?.materials ?? []).map((row, i) => (
                <div key={i} className="grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center">
                  {isArtisan ? (
                    <>
                      <Input
                        placeholder="e.g. Plywood sheets"
                        value={row.description}
                        onChange={(e) => updateRow(i, "description", e.target.value)}
                      />
                      <Input
                        type="number"
                        min={0}
                        placeholder="Qty"
                        value={row.qty || ""}
                        onChange={(e) => updateRow(i, "qty", parseFloat(e.target.value) || 0)}
                      />
                      <Input
                        placeholder="m², pcs…"
                        value={row.unit}
                        onChange={(e) => updateRow(i, "unit", e.target.value)}
                      />
                      <Input
                        type="number"
                        min={0}
                        placeholder="Price"
                        value={row.unitPrice || ""}
                        onChange={(e) => updateRow(i, "unitPrice", parseFloat(e.target.value) || 0)}
                      />
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground w-20 text-right hidden sm:block">
                          {formatNaira(row.lineTotal)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-5 grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 text-sm">
                      <span className="text-foreground">{row.description}</span>
                      <span className="text-muted-foreground">{row.qty}</span>
                      <span className="text-muted-foreground">{row.unit}</span>
                      <span className="text-muted-foreground">{formatNaira(row.unitPrice)}</span>
                      <span className="font-medium text-foreground text-right">{formatNaira(row.lineTotal)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {(isArtisan ? materials : existingQuote?.materials ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-3">No materials added.</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            {isArtisan ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any clarifications, payment terms, or scope notes…"
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            ) : existingQuote?.notes ? (
              <p className="mt-1.5 text-sm text-foreground bg-secondary/50 rounded-xl p-3">
                {existingQuote.notes}
              </p>
            ) : null}
          </div>
        </div>

        {/* Totals + Footer */}
        <div className="border-t border-border p-6 space-y-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Materials subtotal</span>
              <span>{formatNaira(isArtisan ? materialTotal : existingQuote?.materialTotal ?? 0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Labour</span>
              <span>{formatNaira(isArtisan ? (labourCost ?? 0) : existingQuote?.labourCost ?? 0)}</span>
            </div>
            <div className="flex justify-between font-semibold text-foreground text-base pt-1 border-t border-border">
              <span>Total</span>
              <span>{formatNaira(isArtisan ? total : existingQuote?.total ?? 0)}</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={submitting} className="rounded-xl">
              {isArtisan ? "Cancel" : "Close"}
            </Button>
            {isArtisan && (
              <Button onClick={handleSend} disabled={submitting} className="rounded-xl">
                {submitting ? "Sending…" : isEditing ? "Update Quote" : "Send Quote"}
              </Button>
            )}
            {!isArtisan && existingQuote?.status === "sent" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={submitting}
                  className="rounded-xl border-destructive text-destructive hover:bg-destructive/10"
                >
                  Reject
                </Button>
                <Button onClick={handleAccept} disabled={submitting} className="rounded-xl">
                  {submitting ? "Accepting…" : "Accept Quote"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
