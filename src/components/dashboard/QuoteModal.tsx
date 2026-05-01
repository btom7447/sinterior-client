"use client";

import { useState } from "react";
import { X, Plus, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NairaInput } from "@/components/ui/NairaInput";
import { apiPost, apiPatch } from "@/lib/apiClient";
import { formatNaira } from "@/types/api";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MaterialRow {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface QuoteData {
  _id: string;
  artisanBusiness?: { name?: string; tagline?: string; logoUrl?: string };
  labourType: string;
  labourRate: number;
  labourQty: number;
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
  clientName: string;
  artisanName: string;
  artisanAvatarUrl?: string;
  role: "artisan" | "client";
  existingQuote?: QuoteData | null;
  onClose: () => void;
  onSuccess: () => void;
  onAccepted?: (jobId: string) => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const LABOUR_TYPES = [
  { value: "flat",   label: "Fixed price",    hint: "One total amount for the whole job" },
  { value: "hourly", label: "Per hour",        hint: "Rate × number of hours" },
  { value: "daily",  label: "Per day",         hint: "Rate × number of days" },
  { value: "sqm",    label: "Per square metre", hint: "Rate × area in m²" },
  { value: "unit",   label: "Per item",        hint: "Rate × number of items" },
];

const LABOUR_QTY_LABELS: Record<string, string> = {
  hourly: "Hours",
  daily:  "Days",
  sqm:    "Area (m²)",
  unit:   "Quantity",
};

const EMPTY_ROW = (): MaterialRow => ({
  description: "", qty: 1, unit: "", unitPrice: 0, lineTotal: 0,
});

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });

// ── Artisan: Quote Builder ────────────────────────────────────────────────────

function QuoteBuilder({
  jobId,
  jobTitle,
  clientName,
  existingQuote,
  onClose,
  onSuccess,
}: {
  jobId: string;
  jobTitle: string;
  clientName: string;
  existingQuote?: QuoteData | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isAcceptedQuote = existingQuote?.status === "accepted";
  const isEditing = !!existingQuote && !isAcceptedQuote;

  const [labourType, setLabourType] = useState(existingQuote?.labourType ?? "flat");
  const [labourRate, setLabourRate] = useState<number | null>(existingQuote?.labourRate ?? null);
  const [labourQty,  setLabourQty]  = useState<number>(existingQuote?.labourQty  ?? 1);
  const [materials,  setMaterials]  = useState<MaterialRow[]>(
    existingQuote?.materials?.length ? existingQuote.materials : []
  );
  const [notes,      setNotes]      = useState(existingQuote?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  const isFlat = labourType === "flat";
  const labourCost = isFlat
    ? (labourRate ?? 0)
    : (labourRate ?? 0) * labourQty;

  const materialTotal = materials.reduce((s, r) => s + (r.lineTotal || 0), 0);
  const total = labourCost + materialTotal;

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

  const canSend = (labourRate ?? 0) > 0 && (!isFlat ? labourQty > 0 : true);

  const handleSend = async () => {
    if (!canSend) { toast.error("Enter a labour amount to continue"); return; }
    setSubmitting(true);
    try {
      const payload = {
        jobId,
        labourType,
        labourRate,
        labourQty: isFlat ? 1 : labourQty,
        materials: materials.filter((r) => r.description.trim()),
        notes: notes.trim() || undefined,
      };
      if (isEditing) {
        await apiPatch(`/quotes/${existingQuote!._id}`, payload);
        toast.success("Quote updated and resent");
      } else {
        await apiPost("/quotes", payload);
        toast.success("Quote sent to client");
      }
      onSuccess();
    } catch {
      toast.error("Failed to send quote");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-foreground text-lg">
              {isAcceptedQuote ? "Quote" : isEditing ? "Edit Quote" : "Create Quote"}
            </h2>
            {existingQuote && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                v{existingQuote.version}
              </span>
            )}
            {existingQuote?.status === "rejected" && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-medium">
                Declined
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {jobTitle} · for {clientName}
          </p>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <fieldset disabled={isAcceptedQuote} className="contents">
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

        {/* ── STEP 1: Labour ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <p className="font-semibold text-foreground">Your labour charge</p>
          </div>

          {/* Labour type selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {LABOUR_TYPES.map((lt) => (
              <button
                key={lt.value}
                type="button"
                onClick={() => setLabourType(lt.value)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  labourType === lt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <p className={`text-sm font-medium ${labourType === lt.value ? "text-foreground" : "text-muted-foreground"}`}>
                  {lt.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{lt.hint}</p>
              </button>
            ))}
          </div>

          {/* Rate + qty inputs */}
          <div className={`grid gap-3 ${isFlat ? "" : "sm:grid-cols-2"}`}>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                {isFlat ? "Total amount (₦)" : "Rate (₦)"}
                <span className="text-destructive ml-1">*</span>
              </label>
              <NairaInput
                value={labourRate}
                onChange={setLabourRate}
                placeholder={isFlat ? "e.g. 80,000" : "e.g. 5,000"}
              />
            </div>
            {!isFlat && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                  {LABOUR_QTY_LABELS[labourType] ?? "Quantity"}
                  <span className="text-destructive ml-1">*</span>
                </label>
                <Input
                  type="number"
                  min={0.1}
                  step={0.5}
                  value={labourQty || ""}
                  onChange={(e) => setLabourQty(parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 3"
                  className="h-11"
                />
              </div>
            )}
          </div>

          {/* Labour subtotal preview */}
          {(labourRate ?? 0) > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              Labour subtotal:{" "}
              <span className="font-semibold text-foreground">{formatNaira(labourCost)}</span>
              {!isFlat && labourQty > 0 && (
                <span className="ml-1 text-xs">
                  ({formatNaira(labourRate ?? 0)} × {labourQty} {LABOUR_QTY_LABELS[labourType]?.toLowerCase()})
                </span>
              )}
            </div>
          )}
        </section>

        {/* ── STEP 2: Materials ────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">2</span>
              <div>
                <p className="font-semibold text-foreground">Materials</p>
                <p className="text-xs text-muted-foreground">Optional — add items you'll supply</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMaterials((p) => [...p, EMPTY_ROW()])}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add item
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl p-5 text-center text-sm text-muted-foreground">
              No materials yet. Tap <strong>Add item</strong> if you&apos;ll be supplying anything.
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((row, i) => (
                <div key={i} className="bg-secondary/40 rounded-xl p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <Input
                      placeholder="What is it? (e.g. Plywood sheets, Paint, Tiles)"
                      value={row.description}
                      onChange={(e) => updateRow(i, "description", e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => setMaterials((p) => p.filter((_, idx) => idx !== i))}
                      className="p-2 text-muted-foreground hover:text-destructive mt-0.5 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Qty</label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="2"
                        value={row.qty || ""}
                        onChange={(e) => updateRow(i, "qty", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Unit</label>
                      <Input
                        placeholder="bags, m², pcs"
                        value={row.unit}
                        onChange={(e) => updateRow(i, "unit", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-muted-foreground mb-1">Unit price (₦)</label>
                      <NairaInput
                        value={row.unitPrice || null}
                        onChange={(v) => updateRow(i, "unitPrice", v ?? 0)}
                        placeholder="5,000"
                      />
                    </div>
                  </div>
                  {row.unitPrice > 0 && row.qty > 0 && (
                    <p className="text-xs text-right text-muted-foreground">
                      Line total: <span className="font-semibold text-foreground">{formatNaira(row.lineTotal)}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── STEP 3: Notes ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <p className="font-semibold text-foreground">Notes <span className="text-xs font-normal text-muted-foreground">(optional)</span></p>
              <p className="text-xs text-muted-foreground">Anything the client should know about scope or payment</p>
            </div>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Price valid for 14 days. Materials not included unless listed above. Work will take approx. 2 days."
            rows={3}
            maxLength={1000}
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </section>
      </div>

      {/* ── Totals + Actions ──────────────────────────────────────────────── */}
      <div className="border-t border-border px-6 py-4 space-y-3 shrink-0">
        <div className="space-y-1 text-sm">
          {materialTotal > 0 && (
            <>
              <div className="flex justify-between text-muted-foreground">
                <span>Labour</span>
                <span>{formatNaira(labourCost)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Materials</span>
                <span>{formatNaira(materialTotal)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-bold text-foreground text-base pt-1 border-t border-border">
            <span>Total</span>
            <span>{formatNaira(total)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting} className="rounded-xl flex-1">
            {isAcceptedQuote ? "Close" : "Cancel"}
          </Button>
          {!isAcceptedQuote && (
            <Button onClick={handleSend} disabled={submitting || !canSend} className="rounded-xl flex-1">
              {submitting ? "Sending…" : isEditing ? "Update & Resend" : "Send Quote"}
            </Button>
          )}
        </div>
      </div>
      </fieldset>
    </div>
  );
}

// ── Client: Professional Quote View ──────────────────────────────────────────

function QuoteViewer({
  quote,
  jobTitle,
  clientName,
  artisanName,
  artisanAvatarUrl,
  jobId,
  onClose,
  onSuccess,
  onAccepted,
}: {
  quote: QuoteData;
  jobId: string;
  jobTitle: string;
  clientName: string;
  artisanName: string;
  artisanAvatarUrl?: string;
  onClose: () => void;
  onSuccess: () => void;
  onAccepted?: (jobId: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const biz = quote.artisanBusiness;
  const displayName = biz?.name || artisanName;
  const logo = biz?.logoUrl || artisanAvatarUrl;
  const isSent = quote.status === "sent";

  const labourTypeMeta: Record<string, string> = {
    flat:   "Fixed price",
    hourly: "Per hour",
    daily:  "Per day",
    sqm:    "Per m²",
    unit:   "Per item",
  };

  const labourQtyLabel: Record<string, string> = {
    hourly: "hrs",
    daily:  "days",
    sqm:    "m²",
    unit:   "items",
  };

  const accept = async () => {
    setSubmitting(true);
    try {
      await apiPost(`/quotes/${quote._id}/accept`, {});
      toast.success("Quote accepted — redirecting to payment…");
      onClose();
      onAccepted?.(jobId);
    } catch { toast.error("Failed to accept quote"); }
    finally { setSubmitting(false); }
  };

  const reject = async () => {
    setSubmitting(true);
    try {
      await apiPost(`/quotes/${quote._id}/reject`, {});
      toast.success("Quote rejected — artisan will be notified");
      onSuccess();
    } catch { toast.error("Failed to reject quote"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-xl">
      {/* Close */}
      <div className="flex justify-end px-4 pt-4 shrink-0">
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quote document */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-5">

        {/* Letterhead */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={logo} alt={displayName} className="w-12 h-12 rounded-full object-cover border border-border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-display font-bold text-foreground text-base leading-tight">{displayName}</p>
              {biz?.tagline && <p className="text-xs text-muted-foreground mt-0.5">{biz.tagline}</p>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quotation</p>
            <p className="text-xs text-muted-foreground mt-0.5">v{quote.version} · {fmtDate(quote.sentAt)}</p>
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Addressed to */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Prepared for</p>
            <p className="font-medium text-foreground">{clientName}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Job</p>
            <p className="font-medium text-foreground">{jobTitle}</p>
          </div>
        </div>

        {/* Labour */}
        <div className="bg-secondary/40 rounded-xl p-4 space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Labour</p>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">{labourTypeMeta[quote.labourType] ?? quote.labourType}</p>
              {quote.labourType !== "flat" && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatNaira(quote.labourRate)} × {quote.labourQty} {labourQtyLabel[quote.labourType] ?? "units"}
                </p>
              )}
            </div>
            <p className="font-semibold text-foreground shrink-0">{formatNaira(quote.labourCost)}</p>
          </div>
        </div>

        {/* Materials table */}
        {quote.materials?.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Materials</p>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Item</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Qty</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Unit price</th>
                    <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quote.materials.map((m, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-foreground">
                        {m.description}
                        {m.unit && <span className="text-muted-foreground text-xs ml-1">({m.unit})</span>}
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{m.qty}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">{formatNaira(m.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-medium text-foreground">{formatNaira(m.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totals */}
        <div className="space-y-1.5 text-sm">
          {(quote.materialTotal ?? 0) > 0 && (
            <>
              <div className="flex justify-between text-muted-foreground">
                <span>Labour</span>
                <span>{formatNaira(quote.labourCost)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Materials</span>
                <span>{formatNaira(quote.materialTotal)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatNaira(quote.total)}</span>
          </div>
        </div>

        {/* Notes */}
        {quote.notes && (
          <div className="bg-secondary/40 rounded-xl px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Notes from artisan</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}

        {/* Status badge for non-pending quotes */}
        {!isSent && (
          <div className={`rounded-xl px-4 py-3 text-center text-sm font-medium ${
            quote.status === "accepted"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}>
            {quote.status === "accepted" ? "You accepted this quote" : "You rejected this quote"}
          </div>
        )}
      </div>

      {/* Footer actions */}
      {isSent && (
        <div className="border-t border-border px-6 py-4 space-y-2 shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            Accepting locks in the price and takes you to payment. Funds are held in escrow until work is done.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={reject}
              disabled={submitting}
              className="flex-1 rounded-xl border-destructive text-destructive hover:bg-destructive/10"
            >
              Decline
            </Button>
            <Button onClick={() => setConfirmOpen(true)} disabled={submitting} className="flex-1 rounded-xl gap-1.5">
              Accept & Pay
            </Button>
          </div>
        </div>
      )}

      {/* Accept confirmation overlay */}
      {confirmOpen && (
        <div className="absolute inset-0 z-10 flex items-end sm:items-center justify-center bg-black/40 rounded-2xl p-4">
          <div className="bg-card border border-border rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div>
              <p className="font-display font-bold text-foreground text-base">Confirm acceptance</p>
              <p className="text-sm text-muted-foreground mt-1">
                You&apos;re agreeing to pay{" "}
                <span className="font-semibold text-foreground">{formatNaira(quote.total)}</span>{" "}
                for this job. You&apos;ll be taken to payment now.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="flex-1 rounded-xl"
              >
                Go back
              </Button>
              <Button
                onClick={accept}
                disabled={submitting}
                className="flex-1 rounded-xl"
              >
                {submitting ? "Processing…" : "Confirm & Pay"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {!isSent && (
        <div className="border-t border-border px-6 py-4 shrink-0">
          <Button variant="outline" onClick={onClose} className="w-full rounded-xl">
            Close
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Root export ────────────────────────────────────────────────────────────────

export default function QuoteModal(props: QuoteModalProps) {
  const { role, existingQuote, onClose, ...rest } = props;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      {role === "artisan" ? (
        <QuoteBuilder
          jobId={props.jobId}
          jobTitle={props.jobTitle}
          clientName={props.clientName}
          existingQuote={existingQuote}
          onClose={onClose}
          onSuccess={props.onSuccess}
        />
      ) : existingQuote ? (
        <QuoteViewer
          quote={existingQuote}
          jobId={props.jobId}
          jobTitle={props.jobTitle}
          clientName={props.clientName}
          artisanName={props.artisanName}
          artisanAvatarUrl={props.artisanAvatarUrl}
          onClose={onClose}
          onSuccess={props.onSuccess}
          onAccepted={props.onAccepted}
        />
      ) : (
        <div className="bg-card rounded-2xl p-8 text-center max-w-sm shadow-xl border border-border">
          <p className="font-semibold text-foreground mb-1">No quote yet</p>
          <p className="text-sm text-muted-foreground">The artisan hasn&apos;t sent a quote for this job yet.</p>
          <Button variant="outline" onClick={onClose} className="mt-4 rounded-xl w-full">Close</Button>
        </div>
      )}
    </div>
  );
}
