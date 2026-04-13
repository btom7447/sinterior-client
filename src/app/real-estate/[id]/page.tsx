"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { apiGet, apiPost } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { type ApiProperty, formatNaira, getPrimaryImage, resolveAssetUrl } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, MapPin, Bed, Bath, Maximize, Heart, Share2,
  Phone, CheckCircle2, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [property, setProperty] = useState<ApiProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [chatting, setChatting] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ data: { property: ApiProperty } }>(`/properties/${id}`);
        setProperty(data.data.property);
      } catch {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChatAgent = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to chat with the agent.");
      router.push("/login");
      return;
    }
    if (!property?.supplierId?._id) return;
    setChatting(true);
    try {
      await apiPost("/chat/messages", {
        receiverId: property.supplierId._id,
        content: `Hi! I'm interested in your property listing: "${property.title}".`,
      });
      router.push("/dashboard/chat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start chat.");
    } finally {
      setChatting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-5 w-32 mb-6" />
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/3 mb-8" />
          <Skeleton className="w-full aspect-video rounded-2xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 rounded-2xl" />
              <Skeleton className="h-32 rounded-2xl" />
            </div>
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!property) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Property not found</p>
          <Button variant="outline" onClick={() => router.push("/real-estate")}>Back to Properties</Button>
        </div>
      </AppLayout>
    );
  }

  const images = property.images.length > 0 ? property.images.map(resolveAssetUrl) : [getPrimaryImage([])];
  const supplier = property.supplierId;
  const statusLabel = property.type === "sale" ? "For Sale" : "For Rent";
  const priceLabel = property.type === "rent" ? "/yr" : "";
  const sizeDisplay = property.size ? `${property.size} ${property.sizeUnit || "sqft"}` : null;
  const locationDisplay = [property.location, property.city, property.state].filter(Boolean).join(", ");

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back + actions */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft strokeWidth={1} className="w-4 h-4" />
            <span className="text-sm">Back to Properties</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setLiked(!liked)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Heart strokeWidth={1} className={`w-5 h-5 ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </button>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Share2 strokeWidth={1} className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Title + badges */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className={`text-xs font-semibold ${property.type === "sale" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
              {statusLabel}
            </Badge>
            <Badge variant="outline" className="text-xs">{property.propertyType}</Badge>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">{property.title}</h1>
          {locationDisplay && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin strokeWidth={1} className="w-4 h-4 text-primary" />
              <span className="text-sm">{locationDisplay}</span>
            </div>
          )}
        </div>

        {/* Image gallery */}
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden bg-secondary aspect-video group">
            <img src={images[selectedImage]} alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
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
                  <span className="font-display text-3xl font-bold text-primary">{formatNaira(property.price)}</span>
                  {priceLabel && <span className="text-muted-foreground text-sm ml-2">{priceLabel}</span>}
                </div>
              </div>
              {(property.bedrooms || property.bathrooms || sizeDisplay) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                  {property.bedrooms != null && (
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <Bed strokeWidth={1} className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="font-semibold text-foreground">{property.bedrooms}</p>
                      <p className="text-xs text-muted-foreground">Bedrooms</p>
                    </div>
                  )}
                  {property.bathrooms != null && (
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <Bath strokeWidth={1} className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="font-semibold text-foreground">{property.bathrooms}</p>
                      <p className="text-xs text-muted-foreground">Bathrooms</p>
                    </div>
                  )}
                  {sizeDisplay && (
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <Maximize strokeWidth={1} className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="font-semibold text-foreground">{sizeDisplay}</p>
                      <p className="text-xs text-muted-foreground">Area</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">About This Property</h2>
                <p className="text-muted-foreground leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Features</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2.5 p-3 rounded-xl bg-secondary/50">
                      <CheckCircle2 strokeWidth={1} className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {locationDisplay && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="font-display text-xl font-bold text-foreground mb-4">Location</h2>
                <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
                  <MapPin strokeWidth={1} className="w-4 h-4 text-primary" />
                  {locationDisplay}
                </p>
                <div className="rounded-xl overflow-hidden border border-border h-64">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(locationDisplay)}&output=embed&z=15`}
                    className="w-full h-full"
                    loading="lazy"
                    title="Property location"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right — Agent + Contact */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-24">
              <div className="p-5 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Listed by</p>
                {supplier && (
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="w-12 h-12 border-2 border-primary/20 shrink-0">
                      <AvatarImage src={resolveAssetUrl(supplier.avatarUrl || "")} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{supplier.fullName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-foreground truncate">{supplier.fullName}</p>
                        <CheckCircle2 strokeWidth={1.5} className="w-3.5 h-3.5 text-success shrink-0" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {supplier.city}{supplier.state ? `, ${supplier.state}` : ""}
                      </p>
                    </div>
                  </div>
                )}
                {supplier?.bio && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{supplier.bio}</p>
                )}
              </div>

              <div className="p-5">
                {supplier?.phone && (
                  <div className="space-y-2 mb-4 text-sm">
                    <a href={`tel:${supplier.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                      <Phone strokeWidth={1} className="w-4 h-4 text-primary" />
                      {supplier.phone}
                    </a>
                  </div>
                )}

                {supplier?.phone && (
                  <div className="flex gap-2 mb-5">
                    <Button className="flex-1 rounded-xl gap-1.5 text-sm" onClick={() => window.open(`tel:${supplier.phone}`)}>
                      <Phone strokeWidth={1} className="w-4 h-4" /> Call
                    </Button>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <Button
                    onClick={handleChatAgent}
                    disabled={chatting}
                    className="w-full rounded-xl font-semibold gap-2"
                  >
                    <MessageCircle strokeWidth={1} className="w-4 h-4" />
                    {chatting ? "Starting Chat..." : "Chat with Agent"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Start a conversation about this property
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
