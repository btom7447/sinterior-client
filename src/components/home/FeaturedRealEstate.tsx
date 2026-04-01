"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, MapPin, Bed, Bath, Maximize, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGet } from "@/lib/apiClient";
import { type ApiProperty, formatNaira, getPrimaryImage } from "@/types/api";

const FeaturedRealEstate = () => {
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ data: ApiProperty[] }>("/properties?limit=3");
        setProperties(data.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="section-padding bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10" data-aos="fade-up">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Building2 strokeWidth={1} className="w-4 h-4" />
              <span className="text-sm font-semibold">Real Estate</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Featured <span className="gradient-text">Properties</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Handpicked listings across Nigeria&apos;s most sought-after locations.
            </p>
          </div>
          <Link href="/real-estate" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:underline">
            View all <ArrowRight strokeWidth={1} className="w-6 h-6" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="card-interactive overflow-hidden bg-card">
                <Skeleton className="w-full h-52" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-3/4" />
                  <div className="flex gap-4"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /></div>
                  <div className="pt-3 border-t border-border"><Skeleton className="h-6 w-28" /></div>
                </div>
              </div>
            ))
          ) : properties.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Building2 strokeWidth={1} className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">No properties yet</h3>
              <p className="text-muted-foreground text-sm max-w-xs mb-4">
                Featured properties will appear here once agents list new homes and spaces.
              </p>
              <Link href="/real-estate">
                <Button variant="outline" className="rounded-xl">Browse Properties</Button>
              </Link>
            </div>
          ) : (
            properties.map((property, i) => {
              const statusLabel = property.type === "sale" ? "For Sale" : "For Rent";
              const priceLabel = property.type === "rent" ? "/yr" : "";
              const sizeDisplay = property.size ? `${property.size} ${property.sizeUnit || "sqft"}` : null;
              return (
                <Link key={property._id} href={`/real-estate/${property._id}`} data-aos="fade-up" data-aos-delay={i * 100}>
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
                            <div className="flex items-center gap-1"><Bed strokeWidth={1} className="w-4 h-4" /><span>{property.bedrooms} Beds</span></div>
                          )}
                          {property.bathrooms != null && (
                            <div className="flex items-center gap-1"><Bath strokeWidth={1} className="w-4 h-4" /><span>{property.bathrooms} Baths</span></div>
                          )}
                          {sizeDisplay && (
                            <div className="flex items-center gap-1"><Maximize strokeWidth={1} className="w-4 h-4" /><span>{sizeDisplay}</span></div>
                          )}
                        </div>
                      )}

                      <div className="pt-3 border-t border-border">
                        <span className="font-display font-bold text-lg text-foreground">{formatNaira(property.price)}</span>
                        {priceLabel && <span className="text-muted-foreground text-xs ml-1">{priceLabel}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/real-estate">
            <Button variant="outline" className="rounded-xl gap-2">
              View all properties <ArrowRight strokeWidth={1} className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRealEstate;
