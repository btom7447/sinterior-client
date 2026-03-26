"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  Briefcase,
  Award,
  Users,
  ArrowLeft,
  Calendar,
  Shield,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";

import { toast } from "sonner";
import type { ArtisanSearchResult } from "@/hooks/useArtisanSearch";

const mockArtisan: ArtisanSearchResult & {
  bio?: string;
  phone?: string;
  email?: string;
  experience_years?: number;
  address?: string;
  portfolio?: { url: string; caption: string }[];
  certifications?: { name: string; issuedBy: string; year: string }[];
  availableDays?: string[];
  workHours?: string;
  serviceRadiusKm?: number;
  tools?: string[];
  additionalSkills?: string[];
} = {
  id: "1",
  profile_id: "1",
  full_name: "Emmanuel Okonkwo",
  avatar_url:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  skill: "Master Electrician",
  skill_category: "electrical",
  city: "Lagos",
  state: "Lagos",
  price_per_day: 15000,
  currency: "NGN",
  is_verified: true,
  completed_jobs: 234,
  rating: 4.9,
  review_count: 127,
  distance_km: 2.5,
  bio: "Professional electrician with over 12 years of experience in residential and commercial electrical installations, repairs, and maintenance.",
  phone: "+234 801 234 5678",
  email: "emmanuel.o@example.com",
  experience_years: 12,
  address: "15 Admiralty Way, Lekki Phase 1, Lagos",
  portfolio: [
    {
      url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80",
      caption: "Full panel upgrade — 5-bedroom duplex, Lekki",
    },
    {
      url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
      caption: "Solar installation — 10kVA hybrid system",
    },
    {
      url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&q=80",
      caption: "Commercial rewiring — Ikeja office complex",
    },
    {
      url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80",
      caption: "CCTV & security system installation",
    },
  ],
  certifications: [
    { name: "Certified Electrician", issuedBy: "COREN", year: "2018" },
    { name: "Solar Installer Certification", issuedBy: "NERC", year: "2020" },
    { name: "Electrical Safety Inspector", issuedBy: "SON", year: "2022" },
  ],
  availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  workHours: "8:00 AM – 6:00 PM",
  serviceRadiusKm: 20,
  tools: [
    "Multimeter",
    "Wire stripper",
    "Conduit bender",
    "Power drill",
    "Voltmeter",
    "Soldering iron",
  ],
  additionalSkills: [
    "Solar installation",
    "CCTV setup",
    "Generator maintenance",
  ],
};

const stats = [
  { icon: Users, label: "Happy Clients", value: "320+" },
  { icon: Briefcase, label: "Completed Projects", value: "998" },
  { icon: Award, label: "Awards Won", value: "12" },
  { icon: ThumbsUp, label: "Satisfaction Rate", value: "99%" },
];

export default function ArtisanProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    description: "",
  });

  const { data: artisan, isLoading } = useQuery({
    queryKey: ["artisan-profile", id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("artisan_profiles")
          .select(`*, profiles (full_name, avatar_url, bio, phone)`)
          .eq("id", id!)
          .single();

        if (!error && data) {
          return {
            ...data,
            full_name: (data.profiles as any)?.full_name || "Unknown",
            avatar_url: (data.profiles as any)?.avatar_url || null,
            bio: (data.profiles as any)?.bio || null,
            phone: (data.profiles as any)?.phone || null,
          };
        }
      } catch {
        /* fall through to mock */
      }
      return mockArtisan;
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      "Appointment request sent! The artisan will contact you shortly.",
    );
    setBookingForm({
      name: "",
      phone: "",
      email: "",
      address: "",
      description: "",
    });
  };

  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return "Contact for pricing";
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol}${price.toLocaleString()}`;
  };

  if (isLoading) {
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

  const profile = artisan || mockArtisan;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Banner */}
        <div className="relative h-56 md:h-72 w-full bg-linear-to-br from-primary to-accent">
          <div className="absolute inset-0 bg-foreground/20" />
          <div className="relative max-w-5xl mx-auto px-4 h-full flex items-end pb-6">
            <Link
              href="/artisan"
              className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors"
            >
              <ArrowLeft strokeWidth={1} className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Artisans</span>
            </Link>
          </div>
        </div>

        {/* Profile Card */}
        <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-card rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative shrink-0">
                <img
                  src={
                    profile.avatar_url ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`
                  }
                  alt={profile.full_name}
                  className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-card shadow-lg"
                />
                {profile.is_verified && (
                  <div className="absolute -top-2 -right-2 bg-success/10 text-success p-1.5 rounded-full shadow-md border border-success/20">
                    <CheckCircle2 strokeWidth={1.5} className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                      {profile.full_name}
                    </h1>
                    <p className="text-primary font-semibold text-lg mt-1">
                      {profile.skill}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                      <MapPin strokeWidth={1} className="w-4 h-4" />
                      <span className="text-sm">
                        {(profile as any).address ||
                          `${profile.city}, ${profile.state}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-xl">
                      <Star
                        strokeWidth={1}
                        className="w-5 h-5 fill-warning text-warning"
                      />
                      <span className="font-bold text-lg">
                        {profile.rating || "New"}
                      </span>
                      <span className="text-muted-foreground text-sm">
                        ({profile.review_count || 0} reviews)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-2xl text-foreground">
                        {formatPrice(profile.price_per_day, profile.currency)}
                      </span>
                      {profile.price_per_day && (
                        <span className="text-muted-foreground text-sm ml-1">
                          /day
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {profile.bio && (
                  <p className="text-muted-foreground mt-4 leading-relaxed max-w-2xl">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: Shield,
                label: "Quality Assurance",
                desc: "Vetted & background checked",
              },
              {
                icon: Award,
                label: `${(profile as any).experience_years || 10}+ Years Experience`,
                desc: "Industry veteran",
              },
              {
                icon: CheckCircle2,
                label: "Verified Professional",
                desc: "Identity confirmed",
              },
              {
                icon: ThumbsUp,
                label: "Money-Back Guarantee",
                desc: "If not satisfied",
              },
            ].map((badge, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-4 text-center shadow-sm border border-border hover:shadow-md transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-2">
                  <badge.icon strokeWidth={1} className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-foreground">
                  {badge.label}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {badge.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Banner */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-linear-to-br from-primary to-accent">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-primary-foreground">
                Our experts will solve them in no time.
              </h2>
              <p className="text-primary-foreground/80 text-sm mt-1">
                Have any housing problems? Get professional help today.
              </p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              className="shrink-0 font-semibold rounded-xl"
              onClick={() =>
                document
                  .getElementById("booking-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <Calendar strokeWidth={1} className="w-4 h-4 mr-2" />
              Make an Appointment
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-card rounded-xl p-5 text-center shadow-sm border border-border"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent mb-2">
                  <stat.icon strokeWidth={1} className="w-5 h-5" />
                </div>
                <p className="font-display font-bold text-2xl text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Booking */}
        <div className="max-w-5xl mx-auto px-4 mt-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                Contact Expert
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: MapPin,
                    label: "Address",
                    value:
                      (profile as any).address ||
                      `${profile.city}, ${profile.state}`,
                  },
                  {
                    icon: Phone,
                    label: "Phone",
                    value: (profile as any).phone || "+234 XXX XXX XXXX",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: (profile as any).email || "contact@example.com",
                  },
                  {
                    icon: Clock,
                    label: "Working Hours",
                    value: "Monday – Friday: 8AM – 6PM\nSaturday: 9AM – 3PM",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon strokeWidth={1} className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <Button className="flex-1 rounded-xl" size="lg">
                  <Phone strokeWidth={1} className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl"
                  size="lg"
                >
                  <MessageSquare strokeWidth={1} className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>

            {/* Booking Form */}
            <div
              id="booking-form"
              className="bg-card rounded-2xl p-6 shadow-sm border border-border"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-6">
                Schedule an Appointment
              </h2>
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <Input
                  placeholder="Your Name"
                  value={bookingForm.name}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, name: e.target.value })
                  }
                  required
                  className="rounded-xl"
                />
                <Input
                  placeholder="Phone Number"
                  value={bookingForm.phone}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, phone: e.target.value })
                  }
                  required
                  className="rounded-xl"
                />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={bookingForm.email}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, email: e.target.value })
                  }
                  className="rounded-xl"
                />
                <Input
                  placeholder="Your Address"
                  value={bookingForm.address}
                  onChange={(e) =>
                    setBookingForm({ ...bookingForm, address: e.target.value })
                  }
                  className="rounded-xl"
                />
                <Textarea
                  placeholder="Describe the work you need done..."
                  value={bookingForm.description}
                  onChange={(e) =>
                    setBookingForm({
                      ...bookingForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className="rounded-xl resize-none"
                />
                <Button type="submit" className="w-full rounded-xl" size="lg">
                  Send Request
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        {profile.portfolio && profile.portfolio.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 mt-8">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-5">
                Portfolio
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {profile.portfolio.map(
                  (item: { url: string; caption?: string }, i: number) => (
                    <div
                      key={i}
                      className="group relative aspect-square rounded-xl overflow-hidden"
                    >
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {item.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs leading-snug">
                            {item.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certifications */}
        {profile.certifications && profile.certifications.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 mt-6">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display text-xl font-bold text-foreground mb-5">
                Certifications
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.certifications.map(
                  (
                    cert: { name: string; issuedBy: string; year: string },
                    i: number,
                  ) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-xl bg-secondary/40 border border-border"
                    >
                      <div className="w-9 h-9 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
                        <Award strokeWidth={1} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {cert.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {cert.issuedBy} · {cert.year}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* Availability & Service Area */}
        <div className="max-w-5xl mx-auto px-4 mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Availability */}
            {profile.availableDays && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
                <h2 className="font-display text-lg font-bold text-foreground mb-4">
                  Availability
                </h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d, i) => {
                      const full = [
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ][i];
                      const active = profile.availableDays!.includes(full);
                      return (
                        <span
                          key={d}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${active ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}
                        >
                          {d}
                        </span>
                      );
                    },
                  )}
                </div>
                {profile.workHours && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock strokeWidth={1} className="w-4 h-4 text-primary" />
                    {profile.workHours}
                  </div>
                )}
              </div>
            )}

            {/* Service Area & Tools */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h2 className="font-display text-lg font-bold text-foreground mb-4">
                Service Area & Skills
              </h2>
              {profile.serviceRadiusKm && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin strokeWidth={1} className="w-4 h-4 text-primary" />
                  Serves within{" "}
                  <span className="font-semibold text-foreground mx-1">
                    {profile.serviceRadiusKm} km
                  </span>{" "}
                  of {profile.city}
                </div>
              )}
              {profile.tools && profile.tools.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Tools & Equipment
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.tools.map((t: string) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-full bg-secondary text-xs text-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {profile.additionalSkills &&
                profile.additionalSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Also does
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.additionalSkills.map((s: string) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="max-w-5xl mx-auto px-4 mt-8 mb-12">
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-foreground">
                Client Reviews
              </h2>
              <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-xl">
                <Star
                  strokeWidth={1}
                  className="w-5 h-5 fill-warning text-warning"
                />
                <span className="font-bold text-lg">
                  {profile.rating || "New"}
                </span>
                <span className="text-muted-foreground text-sm">
                  ({profile.review_count || 0})
                </span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  name: "Chukwuemeka Eze",
                  avatar:
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
                  rating: 5,
                  date: "2 weeks ago",
                  comment:
                    "Emmanuel was incredibly professional and fixed our entire electrical panel in under 4 hours. Very clean and tidy work. Would 100% recommend.",
                },
                {
                  name: "Ngozi Adeyemi",
                  avatar:
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
                  rating: 5,
                  date: "1 month ago",
                  comment:
                    "Hired him for a rewiring job and he was on time, polite, and his pricing was fair. The work quality is excellent.",
                },
                {
                  name: "Babatunde Olaitan",
                  avatar:
                    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80",
                  rating: 4,
                  date: "2 months ago",
                  comment:
                    "Good work on the generator installation. Slight delay but communicated ahead of time. Final result was great.",
                },
                {
                  name: "Amaka Nwosu",
                  avatar:
                    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&q=80",
                  rating: 5,
                  date: "3 months ago",
                  comment:
                    "I've used Emmanuel three times now for various electrical jobs in my home. Consistent, reliable, and honest with pricing.",
                },
              ].map((review, i) => (
                <div
                  key={i}
                  className="flex gap-3 p-4 rounded-xl bg-secondary/30 border border-border"
                >
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-foreground">
                        {review.name}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {review.date}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          strokeWidth={1}
                          className={`w-3.5 h-3.5 ${s <= review.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
