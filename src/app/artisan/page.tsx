"use client";

import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, ShieldCheck } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useArtisanSearch } from "@/hooks/useArtisanSearch";
import LocationPermissionBanner from "@/components/artisan/LocationPermissionBanner";
import ArtisanCard from "@/components/artisan/ArtisanCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { ARTISAN_SKILL_CATEGORIES } from "@/lib/constants";

const allSuggestions = ARTISAN_SKILL_CATEGORIES.flatMap((cat) => [
  cat.name,
  ...cat.skills.slice(0, 3),
]);

export default function ArtisanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(50);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { latitude, longitude, loading: geoLoading, error: geoError, permissionStatus, requestLocation } = useGeolocation();

  const hasLocation = !!(latitude && longitude);

  const { data: artisans, isLoading, error } = useArtisanSearch({
    latitude: nearbyEnabled ? latitude : null,
    longitude: nearbyEnabled ? longitude : null,
    radiusKm,
    category: selectedCategory,
    skill: selectedSkill,
    limit: 20,
  });

  // When category changes, clear the selected skill so we don't have a stale filter.
  const selectedCategoryDef = ARTISAN_SKILL_CATEGORIES.find((c) => c.id === selectedCategory);
  const subcategorySkills = selectedCategoryDef?.skills || [];

  const categories = [
    { id: null, label: "All Services" },
    ...ARTISAN_SKILL_CATEGORIES.map((cat) => ({ id: cat.id, label: cat.name })),
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
          hasLocation={hasLocation}
          nearbyEnabled={nearbyEnabled}
          onRequestLocation={requestLocation}
          onToggleNearby={() => setNearbyEnabled((prev) => !prev)}
        />

        {/* Escrow trust note — payments are held until the work is accepted. */}
        <div className="mb-6 rounded-2xl bg-success/5 border border-success/20 p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-success" strokeWidth={1.5} />
          </div>
          <div className="text-sm">
            <p className="font-semibold text-foreground">Payments protected by Sintherior escrow</p>
            <p className="text-muted-foreground mt-0.5">
              Your money is held by Sintherior until the job is completed and you accept the work.
              Cancel anytime before start for a full refund — and raise a dispute if anything goes
              wrong.
            </p>
          </div>
        </div>

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

        {nearbyEnabled && hasLocation && (
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

        <div className="flex gap-2 overflow-x-auto pb-4 mb-3 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id || "all"}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedSkill(null); // reset subcategory when category changes
              }}
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

        {/* Subcategory (skill) chips — appear once a category is selected. Optional. */}
        {selectedCategory && subcategorySkills.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            <button
              onClick={() => setSelectedSkill(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedSkill === null
                  ? "bg-foreground text-background"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              All {selectedCategoryDef?.name.split(" ")[0].toLowerCase()}
            </button>
            {subcategorySkills.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSkill(s === selectedSkill ? null : s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedSkill === s
                    ? "bg-foreground text-background"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <p className="text-muted-foreground text-sm mb-6">
          {isLoading ? "Searching..." : `Showing ${filteredArtisans?.length || 0} artisans`}
          {nearbyEnabled && hasLocation && ` within ${radiusKm} km`}
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
          <ErrorState
            title="Couldn't load artisans"
            description="We hit a snag fetching the artisan list. This is usually temporary."
            onRetry={() => window.location.reload()}
          />
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
