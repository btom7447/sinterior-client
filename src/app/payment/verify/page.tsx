"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { apiGet } from "@/lib/apiClient";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-lg font-bold text-foreground">Verifying payment...</h2>
        </div>
      </AppLayout>
    }>
      <PaymentVerifyContent />
    </Suspense>
  );
}

function PaymentVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference");
  const isJobPayment = reference?.startsWith("job_") ?? false;
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      return;
    }
    apiGet<{ data: { status: string } }>(`/payments/verify?reference=${reference}`)
      .then((res) => {
        setStatus(res.data.status === "success" ? "success" : "failed");
      })
      .catch(() => setStatus("failed"));
  }, [reference]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h2 className="text-lg font-bold text-foreground">Verifying payment...</h2>
            <p className="text-sm text-muted-foreground mt-2">Please wait while we confirm your transaction.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Payment Successful</h2>
            <p className="text-sm text-muted-foreground mt-2">
              {isJobPayment
                ? "Payment is held securely in escrow. Once both parties confirm the work is done, it will be released to the artisan."
                : "Your payment has been confirmed."}
            </p>
            <Button
              onClick={() => router.push(isJobPayment ? "/dashboard/jobs" : "/dashboard/orders")}
              className="mt-6 rounded-xl"
            >
              {isJobPayment ? "View Jobs" : "View Orders"}
            </Button>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Payment Failed</h2>
            <p className="text-sm text-muted-foreground mt-2">We could not verify your payment. Please try again or contact support.</p>
            <Button
              onClick={() => router.push(isJobPayment ? "/dashboard/jobs" : "/dashboard")}
              variant="outline"
              className="mt-6 rounded-xl"
            >
              {isJobPayment ? "Back to Jobs" : "Back to Dashboard"}
            </Button>
          </>
        )}
      </div>
    </AppLayout>
  );
}
