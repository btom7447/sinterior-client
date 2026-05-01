"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, ArrowRight, Camera, Plus, X, Check,
  Clock, Award, MapPin, Wrench, Upload,
  DollarSign, Calendar, Tag, Ruler, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NairaInput } from "@/components/ui/NairaInput";
import LocationPicker from "@/components/location/LocationPicker";
import { toast } from "sonner";
import { apiGet, apiPatch, apiUpload } from "@/lib/apiClient";
import { ARTISAN_SKILL_CATEGORIES } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortfolioItem {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  year: string;
  file?: File;
  preview?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TOOLS_SUGGESTIONS = [
  "Multimeter", "Wire stripper", "Conduit bender", "Power drill", "Voltmeter",
  "Circular saw", "Level", "Tape measure", "Soldering iron", "Pipe wrench",
  "Angle grinder", "Welding machine", "Ladder", "Safety harness", "PPE kit",
];

const steps = [
  { number: 1, title: "Specialty",     description: "What do you do?",            icon: Wrench },
  { number: 2, title: "Pricing",       description: "How you charge clients",      icon: DollarSign },
  { number: 3, title: "Portfolio",     description: "Show your best work",         icon: Camera },
  { number: 4, title: "Certifications",description: "Your qualifications",         icon: Award },
  { number: 5, title: "Availability",  description: "When can clients reach you?", icon: Clock },
  { number: 6, title: "Service Details",description: "Area & equipment",           icon: Wrench },
];

const PRICING_MODE_META = [
  { id: "daily",  icon: Calendar,  label: "Per Day",   desc: "Fixed rate per calendar day. Billed by the day clock." },
  { id: "hourly", icon: Clock,     label: "Per Hour",  desc: "Billed by hours worked — ideal when job duration varies." },
  { id: "flat",   icon: Tag,       label: "Flat Rate", desc: "One quoted price for the whole job." },
  { id: "sqm",    icon: Ruler,     label: "Per m²",    desc: "Common for flooring, tiling, painting and plastering." },
  { id: "unit",   icon: Hash,      label: "Per Unit",  desc: "Price per item — doors, windows, sockets, etc." },
];

// ─── Step components ───────────────────────────────────────────────────────────

function SpecialtyStep({
  skillCategory,
  setSkillCategory,
  skill,
  setSkill,
}: {
  skillCategory: string;
  setSkillCategory: (v: string) => void;
  skill: string;
  setSkill: (v: string) => void;
}) {
  const selected = ARTISAN_SKILL_CATEGORIES.find((c) => c.name === skillCategory);
  const skillOptions = selected?.skills || [];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">What do you do?</h2>
      <p className="text-muted-foreground mb-6">
        Pick the category that best describes your trade, then your primary skill. Clients filter
        artisans by these.
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {ARTISAN_SKILL_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSkillCategory(c.name);
                  setSkill(""); // reset when category changes
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  skillCategory === c.name
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Primary skill {!skillCategory && <span className="text-xs font-normal text-muted-foreground">(pick a category first)</span>}
          </label>
          {skillCategory ? (
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    skill === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border rounded-2xl p-6 text-center text-sm text-muted-foreground">
              Select a category above to see available skills.
            </div>
          )}
        </div>

        {skillCategory && skill && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-sm">
            <p className="text-foreground">
              You&apos;re registering as a{" "}
              <strong>{skill}</strong> in <strong>{skillCategory}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioStep({
  items, setItems,
}: {
  items: PortfolioItem[];
  setItems: React.Dispatch<React.SetStateAction<PortfolioItem[]>>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = 6 - items.length;
    Array.from(files).slice(0, remaining).forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setItems((prev) => [...prev, { id: crypto.randomUUID(), file: f, preview: e.target?.result as string, caption: "" }]);
      };
      reader.readAsDataURL(f);
    });
  };

  const updateCaption = (id: string, caption: string) =>
    setItems(items.map((i) => (i.id === id ? { ...i, caption } : i)));

  const remove = (id: string) => setItems(items.filter((i) => i.id !== id));

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Portfolio photos</h2>
      <p className="text-muted-foreground mb-6">Upload up to 6 photos of your past work. Good photos get 3× more enquiries.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="group">
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border">
              <img src={item.preview} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => remove(item.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <label className="block mt-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">Caption</span>
              <input
                className="mt-0.5 w-full text-sm bg-transparent border-b border-border focus:border-primary focus:outline-none placeholder:text-muted-foreground/60 py-1"
                placeholder="e.g. 3-bedroom finish, Lekki"
                value={item.caption}
                onChange={(e) => updateCaption(item.id, e.target.value)}
              />
            </label>
          </div>
        ))}

        {items.length < 6 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-2 transition-colors self-start"
          >
            <Upload strokeWidth={1} className="w-6 h-6 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Add photo</span>
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      <p className="text-xs text-muted-foreground">
        {items.length}/6 photos added · You can skip this and add photos later from your dashboard.
      </p>
    </div>
  );
}

function CertificationsStep({
  certs, setCerts,
}: {
  certs: Certification[];
  setCerts: React.Dispatch<React.SetStateAction<Certification[]>>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const addCert = () => {
    setCerts([...certs, { id: crypto.randomUUID(), name: "", issuedBy: "", year: "" }]);
  };

  const update = (id: string, field: keyof Certification, value: string) =>
    setCerts(certs.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const remove = (id: string) => setCerts(certs.filter((c) => c.id !== id));

  const handleCertImage = (id: string, files: FileList | null) => {
    if (!files?.[0]) return;
    const f = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setCerts((prev) => prev.map((c) => (c.id === id ? { ...c, file: f, preview: e.target?.result as string } : c)));
    };
    reader.readAsDataURL(f);
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Certifications</h2>
      <p className="text-muted-foreground mb-6">Add your trade certifications, licences, or awards. Verified credentials build client trust.</p>

      <div className="flex flex-col gap-4 mb-4">
        {certs.map((cert) => (
          <div key={cert.id} className="border border-border rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">{cert.name || "New certification"}</p>
              <button onClick={() => remove(cert.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X strokeWidth={1} className="w-4 h-4" />
              </button>
            </div>
            <Input
              placeholder="Certification name (e.g. Certified Electrician)"
              value={cert.name}
              onChange={(e) => update(cert.id, "name", e.target.value)}
              className="rounded-xl"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Issued by"
                value={cert.issuedBy}
                onChange={(e) => update(cert.id, "issuedBy", e.target.value)}
                className="rounded-xl"
              />
              <Input
                placeholder="Year"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={cert.year}
                onChange={(e) => update(cert.id, "year", e.target.value)}
                className="rounded-xl"
              />
            </div>

            <button
              onClick={() => { setActiveId(cert.id); fileRef.current?.click(); }}
              className="flex items-center gap-2 text-xs text-primary hover:underline"
            >
              <Upload strokeWidth={1} className="w-3.5 h-3.5" />
              {cert.preview ? "Change certificate image" : "Upload certificate image (optional)"}
            </button>
            {cert.preview && (
              <img src={cert.preview} alt="" className="w-20 h-14 object-cover rounded-lg border border-border" />
            )}
          </div>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={(e) => activeId && handleCertImage(activeId, e.target.files)}
      />

      <button
        onClick={addCert}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-sm text-muted-foreground hover:text-primary transition-colors w-full justify-center"
      >
        <Plus strokeWidth={1} className="w-4 h-4" /> Add certification
      </button>
    </div>
  );
}

function AvailabilityStep({
  days, setDays, startTime, setStartTime, endTime, setEndTime,
}: {
  days: string[]; setDays: (v: string[]) => void;
  startTime: string; setStartTime: (v: string) => void;
  endTime: string; setEndTime: (v: string) => void;
}) {
  const toggle = (day: string) =>
    setDays(days.includes(day) ? days.filter((d) => d !== day) : [...days, day]);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Your availability</h2>
      <p className="text-muted-foreground mb-6">Let clients know when you're available for work.</p>

      <div className="mb-6">
        <p className="text-sm font-semibold text-foreground mb-3">Days available</p>
        <div className="grid grid-cols-4 gap-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggle(day)}
              className={`py-2.5 rounded-xl text-xs font-medium transition-all border ${
                days.includes(day)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Working hours</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Start time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">End time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PricingStep({
  pricingModes, setPricingModes,
  pricePerDay, setPricePerDay,
  pricePerHour, setPricePerHour,
}: {
  pricingModes: string[];
  setPricingModes: (v: string[]) => void;
  pricePerDay: number | null;
  setPricePerDay: (v: number | null) => void;
  pricePerHour: number | null;
  setPricePerHour: (v: number | null) => void;
}) {
  const toggleMode = (id: string) => {
    setPricingModes(
      pricingModes.includes(id) ? pricingModes.filter((m) => m !== id) : [...pricingModes, id]
    );
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">How do you charge?</h2>
      <p className="text-muted-foreground mb-6">
        Pick every pricing mode you offer. Clients will see these on your profile and select one when hiring you.
      </p>

      <div className="space-y-3 mb-6">
        {PRICING_MODE_META.map(({ id, icon: Icon, label, desc }) => {
          const active = pricingModes.includes(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleMode(id)}
              className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                active
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <Icon strokeWidth={1.5} className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              {active && <Check className="w-4 h-4 text-primary shrink-0 mt-1" />}
            </button>
          );
        })}
      </div>

      {pricingModes.includes("daily") && (
        <div className="mb-4">
          <label className="text-sm font-semibold text-foreground mb-1 block">Daily rate (₦)</label>
          <p className="text-xs text-muted-foreground mb-2">What you charge per day. Locked in when client hires.</p>
          <NairaInput value={pricePerDay} onChange={setPricePerDay} placeholder="e.g. 25,000" className="rounded-xl" />
        </div>
      )}

      {pricingModes.includes("hourly") && (
        <div className="mb-4">
          <label className="text-sm font-semibold text-foreground mb-1 block">Hourly rate (₦)</label>
          <p className="text-xs text-muted-foreground mb-2">What you charge per hour. Billed by the clock.</p>
          <NairaInput value={pricePerHour} onChange={setPricePerHour} placeholder="e.g. 3,500" className="rounded-xl" />
        </div>
      )}

      {pricingModes.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-xl">
          Select at least one pricing mode to continue.
        </p>
      )}
    </div>
  );
}

function ServiceDetailsStep({
  radius, setRadius, tools, setTools, extraSkills, setExtraSkills,
  latitude, longitude, setLatitude, setLongitude,
  address, setAddress,
}: {
  radius: number; setRadius: (v: number) => void;
  tools: string[]; setTools: (v: string[]) => void;
  extraSkills: string[]; setExtraSkills: (v: string[]) => void;
  latitude: number | null; longitude: number | null;
  setLatitude: (v: number | null) => void; setLongitude: (v: number | null) => void;
  address: string; setAddress: (v: string) => void;
}) {
  const [toolInput, setToolInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const addTool = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tools.includes(trimmed)) setTools([...tools, trimmed]);
    setToolInput("");
  };

  const addSkill = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !extraSkills.includes(trimmed)) setExtraSkills([...extraSkills, trimmed]);
    setSkillInput("");
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground mb-1">Service details</h2>
      <p className="text-muted-foreground mb-6">Help clients know how far you travel and what equipment you bring.</p>

      {/* Location picker */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin strokeWidth={1} className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Your exact location</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Search your address, drop a pin with GPS, then drag for accuracy. Clients see this as the
          centre of your service area.
        </p>
        <LocationPicker
          latitude={latitude}
          longitude={longitude}
          address={address}
          onChange={({ latitude: la, longitude: lo, address: a }) => {
            setLatitude(la);
            setLongitude(lo);
            setAddress(a);
          }}
        />
      </div>

      {/* Radius slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-foreground">Service radius</p>
          <span className="text-sm font-bold text-primary">{radius} km</span>
        </div>
        <input
          type="range"
          min={2}
          max={100}
          step={2}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full accent-primary h-2 rounded-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>2 km</span>
          <span>100 km</span>
        </div>
      </div>

      {/* Tools */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-foreground mb-3">
          Tools & equipment you own
          <span className="ml-2 text-xs font-normal text-muted-foreground">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {tools.map((t) => (
            <span key={t} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {t}
              <button onClick={() => setTools(tools.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add tool (e.g. Multimeter)"
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTool(toolInput))}
            className="rounded-xl"
          />
          <Button type="button" variant="outline" onClick={() => addTool(toolInput)} className="rounded-xl shrink-0">Add</Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {TOOLS_SUGGESTIONS.filter((t) => !tools.includes(t)).slice(0, 8).map((t) => (
            <button key={t} onClick={() => addTool(t)} className="text-xs text-muted-foreground hover:text-primary border border-border hover:border-primary/40 px-2.5 py-1 rounded-full transition-colors">
              + {t}
            </button>
          ))}
        </div>
      </div>

      {/* Additional skills */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Secondary skills (optional)</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {extraSkills.map((s) => (
            <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-medium">
              {s}
              <button onClick={() => setExtraSkills(extraSkills.filter((x) => x !== s))}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. Solar installation"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))}
            className="rounded-xl"
          />
          <Button type="button" variant="outline" onClick={() => addSkill(skillInput)} className="rounded-xl shrink-0">Add</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ArtisanOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 — Specialty
  const [skillCategory, setSkillCategory] = useState("");
  const [skill, setSkill] = useState("");
  // Step 2 — Pricing
  const [pricingModes, setPricingModes] = useState<string[]>([]);
  const [pricePerDay, setPricePerDay] = useState<number | null>(null);
  const [pricePerHour, setPricePerHour] = useState<number | null>(null);
  // Step 3 — Portfolio
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  // Step 4 — Certifications
  const [certs, setCerts] = useState<Certification[]>([]);
  // Step 5 — Availability
  const [availDays, setAvailDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  // Step 6 — Service Details
  const [radius, setRadius] = useState(20);
  const [tools, setTools] = useState<string[]>([]);
  const [extraSkills, setExtraSkills] = useState<string[]>([]);
  const [artisanLat, setArtisanLat] = useState<number | null>(null);
  const [artisanLng, setArtisanLng] = useState<number | null>(null);
  const [address, setAddress] = useState("");

  // Pre-fill specialty from /artisans/me on mount so users who already set it
  // (e.g. via signup or a previous onboarding pass) don't have to re-pick.
  useEffect(() => {
    apiGet<{ data: { artisan: { skill?: string; skillCategory?: string } } }>(
      "/artisans/me"
    )
      .then((res) => {
        if (res.data?.artisan?.skill) setSkill(res.data.artisan.skill);
        if (res.data?.artisan?.skillCategory) setSkillCategory(res.data.artisan.skillCategory);
      })
      .catch(() => {
        // Endpoint may 404 if the artisan profile doesn't exist yet — that's fine.
      });
  }, []);

  const current = steps[step - 1];
  const isLast = step === steps.length;

  const handleNext = async () => {
    if (isLast) {
      setSaving(true);
      try {
        // 1. Upload portfolio images as real files
        let portfolioUrls: { url: string; caption: string }[] = [];
        if (portfolio.length > 0) {
          const form = new FormData();
          portfolio.forEach((p, i) => {
            form.append("images", p.file);
            form.append(`captions[${i}]`, p.caption);
          });
          const res = await apiUpload<{ data: { portfolio: { url: string; caption: string }[] } }>("/artisans/portfolio", form);
          portfolioUrls = res.data.portfolio;
        }

        // 2. Upload certification files and collect URLs
        const certData = await Promise.all(
          certs.map(async (c) => {
            let fileUrl: string | undefined;
            if (c.file) {
              const form = new FormData();
              form.append("file", c.file);
              const res = await apiUpload<{ data: { fileUrl: string } }>("/artisans/certifications", form);
              fileUrl = res.data.fileUrl;
            }
            return { name: c.name, issuedBy: c.issuedBy, year: c.year ? Number(c.year) : undefined, fileUrl };
          })
        );

        // 3. Save onboarding metadata
        await apiPatch("/artisans/onboarding", {
          certifications: certData,
          availableDays: availDays,
          workHoursStart: startTime,
          workHoursEnd: endTime,
          serviceRadiusKm: radius,
          tools,
          additionalSkills: extraSkills,
          pricingModes,
          ...(pricePerDay != null ? { pricePerDay } : {}),
          ...(pricePerHour != null ? { pricePerHour } : {}),
          ...(address ? { address } : {}),
          ...(skill ? { skill } : {}),
          ...(skillCategory ? { skillCategory } : {}),
        });

        // 4. Update location separately if captured
        if (artisanLat && artisanLng) {
          await apiPatch("/artisans/location", { lat: artisanLat, lng: artisanLng }).catch(() => {});
        }
        toast.success("Profile complete! Welcome to Sintherior.");
        router.push("/dashboard");
      } catch {
        toast.error("Failed to save profile. Please try again.");
      } finally {
        setSaving(false);
      }
      return;
    } else {
      setStep(step + 1);
    }
  };

  const rightPanelContent = [
    { heading: "Set how you charge", body: "Clients see your pricing modes and select one when hiring. Rates you set here are locked in at hire time." },
    { heading: "Show clients your best work", body: "Artisans with portfolio photos receive 3× more enquiries than those without." },
    { heading: "Credentials build trust", body: "Clients are 60% more likely to hire artisans with verified certifications." },
    { heading: "Match the right jobs", body: "Setting your availability helps us show your profile at the right times." },
    { heading: "You're almost done!", body: "Just tell us your service area and the equipment you work with — then you're live." },
  ];

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col px-6 sm:px-12 lg:px-16 py-10 overflow-y-auto">
        <div className="max-w-md w-full mx-auto flex-1 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Sintherior" width={36} height={36} className="rounded-xl" />
              <span className="font-display font-bold text-xl text-foreground">Sintherior</span>
            </Link>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center gap-2 flex-1 last:flex-none">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                  s.number < step ? "bg-primary text-primary-foreground"
                  : s.number === step ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-secondary text-muted-foreground"
                }`}>
                  {s.number < step ? <Check className="w-3.5 h-3.5" /> : s.number}
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${s.number < step ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step label */}
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Step {step} of {steps.length} — {current.title}</p>

          {/* Step content */}
          <div className="flex-1">
            {step === 1 && (
              <SpecialtyStep
                skillCategory={skillCategory}
                setSkillCategory={setSkillCategory}
                skill={skill}
                setSkill={setSkill}
              />
            )}
            {step === 2 && (
              <PricingStep
                pricingModes={pricingModes}
                setPricingModes={setPricingModes}
                pricePerDay={pricePerDay}
                setPricePerDay={setPricePerDay}
                pricePerHour={pricePerHour}
                setPricePerHour={setPricePerHour}
              />
            )}
            {step === 3 && <PortfolioStep items={portfolio} setItems={setPortfolio} />}
            {step === 4 && <CertificationsStep certs={certs} setCerts={setCerts} />}
            {step === 5 && (
              <AvailabilityStep
                days={availDays} setDays={setAvailDays}
                startTime={startTime} setStartTime={setStartTime}
                endTime={endTime} setEndTime={setEndTime}
              />
            )}
            {step === 6 && (
              <ServiceDetailsStep
                radius={radius} setRadius={setRadius}
                tools={tools} setTools={setTools}
                extraSkills={extraSkills} setExtraSkills={setExtraSkills}
                latitude={artisanLat} longitude={artisanLng}
                setLatitude={setArtisanLat} setLongitude={setArtisanLng}
                address={address} setAddress={setAddress}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-xl gap-2">
                <ArrowLeft strokeWidth={1} className="w-4 h-4" /> Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={
                saving ||
                (step === 1 && (!skillCategory || !skill)) ||
                (step === 2 && (
                  pricingModes.length === 0 ||
                  (pricingModes.includes("daily") && !pricePerDay) ||
                  (pricingModes.includes("hourly") && !pricePerHour)
                ))
              }
              className="flex-1 rounded-xl gap-2 bg-primary hover:bg-primary/90"
            >
              {saving ? "Saving…" : isLast ? "Complete profile" : "Continue"}
              {!saving && !isLast && <ArrowRight strokeWidth={1} className="w-4 h-4" />}
              {!saving && isLast && <Check strokeWidth={1} className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Right — Info panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 sticky top-0 h-screen shrink-0 bg-gradient-to-br from-primary to-accent flex-col justify-center p-12">
        <div className="mb-8">
          <div className="flex gap-3 mb-6">
            {steps.map((s) => (
              <div
                key={s.number}
                className={`h-1.5 flex-1 rounded-full transition-all ${s.number <= step ? "bg-white" : "bg-white/25"}`}
              />
            ))}
          </div>
          <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-3">{current.title}</p>
          <h2 className="font-display text-3xl font-bold text-white mb-4 leading-snug">
            {rightPanelContent[step - 1].heading}
          </h2>
          <p className="text-white/80 leading-relaxed">
            {rightPanelContent[step - 1].body}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Artisans on platform", value: "5,000+" },
            { label: "Avg. monthly earnings", value: "₦180k" },
            { label: "Jobs posted monthly", value: "2,400+" },
            { label: "Client satisfaction", value: "96%" },
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
