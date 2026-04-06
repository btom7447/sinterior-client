import { useState, useEffect, useCallback, useRef } from "react";

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
  permissionStatus: PermissionState | null;
}

export const useGeolocation = (options?: PositionOptions) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
    permissionStatus: null,
  });

  const watchRef = useRef<number | null>(null);

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

    // Use watchPosition to get progressively more accurate readings.
    // GPS can take a few seconds to lock on — watchPosition gives us
    // the IP-based position first, then upgrades to GPS when available.
    if (watchRef.current != null) {
      navigator.geolocation.clearWatch(watchRef.current);
    }

    let settled = false;

    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setState({
          latitude,
          longitude,
          accuracy,
          error: null,
          loading: false,
          permissionStatus: "granted",
        });

        // Once we have accuracy < 100m, stop watching to save battery
        if (accuracy < 100 && !settled) {
          settled = true;
          if (watchRef.current != null) {
            navigator.geolocation.clearWatch(watchRef.current);
            watchRef.current = null;
          }
        }
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
            errorMessage = "Location request timed out. Try again.";
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
        timeout: 15000,
        maximumAge: 0, // Always get fresh position
        ...options,
      }
    );

    // Safety: stop watching after 30s no matter what
    setTimeout(() => {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
        watchRef.current = null;
      }
    }, 30000);
  }, [options]);

  useEffect(() => {
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
      setState((prev) => ({ ...prev, loading: false }));
    }

    return () => {
      if (watchRef.current != null) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, [requestLocation]);

  return { ...state, requestLocation };
};
