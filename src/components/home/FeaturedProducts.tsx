"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/products/ProductCard";
import { apiGet } from "@/lib/apiClient";
import { type ApiProduct } from "@/types/api";

const FeaturedProducts = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<{ data: ApiProduct[] }>("/products?limit=4");
        setProducts(data.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="section-padding bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
          data-aos="fade-up"
        >
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Construction Materials
            </h2>
            <p className="text-muted-foreground">
              Quality materials from trusted suppliers at competitive prices
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:underline"
          >
            Browse Products <ArrowRight strokeWidth={1} className="w-6 h-6" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="card-interactive overflow-hidden bg-card">
                <Skeleton className="w-full h-48" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Package strokeWidth={1} className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">No products yet</h3>
              <p className="text-muted-foreground text-sm max-w-xs mb-4">
                Construction materials will appear here once suppliers list their products.
              </p>
              <Link href="/products">
                <Button variant="outline" className="rounded-xl">Browse Products</Button>
              </Link>
            </div>
          ) : (
            products.map((product, i) => (
              <ProductCard key={product._id} product={product} animationDelay={i * 100} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
