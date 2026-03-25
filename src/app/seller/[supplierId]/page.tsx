"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Star, Shield, MessageCircle, Phone } from "lucide-react";

export default function SellerProfilePage({ params }: { params: Promise<{ supplierId: string }> }) {
  const { supplierId } = use(params);
  const router = useRouter();

  const supplierProducts = products.filter(
    (p) => p.supplier.replace(/\s+/g, "-").toLowerCase() === supplierId
  );
  const supplier = supplierProducts[0];

  if (!supplier) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-muted-foreground">Seller not found</p>
          <Button variant="outline" onClick={() => router.push("/products")}>Back to Products</Button>
        </div>
      </AppLayout>
    );
  }

  const whatsappNumber = supplier.supplierWhatsapp || "2348012345678";

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto pb-28">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft strokeWidth={1} className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold truncate flex-1">Seller Profile</h1>
        </div>

        {supplier.supplierShopImage && (
          <div className="aspect-[16/9] overflow-hidden bg-secondary">
            <img src={supplier.supplierShopImage} alt="Shop" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="px-4 pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={supplier.supplierAvatar} />
              <AvatarFallback>{supplier.supplier[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{supplier.supplier}</h2>
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Shield strokeWidth={1} className="w-3 h-3" /> Verified
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin strokeWidth={1} className="w-3 h-3" />
                {supplier.location}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star strokeWidth={1} className="w-3.5 h-3.5 fill-warning text-warning" />
                <span className="text-sm font-semibold text-foreground">{supplier.rating}</span>
                <span className="text-xs text-muted-foreground">({supplier.reviews} reviews)</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 rounded-xl gap-2 bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white"
              onClick={() => window.open(`https://wa.me/${whatsappNumber}`, "_blank")}
            >
              <Phone strokeWidth={1} className="w-4 h-4" /> WhatsApp
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => router.push("/chat")}>
              <MessageCircle strokeWidth={1} className="w-4 h-4" /> Message
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">Products ({supplierProducts.length})</h3>
            <div className="space-y-2">
              {supplierProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex gap-3 p-3 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                  onClick={() => router.push(`/products/${p.id}`)}
                >
                  <img src={p.image} alt={p.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                    <p className="text-sm font-bold text-primary mt-0.5">
                      {p.price} <span className="text-xs font-normal text-muted-foreground">{p.unit}</span>
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star strokeWidth={1} className="w-3 h-3 fill-warning text-warning" />
                      <span className="text-xs text-muted-foreground">{p.rating} ({p.reviews})</span>
                      {!p.inStock && <Badge variant="destructive" className="text-[10px] ml-1">Sold Out</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
