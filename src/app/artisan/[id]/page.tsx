"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { apiGet, apiPost } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { type ApiArtisan, formatNaira, resolveAssetUrl } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star, MapPin, Phone, Clock, CheckCircle2,
  Briefcase, Award, Users, ArrowLeft, Calendar,
  Shield, ThumbsUp, Hammer,
} from "lucide-react";
import { toast } from "sonner";

export default function ArtisanProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  const [artisan, setArtisan] = useState<ApiArtisan | null>(null);
  const [loading, setLoading] = useState(true);
  const [hireForm, setHireForm] = useState({ title: "", description: "", budget: "", location: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ data: { artisan: ApiArtisan } }>(`/artisans/${id}`);
        setArtisan(res.data.artisan);
      } catch {
        setArtisan(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to hire an artisan.");
      router.push("/login");
      return;
    }
    if (!artisan?.profileId?._id) return;
    setSubmitting(true);
    try {
      await apiPost("/jobs", {
        artisanId: artisan.profileId._id,
        title: hireForm.title,
        description: hireForm.description,
        budget: hireForm.budget ? Number(hireForm.budget) : undefined,
        location: hireForm.location || undefined,
      });
      toast.success("Job request sent! The artisan will be notified.");
      setHireForm({ title: "", description: "", budget: "", location: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send job request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </AppLayout>
    );
  }

  if (!artisan) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Artisan not found</p>
          <Button variant="outline" onClick={() => router.push("/artisan")}>Back to Artisans</Button>
        </div>
      </AppLayout>
    );
  }

  const artisanProfile = artisan.profileId;
  const name = artisanProfile?.fullName || "Unknown";
  const avatar = resolveAssetUrl(artisanProfile?.avatarUrl || "") || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
  const bio = artisanProfile?.bio;
  const phone = artisanProfile?.phone;
  const location = artisan.address || `${artisan.city}, ${artisan.state}`;
  const workHours = artisan.workHoursStart && artisan.workHoursEnd
    ? `${artisan.workHoursStart} – ${artisan.workHoursEnd}`
    : "Contact for hours";

  const stats = [
    { icon: Users, label: "Reviews", value: String(artisan.reviewCount || 0) },
    { icon: Briefcase, label: "Experience", value: `${artisan.experienceYears || 0} yrs` },
    { icon: Award, label: "Rating", value: artisan.rating ? `${artisan.rating}/5` : "New" },
    { icon: ThumbsUp, label: "Available", value: artisan.isAvailable ? "Yes" : "No" },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Banner */}
        <div className="relative h-56 md:h-72 w-full bg-linear-to-br from-primary to-accent">
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="relative max-w-5xl mx-auto px-4 h-full flex items-end pb-6">
            <button
              onClick={() => router.push("/artisan")}
              className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors"
            >
              <ArrowLeft strokeWidth={1} className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Artisans</span>
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative shrink-0">
                <img src={avatar} alt={name} className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-card shadow-lg" />
                <div className="absolute -top-2 -right-2 bg-success/10 text-success p-1.5 rounded-full shadow-md border border-success/20">
                  <CheckCircle2 strokeWidth={1.5} className="w-5 h-5" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{name}</h1>
                    <p className="text-primary font-semibold text-lg mt-1">{artisan.skill}</p>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <MapPin strokeWidth={1} className="w-4 h-4" />
                      <span className="text-sm">{location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-xl">
                      <Star strokeWidth={1} className="w-5 h-5 fill-warning text-warning" />
                      <span className="font-bold text-lg">{artisan.rating || "New"}</span>
                      <span className="text-muted-foreground text-sm">({artisan.reviewCount || 0} reviews)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-2xl text-foreground">
                        {artisan.pricePerDay ? formatNaira(artisan.pricePerDay) : "Contact for pricing"}
                      </span>
                      {artisan.pricePerDay && <span className="text-muted-foreground text-sm ml-1">/day</span>}
                    </div>
                  </div>
                </div>
                {bio && <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">{bio}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Shield, label: "Quality Assurance", desc: "Vetted & background checked" },
              { icon: Award, label: `${artisan.experienceYears || 0}+ Years Experience`, desc: "Industry veteran" },
              { icon: CheckCircle2, label: "Verified Professional", desc: "Identity confirmed" },
              { icon: ThumbsUp, label: "Money-Back Guarantee", desc: "If not satisfied" },
            ].map((badge, i) => (
              <div key={i} className="bg-card rounded-xl p-4 text-center shadow-sm border border-border hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
                  <badge.icon strokeWidth={1} className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">{badge.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-linear-to-br from-primary to-accent">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-primary-foreground">Our experts will solve them in no time.</h2>
              <p className="text-primary-foreground/80 text-sm mt-1">Have any housing problems? Get professional help today.</p>
            </div>
            <Button size="lg" variant="secondary" className="shrink-0 font-semibold rounded-xl" onClick={() => document.getElementById("hire-form")?.scrollIntoView({ behavior: "smooth" })}>
              <Hammer strokeWidth={1} className="w-4 h-4 mr-2" />
              Hire This Artisan
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-card rounded-xl p-5 text-center shadow-sm border border-border">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent mb-2">
                  <stat.icon strokeWidth={1} className="w-5 h-5" />
                </div>
                <p className="font-display font-bold text-2xl text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Hire */}
        <div className="max-w-5xl mx-auto px-4 mt-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">Contact Info</h2>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: "Address", value: location },
                  { icon: Phone, label: "Phone", value: phone || "Not provided" },
                  { icon: Clock, label: "Working Hours", value: workHours },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon strokeWidth={1} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {phone && (
                <Button className="w-full mt-6 rounded-xl" size="lg" onClick={() => window.open(`tel:${phone}`)}>
                  <Phone strokeWidth={1} className="w-4 h-4 mr-2" /> Call Now
                </Button>
              )}
            </div>

            <div id="hire-form" className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Hire This Artisan</h2>
              <p className="text-sm text-muted-foreground mb-6">Describe the job you need done. The artisan will be notified and can accept your request.</p>
              <form onSubmit={handleHireSubmit} className="space-y-4">
                <Input placeholder="Job title (e.g. Kitchen renovation)" value={hireForm.title} onChange={(e) => setHireForm({ ...hireForm, title: e.target.value })} required className="rounded-xl" />
                <Textarea placeholder="Describe the work you need done in detail..." value={hireForm.description} onChange={(e) => setHireForm({ ...hireForm, description: e.target.value })} rows={4} className="rounded-xl resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" placeholder="Budget (₦)" value={hireForm.budget} onChange={(e) => setHireForm({ ...hireForm, budget: e.target.value })} min="0" className="rounded-xl" />
                  <Input placeholder="Location / Address" value={hireForm.location} onChange={(e) => setHireForm({ ...hireForm, location: e.target.value })} className="rounded-xl" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full rounded-xl" size="lg">
                  <Hammer strokeWidth={1} className="w-4 h-4 mr-2" />
                  {submitting ? "Sending Request..." : "Send Hire Request"}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        {artisan.portfolio && artisan.portfolio.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 mt-8">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-5">Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {artisan.portfolio.map((item, i) => (
                  <div key={i} className="group relative aspect-square rounded-xl overflow-hidden">
                    <img src={item.url} alt={item.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    {item.caption && (
                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs leading-snug">{item.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Certifications */}
        {artisan.certifications && artisan.certifications.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 mt-6">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-5">Certifications</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {artisan.certifications.map((cert, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/40 border border-border">
                    <div className="w-9 h-9 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                      <Award strokeWidth={1} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{cert.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{cert.issuedBy}{cert.year ? ` · ${cert.year}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Availability & Service Area */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {artisan.availableDays && artisan.availableDays.length > 0 && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">Availability</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                    const full = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i];
                    const active = artisan.availableDays!.includes(full);
                    return (
                      <span key={d} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        {d}
                      </span>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock strokeWidth={1} className="w-4 h-4 text-primary" />
                  {workHours}
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display text-lg font-bold text-foreground mb-4">Service Area & Skills</h2>
              {artisan.serviceRadiusKm && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin strokeWidth={1} className="w-4 h-4 text-primary" />
                  Serves within <span className="font-semibold text-foreground mx-1">{artisan.serviceRadiusKm} km</span> of {artisan.city}
                </div>
              )}
              {artisan.tools && artisan.tools.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tools & Equipment</p>
                  <div className="flex flex-wrap gap-1.5">
                    {artisan.tools.map((t) => (
                      <span key={t} className="px-2.5 py-1 rounded-full bg-secondary text-xs text-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {artisan.additionalSkills && artisan.additionalSkills.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Also does</p>
                  <div className="flex flex-wrap gap-1.5">
                    {artisan.additionalSkills.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-12" />
      </div>
    </AppLayout>
  );
}
