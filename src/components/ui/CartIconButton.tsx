"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

/**
 * Shared cart icon with badge.
 * Badge count = number of distinct products in cart (not total quantity),
 * matching the same logic on desktop and mobile.
 */
export default function CartIconButton() {
  const { items } = useCart();
  const count = items.length;

  return (
    <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
      <ShoppingCart strokeWidth={1} className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
