"use client";

import { useEffect, useState, useRef } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { NIGERIAN_STATES, NIGERIAN_ZONES, formatNaira } from "@/lib/constants";
import {
  Truck,
  Save,
  Plus,
  X,
  Phone,
  Globe,
  Search,
  MapPin,
  ChevronDown,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface CourierService {
  name: string;
  phone: string;
  website: string;
}

export default function DashboardLogistics() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"rates" | "couriers">("rates");
  const [expandedZones, setExpandedZones] = useState<Set<string>>(new Set(NIGERIAN_ZONES.map((z) => z.name)));
  const courierIdRef = useRef(0);

  const [rates, setRates] = useState<Record<string, string>>({});
  const [couriers, setCouriers] = useState<(CourierService & { _id: number })[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiGet<{ data: { supplier: { shippingRates?: Record<string, number>; courierServices?: CourierService[] } } }>("/suppliers/me");
        const s = res.data.supplier;
        const rateMap: Record<string, string> = {};
        if (s.shippingRates) {
          for (const [state, price] of Object.entries(s.shippingRates)) {
            rateMap[state] = String(price);
          }
        }
        setRates(rateMap);
        setCouriers(
          (s.courierServices || []).map((c) => ({
            ...c,
            _id: ++courierIdRef.current,
          }))
        );
      } catch {
        // No supplier profile yet
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const setRate = (state: string, value: string) => {
    setRates((prev) => ({ ...prev, [state]: value }));
  };

  const setZoneRate = (zone: { states: string[] }, value: string) => {
    setRates((prev) => {
      const next = { ...prev };
      zone.states.forEach((s) => { next[s] = value; });
      return next;
    });
  };

  const setAllRates = (value: string) => {
    const newRates: Record<string, string> = {};
    NIGERIAN_STATES.forEach((s) => { newRates[s] = value; });
    setRates(newRates);
  };

  const toggleZone = (name: string) => {
    setExpandedZones((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const addCourier = () => {
    setCouriers((prev) => [...prev, { _id: ++courierIdRef.current, name: "", phone: "", website: "" }]);
  };

  const updateCourier = (id: number, field: keyof CourierService, value: string) => {
    setCouriers((prev) =>
      prev.map((c) => (c._id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeCourier = (id: number) => {
    setCouriers((prev) => prev.filter((c) => c._id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const shippingRates: Record<string, number> = {};
      for (const [state, val] of Object.entries(rates)) {
        const num = parseFloat(val);
        if (!isNaN(num) && num >= 0) {
          shippingRates[state] = num;
        }
      }

      const courierServices = couriers
        .filter((c) => c.name.trim())
        .map(({ name, phone, website }) => ({ name: name.trim(), phone: phone.trim(), website: website.trim() }));

      await apiPatch("/suppliers/shipping", { shippingRates, courierServices });
      toast.success("Logistics settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const filledCount = NIGERIAN_STATES.filter((s) => rates[s] && rates[s] !== "").length;
  const configuredCount = NIGERIAN_STATES.filter((s) => rates[s] && parseFloat(rates[s]) >= 0 && rates[s] !== "").length;

  const getZoneStats = (zone: { states: string[] }) => {
    const filled = zone.states.filter((s) => rates[s] && rates[s] !== "").length;
    const total = zone.states.length;
    return { filled, total, complete: filled === total };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64 mt-2" /></div>
        <div className="flex gap-3"><Skeleton className="h-10 w-32 rounded-xl" /><Skeleton className="h-10 w-32 rounded-xl" /></div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Logistics & Shipping</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure delivery rates and courier partners for your business.
        </p>
      </div>

      {/* Progress bar */}
      <div className="card-elevated p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Setup Progress</span>
          <span className="text-sm text-muted-foreground">{configuredCount}/{NIGERIAN_STATES.length} states</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(configuredCount / NIGERIAN_STATES.length) * 100}%` }}
          />
        </div>
        {configuredCount === 0 && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-warning" />
            Set shipping prices so buyers can see delivery costs at checkout.
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-secondary/50 rounded-xl">
        <button
          onClick={() => setActiveTab("rates")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === "rates"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-1.5" strokeWidth={1} />
          Shipping Rates
        </button>
        <button
          onClick={() => setActiveTab("couriers")}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
            activeTab === "couriers"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Truck className="w-4 h-4 inline mr-1.5" strokeWidth={1} />
          Courier Services
          {couriers.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{couriers.length}</span>
          )}
        </button>
      </div>

      {/* Shipping Rates Tab */}
      {activeTab === "rates" && (
        <div className="space-y-4">
          {/* Quick controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-50">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1} />
              <Input
                placeholder="Search states..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl h-9 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-secondary/50 text-sm">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Set all:</span>
              <span className="text-xs text-muted-foreground">₦</span>
              <input
                type="number"
                min={0}
                placeholder="0"
                className="w-24 px-2 py-1 rounded-lg border border-border bg-background text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setAllRates((e.target as HTMLInputElement).value);
                    toast.success("All states updated");
                  }
                }}
              />
              <span className="text-[10px] text-muted-foreground hidden sm:inline">Enter ↵</span>
            </div>
          </div>

          {/* Zone-grouped states */}
          <div className="space-y-3">
            {NIGERIAN_ZONES.filter((zone) =>
              !search || zone.states.some((s) => s.toLowerCase().includes(search.toLowerCase()))
            ).map((zone) => {
              const stats = getZoneStats(zone);
              const isExpanded = expandedZones.has(zone.name);
              const filteredStates = search
                ? zone.states.filter((s) => s.toLowerCase().includes(search.toLowerCase()))
                : zone.states;

              return (
                <div key={zone.name} className="card-elevated overflow-hidden">
                  {/* Zone header */}
                  <button
                    onClick={() => toggleZone(zone.name)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-secondary/30 transition-colors"
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                      strokeWidth={1}
                    />
                    <div className="flex-1 text-left">
                      <span className="text-sm font-semibold text-foreground">{zone.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">({zone.states.length} states)</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {stats.complete ? (
                        <span className="flex items-center gap-1 text-xs text-success font-medium">
                          <Check className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">{stats.filled}/{stats.total}</span>
                      )}
                      {/* Mini progress */}
                      <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${stats.complete ? "bg-success" : "bg-primary"}`}
                          style={{ width: `${(stats.filled / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Zone states */}
                  {isExpanded && (
                    <div className="border-t border-border">
                      {/* Quick set zone */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-secondary/20 border-b border-border">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Set zone:</span>
                        <span className="text-xs text-muted-foreground">₦</span>
                        <input
                          type="number"
                          min={0}
                          placeholder="0"
                          className="w-24 px-2 py-1 rounded-lg border border-border bg-background text-xs text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              setZoneRate(zone, (e.target as HTMLInputElement).value);
                              toast.success(`${zone.name} states updated`);
                            }
                          }}
                        />
                        <span className="text-[10px] text-muted-foreground">Enter ↵</span>
                      </div>

                      {filteredStates.map((state) => (
                        <div
                          key={state}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/20 transition-colors border-b border-border last:border-b-0"
                        >
                          <span className="text-sm text-foreground flex-1 min-w-0">{state}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-muted-foreground">₦</span>
                            <input
                              type="number"
                              min={0}
                              value={rates[state] || ""}
                              onChange={(e) => setRate(state, e.target.value)}
                              placeholder="—"
                              className="w-28 px-2.5 py-1.5 rounded-lg border border-border bg-background text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            {rates[state] !== undefined && rates[state] !== "" && (
                              <span className={`text-[10px] w-16 text-right ${
                                parseFloat(rates[state]) === 0 ? "text-success font-medium" : "text-muted-foreground"
                              }`}>
                                {parseFloat(rates[state]) === 0 ? "Free" : formatNaira(parseFloat(rates[state]) || 0)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Courier Services Tab */}
      {activeTab === "couriers" && (
        <div className="space-y-4">
          <div className="card-elevated p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-foreground">Your Courier Partners</h3>
              <Button variant="outline" size="sm" onClick={addCourier} className="rounded-xl gap-1.5 h-8 text-xs">
                <Plus className="w-3.5 h-3.5" /> Add Courier
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Add logistics companies you partner with. This info is shown on your seller profile.
            </p>

            {couriers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
                <Truck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm font-medium text-muted-foreground">No courier services added</p>
                <p className="text-xs text-muted-foreground mt-1 mb-3">Add your delivery partners to build buyer confidence</p>
                <Button variant="outline" size="sm" onClick={addCourier} className="rounded-xl gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" /> Add Your First Courier
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {couriers.map((courier, idx) => (
                  <div key={courier._id} className="rounded-xl border border-border overflow-hidden">
                    <div className="flex items-center gap-3 p-3 bg-secondary/20">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Truck className="w-4 h-4 text-primary" strokeWidth={1} />
                      </div>
                      <Input
                        value={courier.name}
                        onChange={(e) => updateCourier(courier._id, "name", e.target.value)}
                        placeholder={`Courier ${idx + 1} name (e.g. GIG Logistics)`}
                        className="flex-1 rounded-lg h-9 text-sm border-0 bg-transparent focus-visible:ring-0 px-0 font-medium"
                      />
                      <button
                        onClick={() => removeCourier(courier._id)}
                        className="p-1.5 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 p-3">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={1} />
                        <Input
                          value={courier.phone}
                          onChange={(e) => updateCourier(courier._id, "phone", e.target.value)}
                          placeholder="Phone number"
                          className="pl-9 rounded-lg h-9 text-sm"
                        />
                      </div>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={1} />
                        <Input
                          value={courier.website}
                          onChange={(e) => updateCourier(courier._id, "website", e.target.value)}
                          placeholder="Website (optional)"
                          className="pl-9 rounded-lg h-9 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky Save Bar */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground hidden sm:block">
          {filledCount > 0 ? `${filledCount} state rate(s) set · ${couriers.filter((c) => c.name.trim()).length} courier(s)` : "Configure your shipping to start receiving orders"}
        </p>
        <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2 ml-auto">
          <Save className="w-4 h-4" strokeWidth={1} />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
