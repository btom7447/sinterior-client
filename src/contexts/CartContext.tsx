"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
// Minimal shape the cart needs — both Product and ProductCardItem satisfy this
export interface CartProduct {
  id: number | string;
  name: string;
  price: string;
  image: string;
  inStock?: boolean;
  /** Available stock from the API — used to cap cart quantity */
  availableStock?: number;
  badge?: string | null;
  unit?: string;
  supplier?: string;
  /** MongoDB _id for API products — used at checkout */
  _id?: string;
  /** Supplier profile _id — used for shipping calculation */
  supplierId?: string;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: CartProduct, quantity?: number) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const parsePrice = (price: string) => Number(price.replace(/[₦,]/g, "")) || 0;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount (client only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cart-items");
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch {
          setItems([]);
        }
      }
    }
  }, []);

  const addToCart = (product: CartProduct, quantity = 1) => {
    setItems((prev) => {
      const stock = product.availableStock;
      const existing = prev.find((i) => String(i.product.id) === String(product.id));
      if (existing) {
        return prev.map((i) => {
          if (String(i.product.id) !== String(product.id)) return i;
          const desired = i.quantity + quantity;
          const capped = stock != null ? Math.min(desired, stock) : desired;
          return { ...i, product: { ...i.product, availableStock: stock }, quantity: capped };
        });
      }
      const capped = stock != null ? Math.min(quantity, stock) : quantity;
      return [...prev, { product, quantity: capped }];
    });
  };

  const removeFromCart = (productId: number | string) =>
    setItems((prev) => prev.filter((i) => String(i.product.id) !== String(productId)));

  const updateQuantity = (productId: number | string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (String(i.product.id) !== String(productId)) return i;
        const stock = i.product.availableStock;
        const capped = stock != null ? Math.min(quantity, stock) : quantity;
        return { ...i, quantity: capped };
      }),
    );
  };

  const clearCart = () => setItems([]);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + parsePrice(i.product.price) * i.quantity,
    0,
  );

  // Persist cart to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart-items", JSON.stringify(items));
    }
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
