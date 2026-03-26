"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

interface ProductCardItem {
  id: number;
  name: string;
  category: string;
  image: string;
  price: string;
  originalPrice?: string | null;
  rating: number;
  seller: string;
  inStock: boolean;
  badge?: string | null;
  unit?: string;
}

interface ProductCardProps {
  product: ProductCardItem;
  animationDelay?: number;
}

export type { ProductCardItem };

export default function ProductCard({
  product,
  animationDelay = 0,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success("Added to cart");
  };
  return (
    <Link href={`/products/${product.id}`}>
      <div
        className="card-interactive overflow-hidden bg-card"
        data-aos="fade-up"
        data-aos-delay={animationDelay}
      >
        <div className="relative overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          />
          {product.originalPrice && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold">
              Sale
            </div>
          )}
          {product.badge && !product.originalPrice && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {product.badge}
            </div>
          )}
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
            <Star
              strokeWidth={1}
              className="w-4 h-4 fill-warning text-warning"
            />
            <span className="font-medium text-sm">{product.rating}</span>
            <span className="text-muted-foreground text-sm">
              • {product.seller}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="font-display font-bold text-xl text-foreground">
              {product.price}
            </span>
            {product.originalPrice && (
              <span className="text-muted-foreground line-through text-sm">
                {product.originalPrice}
              </span>
            )}
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
            <ShoppingCart strokeWidth={1} className="w-4 h-4 mr-2" /> Add to
            Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}
