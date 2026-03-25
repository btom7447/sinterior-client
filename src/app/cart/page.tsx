"use client";

import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Minus, Plus, ShoppingCart } from "lucide-react";

const parsePrice = (price: string) => Number(price.replace(/[₦,]/g, "")) || 0;

export default function CartPage() {
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4 px-4">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingCart strokeWidth={1} className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground text-center">Browse our products and add items to your cart</p>
          <Button onClick={() => router.push("/products")} className="rounded-xl">Browse Products</Button>
        </div>
      </AppLayout>
    );
  }

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
            <span className="text-sm">Back</span>
          </button>
          <button onClick={clearCart} className="text-xs text-destructive font-medium hover:underline">
            Clear All
          </button>
        </div>

        <h1 className="font-display text-2xl font-bold text-foreground mb-6">
          Your Cart <span className="text-muted-foreground font-normal text-base">({items.length} {items.length === 1 ? "product" : "products"})</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-1 divide-y divide-border border border-border rounded-2xl overflow-hidden">
            {items.map(({ product, quantity }) => {
              const unitPrice = parsePrice(product.price);
              const lineTotal = unitPrice * quantity;
              return (
                <div key={product.id} className="flex gap-4 p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 cursor-pointer"
                    onClick={() => router.push(`/products/${product.id}`)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground mb-1">{product.supplier}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{product.price}</span>
                      <span>×</span>
                      <span>{quantity}</span>
                      <span className="text-foreground font-semibold">= ₦{lineTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 bg-secondary rounded-lg px-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Minus strokeWidth={1} className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-semibold w-5 text-center">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus strokeWidth={1} className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 strokeWidth={1} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Order Summary</h3>

              {/* Per-product breakdown */}
              <div className="space-y-2">
                {items.map(({ product, quantity }) => {
                  const lineTotal = parsePrice(product.price) * quantity;
                  return (
                    <div key={product.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground truncate max-w-40">
                        {product.name} <span className="text-xs">×{quantity}</span>
                      </span>
                      <span className="text-foreground font-medium shrink-0 ml-2">₦{lineTotal.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₦{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="text-primary font-medium">Free</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
                  <span>Total</span>
                  <span>₦{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <Button
                className="w-full rounded-xl font-semibold gap-2"
                onClick={() => router.push("/checkout")}
              >
                Proceed to Checkout • ₦{totalPrice.toLocaleString()}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
