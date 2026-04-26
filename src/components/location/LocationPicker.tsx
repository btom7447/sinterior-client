"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MapPin, Search, Loader2, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
}

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
  onChange: (loc: { latitude: number; longitude: number; address: string }) => void;
}

const NIGERIA_CENTER: [number, number] = [9.082, 8.6753];
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export default function LocationPicker({
  latitude,
  longitude,
  address,
  onChange,
}: LocationPickerProps) {
  const [query, setQuery] = useState(address);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Configure Leaflet's default marker icon (icon paths break under bundlers).
  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
    })();
  }, []);

  // Search debounce — fair-use compliant with Nominatim (1 req/sec)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 3 || query === address) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `${NOMINATIM_BASE}/search?format=json&countrycodes=ng&limit=6&q=${encodeURIComponent(
          query
        )}`;
        const res = await fetch(url);
        const data: NominatimResult[] = await res.json();
        setResults(data);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, address]);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`
      );
      const data = await res.json();
      return data.display_name || "";
    } catch {
      return "";
    }
  };

  const pickResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lon = parseFloat(r.lon);
    setQuery(r.display_name);
    setShowResults(false);
    onChange({ latitude: lat, longitude: lon, address: r.display_name });
  };

  const useGps = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const addr = await reverseGeocode(lat, lng);
        setQuery(addr);
        onChange({ latitude: lat, longitude: lng, address: addr });
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const center: [number, number] =
    latitude != null && longitude != null ? [latitude, longitude] : NIGERIA_CENTER;
  const zoom = latitude != null && longitude != null ? 17 : 6;

  const handleMarkerDragEnd = async () => {
    const m = markerRef.current;
    if (!m) return;
    const { lat, lng } = m.getLatLng();
    const addr = await reverseGeocode(lat, lng);
    setQuery(addr);
    onChange({ latitude: lat, longitude: lng, address: addr });
  };

  return (
    <div className="space-y-3">
      {/* Address search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          placeholder="Search your address (street, area, city)"
          className="w-full pl-9 pr-10 h-11 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
        )}

        {showResults && results.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full bg-card border border-border rounded-xl shadow-lg max-h-64 overflow-y-auto">
            {results.map((r) => (
              <li key={r.place_id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickResult(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex items-start gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{r.display_name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* GPS hint button */}
      <button
        type="button"
        onClick={useGps}
        disabled={gpsLoading}
        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
      >
        {gpsLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Navigation className="w-3.5 h-3.5" />
        )}
        {gpsLoading ? "Locating…" : "Use my GPS as a starting point"}
      </button>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-border h-64 relative">
        <MapContainer
          key={`${center[0]}-${center[1]}-${zoom}`}
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {latitude != null && longitude != null && (
            <Marker
              position={[latitude, longitude]}
              draggable
              ref={(ref) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                markerRef.current = ref as any;
              }}
              eventHandlers={{ dragend: handleMarkerDragEnd }}
            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        {latitude != null && longitude != null
          ? "Drag the pin to fine-tune your exact location."
          : "Search your address or use GPS to drop a pin, then drag for accuracy."}
      </p>
    </div>
  );
}
