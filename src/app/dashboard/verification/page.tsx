"use client";

import { useEffect, useState, useRef } from "react";
import { apiGet, apiPost, apiUpload } from "@/lib/apiClient";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Plus,
  X,
  Building2,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DocumentItem {
  type: string;
  url: string;
  label?: string;
}

interface VerificationRequestItem {
  _id: string;
  kind?: "business" | "individual";
  businessName: string;
  documentType?: string;
  documentUrl?: string;
  documents?: DocumentItem[];
  status: "pending" | "approved" | "rejected" | "revoked";
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

const ALL_DOCUMENT_TYPES = [
  { value: "cac_certificate", label: "CAC Certificate" },
  { value: "business_license", label: "Business License" },
  { value: "tax_id", label: "Tax ID" },
  { value: "utility_bill", label: "Utility Bill / Address Proof" },
  { value: "national_id", label: "National ID" },
  { value: "other", label: "Other" },
];

const BUSINESS_DOC_TYPES = [
  "cac_certificate",
  "business_license",
  "tax_id",
  "utility_bill",
  "other",
];
const INDIVIDUAL_DOC_TYPES = ["national_id", "utility_bill", "other"];

const statusStyles: Record<
  VerificationRequestItem["status"],
  { icon: typeof Clock; cls: string; label: string }
> = {
  pending: { icon: Clock, cls: "bg-amber-500/10 text-amber-600", label: "Under review" },
  approved: {
    icon: CheckCircle2,
    cls: "bg-green-500/10 text-green-600",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    cls: "bg-destructive/10 text-destructive",
    label: "Rejected",
  },
  revoked: {
    icon: ShieldOff,
    cls: "bg-orange-500/10 text-orange-600",
    label: "Revoked",
  },
};

export default function VerificationPage() {
  const { profile } = useAuth();
  const isSupplier = profile?.role === "supplier";
  const isArtisan = profile?.role === "artisan";
  const kind: "business" | "individual" = isSupplier ? "business" : "individual";

  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [pendingDocs, setPendingDocs] = useState<DocumentItem[]>([]);
  const [docType, setDocType] = useState(isSupplier ? "cac_certificate" : "national_id");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Reset doc-type default when role becomes known.
  useEffect(() => {
    setDocType(isSupplier ? "cac_certificate" : "national_id");
  }, [isSupplier]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { verifications: VerificationRequestItem[] } }>(
        "/verification/my"
      );
      setRequests(res.data.verifications);
    } catch {
      toast.error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiUpload<{ data: { fileUrl: string } }>(
        "/verification/upload",
        form
      );
      setPendingDocs((prev) => [...prev, { type: docType, url: res.data.fileUrl }]);
      toast.success("Document added");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeDoc = (i: number) =>
    setPendingDocs((prev) => prev.filter((_, idx) => idx !== i));

  const updateDocType = (i: number, type: string) =>
    setPendingDocs((prev) => prev.map((d, idx) => (idx === i ? { ...d, type } : d)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) {
      toast.error(isSupplier ? "Business name is required" : "Full name on ID is required");
      return;
    }
    if (pendingDocs.length === 0) {
      toast.error("Upload at least one document");
      return;
    }
    if (
      isSupplier &&
      !pendingDocs.some((d) => d.type === "cac_certificate")
    ) {
      toast.error("A CAC certificate is required to verify a business");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/verification", {
        businessName,
        kind,
        documents: pendingDocs,
      });
      toast.success("Verification request submitted");
      setBusinessName("");
      setPendingDocs([]);
      fetchRequests();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const hasPending = requests.some((r) => r.status === "pending");
  const latestApproved = requests.find((r) => r.status === "approved");
  const latestRevoked = requests.find((r) => r.status === "revoked");
  const latestRejected = requests.find((r) => r.status === "rejected");

  // Status banner — shows the *current* state at a glance.
  const statusBanner = (() => {
    if (latestApproved) {
      return {
        icon: ShieldCheck,
        toneCls: "bg-green-500/10 border-green-500/20",
        iconCls: "text-green-600",
        title: isSupplier
          ? `${latestApproved.businessName} is verified`
          : "You are verified",
        body: isSupplier
          ? "Clients see a Verified badge on your storefront and product listings."
          : "Clients see a Verified badge on your profile and search results.",
      };
    }
    if (hasPending) {
      return {
        icon: Clock,
        toneCls: "bg-amber-500/10 border-amber-500/20",
        iconCls: "text-amber-600",
        title: "Under review",
        body: "We typically respond within 48 hours. We'll email you with the decision.",
      };
    }
    if (latestRevoked) {
      return {
        icon: ShieldOff,
        toneCls: "bg-orange-500/10 border-orange-500/20",
        iconCls: "text-orange-600",
        title: "Verification revoked",
        body:
          (latestRevoked.reviewNote && `Reason: ${latestRevoked.reviewNote}. `) +
          "Submit a fresh request once the issue is resolved.",
      };
    }
    if (latestRejected) {
      return {
        icon: ShieldAlert,
        toneCls: "bg-destructive/10 border-destructive/20",
        iconCls: "text-destructive",
        title: "Last request was rejected",
        body:
          (latestRejected.reviewNote && `Reason: ${latestRejected.reviewNote}. `) +
          "You can submit a fresh request below.",
      };
    }
    // Fresh signup — never submitted
    return {
      icon: ShieldAlert,
      toneCls: "bg-secondary border-border",
      iconCls: "text-muted-foreground",
      title: isSupplier
        ? "Your business is unverified"
        : "Your account is unverified",
      body: isSupplier
        ? "Submit your CAC and supporting documents below — admin manually verifies every business before the badge is granted."
        : "Submit your government-issued ID below — admin manually verifies every artisan before the badge is granted.",
    };
  })();

  if (profile && !isArtisan && !isSupplier) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Verification is only available for artisans and suppliers.
      </div>
    );
  }

  const showForm = !latestApproved && !hasPending;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          {isSupplier ? "Business Verification" : "Identity Verification"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isSupplier
            ? "Get the verified badge on your storefront. Admin manually reviews every business."
            : "Get the verified badge on your profile. Admin manually reviews every artisan."}
        </p>
      </div>

      {/* Status banner */}
      <div
        className={`flex items-start gap-4 p-5 rounded-2xl border ${statusBanner.toneCls}`}
      >
        <statusBanner.icon
          className={`w-6 h-6 shrink-0 mt-0.5 ${statusBanner.iconCls}`}
          strokeWidth={1.5}
        />
        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-foreground">{statusBanner.title}</p>
          {statusBanner.body && (
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {statusBanner.body}
            </p>
          )}
        </div>
      </div>

      {/* Submit form (only when there's no pending or active verification) */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-2 mb-1">
            {isSupplier ? (
              <Building2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
            ) : (
              <UserCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />
            )}
            <h2 className="font-display font-semibold text-foreground">
              {isSupplier ? "Verify your business" : "Verify your identity"}
            </h2>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {isSupplier ? "Business name (as on CAC)" : "Full name (as on ID)"}
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              maxLength={200}
              required
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Document uploads */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              {isSupplier
                ? "Upload your business documents"
                : "Upload your ID document"}
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              {isSupplier
                ? "Required: CAC certificate. You can also include business licence, tax ID, or utility bill."
                : "Recommended: National ID (NIN slip / driver's licence / international passport)."}
            </p>

            {/* Existing pending docs */}
            {pendingDocs.length > 0 && (
              <ul className="space-y-2 mb-3">
                {pendingDocs.map((d, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30"
                  >
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <select
                      value={d.type}
                      onChange={(e) => updateDocType(i, e.target.value)}
                      className="flex-1 min-w-0 bg-transparent text-sm focus:outline-none"
                    >
                      {ALL_DOCUMENT_TYPES.filter((t) =>
                        (isSupplier ? BUSINESS_DOC_TYPES : INDIVIDUAL_DOC_TYPES).includes(
                          t.value
                        )
                      ).map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline shrink-0"
                    >
                      Preview
                    </a>
                    <button
                      type="button"
                      onClick={() => removeDoc(i)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      aria-label="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add another doc */}
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm flex-1 sm:flex-none sm:w-56"
              >
                {ALL_DOCUMENT_TYPES.filter((t) =>
                  (isSupplier ? BUSINESS_DOC_TYPES : INDIVIDUAL_DOC_TYPES).includes(t.value)
                ).map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <label className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-border hover:bg-secondary/40 cursor-pointer transition-colors text-sm">
                {uploading ? (
                  <>
                    <Upload className="w-4 h-4 animate-pulse" /> Uploading…
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add document
                  </>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || pendingDocs.length === 0 || !businessName.trim()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting…" : "Submit for review"}
          </button>
        </form>
      )}

      {/* History */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display font-semibold text-foreground mb-4">History</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : requests.length === 0 ? (
          // Empty-state pattern matching the "no portfolio" look
          <div className="border border-dashed border-border rounded-2xl p-10 text-center">
            <ShieldAlert
              className="w-8 h-8 text-muted-foreground mx-auto mb-2"
              strokeWidth={1}
            />
            <p className="text-sm text-muted-foreground">
              {isSupplier
                ? "No verification submitted yet — submit your business documents to get verified."
                : "No verification submitted yet — submit your ID to get verified."}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => {
              const cfg = statusStyles[r.status];
              const docCount =
                r.documents?.length ?? (r.documentUrl ? 1 : 0);
              return (
                <li
                  key={r._id}
                  className="p-4 rounded-xl border border-border space-y-2"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-foreground">{r.businessName}</p>
                      <p className="text-xs text-muted-foreground">
                        {docCount} document{docCount === 1 ? "" : "s"} ·{" "}
                        {new Date(r.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${cfg.cls}`}
                    >
                      <cfg.icon className="w-3 h-3" /> {cfg.label}
                    </span>
                  </div>
                  {r.reviewNote && (r.status === "rejected" || r.status === "revoked") && (
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-sm">
                      <p className="text-xs uppercase tracking-wider text-destructive font-medium mb-1">
                        Reviewer note
                      </p>
                      <p className="text-foreground whitespace-pre-wrap">{r.reviewNote}</p>
                    </div>
                  )}
                  {/* Inline doc list */}
                  {r.documents && r.documents.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {r.documents.map((d, i) => (
                        <li key={i}>
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-xs text-foreground hover:bg-secondary/80 transition-colors capitalize"
                          >
                            <FileText className="w-3 h-3" />
                            {d.type.replace(/_/g, " ")}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {(!r.documents || r.documents.length === 0) && r.documentUrl && (
                    <a
                      href={r.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <FileText className="w-3 h-3" /> View document
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
