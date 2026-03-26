"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { properties } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Heart,
  Share2,
  Phone,
  Mail,
  Star,
  CheckCircle2,
  Calendar,
  Play,
  Building2,
  Car,
  Wifi,
  ShieldCheck,
  Dumbbell,
  Trees,
} from "lucide-react";
import { toast } from "sonner";

const amenityIcons: Record<string, React.ElementType> = {
  Parking: Car,
  "Private Pool": Trees,
  "Pet Friendly": Trees,
  Gym: Dumbbell,
  Gated: ShieldCheck,
  Elevator: Building2,
  CCTV: ShieldCheck,
  "Smart Home": Wifi,
  "Cinema Room": Play,
  "Staff Quarters": Building2,
  "24/7 Power": Wifi,
  "Fibre Internet": Wifi,
  "Air Conditioning": Wifi,
  "Paved Roads": Car,
  "Drainage System": Building2,
  "Backup Generator": Wifi,
  "Water Treatment": Wifi,
};

const mockReviews = [
  {
    name: "Adebayo Ogundimu",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",
    rating: 5,
    date: "1 month ago",
    comment:
      "The listing was accurate and the agent was very responsive. Viewing was arranged quickly and the property was exactly as described.",
  },
  {
    name: "Funmilayo Adesanya",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80",
    rating: 4,
    date: "2 months ago",
    comment:
      "Great location and good value. The agent handled all paperwork professionally. Minor delay on documentation but overall a smooth experience.",
  },
  {
    name: "Kingsley Nwachukwu",
    avatar:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80",
    rating: 5,
    date: "3 months ago",
    comment:
      "Absolutely love the property. The neighbourhood is quiet and well-maintained. Would recommend this agency to anyone.",
  },
];

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const property = properties.find((p) => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  if (!property) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Property not found</p>
          <Button variant="outline" onClick={() => router.push("/real-estate")}>
            Back to Properties
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent to agent!", {
      description: "They will get back to you shortly.",
    });
    setContactForm({ name: "", phone: "", email: "", message: "" });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft strokeWidth={1} className="w-4 h-4" />
            <span className="text-sm">Back to Properties</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLiked(!liked)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Heart
                strokeWidth={1}
                className={`w-5 h-5 ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
              />
            </button>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Share2
                strokeWidth={1}
                className="w-5 h-5 text-muted-foreground"
              />
            </button>
          </div>
        </div>

        {/* Title + badges */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              className={`text-xs font-semibold ${property.status === "For Sale" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}
            >
              {property.status}
            </Badge>
            {property.featured && (
              <Badge className="bg-warning text-warning-foreground text-xs font-semibold">
                Featured
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {property.type}
            </Badge>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {property.title}
          </h1>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin strokeWidth={1} className="w-4 h-4 text-primary" />
            <span className="text-sm">{property.address}</span>
          </div>
        </div>

        {/* Image gallery */}
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden bg-secondary aspect-video sm:aspect-2/1 group">
            <img
              src={property.images[selectedImage]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          {property.images.length > 1 && (
            <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
              {property.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-primary" : "border-transparent"}`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main two-column layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left — Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Price + specs */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
                <div>
                  <span className="font-display text-3xl font-bold text-primary">
                    {property.price}
                  </span>
                  {property.priceLabel && (
                    <span className="text-muted-foreground text-sm ml-2">
                      {property.priceLabel}
                    </span>
                  )}
                </div>
              </div>
              {(property.beds ||
                property.baths ||
                property.sqft ||
                property.parkingSpaces ||
                property.yearBuilt) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
                  {property.beds && (
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <Bed
                        strokeWidth={1}
                        className="w-5 h-5 text-primary mx-auto mb-1"
                      />
                      <p className="font-semibold text-foreground">
                        {property.beds}
                      </p>
                      <p className="text-xs text-muted-foreground">Bedrooms</p>
                    </div>
                  )}
                  {property.baths && (
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <Bath
                        strokeWidth={1}
                        className="w-5 h-5 text-primary mx-auto mb-1"
                      />
                      <p className="font-semibold text-foreground">
                        {property.baths}
                      </p>
                      <p className="text-xs text-muted-foreground">Bathrooms</p>
                    </div>
                  )}
                  {property.sqft && (
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <Maximize
                        strokeWidth={1}
                        className="w-5 h-5 text-primary mx-auto mb-1"
                      />
                      <p className="font-semibold text-foreground">
                        {property.sqft}
                      </p>
                      <p className="text-xs text-muted-foreground">Area</p>
                    </div>
                  )}
                  {property.parkingSpaces && (
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <Car
                        strokeWidth={1}
                        className="w-5 h-5 text-primary mx-auto mb-1"
                      />
                      <p className="font-semibold text-foreground">
                        {property.parkingSpaces}
                      </p>
                      <p className="text-xs text-muted-foreground">Parking</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                About This Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {property.description}
              </p>
              {property.yearBuilt && (
                <p className="text-sm text-muted-foreground mt-3">
                  Year built:{" "}
                  <span className="font-medium text-foreground">
                    {property.yearBuilt}
                  </span>
                </p>
              )}
            </div>

            {/* Amenities */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || CheckCircle2;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50"
                    >
                      <Icon
                        strokeWidth={1}
                        className="w-4 h-4 text-primary shrink-0"
                      />
                      <span className="text-sm font-medium text-foreground">
                        {amenity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location Map */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Location
              </h2>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                <MapPin strokeWidth={1} className="w-4 h-4 text-primary" />
                {property.address}
              </p>
              <div className="rounded-xl overflow-hidden border border-border h-64">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed&z=15`}
                  className="w-full h-full"
                  loading="lazy"
                  title="Property location"
                />
              </div>
            </div>

            {/* Video tour */}
            {property.videoUrl && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">
                  Video Tour
                </h2>
                <div className="rounded-xl overflow-hidden border border-border aspect-video">
                  <iframe
                    src={property.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Property video tour"
                  />
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-xl font-bold text-foreground">
                  Reviews
                </h2>
                <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-xl">
                  <Star
                    strokeWidth={1}
                    className="w-4 h-4 fill-warning text-warning"
                  />
                  <span className="font-bold">4.8</span>
                  <span className="text-muted-foreground text-sm">(3)</span>
                </div>
              </div>
              <div className="space-y-4">
                {mockReviews.map((review, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-4 rounded-xl bg-secondary/30"
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

          {/* Right — Agent + Contact */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agent / Agency card — populated from supplier onboarding data */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-24">
              {/* Agency header */}
              <div className="p-5 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Listed by
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-12 h-12 border-2 border-primary/20 shrink-0">
                    <AvatarImage src={property.agentAvatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {property.agent[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-foreground truncate">
                        {property.agent}
                      </p>
                      <CheckCircle2
                        strokeWidth={1.5}
                        className="w-3.5 h-3.5 text-success shrink-0"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real Estate Agency · Lagos
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Specialising in premium residential and commercial properties
                  across Lagos and Abuja since 2015.
                </p>
              </div>

              {/* Agency stats */}
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                {[
                  { label: "Listings", value: "24" },
                  { label: "Response", value: "98%" },
                  { label: "Deals closed", value: "180+" },
                ].map((s) => (
                  <div key={s.label} className="px-3 py-3 text-center">
                    <p className="text-sm font-bold text-foreground">
                      {s.value}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-5">
                <div className="space-y-2 mb-4 text-sm">
                  <a
                    href={`tel:${property.agentPhone}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone strokeWidth={1} className="w-4 h-4 text-primary" />
                    {property.agentPhone}
                  </a>
                  <a
                    href={`mailto:${property.agentEmail}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail strokeWidth={1} className="w-4 h-4 text-primary" />
                    {property.agentEmail}
                  </a>
                </div>

                <div className="flex gap-2 mb-5">
                  <Button
                    className="flex-1 rounded-xl gap-1.5 text-sm"
                    onClick={() => window.open(`tel:${property.agentPhone}`)}
                  >
                    <Phone strokeWidth={1} className="w-4 h-4" /> Call
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl gap-1.5 text-sm"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${property.agentPhone.replace(/\D/g, "")}`,
                      )
                    }
                  >
                    <Phone strokeWidth={1} className="w-4 h-4" /> WhatsApp
                  </Button>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                    <Calendar
                      strokeWidth={1}
                      className="w-4 h-4 text-primary"
                    />
                    Send a Message
                  </h4>
                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <Input
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      required
                      className="rounded-xl text-sm h-10"
                    />
                    <Input
                      placeholder="Phone number"
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          phone: e.target.value,
                        })
                      }
                      required
                      className="rounded-xl text-sm h-10"
                    />
                    <Input
                      type="email"
                      placeholder="Email address"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          email: e.target.value,
                        })
                      }
                      className="rounded-xl text-sm h-10"
                    />
                    <Textarea
                      placeholder={`I'm interested in ${property.title}...`}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      rows={3}
                      className="rounded-xl text-sm resize-none"
                    />
                    <Button
                      type="submit"
                      className="w-full rounded-xl font-semibold"
                    >
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
