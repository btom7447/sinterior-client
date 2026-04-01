"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Search, SlidersHorizontal, X, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CategorySidebar from "@/components/products/CategorySidebar";
import CategoryProductGrid from "@/components/products/CategoryProductGrid";
import { apiGet } from "@/lib/apiClient";
import { type ApiProduct, type Pagination } from "@/types/api";

const searchSuggestions = [
  "Cement", "Steel & Iron", "Tiles & Flooring", "Paints", "Aggregates",
  "Electrical", "Plumbing", "Wood & Timber", "Roofing",
  "Lightings & Electrical", "Panels", "Wallpaper", "Doors", "Walls",
  "Roofing & Ceiling", "Smart Home", "Furniture",
  "LED Lights", "Chandeliers", "Switches & Sockets",
  "Wall Panels", "Ceiling Panels",
  "Ceramic", "Porcelain", "Granite", "Marble",
];

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("For you");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 40, total: 0, pages: 0 });
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "40" });

      // Use category filter if not "For you" and not searching
      if (selectedCategory !== "For you" && selectedCategory !== "Featured" && selectedCategory !== "Deals" && !debouncedSearch) {
        params.set("category", selectedCategory);
      }

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const data = await apiGet<{ data: ApiProduct[]; pagination: Pagination }>(
        `/products?${params}`
      );
      setProducts(data.data || []);
      setPagination(data.pagination);
    } catch {
      // silent — show empty
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleLike = (id: string) => {
    setLikedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const suggestions = searchQuery.trim()
    ? searchSuggestions.filter((t) => t.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSuggestionClick = (term: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <Package strokeWidth={1} className="w-4 h-4" />
            <span className="text-sm font-semibold">Marketplace</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Browse <span className="gradient-text">Products</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Quality construction materials and home products from verified suppliers.
          </p>
        </div>

        {/* Search + mobile filter */}
        <div className="flex gap-3 mb-6">
          <div ref={searchRef} className="relative flex-1 max-w-2xl">
            <Search strokeWidth={1} className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search products or suppliers..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              className="pl-12 pr-10 py-6 rounded-xl bg-card border-border text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X strokeWidth={1} className="w-4 h-4" />
              </button>
            )}

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden">
                {suggestions.map((term, i) => {
                  const q = searchQuery.toLowerCase();
                  const idx = term.toLowerCase().indexOf(q);
                  const before = term.slice(0, idx);
                  const match = term.slice(idx, idx + searchQuery.length);
                  const after = term.slice(idx + searchQuery.length);
                  return (
                    <button
                      key={`${term}-${i}`}
                      onClick={() => handleSuggestionClick(term)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-secondary/60 transition-colors"
                    >
                      <Search strokeWidth={1} className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        {before}
                        <span className="font-semibold text-primary">{match}</span>
                        {after}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden rounded-xl px-4 gap-2 py-6">
                <SlidersHorizontal strokeWidth={1} className="w-4 h-4" />
                Categories
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 overflow-y-auto">
              <SheetHeader className="px-5 pt-5 pb-3">
                <SheetTitle className="flex items-center gap-2 text-sm">
                  <SlidersHorizontal strokeWidth={1} className="w-4 h-4" />
                  Categories
                </SheetTitle>
              </SheetHeader>
              <CategorySidebar
                selected={selectedCategory}
                onSelect={(cat) => {
                  setSelectedCategory(cat);
                  setMobileSidebarOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24 bg-card border border-border rounded-2xl overflow-hidden" style={{ maxHeight: "calc(100vh - 7rem)" }}>
              <CategorySidebar
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="px-3 sm:px-4 py-4">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="card-interactive overflow-hidden">
                      <Skeleton className="w-full aspect-[4/3]" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
                </div>
                <p className="text-sm font-medium text-foreground">No products found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {debouncedSearch ? "Try a different search term" : "No products available in this category"}
                </p>
              </div>
            ) : (
              <CategoryProductGrid
                products={products}
                selectedCategory={debouncedSearch ? "For you" : selectedCategory}
                likedItems={likedItems}
                onToggleLike={toggleLike}
              />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
