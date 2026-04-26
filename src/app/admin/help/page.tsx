"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface HelpArticle {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  emoji?: string;
  excerpt?: string;
  status: string;
  order?: number;
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
  slug: "",
  category: "",
  emoji: "",
  excerpt: "",
  body: "",
  order: 0,
  status: "draft",
};

const CATEGORIES = [
  "Getting Started",
  "For Clients",
  "For Artisans",
  "For Suppliers",
  "Payments & Billing",
  "Account & Security",
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminHelpPage() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalPages: 1, totalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchArticles = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { articles: HelpArticle[] }; pagination: Pagination }>(
        `/admin/help?page=${page}&limit=20`
      );
      setArticles(res.data.articles);
      setPagination(res.pagination);
    } catch {
      toast.error("Failed to load help articles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchArticles(); }, [fetchArticles]);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowEditor(true);
  };

  const openEdit = async (a: HelpArticle) => {
    try {
      const res = await apiGet<{ data: { article: typeof emptyForm } }>(`/admin/help/${a._id}`);
      const x = res.data.article;
      setForm({
        title: x.title || "",
        slug: x.slug || "",
        category: x.category || "",
        emoji: x.emoji || "",
        excerpt: x.excerpt || "",
        body: x.body || "",
        order: x.order ?? 0,
        status: x.status || "draft",
      });
      setEditingId(a._id);
      setShowEditor(true);
    } catch {
      toast.error("Failed to load article");
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || slugify(form.title) };
      if (editingId) {
        await apiPatch(`/admin/help/${editingId}`, payload);
        toast.success("Article updated");
      } else {
        await apiPost("/admin/help", payload);
        toast.success("Article created");
      }
      setShowEditor(false);
      fetchArticles(pagination.page);
    } catch {
      toast.error("Failed to save article");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    try {
      await apiDelete(`/admin/help/${id}`);
      toast.success("Deleted");
      fetchArticles(pagination.page);
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Help Center CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage help articles and FAQs</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="flex gap-2 shrink-0">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))
        ) : articles.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
            No help articles yet
          </div>
        ) : (
          articles.map((a) => (
            <div key={a._id} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-xl">
                {a.emoji || "📘"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{a.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  {a.category && (
                    <span className="text-xs text-muted-foreground">{a.category}</span>
                  )}
                  <span className={`text-xs font-medium capitalize ${a.status === "published" ? "text-green-500" : "text-yellow-500"}`}>
                    {a.status}
                  </span>
                  <span className="text-xs text-muted-foreground">/{a.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(a._id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{pagination.totalResults} articles total</p>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchArticles(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
            <button onClick={() => fetchArticles(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      {showEditor && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowEditor(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="shrink-0 p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-foreground">
                {editingId ? "Edit Article" : "New Article"}
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
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="How to ..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                    placeholder="url-slug"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value || "0", 10) })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                  >
                    <option value="">— select —</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Emoji</label>
                  <input
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    maxLength={4}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                    placeholder="🚀"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Short summary..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Body (Markdown)</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-48 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Write the article content..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="shrink-0 p-6 border-t border-border">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update Article" : "Create Article"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
