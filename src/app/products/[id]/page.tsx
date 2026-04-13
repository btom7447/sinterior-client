"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useCart } from "@/contexts/CartContext";
import { apiGet } from "@/lib/apiClient";
import { type ApiProduct, formatNaira, getPrimaryImage, resolveAssetUrl } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Star, MapPin, ShoppingCart, Heart, Share2,
  Truck, MessageCircle, ChevronRight, Minus, Plus, Phone, Verified,
} from "lucide-react";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Spec selections — keyed by spec name, value is the chosen option
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ data: { product: ApiProduct } }>(`/products/${id}`);
        setProduct(data.data.product);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Auto-select single-value specs when product loads (must be before early returns)
  useEffect(() => {
    if (!product?.specs) return;
    const initial: Record<string, string> = {};
    for (const [key, v] of Object.entries(product.specs)) {
      const values = Array.isArray(v)
        ? v
        : typeof v === "string"
        ? v.split(",").map((s) => s.trim()).filter(Boolean)
        : [String(v)];
      if (values.length === 1) {
        initial[key] = values[0];
      }
    }
    setSelectedSpecs(initial);
  }, [product?._id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-5 w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="w-full aspect-square rounded-2xl" />
            <div className="space-y-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Product not found</p>
          <Button variant="outline" onClick={() => router.push("/products")}>Back to Products</Button>
        </div>
      </AppLayout>
    );
  }

  const images = product.images.length > 0 ? product.images.map(resolveAssetUrl) : [getPrimaryImage([])];
  const supplier = product.supplierId;
  const totalCost = product.price * quantity;

  // Normalize specs: each value is always an array
  const allSpecs: [string, string[]][] = product.specs
    ? Object.entries(product.specs).map(([k, v]) => [
        k,
        Array.isArray(v) ? v : typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : [String(v)],
      ])
    : [];

  // Split into selectable (multiple values — buyer must choose) vs info-only (single value)
  const selectableSpecs = allSpecs.filter(([, values]) => values.length > 1);
  const infoSpecs = allSpecs.filter(([, values]) => values.length === 1);

  // Check if all required selections are made
  const allSpecsSelected = selectableSpecs.every(([key]) => selectedSpecs[key]);

  const maxQty = product.quantity ?? Infinity;

  const handleAddToCart = () => {
    if (!product.inStock || product.quantity === 0) {
      toast.error("This product is out of stock");
      return;
    }
    if (selectableSpecs.length > 0 && !allSpecsSelected) {
      toast.error("Please select all options before adding to cart");
      return;
    }
    if (quantity > maxQty) {
      toast.error(`Only ${maxQty} available in stock`);
      setQuantity(maxQty);
      return;
    }

    // Build the final selected specs (only include keys with actual choices)
    const specChoices: Record<string, string> = {};
    for (const [key] of selectableSpecs) {
      if (selectedSpecs[key]) specChoices[key] = selectedSpecs[key];
    }

    addToCart(
      {
        id: product._id,
        _id: product._id,
        name: product.name,
        price: formatNaira(product.price),
        image: getPrimaryImage(product.images),
        inStock: product.inStock,
        availableStock: product.quantity,
        unit: product.unit,
        supplierId: product.supplierId?._id,
        selectedSpecs: Object.keys(specChoices).length > 0 ? specChoices : undefined,
      },
      quantity
    );

    const specSummary = Object.values(specChoices).join(", ");
    toast.success(`${product.name} added to cart`, {
      description: `Qty: ${quantity}${specSummary ? ` · ${specSummary}` : ""}`,
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft strokeWidth={1} className="w-4 h-4" />
            <span className="text-sm">Back to Products</span>
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setLiked(!liked)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Heart strokeWidth={1} className={`w-5 h-5 ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </button>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Share2 strokeWidth={1} className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left — Image Gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-secondary group aspect-square sm:aspect-[4/3]">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {!product.inStock && (
                <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center rounded-2xl">
                  <span className="text-lg font-bold text-card">Sold Out</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-18 h-18 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-primary" : "border-transparent"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Product Info */}
          <div className="space-y-5">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{product.category}</p>
              <h1 className="font-display text-2xl font-bold text-foreground leading-tight mb-3">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star strokeWidth={1} className="w-4 h-4 fill-warning text-warning" />
                  <span className="text-sm font-semibold text-foreground">{product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">({product.reviewCount} reviews)</span>
                {product.location && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin strokeWidth={1} className="w-3 h-3" />{product.location}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-end justify-between pt-1">
              <div>
                <span className="text-3xl font-bold text-primary">{formatNaira(product.price)}</span>
                <span className="text-sm text-muted-foreground ml-1">{product.unit}</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-xl px-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Minus strokeWidth={1} className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(quantity + 1, maxQty))} disabled={quantity >= maxQty} className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30">
                  <Plus strokeWidth={1} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {product.inStock && product.quantity != null && product.quantity <= 10 && (
              <p className="text-xs text-warning font-medium">Only {product.quantity} left in stock</p>
            )}

            {/* ─── Spec Variant Selectors ─── */}
            {selectableSpecs.length > 0 && (
              <div className="space-y-4 py-1">
                {selectableSpecs.map(([key, values]) => (
                  <div key={key}>
                    <p className="text-sm font-medium text-foreground mb-2">
                      {key}
                      {selectedSpecs[key] && (
                        <span className="text-muted-foreground font-normal">: {selectedSpecs[key]}</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {values.map((val) => {
                        const isSelected = selectedSpecs[key] === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              setSelectedSpecs((prev) => ({ ...prev, [key]: val }))
                            }
                            className={`px-3.5 py-1.5 rounded-lg text-sm border transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-semibold"
                                : "border-border text-foreground hover:border-primary/50 hover:bg-secondary"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={() => router.push("/cart")}>
                <ShoppingCart strokeWidth={1} className="w-5 h-5" />
              </Button>
              <Button
                className="flex-1 rounded-xl gap-2 font-semibold"
                disabled={!product.inStock || (selectableSpecs.length > 0 && !allSpecsSelected)}
                onClick={handleAddToCart}
              >
                <ShoppingCart strokeWidth={1} className="w-4 h-4" />
                {!product.inStock
                  ? "Out of Stock"
                  : selectableSpecs.length > 0 && !allSpecsSelected
                  ? "Select Options"
                  : `Add to Cart • ${formatNaira(totalCost)}`}
              </Button>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <div className="flex gap-6 py-3 border-y border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Verified strokeWidth={1} className="w-4 h-4 text-green-500" /> Verified Supplier
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Truck strokeWidth={1} className="w-4 h-4 text-primary" /> Fast Delivery
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl gap-2 text-sm" onClick={() => router.push(`/dashboard/chat?recipientId=${supplier?._id}&recipientName=${encodeURIComponent(supplier?.fullName || "")}`)}>
                <MessageCircle strokeWidth={1} className="w-4 h-4" /> Message Seller
              </Button>
            </div>

            {/* Supplier card */}
            {supplier && (
              <div
                className="rounded-2xl border border-border bg-secondary/30 cursor-pointer hover:bg-secondary/60 transition-colors overflow-hidden"
                onClick={() => router.push(`/seller/${supplier._id}`)}
              >
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <Avatar className="w-12 h-12 border-2 border-primary/20 shrink-0">
                    <AvatarImage src={resolveAssetUrl(supplier.avatarUrl || "")} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{supplier.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground truncate">{supplier.fullName}</p>
                      <Verified strokeWidth={1} className="w-5 h-5 text-success shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground">{supplier.city}{supplier.state ? `, ${supplier.state}` : ""}</p>
                  </div>
                  <ChevronRight strokeWidth={1} className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info-only Specs (single value) */}
        {infoSpecs.length > 0 && (
          <div className="mt-10">
            <h3 className="font-display text-lg font-bold text-foreground mb-4">Specifications</h3>
            <div className="grid sm:grid-cols-2 gap-x-12">
              {infoSpecs.map(([key, values]) => (
                <div key={key} className="flex justify-between items-start py-3 border-b border-border gap-4">
                  <span className="text-sm text-muted-foreground shrink-0">{key}</span>
                  <span className="text-sm font-medium text-foreground text-right">{values[0]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
