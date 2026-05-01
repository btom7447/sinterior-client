"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, MapPin, ShieldCheck, ShieldOff, Navigation, Ban } from "lucide-react";
import { type ApiArtisan, resolveAssetUrl } from "@/types/api";

interface ArtisanCardProps {
  artisan: ApiArtisan;
}

const ArtisanCard = ({ artisan }: ArtisanCardProps) => {
  const profile = artisan.profileId;
  const name = profile?.fullName || "Unknown";
  const avatar =
    resolveAssetUrl(profile?.avatarUrl || "") ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;
  const isSuspended = !!profile?.isSuspended;

  return (
    <Link href={`/artisan/${artisan._id}`}>
      <div className={`card-interactive overflow-hidden ${isSuspended ? "opacity-75" : ""}`}>
        <div className="relative">
          <img
            src={avatar}
            alt={name}
            className={`w-full h-48 object-cover relative z-0 ${isSuspended ? "grayscale" : ""}`}
          />
          <div className="absolute inset-0 bg-black/60 z-10" />

          {isSuspended && (
            <div className="absolute top-3 left-3 z-20 bg-destructive text-destructive-foreground px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Ban className="w-3 h-3" strokeWidth={1.5} />
              <span className="text-xs font-semibold">Unavailable</span>
            </div>
          )}

          {artisan.distanceKm != null && (
            <div className="absolute top-3 right-3 z-20 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
              <Navigation className="w-3 h-3 text-primary" strokeWidth={1} />
              <span className="text-xs font-medium">
                {Math.round(artisan.distanceKm * 10) / 10} km
              </span>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-display font-semibold text-foreground flex items-center gap-1.5">
                {name}
                {artisan.isVerified ? (
                  <span title="Verified" className="inline-flex items-center">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0" strokeWidth={1.5} />
                  </span>
                ) : (
                  <span title="Unverified" className="inline-flex items-center">
                    <ShieldOff className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                  </span>
                )}
              </h3>
              <p className="text-primary font-medium text-sm">{artisan.skill}</p>
            </div>
            <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 fill-warning text-warning" strokeWidth={1} />
              <span className="font-medium text-sm">{artisan.rating || "New"}</span>
            </div>
          </div>

          {(artisan.city || artisan.state) && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1} />
              {[artisan.city, artisan.state].filter(Boolean).join(", ")}
            </div>
          )}

          <p className="text-muted-foreground text-sm mb-4">
            {artisan.reviewCount || 0} review{artisan.reviewCount === 1 ? "" : "s"}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Quote-based pricing</p>
            {isSuspended ? (
              <Button size="sm" variant="outline" disabled className="rounded-lg">
                Unavailable
              </Button>
            ) : (
              <Button size="sm" className="rounded-lg">Request Quote</Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArtisanCard;
