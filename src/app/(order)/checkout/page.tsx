"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, MapPin, Phone, User, CreditCard, Truck } from "lucide-react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", note: "" });

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  const handleOrder = () => {
    if (!form.name || !form.phone || !form.address || !form.city) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      clearCart();
      router.push("/order-confirmation");
    }, 1500);
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
              <Input placeholder="City / State *" className="rounded-xl" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
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
                  <input type="radio" name="payment" defaultChecked={method === "Pay on Delivery"} className="accent-primary" />
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
                <div key={product.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate flex-1">{product.name} × {quantity}</span>
                  <span className="font-medium text-foreground ml-2">{product.price}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span>₦{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-border px-4 py-4">
          <Button className="w-full rounded-xl font-semibold" disabled={loading} onClick={handleOrder}>
            {loading ? "Placing Order..." : `Place Order • ₦${totalPrice.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
