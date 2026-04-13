"use client";

import { useEffect, useState, useRef } from "react";
import { apiGet, apiPatch, apiUpload } from "@/lib/apiClient";
import { resolveAssetUrl } from "@/types/api";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import {
  Building2,
  Save,
  Camera,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface SupplierData {
  businessName?: string;
  businessType?: string;
  description?: string;
  logoUrl?: string;
  categories?: string[];
  deliveryOptions?: string[];
  deliveryDays?: string;
  coverageStates?: string;
  businessAddress?: string;
  whatsappNumber?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

const BUSINESS_TYPES = [
  { value: "materials", label: "Building Materials" },
  { value: "real_estate", label: "Real Estate" },
  { value: "both", label: "Both" },
];

const DELIVERY_OPTIONS = ["Pickup", "Local Delivery", "Nationwide Delivery", "Express Delivery"];

export default function DashboardBusiness() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    businessName: "",
    businessType: "materials",
    description: "",
    categories: [] as string[],
    deliveryOptions: [] as string[],
    deliveryDays: "",
    coverageStates: "",
    businessAddress: "",
    whatsappNumber: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ data: { supplier: SupplierData } }>("/suppliers/me");
        const s = res.data.supplier;
        setForm({
          businessName: s.businessName || "",
          businessType: s.businessType || "materials",
          description: s.description || "",
          categories: s.categories || [],
          deliveryOptions: s.deliveryOptions || [],
          deliveryDays: s.deliveryDays || "",
          coverageStates: s.coverageStates || "",
          businessAddress: s.businessAddress || "",
          whatsappNumber: s.whatsappNumber || "",
          bankName: s.bankName || "",
          accountNumber: s.accountNumber || "",
          accountName: s.accountName || "",
        });
        setLogoUrl(s.logoUrl || "");
      } catch {
        // No supplier profile yet — start fresh
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await apiUpload<{ data: { logoUrl: string } }>("/suppliers/logo", formData);
      setLogoUrl(res.data.logoUrl);
      toast.success("Logo updated");
    } catch {
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  };

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const toggleDelivery = (opt: string) => {
    setForm((prev) => ({
      ...prev,
      deliveryOptions: prev.deliveryOptions.includes(opt)
        ? prev.deliveryOptions.filter((o) => o !== opt)
        : [...prev.deliveryOptions, opt],
    }));
  };

  const handleSave = async () => {
    if (!form.businessName.trim()) {
      toast.error("Business name is required");
      return;
    }
    setSaving(true);
    try {
      await apiPatch("/suppliers/onboarding", form);
      toast.success("Business profile updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Business Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage the business information shown on your seller profile page.
        </p>
      </div>

      {/* Logo */}
      <div className="card-elevated p-6">
        <h3 className="font-display font-bold text-foreground mb-4">Business Logo</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-secondary border border-border">
            {logoUrl ? (
              <img src={resolveAssetUrl(logoUrl)} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
              </div>
            )}
            <button
              onClick={() => logoRef.current?.click()}
              disabled={uploadingLogo}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
            >
              {uploadingLogo ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
              )}
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload logo</p>
            <p className="text-xs text-muted-foreground mt-0.5">JPEG, PNG or WebP, max 400x400px</p>
          </div>
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>
      </div>

      {/* Business Details */}
      <div className="card-elevated p-6 space-y-4">
        <h3 className="font-display font-bold text-foreground">Business Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Business Name *</Label>
            <Input
              value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="e.g. Ace Materials Ltd"
              className="mt-1.5 rounded-xl"
              maxLength={200}
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Business Type</Label>
            <select
              value={form.businessType}
              onChange={(e) => setForm({ ...form, businessType: e.target.value })}
              className="mt-1.5 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {BUSINESS_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell customers about your business..."
              className="mt-1.5 rounded-xl"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{form.description.length}/500</p>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Business Address</Label>
            <Input
              value={form.businessAddress}
              onChange={(e) => setForm({ ...form, businessAddress: e.target.value })}
              placeholder="e.g. 15 Herbert Macaulay Way, Yaba, Lagos"
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">WhatsApp Number</Label>
            <Input
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
              placeholder="e.g. +2348012345678"
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Delivery Days</Label>
            <Input
              value={form.deliveryDays}
              onChange={(e) => setForm({ ...form, deliveryDays: e.target.value })}
              placeholder="e.g. 1-3 days"
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Coverage Areas</Label>
            <Input
              value={form.coverageStates}
              onChange={(e) => setForm({ ...form, coverageStates: e.target.value })}
              placeholder="e.g. Lagos, Ogun, Oyo"
              className="mt-1.5 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="card-elevated p-6 space-y-4">
        <h3 className="font-display font-bold text-foreground">Product Categories</h3>
        <p className="text-xs text-muted-foreground">Select the categories of products you supply</p>
        <div className="flex flex-wrap gap-2">
          {PRODUCT_CATEGORIES.map((cat) => {
            const selected = form.categories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {selected && <X className="w-3 h-3 inline mr-1" />}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Options */}
      <div className="card-elevated p-6 space-y-4">
        <h3 className="font-display font-bold text-foreground">Delivery Options</h3>
        <div className="flex flex-wrap gap-2">
          {DELIVERY_OPTIONS.map((opt) => {
            const selected = form.deliveryOptions.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggleDelivery(opt)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {selected && <X className="w-3 h-3 inline mr-1" />}
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Payout / Bank Info */}
      <div className="card-elevated p-6 space-y-4">
        <h3 className="font-display font-bold text-foreground">Bank Details</h3>
        <p className="text-xs text-muted-foreground">For receiving payments from orders</p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Bank Name</Label>
            <Input
              value={form.bankName}
              onChange={(e) => setForm({ ...form, bankName: e.target.value })}
              placeholder="e.g. GTBank"
              className="mt-1.5 rounded-xl"
            />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Account Number</Label>
            <Input
              value={form.accountNumber}
              onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
              placeholder="10-digit account number"
              className="mt-1.5 rounded-xl"
              maxLength={10}
            />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Account Name</Label>
            <Input
              value={form.accountName}
              onChange={(e) => setForm({ ...form, accountName: e.target.value })}
              placeholder="Name on the account"
              className="mt-1.5 rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pb-8">
        <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2">
          <Save className="w-4 h-4" strokeWidth={1} />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
