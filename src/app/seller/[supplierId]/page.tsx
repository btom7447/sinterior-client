"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { apiGet } from "@/lib/apiClient";
import { type ApiProduct, type Pagination, formatNaira, getPrimaryImage } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Star, MessageCircle, Phone, Verified, Package } from "lucide-react";

interface SupplierInfo {
  _id: string;
  fullName: string;
  avatarUrl: string | null;
  city: string;
  state: string;
  phone?: string;
}

export default function SellerProfilePage({ params }: { params: Promise<{ supplierId: string }> }) {
  const { supplierId } = use(params);
  const router = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [supplier, setSupplier] = useState<SupplierInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ data: ApiProduct[]; pagination: Pagination }>(
          `/products?supplierId=${supplierId}&limit=50`
        );
        setProducts(data.data);
        // Extract supplier info from first product
        if (data.data.length > 0 && data.data[0].supplierId) {
          setSupplier(data.data[0].supplierId as SupplierInfo);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, [supplierId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-5 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-24" /></div>
          </div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/3" /></div>
              </div>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

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

        <div className="px-4 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16 border-2 border-primary/20">
              <AvatarImage src={supplier.avatarUrl || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">{supplier.fullName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-foreground">{supplier.fullName}</h2>
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Verified strokeWidth={1} className="w-5 h-5 text-green-500" /> Verified
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin strokeWidth={1} className="w-3 h-3" />
                {supplier.city}{supplier.state ? `, ${supplier.state}` : ""}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {supplier.phone && (
              <Button
                className="flex-1 rounded-xl gap-2 bg-green-500 hover:bg-green-700 text-white"
                onClick={() => window.open(`https://wa.me/${supplier.phone?.replace(/\D/g, "")}`, "_blank")}
              >
                <Phone strokeWidth={1} className="w-4 h-4" /> WhatsApp
              </Button>
            )}
            <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => router.push("/dashboard/chat")}>
              <MessageCircle strokeWidth={1} className="w-4 h-4" /> Message
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">Products ({products.length})</h3>
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
                    className="flex gap-3 p-3 rounded-xl bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => router.push(`/products/${p._id}`)}
                  >
                    <img src={getPrimaryImage(p.images)} alt={p.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-sm font-bold text-primary mt-0.5">
                        {formatNaira(p.price)} <span className="text-xs font-normal text-muted-foreground">{p.unit}</span>
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star strokeWidth={1} className="w-3 h-3 fill-warning text-warning" />
                        <span className="text-xs text-muted-foreground">{p.rating} ({p.reviewCount})</span>
                        {!p.inStock && <Badge variant="destructive" className="text-[10px] ml-1">Sold Out</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
