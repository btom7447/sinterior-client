"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Building2, ShieldCheck,
  Package, Truck, CreditCard, Check, Upload, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { apiPatch, apiUpload } from "@/lib/apiClient";

// ─── Constants ────────────────────────────────────────────────────────────────

const MATERIAL_CATEGORIES = [
  "Cement & Aggregates", "Steel & Iron", "Tiles & Flooring", "Paints & Coatings",
  "Roofing & Ceiling", "Plumbing & Pipes", "Electrical & Lighting", "Wood & Timber",
  "Doors & Windows", "Smart Home", "Furniture", "PPE & Safety",
];

const REALESTATE_CATEGORIES = [
  "Residential – Sale", "Residential – Rent", "Commercial – Sale", "Commercial – Rent",
  "Land", "Short-let / Serviced Apartments", "Property Management", "Valuation & Survey",
];

const BANKS = [
  "Access Bank", "First Bank", "GTBank", "UBA", "Zenith Bank",
  "Fidelity Bank", "FCMB", "Stanbic IBTC", "Sterling Bank", "Union Bank",
  "Wema Bank", "Polaris Bank", "Keystone Bank", "Ecobank",
];

const steps = [
  { number: 1, title: "Business Profile", icon: Building2 },
  { number: 2, title: "Verification", icon: ShieldCheck },
  { number: 3, title: "Categories", icon: Package },
  { number: 4, title: "Delivery", icon: Truck },
  { number: 5, title: "Payout", icon: CreditCard },
];

// ─── Step 1: Business Profile ─────────────────────────────────────────────────

function BusinessProfileStep({ data, setData }: {
  data: any; setData: (v: any) => void;
}) {
  const logoRef = useRef<HTMLInputElement>(null);

  const handleLogo = (files: FileList | null) => {
    if (!files?.[0]) return;
    const f = files[0];
    const reader = new FileReader();
    reader.onload = (e) => setData({ ...data, logoFile: f, logoPreview: e.target?.result as string });
    reader.readAsDataURL(f);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Your business</h2>
        <p className="text-muted-foreground">Tell buyers about your business.</p>
      </div>

      {/* Logo */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Business logo</p>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-secondary/50">
            {data.logoPreview
              ? <img src={data.logoPreview} alt="" className="w-full h-full object-cover" />
              : <Building2 strokeWidth={1} className="w-6 h-6 text-muted-foreground" />}
          </div>
          <button onClick={() => logoRef.current?.click()} className="text-sm text-primary hover:underline flex items-center gap-1.5">
            <Upload strokeWidth={1} className="w-4 h-4" />
            {data.logoPreview ? "Change logo" : "Upload logo"}
          </button>
        </div>
        <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogo(e.target.files)} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Business name</label>
        <Input
          placeholder="e.g. Adekunle Building Materials Ltd"
          value={data.businessName}
          onChange={(e) => setData({ ...data, businessName: e.target.value })}
          className="rounded-xl"
          required
        />
      </div>

      {/* Business type */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Business type</p>
        <div className="flex flex-col gap-2">
          {[
            { id: "materials", label: "Construction Materials / Products", desc: "You sell building materials, fixtures, or equipment." },
            { id: "real_estate", label: "Real Estate", desc: "You list properties for sale or rent." },
            { id: "both", label: "Both", desc: "You do both materials and real estate." },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setData({ ...data, businessType: opt.id })}
              className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                data.businessType === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${data.businessType === opt.id ? "border-primary bg-primary" : "border-border"}`}>
                {data.businessType === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Business description</label>
        <Textarea
          placeholder="Describe your business, what you sell, and why clients should choose you…"
          rows={4}
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          className="rounded-xl resize-none"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">{data.description.length}/500</p>
      </div>
    </div>
  );
}

// ─── Step 2: Verification ─────────────────────────────────────────────────────

function VerificationStep({ data, setData }: { data: any; setData: (v: any) => void }) {
  const certRef = useRef<HTMLInputElement>(null);

  const handleCert = (files: FileList | null) => {
    if (!files?.[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => setData({ ...data, cacCertPreview: e.target?.result as string });
    reader.readAsDataURL(files[0]);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Business verification</h2>
        <p className="text-muted-foreground">Verified businesses get a badge and rank higher in search results.</p>
      </div>

      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
        Your documents are reviewed by our team within 24–48 hours. You can start listing products immediately — the verified badge appears after approval.
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">CAC Registration Number</label>
        <Input
          placeholder="e.g. RC-1234567"
          value={data.cacNumber}
          onChange={(e) => setData({ ...data, cacNumber: e.target.value })}
          className="rounded-xl"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">CAC Certificate (optional)</p>
        {data.cacCertPreview ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-secondary/30">
            <img src={data.cacCertPreview} alt="" className="w-12 h-10 object-cover rounded-lg" />
            <span className="text-sm text-foreground flex-1">Certificate uploaded</span>
            <button onClick={() => setData({ ...data, cacCertPreview: null })} className="text-muted-foreground hover:text-destructive">
              <X strokeWidth={1} className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => certRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Upload strokeWidth={1} className="w-4 h-4" /> Upload CAC certificate (image or PDF)
          </button>
        )}
        <input ref={certRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleCert(e.target.files)} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Tax Identification Number (optional)</label>
        <Input
          placeholder="e.g. 1234567-0001"
          value={data.taxId}
          onChange={(e) => setData({ ...data, taxId: e.target.value })}
          className="rounded-xl"
        />
      </div>
    </div>
  );
}

// ─── Step 3: Categories ───────────────────────────────────────────────────────

function CategoriesStep({ data, setData }: { data: any; setData: (v: any) => void }) {
  const isMaterials = ["materials", "both"].includes(data.businessType);
  const isRealEstate = ["real_estate", "both"].includes(data.businessType);

  const toggle = (cat: string) => {
    const cats: string[] = data.categories;
    setData({ ...data, categories: cats.includes(cat) ? cats.filter((c) => c !== cat) : [...cats, cat] });
  };

  const allCats = [
    ...(isMaterials ? MATERIAL_CATEGORIES : []),
    ...(isRealEstate ? REALESTATE_CATEGORIES : []),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">What you offer</h2>
        <p className="text-muted-foreground">Select all the categories that apply to your business.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {allCats.map((cat) => {
          const active = data.categories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                active ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {active && <Check strokeWidth={2} className="w-3 h-3 inline mr-1.5" />}
              {cat}
            </button>
          );
        })}
      </div>

      {data.categories.length > 0 && (
        <p className="text-xs text-muted-foreground">{data.categories.length} categor{data.categories.length === 1 ? "y" : "ies"} selected</p>
      )}
    </div>
  );
}

// ─── Step 4: Delivery ─────────────────────────────────────────────────────────

function DeliveryStep({ data, setData }: { data: any; setData: (v: any) => void }) {
  const isRealEstate = data.businessType === "real_estate";

  if (isRealEstate) {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">Service coverage</h2>
          <p className="text-muted-foreground">Where do you operate?</p>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">States you cover</label>
          <Input
            placeholder="e.g. Lagos, Abuja, Port Harcourt"
            value={data.coverageStates}
            onChange={(e) => setData({ ...data, coverageStates: e.target.value })}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Number of active listings</label>
          <Input
            type="number"
            min="1"
            placeholder="e.g. 12"
            value={data.activeListings}
            onChange={(e) => setData({ ...data, activeListings: e.target.value })}
            className="rounded-xl"
          />
        </div>
      </div>
    );
  }

  const deliveryOptions = [
    { id: "pickup", label: "Pickup only", desc: "Customers collect from your location." },
    { id: "lagos", label: "Lagos delivery", desc: "You deliver within Lagos State." },
    { id: "nationwide", label: "Nationwide delivery", desc: "You deliver across Nigeria." },
  ];

  const toggleOption = (id: string) => {
    const opts: string[] = data.deliveryOptions;
    setData({ ...data, deliveryOptions: opts.includes(id) ? opts.filter((o) => o !== id) : [...opts, id] });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Delivery & fulfilment</h2>
        <p className="text-muted-foreground">Tell buyers how they can get their orders.</p>
      </div>

      <div className="flex flex-col gap-3">
        {deliveryOptions.map((opt) => {
          const active = data.deliveryOptions.includes(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${active ? "border-primary bg-primary" : "border-border"}`}>
                {active && <Check className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Min. order value (₦)</label>
          <Input
            type="number"
            min="0"
            step="1000"
            placeholder="e.g. 10000"
            value={data.minOrderValue}
            onChange={(e) => setData({ ...data, minOrderValue: e.target.value })}
            className="rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Delivery time (days)</label>
          <Input
            placeholder="e.g. 1–3"
            value={data.deliveryDays}
            onChange={(e) => setData({ ...data, deliveryDays: e.target.value })}
            className="rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Payout ───────────────────────────────────────────────────────────

function PayoutStep({ data, setData }: { data: any; setData: (v: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Payout information</h2>
        <p className="text-muted-foreground">Where should we send your earnings? This is stored securely and only used for payouts.</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Business address</label>
        <Input
          placeholder="Shop 5, Building Materials Market, Ikeja, Lagos"
          value={data.businessAddress}
          onChange={(e) => setData({ ...data, businessAddress: e.target.value })}
          className="rounded-xl"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">WhatsApp business number</label>
        <Input
          type="tel"
          placeholder="e.g. 08012345678"
          value={data.whatsappNumber}
          onChange={(e) => setData({ ...data, whatsappNumber: e.target.value })}
          className="rounded-xl"
        />
      </div>

      <div className="pt-2">
        <p className="text-sm font-semibold text-foreground mb-3">Bank account for payouts</p>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Bank</label>
            <select
              value={data.bankName}
              onChange={(e) => setData({ ...data, bankName: e.target.value })}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select bank…</option>
              {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Account number</label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={10}
                placeholder="0123456789"
                value={data.accountNumber}
                onChange={(e) => setData({ ...data, accountNumber: e.target.value.replace(/\D/g, "") })}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Account name</label>
              <Input
                placeholder="As on bank record"
                value={data.accountName}
                onChange={(e) => setData({ ...data, accountName: e.target.value })}
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SupplierOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [businessProfile, setBusinessProfile] = useState({
    logoFile: null as File | null,
    logoPreview: null as string | null,
    businessName: "",
    businessType: "materials",
    description: "",
  });
  const [verification, setVerification] = useState({
    cacNumber: "",
    cacCertPreview: null as string | null,
    taxId: "",
  });
  const [categories, setCategories] = useState({ categories: [] as string[], ...businessProfile });
  const [delivery, setDelivery] = useState({
    deliveryOptions: [] as string[],
    minOrderValue: "",
    deliveryDays: "",
    coverageStates: "",
    activeListings: "",
    businessType: "materials",
  });
  const [payout, setPayout] = useState({
    businessAddress: "",
    whatsappNumber: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const current = steps[step - 1];
  const isLast = step === steps.length;

  // Keep businessType synced for conditional steps
  const businessType = businessProfile.businessType;

  const handleNext = async () => {
    if (isLast) {
      setSaving(true);
      try {
        // Upload logo if provided
        if (businessProfile.logoFile) {
          const form = new FormData();
          form.append("logo", businessProfile.logoFile);
          await apiUpload("/suppliers/logo", form);
        }

        await apiPatch("/suppliers/onboarding", {
          businessName: businessProfile.businessName,
          businessType: businessProfile.businessType,
          description: businessProfile.description,
          cacNumber: verification.cacNumber,
          taxId: verification.taxId,
          categories: categories.categories,
          deliveryOptions: delivery.deliveryOptions,
          minOrderValue: delivery.minOrderValue ? Number(delivery.minOrderValue) : undefined,
          deliveryDays: delivery.deliveryDays,
          coverageStates: delivery.coverageStates,
          businessAddress: payout.businessAddress,
          whatsappNumber: payout.whatsappNumber,
          bankName: payout.bankName,
          accountNumber: payout.accountNumber,
          accountName: payout.accountName,
        });
        // Also update profile bio/phone with business info
        await apiPatch("/profiles/me", {
          bio: businessProfile.description,
          phone: payout.whatsappNumber,
        }).catch(() => {});
        toast.success("Business profile complete! You can now list products.");
        router.push("/dashboard");
      } catch {
        toast.error("Failed to save business profile. Please try again.");
      } finally {
        setSaving(false);
      }
      return;
    } else {
      if (step === 1) {
        setCategories((prev) => ({ ...prev, businessType }));
        setDelivery((prev) => ({ ...prev, businessType }));
      }
      setStep(step + 1);
    }
  };

  const rightContent = [
    { heading: "First impressions matter", body: "A complete business profile with a logo gets 4× more views from buyers." },
    { heading: "Trust drives sales", body: "Verified businesses see 70% higher conversion rates on the platform." },
    { heading: "Help buyers find you", body: "Buyers search by category — the more accurate you are, the more you'll appear." },
    { heading: "Flexible delivery, more orders", body: "Businesses offering delivery options receive 2× more orders than pickup-only." },
    { heading: "Get paid fast", body: "Set up your payout details now — earnings are transferred within 48 hours of order confirmation." },
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-16 py-10 overflow-y-auto">
        <div className="max-w-md w-full mx-auto flex-1 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">S</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">Sintherior</span>
            </Link>
            <button onClick={() => router.push("/dashboard")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Skip for now
            </button>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-1.5 mb-8">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center gap-1.5 flex-1 last:flex-none">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all ${
                  s.number < step ? "bg-primary text-primary-foreground"
                  : s.number === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-secondary text-muted-foreground"
                }`}>
                  {s.number < step ? <Check className="w-3 h-3" /> : s.number}
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${s.number < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Step {step} of {steps.length} — {current.title}</p>

          {/* Step content */}
          <div className="flex-1">
            {step === 1 && <BusinessProfileStep data={businessProfile} setData={setBusinessProfile} />}
            {step === 2 && <VerificationStep data={verification} setData={setVerification} />}
            {step === 3 && <CategoriesStep data={{ ...categories, businessType, categories: categories.categories }} setData={setCategories} />}
            {step === 4 && <DeliveryStep data={{ ...delivery, businessType }} setData={setDelivery} />}
            {step === 5 && <PayoutStep data={payout} setData={setPayout} />}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-xl gap-2">
                <ArrowLeft strokeWidth={1} className="w-4 h-4" /> Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={saving} className="flex-1 rounded-xl gap-2 bg-primary hover:bg-primary/90">
              {saving ? "Saving…" : isLast ? "Complete setup" : "Continue"}
              {!saving && !isLast && <ArrowRight strokeWidth={1} className="w-4 h-4" />}
              {!saving && isLast && <Check strokeWidth={1} className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Right — Info panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 sticky top-0 h-screen shrink-0 bg-gradient-to-br from-primary to-accent flex-col justify-center p-12">
        <div className="mb-8">
          <div className="flex gap-2 mb-6">
            {steps.map((s) => (
              <div key={s.number} className={`h-1.5 flex-1 rounded-full transition-all ${s.number <= step ? "bg-white" : "bg-white/25"}`} />
            ))}
          </div>
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-3">{current.title}</p>
          <h2 className="font-display text-3xl font-bold text-white mb-4 leading-snug">
            {rightContent[step - 1].heading}
          </h2>
          <p className="text-white/80 leading-relaxed">
            {rightContent[step - 1].body}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Active suppliers", value: "1,200+" },
            { label: "Monthly product views", value: "180k+" },
            { label: "Orders processed", value: "9,400+" },
            { label: "Avg. supplier rating", value: "4.7 ★" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-2xl p-4">
              <p className="font-display font-bold text-white text-xl">{stat.value}</p>
              <p className="text-white/70 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
