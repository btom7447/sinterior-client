"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu, X, Home, Package, Wrench, Building2,
  User, LayoutDashboard, LogOut, MessageCircle, Bell, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useNotifications } from "@/hooks/useNotifications";
import CartIconButton from "@/components/ui/CartIconButton";
import { toast } from "sonner";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/artisan", label: "Artisan", icon: Wrench },
  { href: "/real-estate", label: "Real Estate", icon: Building2 },
];

const formatTimeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const MobileHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, profile, signOut } = useAuth();
  const { totalUnread } = useChat();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const close = () => setMenuOpen(false);

  // Close notification dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
            <Image src="/logo.png" alt="Sintherior" width={40} height={40} className="rounded-lg" />
            <span className="font-display font-bold text-lg text-foreground">Sintherior</span>
          </Link>

          <div className="flex items-center gap-0.5">
            <Link href="/dashboard/chat" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle strokeWidth={1} className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </Link>
            <CartIconButton />
            <div className="relative" ref={notifRef}>
              <button
                className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => setNotifOpen((v) => !v)}
              >
                <Bell strokeWidth={1} className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={() => markAllAsRead()} className="text-xs text-primary hover:underline">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-border max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell strokeWidth={1} className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n) => (
                        <div
                          key={n._id}
                          onClick={() => { if (!n.isRead) markAsRead(n._id); }}
                          className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-secondary/50 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.isRead ? "bg-primary" : "bg-transparent"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{n.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{formatTimeAgo(n.createdAt)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link href="/dashboard" onClick={() => setNotifOpen(false)}>
                    <div className="px-4 py-3 text-center text-xs text-primary font-semibold border-t border-border hover:bg-secondary/50 transition-colors flex items-center justify-center gap-1">
                      View all notifications <ChevronRight strokeWidth={1} className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </div>
              )}
            </div>
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
              <Image src="/logo.png" alt="Sintherior" width={40} height={40} className="rounded-lg" />
              <span className="font-display font-bold text-lg text-foreground">Sintherior</span>
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
