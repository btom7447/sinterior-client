"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/apiClient";
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  status: string;
  author: { fullName: string };
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
  excerpt: "",
  body: "",
  coverImage: "",
  tags: "",
  status: "draft",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, totalPages: 1, totalResults: 0 });
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPosts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiGet<{ data: { posts: BlogPost[] }; pagination: Pagination }>(`/admin/blog?page=${page}&limit=20`);
      setPosts(res.data.posts);
      setPagination(res.pagination);
    } catch {
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowEditor(true);
  };

  const openEdit = async (post: BlogPost) => {
    try {
      const res = await apiGet<{ data: { post: typeof emptyForm & { tags: string[] } } }>(`/admin/blog/${post._id}`);
      const p = res.data.post;
      setForm({
        title: p.title || "",
        slug: p.slug || "",
        excerpt: p.excerpt || "",
        body: p.body || "",
        coverImage: p.coverImage || "",
        tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
        status: p.status || "draft",
      });
      setEditingId(post._id);
      setShowEditor(true);
    } catch {
      toast.error("Failed to load post");
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || generateSlug(form.title),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };
      if (editingId) {
        await apiPatch(`/admin/blog/${editingId}`, payload);
        toast.success("Post updated");
      } else {
        await apiPost("/admin/blog", payload);
        toast.success("Post created");
      }
      setShowEditor(false);
      fetchPosts(pagination.page);
    } catch {
      toast.error("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await apiDelete(`/admin/blog/${id}`);
      toast.success("Post deleted");
      fetchPosts(pagination.page);
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Blog CMS</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage blog posts</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Post list */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
            No blog posts yet
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              {post.coverImage && (
                <img src={post.coverImage} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{post.title}</p>
                <p className="text-sm text-muted-foreground truncate">{post.excerpt}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <span className={`text-xs font-medium capitalize ${post.status === "published" ? "text-green-500" : "text-yellow-500"}`}>
                    {post.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(post)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button onClick={() => handleDelete(post._id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{pagination.totalResults} posts total</p>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchPosts(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</span>
            <button onClick={() => fetchPosts(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages} className="p-2 rounded-lg hover:bg-secondary disabled:opacity-40">
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
                {editingId ? "Edit Post" : "New Post"}
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
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Post title"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="url-slug"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cover Image URL</label>
                <input
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Excerpt</label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Short summary..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Body (Markdown)</label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-background text-sm resize-none h-48 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Write your post content in Markdown..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Tags</label>
                  <input
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="interior, tips, design"
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
            </div>

            <div className="shrink-0 p-6 border-t border-border">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : editingId ? "Update Post" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
