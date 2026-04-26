"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricStrip, type Metric } from "@/components/admin/MetricStrip";
import { toast } from "sonner";

interface ProductRow {
  _id: string;
  name: string;
  price: number;
  category: string;
  seller: { fullName: string };
  isActive: boolean;
  createdAt: string;
  imageUrls: string[];
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

interface ProductPageStats {
  total: number;
  inStock: number;
  outOfStock: number;
  hidden: number;
  lowStock: number;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalPages: 1, totalResults: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProductPageStats | null>(null);

  useEffect(() => {
    apiGet<{ data: { stats: ProductPageStats } }>("/admin/page-stats?page=products")
      .then((r) => setStats(r.data.stats))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await apiGet<{ data: { products: ProductRow[] }; pagination: Pagination }>(`/admin/products?${params}`);
      setProducts(res.data.products);
      setPagination(res.pagination);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggleVisibility = async (productId: string, isActive: boolean) => {
    try {
      await apiPatch(`/admin/products/${productId}`, { isActive: !isActive });
      toast.success(isActive ? "Product hidden" : "Product visible");
      fetchProducts(pagination.page);
    } catch {
      toast.error("Action failed");
    }
  };

  const metrics: Metric[] | null = stats
    ? [
        { label: "Total", value: stats.total.toLocaleString("en-NG") },
        { label: "In Stock", value: stats.inStock.toLocaleString("en-NG"), tone: "success" },
        { label: "Low Stock", value: stats.lowStock.toLocaleString("en-NG"), tone: stats.lowStock > 0 ? "warning" : "default" },
        { label: "Out of Stock", value: stats.outOfStock.toLocaleString("en-NG"), tone: stats.outOfStock > 0 ? "danger" : "default" },
        { label: "Hidden", value: stats.hidden.toLocaleString("en-NG") },
      ]
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Product Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View and moderate all platform products</p>
      </div>

      <MetricStrip metrics={metrics} loading={!stats} columns={5} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchProducts()}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Seller</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Category</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Active</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="p-4 hidden md:table-cell"><Skeleton className="h-4 w-28" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4 hidden lg:table-cell"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-4" /></td>
                    <td className="p-4 text-right"><Skeleton className="h-6 w-6 ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No products found</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 font-medium text-foreground">{p.name}</td>
                    <td className="p-4 hidden md:table-cell text-muted-foreground">{p.seller?.fullName || "—"}</td>
                    <td className="p-4">{"\u20A6"}{p.price?.toLocaleString()}</td>
                    <td className="p-4 hidden lg:table-cell text-muted-foreground capitalize">{p.category || "—"}</td>
                    <td className="p-4">
                      {p.isActive !== false ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.open(`/products/${p._id}`, "_blank")}>
                            View Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleVisibility(p._id, p.isActive !== false)}>
                            {p.isActive !== false ? "Hide Product" : "Show Product"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">{pagination.totalResults} products total</p>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchProducts(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
              <button onClick={() => fetchProducts(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
