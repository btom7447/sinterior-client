"use client";

import { useState, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Building2, Search, Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import PropertyCard from "@/components/real-estate/PropertyCard";
import { apiGet } from "@/lib/apiClient";
import { type ApiProperty, type Pagination } from "@/types/api";

const propertyTypes = ["House", "Land", "Apartment", "Commercial", "Villa", "Town House"];

export default function RealEstatePage() {
  const [properties, setProperties] = useState<ApiProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPropertyType, setSelectedPropertyType] = useState("");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (selectedType === "For Sale") params.set("type", "sale");
      if (selectedType === "For Rent") params.set("type", "rent");
      if (selectedPropertyType) params.set("propertyType", selectedPropertyType);
      if (debouncedSearch) params.set("city", debouncedSearch);

      const data = await apiGet<{ data: ApiProperty[]; pagination: Pagination }>(
        `/properties?${params}`
      );
      setProperties(data.data || []);
      setPagination(data.pagination);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedPropertyType, debouncedSearch]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const toggleLike = (id: string) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-foreground text-sm mb-3">Property Type</h3>
        <div className="space-y-2.5">
          {propertyTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedPropertyType(selectedPropertyType === type ? "" : type)}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedPropertyType === type
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Building2 strokeWidth={1} className="w-4 h-4" />
            <span className="text-sm font-semibold">Properties</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Discover <span className="gradient-text">Real Estate</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore properties, land, and construction projects across Nigeria.
          </p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-5 flex flex-col gap-5">
              <h2 className="font-semibold text-foreground">Property Preference</h2>
              <FilterContent />
              {selectedPropertyType && (
                <button
                  onClick={() => setSelectedPropertyType("")}
                  className="w-full py-2.5 rounded-xl border border-border text-sm text-primary font-semibold hover:bg-primary/5 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search by city or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 rounded-xl bg-card border-border"
                />
              </div>
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden rounded-xl px-4 gap-2 relative">
                    <Filter strokeWidth={1} className="w-4 h-4" />
                    Filters
                    {selectedPropertyType && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">1</span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <SlidersHorizontal strokeWidth={1} className="w-4 h-4" />
                      Property Preference
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex gap-2 mb-6">
              {["All", "For Sale", "For Rent"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedType(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedType === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <p className="text-muted-foreground text-sm mb-6">
              Property — Showing result ({pagination.total})
            </p>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card-interactive overflow-hidden">
                    <Skeleton className="w-full h-52" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-3/4" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="pt-3 border-t border-border flex justify-between">
                        <Skeleton className="h-6 w-28" />
                        <Skeleton className="h-7 w-7 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Building2 strokeWidth={1} className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">No properties found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    isLiked={likedItems.has(property._id)}
                    onToggleLike={toggleLike}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
