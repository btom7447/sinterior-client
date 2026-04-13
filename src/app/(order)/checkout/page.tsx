"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { apiPost, apiGet } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NIGERIAN_STATES, formatNaira } from "@/lib/constants";
import { ArrowLeft, MapPin, Phone, User, CreditCard, Truck, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    note: "",
  });
  const [profileSynced, setProfileSynced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("Pay on Delivery");

  // Shipping state
  const [shippingCost, setShippingCost] = useState(0);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingBreakdown, setShippingBreakdown] = useState<{ supplier: string; cost: number }[]>([]);

  // Auto-fill from profile once it loads (still editable)
  useEffect(() => {
    if (profile && !profileSynced) {
      setForm((prev) => ({
        name: prev.name || profile.full_name || "",
        phone: prev.phone || profile.phone || "",
        address: prev.address,
        city: prev.city || profile.city || "",
        state: prev.state || profile.state || "",
        note: prev.note,
      }));
      setProfileSynced(true);
    }
  }, [profile, profileSynced]);

  // Get unique supplier IDs from cart items
  const supplierIds = [...new Set(items.map((i) => i.product.supplierId).filter(Boolean))] as string[];

  // Fetch shipping rates when state changes
  const fetchShipping = useCallback(async (selectedState: string) => {
    if (!selectedState || supplierIds.length === 0) {
      setShippingCost(0);
      setShippingBreakdown([]);
      return;
    }

    setLoadingShipping(true);
    try {
      // Fetch shipping rates for each unique supplier
      const results = await Promise.all(
        supplierIds.map(async (sid) => {
          try {
            const res = await apiGet<{ data: { shippingRates: Record<string, number> } }>(
              `/suppliers/${sid}/shipping`
            );
            const rate = res.data.shippingRates?.[selectedState];
            return { supplierId: sid, cost: typeof rate === "number" ? rate : 0 };
          } catch {
            return { supplierId: sid, cost: 0 };
          }
        })
      );

      // Build breakdown (one entry per supplier)
      const breakdown = results.map((r) => {
        const supplierItems = items.filter((i) => i.product.supplierId === r.supplierId);
        const supplierName = supplierItems[0]?.product.name?.split(" ")[0] || "Seller";
        return { supplier: supplierName, cost: r.cost };
      });

      setShippingBreakdown(breakdown);
      setShippingCost(results.reduce((sum, r) => sum + r.cost, 0));
    } catch {
      setShippingCost(0);
      setShippingBreakdown([]);
    } finally {
      setLoadingShipping(false);
    }
  }, [items, supplierIds.join(",")]);

  useEffect(() => {
    if (form.state) {
      fetchShipping(form.state);
    }
  }, [form.state, fetchShipping]);

  // Auth guard — must be logged in to checkout
  if (!authLoading && !isAuthenticated) {
    router.push("/login?next=%2Fcheckout");
    return null;
  }

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  if (user && !user.isEmailVerified) {
    router.push("/verify-email");
    return null;
  }

  const grandTotal = totalPrice + shippingCost;

  const handleOrder = async () => {
    if (!form.name || !form.phone || !form.address || !form.state) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map(({ product, quantity }) => ({
        productId: product._id || String(product.id),
        quantity,
      }));

      // Re-validate stock before placing order
      const stockRes = await apiPost<{ data: { results: { productId: string; available: boolean; availableQuantity?: number; reason?: string }[] } }>(
        "/products/check-stock",
        { items: orderItems }
      );
      const stockIssues = stockRes.data.results.filter((r) => !r.available);
      if (stockIssues.length > 0) {
        const names = stockIssues.map((s) => {
          const item = items.find((i) => (i.product._id || String(i.product.id)) === s.productId);
          return item?.product.name || "Unknown product";
        });
        toast.error(`Stock issue: ${names.join(", ")} — ${stockIssues[0].reason}. Please update your cart.`);
        setLoading(false);
        return;
      }

      await apiPost("/orders", {
        items: orderItems,
        deliveryAddress: `${form.address}, ${form.city}`,
        deliveryState: form.state,
        city: form.city,
        contactName: form.name,
        contactPhone: form.phone,
        note: form.note || undefined,
        paymentMethod,
        shippingCost,
      });

      clearCart();
      toast.success("Order placed successfully!");
      router.push("/order-confirmation");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <ArrowLeft strokeWidth={1} className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold flex-1">Checkout</h1>
        </div>

        <div className="px-4 pt-4 space-y-6">
          {/* Delivery Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Truck strokeWidth={1} className="w-4 h-4 text-primary" /> Delivery Information
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <User strokeWidth={1} className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Full Name *" className="pl-10 rounded-xl" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="relative">
                <Phone strokeWidth={1} className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Phone Number *" className="pl-10 rounded-xl" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="relative">
                <MapPin strokeWidth={1} className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Delivery Address *" className="pl-10 rounded-xl" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Input placeholder="City / LGA" className="rounded-xl" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <div>
                <select
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select delivery state *</option>
                  {NIGERIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Input placeholder="Order note (optional)" className="rounded-xl" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <CreditCard strokeWidth={1} className="w-4 h-4 text-primary" /> Payment Method
            </h3>
            <div className="space-y-2">
              {["Pay on Delivery", "Bank Transfer", "Card Payment"].map((method) => (
                <label key={method} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground">Order Summary</h3>
            <div className="space-y-2 bg-secondary/50 rounded-xl p-3">
              {items.map(({ product, quantity }) => (
                <div key={String(product.id)} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate flex-1">{product.name} × {quantity}</span>
                  <span className="font-medium text-foreground ml-2">{product.price}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">{formatNaira(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" strokeWidth={1} />
                    Shipping
                    {loadingShipping && <Loader2 className="w-3 h-3 animate-spin" />}
                  </span>
                  <span className="font-medium text-foreground">
                    {!form.state
                      ? "Select state"
                      : loadingShipping
                      ? "..."
                      : shippingCost === 0
                      ? "Free"
                      : formatNaira(shippingCost)}
                  </span>
                </div>
                {shippingBreakdown.length > 1 && !loadingShipping && shippingCost > 0 && (
                  <div className="pl-5 space-y-0.5">
                    {shippingBreakdown.map((b, i) => (
                      <div key={i} className="flex justify-between text-xs text-muted-foreground">
                        <span>{b.supplier}</span>
                        <span>{b.cost === 0 ? "Free" : formatNaira(b.cost)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span>{formatNaira(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-border px-4 py-4">
          <Button className="w-full rounded-xl font-semibold" disabled={loading || loadingShipping} onClick={handleOrder}>
            {loading ? "Placing Order..." : `Place Order • ${formatNaira(grandTotal)}`}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
