"use client";

import { useEffect, useState, useRef } from "react";
import { apiGet, apiPost, apiUpload } from "@/lib/apiClient";
import { toast } from "sonner";
import { ShieldCheck, Upload, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface VerificationRequestItem {
  _id: string;
  businessName: string;
  documentType: string;
  documentUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

const documentTypes = [
  { value: "cac_certificate", label: "CAC Certificate" },
  { value: "business_license", label: "Business License" },
  { value: "tax_id", label: "Tax ID" },
  { value: "utility_bill", label: "Utility Bill" },
  { value: "national_id", label: "National ID" },
  { value: "other", label: "Other" },
];

const statusStyles = {
  pending: {
    icon: Clock,
    cls: "bg-amber-500/10 text-amber-600",
    label: "Under review",
  },
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
};

export default function VerificationPage() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<VerificationRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [documentType, setDocumentType] = useState("cac_certificate");
  const [documentUrl, setDocumentUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

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
      setDocumentUrl(res.data.fileUrl);
      toast.success("Document uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !documentUrl) {
      toast.error("Please fill all fields and upload a document");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/verification", { businessName, documentType, documentUrl });
      toast.success("Verification request submitted");
      setBusinessName("");
      setDocumentType("cac_certificate");
      setDocumentUrl("");
      fetchRequests();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const hasPending = requests.some((r) => r.status === "pending");
  const isVerified = requests.some((r) => r.status === "approved");

  if (profile && profile.role !== "artisan" && profile.role !== "supplier") {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Verification is only available for artisans and suppliers.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Verification</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Get the verified badge by submitting your business documents for review.
        </p>
      </div>

      {isVerified && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-foreground">Your account is verified</p>
            <p className="text-sm text-muted-foreground">
              The verified badge is now visible on your profile.
            </p>
          </div>
        </div>
      )}

      {!isVerified && !hasPending && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 space-y-4"
        >
          <h2 className="font-display font-semibold text-foreground">
            Submit verification request
          </h2>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Business name
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Document type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
            >
              {documentTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Document
            </label>
            {documentUrl ? (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-secondary/40">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline truncate"
                  >
                    View uploaded document
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setDocumentUrl("")}
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border hover:bg-secondary/40 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Uploading..." : "Click to upload document"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || uploading || !documentUrl || !businessName.trim()}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit for review"}
          </button>
        </form>
      )}

      {/* History */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-display font-semibold text-foreground mb-4">History</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No verification requests yet.</p>
        ) : (
          <ul className="space-y-3">
            {requests.map((r) => {
              const { icon: Icon, cls, label } = statusStyles[r.status];
              return (
                <li
                  key={r._id}
                  className="p-4 rounded-xl border border-border space-y-2"
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-medium text-foreground">{r.businessName}</p>
                      <p className="text-xs text-muted-foreground">
                        {documentTypes.find((t) => t.value === r.documentType)?.label}
                        {" · "}
                        {new Date(r.createdAt).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${cls}`}
                    >
                      <Icon className="w-3 h-3" /> {label}
                    </span>
                  </div>
                  {r.rejectionReason && (
                    <p className="text-xs text-destructive">
                      Reason: {r.rejectionReason}
                    </p>
                  )}
                  <a
                    href={r.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" /> View submitted document
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
