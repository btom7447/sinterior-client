"use client";
import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { type ApiProperty, formatNaira, getPrimaryImage } from "@/types/api";

interface PropertyCardProps {
  property: ApiProperty;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
}

export default function PropertyCard({ property, isLiked, onToggleLike }: PropertyCardProps) {
  const statusLabel = property.type === "sale" ? "For Sale" : "For Rent";
  const priceLabel = property.type === "rent" ? "/yr" : "";
  const supplier = property.supplierId;
  const sizeDisplay = property.size ? `${property.size} ${property.sizeUnit || "sqft"}` : null;

  return (
    <Link href={`/real-estate/${property._id}`}>
      <div className="card-interactive overflow-hidden bg-card group">
        <div className="relative overflow-hidden">
          <img
            src={getPrimaryImage(property.images)}
            alt={property.title}
            className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`text-xs font-semibold ${property.type === "sale" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
              {statusLabel}
            </Badge>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleLike(property._id); }}
            className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
          >
            <Heart strokeWidth={1} className={`w-4 h-4 ${isLiked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
          </button>
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1">
            <MapPin strokeWidth={1} className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">
              {property.city || property.location}{property.state ? `, ${property.state}` : ""}
            </span>
          </div>
        </div>

        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{property.propertyType}</p>
          <h3 className="font-display font-semibold text-foreground mb-3 line-clamp-1">{property.title}</h3>

          {(property.bedrooms || property.bathrooms || sizeDisplay) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              {property.bedrooms != null && (
                <div className="flex items-center gap-1">
                  <Bed strokeWidth={1} className="w-4 h-4" />
                  <span>{property.bedrooms} Beds</span>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="flex items-center gap-1">
                  <Bath strokeWidth={1} className="w-4 h-4" />
                  <span>{property.bathrooms} Baths</span>
                </div>
              )}
              {sizeDisplay && (
                <div className="flex items-center gap-1">
                  <Maximize strokeWidth={1} className="w-4 h-4" />
                  <span>{sizeDisplay}</span>
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div>
              <span className="font-display font-bold text-lg text-foreground">{formatNaira(property.price)}</span>
              {priceLabel && <span className="text-muted-foreground text-xs ml-1">{priceLabel}</span>}
            </div>
            {supplier && (
              <div className="flex items-center gap-2">
                <Avatar className="w-7 h-7">
                  <AvatarImage src={supplier.avatarUrl || ""} />
                  <AvatarFallback>{supplier.fullName[0]}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate max-w-[80px]">{supplier.fullName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
