"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { apiGet } from "@/lib/apiClient";
import { type ApiProduct, type Pagination, formatNaira, getPrimaryImage, resolveAssetUrl } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, MapPin, Star, MessageCircle, Verified,
  Package, Truck, Shield, Building2, Clock, Calendar,
  ChevronRight, ShoppingCart, Tag,
} from "lucide-react";

interface SupplierProfile {
  _id: string;
  fullName: string;
  avatarUrl: string | null;
  city: string;
  state: string;
  phone?: string;
  bio?: string;
  memberSince?: string;
}

interface CourierInfo {
  name: string;
  phone?: string;
}

interface SupplierBusiness {
  businessName?: string;
  businessType?: string;
  description?: string;
  logoUrl?: string;
  categories?: string[];
  deliveryOptions?: string[];
  deliveryDays?: string;
  coverageStates?: string;
  businessAddress?: string;
  whatsappNumber?: string;
  isVerified?: boolean;
  rating?: number;
  reviewCount?: number;
  courierServices?: CourierInfo[];
  minOrderValue?: number;
  shippingStatesCount?: number;
}

interface Review {
  _id: string;
  reviewerId: { _id: string; fullName: string; avatarUrl?: string | null };
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function SellerProfilePage({ params }: { params: Promise<{ supplierId: string }> }) {
  const { supplierId } = use(params);
  const router = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [profile, setProfile] = useState<SupplierProfile | null>(null);
  const [business, setBusiness] = useState<SupplierBusiness | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "reviews" | "about">("products");

  useEffect(() => {
    (async () => {
      try {
        const [productsRes, supplierRes] = await Promise.all([
          apiGet<{ data: ApiProduct[]; pagination: Pagination }>(
            `/products?supplierId=${supplierId}&limit=50`
          ),
          apiGet<{ data: { profile: SupplierProfile; business: SupplierBusiness | null } }>(
            `/suppliers/${supplierId}`
          ).catch(() => null),
        ]);

        setProducts(productsRes.data);

        if (supplierRes) {
          setProfile(supplierRes.data.profile);
          setBusiness(supplierRes.data.business);
        } else if (productsRes.data.length > 0 && productsRes.data[0].supplierId) {
          const s = productsRes.data[0].supplierId;
          setProfile({
            _id: s._id,
            fullName: s.fullName,
            avatarUrl: s.avatarUrl,
            city: s.city,
            state: s.state,
            phone: s.phone,
          });
        }

        try {
          const reviewsRes = await apiGet<{ data: Review[] }>(
            `/reviews?artisanId=${supplierId}&limit=20`
          );
          setReviews(reviewsRes.data || []);
        } catch {
          // Reviews endpoint may not support suppliers — ok
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [supplierId]);

  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

  const fmtMemberSince = (s: string) =>
    new Date(s).toLocaleDateString("en-NG", { month: "long", year: "numeric" });

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="flex items-center gap-4 -mt-8 px-4">
            <Skeleton className="w-20 h-20 rounded-2xl" />
            <div className="space-y-2 flex-1"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!profile) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Seller not found</p>
          <Button variant="outline" onClick={() => router.push("/products")}>Back to Products</Button>
        </div>
      </AppLayout>
    );
  }

  const avgRating = business?.rating || 0;
  const totalReviews = business?.reviewCount || reviews.length || 0;
  const hasBusinessInfo = business && (business.description || business.businessAddress || business.categories?.length);

  const prices = products.map((p) => p.price).filter(Boolean);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const topProducts = [...products]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-28">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft strokeWidth={1} className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold truncate flex-1">
            {business?.businessName || profile.fullName}
          </h1>
          {business?.isVerified && (
            <Verified strokeWidth={1} className="w-4 h-4 text-green-500 shrink-0" />
          )}
        </div>

        {/* Cover Banner */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-50" />
        </div>

        <div className="px-4 space-y-6">
          {/* Profile Card — overlaps banner */}
          <div className="relative -mt-12 flex items-end gap-4">
            <Avatar className="w-24 h-24 border-4 border-background rounded-2xl shadow-lg">
              <AvatarImage src={resolveAssetUrl(business?.logoUrl || profile.avatarUrl || "")} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl rounded-2xl">
                {(business?.businessName || profile.fullName)[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-foreground">{business?.businessName || profile.fullName}</h2>
                {business?.isVerified && (
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    <Verified strokeWidth={1} className="w-3.5 h-3.5 text-green-500" /> Verified
                  </Badge>
                )}
              </div>
              {business?.businessName && (
                <p className="text-sm text-muted-foreground">{profile.fullName}</p>
              )}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin strokeWidth={1} className="w-3.5 h-3.5" />
              <span>{profile.city}{profile.state ? `, ${profile.state}` : ""}</span>
            </div>
            {avgRating > 0 && (
              <div className="flex items-center gap-1">
                <Star strokeWidth={1} className="w-4 h-4 fill-warning text-warning" />
                <span className="font-semibold">{avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({totalReviews})</span>
              </div>
            )}
            {profile.memberSince && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar strokeWidth={1} className="w-3.5 h-3.5" />
                <span>Joined {fmtMemberSince(profile.memberSince)}</span>
              </div>
            )}
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border p-3 text-center">
              <p className="text-lg font-bold text-foreground">{products.length}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Products</p>
            </div>
            <div className="rounded-xl border border-border p-3 text-center">
              <p className="text-lg font-bold text-foreground">{totalReviews}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reviews</p>
            </div>
            <div className="rounded-xl border border-border p-3 text-center">
              <p className="text-lg font-bold text-foreground">
                {business?.shippingStatesCount || 0}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ships to</p>
            </div>
          </div>

          {/* Bio / Description */}
          {(profile.bio || business?.description) && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {business?.description || profile.bio}
            </p>
          )}

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-2">
            {business?.isVerified && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                <Shield strokeWidth={1} className="w-3.5 h-3.5" /> Verified Supplier
              </span>
            )}
            {(business?.shippingStatesCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Truck strokeWidth={1} className="w-3.5 h-3.5" /> Nationwide Delivery
              </span>
            )}
            {prices.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-medium">
                <Tag strokeWidth={1} className="w-3.5 h-3.5" />
                {minPrice === maxPrice ? formatNaira(minPrice) : `${formatNaira(minPrice)} – ${formatNaira(maxPrice)}`}
              </span>
            )}
            {business?.minOrderValue != null && business.minOrderValue > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary text-foreground text-xs font-medium">
                <ShoppingCart strokeWidth={1} className="w-3.5 h-3.5" /> Min. order {formatNaira(business.minOrderValue)}
              </span>
            )}
          </div>

          {/* CTA */}
          <Button
            className="w-full rounded-xl gap-2"
            onClick={() => router.push(`/dashboard/chat?recipientId=${profile._id}&recipientName=${encodeURIComponent(profile.fullName)}`)}
          >
            <MessageCircle strokeWidth={1} className="w-4 h-4" /> Message Seller
          </Button>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {(["products", "about", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium text-center transition-colors capitalize ${
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "products" ? `Products (${products.length})`
                  : tab === "reviews" ? `Reviews (${totalReviews})`
                  : "About"}
              </button>
            ))}
          </div>

          {/* ─── Products Tab ─── */}
          {activeTab === "products" && (
            <div className="space-y-4">
              {topProducts.length > 0 && products.length > 6 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Top Rated</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {topProducts.map((p) => (
                      <div
                        key={p._id}
                        className="rounded-xl overflow-hidden border border-border cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/products/${p._id}`)}
                      >
                        <img
                          src={getPrimaryImage(p.images)}
                          alt={p.name}
                          className="w-full aspect-square object-cover"
                        />
                        <div className="p-2">
                          <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                          <p className="text-xs font-bold text-primary">{formatNaira(p.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                {products.length > 6 && (
                  <h3 className="text-sm font-bold text-foreground mb-3">All Products</h3>
                )}
                {products.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Package className="w-10 h-10 text-muted-foreground/40 mb-2" strokeWidth={1} />
                    <p className="text-sm text-muted-foreground">No products listed yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {products.map((p) => (
                      <div
                        key={p._id}
                        className="flex gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => router.push(`/products/${p._id}`)}
                      >
                        <img src={getPrimaryImage(p.images)} alt={p.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                          <p className="text-sm font-bold text-primary mt-0.5">
                            {formatNaira(p.price)}
                            <span className="text-xs font-normal text-muted-foreground ml-1">{p.unit}</span>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-0.5">
                              <Star strokeWidth={1} className="w-3 h-3 fill-warning text-warning" />
                              <span className="text-xs text-muted-foreground">{p.rating}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">({p.reviewCount})</span>
                            {!p.inStock && <Badge variant="destructive" className="text-[10px]">Sold Out</Badge>}
                          </div>
                        </div>
                        <ChevronRight strokeWidth={1} className="w-4 h-4 text-muted-foreground self-center shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── About Tab ─── */}
          {activeTab === "about" && (
            <div className="space-y-5">
              {hasBusinessInfo && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">Business Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {business?.businessAddress && (
                      <div className="rounded-xl border border-border p-4 flex items-start gap-3">
                        <Building2 strokeWidth={1} className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">Address</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{business.businessAddress}</p>
                        </div>
                      </div>
                    )}
                    {business?.deliveryDays && (
                      <div className="rounded-xl border border-border p-4 flex items-start gap-3">
                        <Clock strokeWidth={1} className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">Delivery Time</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{business.deliveryDays}</p>
                        </div>
                      </div>
                    )}
                    {business?.coverageStates && (
                      <div className="rounded-xl border border-border p-4 flex items-start gap-3">
                        <Truck strokeWidth={1} className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">Coverage Area</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{business.coverageStates}</p>
                        </div>
                      </div>
                    )}
                    {business?.businessType && (
                      <div className="rounded-xl border border-border p-4 flex items-start gap-3">
                        <Package strokeWidth={1} className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">Business Type</p>
                          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{business.businessType.replace("_", " ")}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {business?.categories && business.categories.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Product Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {business.categories.map((cat) => (
                      <span key={cat} className="px-3 py-1.5 rounded-full bg-secondary text-sm text-foreground">{cat}</span>
                    ))}
                  </div>
                </div>
              )}

              {business?.courierServices && business.courierServices.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-foreground mb-3">Delivery Partners</h3>
                  <div className="space-y-2">
                    {business.courierServices.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Truck strokeWidth={1} className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{c.name}</p>
                          {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-foreground mb-3">Seller Info</h3>
                <div className="rounded-xl border border-border divide-y divide-border">
                  {profile.memberSince && (
                    <div className="flex items-center gap-3 p-3">
                      <Calendar strokeWidth={1} className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">Member since</span>
                      <span className="text-sm font-medium text-foreground ml-auto">{fmtMemberSince(profile.memberSince)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3">
                    <MapPin strokeWidth={1} className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Location</span>
                    <span className="text-sm font-medium text-foreground ml-auto">{profile.city}{profile.state ? `, ${profile.state}` : ""}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3">
                    <Package strokeWidth={1} className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">Products listed</span>
                    <span className="text-sm font-medium text-foreground ml-auto">{products.length}</span>
                  </div>
                  {(business?.shippingStatesCount ?? 0) > 0 && (
                    <div className="flex items-center gap-3 p-3">
                      <Truck strokeWidth={1} className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-muted-foreground">Ships to</span>
                      <span className="text-sm font-medium text-foreground ml-auto">{business!.shippingStatesCount} states</span>
                    </div>
                  )}
                </div>
              </div>

              {!hasBusinessInfo && !business?.courierServices?.length && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="w-10 h-10 text-muted-foreground/40 mb-2" strokeWidth={1} />
                  <p className="text-sm text-muted-foreground">No additional business details available</p>
                </div>
              )}
            </div>
          )}

          {/* ─── Reviews Tab ─── */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {avgRating > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-border">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          strokeWidth={1}
                          className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? "fill-warning text-warning" : "text-border"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{totalReviews} reviews</p>
                  </div>
                </div>
              )}

              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Star className="w-10 h-10 text-muted-foreground/40 mb-2" strokeWidth={1} />
                  <p className="text-sm text-muted-foreground">No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r._id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center gap-2.5 mb-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={resolveAssetUrl(r.reviewerId?.avatarUrl || "")} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {r.reviewerId?.fullName?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{r.reviewerId?.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">{fmtDate(r.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              strokeWidth={1}
                              className={`w-3.5 h-3.5 ${i < r.rating ? "fill-warning text-warning" : "text-border"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
