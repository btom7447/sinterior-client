"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { Package, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  inStock: boolean;
  images: string[];
}

interface Pagination { page: number; limit: number; total: number; pages: number; }

export default function DashboardInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await apiGet<{ data: Product[]; pagination: Pagination }>(`/products?page=${page}&limit=20`);
      setProducts(data.data || []);
      setPagination(data.pagination);
    } catch { toast.error("Failed to load inventory"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleStock = async (p: Product) => {
    try {
      await apiPatch(`/products/${p._id}`, { inStock: !p.inStock });
      toast.success(`${p.name} marked as ${p.inStock ? "out of stock" : "in stock"}`);
      fetchProducts(pagination.page);
    } catch { toast.error("Failed to update"); }
  };

  const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;
  const filtered = filter === "all" ? products : filter === "in_stock" ? products.filter((p) => p.inStock) : products.filter((p) => !p.inStock);
  const outOfStock = products.filter((p) => !p.inStock).length;

  if (loading && !products.length) return (
    <div className="space-y-6">
      <div><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-52 mt-2" /></div>
      <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="card-elevated p-4 text-center space-y-2"><Skeleton className="h-8 w-12 mx-auto" /><Skeleton className="h-3 w-20 mx-auto" /></div>)}</div>
      <div className="flex gap-2"><Skeleton className="h-8 w-14 rounded-lg" /><Skeleton className="h-8 w-20 rounded-lg" /><Skeleton className="h-8 w-24 rounded-lg" /></div>
      <div className="space-y-1">
        <div className="flex py-3 px-2 gap-4"><Skeleton className="h-4 w-32" /><Skeleton className="h-4 w-20 hidden sm:block" /><Skeleton className="h-4 w-16 ml-auto" /><Skeleton className="h-4 w-16" /><Skeleton className="h-6 w-16 rounded-lg" /></div>
        {[...Array(5)].map((_, i) => <div key={i} className="flex py-3 px-2 gap-4"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-16 hidden sm:block" /><Skeleton className="h-4 w-16 ml-auto" /><Skeleton className="h-4 w-14" /><Skeleton className="h-6 w-16 rounded-lg" /></div>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Inventory</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor stock levels for your products</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-elevated p-4 text-center">
          <p className="font-display text-2xl font-bold text-foreground">{pagination.total}</p>
          <p className="text-xs text-muted-foreground">Total Products</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="font-display text-2xl font-bold text-success">{pagination.total - outOfStock}</p>
          <p className="text-xs text-muted-foreground">In Stock</p>
        </div>
        <div className="card-elevated p-4 text-center">
          <p className="font-display text-2xl font-bold text-destructive">{outOfStock}</p>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </div>
      </div>

      <div className="flex gap-2">
        {["all", "in_stock", "out_of_stock"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {s === "all" ? "All" : s === "in_stock" ? "In Stock" : "Out of Stock"}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-foreground">No products in inventory</p>
          <p className="text-xs text-muted-foreground mt-1">Add products from the Products page to track stock</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-muted-foreground font-medium">Product</th>
                <th className="text-left py-3 px-2 text-muted-foreground font-medium hidden sm:table-cell">Category</th>
                <th className="text-right py-3 px-2 text-muted-foreground font-medium">Price</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Status</th>
                <th className="text-center py-3 px-2 text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 px-2 font-medium text-foreground">{p.name}</td>
                  <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">{p.category}</td>
                  <td className="py-3 px-2 text-right font-semibold text-foreground">{fmt(p.price)}</td>
                  <td className="py-3 px-2 text-center">
                    {p.inStock ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 className="w-3 h-3" /> In Stock</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-destructive"><AlertTriangle className="w-3 h-3" /> Out</span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <button onClick={() => toggleStock(p)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 transition-colors">
                      {p.inStock ? "Mark Out" : "Restock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchProducts(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchProducts(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}
