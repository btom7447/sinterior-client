"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ProductCard, { type ProductCardItem } from "@/components/products/ProductCard";

const featuredProducts: ProductCardItem[] = [
  { id: 1, name: "Premium Cement (50kg)", category: "Building Materials", image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&q=80", price: "₦5,500", originalPrice: "₦6,000", rating: 4.8, seller: "BuildMart Supplies", inStock: true },
  { id: 2, name: "Steel Reinforcement Bars", category: "Construction Steel", image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80", price: "₦285,000", originalPrice: null, rating: 4.9, seller: "MetalWorks Nigeria", inStock: true },
  { id: 3, name: "Ceramic Floor Tiles (m²)", category: "Tiles & Flooring", image: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&q=80", price: "₦8,200", originalPrice: "₦9,500", rating: 4.7, seller: "TileHub Express", inStock: true },
  { id: 4, name: "Industrial Paint (20L)", category: "Paints & Finishes", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80", price: "₦45,000", originalPrice: null, rating: 4.6, seller: "ColorCraft Paints", inStock: true },
];

const FeaturedProducts = () => {
  return (
    <section className="section-padding bg-secondary/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10" data-aos="fade-up">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">Construction Materials</h2>
            <p className="text-muted-foreground">Quality materials from trusted suppliers at competitive prices</p>
          </div>
          <Link href="/products">
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              Browse Products <ArrowRight strokeWidth={1} className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} animationDelay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
