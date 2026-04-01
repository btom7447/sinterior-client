"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  Maximize2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Property {
  _id: string;
  title: string;
  description: string;
  type: "sale" | "rent";
  propertyType: "apartment" | "house" | "land" | "commercial";
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  sizeUnit: string;
  location: string;
  city: string;
  state: string;
  images: string[];
  features: string[];
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PropertyForm {
  title: string;
  description: string;
  type: Property["type"];
  propertyType: Property["propertyType"];
  price: string;
  bedrooms: string;
  bathrooms: string;
  size: string;
  sizeUnit: string;
  location: string;
  city: string;
  state: string;
}

const EMPTY_FORM: PropertyForm = {
  title: "",
  description: "",
  type: "sale",
  propertyType: "apartment",
  price: "",
  bedrooms: "",
  bathrooms: "",
  size: "",
  sizeUnit: "sqm",
  location: "",
  city: "",
  state: "",
};

export default function DashboardProperties() {
  const { profile } = useAuth();
  const isSupplier = profile?.role === "supplier";

  const [properties, setProperties] = useState<Property[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchProperties = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (filter !== "all") params.set("type", filter);
      const data = await apiGet<{ data: Property[]; pagination: Pagination }>(
        `/properties?${params}`
      );
      setProperties(data.data || []);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (p: Property) => {
    setEditingId(p._id);
    setForm({
      title: p.title,
      description: p.description || "",
      type: p.type,
      propertyType: p.propertyType,
      price: String(p.price),
      bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
      bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
      size: p.size != null ? String(p.size) : "",
      sizeUnit: p.sizeUnit || "sqm",
      location: p.location || "",
      city: p.city || "",
      state: p.state || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        ...form,
        price: Number(form.price),
        bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
        size: form.size ? Number(form.size) : undefined,
      };
      if (editingId) {
        await apiPatch(`/properties/${editingId}`, body);
        toast.success("Property updated");
      } else {
        await apiPost("/properties", body);
        toast.success("Property listed");
      }
      setShowForm(false);
      fetchProperties(pagination.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save property");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/properties/${id}`);
      toast.success("Property removed");
      fetchProperties(pagination.page);
    } catch {
      toast.error("Failed to delete property");
    }
  };

  const formatCurrency = (n: number) => `₦${n.toLocaleString("en-NG")}`;

  if (loading && properties.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between"><div><Skeleton className="h-8 w-36" /><Skeleton className="h-4 w-52 mt-2" /></div><Skeleton className="h-10 w-32 rounded-xl" /></div>
        <div className="flex gap-2"><Skeleton className="h-8 w-14 rounded-lg" /><Skeleton className="h-8 w-20 rounded-lg" /><Skeleton className="h-8 w-20 rounded-lg" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-elevated overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-6 w-28" /><div className="flex gap-3"><Skeleton className="h-3 w-12" /><Skeleton className="h-3 w-12" /><Skeleton className="h-3 w-16" /></div></div>
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
          <h1 className="font-display text-2xl font-bold text-foreground">Properties</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSupplier ? "Manage your property listings" : "Browse available properties"}
          </p>
        </div>
        {isSupplier && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> List Property
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "sale", "rent"].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "all" ? "All" : t === "sale" ? "For Sale" : "For Rent"}
          </button>
        ))}
      </div>

      {/* Property Cards */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-foreground">{filter !== "all" ? `No properties ${filter === "sale" ? "for sale" : "for rent"}` : "No properties listed"}</p>
          <p className="text-xs text-muted-foreground mt-1">{isSupplier ? "List your first property to get started" : "Check back later for new listings"}</p>
          {isSupplier && <button onClick={openCreate} className="text-xs text-primary hover:underline mt-3">List a property</button>}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {properties.map((p) => (
            <div key={p._id} className="card-elevated overflow-hidden">
              <div className="h-40 bg-secondary flex items-center justify-center">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-muted-foreground/40" strokeWidth={1} />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{p.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.city}{p.state ? `, ${p.state}` : ""}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    p.type === "sale" ? "bg-primary/10 text-primary" : "bg-success/10 text-success"
                  }`}>
                    {p.type === "sale" ? "Sale" : "Rent"}
                  </span>
                </div>
                <p className="text-lg font-bold text-foreground mt-2">{formatCurrency(p.price)}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {p.bedrooms != null && (
                    <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" strokeWidth={1} />{p.bedrooms}</span>
                  )}
                  {p.bathrooms != null && (
                    <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" strokeWidth={1} />{p.bathrooms}</span>
                  )}
                  {p.size != null && (
                    <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" strokeWidth={1} />{p.size} {p.sizeUnit}</span>
                  )}
                  <span className="capitalize">{p.propertyType}</span>
                </div>
                {isSupplier && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium bg-secondary hover:bg-secondary/80 transition-colors">
                      <Pencil className="w-3 h-3" strokeWidth={1} /> Edit
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                      <Trash2 className="w-3 h-3" strokeWidth={1} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => fetchProperties(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span>
          <button onClick={() => fetchProperties(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">{editingId ? "Edit Property" : "List Property"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-secondary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title *</label>
                <input required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Type *</label>
                  <select required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "sale" | "rent" })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Property Type *</label>
                  <select required value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value as Property["propertyType"] })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="land">Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Price *</label>
                <input required type="number" min={0} step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Beds</label>
                  <input type="number" min={0} value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Baths</label>
                  <input type="number" min={0} value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Size (sqm)</label>
                  <input type="number" min={0} value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">City</label>
                  <input maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">State</label>
                  <input maxLength={80} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Location</label>
                <input maxLength={200} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Street address" className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea maxLength={3000} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                {submitting ? "Saving..." : editingId ? "Update Property" : "List Property"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
