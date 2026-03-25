"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, MapPin, CheckCircle2, Navigation } from "lucide-react";
import type { ArtisanSearchResult } from "@/hooks/useArtisanSearch";

interface ArtisanCardProps {
  artisan: ArtisanSearchResult;
}

const ArtisanCard = ({ artisan }: ArtisanCardProps) => {
  const formatPrice = (price: number | null, currency: string | null) => {
    if (!price) return "Contact for pricing";
    const symbol = currency === "NGN" ? "₦" : "$";
    return `${symbol}${price.toLocaleString()}`;
  };

  return (
    <Link href={`/artisan/${artisan.id}`}>
      <div className="card-interactive overflow-hidden">
        {/* Image */}
        <div className="relative">
          <img
            src={
              artisan.avatar_url ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${artisan.full_name}`
            }
            alt={artisan.full_name}
            className="w-full h-48 object-cover relative z-0"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60 z-10" />

          {/* km away pill — top right */}
          {artisan.distance_km !== null && (
            <div className="absolute top-3 right-3 z-20 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
              <Navigation className="w-3 h-3 text-primary" strokeWidth={1} />
              <span className="text-xs font-medium">{artisan.distance_km} km</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              {/* Name + verified icon on same row */}
              <h3 className="font-display font-semibold text-foreground flex items-center gap-1.5">
                {artisan.full_name}
                {artisan.is_verified && (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" strokeWidth={1.5} />
                )}
              </h3>
              <p className="text-primary font-medium text-sm">
                {artisan.skill}
              </p>
            </div>
            <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-warning text-warning" strokeWidth={1} />
              <span className="font-medium text-sm">{artisan.rating || "New"}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
            <MapPin className="w-3.5 h-3.5" strokeWidth={1} />
            {artisan.city}, {artisan.state}
          </div>

          <p className="text-muted-foreground text-sm mb-4">
            {artisan.completed_jobs || 0} jobs completed •{" "}
            {artisan.review_count || 0} reviews
          </p>

          {/* Price */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <span className="font-display font-bold text-lg text-foreground">
                {formatPrice(artisan.price_per_day, artisan.currency)}
              </span>
              {artisan.price_per_day && (
                <span className="text-muted-foreground text-sm ml-1">per day</span>
              )}
            </div>
            <Button size="sm" className="rounded-lg">Book Now</Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArtisanCard;
