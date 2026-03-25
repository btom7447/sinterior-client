"use client";

import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle strokeWidth={1} className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Order Placed Successfully!</h1>
          <p className="text-sm text-muted-foreground">Your order <span className="font-semibold text-foreground">{orderNumber}</span> has been placed.</p>
          <p className="text-sm text-muted-foreground">The seller will contact you to confirm delivery details.</p>
        </div>

        <div className="bg-secondary/50 rounded-xl p-4 w-full max-w-sm space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="text-primary font-semibold">Processing</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment</span>
            <span className="text-foreground font-medium">Pay on Delivery</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Delivery</span>
            <span className="text-foreground font-medium">2-5 Business Days</span>
          </div>
        </div>

        <div className="flex gap-3 w-full max-w-sm">
          <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={() => router.push("/products")}>
            <ShoppingBag strokeWidth={1} className="w-4 h-4" /> Continue Shopping
          </Button>
          <Button className="flex-1 rounded-xl gap-2" onClick={() => router.push("/home")}>
            <Home strokeWidth={1} className="w-4 h-4" /> Home
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
