"use client";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, AlertCircle, Loader2 } from "lucide-react";

interface LocationPermissionBannerProps {
  permissionStatus: PermissionState | null;
  loading: boolean;
  error: string | null;
  onRequestLocation: () => void;
}

const LocationPermissionBanner = ({
  permissionStatus,
  loading,
  error,
  onRequestLocation,
}: LocationPermissionBannerProps) => {
  if (permissionStatus === "granted" && !error) {
    return (
      <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl p-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-success" strokeWidth={1} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">Location enabled</p>
          <p className="text-muted-foreground text-xs">
            Showing artisans near you, sorted by distance
          </p>
        </div>
      </div>
    );
  }

  if (error || permissionStatus === "denied") {
    return (
      <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
          <AlertCircle className="w-5 h-5 text-destructive" strokeWidth={1} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground text-sm">Location unavailable</p>
          <p className="text-muted-foreground text-xs">
            {error || "Enable location in your browser settings for nearby artisans"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRequestLocation}>
          Try Again
        </Button>
      </div>
    );
  }

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

  // Prompt state
  return (
    <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
        <MapPin className="w-5 h-5 text-primary" strokeWidth={1} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground text-sm">Enable location services</p>
        <p className="text-muted-foreground text-xs">
          Find skilled artisans near you — just like Bolt finds drivers nearby
        </p>
      </div>
      <Button size="sm" onClick={onRequestLocation}>
        <Navigation className="w-4 h-4 mr-2" strokeWidth={1} />
        Enable
      </Button>
    </div>
  );
};

export default LocationPermissionBanner;
