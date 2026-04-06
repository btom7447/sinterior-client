import { useState, useEffect, useCallback } from "react";

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionStatus: PermissionState | null;
}

export const useGeolocation = (options?: PositionOptions) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
    permissionStatus: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        loading: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionStatus: "granted",
        });
      },
      (error) => {
        let errorMessage = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
          permissionStatus: error.code === error.PERMISSION_DENIED ? "denied" : prev.permissionStatus,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
        ...options,
      }
    );
  }, [options]);

  useEffect(() => {
    // Check permission status first
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setState((prev) => ({ ...prev, permissionStatus: result.state }));
        if (result.state === "granted") {
          requestLocation();
        } else if (result.state === "prompt") {
          setState((prev) => ({ ...prev, loading: false }));
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Location permission denied",
          }));
        }
      });
    } else {
      // No Permissions API — don't auto-trigger the browser prompt
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [requestLocation]);

  return { ...state, requestLocation };
};
