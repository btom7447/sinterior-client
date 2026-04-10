"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Search, X, Bell, LogOut, MessageCircle, ChevronRight,
  User, LayoutDashboard, Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useNotifications } from "@/hooks/useNotifications";
import CartIconButton from "@/components/ui/CartIconButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { apiGet } from "@/lib/apiClient";
import { type ApiProduct, formatNaira, getPrimaryImage } from "@/types/api";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, profile, signOut } = useAuth();
  const { totalUnread } = useChat();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/artisan", label: "Artisan" },
    { href: "/real-estate", label: "Real Estate" },
  ];

  const isActive = (href: string) =>
    pathname === href || (pathname.startsWith(href + "/") && href !== "/");

  const handleSignOut = async () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    try {
      await signOut();
      toast.success("Signed out");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  // Search results from API
  const [searchResults, setSearchResults] = useState<ApiProduct[]>([]);
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await apiGet<{ data: ApiProduct[] }>(
          `/products?search=${encodeURIComponent(searchQuery.trim())}&limit=6`
        );
        setSearchResults(data.data || []);
      } catch {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Sintherior" width={48} height={48} className="rounded-xl" />
              <span className="font-display font-bold text-xl text-foreground">Sintherior</span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={isActive(link.href) ? "nav-link-active" : "nav-link"}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop right side */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Search */}
              <button
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => { setSearchOpen((v) => !v); setNotifOpen(false); setProfileOpen(false); }}
              >
                <Search strokeWidth={1} className="w-5 h-5" />
              </button>

              {/* Chat */}
              <Link href="/dashboard/chat" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle strokeWidth={1} className="w-5 h-5" />
                {totalUnread > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <CartIconButton />

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => { setNotifOpen((v) => !v); setSearchOpen(false); setProfileOpen(false); }}
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

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); setSearchOpen(false); }}
                    className="rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {profile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile?.email || ""}</p>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        <Link href="/dashboard/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors">
                          <User strokeWidth={1} className="w-4 h-4 text-muted-foreground" /> Profile
                        </Link>
                        <Link href="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors">
                          <LayoutDashboard strokeWidth={1} className="w-4 h-4 text-muted-foreground" /> Dashboard
                        </Link>
                      </div>
                      <div className="p-1.5 border-t border-border">
                        <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
                          <LogOut strokeWidth={1} className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="rounded-xl hover:bg-primary/90 hover:text-white">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="rounded-xl bg-primary hover:bg-primary/90">Get Started</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile right side */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => { setSearchOpen((v) => !v); setMobileMenuOpen(false); }}
              >
                <Search strokeWidth={1} className="w-5 h-5" />
              </button>

              {isAuthenticated && <CartIconButton />}

              <div ref={mobileMenuRef}>
                <button
                  className="p-2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => { setMobileMenuOpen((v) => !v); setSearchOpen(false); }}
                >
                  {mobileMenuOpen ? <X strokeWidth={1} className="w-5 h-5" /> : <Menu strokeWidth={1} className="w-5 h-5" />}
                </button>

                {mobileMenuOpen && (
                  <div className="absolute left-0 right-0 top-full bg-card border-b border-border shadow-xl z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                      {/* Nav links */}
                      <div className="flex flex-col gap-1 mb-4">
                        {navLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                              isActive(link.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
                            }`}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>

                      {isAuthenticated ? (
                        <>
                          <div className="border-t border-border pt-3 mb-3">
                            <div className="flex items-center gap-3 px-4 py-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">{profile?.full_name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors">
                                <LayoutDashboard strokeWidth={1} className="w-4 h-4 text-muted-foreground" /> Dashboard
                              </Link>
                              <Link href="/dashboard/chat" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors">
                                <MessageCircle strokeWidth={1} className="w-4 h-4 text-muted-foreground" /> Messages
                                {totalUnread > 0 && <span className="ml-auto w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">{totalUnread}</span>}
                              </Link>
                              <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors">
                                <User strokeWidth={1} className="w-4 h-4 text-muted-foreground" /> Profile
                              </Link>
                            </div>
                          </div>
                          <div className="border-t border-border pt-3">
                            <button onClick={handleSignOut} className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
                              <LogOut strokeWidth={1} className="w-4 h-4" /> Sign out
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="border-t border-border pt-3 flex gap-3">
                          <Link href="/login" className="flex-1">
                            <Button variant="outline" className="w-full rounded-xl">Log in</Button>
                          </Link>
                          <Link href="/signup" className="flex-1">
                            <Button className="w-full rounded-xl bg-primary hover:bg-primary/90">Get Started</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full-width search panel below navbar */}
        {searchOpen && (
          <div className="border-t border-border bg-card/95 backdrop-blur-lg px-4 sm:px-6 lg:px-8 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="relative">
                <Search strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, artisans, suppliers..."
                  className="w-full pl-12 pr-12 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X strokeWidth={1} className="w-4 h-4" />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                  {searchResults.map((product) => (
                    <Link
                      key={product._id}
                      href={`/products/${product._id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                    >
                      <img src={getPrimaryImage(product.images)} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.supplierId?.fullName || "Unknown"} · {formatNaira(product.price)}</p>
                      </div>
                      <ChevronRight strokeWidth={1} className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                  <Link
                    href={`/products?q=${encodeURIComponent(searchQuery)}`}
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-primary font-semibold hover:bg-secondary/50 transition-colors"
                  >
                    See all results for &ldquo;{searchQuery}&rdquo; <ChevronRight strokeWidth={1} className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {searchQuery.trim().length > 1 && searchResults.length === 0 && (
                <div className="mt-2 px-4 py-3 text-sm text-muted-foreground">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
