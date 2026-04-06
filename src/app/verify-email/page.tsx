"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import { apiGet, apiPost } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const verified = searchParams.get("verified");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "expired">(
    verified === "true" ? "success" : token ? "verifying" : "idle"
  );
  const [resending, setResending] = useState(false);

  // If arriving with a token, verify it via backend
  useEffect(() => {
    if (!token) return;
    apiGet(`/auth/verify-email/${token}`)
      .then(() => {
        setStatus("success");
        refreshProfile();
      })
      .catch(() => setStatus("expired"));
  }, [token, refreshProfile]);

  // If redirected with ?verified=true, refresh profile
  useEffect(() => {
    if (verified === "true") {
      refreshProfile();
    }
  }, [verified, refreshProfile]);

  const handleResend = async () => {
    setResending(true);
    try {
      await apiPost("/auth/send-verification");
      toast.success("Verification email sent! Check your inbox.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        {status === "verifying" && (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <h2 className="text-lg font-bold text-foreground">Verifying your email...</h2>
            <p className="text-sm text-muted-foreground mt-2">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Email Verified</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Your email has been verified. You now have full access to Sintherior.
            </p>
            <Button onClick={() => router.push("/dashboard")} className="mt-6 rounded-xl">
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "expired" && (
          <>
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Link Expired</h2>
            <p className="text-sm text-muted-foreground mt-2">
              This verification link is invalid or has expired.
            </p>
            {user && (
              <Button onClick={handleResend} disabled={resending} variant="outline" className="mt-6 rounded-xl">
                {resending ? "Sending..." : "Resend Verification Email"}
              </Button>
            )}
          </>
        )}

        {status === "idle" && (
          <>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Verify Your Email</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              {user
                ? `We sent a verification link to ${user.email}. Check your inbox and click the link to verify your account.`
                : "Please check your email for a verification link."}
            </p>
            {user && (
              <Button onClick={handleResend} disabled={resending} className="mt-6 rounded-xl">
                {resending ? "Sending..." : "Resend Verification Email"}
              </Button>
            )}
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </AppLayout>
  );
}
