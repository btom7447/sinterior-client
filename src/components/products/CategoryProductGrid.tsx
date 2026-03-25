"use client";
import { Star, MapPin, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  image: string;
  name: string;
  category: string;
  price: string;
  unit: string;
  supplier: string;
  supplierAvatar: string;
  location: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
}

interface CategoryProductGridProps {
  products: Product[];
  selectedCategory: string;
  likedItems: Set<number>;
  onToggleLike: (id: number) => void;
}

const CategoryProductGrid = ({
  products,
  selectedCategory,
  likedItems,
  onToggleLike,
}: CategoryProductGridProps) => {
  // Group products by category for "For you" / "All" view
  const isAllView = selectedCategory === "For you";

  if (isAllView) {
    const grouped = products.reduce<Record<string, Product[]>>((acc, p) => {
      if (!acc[p.category]) acc[p.category] = [];
      acc[p.category].push(p);
      return acc;
    }, {});

    return (
      <div className="flex-1 px-3 sm:px-4 py-4">
        <h2 className="font-display text-lg font-bold text-foreground mb-4">Recommendations</h2>
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">{category}</h3>
            <div className="grid grid-cols-3 gap-3">
              {items.map((product) => (
                <ProductThumbnail
                  key={product.id}
                  product={product}
                  liked={likedItems.has(product.id)}
                  onToggleLike={onToggleLike}
                />
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8 mb-4">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">
            Get product inspiration
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                liked={likedItems.has(product.id)}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filtered = products.filter((p) => p.category === selectedCategory);

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4">
      <h2 className="font-display text-lg font-bold text-foreground mb-4">{selectedCategory}</h2>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm py-10 text-center">
          No products in this category yet.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {filtered.map((product) => (
              <ProductThumbnail
                key={product.id}
                product={product}
                liked={likedItems.has(product.id)}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                liked={likedItems.has(product.id)}
                onToggleLike={onToggleLike}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Compact thumbnail card (Alibaba-style)
const ProductThumbnail = ({
  product,
  liked,
  onToggleLike,
}: {
  product: Product;
  liked: boolean;
  onToggleLike: (id: number) => void;
}) => {
  const router = useRouter();
  return (
  <button
    className="flex flex-col items-center text-center group"
    onClick={() => router.push(`/products/${product.id}`)}
  >
    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-secondary mb-1.5">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      {product.badge && (
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
      )}
      {!product.inStock && (
        <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
          <span className="text-[10px] text-card font-semibold">Sold out</span>
        </div>
      )}
    </div>
    <span className="text-[11px] sm:text-xs text-foreground font-medium leading-tight line-clamp-2">
      {product.name}
    </span>
  </button>
);
};

// Detailed product card
const ProductCard = ({
  product,
  liked,
  onToggleLike,
}: {
  product: Product;
  liked: boolean;
  onToggleLike: (id: number) => void;
}) => {
  const router = useRouter();
  return (
  <div className="card-interactive overflow-hidden group cursor-pointer" onClick={() => router.push(`/products/${product.id}`)}>
    <div className="relative aspect-[4/3] overflow-hidden">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleLike(product.id);
        }}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
      >
        <Heart
          className={`w-3.5 h-3.5 ${
            liked ? "fill-destructive text-destructive" : "text-foreground"
          }`}
          strokeWidth={1}
        />
      </button>
      {product.badge && (
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
          {product.badge}
        </span>
      )}
    </div>
    <div className="p-3">
      <h3 className="text-xs font-semibold text-foreground line-clamp-2 mb-1">{product.name}</h3>
      <div className="flex items-baseline gap-1 mb-1.5">
        <span className="text-sm font-bold text-primary">{product.price}</span>
        <span className="text-[10px] text-muted-foreground">{product.unit}</span>
      </div>
      <div className="flex items-center gap-1">
        <Star className="w-3 h-3 fill-warning text-warning" strokeWidth={1} />
        <span className="text-[10px] font-semibold text-foreground">{product.rating}</span>
        <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
      </div>
    </div>
  </div>
);
};

export default CategoryProductGrid;
