"use client";
import { useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { setToken } from "@/lib/apiClient";

const queryClient = new QueryClient();

// Pages that should never trigger the unauthorized redirect
const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

/**
 * Listens for the `auth:unauthorized` event dispatched by apiClient when every
 * token refresh attempt fails. Clears in-memory state and sends the user to
 * the login page, preserving the current URL so they return after signing in.
 */
function AuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleUnauthorized = () => {
      // Don't redirect if already on an auth page
      if (AUTH_PATHS.some((p) => pathname.startsWith(p))) return;

      setToken(null);
      const returnTo = encodeURIComponent(pathname);
      router.push(`/login?session=expired&next=${returnTo}`);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [router, pathname]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <AuthGuard />
          <Toaster />
          {children}
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
