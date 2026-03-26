"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Home, Package, Wrench, Building2,
  User, LayoutDashboard, LogOut, MessageCircle, Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import CartIconButton from "@/components/ui/CartIconButton";
import { toast } from "sonner";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/artisan", label: "Artisan", icon: Wrench },
  { href: "/real-estate", label: "Real Estate", icon: Building2 },
];

const MobileHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, profile, signOut } = useAuth();
  const { totalUnread } = useChat();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const close = () => setMenuOpen(false);

  const handleSignOut = async () => {
    close();
    try {
      await signOut();
      toast.success("Signed out");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-border lg:hidden">
        <div className="flex items-center justify-between h-14 px-5">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-base">S</span>
            </div>
            <span className="font-display font-bold text-lg text-foreground">Sinterior</span>
          </Link>

          <div className="flex items-center gap-0.5">
            <Link href="/chat" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle strokeWidth={1} className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </Link>
            <CartIconButton />
            <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <Bell strokeWidth={1} className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Menu strokeWidth={1} className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col lg:hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between h-14 px-5 border-b border-border shrink-0">
            <Link href="/" onClick={close} className="flex items-center gap-1.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-base">S</span>
              </div>
              <span className="font-display font-bold text-lg text-foreground">Sinterior</span>
            </Link>
            <button
              onClick={close}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <X strokeWidth={1} className="w-5 h-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base transition-colors ${
                    active
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground font-medium hover:bg-secondary"
                  }`}
                >
                  <link.icon strokeWidth={active ? 2 : 1} className="w-5 h-5 shrink-0" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth footer */}
          <div className="px-5 py-6 border-t border-border shrink-0">
            {isAuthenticated ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-4 py-3 mb-1">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {profile?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile?.email || ""}</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/profile"
                  onClick={close}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <User strokeWidth={1} className="w-5 h-5 shrink-0 text-muted-foreground" />
                  Profile
                </Link>
                <Link
                  href="/dashboard"
                  onClick={close}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <LayoutDashboard strokeWidth={1} className="w-5 h-5 shrink-0 text-muted-foreground" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-base font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
                >
                  <LogOut strokeWidth={1} className="w-5 h-5 shrink-0" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/login" onClick={close}>
                  <Button variant="outline" className="w-full rounded-xl hover:text-primary hover:border-primary">Log in</Button>
                </Link>
                <Link href="/signup" onClick={close}>
                  <Button className="w-full rounded-xl bg-primary hover:bg-primary/90">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileHeader;
