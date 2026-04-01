"use client";

import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useArtisanSearch } from "@/hooks/useArtisanSearch";
import LocationPermissionBanner from "@/components/artisan/LocationPermissionBanner";
import ArtisanCard from "@/components/artisan/ArtisanCard";

const allSuggestions = [
  "Electrical", "Electrician", "Electrical wiring", "Electrical repair",
  "Plumbing", "Plumber", "Pipe fitting", "Plumbing repair",
  "Painting", "Painter", "Interior painting", "Exterior painting",
  "Carpentry", "Carpenter", "Wood work", "Furniture making",
  "Masonry", "Mason", "Brick laying", "Block work",
  "Roofing", "Roofer", "Roof repair", "Roof installation",
  "Tiling", "Tiler", "Floor tiling", "Wall tiling",
  "Welding", "Welder", "Gate fabrication",
  "POP ceiling", "Screeding", "Plastering",
];

export default function ArtisanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(50);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { latitude, longitude, loading: geoLoading, error: geoError, permissionStatus, requestLocation } = useGeolocation();

  const { data: artisans, isLoading, error } = useArtisanSearch({
    latitude,
    longitude,
    radiusKm,
    category: selectedCategory,
    limit: 20,
    enabled: !geoLoading,
  });

  const categories = [
    { id: null, label: "All Services" },
    { id: "electrical", label: "Electrical" },
    { id: "plumbing", label: "Plumbing" },
    { id: "painting", label: "Painting" },
    { id: "carpentry", label: "Carpentry" },
    { id: "masonry", label: "Masonry" },
    { id: "roofing", label: "Roofing" },
    { id: "tiling", label: "Tiling" },
  ];

  const radiusOptions = [10, 25, 50, 100, 200];

  const filteredSuggestions = searchQuery.length > 0
    ? allSuggestions.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : allSuggestions.slice(0, 8);

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    const matchedCategory = categories.find(
      (c) => c.id && suggestion.toLowerCase().includes(c.id)
    );
    if (matchedCategory) {
      setSelectedCategory(matchedCategory.id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredArtisans = artisans?.filter((artisan) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      artisan.profileId?.fullName?.toLowerCase().includes(query) ||
      artisan.skill?.toLowerCase().includes(query) ||
      artisan.city?.toLowerCase().includes(query)
    );
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Find Skilled Artisans
          </h1>
          <p className="text-muted-foreground">
            Discover verified professionals near you for all your construction needs
          </p>
        </div>

        <LocationPermissionBanner
          permissionStatus={permissionStatus}
          loading={geoLoading}
          error={geoError}
          onRequestLocation={requestLocation}
        />

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1" ref={searchRef}>
            <Search strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
            <Input
              placeholder="Search by name, skill, or location..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="pl-12 py-6 rounded-xl bg-card border-border"
            />
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="py-2">
                  <p className="px-4 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {searchQuery ? "Suggestions" : "Popular Services"}
                  </p>
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition-colors text-left"
                    >
                      <Search strokeWidth={1} className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" className="rounded-xl px-6">
            <Filter strokeWidth={1} className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {latitude && longitude && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Search radius:</span>
            <div className="flex gap-2">
              {radiusOptions.map((radius) => (
                <button
                  key={radius}
                  onClick={() => setRadiusKm(radius)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    radiusKm === radius
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {radius} km
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id || "all"}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <p className="text-muted-foreground text-sm mb-6">
          {isLoading ? "Searching..." : `Showing ${filteredArtisans?.length || 0} artisans`}
          {latitude && longitude && ` within ${radiusKm} km`}
        </p>

        {isLoading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Failed to load artisans. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !error && filteredArtisans?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-2">No artisans found</p>
            <p className="text-muted-foreground text-sm">
              Try expanding your search radius or changing the category
            </p>
          </div>
        )}

        {!isLoading && !error && filteredArtisans && filteredArtisans.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtisans.map((artisan) => (
              <ArtisanCard key={artisan._id} artisan={artisan} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
