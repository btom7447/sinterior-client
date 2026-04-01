"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ArtisanCard from "@/components/artisan/ArtisanCard";
import { apiGet } from "@/lib/apiClient";
import { type ApiArtisan, type Pagination } from "@/types/api";

const FeaturedServices = () => {
  const [artisans, setArtisans] = useState<ApiArtisan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ data: ApiArtisan[]; pagination: Pagination }>("/artisans?limit=4");
        setArtisans(data.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="section-padding">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10" data-aos="fade-up">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Top-Rated Artisans
            </h2>
            <p className="text-muted-foreground">
              Verified professionals ready to bring your projects to life
            </p>
          </div>
          <Link href="/artisan" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:underline">
            View all <ArrowRight strokeWidth={1} className="w-6 h-6" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="card-interactive overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="pt-4 border-t border-border flex justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : artisans.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Wrench strokeWidth={1} className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">No artisans yet</h3>
              <p className="text-muted-foreground text-sm max-w-xs mb-4">
                Skilled professionals will appear here once they join the platform.
              </p>
              <Link href="/artisan">
                <Button variant="outline" className="rounded-xl">Browse Artisans</Button>
              </Link>
            </div>
          ) : (
            artisans.map((artisan, i) => (
              <div key={artisan._id} data-aos="fade-up" data-aos-delay={i * 100}>
                <ArtisanCard artisan={artisan} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices;
