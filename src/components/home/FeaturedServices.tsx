"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ArtisanCard from "@/components/artisan/ArtisanCard";
import type { ArtisanSearchResult } from "@/hooks/useArtisanSearch";

const services: ArtisanSearchResult[] = [
  { id: "1", profile_id: "1", full_name: "Emmanuel Okonkwo", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", skill: "Master Electrician", skill_category: "electrical", city: "Lagos", state: "Lagos", price_per_day: 15000, currency: "NGN", is_verified: true, completed_jobs: 87, rating: 4.9, review_count: 127, distance_km: null },
  { id: "2", profile_id: "2", full_name: "Chidinma Eze", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", skill: "Interior Painter", skill_category: "painting", city: "Abuja", state: "FCT", price_per_day: 12000, currency: "NGN", is_verified: true, completed_jobs: 62, rating: 4.8, review_count: 89, distance_km: null },
  { id: "3", profile_id: "3", full_name: "Adebayo Johnson", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", skill: "Plumbing Expert", skill_category: "plumbing", city: "Port Harcourt", state: "Rivers", price_per_day: 18000, currency: "NGN", is_verified: true, completed_jobs: 104, rating: 4.7, review_count: 156, distance_km: null },
  { id: "4", profile_id: "4", full_name: "Ngozi Amadi", avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", skill: "Tile & Floor Specialist", skill_category: "tiling", city: "Enugu", state: "Enugu", price_per_day: 20000, currency: "NGN", is_verified: true, completed_jobs: 48, rating: 5.0, review_count: 64, distance_km: null },
];

const FeaturedServices = () => {
  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10" data-aos="fade-up">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">Top-Rated Artisans</h2>
            <p className="text-muted-foreground">Verified professionals ready to bring your projects to life</p>
          </div>
          <Link href="/artisan">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              View All Artisans <ArrowRight strokeWidth={1} className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((artisan, i) => (
            <div key={artisan.id} data-aos="fade-up" data-aos-delay={i * 100}>
              <ArtisanCard artisan={artisan} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
