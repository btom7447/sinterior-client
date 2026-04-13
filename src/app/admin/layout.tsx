"use client";

import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

function getPageTitle(pathname: string) {
  if (pathname === "/admin") return "Overview";
  if (pathname.includes("users")) return "User Management";
  if (pathname.includes("orders")) return "Orders";
  if (pathname.includes("products")) return "Products";
  if (pathname.includes("verification")) return "Seller Verification";
  if (pathname.includes("disputes")) return "Disputes";
  if (pathname.includes("blog")) return "Blog CMS";
  if (pathname.includes("careers")) return "Careers CMS";
  if (pathname.includes("chat")) return "Admin Chat";
  if (pathname.includes("analytics")) return "Analytics";
  if (pathname.includes("settings")) return "Platform Settings";
  return "Admin";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 z-30 bg-card border-b border-border h-14 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground hidden sm:block">
                {getPageTitle(pathname)}
              </h2>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto min-h-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
