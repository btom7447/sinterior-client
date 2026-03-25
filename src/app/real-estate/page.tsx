"use client";

import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import {
  Building2, Search, Filter, SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import PropertyCard from "@/components/real-estate/PropertyCard";
import { properties } from "@/data/properties";

const propertyTypes = ["House", "Land", "Apartment", "Commercial", "Villa", "Town House"];
const amenitiesList = ["Pet Friendly", "Parking", "Private Pool", "Gym", "Gated", "Elevator"];
const locationOptions = ["Lekki Phase 1", "Victoria Island", "Banana Island", "Ikeja GRA", "Ajah", "Gwarimpa"];

const formatPrice = (val: number) => {
  if (val >= 1000000) return `₦${(val / 1000000).toFixed(0)}M`;
  if (val >= 1000) return `₦${(val / 1000).toFixed(0)}K`;
  return `₦${val}`;
};

export default function RealEstatePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState("default");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [budgetRange, setBudgetRange] = useState([0, 300000000]);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());

  const toggleSetItem = (set: Set<string>, item: string): Set<string> => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    return next;
  };

  const toggleType = (t: string) => setSelectedTypes((s) => toggleSetItem(s, t));
  const toggleAmenity = (a: string) => setSelectedAmenities((s) => toggleSetItem(s, a));
  const toggleLocation = (l: string) => setSelectedLocations((s) => toggleSetItem(s, l));

  const resetFilters = () => {
    setBudgetRange([0, 300000000]);
    setSelectedTypes(new Set());
    setSelectedAmenities(new Set());
    setSelectedLocations(new Set());
  };

  const activeFilterCount =
    (budgetRange[0] > 0 || budgetRange[1] < 300000000 ? 1 : 0) +
    selectedTypes.size + selectedAmenities.size + selectedLocations.size;

  const filteredProperties = properties
    .filter((p) => {
      const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
      const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase()) || p.state.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBudget = p.priceNum >= budgetRange[0] && p.priceNum <= budgetRange[1];
      const matchesType = selectedTypes.size === 0 || selectedTypes.has(p.type);
      const matchesAmenity = selectedAmenities.size === 0 || [...selectedAmenities].every((a) => p.amenities.includes(a));
      const matchesLocation = selectedLocations.size === 0 || selectedLocations.has(p.location);
      return matchesStatus && matchesSearch && matchesBudget && matchesType && matchesAmenity && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === "low") return a.priceNum - b.priceNum;
      if (sortBy === "high") return b.priceNum - a.priceNum;
      return 0;
    });

  const toggleLike = (id: number) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {activeFilterCount > 0 && (
        <p className="text-xs text-muted-foreground">{activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} active</p>
      )}
      <div>
        <h3 className="font-semibold text-foreground text-sm mb-3">Budget Range</h3>
        <Slider value={budgetRange} onValueChange={setBudgetRange} min={0} max={300000000} step={1000000} className="mb-3" />
        <div className="flex justify-between">
          <div className="bg-secondary rounded-lg px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground">Minimum</p>
            <p className="text-xs font-semibold text-foreground">{formatPrice(budgetRange[0])}</p>
          </div>
          <div className="bg-secondary rounded-lg px-3 py-1.5">
            <p className="text-[10px] text-muted-foreground">Maximum</p>
            <p className="text-xs font-semibold text-foreground">{formatPrice(budgetRange[1])}</p>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-foreground text-sm mb-3">Location</h3>
        <div className="space-y-2.5">
          {locationOptions.map((loc) => (
            <label key={loc} className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox checked={selectedLocations.has(loc)} onCheckedChange={() => toggleLocation(loc)} />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">{loc}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-foreground text-sm mb-3">Property Type</h3>
        <div className="space-y-2.5">
          {propertyTypes.map((type) => (
            <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox checked={selectedTypes.has(type)} onCheckedChange={() => toggleType(type)} />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-foreground text-sm mb-3">Amenities</h3>
        <div className="space-y-2.5">
          {amenitiesList.map((amenity) => (
            <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox checked={selectedAmenities.has(amenity)} onCheckedChange={() => toggleAmenity(amenity)} />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">{amenity}</span>
            </label>
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
              <button
                onClick={resetFilters}
                className="w-full py-2.5 rounded-xl border border-border text-sm text-primary font-semibold hover:bg-primary/5 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search
                  strokeWidth={1}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                />
                <Input
                  placeholder="Search by location, property type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 rounded-xl bg-card border-border"
                />
              </div>
              <div className="flex gap-2">
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="lg:hidden rounded-xl px-4 gap-2 relative"
                    >
                      <Filter strokeWidth={1} className="w-4 h-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <SlidersHorizontal
                          strokeWidth={1}
                          className="w-4 h-4"
                        />
                        Property Preference
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="default">Sort by</option>
                  <option value="low">Low to High</option>
                  <option value="high">High to Low</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              {["All", "For Sale", "For Rent"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedStatus === status
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <p className="text-muted-foreground text-sm mb-6">
              Property — Showing result ({filteredProperties.length})
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isLiked={likedItems.has(property.id)}
                  onToggleLike={toggleLike}
                />
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                <Building2
                  strokeWidth={1}
                  className="w-16 h-16 mx-auto mb-4 opacity-30"
                />
                <p className="text-lg mb-2">No properties found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
