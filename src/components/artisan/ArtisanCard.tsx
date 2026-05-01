"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Star, MapPin, ShieldCheck, ShieldOff, Navigation, Ban,
  Clock, Calendar, Tag, Ruler, Hash,
} from "lucide-react";
import { type ApiArtisan, formatNaira, resolveAssetUrl } from "@/types/api";

interface ArtisanCardProps {
  artisan: ApiArtisan;
}

const MODE_META: Record<string, { icon: React.ElementType; label: string }> = {
  daily:  { icon: Calendar, label: "Daily" },
  hourly: { icon: Clock,    label: "Hourly" },
  flat:   { icon: Tag,      label: "Flat rate" },
  sqm:    { icon: Ruler,    label: "Per m²" },
  unit:   { icon: Hash,     label: "Per unit" },
};

function PricingDisplay({ artisan }: { artisan: ApiArtisan }) {
  const modes = artisan.pricingModes ?? [];
  const rates: number[] = [];
  if (artisan.pricePerDay)  rates.push(artisan.pricePerDay);
  if (artisan.pricePerHour) rates.push(artisan.pricePerHour);
  const fromRate = rates.length > 0 ? Math.min(...rates) : null;
  const rateUnit =
    fromRate === artisan.pricePerHour && fromRate !== artisan.pricePerDay
      ? "/ hr"
      : fromRate !== null
      ? "/ day"
      : null;

  return (
    <div className="pt-4 border-t border-border">
      <div className="flex items-end justify-between mb-3">
        <div>
          {fromRate !== null ? (
            <>
              <span className="font-display font-bold text-lg text-foreground">
                From {formatNaira(fromRate)}
              </span>
              <span className="text-muted-foreground text-sm ml-1">{rateUnit}</span>
            </>
          ) : (
            <span className="font-medium text-sm text-muted-foreground">Quote only</span>
          )}
        </div>
      </div>
      {modes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {modes.map((m) => {
            const meta = MODE_META[m];
            if (!meta) return null;
            const Icon = meta.icon;
            return (
              <span
                key={m}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                title={meta.label}
              >
                <Icon className="w-3 h-3" strokeWidth={1.5} />
                {meta.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
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
            {artisan.reviewCount || 0} reviews
          </p>

          <div className="flex items-end justify-between">
            <PricingDisplay artisan={artisan} />
            <div className="ml-3 shrink-0">
              {isSuspended ? (
                <Button size="sm" variant="outline" disabled className="rounded-lg">
                  Unavailable
                </Button>
              ) : (
                <Button size="sm" className="rounded-lg">Book Now</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArtisanCard;
