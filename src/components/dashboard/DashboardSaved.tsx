"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/apiClient";
import { resolveAssetUrl } from "@/types/api";
import { Heart, ChevronLeft, ChevronRight, MapPin, Package, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { formatNaira } from "@/lib/constants";

interface SavedEntity {
  _id?: string;
  fullName?: string;
  avatarUrl?: string | null;
  city?: string;
  state?: string;
  name?: string;
  title?: string;
  price?: number;
  images?: string[];
  category?: string;
  type?: string;
  inStock?: boolean;
}

interface BookmarkItem {
  _id: string;
  entityType: "Profile" | "Product" | "Property";
  entity: SavedEntity;
  createdAt: string;
}

interface Pagination { page: number; limit: number; total: number; pages: number; }

const TABS = [
  { id: "artisan", label: "Artisans", icon: Heart },
  { id: "product", label: "Products", icon: Package },
  { id: "property", label: "Properties", icon: Home },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function DashboardSaved() {
  const [tab, setTab] = useState<TabId>("artisan");
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchSaved = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: { bookmarks: BookmarkItem[] }; pagination: Pagination }>(`/bookmarks?type=${tab}&page=${page}&limit=12`);
      setItems(data.data?.bookmarks || []);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load saved items"); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchSaved(); }, [fetchSaved]);

  const removeSaved = async (entityId: string) => {
    try {
      await apiPost("/bookmarks/toggle", { entityId, type: tab });
      toast.success("Removed from saved");
      fetchSaved(pagination.page);
    } catch { toast.error("Failed to remove"); }
  };

  const emptyMessages: Record<TabId, { text: string; link: string; linkText: string }> = {
    artisan: { text: "No saved artisans yet", link: "/artisan", linkText: "Browse artisans" },
    product: { text: "No saved products yet", link: "/products", linkText: "Browse products" },
    property: { text: "No saved properties yet", link: "/real-estate", linkText: "Browse properties" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Saved</h1>
        <p className="text-muted-foreground text-sm mt-1">Items you&apos;ve bookmarked</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1} />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading && !items.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-elevated p-4 space-y-3">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Heart className="w-12 h-12 text-muted-foreground/40 mb-3" strokeWidth={1} />
          <p className="text-muted-foreground">{emptyMessages[tab].text}</p>
          <Link href={emptyMessages[tab].link} className="text-primary text-sm mt-2 hover:underline">{emptyMessages[tab].linkText}</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((bm) => {
            const entity = bm.entity;
            if (!entity) return null;

            // Artisan card
            if (bm.entityType === "Profile") {
              return (
                <div key={bm._id} className="card-elevated p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={resolveAssetUrl(entity.avatarUrl || "")} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{entity.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{entity.fullName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin className="w-3 h-3" strokeWidth={1} />
                        <span>{entity.city}{entity.state ? `, ${entity.state}` : ""}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <Link href={`/artisan/${entity._id}`} className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      View Profile
                    </Link>
                    <button onClick={() => removeSaved(entity._id!)} className="py-1.5 px-3 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                      <Heart className="w-3 h-3 fill-current" />
                    </button>
                  </div>
                </div>
              );
            }

            // Product card
            if (bm.entityType === "Product") {
              const img = entity.images?.[0];
              return (
                <div key={bm._id} className="card-elevated overflow-hidden">
                  {img && (
                    <div className="aspect-[4/3] bg-secondary">
                      <img src={resolveAssetUrl(img)} alt={entity.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground truncate">{entity.name}</p>
                    {entity.category && <p className="text-xs text-muted-foreground mt-0.5">{entity.category}</p>}
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-bold text-primary">{entity.price != null ? formatNaira(entity.price) : ""}</p>
                      {entity.inStock === false && <span className="text-[10px] text-destructive font-medium">Out of stock</span>}
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Link href={`/products/${entity._id}`} className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        View Product
                      </Link>
                      <button onClick={() => removeSaved(entity._id!)} className="py-1.5 px-3 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                        <Heart className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // Property card
            if (bm.entityType === "Property") {
              const img = entity.images?.[0];
              return (
                <div key={bm._id} className="card-elevated overflow-hidden">
                  {img && (
                    <div className="aspect-[4/3] bg-secondary">
                      <img src={resolveAssetUrl(img)} alt={entity.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground truncate">{entity.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <MapPin className="w-3 h-3" strokeWidth={1} />
                      <span>{entity.city}{entity.state ? `, ${entity.state}` : ""}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm font-bold text-primary">{entity.price != null ? formatNaira(entity.price) : ""}</p>
                      {entity.type && <span className="text-[10px] text-muted-foreground capitalize">{entity.type}</span>}
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                      <Link href={`/real-estate/${entity._id}`} className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        View Property
                      </Link>
                      <button onClick={() => removeSaved(entity._id!)} className="py-1.5 px-3 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                        <Heart className="w-3 h-3 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchSaved(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchSaved(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
