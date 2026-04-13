"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiGet, apiPost, apiPatch, apiDelete, apiUpload } from "@/lib/apiClient";
import { resolveAssetUrl } from "@/types/api";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  ToggleLeft,
  ToggleRight,
  ImagePlus,
  Loader2,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { PRODUCT_CATEGORIES, getSubcategories, formatNaira } from "@/lib/constants";

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  unit: string;
  quantity: number;
  images: string[];
  inStock: boolean;
  isActive: boolean;
  specs?: Record<string, string | string[]>;
  lowStockThreshold?: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const LOW_STOCK_DEFAULT = 20;

const EMPTY_FORM = {
  name: "",
  description: "",
  category: "",
  subcategory: "",
  price: "",
  unit: "piece",
  quantity: "1",
  lowStockThreshold: String(LOW_STOCK_DEFAULT),
};

export default function DashboardProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // Image upload state
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Specs state — each row has a key and array of values (tags)
  const specIdRef = useRef(0);
  const [specs, setSpecs] = useState<{ id: number; key: string; values: string[] }[]>([]);

  const fetchProducts = useCallback(async (page = 1, query = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (query) params.set("search", query);
      const data = await apiGet<{ data: Product[]; pagination: Pagination }>(
        `/products?${params}`
      );
      setProducts(data.data || []);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => fetchProducts(1, search);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageUrls([]);
    setSpecs([]);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description || "",
      category: p.category,
      subcategory: p.subcategory || "",
      price: String(p.price),
      unit: p.unit || "piece",
      quantity: String(p.quantity ?? 1),
      lowStockThreshold: String(p.lowStockThreshold ?? LOW_STOCK_DEFAULT),
    });
    setImageUrls(p.images || []);
    setSpecs(
      p.specs
        ? Object.entries(p.specs).map(([key, val]) => ({
            id: ++specIdRef.current,
            key,
            values: Array.isArray(val) ? val : typeof val === "string" ? val.split(",").map((v) => v.trim()).filter(Boolean) : [String(val)],
          }))
        : []
    );
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remaining = 6 - imageUrls.length;
    if (remaining <= 0) {
      toast.error("Maximum 6 images per product");
      return;
    }
    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.error(`Only ${remaining} more image(s) allowed`);
    }

    setUploading(true);
    try {
      const formData = new FormData();
      toUpload.forEach((file) => formData.append("images", file));
      const res = await apiUpload<{ data: { urls: string[] } }>("/products/upload-images", formData);
      setImageUrls((prev) => [...prev, ...res.data.urls]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload images");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpec = () => {
    setSpecs((prev) => [...prev, { id: ++specIdRef.current, key: "", values: [] }]);
  };

  const updateSpecKey = (index: number, key: string) => {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, key } : s)));
  };

  const addSpecValue = (index: number, value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSpecs((prev) =>
      prev.map((s, i) =>
        i === index && !s.values.includes(trimmed)
          ? { ...s, values: [...s.values, trimmed] }
          : s
      )
    );
  };

  const removeSpecValue = (specIndex: number, valueIndex: number) => {
    setSpecs((prev) =>
      prev.map((s, i) =>
        i === specIndex ? { ...s, values: s.values.filter((_, vi) => vi !== valueIndex) } : s
      )
    );
  };

  const removeSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const qty = Math.max(0, parseInt(form.quantity, 10) || 0);
      const threshold = Math.max(0, parseInt(form.lowStockThreshold, 10) || LOW_STOCK_DEFAULT);

      // Build specs object — { key: [values] }
      const specsObj: Record<string, string[]> = {};
      specs.forEach((s) => {
        if (s.key.trim() && s.values.length > 0) specsObj[s.key.trim()] = s.values;
      });

      const body = {
        ...form,
        price: Number(form.price),
        quantity: qty,
        inStock: qty > 0,
        images: imageUrls,
        specs: specsObj,
        lowStockThreshold: threshold,
      };

      if (editingId) {
        await apiPatch(`/products/${editingId}`, body);
        toast.success("Product updated");
      } else {
        await apiPost("/products", body);
        toast.success("Product created");
      }
      setShowForm(false);
      fetchProducts(pagination.page, search);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/products/${id}`);
      toast.success("Product removed");
      fetchProducts(pagination.page, search);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const toggleStock = async (p: Product) => {
    try {
      await apiPatch(`/products/${p._id}`, { inStock: !p.inStock });
      fetchProducts(pagination.page, search);
    } catch {
      toast.error("Failed to update stock");
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><Skeleton className="h-8 w-32" /><Skeleton className="h-4 w-48 mt-2" /></div><Skeleton className="h-10 w-32 rounded-xl" /></div>
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card-elevated p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/4" /></div>
              <div className="text-right space-y-2"><Skeleton className="h-4 w-16 ml-auto" /><Skeleton className="h-3 w-12 ml-auto" /></div>
              <div className="flex gap-1"><Skeleton className="w-7 h-7 rounded-lg" /><Skeleton className="w-7 h-7 rounded-lg" /><Skeleton className="w-7 h-7 rounded-lg" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your product listings</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1} />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button onClick={handleSearch} className="px-4 py-2 rounded-xl bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors">
          Search
        </button>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-foreground">No products yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first product to start selling</p>
          <button onClick={openCreate} className="text-xs text-primary hover:underline mt-3">Add a product</button>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((p) => {
            const isLowStock = p.quantity > 0 && p.quantity <= (p.lowStockThreshold ?? LOW_STOCK_DEFAULT);
            return (
              <div key={p._id} className="card-elevated p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {p.images?.[0] ? (
                    <img src={resolveAssetUrl(p.images[0])} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-muted-foreground" strokeWidth={1} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category} &middot; {p.unit}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">{formatNaira(p.price)}</p>
                  <span className={`text-[10px] font-medium flex items-center gap-1 justify-end ${
                    p.quantity <= 0 ? "text-destructive" : isLowStock ? "text-warning" : "text-success"
                  }`}>
                    {isLowStock && <AlertTriangle className="w-3 h-3" />}
                    {p.quantity > 0 ? `${p.quantity} in stock` : "Out of Stock"}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 rounded-lg hover:bg-secondary transition-colors shrink-0">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => toggleStock(p)} className="gap-2">
                      {p.inStock ? <ToggleRight className="w-4 h-4 text-success" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                      {p.inStock ? "Mark Out of Stock" : "Mark In Stock"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openEdit(p)} className="gap-2">
                      <Pencil className="w-4 h-4" strokeWidth={1} />
                      Edit Product
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(p._id)} className="gap-2 text-destructive focus:text-destructive">
                      <Trash2 className="w-4 h-4" strokeWidth={1} />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchProducts(pagination.page - 1, search)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchProducts(pagination.page + 1, search)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <h3 className="font-display font-bold text-foreground">{editingId ? "Edit Product" : "New Product"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Images */}
              <div>
                <label className="text-sm font-medium text-foreground">Product Images</label>
                <p className="text-xs text-muted-foreground mb-2">Up to 6 images. JPEG, PNG or WebP.</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                      <img src={resolveAssetUrl(url)} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {imageUrls.length < 6 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {uploading ? (
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <ImagePlus className="w-5 h-5 text-muted-foreground" strokeWidth={1} />
                          <span className="text-[10px] text-muted-foreground">Add</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Name *</label>
                <input required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Category *</label>
                <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="">Select a category</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {getSubcategories(form.category).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-foreground">Subcategory</label>
                  <select value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select a subcategory</option>
                    {getSubcategories(form.category).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Price (₦) *</label>
                  <input required type="number" min={0} step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  {form.price && <p className="text-xs text-muted-foreground mt-1">{formatNaira(Number(form.price))}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Quantity *</label>
                  <input required type="number" min={0} step="1" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Unit</label>
                  <input maxLength={30} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="piece" className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Low Stock Alert Threshold</label>
                <input type="number" min={0} value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                <p className="text-xs text-muted-foreground mt-1">You'll be notified when stock falls below this number</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea maxLength={2000} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>

              {/* Specs — each spec has a key and multiple values (tags) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-foreground">Specifications</label>
                  <button type="button" onClick={addSpec} className="text-xs text-primary hover:underline">+ Add spec</button>
                </div>
                {specs.length === 0 && (
                  <p className="text-xs text-muted-foreground">Add specs like colour, weight, material, etc. Each spec can have multiple values.</p>
                )}
                <div className="space-y-3">
                  {specs.map((spec, i) => (
                    <div key={spec.id} className="rounded-lg border border-border p-2.5 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          placeholder="e.g. Colour, Material, Size"
                          value={spec.key}
                          onChange={(e) => updateSpecKey(i, e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button type="button" onClick={() => removeSpec(i)} className="p-1 text-destructive hover:bg-destructive/10 rounded-lg shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {/* Value tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {spec.values.map((val, vi) => (
                          <span key={vi} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                            {val}
                            <button type="button" onClick={() => removeSpecValue(i, vi)} className="hover:text-destructive">
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                        <input
                          placeholder={spec.values.length === 0 ? "Type a value and press Enter" : "Add more..."}
                          className="flex-1 min-w-24 px-2 py-0.5 bg-transparent text-xs focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              const input = e.currentTarget;
                              addSpecValue(i, input.value);
                              input.value = "";
                            }
                          }}
                          onBlur={(e) => {
                            if (e.target.value.trim()) {
                              addSpecValue(i, e.target.value);
                              e.target.value = "";
                            }
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            <div className="shrink-0 p-4 border-t border-border">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Saving..." : editingId ? "Update Product" : "Create Product"}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
