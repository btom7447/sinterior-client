"use client";
import Link from "next/link";
import { Heart, MapPin, Bed, Bath, Maximize } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface Property {
  id: number;
  image: string;
  title: string;
  type: string;
  price: string;
  priceNum: number;
  priceLabel: string;
  location: string;
  state: string;
  beds?: number;
  baths?: number;
  sqft?: string;
  agent: string;
  agentAvatar: string;
  status: string;
  featured?: boolean;
  amenities: string[];
}

interface PropertyCardProps {
  property: Property;
  isLiked: boolean;
  onToggleLike: (id: number) => void;
}

export default function PropertyCard({ property, isLiked, onToggleLike }: PropertyCardProps) {
  return (
    <Link href={`/real-estate/${property.id}`}>
    <div className="card-interactive overflow-hidden bg-card group">
      <div className="relative overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={`text-xs font-semibold ${property.status === "For Sale" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}`}>
            {property.status}
          </Badge>
          {property.featured && (
            <Badge className="bg-warning text-warning-foreground text-xs font-semibold">Featured</Badge>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleLike(property.id); }}
          className="absolute top-3 right-3 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card transition-colors"
        >
          <Heart strokeWidth={1} className={`w-4 h-4 ${isLiked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
        </button>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1">
          <MapPin strokeWidth={1} className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">{property.location}, {property.state}</span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{property.type}</p>
        <h3 className="font-display font-semibold text-foreground mb-3 line-clamp-1">{property.title}</h3>

        {(property.beds || property.baths || property.sqft) && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            {property.beds && (
              <div className="flex items-center gap-1">
                <Bed strokeWidth={1} className="w-4 h-4" />
                <span>{property.beds} Beds</span>
              </div>
            )}
            {property.baths && (
              <div className="flex items-center gap-1">
                <Bath strokeWidth={1} className="w-4 h-4" />
                <span>{property.baths} Baths</span>
              </div>
            )}
            {property.sqft && (
              <div className="flex items-center gap-1">
                <Maximize strokeWidth={1} className="w-4 h-4" />
                <span>{property.sqft}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div>
            <span className="font-display font-bold text-lg text-foreground">{property.price}</span>
            {property.priceLabel && (
              <span className="text-muted-foreground text-xs ml-1">{property.priceLabel}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={property.agentAvatar} />
              <AvatarFallback>{property.agent[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate max-w-[80px]">{property.agent}</span>
          </div>
        </div>
      </div>
    </div>
    </Link>
  );
}
