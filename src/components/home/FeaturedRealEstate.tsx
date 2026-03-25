"use client";
import Link from "next/link";
import { Building2, MapPin, Bed, Bath, Maximize, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { properties } from "@/data/properties";

const featured = properties.filter((p) => p.featured).slice(0, 3);

const FeaturedRealEstate = () => {
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
              Handpicked listings across Nigeria's most sought-after locations.
            </p>
          </div>
          <Link href="/real-estate" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:underline">
            View all <ArrowRight strokeWidth={1} className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((property, i) => (
            <Link key={property.id} href={`/real-estate/${property.id}`} data-aos="fade-up" data-aos-delay={i * 100}>
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
                    <Badge className="bg-warning text-warning-foreground text-xs font-semibold">Featured</Badge>
                  </div>
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

                  <div className="pt-3 border-t border-border">
                    <span className="font-display font-bold text-lg text-foreground">{property.price}</span>
                    {property.priceLabel && (
                      <span className="text-muted-foreground text-xs ml-1">{property.priceLabel}</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
