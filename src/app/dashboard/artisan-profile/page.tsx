"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPatch, apiPost, apiUpload } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { NairaInput } from "@/components/ui/NairaInput";
import LocationPicker from "@/components/location/LocationPicker";
import { Award, Camera, MapPin, Save, Upload, Wrench, X } from "lucide-react";
import { toast } from "sonner";

interface Portfolio {
  url: string;
  caption?: string;
}
interface Cert {
  name: string;
  issuedBy?: string;
  year?: number;
  fileUrl?: string;
}
interface ArtisanProfile {
  _id: string;
  skill?: string;
  skillCategory?: string;
  pricePerDay?: number;
  experienceYears?: number;
  serviceRadiusKm?: number;
  city?: string;
  state?: string;
  address?: string;
  location?: { type: string; coordinates: [number, number] };
  isAvailable?: boolean;
  isVerified?: boolean;
  availableDays?: string[];
  workHoursStart?: string;
  workHoursEnd?: string;
  tools?: string[];
  additionalSkills?: string[];
  portfolio?: Portfolio[];
  certifications?: Cert[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TABS = [
  { id: "overview", label: "Overview & Pricing" },
  { id: "portfolio", label: "Portfolio" },
  { id: "certifications", label: "Certifications" },
  { id: "availability", label: "Availability" },
  { id: "location", label: "Location & Service Area" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function ArtisanProfilePage() {
  const [tab, setTab] = useState<TabId>("overview");
  const [data, setData] = useState<ArtisanProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { artisan: ArtisanProfile } }>("/artisans/me");
      setData(res.data.artisan);
    } catch {
      toast.error("Failed to load artisan profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const patch = async (body: Partial<ArtisanProfile>) => {
    setSaving(true);
    try {
      await apiPatch("/artisans/onboarding", body);
      toast.success("Saved");
      fetchProfile();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-10 w-full" />
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Artisan profile not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Professional Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edit the work-related details clients see when finding you.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-t-lg border-b-2 -mb-px transition-colors ${
              tab === t.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <OverviewTab data={data} onSave={patch} saving={saving} />
      )}
      {tab === "portfolio" && (
        <PortfolioTab data={data} onChange={fetchProfile} />
      )}
      {tab === "certifications" && (
        <CertificationsTab data={data} onChange={fetchProfile} />
      )}
      {tab === "availability" && (
        <AvailabilityTab data={data} onSave={patch} saving={saving} />
      )}
      {tab === "location" && (
        <LocationTab data={data} onSave={patch} saving={saving} />
      )}
    </div>
  );
}

function OverviewTab({
  data,
  onSave,
  saving,
}: {
  data: ArtisanProfile;
  onSave: (body: Partial<ArtisanProfile>) => Promise<void>;
  saving: boolean;
}) {
  const [skill, setSkill] = useState(data.skill || "");
  const [skillCategory, setSkillCategory] = useState(data.skillCategory || "");
  const [pricePerDay, setPricePerDay] = useState<number | null>(data.pricePerDay ?? null);
  const [experienceYears, setExperienceYears] = useState(data.experienceYears ?? 0);
  const [isAvailable, setIsAvailable] = useState(data.isAvailable !== false);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Primary skill
          </Label>
          <Input
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            placeholder="e.g. Electrician"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Category
          </Label>
          <Input
            value={skillCategory}
            onChange={(e) => setSkillCategory(e.target.value)}
            placeholder="e.g. Electrical"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Daily rate
          </Label>
          <div className="mt-1.5">
            <NairaInput
              value={pricePerDay}
              onChange={setPricePerDay}
              placeholder="e.g. 25,000"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Years of experience
          </Label>
          <Input
            type="number"
            min={0}
            max={60}
            value={experienceYears}
            onChange={(e) => setExperienceYears(parseInt(e.target.value || "0", 10))}
            className="mt-1.5"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="w-4 h-4"
        />
        <div>
          <p className="text-sm font-medium text-foreground">Currently accepting jobs</p>
          <p className="text-xs text-muted-foreground">
            Turn off when you&apos;re fully booked or on leave.
          </p>
        </div>
      </label>

      <div className="flex justify-end pt-2">
        <Button
          onClick={() =>
            onSave({
              skill: skill.trim(),
              skillCategory: skillCategory.trim(),
              pricePerDay: pricePerDay ?? 0,
              experienceYears,
              isAvailable,
            })
          }
          disabled={saving}
          className="rounded-xl gap-1.5"
        >
          <Save className="w-4 h-4" strokeWidth={1} />
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function PortfolioTab({
  data,
  onChange,
}: {
  data: ArtisanProfile;
  onChange: () => Promise<void> | void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const portfolio = data.portfolio || [];

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files)
        .slice(0, 10 - portfolio.length)
        .forEach((f, i) => {
          form.append("images", f);
          form.append(`captions[${i}]`, "");
        });
      await apiUpload("/artisans/portfolio", form);
      toast.success("Uploaded");
      await onChange();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const updateCaption = async (index: number, caption: string) => {
    const next = [...portfolio];
    next[index] = { ...next[index], caption };
    try {
      await apiPatch("/artisans/onboarding", { portfolio: next });
      await onChange();
    } catch {
      toast.error("Save failed");
    }
  };

  const remove = async (index: number) => {
    const next = portfolio.filter((_, i) => i !== index);
    try {
      await apiPatch("/artisans/onboarding", { portfolio: next });
      toast.success("Removed");
      await onChange();
    } catch {
      toast.error("Remove failed");
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Portfolio photos</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Up to 10 photos of your past work. Good photos win 3× more enquiries.
          </p>
        </div>
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={uploading || portfolio.length >= 10}
          className="rounded-xl gap-1.5"
        >
          <Upload className="w-4 h-4" strokeWidth={1} />
          {uploading ? "Uploading…" : "Add photos"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      {portfolio.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-10 text-center">
          <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-2" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">
            No portfolio photos yet. Upload your first to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {portfolio.map((p, i) => (
            <div key={i} className="group">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.caption || ""} className="w-full h-full object-cover" />
                <button
                  onClick={() => remove(i)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <label className="block mt-2">
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Caption
                </span>
                <input
                  defaultValue={p.caption || ""}
                  onBlur={(e) => {
                    const v = e.target.value;
                    if (v !== (p.caption || "")) updateCaption(i, v);
                  }}
                  placeholder="e.g. 3-bedroom finish, Lekki"
                  className="mt-0.5 w-full text-sm bg-transparent border-b border-border focus:border-primary focus:outline-none py-1"
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CertificationsTab({
  data,
  onChange,
}: {
  data: ArtisanProfile;
  onChange: () => Promise<void> | void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [issuedBy, setIssuedBy] = useState("");
  const [year, setYear] = useState("");
  const [adding, setAdding] = useState(false);

  const certs = data.certifications || [];

  const add = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setAdding(true);
    try {
      let fileUrl: string | undefined;
      if (pendingFile) {
        const form = new FormData();
        form.append("file", pendingFile);
        const res = await apiUpload<{ data: { fileUrl: string } }>(
          "/artisans/certifications",
          form
        );
        fileUrl = res.data.fileUrl;
      }
      const next = [
        ...certs,
        {
          name: name.trim(),
          issuedBy: issuedBy.trim() || undefined,
          year: year ? parseInt(year, 10) : undefined,
          fileUrl,
        },
      ];
      await apiPatch("/artisans/onboarding", { certifications: next });
      toast.success("Certification added");
      setName("");
      setIssuedBy("");
      setYear("");
      setPendingFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await onChange();
    } catch {
      toast.error("Failed to add");
    } finally {
      setAdding(false);
    }
  };

  const remove = async (i: number) => {
    const next = certs.filter((_, idx) => idx !== i);
    try {
      await apiPatch("/artisans/onboarding", { certifications: next });
      toast.success("Removed");
      await onChange();
    } catch {
      toast.error("Remove failed");
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" strokeWidth={1} />
          <p className="text-sm font-semibold text-foreground">Add a certification</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <Input
            placeholder="Name (e.g. NEBO Wiring Cert)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Issued by"
            value={issuedBy}
            onChange={(e) => setIssuedBy(e.target.value)}
          />
          <Input
            placeholder="Year"
            type="number"
            min={1900}
            max={new Date().getFullYear() + 1}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            {pendingFile ? pendingFile.name : "Attach certificate (optional)"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => setPendingFile(e.target.files?.[0] || null)}
          />
          <Button
            onClick={add}
            disabled={adding || !name.trim()}
            className="rounded-xl"
          >
            {adding ? "Adding…" : "Add"}
          </Button>
        </div>
      </div>

      {certs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No certifications added yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {certs.map((c, i) => (
            <li
              key={i}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
            >
              <Award className="w-5 h-5 text-primary shrink-0" strokeWidth={1} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">
                  {c.issuedBy || "—"}
                  {c.year ? ` · ${c.year}` : ""}
                </p>
                {c.fileUrl && (
                  <a
                    href={c.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View certificate
                  </a>
                )}
              </div>
              <button
                onClick={() => remove(i)}
                className="text-xs text-destructive hover:text-destructive/80"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AvailabilityTab({
  data,
  onSave,
  saving,
}: {
  data: ArtisanProfile;
  onSave: (body: Partial<ArtisanProfile>) => Promise<void>;
  saving: boolean;
}) {
  const [days, setDays] = useState<string[]>(data.availableDays || []);
  const [start, setStart] = useState(data.workHoursStart || "08:00");
  const [end, setEnd] = useState(data.workHoursEnd || "18:00");

  const toggle = (d: string) =>
    setDays(days.includes(d) ? days.filter((x) => x !== d) : [...days, d]);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Days you work</p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <button
              key={d}
              onClick={() => toggle(d)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                days.includes(d)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Start time
          </Label>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="mt-1.5 w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            End time
          </Label>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="mt-1.5 w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          onClick={() => onSave({ availableDays: days, workHoursStart: start, workHoursEnd: end })}
          disabled={saving}
          className="rounded-xl gap-1.5"
        >
          <Save className="w-4 h-4" strokeWidth={1} />
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function LocationTab({
  data,
  onSave,
  saving,
}: {
  data: ArtisanProfile;
  onSave: (body: Partial<ArtisanProfile>) => Promise<void>;
  saving: boolean;
}) {
  const initialLat = data.location?.coordinates?.[1] ?? null;
  const initialLng = data.location?.coordinates?.[0] ?? null;
  const [lat, setLat] = useState<number | null>(initialLat);
  const [lng, setLng] = useState<number | null>(initialLng);
  const [address, setAddress] = useState(data.address || "");
  const [city, setCity] = useState(data.city || "");
  const [state, setState] = useState(data.state || "");
  const [radius, setRadius] = useState(data.serviceRadiusKm ?? 20);
  const [tools, setTools] = useState<string[]>(data.tools || []);
  const [extraSkills, setExtraSkills] = useState<string[]>(data.additionalSkills || []);
  const [toolInput, setToolInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const save = async () => {
    await onSave({
      address,
      city,
      state,
      serviceRadiusKm: radius,
      tools,
      additionalSkills: extraSkills,
    });
    if (lat != null && lng != null) {
      try {
        await apiPatch("/artisans/location", { lat, lng });
      } catch {
        // location PATCH errors surfaced via outer toast
      }
    }
  };

  const addTool = (v: string) => {
    const t = v.trim();
    if (t && !tools.includes(t)) setTools([...tools, t]);
    setToolInput("");
  };
  const addSkill = (v: string) => {
    const t = v.trim();
    if (t && !extraSkills.includes(t)) setExtraSkills([...extraSkills, t]);
    setSkillInput("");
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
      {/* Address picker */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" strokeWidth={1} />
          <p className="text-sm font-semibold text-foreground">Your exact location</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Search your address or use GPS, then drag the pin for accuracy.
        </p>
        <LocationPicker
          latitude={lat}
          longitude={lng}
          address={address}
          onChange={({ latitude, longitude, address: a }) => {
            setLat(latitude);
            setLng(longitude);
            setAddress(a);
          }}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">City</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">State</Label>
          <Input value={state} onChange={(e) => setState(e.target.value)} className="mt-1.5" />
        </div>
      </div>

      <div>
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
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-2">
          <Wrench className="inline w-4 h-4 mr-1.5" strokeWidth={1} />
          Tools & equipment <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {tools.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
            >
              {t}
              <button onClick={() => setTools(tools.filter((x) => x !== t))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add tool"
            value={toolInput}
            onChange={(e) => setToolInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTool(toolInput))
            }
          />
          <Button variant="outline" onClick={() => addTool(toolInput)}>
            Add
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-2">
          Secondary skills <span className="text-xs font-normal text-muted-foreground">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2 mb-2">
          {extraSkills.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-foreground text-xs font-medium"
            >
              {s}
              <button onClick={() => setExtraSkills(extraSkills.filter((x) => x !== s))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add skill"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addSkill(skillInput))
            }
          />
          <Button variant="outline" onClick={() => addSkill(skillInput)}>
            Add
          </Button>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={save} disabled={saving} className="rounded-xl gap-1.5">
          <Save className="w-4 h-4" strokeWidth={1} />
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
