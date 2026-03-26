"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { products } from "@/data/products";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft, Star, MapPin, ShoppingCart, Heart, Share2,
  Shield, Truck, MessageCircle, ChevronRight, Minus, Plus, Phone,
} from "lucide-react";
import { toast } from "sonner";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === Number(id));
  const [selectedImage, setSelectedImage] = useState(0);
  const [liked, setLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");

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

  const images = product.images;
  const supplierId = product.supplier.replace(/\s+/g, "-").toLowerCase();
  const whatsappNumber = product.supplierWhatsapp || "2348012345678";
  const unitPrice = Number(product.price.replace(/[₦,]/g, "")) || 0;
  const totalCost = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart`, { description: `Quantity: ${quantity}` });
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
            <button
              onClick={() => setLiked(!liked)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Heart strokeWidth={1} className={`w-5 h-5 ${liked ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </button>
            <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Share2 strokeWidth={1} className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Two-column layout on desktop */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left — Image Gallery */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-secondary group aspect-square sm:aspect-[4/3]">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {product.badge && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs">
                  {product.badge}
                </Badge>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center rounded-2xl">
                  <span className="text-lg font-bold text-card">Sold Out</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-3 overflow-x-auto pb-1">
                {images.map((img: string, i: number) => (
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
                <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
                <span className="text-xs text-muted-foreground">•</span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin strokeWidth={1} className="w-3 h-3" />{product.location}
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between pt-1">
              <div>
                <span className="text-3xl font-bold text-primary">{product.price}</span>
                <span className="text-sm text-muted-foreground ml-1">{product.unit}</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary rounded-xl px-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus strokeWidth={1} className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus strokeWidth={1} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={() => router.push("/cart")}>
                <ShoppingCart strokeWidth={1} className="w-5 h-5" />
              </Button>
              <Button
                className="flex-1 rounded-xl gap-2 font-semibold"
                disabled={!product.inStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart strokeWidth={1} className="w-4 h-4" />
                {product.inStock ? `Add to Cart • ₦${totalCost.toLocaleString()}` : "Out of Stock"}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex gap-6 py-3 border-y border-border">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield strokeWidth={1} className="w-4 h-4 text-primary" /> Verified Supplier
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Truck strokeWidth={1} className="w-4 h-4 text-primary" /> Fast Delivery
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl gap-2 text-sm"
                onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=Hi, I'm interested in ${product.name}`, "_blank")}
              >
                <Phone strokeWidth={1} className="w-4 h-4" /> WhatsApp Seller
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl gap-2 text-sm" onClick={() => router.push("/chat")}>
                <MessageCircle strokeWidth={1} className="w-4 h-4" /> Message
              </Button>
            </div>

            {/* Supplier card — populated from supplier onboarding data */}
            <div
              className="rounded-2xl border border-border bg-secondary/30 cursor-pointer hover:bg-secondary/60 transition-colors overflow-hidden"
              onClick={() => router.push(`/seller/${supplierId}`)}
            >
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Avatar className="w-12 h-12 border-2 border-primary/20 shrink-0">
                  <AvatarImage src={product.supplierAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{product.supplier[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-foreground truncate">{product.supplier}</p>
                    <Shield strokeWidth={1} className="w-3.5 h-3.5 text-success shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground">{product.location} · Construction Materials</p>
                </div>
                <ChevronRight strokeWidth={1} className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
              <div className="grid grid-cols-3 divide-x divide-border">
                {[
                  { label: "Products", value: "48" },
                  { label: "Response", value: "95%" },
                  { label: "Delivers", value: "Nationwide" },
                ].map((s) => (
                  <div key={s.label} className="px-3 py-2.5 text-center">
                    <p className="text-sm font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Specs / Reviews — full width below */}
        <div className="mt-10">
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => setActiveTab("specs")}
              className={`px-6 py-3 text-sm font-semibold transition-colors relative ${activeTab === "specs" ? "text-primary" : "text-muted-foreground"}`}
            >
              Specifications
              {activeTab === "specs" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`px-6 py-3 text-sm font-semibold transition-colors relative ${activeTab === "reviews" ? "text-primary" : "text-muted-foreground"}`}
            >
              Reviews ({product.reviewsList.length})
              {activeTab === "reviews" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          </div>

          {activeTab === "specs" && (
            <div className="grid sm:grid-cols-2 gap-x-12 divide-y sm:divide-y-0">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between py-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">{key}</span>
                  <span className="text-sm font-medium text-foreground text-right">{value as string}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-secondary/50 w-fit">
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">{product.rating}</p>
                  <div className="flex gap-0.5 mt-1 justify-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star strokeWidth={1} key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{product.reviews} reviews</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {product.reviewsList.map((review: any, i: number) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl bg-secondary/30">
                    <Avatar className="w-9 h-9 shrink-0">
                      <AvatarImage src={review.avatar} />
                      <AvatarFallback>{review.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-foreground">{review.user}</p>
                        <span className="text-[10px] text-muted-foreground">{review.date}</span>
                      </div>
                      <div className="flex gap-0.5 mb-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star strokeWidth={1} key={s} className={`w-3 h-3 ${s <= review.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
