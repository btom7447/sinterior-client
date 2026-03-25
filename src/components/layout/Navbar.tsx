"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Search, X, Bell, LogOut, MessageCircle, ShoppingCart,
  ChevronRight, User, LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { useCart } from "@/contexts/CartContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { products } from "@/data/products";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, profile, signOut } = useAuth();
  const { totalUnread } = useChat();
  const { items: cartItems } = useCart();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/artisan", label: "Artisan" },
    { href: "/real-estate", label: "Real Estate" },
  ];

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    setProfileOpen(false);
    try {
      await signOut();
      toast.success("Signed out");
      router.push("/");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  // Search results
  const searchResults = searchQuery.trim().length > 1
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Close search on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close notif on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const mockNotifications = [
    { id: 1, title: "Order Confirmed", message: "Your order #ORD-28471 has been confirmed.", time: "2m ago", read: false },
    { id: 2, title: "New Artisan Match", message: "An electrician near you is available.", time: "1h ago", read: false },
    { id: 3, title: "Price Drop", message: "Cement bags you saved dropped to ₦5,200.", time: "3h ago", read: true },
  ];
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <>
      <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">S</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">Sinterior</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={isActive(link.href) ? "nav-link-active" : "nav-link"}>
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {/* Search */}
              <button
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                onClick={() => { setSearchOpen((v) => !v); setNotifOpen(false); setProfileOpen(false); }}
              >
                <Search strokeWidth={1} className="w-5 h-5" />
              </button>

              {/* Chat */}
              <Link href="/chat" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle strokeWidth={1} className="w-5 h-5" />
                {totalUnread > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
                <ShoppingCart strokeWidth={1} className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartItems.length > 9 ? "9+" : cartItems.length}
                  </span>
                )}
              </Link>

              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  className="relative p-2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => { setNotifOpen((v) => !v); setSearchOpen(false); setProfileOpen(false); }}
                >
                  <Bell strokeWidth={1} className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                      <button className="text-xs text-primary hover:underline">Mark all read</button>
                    </div>
                    <div className="divide-y divide-border max-h-72 overflow-y-auto">
                      {mockNotifications.map((n) => (
                        <div key={n.id} className={`px-4 py-3 flex gap-3 cursor-pointer hover:bg-secondary/50 transition-colors ${!n.read ? "bg-primary/5" : ""}`}>
                          <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? "bg-primary" : "bg-transparent"}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{n.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
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
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">{profile?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile?.email || ""}</p>
                      </div>

                      {/* Menu items */}
                      <div className="p-1.5 space-y-0.5">
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          <User strokeWidth={1} className="w-4 h-4 text-muted-foreground" />
                          Profile
                        </Link>
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          <LayoutDashboard strokeWidth={1} className="w-4 h-4 text-muted-foreground" />
                          Dashboard
                        </Link>
                      </div>

                      {/* Logout */}
                      <div className="p-1.5 border-t border-border">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut strokeWidth={1} className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login"><Button variant="outline" className="rounded-xl hover:text-primary hover:border-primary">Log in</Button></Link>
                  <Link href="/signup"><Button className="rounded-xl bg-primary hover:bg-primary/90">Get Started</Button></Link>
                </>
              )}
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
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X strokeWidth={1} className="w-4 h-4" />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-2 rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors"
                    >
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.supplier} · {product.price}</p>
                      </div>
                      <ChevronRight strokeWidth={1} className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                  <Link href={`/products?q=${encodeURIComponent(searchQuery)}`} onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="flex items-center justify-center gap-2 px-4 py-3 text-sm text-primary font-semibold hover:bg-secondary/50 transition-colors">
                    See all results for "{searchQuery}" <ChevronRight strokeWidth={1} className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {searchQuery.trim().length > 1 && searchResults.length === 0 && (
                <div className="mt-2 px-4 py-3 text-sm text-muted-foreground">No results found for "{searchQuery}"</div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
