"use client";

import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import NotificationBell from "@/components/dashboard/NotificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiPost } from "@/lib/apiClient";
import { toast } from "sonner";
import { useEffect, useState } from "react";

function getPageTitle(pathname: string) {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.includes("profile")) return "Profile";
  if (pathname.includes("settings")) return "Settings";
  if (pathname.includes("subscription")) return "Subscription";
  if (pathname.includes("jobs")) return "My Jobs";
  if (pathname.includes("orders")) return "Orders";
  if (pathname.includes("earnings")) return "Earnings";
  if (pathname.includes("products")) return "My Products";
  if (pathname.includes("projects")) return "My Projects";
  if (pathname.includes("properties")) return "Properties";
  if (pathname.includes("saved")) return "Saved Artisans";
  if (pathname.includes("reviews")) return "Reviews";
  if (pathname.includes("inventory")) return "Inventory";
  if (pathname.includes("appointments")) return "Appointments";
  if (pathname.includes("chat")) return "Chat";
  return "Dashboard";
}

function EmailVerificationGate({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await apiPost("/auth/send-verification");
      setSent(true);
      toast.success("Verification email sent!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send verification email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-warning" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Verify Your Email</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            To continue using Sintherior, please verify your email address. We sent a verification link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>
        <div className="space-y-3">
          {sent ? (
            <p className="text-sm text-success font-medium">
              Email sent! Check your inbox and click the verification link.
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {sending ? "Sending..." : "Resend Verification Email"}
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            I've verified — Refresh
          </button>
          <button
            onClick={onSignOut}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Gate: block unverified users from accessing the dashboard
  if (user && !user.isEmailVerified) {
    return (
      <EmailVerificationGate
        email={user.email}
        onSignOut={async () => {
          await signOut();
          router.push("/");
        }}
      />
    );
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <SidebarProvider>
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 z-30 bg-card border-b border-border h-14 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-muted-foreground" />
            <h2 className="font-display text-lg font-bold text-foreground hidden sm:block">
              {getPageTitle(pathname)}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <NotificationBell />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      {profile?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
