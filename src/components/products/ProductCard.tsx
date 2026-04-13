"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { type ApiProduct, formatNaira, getPrimaryImage } from "@/types/api";

interface ProductCardProps {
  product: ApiProduct;
  animationDelay?: number;
}

export default function ProductCard({ product, animationDelay = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(
      {
        id: product._id,
        _id: product._id,
        name: product.name,
        price: formatNaira(product.price),
        image: getPrimaryImage(product.images),
        inStock: product.inStock,
        unit: product.unit,
        supplierId: product.supplierId?._id,
      },
      1
    );
    toast.success("Added to cart");
  };

  return (
    <Link href={`/products/${product._id}`}>
      <div
        className="card-interactive overflow-hidden bg-card"
        data-aos="fade-up"
        data-aos-delay={animationDelay}
      >
        <div className="relative overflow-hidden">
          <img
            src={getPrimaryImage(product.images)}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
              <span className="text-sm font-bold text-card">Sold Out</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            <Star strokeWidth={1} className="w-4 h-4 fill-warning text-warning" />
            <span className="font-medium text-sm">{product.rating}</span>
            <span className="text-muted-foreground text-sm">
              • {product.supplierId?.fullName || "Unknown Supplier"}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-display font-bold text-xl text-foreground">
              {formatNaira(product.price)}
            </span>
            {product.unit && (
              <span className="text-xs text-muted-foreground">
                {product.unit}
              </span>
            )}
          </div>
          <Button
            className="w-full rounded-xl bg-primary hover:bg-primary/90"
            disabled={!product.inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart strokeWidth={1} className="w-4 h-4 mr-2" /> Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}
