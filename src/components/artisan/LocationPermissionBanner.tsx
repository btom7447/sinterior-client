"use client";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2, X } from "lucide-react";

interface LocationPermissionBannerProps {
  permissionStatus: PermissionState | null;
  loading: boolean;
  error: string | null;
  hasLocation: boolean;
  nearbyEnabled: boolean;
  onRequestLocation: () => void;
  onToggleNearby: () => void;
}

const LocationPermissionBanner = ({
  permissionStatus,
  loading,
  error,
  hasLocation,
  nearbyEnabled,
  onRequestLocation,
  onToggleNearby,
}: LocationPermissionBannerProps) => {
  // Nearby is active — show toggle-off option
  if (nearbyEnabled && hasLocation) {
    return (
      <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl p-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-success" strokeWidth={1} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">Nearby search active</p>
          <p className="text-muted-foreground text-xs">
            Showing artisans closest to you, sorted by distance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onToggleNearby}>
          <X className="w-4 h-4 mr-1" strokeWidth={1} />
          Show All
        </Button>
      </div>
    );
  }

  // Location denied or errored — hide banner, artisans show via general endpoint
  if (error || permissionStatus === "denied") {
    return null;
  }

  // Getting location...
  if (loading) {
    return (
      <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-primary animate-spin" strokeWidth={1} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">Getting your location...</p>
          <p className="text-muted-foreground text-xs">
            This helps us find artisans near you
          </p>
        </div>
      </div>
    );
  }

  // Location available but nearby not enabled — offer to turn on
  if (hasLocation) {
    return (
      <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-primary" strokeWidth={1} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">Search nearby?</p>
          <p className="text-muted-foreground text-xs">
            Filter artisans by distance from your location
          </p>
        </div>
        <Button size="sm" onClick={onToggleNearby}>
          <Navigation className="w-4 h-4 mr-1" strokeWidth={1} />
          Search Nearby
        </Button>
      </div>
    );
  }

  // No location yet, permission not denied — prompt to enable
  return (
    <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
        <MapPin className="w-5 h-5 text-primary" strokeWidth={1} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground text-sm">Search nearby?</p>
        <p className="text-muted-foreground text-xs">
          Enable location to find artisans closest to you
        </p>
      </div>
      <Button
        size="sm"
        onClick={() => {
          onRequestLocation();
          onToggleNearby();
        }}
      >
        <Navigation className="w-4 h-4 mr-1" strokeWidth={1} />
        Search Nearby
      </Button>
    </div>
  );
};

export default LocationPermissionBanner;
