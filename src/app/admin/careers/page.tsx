"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface CareerListing {
  _id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

const emptyForm = {
  title: "",
  department: "",
  location: "",
  type: "full-time",
  description: "",
  requirements: "",
  status: "open",
};

export default function AdminCareersPage() {
  const [listings, setListings] = useState<CareerListing[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalPages: 1, totalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchListings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { careers: CareerListing[] }; pagination: Pagination }>(`/admin/careers?page=${page}&limit=20`);
      setListings(res.data.careers);
      setPagination(res.pagination);
    } catch {
      toast.error("Failed to load career listings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowEditor(true);
  };

  const openEdit = async (listing: CareerListing) => {
    try {
      const res = await apiGet<{ data: { career: typeof emptyForm } }>(`/admin/careers/${listing._id}`);
      const c = res.data.career;
      setForm({
        title: c.title || "",
        department: c.department || "",
        location: c.location || "",
        type: c.type || "full-time",
        description: c.description || "",
        requirements: c.requirements || "",
        status: c.status || "open",
      });
      setEditingId(listing._id);
      setShowEditor(true);
    } catch {
      toast.error("Failed to load listing");
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      if (editingId) {
        await apiPatch(`/admin/careers/${editingId}`, form);
        toast.success("Listing updated");
      } else {
        await apiPost("/admin/careers", form);
        toast.success("Listing created");
      }
      setShowEditor(false);
      fetchListings(pagination.page);
    } catch {
      toast.error("Failed to save listing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this career listing?")) return;
    try {
      await apiDelete(`/admin/careers/${id}`);
      toast.success("Listing deleted");
      fetchListings(pagination.page);
    } catch {
      toast.error("Failed to delete listing");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Careers CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage job listings</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Listing
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
            No career listings yet
          </div>
        ) : (
          listings.map((listing) => (
            <div key={listing._id} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{listing.title}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span>{listing.department}</span>
                  <span>&middot;</span>
                  <span>{listing.location}</span>
                  <span>&middot;</span>
                  <span className="capitalize">{listing.type?.replace(/-/g, " ")}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(listing.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className={`text-xs font-medium capitalize ${listing.status === "open" ? "text-green-500" : "text-red-500"}`}>
                    {listing.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(listing)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(listing._id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{pagination.totalResults} listings total</p>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchListings(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
            <button onClick={() => fetchListings(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowEditor(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-foreground">
                {editingId ? "Edit Listing" : "New Listing"}
              </h3>
              <button onClick={() => setShowEditor(false)} className="text-muted-foreground hover:text-foreground">
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Job title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Department</label>
                  <input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Engineering, Design..."
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Lagos, Remote..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Job description..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Requirements (one per line)..."
                />
              </div>
            </div>

            <div className="shrink-0 p-6 border-t border-border">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update Listing" : "Create Listing"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
